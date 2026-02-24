
export type ProjectStatus = 'Cold' | 'Warm' | 'Hot' | 'Pre Prod' | 'Development' | 'Closure' | 'Completed' | 'Lost';
export type ProjectType = 'Internal' | 'Servicing';
export type UserRole = 'Staff' | 'Management' | 'Admin';
export type TaskPriority = 'High' | 'Med' | 'Low';

export interface AutomationSettings {
  emailOnAssignment: boolean;
  dailyDueReminders: boolean;
  reminderHour: number; // 0-23
  salesThresholds: {
    hotToWarm: number;
    warmToCold: number;
    coldStagnant: number;
  };
}

export type NotificationType = 'TaskAssignment' | 'DueDateReminder' | 'System';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedId?: string; // e.g., projectId or taskId
}

export interface ClaimMilestone {
  id: string;
  project_id: string;
  invoice_no?: string;
  description: string;
  percentage: number;
  amount?: number;
  isClaimed: boolean;
  claimedDate?: string;
  notes?: string;
}

export interface Project {
  id: string;
  project_name: string;
  client_name: string;
  contact_person?: string;
  contact_phone?: string;
  status: ProjectStatus;
  project_type: ProjectType;
  budget: number;
  start_date: string;
  kickoff_date: string;
  delivery_date: string;
  progress: number;
  figma_link?: string;
  gdrive_link?: string;
  has_event?: boolean;
  event_start_date?: string;
  event_end_date?: string;
  tags?: string;
  claims?: ClaimMilestone[];
  last_automated_check?: string; // Track when the last stagnation check ran
}

export interface Task {
  id: string;
  project_id: string;
  task_name: string;
  task_description?: string;
  priority: TaskPriority;
  assigned_to: string;
  status: 'Pending' | 'In Progress' | 'Done';
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  scope_size: number;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  role_type: UserRole;
  password?: string;
  active_tasks: number;
  weekly_capacity: number;
  avatar_seed?: string;
  avatar_url?: string;
  gender?: 'Male' | 'Female' | 'Other';
}

export interface RolePermissions {
  dashboard: boolean;
  sales: boolean;
  ongoing: boolean;
  team: boolean;
  roles: boolean;
  archive: boolean;
  viewFinancials: boolean;
}
