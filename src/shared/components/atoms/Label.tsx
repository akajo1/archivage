import type { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = ({ children, required, className = '', ...props }: LabelProps) => (
  <label {...props} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
    {required && <span className="ml-1 text-red-500">*</span>}
  </label>
);

