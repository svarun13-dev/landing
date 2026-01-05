import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contactsAPI } from '../services/api';
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ContactDetail = () => {
  const { id } = useParams();

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      const response = await contactsAPI.getById(id);
      return response.data;
    },
  });

  const { data: deals } = useQuery({
    queryKey: ['contactDeals', id],
    queryFn: async () => {
      const response = await contactsAPI.getDeals(id);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: activities } = useQuery({
    queryKey: ['contactActivities', id],
    queryFn: async () => {
      const response = await contactsAPI.getActivities(id);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="text-center py-12 text-grey-400">Loading...</div>;
  }

  if (!contact) {
    return <div className="text-center py-12 text-grey-400">Contact not found</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      hot: 'bg-red-500/20 text-red-400',
      warm: 'bg-yellow-500/20 text-yellow-400',
      cold: 'bg-blue-500/20 text-blue-400',
    };
    return colors[status] || colors.cold;
  };

  return (
    <div className="space-y-6">
      <Link to="/contacts" className="flex items-center text-primary-400 hover:text-primary-300">
        <ArrowLeft size={20} className="mr-2" />
        Back to Contacts
      </Link>

      {/* Contact Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{contact.name}</h1>
            <p className="text-xl text-grey-400 mt-1">{contact.role}</p>
            {contact.company && (
              <p className="text-lg text-grey-300 mt-1">{contact.company}</p>
            )}

            <div className="flex items-center space-x-4 mt-4">
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(contact.status)}`}>
                {contact.status}
              </span>
              <span className="px-3 py-1 bg-navy-700 rounded-full text-sm capitalize">
                {contact.contact_type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-grey-700">
          {contact.email && (
            <div className="flex items-center space-x-3">
              <Mail size={18} className="text-grey-400" />
              <a href={`mailto:${contact.email}`} className="text-primary-400 hover:text-primary-300">
                {contact.email}
              </a>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center space-x-3">
              <Phone size={18} className="text-grey-400" />
              <a href={`tel:${contact.phone}`} className="text-grey-300">
                {contact.phone}
              </a>
            </div>
          )}

          {contact.location && (
            <div className="flex items-center space-x-3">
              <MapPin size={18} className="text-grey-400" />
              <span className="text-grey-300">{contact.location}</span>
            </div>
          )}

          {contact.created_at && (
            <div className="flex items-center space-x-3">
              <Calendar size={18} className="text-grey-400" />
              <span className="text-grey-300">
                Added {format(new Date(contact.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        {(contact.telegram || contact.twitter) && (
          <div className="flex items-center space-x-4 mt-4">
            {contact.telegram && (
              <span className="text-sm text-grey-400">Telegram: {contact.telegram}</span>
            )}
            {contact.twitter && (
              <span className="text-sm text-grey-400">Twitter: {contact.twitter}</span>
            )}
          </div>
        )}
      </div>

      {/* Deals */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Deals</h2>
        {deals && deals.length > 0 ? (
          <div className="space-y-3">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-navy-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{deal.title}</h3>
                    <p className="text-sm text-grey-400 capitalize mt-1">{deal.stage}</p>
                  </div>
                  <div className="text-right">
                    {deal.value && (
                      <p className="text-primary-400 font-medium">
                        ${(deal.value / 1000).toFixed(0)}K
                      </p>
                    )}
                    <p className="text-sm text-grey-400">{deal.probability}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-grey-400 text-center py-8">No deals yet</p>
        )}
      </div>

      {/* Recent Activities */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
        {activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="bg-navy-700 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium capitalize">{activity.type}</p>
                    <p className="text-sm text-grey-300 mt-1">
                      {activity.subject || 'No subject'}
                    </p>
                    {activity.description && (
                      <p className="text-sm text-grey-400 mt-1">{activity.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-grey-400">
                    {activity.scheduled_at &&
                      format(new Date(activity.scheduled_at), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-grey-400 text-center py-8">No activities yet</p>
        )}
      </div>
    </div>
  );
};

export default ContactDetail;
