import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  SkipForward,
  Image
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import useTaskStore from '../../store/taskStore';
import useAuthStore from '../../store/authStore';

const TaskSubmitModal = ({ isOpen, onClose, task }) => {
  const { user } = useAuthStore();
  const { submitTask } = useTaskStore();

  const [submitType, setSubmitType] = useState('normal'); // 'normal', 'issue', 'skip'
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [skipReason, setSkipReason] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (submitType === 'skip' && (!skipReason || !newDueDate)) {
      alert('Please provide skip reason and new due date');
      return;
    }

    if ((submitType === 'normal' || submitType === 'issue') && !photoPreview) {
      alert('Please upload a photo');
      return;
    }

    submitTask(task.id, {
      userId: user.id,
      status: submitType,
      photo: photoPreview,
      remarks,
      skipReason: submitType === 'skip' ? skipReason : null,
      newDueDate: submitType === 'skip' ? newDueDate : null
    });

    // Reset form
    setSubmitType('normal');
    setPhoto(null);
    setPhotoPreview(null);
    setRemarks('');
    setSkipReason('');
    setNewDueDate('');

    onClose();
  };

  const resetForm = () => {
    setSubmitType('normal');
    setPhoto(null);
    setPhotoPreview(null);
    setRemarks('');
    setSkipReason('');
    setNewDueDate('');
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Submit Task"
      size="md"
    >
      <div className="space-y-6">
        {/* Task Info */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}
        </div>

        {/* Submit Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Submission Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSubmitType('normal')}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                submitType === 'normal'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${
                submitType === 'normal' ? 'text-emerald-500' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                submitType === 'normal' ? 'text-emerald-700' : 'text-gray-600'
              }`}>
                Complete
              </span>
            </button>

            <button
              onClick={() => setSubmitType('issue')}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                submitType === 'issue'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <AlertTriangle className={`w-6 h-6 mx-auto mb-2 ${
                submitType === 'issue' ? 'text-red-500' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                submitType === 'issue' ? 'text-red-700' : 'text-gray-600'
              }`}>
                Issue Found
              </span>
            </button>

            <button
              onClick={() => setSubmitType('skip')}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                submitType === 'skip'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <SkipForward className={`w-6 h-6 mx-auto mb-2 ${
                submitType === 'skip' ? 'text-amber-500' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                submitType === 'skip' ? 'text-amber-700' : 'text-gray-600'
              }`}>
                Skip
              </span>
            </button>
          </div>
        </div>

        {/* Photo Upload (for normal and issue) */}
        {submitType !== 'skip' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Evidence <span className="text-red-500">*</span>
            </label>
            
            {photoPreview ? (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-all"
              >
                <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Click to upload photo</p>
                <p className="text-sm text-gray-400 mt-1">JPG, PNG up to 10MB</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        )}

        {/* Remarks (for normal and issue) */}
        {submitType !== 'skip' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks {submitType === 'issue' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={submitType === 'issue' 
                ? "Describe the issue found..." 
                : "Add any notes or observations..."
              }
              rows={3}
              className="input"
            />
          </div>
        )}

        {/* Skip Reason and New Due Date */}
        {submitType === 'skip' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skip Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="Explain why this task cannot be completed..."
                rows={3}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reschedule To <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input"
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant={submitType === 'issue' ? 'danger' : submitType === 'skip' ? 'warning' : 'success'}
            className="flex-1"
            onClick={handleSubmit}
          >
            {submitType === 'skip' ? 'Skip Task' : 'Submit'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskSubmitModal;