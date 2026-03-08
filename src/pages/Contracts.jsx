import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Phone,
  Mail,
  User,
  Ban,
  RefreshCw,
  ScrollText,
  MoreVertical
} from 'lucide-react';
import useContractStore from '../store/contractStore';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import { CONTRACT_STATUS, CONTRACT_STATUS_LABELS } from '../data/constants';

// ── Status helpers ──────────────────────────────────────────────────────────

const getComputedStatus = (contract) => {
  if (contract.status === 'cancelled') return CONTRACT_STATUS.CANCELLED;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(contract.endDate);
  end.setHours(0, 0, 0, 0);
  const twoMonthsLater = new Date(today);
  twoMonthsLater.setMonth(today.getMonth() + 2);
  if (end < today) return CONTRACT_STATUS.EXPIRED;
  if (end <= twoMonthsLater) return CONTRACT_STATUS.EXPIRING_SOON;
  return CONTRACT_STATUS.ACTIVE;
};

const getDaysUntilExpiry = (endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
};

const STATUS_STYLES = {
  [CONTRACT_STATUS.ACTIVE]:        'bg-green-100 text-green-700',
  [CONTRACT_STATUS.EXPIRING_SOON]: 'bg-yellow-100 text-yellow-700',
  [CONTRACT_STATUS.EXPIRED]:       'bg-red-100 text-red-700',
  [CONTRACT_STATUS.CANCELLED]:     'bg-gray-100 text-gray-500'
};

const STATUS_ICONS = {
  [CONTRACT_STATUS.ACTIVE]:        CheckCircle,
  [CONTRACT_STATUS.EXPIRING_SOON]: AlertTriangle,
  [CONTRACT_STATUS.EXPIRED]:       XCircle,
  [CONTRACT_STATUS.CANCELLED]:     Ban
};

// ── StatusBadge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const Icon = STATUS_ICONS[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
      <Icon className="w-3.5 h-3.5" />
      {CONTRACT_STATUS_LABELS[status]}
    </span>
  );
};

// ── Empty form ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  supplierName: '',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  contractValue: '',
  contactPerson: '',
  phone: '',
  email: '',
  notes: '',
  categoryId: ''
};

// ── Contracts page ───────────────────────────────────────────────────────────

