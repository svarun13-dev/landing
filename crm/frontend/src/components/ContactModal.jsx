import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { contactsAPI } from '../services/api';
import { X } from 'lucide-react';

const ContactModal = ({ onClose, onSuccess, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    role: initialData?.role || '',
    telegram: initialData?.telegram || '',
    contact_type: initialData?.contact_type || 'other',
    status: initialData?.status || 'cold',
    source: initialData?.source || '',
    location: initialData?.location || '',
    timezone: initialData?.timezone || '',
  });

  const mutation = useMutation({
    mutationFn: (data) => initialData
      ? contactsAPI.update(initialData.id, data)
      : contactsAPI.create(data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {initialData ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wide">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Company *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wide">
              Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Contact Type</label>
                <select
                  name="contact_type"
                  value={formData.contact_type}
                  onChange={handleChange}
                  className="select w-full"
                >
                  <option value="defi_project">DeFi Project</option>
                  <option value="l1_l2_protocol">L1/L2 Protocol</option>
                  <option value="vc_fund">VC Fund</option>
                  <option value="exchange">Exchange</option>
                  <option value="institution">Institution</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="select w-full"
                >
                  <option value="hot">🔥 Hot</option>
                  <option value="warm">🌤 Warm</option>
                  <option value="cold">❄️ Cold</option>
                  <option value="unqualified">Unqualified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wide">
              Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Telegram</label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  placeholder="@username"
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wide">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Source</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="How did you meet?"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Timezone</label>
                <input
                  type="text"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  placeholder="UTC+0"
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
