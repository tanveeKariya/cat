import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../../../services/api';
import LoadingSpinner from '../../../components/UI/LoadingSpinner';

const RevenueChart = () => {
  const [period, setPeriod] = useState('month');

  const { data: chartData, isLoading } = useQuery(
    ['revenueChart', period],
    () => dashboardAPI.getRevenueChart(period),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const data = chartData?.data || [];

  return (
    <div>
      {/* Period selector */}
      <div className="flex space-x-2 mb-4">
        {[
          { value: 'month', label: '30 Days' },
          { value: 'quarter', label: '3 Months' },
          { value: 'year', label: '12 Months' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setPeriod(option.value)}
            className={`px-3 py-1 text-sm rounded-md ${
              period === option.value
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="_id" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (period === 'month') {
                  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                return new Date(value + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
              labelFormatter={(label) => {
                if (period === 'month') {
                  return new Date(label).toLocaleDateString();
                }
                return new Date(label + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              }}
            />
            <Line 
              type="monotone" 
              dataKey="totalRevenue" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;