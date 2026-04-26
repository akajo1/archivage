import type { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = ({ children, required, className = '', ...props }: LabelProps) => (
  <label {...props} className={`block text-sm font-medium text-[#5e503f] ${className}`}>
    {children}
    {required && <span className="ml-1 text-[#a44b3f]">*</span>}
  </label>
);
