import { useQuery } from '@tanstack/react-query';
import { activitiesAPI } from '../services/api';
import { Calendar, Phone, Mail, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';

const Activities = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await activitiesAPI.getAll();
      return response.data;
    },
  });

  const getActivityIcon = (type) => {
    const icons = {
      call: Phone,
      meeting: Users,
      email: Mail,
      note: FileText,
      task: Calendar,
    };
    return icons[type] || FileText;
  };

  const getActivityColor = (type) => {
    const colors = {
      call: 'text-blue-400',
      meeting: 'text-green-400',
      email: 'text-purple-400',
      note: 'text-grey-400',
      task: 'text-yellow-400',
    };
    return colors[type] || 'text-grey-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activities</h1>
        <p className="text-grey-400 mt-2">Track all your interactions and tasks</p>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-12 text-grey-400">Loading activities...</div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);

              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 bg-navy-700 rounded-lg hover:bg-navy-600 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-navy-600 ${colorClass}`}>
                    <Icon size={20} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium capitalize">{activity.type}</p>
                        <p className="text-sm text-grey-300 mt-1">
                          {activity.subject || 'No subject'}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-grey-400 mt-2">
                            {activity.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right text-sm text-grey-400">
                        {activity.scheduled_at && (
                          <p>{format(new Date(activity.scheduled_at), 'MMM d, yyyy')}</p>
                        )}
                        {activity.is_completed && (
                          <span className="inline-block mt-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-grey-400">
            No activities yet. Start tracking your interactions!
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
