import React, { useState } from 'react';
import { 
  Book, 
  Database,
  Users,
  Shield,
  Workflow,
  Server,
  Image,
  Code,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Settings,
  Smartphone,
  Monitor,
  FolderTree,
  GitBranch,
  Layers,
  Key,
  HardDrive,
  Table,
  Link2,
  Upload,
  Download,
  Zap,
  Package,
  File,
  Folder,
  Mail
} from 'lucide-react';

const Documentation = () => {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    features: false,
    database: false,
    authentication: false,
    workflow: false,
    contracts: false,
    components: false,
    services: false,
    stores: false,
    images: false,
    setup: false,
    structure: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ id, icon: Icon, title, color }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-gray-900">{title}</span>
      </div>
      {expandedSections[id] ? (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400" />
      )}
    </button>
  );

  const CodeBlock = ({ children, title }) => (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm text-gray-400 font-mono">{title}</span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm text-gray-300 font-mono">
        <code>{children}</code>
      </pre>
    </div>
  );

  const TableRow = ({ cells, isHeader }) => (
    <tr className={isHeader ? 'bg-gray-50' : 'hover:bg-gray-50'}>
      {cells.map((cell, i) => (
        isHeader ? (
          <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {cell}
          </th>
        ) : (
          <td key={i} className="px-4 py-3 text-sm text-gray-700 border-t border-gray-100">
            {cell}
          </td>
        )
      ))}
    </tr>
  );

  const FileItem = ({ name, type = 'file', indent = 0, description }) => (
    <div className={`flex items-start gap-2 py-1`} style={{ paddingLeft: `${indent * 16}px` }}>
      {type === 'folder' ? (
        <Folder className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
      ) : (
        <File className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${type === 'folder' ? 'font-medium text-gray-900' : 'text-gray-700 font-mono'}`}>
          {name}
        </span>
        {description && (
          <span className="text-xs text-gray-500 ml-2">— {description}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
            <Book className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
            <p className="text-gray-500">Complete system documentation for PM System</p>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="space-y-4">
        <SectionHeader id="overview" icon={FileText} title="1. Project Overview" color="bg-blue-500" />
        {expandedSections.overview && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">About the System</h3>
              <p className="text-gray-600 leading-relaxed">
                The Preventive Maintenance (PM) System is a comprehensive task management application designed 
                for facilities maintenance teams. It enables managers to create and assign maintenance tasks, 
                while technicians can claim, execute, and submit tasks for approval.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key Objectives</h3>
              <ul className="space-y-2">
                {[
                  'Streamline preventive maintenance workflows',
                  'Enable task pooling system for flexible task assignment',
                  'Provide real-time tracking of task progress',
                  'Support photo documentation for completed work',
                  'Implement approval workflow with risk acceptance for issues',
                  'Generate comprehensive reports and analytics'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Technology Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'React 18', desc: 'Frontend Framework' },
                  { name: 'Vite', desc: 'Build Tool' },
                  { name: 'Tailwind CSS', desc: 'Styling' },
                  { name: 'Zustand', desc: 'State Management' },
                  { name: 'Supabase', desc: 'Backend & Database' },
                  { name: 'PostgreSQL', desc: 'Database' },
                  { name: 'Lucide React', desc: 'Icons' },
                  { name: 'Recharts', desc: 'Charts' }
                ].map((tech, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm">{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="space-y-4">
        <SectionHeader id="features" icon={Zap} title="2. Features by Role" color="bg-purple-500" />
        {expandedSections.features && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
            {/* Master Admin */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-900">Master Admin</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Dashboard Overview', desc: 'View all system statistics and metrics' },
                  { title: 'Role Switching', desc: 'Switch view between Manager and Technician roles' },
                  { title: 'User Management', desc: 'Create, edit, deactivate users (Users.jsx)' },
                  { title: 'Category Management', desc: 'Manage task categories with colors and codes' },
                  { title: 'Location Management', desc: 'Manage buildings, floors, and areas' },
                  { title: 'Full System Access', desc: 'Access to all features and settings' }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Manager */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Manager</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Dashboard', desc: 'View task statistics, charts, and team performance' },
                  { title: 'Task Management', desc: 'Create single or bulk tasks with scheduling (TaskManagement.jsx)' },
                  { title: 'Approvals', desc: 'Review and approve/reject submitted tasks (Approvals.jsx)' },
                  { title: 'Risk Acceptance', desc: 'Approve tasks with issues after accepting risk checkbox' },
                  { title: 'Approve All', desc: 'Bulk approve all completed normal tasks only' },
                  { title: 'Reports', desc: 'Generate and export detailed reports (Reports.jsx)' },
                  { title: 'Team Overview', desc: 'Monitor technician workload and performance' },
                  { title: 'Task Reassignment', desc: 'Reject tasks and set new due dates for pool' },
                  { title: 'Contracts', desc: 'Track and manage outsourced maintenance agreements (Contracts.jsx)' }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technician */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">Technician</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'My Tasks', desc: 'View assigned tasks with All/Today filter (MyTasks.jsx)' },
                  { title: 'Task Pool', desc: 'Claim available tasks from the pool' },
                  { title: 'Weekly Progress', desc: 'Track completion rate for current week (Mon-Sun)' },
                  { title: 'Complete Task', desc: 'Submit with photo (required) and optional remarks' },
                  { title: 'Report Issue', desc: 'Submit with photo (required) and issue description (required)' },
                  { title: 'Skip Task', desc: 'Request skip with reason for manager review' },
                  { title: 'Return to Pool', desc: 'Unclaim task to return it to the pool' },
                  { title: 'Task History', desc: 'View completed and submitted tasks (TaskHistory.jsx)' },
                  { title: 'Contracts', desc: 'View and manage outsourced maintenance agreements (Contracts.jsx)' }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

{/* Database Section */}
<div className="space-y-4">
  <SectionHeader id="database" icon={Database} title="3. Database Schema" color="bg-green-500" />
  {expandedSections.database && (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Schema: preventive_maintenance</h3>
        <p className="text-gray-600 text-sm mb-4">
          All tables are created under the <code className="bg-gray-100 px-1 rounded">preventive_maintenance</code> schema 
          in Supabase PostgreSQL database.
        </p>
        
        {/* Tables Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-900 text-sm">7 Tables</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">categories, contracts, locations, settings, task_history, tasks, users</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-gray-900 text-sm">3 Views</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">v_daily_stats, v_task_summary, v_technician_performance</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-500" />
              <span className="font-medium text-gray-900 text-sm">2 Enums</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">task_status, submission_status, user_role</p>
          </div>
        </div>
      </div>

      {/* Custom Types / Enums */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-4 h-4 text-orange-500" />
          <h4 className="font-medium text-gray-900">Custom Types (Enums)</h4>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-mono text-sm text-gray-900 mb-2">task_status</p>
            <div className="space-y-1">
              {['open', 'in_progress', 'pending_approval', 'completed', 'issue', 'skipped'].map((val, i) => (
                <span key={i} className="inline-block text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded mr-1 mb-1">{val}</span>
              ))}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-mono text-sm text-gray-900 mb-2">submission_status</p>
            <div className="space-y-1">
              {['normal', 'issue', 'skipped'].map((val, i) => (
                <span key={i} className="inline-block text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded mr-1 mb-1">{val}</span>
              ))}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-mono text-sm text-gray-900 mb-2">user_role</p>
            <div className="space-y-1">
              {['master_admin', 'manager', 'technician'].map((val, i) => (
                <span key={i} className="inline-block text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded mr-1 mb-1">{val}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Table className="w-4 h-4 text-blue-500" />
          <h4 className="font-medium text-gray-900">users</h4>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Authentication</span>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Column', 'Type', 'Description']} />
            </thead>
            <tbody>
              <TableRow cells={['id', 'UUID (PK)', 'Unique identifier']} />
              <TableRow cells={['run_number', 'INT4', 'Auto-incrementing user number']} />
              <TableRow cells={['email', 'VARCHAR', 'User email address (unique)']} />
              <TableRow cells={['password_hash', 'VARCHAR', 'Hashed password']} />
              <TableRow cells={['name', 'VARCHAR', 'Display name']} />
              <TableRow cells={['phone', 'VARCHAR', 'Contact phone number']} />
              <TableRow cells={['avatar_url', 'TEXT', 'Profile image URL']} />
              <TableRow cells={['role', 'user_role', 'master_admin, manager, technician']} />
              <TableRow cells={['is_active', 'BOOL', 'Account active status']} />
              <TableRow cells={['last_login_at', 'TIMESTAMPTZ', 'Last login timestamp']} />
              <TableRow cells={['created_at', 'TIMESTAMPTZ', 'Creation timestamp']} />
              <TableRow cells={['updated_at', 'TIMESTAMPTZ', 'Last update timestamp']} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Categories Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Table className="w-4 h-4 text-purple-500" />
          <h4 className="font-medium text-gray-900">categories</h4>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Master Data</span>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Column', 'Type', 'Description']} />
            </thead>
            <tbody>
              <TableRow cells={['id', 'UUID (PK)', 'Unique identifier']} />
              <TableRow cells={['run_number', 'INT4', 'Auto-incrementing number']} />
              <TableRow cells={['name', 'VARCHAR', 'Category name (e.g., HVAC, Electrical)']} />
              <TableRow cells={['code', 'VARCHAR', 'Short code (e.g., HVAC, ELEC)']} />
              <TableRow cells={['color', 'VARCHAR', 'Hex color code (e.g., #3B82F6)']} />
              <TableRow cells={['icon', 'VARCHAR', 'Icon name for display']} />
              <TableRow cells={['description', 'TEXT', 'Category description']} />
              <TableRow cells={['is_active', 'BOOL', 'Active status']} />
              <TableRow cells={['sort_order', 'INT4', 'Display order']} />
              <TableRow cells={['created_at', 'TIMESTAMPTZ', 'Creation timestamp']} />
              <TableRow cells={['updated_at', 'TIMESTAMPTZ', 'Last update timestamp']} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Locations Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Table className="w-4 h-4 text-orange-500" />
          <h4 className="font-medium text-gray-900">locations</h4>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Master Data</span>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Column', 'Type', 'Description']} />
            </thead>
            <tbody>
              <TableRow cells={['id', 'UUID (PK)', 'Unique identifier']} />
              <TableRow cells={['run_number', 'INT4', 'Auto-incrementing number']} />
              <TableRow cells={['name', 'VARCHAR', 'Location name']} />
              <TableRow cells={['code', 'VARCHAR', 'Location code']} />
              <TableRow cells={['building', 'VARCHAR', 'Building name']} />
              <TableRow cells={['floor', 'VARCHAR', 'Floor number/name']} />
              <TableRow cells={['zone', 'VARCHAR', 'Zone or area within floor']} />
              <TableRow cells={['description', 'TEXT', 'Location description']} />
              <TableRow cells={['is_active', 'BOOL', 'Active status']} />
              <TableRow cells={['sort_order', 'INT4', 'Display order']} />
              <TableRow cells={['created_at', 'TIMESTAMPTZ', 'Creation timestamp']} />
              <TableRow cells={['updated_at', 'TIMESTAMPTZ', 'Last update timestamp']} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Tasks Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Table className="w-4 h-4 text-green-500" />
          <h4 className="font-medium text-gray-900">tasks</h4>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Main Table</span>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Column', 'Type', 'Description']} />
            </thead>
            <tbody>
              <TableRow cells={['id', 'UUID (PK)', 'Unique identifier']} />
              <TableRow cells={['run_number', 'INT4', 'Auto-incrementing task number']} />
              <TableRow cells={['title', 'VARCHAR', 'Task title']} />
              <TableRow cells={['description', 'TEXT', 'Task description']} />
              <TableRow cells={['category_id', 'UUID (FK)', 'Reference to categories.id']} />
              <TableRow cells={['location_id', 'UUID (FK)', 'Reference to locations.id']} />
              <TableRow cells={['status', 'task_status', 'Current task status']} />
              <TableRow cells={['due_date', 'DATE', 'Task due date']} />
              <TableRow cells={['assignee_id', 'UUID (FK)', 'Assigned technician (users.id)']} />
              <TableRow cells={['assigned_at', 'TIMESTAMPTZ', 'When task was claimed']} />
              <TableRow cells={['submission_status', 'submission_status', 'normal, issue, or skipped']} />
              <TableRow cells={['submission_photo', 'TEXT', 'Base64 encoded image data']} />
              <TableRow cells={['submission_remarks', 'TEXT', 'Technician remarks on completion']} />
              <TableRow cells={['skip_reason', 'TEXT', 'Reason for skipping task']} />
              <TableRow cells={['submitted_by', 'UUID (FK)', 'Technician who submitted (users.id)']} />
              <TableRow cells={['submitted_at', 'TIMESTAMPTZ', 'Submission timestamp']} />
              <TableRow cells={['approved_by', 'UUID (FK)', 'Manager who approved (users.id)']} />
              <TableRow cells={['approved_at', 'TIMESTAMPTZ', 'Approval timestamp']} />
              <TableRow cells={['rejection_reason', 'TEXT', 'Reason for rejection']} />
              <TableRow cells={['is_recurring', 'BOOL', 'Is this a recurring task']} />
              <TableRow cells={['recurrence_pattern', 'JSONB', 'Recurrence configuration']} />
              <TableRow cells={['parent_task_id', 'UUID (FK)', 'Parent task for recurring (tasks.id)']} />
              <TableRow cells={['created_by', 'UUID (FK)', 'Manager who created (users.id)']} />
              <TableRow cells={['created_at', 'TIMESTAMPTZ', 'Creation timestamp']} />
              <TableRow cells={['updated_at', 'TIMESTAMPTZ', 'Last update timestamp']} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Task History Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Table className="w-4 h-4 text-indigo-500" />
          <h4 className="font-medium text-gray-900">task_history</h4>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Audit Log</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Tracks all changes to tasks including status changes, assignments, and other modifications.
        </p>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Column', 'Type', 'Description']} />
            </thead>
            <tbody>
              <TableRow cells={['id', 'UUID (PK)', 'Unique identifier']} />
              <TableRow cells={['task_id', 'UUID (FK)', 'Reference to tasks.id']} />
              <TableRow cells={['action', 'VARCHAR', 'Action type (created, claimed, submitted, approved, rejected, etc.)']} />
              <TableRow cells={['old_status', 'task_status', 'Previous status before change']} />
              <TableRow cells={['new_status', 'task_status', 'New status after change']} />
              <TableRow cells={['old_assignee_id', 'UUID (FK)', 'Previous assignee (users.id)']} />
              <TableRow cells={['new_assignee_id', 'UUID (FK)', 'New assignee (users.id)']} />
              <TableRow cells={['details', 'JSONB', 'Additional details about the action']} />
              <TableRow cells={['notes', 'TEXT', 'Notes or comments about the action']} />
              <TableRow cells={['performed_by', 'UUID (FK)', 'User who performed action (users.id)']} />
              <TableRow cells={['created_at', 'TIMESTAMPTZ', 'When the action occurred']} />
            </tbody>
          </table>
        </div>
        
        {/* Task History Actions */}
        <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
          <p className="text-xs font-medium text-indigo-800 mb-2">Tracked Actions:</p>
          <div className="flex flex-wrap gap-1">
            {['created', 'claimed', 'unclaimed', 'submitted', 'approved', 'rejected', 'status_changed', 'reassigned'].map((action, i) => (
              <span key={i} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{action}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Table className="w-4 h-4 text-gray-500" />
          <h4 className="font-medium text-gray-900">settings</h4>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">Configuration</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Stores application-wide settings and configurations.
        </p>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Column', 'Type', 'Description']} />
            </thead>
            <tbody>
              <TableRow cells={['id', 'UUID (PK)', 'Unique identifier']} />
              <TableRow cells={['key', 'VARCHAR', 'Setting key (unique identifier)']} />
              <TableRow cells={['value', 'JSONB', 'Setting value (flexible JSON)']} />
              <TableRow cells={['category', 'VARCHAR', 'Setting category for grouping']} />
              <TableRow cells={['description', 'TEXT', 'Description of the setting']} />
              <TableRow cells={['updated_by', 'UUID (FK)', 'Last user who updated (users.id)']} />
              <TableRow cells={['created_at', 'TIMESTAMPTZ', 'Creation timestamp']} />
              <TableRow cells={['updated_at', 'TIMESTAMPTZ', 'Last update timestamp']} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Contracts Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Table className="w-4 h-4 text-teal-500" />
          <h4 className="font-medium text-gray-900">contracts</h4>
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Contracts</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Tracks outsourced maintenance agreements. Computed statuses (expiring_soon, expired) are derived from <code className="bg-gray-100 px-1 rounded">end_date</code> on the frontend — only <code className="bg-gray-100 px-1 rounded">active</code> / <code className="bg-gray-100 px-1 rounded">cancelled</code> are stored.
        </p>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Column', 'Type', 'Description']} />
            </thead>
            <tbody>
              <TableRow cells={['id', 'UUID (PK)', 'Auto-generated unique identifier']} />
              <TableRow cells={['supplier_name', 'TEXT', 'Required — vendor legal or trade name']} />
              <TableRow cells={['description', 'TEXT', 'Scope of work, SLA terms (optional)']} />
              <TableRow cells={['start_date', 'DATE', 'Contract start date (required)']} />
              <TableRow cells={['end_date', 'DATE', 'Contract end date (required)']} />
              <TableRow cells={['contract_value', 'TEXT', 'Free-form value e.g. "120,000 THB" (optional)']} />
              <TableRow cells={['contact_person', 'TEXT', 'Supplier contact name (optional)']} />
              <TableRow cells={['phone', 'TEXT', 'Contact phone (optional)']} />
              <TableRow cells={['email', 'TEXT', 'Contact email (optional)']} />
              <TableRow cells={['notes', 'TEXT', 'Internal notes (optional)']} />
              <TableRow cells={['category_id', 'UUID (FK)', 'categories.id — maintenance area covered']} />
              <TableRow cells={['status', 'TEXT', '"active" or "cancelled" only']} />
              <TableRow cells={['cancelled_at', 'TIMESTAMPTZ', 'Set when status is cancelled']} />
              <TableRow cells={['cancelled_by', 'UUID (FK)', 'users.id — who cancelled']} />
              <TableRow cells={['created_by', 'UUID (FK)', 'users.id — who created']} />
              <TableRow cells={['created_at', 'TIMESTAMPTZ', 'Auto']} />
              <TableRow cells={['updated_at', 'TIMESTAMPTZ', 'Auto via trigger']} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Views */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-purple-500" />
          <h4 className="font-medium text-gray-900">Database Views</h4>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-mono text-sm font-medium text-gray-900">v_task_summary</p>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">UNRESTRICTED</span>
            </div>
            <p className="text-xs text-gray-600">
              Joins tasks with categories, locations, and users for complete task information. 
              Includes assignee details, category color, location name, and calculated fields like overdue status.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-mono text-sm font-medium text-gray-900">v_daily_stats</p>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">UNRESTRICTED</span>
            </div>
            <p className="text-xs text-gray-600">
              Aggregates task counts by date for reporting. Includes completed, issues, skipped, and total counts per day.
              Used for dashboard charts and trend analysis.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-mono text-sm font-medium text-gray-900">v_technician_performance</p>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">UNRESTRICTED</span>
            </div>
            <p className="text-xs text-gray-600">
              Aggregates performance metrics per technician. Includes total assigned, completed, issues reported, 
              and skipped counts. Used for team performance dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Entity Relationships */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Entity Relationships</h4>
        <div className="p-4 bg-gray-50 rounded-lg">
          <CodeBlock title="Foreign Key Relationships">
{`-- Tasks Table References
tasks.category_id      → categories.id
tasks.location_id      → locations.id
tasks.assignee_id      → users.id (technician who claimed)
tasks.submitted_by     → users.id (technician who submitted)
tasks.approved_by      → users.id (manager who approved)
tasks.created_by       → users.id (manager who created)
tasks.parent_task_id   → tasks.id (self-reference for recurring)

-- Task History References
task_history.task_id        → tasks.id
task_history.old_assignee_id → users.id
task_history.new_assignee_id → users.id
task_history.performed_by    → users.id

-- Settings Reference
settings.updated_by    → users.id

-- Contracts References
contracts.category_id  → categories.id
contracts.cancelled_by → users.id
contracts.created_by   → users.id`}
          </CodeBlock>
        </div>
      </div>

      {/* Image Storage Info */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Image Storage</h4>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Image className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 text-sm">Submission Photos</p>
              <p className="text-xs text-blue-700 mt-1">
                Images are stored as <strong>Base64 encoded strings</strong> in the <code className="bg-blue-100 px-1 rounded">tasks.submission_photo</code> column (TEXT type).
                This allows images to be stored directly with task data without requiring separate file storage.
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1">
                <li>• Max file size: 5MB (enforced in frontend)</li>
                <li>• Supported formats: All image types (image/*)</li>
                <li>• Storage format: Data URL (data:image/jpeg;base64,...)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Database Schema Diagram */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Schema Overview</h4>
        <div className="p-4 bg-gray-900 rounded-lg text-gray-300 font-mono text-xs overflow-x-auto">
          <pre>{`┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    categories   │     │    locations    │     │      users      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ run_number      │     │ run_number      │     │ run_number      │
│ name            │     │ name            │     │ email           │
│ code            │     │ code            │     │ name            │
│ color           │     │ building        │     │ role            │
│ icon            │     │ floor           │     │ is_active       │
│ is_active       │     │ zone            │     └────────┬────────┘
└────────┬────────┘     │ is_active       │              │
         │              └────────┬────────┘              │
         │                       │                       │
         │    ┌──────────────────┴───────────────────────┘
         │    │
         ▼    ▼
┌─────────────────────────────────────────────────────────────────┐
│                            tasks                                 │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)              │ submission_photo    │ created_by (FK)    │
│ run_number           │ submission_remarks  │ created_at         │
│ title                │ skip_reason         │ updated_at         │
│ description          │ submitted_by (FK)   │ is_recurring       │
│ category_id (FK) ────┤ submitted_at        │ recurrence_pattern │
│ location_id (FK) ────┤ approved_by (FK)    │ parent_task_id(FK) │
│ status               │ approved_at         │                    │
│ due_date             │ rejection_reason    │                    │
│ assignee_id (FK) ────┤                     │                    │
│ assigned_at          │                     │                    │
│ submission_status    │                     │                    │
└─────────────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         task_history                             │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)              │ old_assignee_id (FK)│ notes              │
│ task_id (FK) ────────┤ new_assignee_id (FK)│ performed_by (FK)  │
│ action               │ details (JSONB)     │ created_at         │
│ old_status           │                     │                    │
│ new_status           │                     │                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│    settings     │
├─────────────────┤
│ id (PK)         │
│ key             │
│ value (JSONB)   │
│ category        │
│ updated_by (FK) │
└─────────────────┘`}</pre>
        </div>
      </div>
    </div>
  )}
</div>

{/* Authentication Section */}
<div className="space-y-4">
  <SectionHeader id="authentication" icon={Key} title="4. Authentication & Authorization" color="bg-yellow-500" />
  {expandedSections.authentication && (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
      
      {/* Authentication Methods Overview */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Authentication Methods</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-blue-500" />
              <p className="font-medium text-blue-900">Email/Password</p>
            </div>
            <p className="text-xs text-blue-700">
              Traditional login with email and password. User must exist in users table with is_active = true.
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <p className="font-medium text-red-900">Google SSO</p>
            </div>
            <p className="text-xs text-red-700">
              OAuth 2.0 via Supabase Auth. New users created with is_active = false (pending approval).
            </p>
          </div>
        </div>
      </div>

      {/* New Columns for SSO */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">SSO Columns in Users Table</h3>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-3">
          <p className="text-xs text-yellow-800">
            <strong>New columns added</strong> to support Google SSO authentication:
          </p>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Column', 'Type', 'Description']} />
            </thead>
            <tbody>
              <TableRow cells={['google_id', 'VARCHAR(255)', 'Google OAuth user ID (unique)']} />
              <TableRow cells={['auth_provider', 'VARCHAR(50)', 'Authentication method: "email" or "google"']} />
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <CodeBlock title="SQL to add SSO columns">
{`ALTER TABLE preventive_maintenance.users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email';

CREATE INDEX IF NOT EXISTS idx_users_google_id 
ON preventive_maintenance.users(google_id);`}
          </CodeBlock>
        </div>
      </div>

      {/* Email/Password Flow */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Email/Password Login Flow</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 text-sm mb-2">Flow: LoginForm.jsx → authStore.js → authService.js</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• User enters email and password on LoginForm</li>
              <li>• authStore.login() calls authService.login()</li>
              <li>• authService queries users table by email</li>
              <li>• Validates user exists and is_active = true</li>
              <li>• Returns user data, stores in Zustand with persist</li>
              <li>• Redirects based on role (technician → MyTasks, others → Dashboard)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Google SSO Flow */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Google SSO Login Flow</h3>
        <div className="p-4 bg-gray-900 rounded-lg text-gray-300 font-mono text-xs overflow-x-auto mb-4">
          <pre>{`┌──────────────────────────────────────────────────────────────────┐
│                     Google SSO Flow                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Continue with Google" button                    │
│                    │                                             │
│                    ▼                                             │
│  2. loginWithGoogle() → supabase.auth.signInWithOAuth()         │
│                    │                                             │
│                    ▼                                             │
│  3. Supabase redirects to Google OAuth consent screen           │
│                    │                                             │
│                    ▼                                             │
│  4. User authenticates with Google account                       │
│                    │                                             │
│                    ▼                                             │
│  5. Google redirects back to /login with access_token in hash   │
│                    │                                             │
│                    ▼                                             │
│  6. Login.jsx detects hash, calls handleGoogleCallback()        │
│                    │                                             │
│                    ▼                                             │
│  7. Get session from Supabase Auth (contains Google user info)  │
│                    │                                             │
│          ┌────────┴────────────────┐                             │
│          │                         │                             │
│          ▼                         ▼                             │
│   Check users table          User NOT found                      │
│   by google_id               in users table                      │
│          │                         │                             │
│          │                         ▼                             │
│          │                   Check by email                      │
│          │                         │                             │
│          │              ┌──────────┴──────────┐                  │
│          │              │                     │                  │
│          │              ▼                     ▼                  │
│          │        Email exists          Email NOT exists         │
│          │        Link google_id        Create new user          │
│          │              │               is_active = false        │
│          │              │                     │                  │
│          ▼              ▼                     ▼                  │
│   ┌──────────────────────────┐    ┌──────────────────────┐      │
│   │   Check is_active        │    │   Show "Pending      │      │
│   └──────────────────────────┘    │   Approval" message  │      │
│          │                        │   Sign out user      │      │
│   ┌──────┴──────┐                 └──────────────────────┘      │
│   │             │                                                │
│   ▼             ▼                                                │
│ true          false                                              │
│   │             │                                                │
│   ▼             ▼                                                │
│ Login OK    Show "Pending                                        │
│ → Redirect  Approval" message                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`}</pre>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="font-medium text-green-800 text-sm mb-2">✓ Existing User (Approved)</p>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• User found by google_id or email in users table</li>
              <li>• is_active = true</li>
              <li>• Update last_login_at, return user data</li>
              <li>• Redirect to appropriate dashboard</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="font-medium text-yellow-800 text-sm mb-2">⏳ Existing User (Pending)</p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• User found but is_active = false</li>
              <li>• Sign out from Supabase Auth</li>
              <li>• Show "Pending Approval" message</li>
              <li>• User must wait for admin to activate</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-medium text-blue-800 text-sm mb-2">🆕 New User (Auto-Created)</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• User not found by google_id or email</li>
              <li>• Create new user with: google_id, email, name, avatar_url</li>
              <li>• Set auth_provider = 'google', role = 'technician'</li>
              <li>• Set is_active = false (pending approval)</li>
              <li>• Sign out, show "Account Created - Pending Approval"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Auth Service Methods */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Auth Service Methods (authService.js)</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Method', 'Description']} />
            </thead>
            <tbody>
              <TableRow cells={['login(email, password)', 'Email/password authentication']} />
              <TableRow cells={['validateSession(userId)', 'Check if user still valid in database']} />
              <TableRow cells={['signInWithGoogle()', 'Initiate Google OAuth via Supabase']} />
              <TableRow cells={['getSession()', 'Get current Supabase auth session']} />
              <TableRow cells={['handleGoogleCallback()', 'Process OAuth callback, check/create user']} />
              <TableRow cells={['signOutGoogle()', 'Sign out from Supabase Auth']} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Auth Store Methods */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Auth Store Methods (authStore.js)</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Method/State', 'Type', 'Description']} />
            </thead>
            <tbody>
              <TableRow cells={['user', 'State', 'Current logged-in user object']} />
              <TableRow cells={['isAuthenticated', 'State', 'Authentication status boolean']} />
              <TableRow cells={['viewMode', 'State', 'View mode for master_admin (manager/technician)']} />
              <TableRow cells={['login(email, password)', 'Action', 'Email/password login']} />
              <TableRow cells={['loginWithGoogle()', 'Action', 'Initiate Google SSO']} />
              <TableRow cells={['handleGoogleCallback()', 'Action', 'Process Google callback']} />
              <TableRow cells={['logout()', 'Action', 'Sign out (handles both auth methods)']} />
              <TableRow cells={['refreshUser()', 'Action', 'Refresh user data from database']} />
              <TableRow cells={['getEffectiveRole()', 'Action', 'Get role based on viewMode']} />
              <TableRow cells={['setViewMode(mode)', 'Action', 'Switch view (master_admin only)']} />
              <TableRow cells={['validateSession()', 'Action', 'Verify user still valid']} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Management */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Session Management</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900 text-sm mb-2">Storage: Zustand with localStorage persist</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• User data stored in localStorage via Zustand persist middleware</li>
            <li>• Key: <code className="bg-gray-200 px-1 rounded">pm-auth-storage</code></li>
            <li>• ProtectedRoute.jsx validates authentication on route access</li>
            <li>• Logout clears both localStorage and Supabase Auth session</li>
          </ul>
        </div>
      </div>

      {/* Role-Based Access Control */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Role-Based Access Control</h3>
        <CodeBlock title="src/data/constants.js">
{`export const USER_ROLES = {
  MASTER_ADMIN: 'master_admin',  // Full access + role switching
  MANAGER: 'manager',            // Task & approval management
  TECHNICIAN: 'technician'       // Task execution only
};`}
        </CodeBlock>
      </div>

      {/* Route Protection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Route Protection (ProtectedRoute.jsx)</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <TableRow isHeader cells={['Route', 'Access', 'Component']} />
            </thead>
            <tbody>
              <TableRow cells={['/login', 'Public', 'Login.jsx']} />
              <TableRow cells={['/dashboard', 'All authenticated', 'Dashboard.jsx']} />
              <TableRow cells={['/contracts', 'All authenticated', 'Contracts.jsx']} />
              <TableRow cells={['/calendar', 'All authenticated', 'Calendar.jsx']} />
              <TableRow cells={['/history', 'All authenticated', 'TaskHistory.jsx']} />
              <TableRow cells={['/my-tasks', 'All authenticated (technician view)', 'MyTasks.jsx']} />
              <TableRow cells={['/tasks', 'Manager / Admin', 'TaskManagement.jsx']} />
              <TableRow cells={['/approvals', 'Manager / Admin', 'Approvals.jsx']} />
              <TableRow cells={['/reports', 'Manager / Admin', 'Reports.jsx']} />
              <TableRow cells={['/users', 'Manager / Admin', 'Users.jsx']} />
              <TableRow cells={['/settings', 'All authenticated', 'Settings.jsx']} />
              <TableRow cells={['/docs', 'Manager / Admin', 'Documentation.jsx']} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Supabase Configuration */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Supabase Auth Configuration</h3>
        <div className="space-y-3">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="font-medium text-purple-800 text-sm mb-2">Google Provider Setup</p>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Enable Google provider in Supabase Dashboard → Authentication → Providers</li>
              <li>• Client ID: <code className="bg-purple-100 px-1 rounded">649568693395-xxx.apps.googleusercontent.com</code></li>
              <li>• Client Secret: From Google Cloud Console</li>
              <li>• Redirect URL: <code className="bg-purple-100 px-1 rounded">{'{origin}'}/login</code></li>
            </ul>
          </div>
          <CodeBlock title="src/lib/supabase.js">
{`const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'preventive_maintenance'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true  // Required for OAuth callback
  }
});`}
          </CodeBlock>
        </div>
      </div>
    </div>
  )}
</div>

      {/* Workflow Section */}
      <div className="space-y-4">
        <SectionHeader id="workflow" icon={Workflow} title="5. Task Workflow" color="bg-indigo-500" />
        {expandedSections.workflow && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Task Status Flow</h3>
              <div className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
                <CodeBlock>
{`OPEN (Created by Manager in TaskManagement.jsx)
  │
  ├── Claimed by Technician (MyTasks.jsx - Task Pool)
  │
  ▼
IN_PROGRESS (Assigned to technician)
  │
  ├── Complete → Photo (required) + Remarks (optional)
  │   │
  │   └── PENDING_APPROVAL (submission_status: 'normal')
  │         │
  │         ├── Approved (Approvals.jsx) → COMPLETED
  │         │
  │         └── Rejected → OPEN (new due date, back to pool)
  │
  ├── Report Issue → Photo (required) + Issue Description (required)
  │   │
  │   └── PENDING_APPROVAL (submission_status: 'issue')
  │         │
  │         ├── Approved with Risk Checkbox → ISSUE
  │         │
  │         └── Rejected → OPEN (new due date, back to pool)
  │
  └── Skip → Skip Reason (required, no photo)
      │
      └── PENDING_APPROVAL (submission_status: 'skipped')
            │
            ├── Approved with Risk Checkbox → SKIPPED
            │
            └── Rejected → OPEN (new due date, back to pool)`}
                </CodeBlock>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Status Definitions (constants.js)</h3>
              <CodeBlock title="TASK_STATUS">
{`export const TASK_STATUS = {
  OPEN: 'open',                    // Available in pool
  IN_PROGRESS: 'in_progress',      // Claimed by technician
  PENDING_APPROVAL: 'pending_approval', // Submitted, awaiting review
  COMPLETED: 'completed',          // Approved normal completion
  ISSUE: 'issue',                  // Approved with issue
  SKIPPED: 'skipped'               // Approved skip
};

export const SUBMISSION_STATUS = {
  NORMAL: 'normal',    // Completed normally
  ISSUE: 'issue',      // Completed with issue
  SKIPPED: 'skipped'   // Skipped
};`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Approval Process (Approvals.jsx)</h3>
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium text-green-800 text-sm mb-2">Normal Completion Approval</p>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Manager reviews submitted photo and remarks</li>
                    <li>• Click Approve → Confirmation popup → Confirm</li>
                    <li>• Task status changes to COMPLETED</li>
                  </ul>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="font-medium text-amber-800 text-sm mb-2">Issue / Skipped Approval (Risk Required)</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Manager reviews submission details and reason</li>
                    <li>• Click Approve → Risk Modal appears</li>
                    <li>• Must check "I Accept the Risk" checkbox</li>
                    <li>• Button enabled only after checkbox checked</li>
                    <li>• Task status changes to ISSUE or SKIPPED</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-800 text-sm mb-2">Approve All (Bulk)</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Only approves tasks with submission_status = 'normal'</li>
                    <li>• Issues and Skipped tasks excluded (require individual review)</li>
                    <li>• Shows count of tasks to be approved</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-medium text-red-800 text-sm mb-2">Rejection</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Manager must set new due date</li>
                    <li>• Optional rejection reason</li>
                    <li>• Task returns to OPEN status</li>
                    <li>• Assignee cleared, task back in pool</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contracts Section */}
      <div className="space-y-4">
        <SectionHeader id="contracts" icon={FileText} title="6. Contracts Module" color="bg-teal-500" />
        {expandedSections.contracts && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Overview</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The Contracts module (<code className="bg-gray-100 px-1 rounded">src/pages/Contracts.jsx</code>) is a shared page accessible to both managers and technicians.
                It tracks outsourced maintenance agreements, surfaces expiry alerts proactively, and archives cancellations with a full audit trail.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contract Status Logic</h3>
              <p className="text-sm text-gray-600 mb-3">
                Status is <strong>computed on the frontend</strong> from <code className="bg-gray-100 px-1 rounded">end_date</code>. Only <code className="bg-gray-100 px-1 rounded">active</code> and <code className="bg-gray-100 px-1 rounded">cancelled</code> are stored in the database.
              </p>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead>
                    <TableRow isHeader cells={['Computed Status', 'Condition', 'Badge Color', 'DB Value']} />
                  </thead>
                  <tbody>
                    <TableRow cells={['Active', 'end_date > today + 30d', 'Green', 'active']} />
                    <TableRow cells={['Expiring Soon', 'end_date − today ≤ 30d', 'Yellow', 'active']} />
                    <TableRow cells={['Expired', 'end_date < today', 'Red', 'active']} />
                    <TableRow cells={['Cancelled', 'status = "cancelled"', 'Gray', 'cancelled']} />
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Business Rules</h3>
              <ul className="space-y-2">
                {[
                  'Both managers and technicians can create, renew, and cancel contracts.',
                  'Cancellation is permanent — cancelled contracts are read-only archives. Create a new contract to re-engage.',
                  'Renewal overwrites previous start/end dates and resets computed status to Active.',
                  'Expired contracts remain fully actionable (renew or cancel).',
                  'Category link ties a contract to a Task Category (e.g., HVAC, Electrical).',
                  'Alert banners for expired and expiring-soon contracts are shown at the top of the page.',
                  'Success messages auto-dismiss after 3 seconds.'
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Data Flow</h3>
              <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm text-gray-700">
                Contracts.jsx → contractStore.js → contractService.js → Supabase
              </div>
              <div className="mt-3 overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead>
                    <TableRow isHeader cells={['File', 'Role']} />
                  </thead>
                  <tbody>
                    <TableRow cells={['src/pages/Contracts.jsx', 'Page UI — table layout, modals, alert banners']} />
                    <TableRow cells={['src/store/contractStore.js', 'Zustand store — contracts[], isLoading, error, actions']} />
                    <TableRow cells={['src/services/contractService.js', 'Supabase queries — getAll, create, renew, cancel']} />
                    <TableRow cells={['docs/Contracts.md', 'Full page documentation reference']} />
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Modals</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { name: 'Create Contract', desc: 'Supplier Name*, Task Category, Start Date*, End Date*, Description, Contract Value, Contact Person, Phone, Email, Notes' },
                  { name: 'Contract Detail', desc: 'Read-only view of all fields. Footer actions: Renew and Cancel (hidden for cancelled contracts).' },
                  { name: 'Renew Contract', desc: 'New Start Date* and New End Date*. Overwrites previous dates.' },
                  { name: 'Cancel Confirmation', desc: 'Irreversible warning. Options: Keep Contract or Confirm Cancellation.' }
                ].map((m, i) => (
                  <div key={i} className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Components Section */}
      <div className="space-y-4">
        <SectionHeader id="components" icon={Layers} title="7. Components" color="bg-cyan-500" />
        {expandedSections.components && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Component Categories</h3>
              
              {/* Auth Components */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-yellow-500" />
                  components/auth/
                </h4>
                <div className="ml-6 space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-mono text-sm text-gray-900">LoginForm.jsx</p>
                    <p className="text-xs text-gray-600 mt-1">Login form with email/password, validation, error handling</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-mono text-sm text-gray-900">ProtectedRoute.jsx</p>
                    <p className="text-xs text-gray-600 mt-1">Route guard checking authentication and role access</p>
                  </div>
                </div>
              </div>

              {/* Common Components */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-yellow-500" />
                  components/common/
                </h4>
                <div className="ml-6 grid md:grid-cols-2 gap-2">
                  {[
                    { name: 'Badge.jsx', desc: 'Status badges with colors' },
                    { name: 'Button.jsx', desc: 'Reusable button component' },
                    { name: 'Card.jsx', desc: 'Card container component' },
                    { name: 'EmptyState.jsx', desc: 'Empty state placeholder' },
                    { name: 'Input.jsx', desc: 'Form input component' },
                    { name: 'LoadingSpinner.jsx', desc: 'Loading animation' },
                    { name: 'Logo.jsx', desc: 'App logo component' },
                    { name: 'Modal.jsx', desc: 'Modal dialog component' },
                    { name: 'Select.jsx', desc: 'Dropdown select component' },
                    { name: 'Toast.jsx', desc: 'Toast notification component' }
                  ].map((item, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded-lg">
                      <p className="font-mono text-xs text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layout Components */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-yellow-500" />
                  components/layout/
                </h4>
                <div className="ml-6 space-y-2">
                  {[
                    { name: 'Header.jsx', desc: 'Top header with user menu, role switcher' },
                    { name: 'MainLayout.jsx', desc: 'Main layout wrapper with sidebar' },
                    { name: 'MobileNav.jsx', desc: 'Mobile navigation menu' },
                    { name: 'Sidebar.jsx', desc: 'Side navigation with role-based menu items' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-mono text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Components */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-yellow-500" />
                  components/tasks/
                </h4>
                <div className="ml-6 space-y-2">
                  {[
                    { name: 'TaskCard.jsx', desc: 'Task card display with status, category, location' },
                    { name: 'TaskDetailModal.jsx', desc: 'Full task detail modal view' },
                    { name: 'TaskForm.jsx', desc: 'Create/edit task form' },
                    { name: 'TaskSubmitModal.jsx', desc: 'Task submission modal (complete/issue/skip)' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-mono text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Components */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-yellow-500" />
                  components/reports/
                </h4>
                <div className="ml-6 space-y-2">
                  {[
                    { name: 'DonutChart.jsx', desc: 'Donut/pie chart for statistics' },
                    { name: 'ProgressBar.jsx', desc: 'Progress bar component' },
                    { name: 'StatsCard.jsx', desc: 'Statistics card with icon' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-mono text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Services Section */}
      <div className="space-y-4">
        <SectionHeader id="services" icon={Server} title="8. Services Layer" color="bg-red-500" />
        {expandedSections.services && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Service Files (src/services/)</h3>
              <div className="space-y-4">
                
                {/* Auth Service */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm font-medium text-gray-900 mb-2">authService.js</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                          <th className="pb-2">Method</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        <tr><td className="py-1 font-mono text-xs">login(email, password)</td><td>Authenticate user</td></tr>
                        <tr><td className="py-1 font-mono text-xs">validateSession(userId)</td><td>Check if user still valid</td></tr>
                        <tr><td className="py-1 font-mono text-xs">updateLastLogin(userId)</td><td>Update last login time</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Task Service */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm font-medium text-gray-900 mb-2">taskService.js</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                          <th className="pb-2">Method</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        <tr><td className="py-1 font-mono text-xs">getAll()</td><td>Fetch all tasks with relations</td></tr>
                        <tr><td className="py-1 font-mono text-xs">create(taskData)</td><td>Create single task</td></tr>
                        <tr><td className="py-1 font-mono text-xs">bulkCreate(tasks[])</td><td>Create multiple tasks</td></tr>
                        <tr><td className="py-1 font-mono text-xs">update(id, data)</td><td>Update task details</td></tr>
                        <tr><td className="py-1 font-mono text-xs">delete(id)</td><td>Delete task</td></tr>
                        <tr><td className="py-1 font-mono text-xs">claim(taskId, userId)</td><td>Assign task to technician</td></tr>
                        <tr><td className="py-1 font-mono text-xs">unclaim(taskId)</td><td>Return task to pool</td></tr>
                        <tr><td className="py-1 font-mono text-xs">submit(taskId, data)</td><td>Submit for approval</td></tr>
                        <tr><td className="py-1 font-mono text-xs">approve(taskId, approverId)</td><td>Approve task</td></tr>
                        <tr><td className="py-1 font-mono text-xs">reject(taskId, newDate, reason)</td><td>Reject and reschedule</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* User Service */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm font-medium text-gray-900 mb-2">userService.js</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                          <th className="pb-2">Method</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        <tr><td className="py-1 font-mono text-xs">getAll()</td><td>Fetch all users</td></tr>
                        <tr><td className="py-1 font-mono text-xs">getById(id)</td><td>Get single user</td></tr>
                        <tr><td className="py-1 font-mono text-xs">create(userData)</td><td>Create new user</td></tr>
                        <tr><td className="py-1 font-mono text-xs">update(id, data)</td><td>Update user</td></tr>
                        <tr><td className="py-1 font-mono text-xs">deactivate(id)</td><td>Deactivate user</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Category Service */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm font-medium text-gray-900 mb-2">categoryService.js</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                          <th className="pb-2">Method</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        <tr><td className="py-1 font-mono text-xs">getAll()</td><td>Fetch all categories</td></tr>
                        <tr><td className="py-1 font-mono text-xs">create(data)</td><td>Create category</td></tr>
                        <tr><td className="py-1 font-mono text-xs">update(id, data)</td><td>Update category</td></tr>
                        <tr><td className="py-1 font-mono text-xs">delete(id)</td><td>Delete category</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Location Service */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm font-medium text-gray-900 mb-2">locationService.js</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                          <th className="pb-2">Method</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        <tr><td className="py-1 font-mono text-xs">getAll()</td><td>Fetch all locations</td></tr>
                        <tr><td className="py-1 font-mono text-xs">create(data)</td><td>Create location</td></tr>
                        <tr><td className="py-1 font-mono text-xs">update(id, data)</td><td>Update location</td></tr>
                        <tr><td className="py-1 font-mono text-xs">delete(id)</td><td>Delete location</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Contract Service */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm font-medium text-gray-900 mb-2">contractService.js</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                          <th className="pb-2">Method</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        <tr><td className="py-1 font-mono text-xs">getAll()</td><td>Fetch all contracts (ordered by created_at desc)</td></tr>
                        <tr><td className="py-1 font-mono text-xs">create(contractData)</td><td>Insert new contract, returns mapped row</td></tr>
                        <tr><td className="py-1 font-mono text-xs">renew(id, startDate, endDate)</td><td>Update dates and reset status to active</td></tr>
                        <tr><td className="py-1 font-mono text-xs">cancel(id, userId)</td><td>Set status=cancelled, record cancelled_at and cancelled_by</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stores Section */}
      <div className="space-y-4">
        <SectionHeader id="stores" icon={HardDrive} title="9. State Management (Zustand)" color="bg-orange-500" />
        {expandedSections.stores && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Store Files (src/store/)</h3>
              
              {/* Auth Store */}
              <div className="mb-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm font-medium text-gray-900 mb-2">authStore.js</p>
                  <p className="text-xs text-gray-600 mb-3">Authentication state with localStorage persistence</p>
                  <CodeBlock>
{`// State
user: null | User object
isAuthenticated: boolean
isLoading: boolean
viewMode: 'manager' | 'technician' (for master_admin)

// Actions
login(email, password)    // Authenticate user
logout()                  // Clear session
setViewMode(mode)         // Switch role view (master_admin only)
validateSession()         // Verify user still valid`}
                  </CodeBlock>
                </div>
              </div>

              {/* Task Store */}
              <div className="mb-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm font-medium text-gray-900 mb-2">taskStore.js</p>
                  <p className="text-xs text-gray-600 mb-3">Tasks, categories, and locations state</p>
                  <CodeBlock>
{`// State
tasks: Task[]
categories: Category[]
locations: Location[]
isLoading: boolean
error: string | null

// Actions
fetchTasks()              // Load all tasks with relations
fetchCategories()         // Load categories
fetchLocations()          // Load locations
createTask(data)          // Create single task
createBulkTasks(tasks[])  // Create multiple tasks
updateTask(id, data)      // Update task
deleteTask(id)            // Delete task
claimTask(taskId, userId) // Assign to technician
unclaimTask(taskId)       // Return to pool
submitTask(taskId, data)  // Submit for approval
approveTask(taskId, userId) // Approve submission
rejectTask(taskId, date, reason) // Reject and reschedule`}
                  </CodeBlock>
                </div>
              </div>

              {/* User Store */}
              <div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm font-medium text-gray-900 mb-2">userStore.js</p>
                  <p className="text-xs text-gray-600 mb-3">User management state (admin only)</p>
                  <CodeBlock>
{`// State
users: User[]
isLoading: boolean

// Actions
fetchUsers()              // Load all users
createUser(data)          // Create new user
updateUser(id, data)      // Update user
deactivateUser(id)        // Deactivate user`}
                  </CodeBlock>
                </div>
              </div>

              {/* Contract Store */}
              <div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm font-medium text-gray-900 mb-2">contractStore.js</p>
                  <p className="text-xs text-gray-600 mb-3">Contract state (accessible to all roles)</p>
                  <CodeBlock>
{`// State
contracts: Contract[]
isLoading: boolean
error: string | null

// Actions
fetchContracts()               // Load all contracts
createContract(data)           // Create new contract
renewContract(id, start, end)  // Update dates, reset to active
cancelContract(id, userId)     // Mark as cancelled
clearError()                   // Clear error state`}
                  </CodeBlock>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Handling Section */}
      <div className="space-y-4">
        <SectionHeader id="images" icon={Image} title="10. Image Handling" color="bg-pink-500" />
        {expandedSections.images && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Storage Method</h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  Images are stored as <strong>Base64 encoded strings</strong> directly in the 
                  <code className="bg-blue-100 px-1 mx-1 rounded">submission_photo</code> column 
                  of the <code className="bg-blue-100 px-1 mx-1 rounded">tasks</code> table (TEXT type).
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Upload Process (MyTasks.jsx)</h3>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'File Selection', desc: 'User clicks upload area or camera icon, selects image' },
                  { step: '2', title: 'Validation', desc: 'Check file.type.startsWith("image/") and file.size < 5MB' },
                  { step: '3', title: 'Base64 Conversion', desc: 'FileReader.readAsDataURL() converts to Base64' },
                  { step: '4', title: 'Preview', desc: 'Show preview using img src={base64String}' },
                  { step: '5', title: 'Submit', desc: 'Base64 string sent in submitTask() to taskService' },
                  { step: '6', title: 'Storage', desc: 'Saved to tasks.submission_photo column in Supabase' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Code Example</h3>
              <CodeBlock title="Image Upload Handler (MyTasks.jsx)">
{`const handlePhotoSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file');
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB');
      return;
    }
    
    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setSubmitForm(prev => ({
        ...prev,
        photo: file,
        photoPreview: reader.result // Base64 data URL
      }));
    };
    reader.readAsDataURL(file);
  }
};`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Displaying Images (Approvals.jsx)</h3>
              <CodeBlock>
{`// Query tasks with photos
const { data } = await supabase
  .from('tasks')
  .select('*, submission_photo')
  .eq('status', 'pending_approval');

// Display in component
{task.submission_photo && (
  <img 
    src={task.submission_photo}  // Base64 string
    alt="Submission" 
    className="w-full rounded-xl"
  />
)}`}
              </CodeBlock>
            </div>
          </div>
        )}
      </div>

      {/* Setup Section */}
      <div className="space-y-4">
        <SectionHeader id="setup" icon={Settings} title="11. Setup & Installation" color="bg-gray-500" />
        {expandedSections.setup && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Prerequisites</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Node.js 18+ installed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  npm or yarn package manager
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Supabase account and project
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Installation Steps</h3>
              <div className="space-y-4">
                <CodeBlock title="1. Clone and Install">
{`git clone <repository-url>
cd pm-system
npm install`}
                </CodeBlock>

                <CodeBlock title="2. Environment Setup (.env)">
{`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
                </CodeBlock>

                <CodeBlock title="3. Start Development">
{`npm run dev
# Opens at http://localhost:5173`}
                </CodeBlock>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Demo Credentials</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead>
                    <TableRow isHeader cells={['Role', 'Email', 'Password']} />
                  </thead>
                  <tbody>
                    <TableRow cells={['Master Admin', 'admin@pmapp.com', 'any']} />
                    <TableRow cells={['Manager', 'manager@pmapp.com', 'any']} />
                    <TableRow cells={['Technician', 'tech1@pmapp.com', 'any']} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Structure Section */}
      <div className="space-y-4">
        <SectionHeader id="structure" icon={FolderTree} title="12. Project Structure" color="bg-teal-500" />
        {expandedSections.structure && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 ml-4">
            <CodeBlock title="Complete Folder Structure">
{`src/
├── assets/
│   ├── logo.png                    # App logo
│   └── react.svg                   # React logo
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx           # Login form component
│   │   └── ProtectedRoute.jsx      # Route guard for auth
│   │
│   ├── calendar/
│   │   └── CalendarView.jsx        # Calendar display component
│   │
│   ├── common/
│   │   ├── Badge.jsx               # Status badge component
│   │   ├── Button.jsx              # Reusable button
│   │   ├── Card.jsx                # Card container
│   │   ├── EmptyState.jsx          # Empty state placeholder
│   │   ├── Input.jsx               # Form input
│   │   ├── LoadingSpinner.jsx      # Loading animation
│   │   ├── Logo.jsx                # Logo component
│   │   ├── Modal.jsx               # Modal dialog
│   │   ├── Select.jsx              # Dropdown select
│   │   └── Toast.jsx               # Toast notifications
│   │
│   ├── layout/
│   │   ├── Header.jsx              # Top header with user menu
│   │   ├── MainLayout.jsx          # Main layout wrapper
│   │   ├── MobileNav.jsx           # Mobile navigation
│   │   └── Sidebar.jsx             # Side navigation
│   │
│   ├── reports/
│   │   ├── DonutChart.jsx          # Donut/pie chart
│   │   ├── ProgressBar.jsx         # Progress bar
│   │   └── StatsCard.jsx           # Statistics card
│   │
│   └── tasks/
│       ├── TaskCard.jsx            # Task card display
│       ├── TaskDetailModal.jsx     # Task detail popup
│       ├── TaskForm.jsx            # Create/edit task form
│       └── TaskSubmitModal.jsx     # Submission modal
│
├── data/
│   └── constants.js                # App constants, enums
│
├── lib/
│   └── supabase.js                 # Supabase client config
│
├── pages/
│   ├── Contracts.jsx               # Contracts page (shared — all roles)
│   │
│   ├── manager/
│   │   ├── Approvals.jsx           # Approval queue page
│   │   ├── Documentation.jsx       # This documentation page
│   │   ├── Reports.jsx             # Reports & analytics
│   │   ├── Settings.jsx            # User settings
│   │   ├── TaskManagement.jsx      # Task CRUD page
│   │   └── Users.jsx               # User management (admin)
│   │
│   └── technician/
│       ├── Calendar.jsx            # Calendar view
│       ├── Dashboard.jsx           # Technician dashboard
│       ├── Login.jsx               # Login page
│       ├── MyTasks.jsx             # Tasks & pool page
│       └── TaskHistory.jsx         # Completed tasks
│
├── providers/
│   └── DataProvider.jsx            # Data context provider
│
├── services/
│   ├── authService.js              # Authentication API
│   ├── categoryService.js          # Category CRUD API
│   ├── contractService.js          # Contract CRUD API
│   ├── index.js                    # Service exports
│   ├── locationService.js          # Location CRUD API
│   ├── settingsService.js          # Settings API
│   ├── supabase.js                 # Supabase instance
│   ├── taskService.js              # Task CRUD API
│   └── userService.js              # User CRUD API
│
├── store/
│   ├── authStore.js                # Auth state (Zustand)
│   ├── contractStore.js            # Contract state (Zustand)
│   ├── taskStore.js                # Task state (Zustand)
│   └── userStore.js                # User state (Zustand)
│
├── App.css                         # App styles
├── App.jsx                         # Main app with routes
├── index.css                       # Global styles + Tailwind
└── main.jsx                        # Entry point

docs/
├── Contracts.md                    # Contracts page documentation
└── TaskManagement.md               # Task Management page documentation

Root Files:
├── .env                            # Environment variables
├── .gitignore                      # Git ignore rules
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML entry point
├── package.json                    # Dependencies
├── postcss.config.js               # PostCSS config
├── README.md                       # Project readme
├── tailwind.config.js              # Tailwind CSS config
└── vite.config.js                  # Vite build config`}
            </CodeBlock>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key File Descriptions</h3>
              <div className="grid gap-3">
                {[
                  { file: 'App.jsx', desc: 'Main app component with React Router routes and layout' },
                  { file: 'main.jsx', desc: 'Entry point, renders App into DOM' },
                  { file: 'index.css', desc: 'Global styles with Tailwind directives' },
                  { file: 'data/constants.js', desc: 'TASK_STATUS, SUBMISSION_STATUS, USER_ROLES enums' },
                  { file: 'lib/supabase.js', desc: 'Supabase client with schema configuration' },
                  { file: 'store/authStore.js', desc: 'Zustand store for auth with localStorage persist' },
                  { file: 'store/taskStore.js', desc: 'Zustand store for tasks, categories, locations' },
                  { file: 'services/taskService.js', desc: 'All Supabase queries for task operations' },
                  { file: 'components/auth/ProtectedRoute.jsx', desc: 'Route guard checking auth and roles' },
                  { file: 'pages/technician/MyTasks.jsx', desc: 'Main technician page with pool and submissions' },
                  { file: 'pages/manager/Approvals.jsx', desc: 'Approval queue with risk acceptance' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 flex-shrink-0">
                      {item.file}
                    </code>
                    <span className="text-sm text-gray-600">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          PM System Documentation 
        </p>
      </div>
    </div>
  );
};

export default Documentation;