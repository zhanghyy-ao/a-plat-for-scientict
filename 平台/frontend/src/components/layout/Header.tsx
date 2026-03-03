import React, { type ReactNode } from 'react';
import Navbar from '../common/Navbar';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  showNavbar?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  children,
  showNavbar = true,
  className = '',
}) => {
  return (
    <header className={`relative ${className}`}>
      {showNavbar && <Navbar />}
      {(title || subtitle) && (
        <div className="container mx-auto px-4 pt-24 pb-12">
          {title && (
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-center">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-lg text-light-gray text-center mt-4 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </header>
  );
};

export default Header;