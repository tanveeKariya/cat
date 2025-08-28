import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CreditCard, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../../../components/UI/LoadingSpinner';
import Badge from '../../../components/UI/Badge';

const RecentActivity = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!data) return null;

  const { rentals, payments, alerts } = data;

  // Combine and sort all activities
  const activities = [
    ...rentals.map(rental => ({
      type: 'rental',
      id: rental._id,
      title: `New rental: ${rental.rentalId}`,
      subtitle: `${rental.customerId?.name} - ${rental.vehicleId?.type}`,
      date: rental.createdAt,
      status: rental.status,
      icon: FileText
    })),
    ...payments.map(payment => ({
      type: 'payment',
      id: payment._id,
      title: `Payment: ${payment.paymentId}`,
      subtitle: `$${payment.amount} - ${payment.customerId?.name}`,
      date: payment.createdAt,
      status: payment.status,
      icon: CreditCard
    })),
    ...alerts.slice(0, 3).map(alert => ({
      type: 'alert',
      id: alert._id,
      title: alert.title,
      subtitle: alert.message,
      date: alert.createdAt,
      status: alert.priority,
      icon: AlertTriangle
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const getStatusBadge = (type, status) => {
    if (type === 'rental') {
      return status === 'Active' ? 'success' : status === 'Overdue' ? 'danger' : 'secondary';
    }
    if (type === 'payment') {
      return status === 'Completed' ? 'success' : status === 'Pending' ? 'warning' : 'danger';
    }
    if (type === 'alert') {
      return status === 'Critical' ? 'danger' : status === 'High' ? 'warning' : 'info';
    }
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      ) : (
        activities.map((activity) => (
          <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <activity.icon className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <Badge variant={getStatusBadge(activity.type, activity.status)} size="sm">
                  {activity.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 truncate">{activity.subtitle}</p>
              <p className="text-xs text-gray-400">
                {format(new Date(activity.date), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
        ))
      )}
      
      {activities.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <Link
            to="/alerts"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View all activity →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;