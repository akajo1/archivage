import type { ReactNode } from 'react';
import { Label } from '../atoms/Label';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export const FormField = ({ label, htmlFor, error, required, children }: FormFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={htmlFor} required={required}>{label}</Label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

