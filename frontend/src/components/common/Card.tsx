import React, { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      className={`
        bg-dark-gray/50 backdrop-blur-sm border border-light-gray/10 rounded-lg
        shadow-lg overflow-hidden
        ${hoverable ? 'transition-all duration-300 hover:shadow-xl hover:shadow-electric-blue/20 hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;