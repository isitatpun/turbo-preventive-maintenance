import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Settings as SettingsIcon,
  Building2,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Palette
} from 'lucide-react';
import useTaskStore from '../../store/taskStore';

const Settings = () => {
  const { 
    categories, 
    locations, 
    isLoading,
    fetchCategories,
    fetchLocations,
    addCategory, 
    updateCategory, 
    deleteCategory,
    addLocation,
    updateLocation,
    deleteLocation
  } = useTaskStore();

  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'category' or 'location'
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    code: '',
    color: '#3B82F6',
    description: ''
  });

  // Location form
  const [locationForm, setLocationForm] = useState({
    name: '',
    code: '',
    building: '',
    floor: '',
    zone: '',
    description: ''
  });

  // Fetch data on mount
  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  // Clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Color options
  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#14B8A6', '#6B7280', '#F97316', '#06B6D4'
  ];

  // Open modal for new item
  const handleAddNew = (type) => {
    setModalType(type);
    setEditingItem(null);
    setFormError('');
    
    if (type === 'category') {
      setCategoryForm({ name: '', code: '', color: '#3B82F6', description: '' });
    } else {
      setLocationForm({ name: '', code: '', building: '', floor: '', zone: '', description: '' });
    }
    
    setShowModal(true);
  };

  // Open modal for edit
  const handleEdit = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    setFormError('');
    
    if (type === 'category') {
      setCategoryForm({
        name: item.name,
        code: item.code || '',
        color: item.color || '#3B82F6',
        description: item.description || ''
      });
    } else {
      setLocationForm({
        name: item.name,
        code: item.code || '',
        building: item.building || '',
        floor: item.floor || '',
        zone: item.zone || '',
        description: item.description || ''
      });
    }
    
    setShowModal(true);
  };

  // Handle category submit
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!categoryForm.name.trim()) {
        throw new Error('Category name is required');
      }

      if (editingItem) {
        await updateCategory(editingItem.id, categoryForm);
        setSuccessMessage('Category updated successfully');
      } else {
        await addCategory(categoryForm);
        setSuccessMessage('Category created successfully');
      }

      setShowModal(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle location submit
  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!locationForm.name.trim()) {
        throw new Error('Location name is required');
      }

      if (editingItem) {
        await updateLocation(editingItem.id, locationForm);
        setSuccessMessage('Location updated successfully');
      } else {
        await addLocation(locationForm);
        setSuccessMessage('Location created successfully');
      }

      setShowModal(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setFormLoading(true);
    try {
      if (showDeleteConfirm.type === 'category') {
        await deleteCategory(showDeleteConfirm.id);
        setSuccessMessage('Category deleted successfully');
      } else {
        await deleteLocation(showDeleteConfirm.id);
        setSuccessMessage('Location deleted successfully');
      }
      setShowDeleteConfirm(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage categories and locations</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700 font-medium">{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'categories'
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Categories
              {activeTab === 'categories' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'locations'
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Locations
              {activeTab === 'locations' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : activeTab === 'categories' ? (
            /* Categories Tab */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Task Categories</h3>
                <button
                  onClick={() => handleAddNew('category')}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              <div className="grid gap-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Building2 className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-500">
                          {category.code && `Code: ${category.code}`}
                          {category.description && ` • ${category.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit('category', category)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm({ type: 'category', id: category.id, name: category.name })}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No categories found. Add your first category.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Locations Tab */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Locations</h3>
                <button
                  onClick={() => handleAddNew('location')}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Location
                </button>
              </div>

              <div className="grid gap-3">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{location.name}</p>
                        <p className="text-sm text-gray-500">
                          {[location.building, location.floor, location.zone]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit('location', location)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm({ type: 'location', id: location.id, name: location.name })}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}

                {locations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No locations found. Add your first location.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} {modalType === 'category' ? 'Category' : 'Location'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {modalType === 'category' ? (
              <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g., HVAC"
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Code
                  </label>
                  <input
                    type="text"
                    value={categoryForm.code}
                    onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., HVAC"
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, color })}
                        className={`w-8 h-8 rounded-lg transition-transform ${
                          categoryForm.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        disabled={formLoading}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={3}
                    className="input resize-none"
                    disabled={formLoading}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                        Saving...
                      </>
                    ) : (
                      editingItem ? 'Update Category' : 'Add Category'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLocationSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={locationForm.name}
                    onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                    placeholder="e.g., Main Building - Floor 1"
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Code
                    </label>
                    <input
                      type="text"
                      value={locationForm.code}
                      onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., MB-F1"
                      className="input"
                      disabled={formLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Building
                    </label>
                    <input
                      type="text"
                      value={locationForm.building}
                      onChange={(e) => setLocationForm({ ...locationForm, building: e.target.value })}
                      placeholder="e.g., Main Building"
                      className="input"
                      disabled={formLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={locationForm.floor}
                      onChange={(e) => setLocationForm({ ...locationForm, floor: e.target.value })}
                      placeholder="e.g., 1"
                      className="input"
                      disabled={formLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Zone
                    </label>
                    <input
                      type="text"
                      value={locationForm.zone}
                      onChange={(e) => setLocationForm({ ...locationForm, zone: e.target.value })}
                      placeholder="e.g., Zone A"
                      className="input"
                      disabled={formLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={locationForm.description}
                    onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={3}
                    className="input resize-none"
                    disabled={formLoading}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                        Saving...
                      </>
                    ) : (
                      editingItem ? 'Update Location' : 'Add Location'
                    )}
                  </button>
                </div>
              </form>
            )}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete {showDeleteConfirm.type === 'category' ? 'Category' : 'Location'}
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
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
                  onClick={handleDelete}
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

export default Settings;