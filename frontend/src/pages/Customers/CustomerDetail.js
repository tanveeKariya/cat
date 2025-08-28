import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { customerAPI } from '../../services/api';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Badge from '../../components/UI/Badge';

const CustomerDetail = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery(
    ['customer', id],
    () => customerAPI.getById(id)
  );

  const { data: analytics } = useQuery(
    ['customerAnalytics', id],
    () => customerAPI.getAnalytics(id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading customer: {error.message}</p>
      </div>
    );
  }

  const { customer, rentals, payments } = data.data;

  const getRentalStatusBadge = (status) => {
    const variants = {
      'Active': 'success',
      'Completed': 'secondary',
      'Overdue': 'danger',
      'Cancelled': 'warning'
    };
    return variants[status] || 'secondary';
  };

  const getPaymentStatusBadge = (status) => {
    const variants = {
      'Completed': 'success',
      'Pending': 'warning',
      'Failed': 'danger',
      'Partially Paid': 'warning'
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/customers"
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-500">{customer.customerId}</p>
          </div>
        </div>
        <button className="btn btn-primary">
          <Edit className="h-4 w-4" />
          Edit Customer
        </button>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <Badge variant="secondary">{customer.businessType}</Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Badge variant={customer.isActive ? 'success' : 'secondary'}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center text-sm text-gray-900">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {customer.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="flex items-center text-sm text-gray-900">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {customer.phone}
                </div>
              </div>
              {customer.address && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="flex items-start text-sm text-gray-900">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      {customer.address.street && <div>{customer.address.street}</div>}
                      <div>
                        {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <div className="flex items-center text-sm text-gray-900">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Rentals */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Rentals</h3>
            {rentals.length === 0 ? (
              <p className="text-gray-500">No rentals found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rental ID</th>
                      <th>Vehicle</th>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.slice(0, 5).map((rental) => (
                      <tr key={rental._id}>
                        <td>
                          <Link
                            to={`/rentals/${rental._id}`}
                            className="text-blue-600 hover:text-blue-500 font-medium"
                          >
                            {rental.rentalId}
                          </Link>
                        </td>
                        <td>
                          <div>
                            <div className="font-medium">{rental.vehicleId?.vehicleId}</div>
                            <div className="text-sm text-gray-500">
                              {rental.vehicleId?.type} {rental.vehicleId?.model}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div>{format(new Date(rental.startDate), 'MMM d, yyyy')}</div>
                            <div className="text-gray-500">
                              to {format(new Date(rental.expectedEndDate), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </td>
                        <td>${rental.totalAmount.toLocaleString()}</td>
                        <td>
                          <Badge variant={getRentalStatusBadge(rental.status)}>
                            {rental.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
            {payments.length === 0 ? (
              <p className="text-gray-500">No payments found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 5).map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          <Link
                            to={`/payments/${payment._id}`}
                            className="text-blue-600 hover:text-blue-500 font-medium"
                          >
                            {payment.paymentId}
                          </Link>
                        </td>
                        <td>{payment.paymentType}</td>
                        <td>${payment.amount.toLocaleString()}</td>
                        <td>
                          {payment.paidDate 
                            ? format(new Date(payment.paidDate), 'MMM d, yyyy')
                            : format(new Date(payment.dueDate), 'MMM d, yyyy')
                          }
                        </td>
                        <td>
                          <Badge variant={getPaymentStatusBadge(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{customer.totalRentals}</div>
                <div className="text-sm text-gray-500">Total Rentals</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  customer.currentBalance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${customer.currentBalance.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Current Balance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{customer.creditLimit}</div>
                <div className="text-sm text-gray-500">Credit Limit</div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          {analytics?.data && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${analytics.data.overview.totalRevenue?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(analytics.data.overview.averageRentalDuration || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Avg Rental Days</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;