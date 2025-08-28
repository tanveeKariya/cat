import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Search, Filter } from 'lucide-react';
import { vehicleAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Badge from '../../components/UI/Badge';

const Vehicles = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [condition, setCondition] = useState('');

  const { data, isLoading, error } = useQuery(
    ['vehicles', page, search, type, status, condition],
    () => vehicleAPI.getAll({ page, search, type, status, condition, limit: 10 }),
    {
      keepPreviousData: true,
    }
  );

  const vehicleTypes = [
    'Car', 'Truck', 'Van', 'SUV', 'Bulldozer', 'Excavator', 'Loader', 'Crane', 'Grader', 'Dump Truck', 'Forklift', 'Backhoe', 'Skid Steer', 'Other'
  ];

  const vehicleStatuses = ['available', 'rented', 'reserved', 'under_maintenance'];
  const vehicleConditions = ['good', 'damaged', 'under_repair', 'needs_inspection'];

  const getStatusBadge = (status) => {
    const variants = {
      'available': 'success',
      'rented': 'info',
      'reserved': 'warning',
      'under_maintenance': 'warning'
    };
    return variants[status] || 'secondary';
  };

  const getConditionBadge = (condition) => {
    const variants = {
      'good': 'success',
      'damaged': 'danger',
      'under_repair': 'danger',
      'needs_inspection': 'warning'
    };
    return variants[condition] || 'secondary';
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading vehicles: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your equipment inventory and rental status
          </p>
        </div>
        <Link
          to="/vehicles/new"
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
          </div>
          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="form-select"
            >
              <option value="">All Types</option>
              {vehicleTypes.map(vehicleType => (
                <option key={vehicleType} value={vehicleType}>{vehicleType}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
            >
              <option value="">All Statuses</option>
              {vehicleStatuses.map(vehicleStatus => (
                <option key={vehicleStatus} value={vehicleStatus}>
                  {vehicleStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="form-select"
            >
              <option value="">All Conditions</option>
              {vehicleConditions.map(vehicleCondition => (
                <option key={vehicleCondition} value={vehicleCondition}>
                  {vehicleCondition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
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
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Year</th>
                    <th>Status</th>
                    <th>Condition</th>
                    <th>Daily Rate</th>
                    <th>Current Rental</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((vehicle) => (
                    <tr key={vehicle._id}>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">{vehicle.vehicleId}</div>
                          <div className="text-sm text-gray-500">
                            {vehicle.manufacturer} {vehicle.model}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="secondary">{vehicle.type}</Badge>
                      </td>
                      <td>
                        <span className="text-sm text-gray-900">{vehicle.year}</span>
                      </td>
                      <td>
                        <Badge variant={getStatusBadge(vehicle.status)}>
                          {vehicle.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={getConditionBadge(vehicle.condition)}>
                          {vehicle.condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle.dailyRate ? `$${vehicle.dailyRate}` : 'N/A'}
                        </span>
                      </td>
                      <td>
                        {vehicle.linkedRentalId ? (
                          <Link
                            to={`/rentals/${vehicle.linkedRentalId._id}`}
                            className="text-blue-600 hover:text-blue-500 text-sm"
                          >
                            View Rental
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td>
                        <Link
                          to={`/vehicles/${vehicle._id}`}
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

export default Vehicles;