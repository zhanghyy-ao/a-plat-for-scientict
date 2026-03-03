import React, { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FormGroupProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  children,
  error,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-light-gray mb-1">
        {label}
      </label>
      <div>{children}</div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  error,
  className = '',
  ...props
}) => {
  return (
    <input
      className={`
        w-full px-4 py-2 bg-dark-gray/80 border ${error ? 'border-red-500' : 'border-light-gray/20'}
        rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue
        transition-all duration-300
        ${className}
      `}
      {...props}
    />
  );
};

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  error,
  className = '',
  ...props
}) => {
  return (
    <textarea
      className={`
        w-full px-4 py-2 bg-dark-gray/80 border ${error ? 'border-red-500' : 'border-light-gray/20'}
        rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue
        transition-all duration-300 resize-none
        ${className}
      `}
      {...props}
    />
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  error,
  className = '',
  ...props
}) => {
  return (
    <select
      className={`
        w-full px-4 py-2 bg-dark-gray/80 border ${error ? 'border-red-500' : 'border-light-gray/20'}
        rounded-md text-white focus:outline-none focus:ring-2 focus:ring-electric-blue
        transition-all duration-300
        ${className}
      `}
      {...props}
    />
  );
};