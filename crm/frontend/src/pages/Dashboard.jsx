import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';
import { TrendingUp, Users, DollarSign, Flame } from 'lucide-react';
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
      color: 'primary',
    },
    {
      title: 'Hot Contacts',
      value: metrics?.hot_contacts || 0,
      icon: Flame,
      color: 'red',
    },
    {
      title: 'Active Deals',
      value: metrics?.active_deals || 0,
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Pipeline Value',
      value: `$${((metrics?.total_pipeline_value || 0) / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'primary',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-grey-100">Dashboard</h1>
        <p className="text-grey-400 mt-2">Overview of your business development pipeline</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-grey-400 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                  <Icon className={`text-${stat.color}-500`} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Breakdown */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Pipeline by Stage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics?.deals_by_stage && Object.entries(metrics.deals_by_stage).map(([stage, data]) => (
            <div key={stage} className="bg-navy-700 p-4 rounded-lg">
              <p className="text-grey-400 text-sm capitalize">{stage.replace('_', ' ')}</p>
              <p className="text-2xl font-bold mt-1">{data.count}</p>
              <p className="text-primary-400 text-sm mt-1">
                ${(data.value / 1000).toFixed(0)}K
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Activities */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Upcoming Activities</h2>
        {metrics?.upcoming_activities?.length > 0 ? (
          <div className="space-y-3">
            {metrics.upcoming_activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-navy-700 rounded-lg"
              >
                <div>
                  <p className="font-medium">{activity.subject || 'No subject'}</p>
                  <p className="text-sm text-grey-400 capitalize">{activity.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-grey-400">
                    {activity.scheduled_at
                      ? format(new Date(activity.scheduled_at), 'MMM d, h:mm a')
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-grey-400 text-center py-8">No upcoming activities</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
