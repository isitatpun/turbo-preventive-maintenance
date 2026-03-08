import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  MapPin,
  Tag,
  Edit2,
  Trash2,
  MoreVertical,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import { TASK_STATUS, STATUS_LABELS, USER_ROLES } from '../data/constants';
import * as XLSX from 'xlsx';

// ── Recurring date generation ─────────────────────────────────────────────────
const DAY_OFFSET = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
const DAY_ORDER  = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL  = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

function generateRecurringDates(startDate, endDate, frequency, weekDays = [], dayOfMonth = null, monthOfYear = null, dayOfYear = null, startMonth = null) {
  const dates = [];
  const start = new Date(startDate + 'T00:00:00');
  const end   = new Date(endDate   + 'T00:00:00');
  if (start > end) return dates;

  if (frequency === 'weekly' || frequency === 'bi-weekly') {
    const step = frequency === 'bi-weekly' ? 2 : 1;
    const mondayOffset = (start.getDay() + 6) % 7; // days since Monday
    const anchor = new Date(start);
    anchor.setDate(start.getDate() - mondayOffset);
    let week = 0;
    while (anchor <= end) {
      if (week % step === 0) {
        for (const day of weekDays) {
          const d = new Date(anchor);
          d.setDate(anchor.getDate() + DAY_OFFSET[day]);
          if (d >= start && d <= end) dates.push(d.toISOString().split('T')[0]);
        }
      }
      anchor.setDate(anchor.getDate() + 7);
      week++;
    }
    dates.sort();
  } else if (frequency === 'monthly' || frequency === 'quarterly' || frequency === 'half-yearly') {
    const step = frequency === 'quarterly' ? 3 : frequency === 'half-yearly' ? 6 : 1;
    const origDay = (dayOfMonth && dayOfMonth >= 1 && dayOfMonth <= 31) ? dayOfMonth : start.getDate();
    let yr = start.getFullYear(), mo = start.getMonth();
    // For quarterly/half-yearly: advance to first month that aligns with the chosen startMonth anchor
    if (step > 1 && startMonth && startMonth >= 1 && startMonth <= 12) {
      const anchorMo = (startMonth - 1 + 12) % 12;
      while ((mo - anchorMo + 12) % step !== 0) {
        mo++; if (mo > 11) { mo = 0; yr++; }
      }
    }
    while (true) {
      const dim = new Date(yr, mo + 1, 0).getDate();
      const d = new Date(yr, mo, Math.min(origDay, dim));
      if (d > end) break;
      if (d >= start) dates.push(d.toISOString().split('T')[0]);
      mo += step; if (mo > 11) { yr += Math.floor(mo / 12); mo = mo % 12; }
    }
  } else if (frequency === 'yearly') {
    const origMo  = (monthOfYear && monthOfYear >= 1 && monthOfYear <= 12) ? monthOfYear - 1 : start.getMonth();
    const origDay = (dayOfYear   && dayOfYear   >= 1 && dayOfYear   <= 31) ? dayOfYear        : start.getDate();
    let yr = start.getFullYear();
    while (true) {
      const dim = new Date(yr, origMo + 1, 0).getDate();
      const d = new Date(yr, origMo, Math.min(origDay, dim));
      if (d > end) break;
      if (d >= start) dates.push(d.toISOString().split('T')[0]);
      yr++;
    }
  }
  return dates;
}

