import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Edit, Calendar, Wrench, DollarSign } from 'lucide-react';
import { vehicleAPI } from '../../services/api';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Badge from '../../components/UI/Badge';

const VehicleDetail = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery(
    ['vehicle', id],
    () => vehicleAPI.getById(id)
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
        <p className="text-red-600">Error loading vehicle: {error.message}</p>
      </div>
    );
  }

  const { vehicle, rentalHistory } = data.data;

  const getStatusBadge = (status) => {
    const variants = {
      'Available': 'success',
      'Rented': 'info',
      'Reserved': 'warning',
      'Under Maintenance': 'warning',
      'Out of Service': 'danger'
    };
    return variants[status] || 'secondary';
  };

  const getConditionBadge = (condition) => {
    const variants = {
      'Good': 'success',
      'Fair': 'warning',
      'Needs Inspection': 'warning',
      'Under Repair': 'danger',
      'Damaged': 'danger'
    };
    return variants[condition] || 'secondary';
  };

  const getRentalStatusBadge = (status) => {
    const variants = {
      'Active': 'success',
      'Completed': 'secondary',
      'Overdue': 'danger',
      'Cancelled': 'warning'
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/vehicles"
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vehicle.vehicleId}</h1>
            <p className="text-sm text-gray-500">
              {vehicle.manufacturer} {vehicle.model} ({vehicle.year})
            </p>
          </div>
        </div>
        <button className="btn btn-primary">
          <Edit className="h-4 w-4" />
          Edit Vehicle
        </button>
      </div>

      {/* Vehicle Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <Badge variant="secondary">{vehicle.type}</Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Badge variant={getStatusBadge(vehicle.status)}>
                  {vehicle.status}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <Badge variant={getConditionBadge(vehicle.condition)}>
                  {vehicle.condition}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number
                </label>
                <p className="text-sm text-gray-900">{vehicle.serialNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <p className="text-sm text-gray-900">{vehicle.location?.depot || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Rental Hours
                </label>
                <p className="text-sm text-gray-900">{vehicle.totalRentalHours || 0} hours</p>
              </div>
            </div>
          </div>

          {/* Specifications */}
          {vehicle.specifications && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicle.specifications.enginePower && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engine Power
                    </label>
                    <p className="text-sm text-gray-900">{vehicle.specifications.enginePower}</p>
                  </div>
                )}
                {vehicle.specifications.operatingWeight && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operating Weight
                    </label>
                    <p className="text-sm text-gray-900">{vehicle.specifications.operatingWeight}</p>
                  </div>
                )}
                {vehicle.specifications.maxCapacity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Capacity
                    </label>
                    <p className="text-sm text-gray-900">{vehicle.specifications.maxCapacity}</p>
                  </div>
                )}
                {vehicle.specifications.fuelType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Type
                    </label>
                    <p className="text-sm text-gray-900">{vehicle.specifications.fuelType}</p>
                  </div>
                )}
              </div>
              {vehicle.specifications.attachments && vehicle.specifications.attachments.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.specifications.attachments.map((attachment, index) => (
                      <Badge key={index} variant="secondary">{attachment}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rental History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rental History</h3>
            {rentalHistory.length === 0 ? (
              <p className="text-gray-500">No rental history found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rental ID</th>
                      <th>Customer</th>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentalHistory.slice(0, 10).map((rental) => (
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
                            <div className="font-medium">{rental.customerId?.name}</div>
                            <div className="text-sm text-gray-500">{rental.customerId?.customerId}</div>
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <DollarSign className="inline h-5 w-5 mr-2" />
              Pricing
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily Rate</span>
                <span className="text-sm font-medium">${vehicle.dailyRate}</span>
              </div>
              {vehicle.weeklyRate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Weekly Rate</span>
                  <span className="text-sm font-medium">${vehicle.weeklyRate}</span>
                </div>
              )}
              {vehicle.monthlyRate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Rate</span>
                  <span className="text-sm font-medium">${vehicle.monthlyRate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <Wrench className="inline h-5 w-5 mr-2" />
              Maintenance
            </h3>
            <div className="space-y-3">
              {vehicle.maintenanceSchedule?.lastMaintenance && (
                <div>
                  <span className="text-sm text-gray-600">Last Maintenance</span>
                  <p className="text-sm font-medium">
                    {format(new Date(vehicle.maintenanceSchedule.lastMaintenance), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              {vehicle.maintenanceSchedule?.nextMaintenance && (
                <div>
                  <span className="text-sm text-gray-600">Next Maintenance</span>
                  <p className="text-sm font-medium">
                    {format(new Date(vehicle.maintenanceSchedule.nextMaintenance), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              {vehicle.maintenanceSchedule?.maintenanceType && (
                <div>
                  <span className="text-sm text-gray-600">Type</span>
                  <p className="text-sm font-medium">{vehicle.maintenanceSchedule.maintenanceType}</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Rental */}
          {vehicle.currentRental && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <Calendar className="inline h-5 w-5 mr-2" />
                Current Rental
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Rental ID</span>
                  <p className="text-sm font-medium">{vehicle.currentRental.rentalId}</p>
                </div>
                {vehicle.expectedReturnDate && (
                  <div>
                    <span className="text-sm text-gray-600">Expected Return</span>
                    <p className="text-sm font-medium">
                      {format(new Date(vehicle.expectedReturnDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;