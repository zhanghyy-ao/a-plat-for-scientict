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

      {children}
    </header>
  );
};

export default Header;