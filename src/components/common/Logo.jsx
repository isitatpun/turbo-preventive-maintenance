import React from 'react';
import logoImage from '../../assets/logo.png';

const Logo = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <img 
      src={logoImage} 
      alt="TURBO" 
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
};

export default Logo;