import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const VehicleForm = ({ vehicle, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!vehicle;

  const [formData, setFormData] = useState({
    vehicleId: vehicle?.vehicleId || '',
    type: vehicle?.type || '',
    model: vehicle?.model || '',
    manufacturer: vehicle?.manufacturer || '',
    year: vehicle?.year || '',
    serialNumber: vehicle?.serialNumber || '',
    condition: vehicle?.condition || 'good',
    status: vehicle?.status || 'available',
    dailyRate: vehicle?.dailyRate || '',
    expectedReturnDate: vehicle?.expectedReturnDate ? 
      new Date(vehicle.expectedReturnDate).toISOString().split('T')[0] : ''
  });

  const [errors, setErrors] = useState({});

  const vehicleTypes = [
    'Car', 'Truck', 'Van', 'SUV', 'Bulldozer', 'Excavator', 'Loader', 
    'Crane', 'Grader', 'Dump Truck', 'Forklift', 'Backhoe', 'Skid Steer', 'Other'
  ];

  const conditions = [
    { value: 'good', label: 'Good' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'under_repair', label: 'Under Repair' },
    { value: 'needs_inspection', label: 'Needs Inspection' }
  ];

  const statuses = [
    { value: 'available', label: 'Available' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'rented', label: 'Rented' },
    { value: 'under_maintenance', label: 'Under Maintenance' }
  ];

  const createMutation = useMutation(vehicleAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('vehicles');
      queryClient.invalidateQueries('vehicleStats');
      toast.success('Vehicle created successfully');
      if (onClose) onClose();
      else navigate('/vehicles');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error creating vehicle');
    }
  });

  const updateMutation = useMutation(
    (data) => vehicleAPI.update(vehicle._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vehicles');
        queryClient.invalidateQueries(['vehicle', vehicle._id]);
        queryClient.invalidateQueries('vehicleStats');
        toast.success('Vehicle updated successfully');
        if (onClose) onClose();
        else navigate('/vehicles');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error updating vehicle');
      }
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicleId.trim()) {
      newErrors.vehicleId = 'Vehicle ID is required';
    }
    if (!formData.type) {
      newErrors.type = 'Vehicle type is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    if (formData.year && (formData.year < 1990 || formData.year > new Date().getFullYear() + 1)) {
      newErrors.year = 'Please enter a valid year';
    }
    if (formData.dailyRate && formData.dailyRate < 0) {
      newErrors.dailyRate = 'Daily rate must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      year: formData.year ? parseInt(formData.year) : undefined,
      dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : undefined,
      expectedReturnDate: formData.expectedReturnDate || undefined
    };

    // Remove empty fields
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' || submitData[key] === undefined) {
        delete submitData[key];
      }
    });

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle ID *
              </label>
              <input
                type="text"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                className={`form-input ${errors.vehicleId ? 'border-red-500' : ''}`}
                placeholder="Enter vehicle ID"
                disabled={isEditing} // Don't allow editing vehicle ID
              />
              {errors.vehicleId && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleId}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`form-select ${errors.type ? 'border-red-500' : ''}`}
              >
                <option value="">Select type</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={`form-input ${errors.model ? 'border-red-500' : ''}`}
                placeholder="Enter model"
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model}</p>
              )}
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter manufacturer"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`form-input ${errors.year ? 'border-red-500' : ''}`}
                placeholder="Enter year"
                min="1990"
                max={new Date().getFullYear() + 1}
              />
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year}</p>
              )}
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter serial number"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="form-select"
              >
                {conditions.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Daily Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Rate ($)
              </label>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                className={`form-input ${errors.dailyRate ? 'border-red-500' : ''}`}
                placeholder="Enter daily rate"
                min="0"
                step="0.01"
              />
              {errors.dailyRate && (
                <p className="text-red-500 text-sm mt-1">{errors.dailyRate}</p>
              )}
            </div>

            {/* Expected Return Date */}
            {formData.status === 'rented' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  name="expectedReturnDate"
                  value={formData.expectedReturnDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose || (() => navigate('/vehicles'))}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                isEditing ? 'Update Vehicle' : 'Create Vehicle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;