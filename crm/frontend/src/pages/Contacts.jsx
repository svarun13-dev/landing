import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsAPI } from '../services/api';
import { Plus, Search, Mail, Phone, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactModal from '../components/ContactModal';

const Contacts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await contactsAPI.getAll(params);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contactsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
    },
  });

  const filteredContacts = contacts?.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      hot: 'bg-red-500/20 text-red-400',
      warm: 'bg-yellow-500/20 text-yellow-400',
      cold: 'bg-blue-500/20 text-blue-400',
      unqualified: 'bg-grey-500/20 text-grey-400',
    };
    return colors[status] || colors.cold;
  };

  const getStatusIcon = (status) => {
    return status === 'hot' ? '🔥' : status === 'warm' ? '🌤' : '❄️';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-grey-400 mt-2">Manage your crypto project contacts and institutions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400" size={20} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select w-full md:w-48"
          >
            <option value="">All Status</option>
            <option value="hot">Hot 🔥</option>
            <option value="warm">Warm 🌤</option>
            <option value="cold">Cold ❄️</option>
            <option value="unqualified">Unqualified</option>
          </select>
        </div>
      </div>

      {/* Contacts List */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12 text-grey-400">Loading contacts...</div>
        ) : filteredContacts?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-700">
                  <th className="text-left py-3 px-4 text-grey-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-grey-400 font-medium">Company</th>
                  <th className="text-left py-3 px-4 text-grey-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-grey-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-grey-400 font-medium">Contact</th>
                  <th className="text-left py-3 px-4 text-grey-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-grey-700/50 hover:bg-navy-700/50">
                    <td className="py-4 px-4">
                      <Link
                        to={`/contacts/${contact.id}`}
                        className="font-medium text-primary-400 hover:text-primary-300"
                      >
                        {contact.name}
                      </Link>
                      <p className="text-sm text-grey-400">{contact.role}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Building2 size={16} className="text-grey-400" />
                        <span>{contact.company || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize text-sm">
                        {contact.contact_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(contact.status)}`}>
                        {getStatusIcon(contact.status)} {contact.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col space-y-1 text-sm">
                        <div className="flex items-center space-x-2 text-grey-400">
                          <Mail size={14} />
                          <span>{contact.email}</span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center space-x-2 text-grey-400">
                            <Phone size={14} />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => deleteMutation.mutate(contact.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-grey-400">
            No contacts found. Create your first contact!
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {isModalOpen && (
        <ContactModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries(['contacts']);
          }}
        />
      )}
    </div>
  );
};

export default Contacts;
