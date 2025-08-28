import React from 'react';
import { Truck, Users, FileText, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react';

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: 'Total Vehicles',
      value: stats.vehicles.total,
      subtitle: `${stats.vehicles.available} available`,
      icon: Truck,
      color: 'blue',
      trend: null
    },
    {
      title: 'Active Customers',
      value: stats.customers,
      subtitle: 'Total customers',
      icon: Users,
      color: 'green',
      trend: null
    },
    {
      title: 'Active Rentals',
      value: stats.rentals.active,
      subtitle: `${stats.rentals.overdue} overdue`,
      icon: FileText,
      color: 'purple',
      trend: null
    },
    {
      title: 'Total Revenue',
      value: `$${stats.payments.totalRevenue.toLocaleString()}`,
      subtitle: `$${stats.payments.pendingAmount.toLocaleString()} pending`,
      icon: CreditCard,
      color: 'yellow',
      trend: '+12%'
    },
    {
      title: 'Vehicles Rented',
      value: stats.vehicles.rented,
      subtitle: `${stats.vehicles.maintenance} in maintenance`,
      icon: TrendingUp,
      color: 'indigo',
      trend: null
    },
    {
      title: 'Active Alerts',
      value: stats.alerts,
      subtitle: 'Require attention',
      icon: AlertTriangle,
      color: 'red',
      trend: null
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                {card.trend && (
                  <span className="ml-2 text-sm font-medium text-green-600">
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{card.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;