import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = ({ error, className = '', ...props }: InputProps) => (
  <div className="w-full">
    <input
      {...props}
      className={`arch-input w-full rounded-xl px-3.5 py-2.5 text-sm shadow-sm transition-all ${
        error ? 'border-[#BD114A] focus:border-[#BD114A]' : ''
      } ${className}`}
    />
    {error && <p className="mt-1 text-xs text-[#BD114A]">{error}</p>}
  </div>
);
