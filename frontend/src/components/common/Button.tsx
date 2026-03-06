import React, { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  href,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:shadow-primary/20',
    secondary: 'bg-gradient-to-r from-secondary to-secondary-dark text-white hover:shadow-lg hover:shadow-secondary/20',
    outline: 'border border-primary text-primary hover:bg-primary/10',
    ghost: 'text-foreground hover:bg-card-hover',
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-2.5',
    lg: 'text-lg px-6 py-3',
  };

  const baseClasses = `
    font-inter font-medium rounded-lg transition-all duration-300
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
    ${className}
  `;

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
            {children}
          </div>
        ) : (
          children
        )}
      </a>
    );
  }

  return (
    <button
      className={baseClasses}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;