const Tasks = () => {
  const { user, getEffectiveRole } = useAuthStore();
  const isTechnician = getEffectiveRole() === USER_ROLES.TECHNICIAN;
  const {
    tasks,
    categories,
    locations,
    isLoading,
    error,
    fetchAll,
    createTask,
    bulkCreateTasks,
    updateTask,
    deleteTask,
    acknowledgeRejectedTask,
    clearError
  } = useTaskStore();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [showStatusGuide, setShowStatusGuide] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    locationId: '',
    dueDate: ''
  });

  // Recurring state
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringForm, setRecurringForm] = useState({
    frequency: 'weekly',
    startDate: '',
    endDate: '',
    weekDays: ['mon'],
    dayOfMonth: 1,
    monthOfYear: 1,
    dayOfYear: 1,
    startMonth: 1
  });

  // Bulk form state
  const [bulkForm, setBulkForm] = useState({
    excelFile: null,
    fileName: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 2026; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  };

  const filteredTasks = tasks.filter(task => {
    // Technicians: see their own requested, open, and rejected tasks
    if (isTechnician) {
      return task.createdBy === user.id &&
        [TASK_STATUS.REQUESTED, TASK_STATUS.OPEN, TASK_STATUS.REJECTED].includes(task.status);
    }
    // Managers: exclude requested tasks (handled in Approvals)
    if (task.status === TASK_STATUS.REQUESTED) return false;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || task.categoryId === filterCategory;
    const taskYear = task.dueDate ? new Date(task.dueDate).getFullYear().toString() : '';
    const matchesYear = filterYear === 'all' || taskYear === filterYear;
    return matchesSearch && matchesStatus && matchesCategory && matchesYear;
  });

  const getStatusColor = (status) => {
    const colors = {
      [TASK_STATUS.REQUESTED]: 'bg-orange-100 text-orange-700',
      [TASK_STATUS.OPEN]: 'bg-blue-100 text-blue-700',
      [TASK_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-700',
      [TASK_STATUS.PENDING_APPROVAL]: 'bg-purple-100 text-purple-700',
      [TASK_STATUS.COMPLETED]: 'bg-green-100 text-green-700',
      [TASK_STATUS.ISSUE]: 'bg-red-100 text-red-700',
      [TASK_STATUS.SKIPPED]: 'bg-gray-100 text-gray-700',
      [TASK_STATUS.REJECTED]: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.categoryId) throw new Error('Category is required');
      if (!formData.locationId) throw new Error('Location is required');

      // Recurring create (manager only, new tasks only)
      if (recurringEnabled && !editingTask) {
        if (!recurringForm.startDate) throw new Error('Start date is required');
        if (!recurringForm.endDate) throw new Error('End date is required');
        if (['weekly', 'bi-weekly'].includes(recurringForm.frequency) && recurringForm.weekDays.length === 0)
          throw new Error('Select at least one day of the week');
        if (recurringDates.length === 0) throw new Error('No dates generated — check your date range and settings');
        if (recurringDates.length > 365) throw new Error(`Too many tasks (${recurringDates.length}). Please reduce the date range.`);

        const tasksToCreate = recurringDates.map(date => ({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          categoryId: formData.categoryId,
          locationId: formData.locationId,
          dueDate: date,
          createdBy: user.id,
          status: TASK_STATUS.OPEN
        }));

        await bulkCreateTasks(tasksToCreate);
        setSuccessMessage(`${tasksToCreate.length} recurring tasks created`);
        handleCloseModal();
        return;
      }

      // Single task
      if (!formData.dueDate) throw new Error('Due date is required');

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        categoryId: formData.categoryId,
        locationId: formData.locationId,
        dueDate: formData.dueDate,
        createdBy: user.id,
        status: isTechnician ? TASK_STATUS.REQUESTED : TASK_STATUS.OPEN
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        setSuccessMessage('Task updated successfully');
      } else {
        await createTask(taskData);
        setSuccessMessage(isTechnician ? 'Task request submitted — awaiting manager approval' : 'Task created successfully');
      }

      handleCloseModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Task Title': 'Example: Daily HVAC Inspection',
        'Description': 'Optional description',
        'Category': categories[0]?.name || '',
        'Location': locations[0]?.name || '',
        'Due Date': '2024-12-31'
      }
    ];

    const guidanceData = [
      { Field: 'Task Title', Description: 'Required. The name of the task', Example: 'Daily HVAC Check' },
      { Field: 'Description', Description: 'Optional. Additional details about the task', Example: 'Check temperature and filters' },
      { Field: 'Category', Description: 'Required. Use exact category name from Categories list', Example: categories[0]?.name || 'HVAC' },
      { Field: 'Location', Description: 'Required. Use exact location name from Locations list', Example: locations[0]?.name || 'Building A' },
      { Field: 'Due Date', Description: 'Required. Format: YYYY-MM-DD', Example: '2024-12-31' },
    ];

    const categoriesData = categories.map(cat => ({
      'Category Name': cat.name,
      'Description': `Use "${cat.name}" in Excel`
    }));

    const locationsData = locations.map(loc => ({
      'Location Name': loc.name,
      'Building': loc.building || '-',
      'Description': `Use "${loc.name}" in Excel`
    }));

    const wb = XLSX.utils.book_new();
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    const wsGuidance = XLSX.utils.json_to_sheet(guidanceData);
    const wsCategories = XLSX.utils.json_to_sheet(categoriesData);
    const wsLocations = XLSX.utils.json_to_sheet(locationsData);

    wsTemplate['!cols'] = [
      { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }
    ];
    wsGuidance['!cols'] = [{ wch: 20 }, { wch: 50 }, { wch: 30 }];
    wsCategories['!cols'] = [{ wch: 30 }, { wch: 50 }];
    wsLocations['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 50 }];

    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Task Template');
    XLSX.utils.book_append_sheet(wb, wsGuidance, 'How to Fill');
    XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories List');
    XLSX.utils.book_append_sheet(wb, wsLocations, 'Locations List');

    XLSX.writeFile(wb, `Task_Bulk_Upload_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!validTypes.includes(file.type)) {
        setFormError('Please upload a valid Excel file (.xlsx or .xls)');
        return;
      }

      setBulkForm({
        excelFile: file,
        fileName: file.name
      });
      setFormError('');
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!bulkForm.excelFile) {
        throw new Error('Please upload an Excel file');
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            throw new Error('Excel file is empty');
          }

          const tasksToCreate = [];
          const errors = [];

          jsonData.forEach((row, index) => {
            const rowNum = index + 2; // row 1 = header, so data starts at row 2

            try {
              if (!row['Task Title'] || !row['Task Title'].toString().trim()) {
                errors.push(`Row ${rowNum}: Task Title is required`);
                return;
              }

              if (!row['Category'] || !row['Category'].toString().trim()) {
                errors.push(`Row ${rowNum}: Category is required`);
                return;
              }

              if (!row['Location'] || !row['Location'].toString().trim()) {
                errors.push(`Row ${rowNum}: Location is required`);
                return;
              }

              if (!row['Due Date']) {
                errors.push(`Row ${rowNum}: Due Date is required`);
                return;
              }

              const categoryName = row['Category'].toString().trim();
              const category = categories.find(
                cat => cat.name.toLowerCase() === categoryName.toLowerCase()
              );

              if (!category) {
                errors.push(`Row ${rowNum}: Category "${categoryName}" not found. Available: ${categories.map(c => c.name).join(', ')}`);
                return;
              }

              const locationName = row['Location'].toString().trim();
              const location = locations.find(
                loc => loc.name.toLowerCase() === locationName.toLowerCase()
              );

              if (!location) {
                errors.push(`Row ${rowNum}: Location "${locationName}" not found. Available: ${locations.map(l => l.name).join(', ')}`);
                return;
              }

              const dueDate = new Date(row['Due Date']);
              if (isNaN(dueDate.getTime())) {
                errors.push(`Row ${rowNum}: Invalid date format. Use YYYY-MM-DD`);
                return;
              }

              tasksToCreate.push({
                title: row['Task Title'].toString().trim(),
                description: row['Description'] ? row['Description'].toString().trim() : null,
                categoryId: category.id,
                locationId: location.id,
                dueDate: dueDate.toISOString().split('T')[0],
                createdBy: user.id
              });
            } catch (err) {
              errors.push(`Row ${rowNum}: ${err.message}`);
            }
          });

          if (errors.length > 0) {
            setFormError(`Found ${errors.length} error(s):\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
            setFormLoading(false);
            return;
          }

          if (tasksToCreate.length === 0) {
            throw new Error('No valid tasks found in Excel file');
          }

          await bulkCreateTasks(tasksToCreate);

          setSuccessMessage(`${tasksToCreate.length} tasks created successfully`);
          setShowBulkModal(false);
          setBulkForm({
            excelFile: null,
            fileName: ''
          });
        } catch (err) {
          setFormError(err.message);
        } finally {
          setFormLoading(false);
        }
      };

      reader.onerror = () => {
        setFormError('Failed to read Excel file');
        setFormLoading(false);
      };

      reader.readAsArrayBuffer(bulkForm.excelFile);
    } catch (err) {
      setFormError(err.message);
      setFormLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    setFormLoading(true);
    try {
      await deleteTask(taskId);
      setSuccessMessage('Task deleted successfully');
      setShowDeleteConfirm(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (task) => {
    // SECURITY: Prevent opening edit modal if task is completed
    if (task.status === TASK_STATUS.COMPLETED) return;

    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      categoryId: task.categoryId,
      locationId: task.locationId,
      dueDate: task.dueDate
    });
    setFormError('');
    setShowModal(true);
    setActionMenu(null);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      categoryId: categories[0]?.id || '',
      locationId: locations[0]?.id || '',
      dueDate: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormError('');
    setRecurringEnabled(false);
    setRecurringForm({ frequency: 'weekly', startDate: '', endDate: '', weekDays: ['mon'], dayOfMonth: 1 });
  };

  // Compute preview dates whenever recurring form changes
  const recurringDates = (
    recurringEnabled &&
    !editingTask &&
    recurringForm.startDate &&
    recurringForm.endDate &&
    (['monthly', 'quarterly', 'half-yearly', 'yearly'].includes(recurringForm.frequency) || recurringForm.weekDays.length > 0)
  )
    ? generateRecurringDates(recurringForm.startDate, recurringForm.endDate, recurringForm.frequency, recurringForm.weekDays, recurringForm.dayOfMonth, recurringForm.monthOfYear, recurringForm.dayOfYear, recurringForm.startMonth)
    : [];

  const toggleWeekDay = (day) => {
    setRecurringForm(prev => ({
      ...prev,
      weekDays: prev.weekDays.includes(day)
        ? prev.weekDays.filter(d => d !== day)
        : [...prev.weekDays, day]
    }));
  };

  const handleAcknowledgeRejected = async (taskId) => {
    setFormLoading(true);
    try {
      await acknowledgeRejectedTask(taskId);
      setSuccessMessage('Request acknowledged and removed');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isTechnician ? 'Task Requests' : 'Task Management'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isTechnician
              ? 'Submit task requests — manager approval required before tasks go live'
              : 'Create and manage maintenance tasks'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isTechnician && (
            <button
              onClick={() => setShowStatusGuide(v => !v)}
              className={`btn-secondary gap-2 ${showStatusGuide ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
            >
              <Info className="w-4 h-4" />
              Status Guide
            </button>
          )}
          {!isTechnician && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="btn-secondary"
            >
              <Calendar className="w-5 h-5" />
              Bulk Create
            </button>
          )}
          <button onClick={handleAddNew} className="btn-primary">
            <Plus className="w-5 h-5" />
            {isTechnician ? 'Request Task' : 'Add Task'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700 font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status Guide */}
      {showStatusGuide && !isTechnician && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-5">
            <Info className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Task Status Flow</h3>
          </div>

          {/* Flow A: Manager creates */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Flow A — Manager creates task</p>
            <div className="overflow-x-auto pb-1">
              <div className="flex items-center gap-1 min-w-max">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-1.5">Manager creates</span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Open</span>
                </div>
                <span className="text-gray-300 text-lg mx-1">→</span>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-1.5">Technician claims</span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">In Progress</span>
                </div>
                <span className="text-gray-300 text-lg mx-1">→</span>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-1.5">Technician submits</span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Pending Approval</span>
                </div>
                <span className="text-gray-300 text-lg mx-1">→</span>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-xs text-gray-400 mb-0.5">Manager approves as</span>
                  <div className="flex gap-1.5">
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completed</span>
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Issue</span>
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Skipped</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flow B: Technician requests */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Flow B — Technician requests task</p>
            <div className="overflow-x-auto pb-1">
              <div className="flex items-center gap-1 min-w-max">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-1.5">Technician requests</span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Requested</span>
                </div>
                <span className="text-gray-300 text-lg mx-2">→</span>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-xs text-gray-400 mb-0.5">Manager reviews</span>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Open</span>
                      <span className="text-xs text-green-600 font-medium">✓ Approved → enters pool</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rejected</span>
                      <span className="text-xs text-red-500 font-medium">✗ Technician acknowledges → deleted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-4 border-t border-gray-100 grid sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex-shrink-0 mt-0.5">↺ Reset</span>
              <p className="text-xs text-gray-600">Manager rejects a submission → task resets to <strong>Open</strong> with a new due date for reassignment</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex-shrink-0 mt-0.5">Pool</span>
              <p className="text-xs text-gray-600">Unclaimed <strong>Open</strong> tasks (including overdue) stay in the pool until a technician claims them</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {!isTechnician && (
            <>
              {/* Year Filter */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
              >
                <option value="all">All Years</option>
                {getYearOptions().map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
              >
                <option value="all">All Status</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Status Summary Cards — manager only */}
      {!isTechnician && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { status: TASK_STATUS.OPEN,             label: 'Open',            bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100' },
            { status: TASK_STATUS.IN_PROGRESS,      label: 'In Progress',     bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100' },
            { status: TASK_STATUS.PENDING_APPROVAL, label: 'Pending',         bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
            { status: TASK_STATUS.COMPLETED,        label: 'Completed',       bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100' },
            { status: TASK_STATUS.ISSUE,            label: 'Issue',           bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100' },
            { status: TASK_STATUS.SKIPPED,          label: 'Skipped',         bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200' },
          ].map(({ status, label, bg, text, border }) => {
            const count = filteredTasks.filter(t => t.status === status).length;
            return (
              <div key={status} className={`${bg} border ${border} rounded-xl p-3 text-center`}>
                <p className={`text-2xl font-bold ${text}`}>{count}</p>
                <p className={`text-xs font-medium ${text} mt-0.5`}>{label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">{isTechnician ? 'No task requests yet' : 'No tasks found'}</p>
            <button onClick={handleAddNew} className="mt-4 text-primary-600 font-medium hover:underline">
              {isTechnician ? 'Submit your first request' : 'Create your first task'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Task</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Location</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Due Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500">#{task.runNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: task.category?.color || '#6B7280' }}
                        />
                        <span className="text-sm text-gray-600">
                          {task.category?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {task.location?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(task.dueDate)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {isTechnician && task.status === TASK_STATUS.OPEN ? 'Approved' : (STATUS_LABELS[task.status] || task.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        {isTechnician && task.status === TASK_STATUS.REJECTED ? (
                          <button
                            onClick={() => handleAcknowledgeRejected(task.id)}
                            disabled={formLoading}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                setActionMenu(actionMenu === task.id ? null : task.id);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>

                            {actionMenu === task.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                                <div className="fixed z-50 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in"
                                  style={{ top: menuPosition.top, right: menuPosition.right }}>
                                  {!isTechnician && task.status !== TASK_STATUS.COMPLETED && (
                                    <button
                                      onClick={() => handleEdit(task)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      Edit Task
                                    </button>
                                  )}
                                  {isTechnician && task.status === TASK_STATUS.REQUESTED && (
                                    <button
                                      onClick={() => handleEdit(task)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      Edit Request
                                    </button>
                                  )}
                                  {(!isTechnician && task.status === TASK_STATUS.OPEN) ||
                                   (isTechnician && task.status === TASK_STATUS.REQUESTED) ? (
                                    <button
                                      onClick={() => {
                                        setShowDeleteConfirm(task.id);
                                        setActionMenu(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      {isTechnician ? 'Cancel Request' : 'Delete Task'}
                                    </button>
                                  ) : null}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTask
                    ? (isTechnician ? 'Edit Request' : 'Edit Task')
                    : (isTechnician ? 'Request New Task' : 'Create New Task')}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  className="input"
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description (optional)"
                  rows={3}
                  className="input resize-none"
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location *
                  </label>
                  <select
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  >
                    <option value="">Select location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recurring toggle (manager, new tasks only) */}
              {!isTechnician && !editingTask && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Recurring Task</p>
                    <p className="text-xs text-gray-500 mt-0.5">Auto-create tasks on a schedule</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecurringEnabled(v => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${recurringEnabled ? 'bg-primary-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${recurringEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              )}

              {/* Due Date — one-time */}
              {!recurringEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  />
                </div>
              )}

              {/* Recurring settings */}
              {recurringEnabled && !editingTask && (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Frequency *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[['weekly', 'Weekly'], ['bi-weekly', 'Bi-weekly'], ['monthly', 'Monthly'], ['quarterly', 'Quarterly'], ['half-yearly', 'Half-Yearly'], ['yearly', 'Yearly']].map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRecurringForm(p => ({ ...p, frequency: val }))}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-all ${recurringForm.frequency === val ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start / End Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
                      <input
                        type="date"
                        value={recurringForm.startDate}
                        onChange={(e) => setRecurringForm(p => ({ ...p, startDate: e.target.value }))}
                        className="input text-sm"
                        disabled={formLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Date *</label>
                      <input
                        type="date"
                        value={recurringForm.endDate}
                        min={recurringForm.startDate}
                        onChange={(e) => setRecurringForm(p => ({ ...p, endDate: e.target.value }))}
                        className="input text-sm"
                        disabled={formLoading}
                      />
                    </div>
                  </div>

                  {/* Day picker for weekly / bi-weekly */}
                  {(recurringForm.frequency === 'weekly' || recurringForm.frequency === 'bi-weekly') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Days of the Week *</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {DAY_ORDER.map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWeekDay(day)}
                            className={`w-10 h-10 text-xs font-semibold rounded-lg border transition-all ${recurringForm.weekDays.includes(day) ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
                          >
                            {DAY_LABEL[day]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Day of month picker */}
                  {['monthly', 'quarterly', 'half-yearly'].includes(recurringForm.frequency) && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Day of Month (1–31) *</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={recurringForm.dayOfMonth}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(31, parseInt(e.target.value) || 1));
                          setRecurringForm(p => ({ ...p, dayOfMonth: val }));
                        }}
                        className="input text-sm w-28"
                        disabled={formLoading}
                      />
                      {/* Start from month — quarterly / half-yearly only */}
                      {(recurringForm.frequency === 'quarterly' || recurringForm.frequency === 'half-yearly') && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Start from Month (1–12) *</label>
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={recurringForm.startMonth}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(12, parseInt(e.target.value) || 1));
                              setRecurringForm(p => ({ ...p, startMonth: val }));
                            }}
                            className="input text-sm w-28"
                            disabled={formLoading}
                          />
                        </div>
                      )}

                      <p className="text-xs text-blue-700 mt-1.5">
                        {recurringForm.frequency === 'monthly' && <>Repeats on day <strong>{recurringForm.dayOfMonth}</strong> of every month</>}
                        {recurringForm.frequency === 'quarterly' && <>Repeats every 3 months starting <strong>{new Date(2000, recurringForm.startMonth - 1, 1).toLocaleDateString('en-GB', { month: 'long' })}</strong>, on day <strong>{recurringForm.dayOfMonth}</strong></>}
                        {recurringForm.frequency === 'half-yearly' && <>Repeats every 6 months starting <strong>{new Date(2000, recurringForm.startMonth - 1, 1).toLocaleDateString('en-GB', { month: 'long' })}</strong>, on day <strong>{recurringForm.dayOfMonth}</strong></>}
                      </p>
                    </div>
                  )}

                  {/* Yearly — month + day picker */}
                  {recurringForm.frequency === 'yearly' && (
                    <div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Month (1–12) *</label>
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={recurringForm.monthOfYear}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(12, parseInt(e.target.value) || 1));
                              setRecurringForm(p => ({ ...p, monthOfYear: val }));
                            }}
                            className="input text-sm"
                            disabled={formLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Day (1–31) *</label>
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={recurringForm.dayOfYear}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(31, parseInt(e.target.value) || 1));
                              setRecurringForm(p => ({ ...p, dayOfYear: val }));
                            }}
                            className="input text-sm"
                            disabled={formLoading}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 mt-1.5">
                        Repeats every year on <strong>
                          {new Date(2000, recurringForm.monthOfYear - 1, recurringForm.dayOfYear).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                        </strong>
                      </p>
                    </div>
                  )}

                  {/* Preview */}
                  {recurringDates.length > 0 && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${recurringDates.length > 365 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      Will create <strong className="mx-1">{recurringDates.length}</strong> tasks
                      {recurringDates.length > 365 && ' — too many, reduce range'}
                    </div>
                  )}
                  {recurringEnabled && recurringForm.startDate && recurringForm.endDate && recurringDates.length === 0 && (
                    <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
                      No dates match the current settings
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn-secondary"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingTask ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingTask ? 'Update' : (isTechnician ? 'Submit Request' : recurringEnabled ? `Create ${recurringDates.length || ''} Tasks`.trim() : 'Create Task')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Create Modal with Excel Upload */}
      {showBulkModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Bulk Create Tasks</h2>
                  <p className="text-sm text-gray-500 mt-1">Upload Excel file to create multiple tasks at once</p>
                </div>
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkForm({ excelFile: null, fileName: '' });
                    setFormError('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleBulkCreate} className="p-6 space-y-6">
              {/* Step 1: Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">Download Excel Template</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download the template with guidance on how to fill in the data correctly
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Available Categories & Locations Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categories */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Available Categories</h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm font-medium text-gray-900 flex-1">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-700">
                        Type the exact <strong>Category Name</strong> in your Excel file (e.g., "HVAC", "Electrical")
                      </p>
                    </div>
                  </div>
                </div>

                {/* Locations */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Available Locations</h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {locations.map(loc => (
                      <div key={loc.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">{loc.name}</span>
                          {loc.building && (
                            <span className="text-xs text-gray-500 ml-2">({loc.building})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-700">
                        Type the exact <strong>Location Name</strong> in your Excel file (e.g., "Building A", "Rooftop")
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload File */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">Upload Completed Excel File</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Fill in the template and upload it here to create tasks
                    </p>

                    <div className="relative">
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="excel-upload"
                        disabled={formLoading}
                      />
                      <label
                        htmlFor="excel-upload"
                        className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50/50 transition-all cursor-pointer"
                      >
                        {bulkForm.fileName ? (
                          <>
                            <FileSpreadsheet className="w-8 h-8 text-green-500" />
                            <div className="text-center">
                              <p className="font-medium text-gray-900">{bulkForm.fileName}</p>
                              <p className="text-sm text-gray-500 mt-1">Click to change file</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div className="text-center">
                              <p className="font-medium text-gray-900">Click to upload Excel file</p>
                              <p className="text-sm text-gray-500 mt-1">Supports .xlsx and .xls files</p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-700 font-medium mb-1">Validation Error</p>
                      <pre className="text-xs text-red-600 whitespace-pre-wrap font-mono">{formError}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkForm({ excelFile: null, fileName: '' });
                    setFormError('');
                  }}
                  className="flex-1 btn-secondary"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={formLoading || !bulkForm.excelFile}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Create Tasks from Excel
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tasks;
