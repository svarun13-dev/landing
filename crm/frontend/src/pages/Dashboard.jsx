import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';
import { TrendingUp, Users, Flame } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const response = await dashboardAPI.getMetrics();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-grey-400">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Contacts',
      value: metrics?.total_contacts || 0,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Hot Contacts',
      value: metrics?.hot_contacts || 0,
      icon: Flame,
      color: 'orange',
    },
    {
      title: 'Active Deals',
      value: metrics?.active_deals || 0,
      icon: TrendingUp,
      color: 'green',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-2">Overview of your business development pipeline</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">{stat.title}</p>
                  <p className="text-4xl font-bold mt-2 text-text-primary">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary-50">
                  <Icon className="text-primary-500" size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Breakdown */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-text-primary">Pipeline by Stage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics?.deals_by_stage && Object.entries(metrics.deals_by_stage).map(([stage, data]) => (
            <div key={stage} className="bg-background-100 p-4 rounded-lg border border-gray-200">
              <p className="text-text-secondary text-sm capitalize">{stage.replace('_', ' ')}</p>
              <p className="text-2xl font-bold mt-1 text-text-primary">{data.count}</p>
              <p className="text-primary-500 text-xs mt-1">deals</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Activities */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-text-primary">Upcoming Activities</h2>
        {metrics?.upcoming_activities?.length > 0 ? (
          <div className="space-y-3">
            {metrics.upcoming_activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-background-100 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-text-primary">{activity.subject || 'No subject'}</p>
                  <p className="text-sm text-text-secondary capitalize">{activity.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-muted">
                    {activity.scheduled_at
                      ? format(new Date(activity.scheduled_at), 'MMM d, h:mm a')
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">No upcoming activities</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
