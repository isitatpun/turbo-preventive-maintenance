import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = true,
  onClick,
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-2xl border border-gray-100/50 shadow-sm';
  const hoverStyles = hover ? 'transition-all duration-300 ease-out hover:shadow-md hover:border-gray-200/50 hover:scale-[1.01] active:scale-[0.99]' : '';
  const clickStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${clickStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;