
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback, useRef } from 'react';
import { Project, Task, ProjectStatus, Staff, RolePermissions, UserRole, ClaimMilestone, AutomationSettings, Notification } from '../types';
import { cloudService } from './googleSheetsService';

interface ProjectContextType {
  projects: Project[];
  tasks: Task[];
  staff: Staff[];
  notifications: Notification[];
  unreadNotificationCount: number;
  permissions: Record<UserRole, RolePermissions>;
  automationSettings: AutomationSettings;
  updateAutomationSettings: (settings: AutomationSettings) => Promise<void>;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentUser: Staff | null;
  isAuthenticated: boolean;
  isSyncing: boolean;
  refreshData: () => Promise<void>;
  login: (emailOrUser: string, password?: string) => Promise<void>;
  logout: () => void;
  currentUserRole: UserRole;
  currentUserName: string;
  setCurrentUserRole: (role: UserRole) => void;
  addProject: (project: Project) => Promise<void>;
  updateProject: (updatedProject: Project) => Promise<void>;
  updateProjectStatus: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (updatedTask: Task) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
  addStaff: (member: Staff) => Promise<void>;
  updateStaff: (updatedStaff: Staff) => Promise<void>;
  updatePermissions: (role: UserRole, perms: RolePermissions) => void;
  updateProjectClaims: (projectId: string, milestones: ClaimMilestone[]) => Promise<void>;
  toggleMilestoneClaim: (projectId: string, milestoneId: string) => Promise<void>;
  reorderProjectClaims: (projectId: string, milestones: ClaimMilestone[]) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const SUPER_ADMIN_ID = 'sa-01';
const SUPER_ADMIN_OBJ: Staff = {
  id: SUPER_ADMIN_ID, 
  name: 'Super Admin', 
  email: 'superadmin', 
  role: 'System Administrator',
  role_type: 'Admin', 
  password: 'EDT', 
  active_tasks: 0, 
  weekly_capacity: 99.0,
  gender: 'Other'
};

const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  Admin: { dashboard: true, sales: true, ongoing: true, team: true, roles: true, archive: true, viewFinancials: true },
  Management: { dashboard: true, sales: true, ongoing: true, team: true, roles: false, archive: true, viewFinancials: true },
  Staff: { dashboard: true, sales: false, ongoing: true, team: false, roles: false, archive: false, viewFinancials: false },
};

