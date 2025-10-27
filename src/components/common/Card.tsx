import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  const hoverStyles = hoverable
    ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
    : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-4 ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