const Contracts = () => {
  const { user } = useAuthStore();
  const {
    contracts,
    isLoading,
    error,
    fetchContracts,
    createContract,
    renewContract,
    cancelContract,
    clearError
  } = useContractStore();
  const { categories, fetchCategories } = useTaskStore();

  // UI state
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterStatus, setFilterStatus]     = useState('all');
  const [activeModal, setActiveModal]       = useState(null); // 'create' | 'detail' | 'renew' | 'cancel'
  const [selectedContract, setSelectedContract] = useState(null);
  const [actionMenu, setActionMenu]         = useState(null);
  const [menuPosition, setMenuPosition]     = useState({ top: 0, right: 0 });
  const [formLoading, setFormLoading]       = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError]           = useState('');

  // Form state
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [renewDates, setRenewDates] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchContracts();
    if (categories.length === 0) fetchCategories();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const getCategory = (categoryId) => categories.find(c => c.id === categoryId) || null;

  const contractsWithStatus = contracts.map(c => ({
    ...c,
    computedStatus: getComputedStatus(c),
    category: getCategory(c.categoryId)
  }));

  const filteredContracts = contractsWithStatus.filter(c => {
    const matchesSearch =
      c.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.computedStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const expiringSoonCount = contractsWithStatus.filter(
    c => c.computedStatus === CONTRACT_STATUS.EXPIRING_SOON
  ).length;
  const expiredCount = contractsWithStatus.filter(
    c => c.computedStatus === CONTRACT_STATUS.EXPIRED
  ).length;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const closeAll = () => {
    setActiveModal(null);
    setSelectedContract(null);
    setFormData(EMPTY_FORM);
    setRenewDates({ startDate: '', endDate: '' });
    setFormError('');
  };

  // ── Modal openers ─────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setFormData(EMPTY_FORM);
    setFormError('');
    setActiveModal('create');
  };

  const handleOpenDetail = (contract) => {
    setSelectedContract(contract);
    setActiveModal('detail');
  };

  const handleOpenRenew = (contract) => {
    setSelectedContract(contract);
    setRenewDates({ startDate: '', endDate: '' });
    setFormError('');
    setActiveModal('renew');
  };

  const handleOpenCancel = (contract) => {
    setSelectedContract(contract);
    setActiveModal('cancel');
  };

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (!formData.supplierName.trim()) throw new Error('Supplier name is required');
      if (!formData.startDate) throw new Error('Start date is required');
      if (!formData.endDate) throw new Error('End date is required');
      if (new Date(formData.endDate) <= new Date(formData.startDate))
        throw new Error('End date must be after start date');

      await createContract({ ...formData, createdBy: user.id });
      setSuccessMessage('Contract created successfully');
      closeAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRenew = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (!renewDates.startDate) throw new Error('New start date is required');
      if (!renewDates.endDate) throw new Error('New end date is required');
      if (new Date(renewDates.endDate) <= new Date(renewDates.startDate))
        throw new Error('End date must be after start date');

      await renewContract(selectedContract.id, renewDates.startDate, renewDates.endDate);
      setSuccessMessage('Contract renewed successfully');
      closeAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = async () => {
    setFormLoading(true);
    try {
      await cancelContract(selectedContract.id, user.id);
      setSuccessMessage('Contract cancelled');
      closeAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contracts</h1>
          <p className="text-gray-500 mt-1">Track and manage outsourced maintenance agreements</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus className="w-5 h-5" />
          New Contract
        </button>
      </div>

      {/* Alert Banners */}
      {expiredCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 font-medium">
            {expiredCount} contract{expiredCount > 1 ? 's have' : ' has'} expired — immediate action required.
          </span>
        </div>
      )}
      {expiringSoonCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <span className="text-yellow-700 font-medium">
            {expiringSoonCount} contract{expiringSoonCount > 1 ? 's are' : ' is'} expiring within 2 months.
          </span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700 font-medium">{successMessage}</span>
        </div>
      )}

      {/* Store Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters + Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Filter toolbar */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by supplier or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white text-sm"
            >
              <option value="all">All Status</option>
              {Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScrollText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No contracts found</p>
            <button onClick={handleOpenCreate} className="mt-4 text-primary-600 font-medium hover:underline">
              Create your first contract
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Supplier</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Contract Period</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Value</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContracts.map((contract) => {
                  const days = getDaysUntilExpiry(contract.endDate);
                  return (
                    <tr key={contract.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p
                          className="font-medium text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
                          onClick={() => handleOpenDetail(contract)}
                        >
                          {contract.supplierName}
                        </p>
                        {contract.computedStatus !== CONTRACT_STATUS.CANCELLED && (
                          <p className={`text-xs mt-0.5 ${
                            contract.computedStatus === CONTRACT_STATUS.EXPIRED ? 'text-red-500' : contract.computedStatus === CONTRACT_STATUS.EXPIRING_SOON ? 'text-yellow-600' : 'text-gray-400'
                          }`}>
                            {contract.computedStatus === CONTRACT_STATUS.EXPIRED
                              ? `Expired ${Math.abs(days)}d ago`
                              : contract.computedStatus === CONTRACT_STATUS.EXPIRING_SOON
                              ? `Expires in ${days}d`
                              : `${days}d remaining`}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {contract.category ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: contract.category.color || '#6B7280' }}
                            />
                            <span className="text-sm text-gray-600">{contract.category.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{formatDate(contract.startDate)} – {formatDate(contract.endDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{contract.contractValue || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={contract.computedStatus} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                            setActionMenu(actionMenu === contract.id ? null : contract.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Action Menu (fixed position to escape overflow clipping) ────── */}
      {actionMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
          <div
            className="fixed z-50 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1"
            style={{ top: menuPosition.top, right: menuPosition.right }}
          >
            {(() => {
              const contract = filteredContracts.find(c => c.id === actionMenu);
              if (!contract) return null;
              return (
                <>
                  <button
                    onClick={() => { setActionMenu(null); handleOpenDetail(contract); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                  {contract.computedStatus !== CONTRACT_STATUS.CANCELLED && (
                    <>
                      <button
                        onClick={() => { setActionMenu(null); handleOpenRenew(contract); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Renew Contract
                      </button>
                      <button
                        onClick={() => { setActionMenu(null); handleOpenCancel(contract); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cancel Contract
                      </button>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* ── Create Contract Modal ─────────────────────────────────────────── */}
      {activeModal === 'create' && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">New Contract</h2>
              <button onClick={closeAll} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Supplier Name *</label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="Legal or trade name of the vendor"
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  >
                    <option value="">No category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Scope of work, deliverables, SLA terms..."
                    rows={2}
                    className="input resize-none"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Contract Value</label>
                  <input
                    type="text"
                    value={formData.contractValue}
                    onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                    placeholder="e.g., 120,000 THB"
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Primary point of contact"
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+66 XX XXX XXXX"
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="supplier@example.com"
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Internal notes, special clauses, reminders..."
                    rows={2}
                    className="input resize-none"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeAll} className="flex-1 btn-secondary" disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary" disabled={formLoading}>
                  {formLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
                  ) : (
                    'Create Contract'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Contract Detail Modal ─────────────────────────────────────────── */}
      {activeModal === 'detail' && selectedContract && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedContract.supplierName}</h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={selectedContract.computedStatus} />
                  <button onClick={closeAll} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {selectedContract.category && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedContract.category.color || '#6B7280' }}
                  />
                  <span className="text-sm text-gray-600">{selectedContract.category.name}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Start Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedContract.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">End Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedContract.endDate)}</p>
                </div>
                {selectedContract.contractValue && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Contract Value</p>
                    <p className="font-medium text-gray-900">{selectedContract.contractValue}</p>
                  </div>
                )}
              </div>

              {selectedContract.description && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContract.description}</p>
                </div>
              )}

              {(selectedContract.contactPerson || selectedContract.phone || selectedContract.email) && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Supplier Contact</p>
                  {selectedContract.contactPerson && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      {selectedContract.contactPerson}
                    </div>
                  )}
                  {selectedContract.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selectedContract.phone}
                    </div>
                  )}
                  {selectedContract.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedContract.email}
                    </div>
                  )}
                </div>
              )}

              {selectedContract.notes && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContract.notes}</p>
                </div>
              )}

              {selectedContract.computedStatus === CONTRACT_STATUS.CANCELLED && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500">
                  Cancelled on {formatDate(selectedContract.cancelledAt)}
                </div>
              )}

              <div className="text-xs text-gray-400 pt-1">
                Created · {formatDate(selectedContract.createdAt)}
              </div>
            </div>

            {selectedContract.computedStatus !== CONTRACT_STATUS.CANCELLED && (
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => handleOpenCancel(selectedContract)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                >
                  <Ban className="w-4 h-4" />
                  Cancel Contract
                </button>
                <button
                  onClick={() => handleOpenRenew(selectedContract)}
                  className="flex-1 btn-primary"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renew Contract
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ── Renew Modal ───────────────────────────────────────────────────── */}
      {activeModal === 'renew' && selectedContract && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Renew Contract</h2>
              <button onClick={closeAll} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleRenew} className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Set new term dates for <strong>{selectedContract.supplierName}</strong>.
                This will overwrite the previous dates and reset the status to Active.
              </p>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Start Date *</label>
                <input
                  type="date"
                  value={renewDates.startDate}
                  onChange={(e) => setRenewDates({ ...renewDates, startDate: e.target.value })}
                  className="input"
                  disabled={formLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New End Date *</label>
                <input
                  type="date"
                  value={renewDates.endDate}
                  onChange={(e) => setRenewDates({ ...renewDates, endDate: e.target.value })}
                  className="input"
                  disabled={formLoading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeAll} className="flex-1 btn-secondary" disabled={formLoading}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={formLoading || !renewDates.startDate || !renewDates.endDate}
                >
                  {formLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Renewing...</>
                  ) : (
                    'Confirm Renewal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Cancel Confirmation ───────────────────────────────────────────── */}
      {activeModal === 'cancel' && selectedContract && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Contract</h3>
              <p className="text-gray-500 text-sm mb-1">
                This will permanently cancel the contract with{' '}
                <strong>{selectedContract.supplierName}</strong>.
              </p>
              <p className="text-red-600 text-sm font-medium mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeAll}
                  className="flex-1 btn-secondary"
                  disabled={formLoading}
                >
                  Keep Contract
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Cancelling...</>
                  ) : (
                    'Confirm Cancellation'
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

export default Contracts;
