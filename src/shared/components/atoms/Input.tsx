import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = ({ error, className = '', ...props }: InputProps) => (
  <div className="w-full">
    <input
      {...props}
      className={`arch-input w-full rounded-xl px-3.5 py-2.5 text-sm shadow-sm transition-all placeholder:text-[#9c8d79] ${
        error ? 'border-[#b45a4d] focus:border-[#b45a4d] focus:ring-[#b45a4d]/30' : ''
      } ${className}`}
    />
    {error && <p className="mt-1 text-xs text-[#b45a4d]">{error}</p>}
  </div>
);
