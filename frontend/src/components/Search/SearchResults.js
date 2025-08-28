import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Truck, FileText, Loader2 } from 'lucide-react';

const SearchResults = ({ results, loading, onResultClick }) => {
  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <div className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Searching...</span>
        </div>
      </div>
    );
  }

  if (!results || results.totalResults === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500">No results found</p>
        </div>
      </div>
    );
  }

  const { customers, vehicles, rentals } = results;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="py-2">
        {/* Customers */}
        {customers.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
              Customers
            </div>
            {customers.map((customer) => (
              <Link
                key={customer._id}
                to={`/customers/${customer._id}`}
                onClick={onResultClick}
                className="flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
              >
                <Users className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.customerId} • {customer.businessType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{customer.totalRentals} rentals</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Vehicles */}
        {vehicles.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
              Vehicles
            </div>
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle._id}
                to={`/vehicles/${vehicle._id}`}
                onClick={onResultClick}
                className="flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
              >
                <Truck className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{vehicle.vehicleId}</p>
                  <p className="text-xs text-gray-500">{vehicle.type} • {vehicle.manufacturer} {vehicle.model}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === 'Available' 
                      ? 'bg-green-100 text-green-800'
                      : vehicle.status === 'Rented'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Rentals */}
        {rentals.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
              Rentals
            </div>
            {rentals.map((rental) => (
              <Link
                key={rental._id}
                to={`/rentals/${rental._id}`}
                onClick={onResultClick}
                className="flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
              >
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{rental.rentalId}</p>
                  <p className="text-xs text-gray-500">
                    {rental.customerId?.name} • {rental.vehicleId?.vehicleId}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    rental.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : rental.status === 'Completed'
                      ? 'bg-gray-100 text-gray-800'
                      : rental.status === 'Overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rental.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Show total results */}
        <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
          {results.totalResults} result{results.totalResults !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
};

export default SearchResults;