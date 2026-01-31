import React from 'react';
import logoImage from '../images/logo.jpeg';
import logo1Image from '../images/logo1.jpeg';
import logo2Image from '../images/logo2.jpeg';

const Logo = ({ size = 'md', circular = false, className = '', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',  // Increased from w-8 h-8
    md: 'w-16 h-16',  // Increased from w-12 h-12
    lg: 'w-24 h-24', // Increased from w-16 h-16
    xl: 'w-32 h-32', // Increased from w-24 h-24
    '2xl': 'w-40 h-40', // New extra large size
  };

  // Choose logo variant
  const logoSrc = variant === 'logo1' ? logo1Image : variant === 'logo2' ? logo2Image : logoImage;

  const containerClass = circular
    ? `${sizeClasses[size]} rounded-full bg-white p-1.5 shadow-lg flex items-center justify-center overflow-hidden ${className}`
    : `flex items-center justify-center ${className}`;

  return (
    <div className={containerClass}>
      <img
        src={logoSrc}
        alt="SGRS Logo"
        className={`${sizeClasses[size]} object-cover ${circular ? 'rounded-full' : ''}`}
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
};

export default Logo;
