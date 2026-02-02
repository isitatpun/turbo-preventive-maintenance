import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import useTaskStore from '../../store/taskStore';
import useAuthStore from '../../store/authStore';
import { FREQUENCY_TYPES } from '../../data/constants';

const TaskForm = ({ isOpen, onClose, task = null }) => {
  const { user } = useAuthStore();
  const { categories, locations, serviceTypes, createTask, updateTask } = useTaskStore();
  
  const isEditing = !!task;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    locationId: '',
    serviceTypeId: '',
    frequency: FREQUENCY_TYPES.MONTHLY,
    dueDate: '',
    priority: 'medium'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        categoryId: task.categoryId || '',
        locationId: task.locationId || '',
        serviceTypeId: task.serviceTypeId || '',
        frequency: task.frequency || FREQUENCY_TYPES.MONTHLY,
        dueDate: task.dueDate || '',
        priority: task.priority || 'medium'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        locationId: '',
        serviceTypeId: '',
        frequency: FREQUENCY_TYPES.MONTHLY,
        dueDate: '',
        priority: 'medium'
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.locationId) newErrors.locationId = 'Location is required';
    if (!formData.serviceTypeId) newErrors.serviceTypeId = 'Service type is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isEditing) {
      updateTask(task.id, formData);
    } else {
      createTask({
        ...formData,
        createdBy: user.id
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const locationOptions = locations.map(l => ({ value: l.id, label: `${l.name} (${l.building})` }));
  const serviceTypeOptions = serviceTypes.map(s => ({ value: s.id, label: s.name }));
  
  const frequencyOptions = Object.entries(FREQUENCY_TYPES).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase()
  }));

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      size="lg"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            isLoading={isSubmitting}
            icon={Save}
          >
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Title */}
        <Input
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title..."
          error={errors.title}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the task in detail..."
            rows={3}
            className={errors.description ? 'input-error' : 'input'}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            options={categoryOptions}
            placeholder="Select category"
            error={errors.categoryId}
          />
          <Select
            label="Location"
            name="locationId"
            value={formData.locationId}
            onChange={handleChange}
            options={locationOptions}
            placeholder="Select location"
            error={errors.locationId}
          />
        </div>

        {/* Service Type & Frequency */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Service Type"
            name="serviceTypeId"
            value={formData.serviceTypeId}
            onChange={handleChange}
            options={serviceTypeOptions}
            placeholder="Select service type"
            error={errors.serviceTypeId}
          />
          <Select
            label="Frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            options={frequencyOptions}
            placeholder="Select frequency"
          />
        </div>

        {/* Due Date & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={errors.dueDate ? 'input border-red-300' : 'input'}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.dueDate && (
              <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>
            )}
          </div>
          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
            placeholder="Select priority"
          />
        </div>
      </div>
    </Modal>
  );
};

export default TaskForm;