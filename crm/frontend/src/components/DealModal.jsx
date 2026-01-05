import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { dealsAPI, contactsAPI } from '../services/api';
import { X } from 'lucide-react';

const DealModal = ({ deal = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: deal?.title || '',
    description: deal?.description || '',
    stage: deal?.stage || 'prospect',
    probability: deal?.probability || 0,
    expected_close_date: deal?.expected_close_date
      ? new Date(deal.expected_close_date).toISOString().split('T')[0]
      : '',
    contact_id: deal?.contact_id || '',
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await contactsAPI.getAll();
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        probability: parseInt(data.probability) || 0,
        contact_id: parseInt(data.contact_id),
        expected_close_date: data.expected_close_date || null,
      };

      return deal ? dealsAPI.update(deal.id, payload) : dealsAPI.create(payload);
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => dealsAPI.delete(deal.id),
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
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {deal ? 'Edit Deal' : 'Add New Deal'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="Partnership deal with Protocol X"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input w-full resize-none"
              placeholder="Details about the deal..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Contact *</label>
              <select
                name="contact_id"
                value={formData.contact_id}
                onChange={handleChange}
                required
                className="select w-full"
              >
                <option value="">Select contact...</option>
                {contacts?.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.company} {contact.name ? `- ${contact.name}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Stage</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="prospect">Prospect</option>
                <option value="interested">Interested</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Confidence (0-100%)
              </label>
              <input
                type="range"
                name="probability"
                value={formData.probability}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full"
              />
              <div className="text-center text-sm text-text-muted mt-1">
                {formData.probability}%
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Expected Close Date
              </label>
              <input
                type="date"
                name="expected_close_date"
                value={formData.expected_close_date}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {deal && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this deal?')) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Delete Deal
                </button>
              )}
            </div>
            <div className="flex space-x-4">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={mutation.isLoading}>
                {mutation.isLoading ? 'Saving...' : deal ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealModal;
