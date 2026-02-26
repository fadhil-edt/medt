
/**
 * GOOGLE APPS SCRIPT BACKEND CODE (Updated for LeanFlow / EDT Dashboard)
 * --------------------------------------------------------------------------
 * 1. Open your Google Sheet.
 * 2. Go to Extensions -> Apps Script.
 * 3. Delete any existing code and paste the block below.
 * 4. Ensure your sheet names are exactly: Projects, Tasks, Staff, ClaimMilesone.
 * 5. Deploy -> New Deployment -> Web App (Execute as: Me, Access: Anyone).
 * --------------------------------------------------------------------------
 */

/* 
const SHEET_NAMES = {
  project: 'Projects',
  task: 'Tasks',
  staff: 'Staff',
  claim: 'ClaimMilesone' // Spelled exactly as in your tab image
};

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'getAll') {
    try {
      var payload = {
        projects: getSheetData(SHEET_NAMES.project),
        tasks: getSheetData(SHEET_NAMES.task),
        staff: getSheetData(SHEET_NAMES.staff),
        claims: getSheetData(SHEET_NAMES.claim)
      };
      return ContentService.createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function doPost(e) {
  var params = JSON.parse(e.postData.contents);
  var type = params.type;
  var action = params.action;
  var data = params.data;
  var sheetName = SHEET_NAMES[type];
  
  if (!sheetName) return ContentService.createTextOutput("Error: Invalid Type").setMimeType(ContentService.MimeType.TEXT);

  try {
    if (action === 'add') {
      appendRow(sheetName, data);
    } else if (action === 'update') {
      updateRow(sheetName, data);
    } else if (action === 'delete') {
      deleteRow(sheetName, data);
    }
    
    // Auto-Email Trigger
    if (type === 'task' && data._triggerAssignmentEmail === true) {
      sendAssignmentEmail(data);
    }
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function getSheetData(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var data = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = values[i][j];
      if (val instanceof Date) {
        val = val.toISOString().split('T')[0];
      }
      obj[headers[j]] = val;
    }
    data.push(obj);
  }
  return data;
}

function appendRow(name, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("Sheet " + name + " not found");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function(h) { return data[h] !== undefined ? data[h] : ""; });
  sheet.appendRow(row);
}

function updateRow(name, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  var vals = sheet.getDataRange().getValues();
  var headers = vals[0];
  var idIdx = headers.indexOf('id');
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][idIdx]) === String(data.id)) {
      var row = headers.map(function(h) { 
        return data[h] !== undefined ? data[h] : vals[i][headers.indexOf(h)]; 
      });
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
      return;
    }
  }
}

function deleteRow(name, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  var vals = sheet.getDataRange().getValues();
  var headers = vals[0];
  var idIdx = headers.indexOf('id');
  for (var i = vals.length - 1; i >= 1; i--) {
    if (String(vals[i][idIdx]) === String(data.id)) {
      sheet.deleteRow(i + 1);
    }
  }
}

function sendAssignmentEmail(task) {
  var staff = getSheetData(SHEET_NAMES.staff);
  var assignee = staff.find(function(s) { return String(s.name).toLowerCase() === String(task.assigned_to).toLowerCase(); });
  if (assignee && assignee.email) {
    MailApp.sendEmail({
      to: assignee.email,
      subject: "[LeanFlow] New Assignment: " + task.task_name,
      body: "Task: " + task.task_name + "\nProject ID: " + task.project_id + "\nDue: " + (task.due_date || 'N/A')
    });
  }
}
*/

import { Project, Task, Staff, ClaimMilestone } from '../types';

// Replace with your current Deployed Web App URL from environment variables
const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL || ''; 

class GoogleSheetsService {
  private static instance: GoogleSheetsService;

  private constructor() {}

  public static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  public generateGCalUrl(title: string, dateStr: string | undefined): string {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent(`Task: ${title} [EDT]`);
    
    let dates = '';
    if (dateStr) {
      const date = new Date(dateStr);
      const formatted = date.toISOString().replace(/-|:|\.\d\d\d/g, '');
      dates = `${formatted}/${formatted}`;
    } else {
      const today = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '');
      dates = `${today}/${today}`;
    }

    return `${base}&text=${text}&dates=${dates}&details=Managed via EDT Workspace Dashboard.`;
  }

  async fetchWorkspaceData(): Promise<{ projects: Project[], tasks: Task[], staff: Staff[], claims: ClaimMilestone[] }> {
    if (!SCRIPT_URL) {
      const local = localStorage.getItem('leanflow_data');
      return local ? JSON.parse(local) : { projects: [], tasks: [], staff: [], claims: [] };
    }

    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAll`);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      // Robust cleaning of all spreadsheet columns into typed objects
      const cleanedProjects = (data.projects || []).map((p: any) => ({
        ...p,
        id: String(p.id),
        budget: Number(p.budget) || 0,
        progress: Number(p.progress) || 0,
        has_event: String(p.has_event).toLowerCase() === 'true',
        kickoff_date: p.kickoff_date || '',
        delivery_date: p.delivery_date || '',
        lead_by: p.lead_by || p.LeadBy || p['Lead By'] || ''
      }));

      const cleanedClaims = (data.claims || []).map((c: any) => ({
        ...c,
        id: String(c.id),
        project_id: String(c.project_id),
        percentage: Number(c.percentage) || 0,
        amount: Number(c.amount) || 0,
        isClaimed: String(c.isClaimed).toLowerCase() === 'true'
      }));

      const cleanedTasks = (data.tasks || []).map((t: any) => ({
        ...t,
        id: String(t.id),
        project_id: String(t.project_id),
        scope_size: Number(t.scope_size) || 1.0,
        priority: t.priority || 'Med'
      }));

      const cleanedStaff = (data.staff || []).map((s: any) => ({
        ...s,
        id: String(s.id || s.Id || s.ID || ''),
        name: s.name || s.Name || '',
        email: s.email || s.Email || '',
        role: s.role || s.Role || '',
        role_type: s.role_type || s.RoleType || s.roleType || s['Role Type'] || 'Staff',
        password: s.password || s.Password || '',
        weekly_capacity: Number(s.weekly_capacity || s.WeeklyCapacity || s['Weekly Capacity']) || 0,
        active_tasks: Number(s.active_tasks || s.ActiveTasks || s['Active Tasks']) || 0
      }));

      const finalData = { 
        projects: cleanedProjects, 
        claims: cleanedClaims, 
        tasks: cleanedTasks, 
        staff: cleanedStaff 
      };
      
      localStorage.setItem('leanflow_data', JSON.stringify(finalData));
      return finalData;
    } catch (error) {
      console.error("Cloud Sync Failed:", error);
      const local = localStorage.getItem('leanflow_data');
      return local ? JSON.parse(local) : { projects: [], tasks: [], staff: [], claims: [] };
    }
  }

  async syncToCloud(type: 'project' | 'task' | 'staff' | 'claim' | 'settings', action: 'add' | 'update' | 'delete', data: any) {
    if (!SCRIPT_URL) return;
    
    // Add casing variations for common fields to be more resilient to sheet headers
    const syncData = { ...data };
    if (type === 'staff' && syncData.password) {
      syncData.Password = syncData.password;
    }

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type, action, data: syncData })
      });
    } catch (error) {
      console.error(`Sync Fail [${type}]:`, error);
    }
  }
}

export const cloudService = GoogleSheetsService.getInstance();
