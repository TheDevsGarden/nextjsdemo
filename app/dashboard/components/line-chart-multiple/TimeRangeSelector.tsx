"use client";

import React from "react";

export type TimeRange = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ 
  selectedRange, 
  onChange 
}) => {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Time Range:</span>
      <div className="relative">
        <select
          value={selectedRange}
          onChange={(e) => onChange(e.target.value as TimeRange)}
          className="appearance-none block w-full pl-3 pr-10 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
        >
          {ranges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TimeRangeSelector;