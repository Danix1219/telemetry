import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'danger' | 'warning' | 'neutral';
}

export const Badge = ({ children, variant = 'neutral' }: BadgeProps) => {
  const colors = {
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${colors[variant]}`}>
      {children}
    </span>
  );
};