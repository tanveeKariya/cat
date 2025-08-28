import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Search, Filter } from 'lucide-react';
import { rentalAPI } from '../../services/api';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Badge from '../../components/UI/Badge';

const Rentals = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, error } = useQuery(
    ['rentals', page, search, status],
    () => rentalAPI.getAll({ page, search, status, limit: 10 }),
    {
      keepPreviousData: true,
    }
  );

  const rentalStatuses = ['Active', 'Completed', 'Overdue', 'Cancelled'];

  const getStatusBadge = (status) => {
    const variants = {
      'Active': 'success',
      'Completed': 'secondary',
      'Overdue': 'danger',
      'Cancelled': 'warning'
    };
    return variants[status] || 'secondary';
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading rentals: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rentals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage equipment rentals and track their lifecycle
          </p>
        </div>
        <Link
          to="/rentals/new"
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          New Rental
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search rentals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
            >
              <option value="">All Statuses</option>
              {rentalStatuses.map(rentalStatus => (
                <option key={rentalStatus} value={rentalStatus}>{rentalStatus}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rental List */}
      <div className="bg-white shadow rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rental ID</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((rental) => (
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
                          <div className="font-medium text-gray-900">{rental.customerId?.name}</div>
                          <div className="text-sm text-gray-500">{rental.customerId?.customerId}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">{rental.vehicleId?.vehicleId}</div>
                          <div className="text-sm text-gray-500">
                            {rental.vehicleId?.type} {rental.vehicleId?.model}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-900">
                          {format(new Date(rental.startDate), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-900">
                          {format(new Date(rental.expectedEndDate), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm font-medium text-gray-900">
                          ${rental.totalAmount.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <Badge variant={getStatusBadge(rental.status)}>
                          {rental.status}
                        </Badge>
                      </td>
                      <td>
                        <Link
                          to={`/rentals/${rental._id}`}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {data.pagination.current} of {data.pagination.pages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="btn btn-outline btn-sm"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.pagination.pages}
                      className="btn btn-outline btn-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Rentals;