const DEFAULT_AUTOMATION: AutomationSettings = {
  emailOnAssignment: true,
  dailyDueReminders: true,
  reminderHour: 10,
  salesThresholds: {
    hotToWarm: 3,
    warmToCold: 7,
    coldStagnant: 14
  }
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projectsState, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Staff[]>([SUPER_ADMIN_OBJ]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [claimsState, setClaims] = useState<ClaimMilestone[]>([]);
  const [permissions, setPermissions] = useState<Record<UserRole, RolePermissions>>(DEFAULT_PERMISSIONS);
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>(DEFAULT_AUTOMATION);
  const [darkMode, setDarkMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [seenTaskIds, setSeenTaskIds] = useState<Set<string>>(new Set());
  
  const isInitialLoad = useRef(true);
  const currentTasksRef = useRef<Task[]>([]);

  useEffect(() => {
    currentTasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (currentUser) {
      const notifKey = `notifications_${currentUser.id}`;
      const seenKey = `seen_tasks_${currentUser.id}`;
      
      const storedNotifs = localStorage.getItem(notifKey);
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      else setNotifications([]);

      const storedSeen = localStorage.getItem(seenKey);
      if (storedSeen) setSeenTaskIds(new Set(JSON.parse(storedSeen)));
      else setSeenTaskIds(new Set());
    } else {
      setNotifications([]);
      setSeenTaskIds(new Set());
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(notifications));
      localStorage.setItem(`seen_tasks_${currentUser.id}`, JSON.stringify(Array.from(seenTaskIds)));
    }
  }, [notifications, seenTaskIds, currentUser?.id]);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => {
      if (!currentUser) return [];
      const isDuplicate = prev.some(n => 
        n.relatedId === notif.relatedId && 
        n.type === notif.type && 
        n.message === notif.message &&
        (new Date().getTime() - new Date(n.timestamp).getTime()) < 15000 
      );
      if (isDuplicate) return prev;
      return [newNotif, ...prev].slice(0, 50);
    });
  }, [currentUser?.id]);

  const checkSalesStagnation = useCallback(async (projectsList: Project[], tasksList: Task[]) => {
    const today = new Date();
    const thresholds = automationSettings.salesThresholds;
    const projectsToUpdate: Project[] = [];

    projectsList.forEach(project => {
      // Only check Sales Pipeline
      if (!['Cold', 'Warm', 'Hot'].includes(project.status)) return;

      // Check if already checked today to prevent loops
      const lastCheck = project.last_automated_check ? new Date(project.last_automated_check) : null;
      if (lastCheck && lastCheck.toDateString() === today.toDateString()) return;

      // Find last activity
      const projectTasks = tasksList.filter(t => String(t.project_id) === String(project.id));
      const activityDates: number[] = [new Date(project.kickoff_date || project.start_date).getTime()];
      
      projectTasks.forEach(t => {
        if (t.start_date) activityDates.push(new Date(t.start_date).getTime());
        if (t.completed_at) activityDates.push(new Date(t.completed_at).getTime());
      });

      const lastActivity = Math.max(...activityDates);
      const diffDays = Math.floor((today.getTime() - lastActivity) / (1000 * 60 * 60 * 24));

      let nextStatus: ProjectStatus = project.status;
      let triggerUpdate = false;

      if (project.status === 'Hot' && diffDays >= thresholds.hotToWarm) {
        nextStatus = 'Warm';
        triggerUpdate = true;
      } else if (project.status === 'Warm' && diffDays >= thresholds.warmToCold) {
        nextStatus = 'Cold';
        triggerUpdate = true;
      } else if (project.status === 'Cold' && diffDays >= thresholds.coldStagnant) {
        // Cold stagnant logic: Notice only, no auto-move to Lost unless user wants to
        addNotification({
          type: 'System',
          title: 'Cold Lead Stagnant',
          message: `Lead "${project.project_name}" has been Cold for ${diffDays} days. Consider marking as Lost.`,
          relatedId: project.id
        });
        // We still mark it checked to avoid spamming the notification every refresh
        triggerUpdate = true; 
      }

      if (triggerUpdate) {
        projectsToUpdate.push({ 
          ...project, 
          status: nextStatus, 
          last_automated_check: today.toISOString() 
        });

        if (nextStatus !== project.status) {
          addNotification({
            type: 'System',
            title: 'Pipeline Inactivity',
            message: `Lead "${project.project_name}" downgraded to ${nextStatus} due to ${diffDays} days of no activity.`,
            relatedId: project.id
          });
        }
      }
    });

    if (projectsToUpdate.length > 0) {
      setProjects(prev => prev.map(p => {
        const update = projectsToUpdate.find(u => u.id === p.id);
        return update ? update : p;
      }));
      
      for (const p of projectsToUpdate) {
        await cloudService.syncToCloud('project', 'update', p);
      }
    }
  }, [automationSettings.salesThresholds, addNotification]);

  const refreshData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await cloudService.fetchWorkspaceData();
      if (data.tasks) {
        if (currentUser) {
          const myName = currentUser.name.trim().toLowerCase();
          const prevTasksMap = new Map<string, Task>(currentTasksRef.current.map(t => [String(t.id), t]));
          const nextSeenIds = new Set(seenTaskIds);
          let changedSeen = false;

          data.tasks.forEach((t: Task) => {
            const taskId = String(t.id);
            const oldTask = prevTasksMap.get(taskId);
            const newTaskAssignee = (t.assigned_to || '').trim().toLowerCase();
            
            if (oldTask) {
              const oldTaskAssignee = (oldTask.assigned_to || '').trim().toLowerCase();
              if (oldTaskAssignee !== newTaskAssignee && newTaskAssignee === myName) {
                addNotification({
                  type: 'TaskAssignment',
                  title: 'Task Re-assigned',
                  message: `You've been assigned to: ${t.task_name}`,
                  relatedId: t.id
                });
                nextSeenIds.add(taskId);
                changedSeen = true;
              } else if (oldTaskAssignee === myName && newTaskAssignee !== myName) {
                addNotification({
                  type: 'System',
                  title: 'Task Re-assigned',
                  message: `Your task "${t.task_name}" has been reassign to ${t.assigned_to}`,
                  relatedId: t.id
                });
                nextSeenIds.add(taskId);
                changedSeen = true;
              }
            } else {
              if (newTaskAssignee === myName && !nextSeenIds.has(taskId)) {
                addNotification({
                  type: 'TaskAssignment',
                  title: 'New Task Assigned',
                  message: `You've been assigned to: ${t.task_name}`,
                  relatedId: t.id
                });
                nextSeenIds.add(taskId);
                changedSeen = true;
              }
            }
          });

          if (changedSeen) setSeenTaskIds(nextSeenIds);
        }
        setTasks(data.tasks);
        isInitialLoad.current = false;
      }

      if (data.projects) {
        setProjects(data.projects);
        checkSalesStagnation(data.projects, data.tasks || []);
      }
      
      if (data.staff && data.staff.length > 0) {
        const otherStaff = data.staff.filter((s: Staff) => String(s.id) !== SUPER_ADMIN_ID);
        const list = [SUPER_ADMIN_OBJ, ...otherStaff];
        setStaff(list);
        
        if (currentUser) {
          const updatedSelf = list.find(s => String(s.id) === String(currentUser.id));
          if (updatedSelf) setCurrentUser(updatedSelf);
        }
      }
      
      if (data.claims) setClaims(data.claims);
    } catch (err) {
      console.error("Manual refresh failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser?.id, addNotification, seenTaskIds, checkSalesStagnation]);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refreshData();
      }, 15000); 
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshData]);

  useEffect(() => {
    if (isAuthenticated && currentUser && tasks.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const myName = currentUser.name.trim().toLowerCase();
      const dueToday = tasks.filter(t => 
        (t.assigned_to || '').trim().toLowerCase() === myName && 
        t.due_date === today && 
        t.status !== 'Done'
      );
      
      const notifiedTasks = new Set(notifications
        .filter(n => n.type === 'DueDateReminder' && n.timestamp.startsWith(today))
        .map(n => n.relatedId));

      dueToday.forEach(t => {
        if (!notifiedTasks.has(t.id)) {
          addNotification({
            type: 'DueDateReminder',
            title: 'Task Due Today',
            message: `Priority: ${t.priority} - ${t.task_name} is due today.`,
            relatedId: t.id
          });
        }
      });
    }
  }, [isAuthenticated, currentUser?.id, tasks, notifications, addNotification]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const projects = useMemo(() => {
    return projectsState.map(project => {
      const pTasks = tasks.filter(t => String(t.project_id) === String(project.id));
      const pClaims = claimsState.filter(c => String(c.project_id) === String(project.id));
      
      const totalTasks = pTasks.length;
      let progress = project.progress || 0;
      if (totalTasks > 0) {
        const completed = pTasks.filter(t => t.status === 'Done').length;
        progress = Math.round((completed / totalTasks) * 100);
      }
      if (project.status === 'Completed') progress = 100;

      return { ...project, progress, claims: pClaims };
    });
  }, [projectsState, tasks, claimsState]);

  const login = async (emailOrUser: string, password?: string) => {
    const cleanInput = emailOrUser.trim().toLowerCase();
    
    if (cleanInput === 'superadmin' && password === 'EDT') {
      setCurrentUser(SUPER_ADMIN_OBJ); 
      setIsAuthenticated(true); 
      return;
    }

    let user = staff.find(s => s.email.toLowerCase() === cleanInput);
    
    if (!user && cleanInput.includes('@')) {
      const data = await cloudService.fetchWorkspaceData();
      if (data.staff) {
        const otherStaff = data.staff.filter((s: Staff) => String(s.id) !== SUPER_ADMIN_ID);
        const list = [SUPER_ADMIN_OBJ, ...otherStaff];
        setStaff(list);
        user = list.find(s => s.email.toLowerCase() === cleanInput);
      }
    }

    if (user) {
      if (user.password && user.password !== password) throw new Error('Invalid credentials.');
      setCurrentUser(user); 
      setIsAuthenticated(true);
    } else {
      throw new Error('User not found. Please contact your administrator.');
    }
  };

  const logout = () => { 
    setCurrentUser(null); 
    setIsAuthenticated(false); 
    isInitialLoad.current = true;
    setTasks([]);
    setProjects([]);
    setStaff([SUPER_ADMIN_OBJ]);
    setClaims([]);
    setNotifications([]);
    setSeenTaskIds(new Set());
    currentTasksRef.current = [];
  };

  const updateAutomationSettings = async (settings: AutomationSettings) => {
    setAutomationSettings(settings);
    await cloudService.syncToCloud('settings', 'update', { key: 'automation', value: settings });
  };

  const addProject = async (project: Project) => {
    setProjects(prev => [...prev, project]);
    await cloudService.syncToCloud('project', 'add', project);
  };

  const updateProject = async (updatedProject: Project) => {
    setProjects(prev => prev.map(p => String(p.id) === String(updatedProject.id) ? updatedProject : p));
    await cloudService.syncToCloud('project', 'update', updatedProject);
  };

  const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
    setProjects(prev => prev.map(p => String(p.id) === String(projectId) ? { ...p, status: newStatus } : p));
    await cloudService.syncToCloud('project', 'update', { id: projectId, status: newStatus });
  };

  const addTask = async (task: Task) => {
    setTasks(prev => [...prev, task]);
    const myName = currentUser?.name.trim().toLowerCase();
    const taskAssignee = (task.assigned_to || '').trim().toLowerCase();
    
    if (myName && taskAssignee === myName) {
      addNotification({
        type: 'TaskAssignment',
        title: 'New Task Assigned',
        message: `You've assigned yourself to: ${task.task_name}`,
        relatedId: task.id
      });
      setSeenTaskIds(prev => new Set(prev).add(String(task.id)));
    }
    await cloudService.syncToCloud('task', 'add', { ...task, _triggerAssignmentEmail: automationSettings.emailOnAssignment });
  };

  const updateTask = async (updatedTask: Task) => {
    const oldTask = tasks.find(t => String(t.id) === String(updatedTask.id));
    const isNewAssignee = oldTask && oldTask.assigned_to !== updatedTask.assigned_to;
    
    setTasks(prev => prev.map(t => String(t.id) === String(updatedTask.id) ? updatedTask : t));
    
    if (currentUser && isNewAssignee) {
      const myName = currentUser.name.trim().toLowerCase();
      const newTaskAssignee = (updatedTask.assigned_to || '').trim().toLowerCase();
      const oldTaskAssignee = (oldTask?.assigned_to || '').trim().toLowerCase();

      if (newTaskAssignee === myName) {
        addNotification({
          type: 'TaskAssignment',
          title: 'Task Re-assigned',
          message: `You've been assigned to: ${updatedTask.task_name}`,
          relatedId: updatedTask.id
        });
        setSeenTaskIds(prev => new Set(prev).add(String(updatedTask.id)));
      }
      else if (oldTaskAssignee === myName) {
        addNotification({
          type: 'System',
          title: 'Task Re-assigned',
          message: `Your task "${updatedTask.task_name}" has been reassign to ${updatedTask.assigned_to}`,
          relatedId: updatedTask.id
        });
        setSeenTaskIds(prev => new Set(prev).add(String(updatedTask.id)));
      }
    }

    await cloudService.syncToCloud('task', 'update', { 
      ...updatedTask, 
      _triggerAssignmentEmail: (automationSettings.emailOnAssignment && isNewAssignee) 
    });
  };

  const toggleTaskStatus = async (taskId: string) => {
    let targetTask: Task | undefined;
    const updated = tasks.map(t => {
      if (String(t.id) === String(taskId)) {
        const isDone = t.status === 'Done';
        targetTask = { 
          ...t, 
          status: (isDone ? 'Pending' : 'Done') as Task['status'],
          completed_at: !isDone ? new Date().toISOString() : undefined 
        };
        return targetTask;
      }
      return t;
    });
    setTasks(updated);
    if (targetTask) {
      await cloudService.syncToCloud('task', 'update', targetTask);
    }
  };

  const addStaff = async (member: Staff) => {
    setStaff(prev => [...prev, member]);
    await cloudService.syncToCloud('staff', 'add', member);
  };

  const updateStaff = async (updatedStaff: Staff) => {
    setStaff(prev => prev.map(s => String(s.id) === String(updatedStaff.id) ? updatedStaff : s));
    if (currentUser && String(updatedStaff.id) === String(currentUser.id)) {
      setCurrentUser(updatedStaff);
    }
    await cloudService.syncToCloud('staff', 'update', updatedStaff);
  };

  const updatePermissions = (role: UserRole, perms: RolePermissions) => {
    if (role === 'Admin') return;
    setPermissions(prev => ({ ...prev, [role]: perms }));
  };

  const updateProjectClaims = async (projectId: string, milestones: ClaimMilestone[]) => {
    setClaims(prev => [...prev.filter(c => String(c.project_id) !== String(projectId)), ...milestones.map(m => ({...m, project_id: String(projectId)}))]);
    for (const m of milestones) {
      await cloudService.syncToCloud('claim', 'add', { ...m, project_id: String(projectId) });
    }
  };

  const toggleMilestoneClaim = async (projectId: string, milestoneId: string) => {
    let updatedMilestone: any = null;
    const newClaims = claimsState.map(m => {
      if (String(m.id) === String(milestoneId)) {
        const newState = !m.isClaimed;
        updatedMilestone = { ...m, isClaimed: newState, claimedDate: newState ? new Date().toISOString().split('T')[0] : '' };
        return updatedMilestone;
      }
      return m;
    });
    setClaims(newClaims);
    if (updatedMilestone) {
      await cloudService.syncToCloud('claim', 'update', updatedMilestone);
    }
  };

  const reorderProjectClaims = async (projectId: string, milestones: ClaimMilestone[]) => {
    setClaims(prev => [...prev.filter(c => String(c.project_id) !== String(projectId)), ...milestones.map(m => ({...m, project_id: String(projectId)}))]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  return (
    <ProjectContext.Provider value={{ 
      projects, tasks, staff, notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead,
      permissions, automationSettings, updateAutomationSettings, darkMode, setDarkMode, isSyncing, refreshData,
      currentUser, isAuthenticated, login, logout,
      currentUserRole: currentUser?.role_type || 'Staff', 
      currentUserName: currentUser?.name || 'Guest', 
      setCurrentUserRole: (r) => currentUser && setCurrentUser({...currentUser, role_type: r}),
      addProject, updateProject, updateProjectStatus, addTask, updateTask, toggleTaskStatus, addStaff, updateStaff, updatePermissions,
      updateProjectClaims, toggleMilestoneClaim, reorderProjectClaims
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
};
