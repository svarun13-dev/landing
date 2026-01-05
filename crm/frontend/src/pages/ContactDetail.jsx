import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contactsAPI } from '../services/api';
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import AIInsights from '../components/AIInsights';

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
    return <div className="text-center py-12 text-text-secondary">Loading...</div>;
  }

  if (!contact) {
    return <div className="text-center py-12 text-text-secondary">Contact not found</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      hot: 'bg-orange-100 text-orange-600 border border-orange-200',
      warm: 'bg-yellow-100 text-yellow-600 border border-yellow-200',
      cold: 'bg-blue-100 text-blue-600 border border-blue-200',
    };
    return colors[status] || colors.cold;
  };

  return (
    <div className="space-y-6">
      <Link to="/contacts" className="flex items-center text-primary-500 hover:text-primary-600">
        <ArrowLeft size={20} className="mr-2" />
        Back to Contacts
      </Link>

      {/* Contact Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{contact.name}</h1>
            <p className="text-xl text-text-secondary mt-1">{contact.role}</p>
            {contact.company && (
              <p className="text-lg text-text-secondary mt-1">{contact.company}</p>
            )}

            <div className="flex items-center space-x-3 mt-4">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(contact.status)}`}>
                {contact.status}
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-text-secondary rounded-full text-sm capitalize border border-gray-200">
                {contact.contact_type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
          {contact.email && (
            <div className="flex items-center space-x-3">
              <Mail size={18} className="text-text-secondary" />
              <a href={`mailto:${contact.email}`} className="text-primary-500 hover:text-primary-600">
                {contact.email}
              </a>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center space-x-3">
              <Phone size={18} className="text-text-secondary" />
              <a href={`tel:${contact.phone}`} className="text-text-primary hover:text-primary-600">
                {contact.phone}
              </a>
            </div>
          )}

          {contact.location && (
            <div className="flex items-center space-x-3">
              <MapPin size={18} className="text-text-secondary" />
              <span className="text-text-primary">{contact.location}</span>
            </div>
          )}

          {contact.created_at && (
            <div className="flex items-center space-x-3">
              <Calendar size={18} className="text-text-secondary" />
              <span className="text-text-primary">
                Added {format(new Date(contact.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        {(contact.telegram || contact.twitter) && (
          <div className="flex items-center space-x-4 mt-4">
            {contact.telegram && (
              <span className="text-sm text-text-secondary">Telegram: {contact.telegram}</span>
            )}
            {contact.twitter && (
              <span className="text-sm text-text-secondary">Twitter: {contact.twitter}</span>
            )}
          </div>
        )}
      </div>

      {/* Partnership Strategy */}
      {(contact.partnership_strategy || contact.next_steps || contact.tags) && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 text-text-primary">Partnership Strategy</h2>

          {contact.tags && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wide">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {contact.tags.split(',').map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm border border-primary-200">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {contact.partnership_strategy && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wide">Engagement Flow</h3>
              <p className="text-text-primary whitespace-pre-wrap">{contact.partnership_strategy}</p>
            </div>
          )}

          {contact.next_steps && (
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wide">Next Steps</h3>
              <p className="text-text-primary">{contact.next_steps}</p>
            </div>
          )}
        </div>
      )}

      {/* AI Insights */}
      <AIInsights contact={contact} deals={deals} />

      {/* Deals */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Deals</h2>
        {deals && deals.length > 0 ? (
          <div className="space-y-3">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-background-100 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">{deal.title}</h3>
                    <p className="text-sm text-text-secondary capitalize mt-1">{deal.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">{deal.probability}% confidence</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">No deals yet</p>
        )}
      </div>

      {/* Recent Activities */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Recent Activities</h2>
        {activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="bg-background-100 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium capitalize text-text-primary">{activity.type}</p>
                    <p className="text-sm text-text-secondary mt-1">
                      {activity.subject || 'No subject'}
                    </p>
                    {activity.description && (
                      <p className="text-sm text-text-muted mt-1">{activity.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-text-muted">
                    {activity.scheduled_at &&
                      format(new Date(activity.scheduled_at), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">No activities yet</p>
        )}
      </div>
    </div>
  );
};

export default ContactDetail;
