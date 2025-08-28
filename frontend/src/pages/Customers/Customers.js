import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Search, Filter } from 'lucide-react';
import { customerAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Badge from '../../components/UI/Badge';

const Customers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [businessType, setBusinessType] = useState('');

  const { data, isLoading, error } = useQuery(
    ['customers', page, search, businessType],
    () => customerAPI.getAll({ page, search, businessType, limit: 10 }),
    {
      keepPreviousData: true,
    }
  );

  const businessTypes = [
    'Construction', 'Landscaping', 'Agriculture', 'Mining', 'Transportation', 'Other'
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading customers: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customer database and rental history
          </p>
        </div>
        <Link
          to="/customers/new"
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Customer
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
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="form-select"
            >
              <option value="">All Business Types</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customer List */}
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
                    <th>Customer</th>
                    <th>Business Type</th>
                    <th>Contact</th>
                    <th>Rentals</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.customerId}</div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="secondary">{customer.businessType}</Badge>
                      </td>
                      <td>
                        <div>
                          <div className="text-sm text-gray-900">{customer.email}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-900">{customer.totalRentals}</span>
                      </td>
                      <td>
                        <span className={`text-sm font-medium ${
                          customer.currentBalance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${customer.currentBalance.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <Badge variant={customer.isActive ? 'success' : 'secondary'}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Link
                          to={`/customers/${customer._id}`}
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

export default Customers;