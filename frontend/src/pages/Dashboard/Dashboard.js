import React from 'react';
import { useQuery } from 'react-query';
import { dashboardAPI } from '../../services/api';
import StatsCards from './components/StatsCards';
import RevenueChart from './components/RevenueChart';
import RecentActivity from './components/RecentActivity';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    dashboardAPI.getStats,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    'recentActivity',
    () => dashboardAPI.getRecentActivity(5)
  );

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your equipment rental business
        </p>
      </div>

      {/* Stats cards */}
      <StatsCards stats={stats?.data} />

      {/* Charts and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
          <RevenueChart />
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <RecentActivity 
            data={recentActivity?.data} 
            loading={activityLoading} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;