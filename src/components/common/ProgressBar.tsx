import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'emerald' | 'blue' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = false,
  color = 'emerald',
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorStyles = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  const heightStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1 text-sm text-gray-600">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`${colorStyles[color]} ${heightStyles[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
