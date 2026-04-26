import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[#806444] text-amber-50 shadow-sm hover:bg-[#6f563a] active:bg-[#5d4731] disabled:bg-[#b29a7d]',
  secondary:
    'bg-[#f6eee1] text-[#4a3b2b] border border-[#d8cab3] shadow-sm hover:bg-[#efe2cf] active:bg-[#e4d3bb]',
  danger:
    'bg-[#a44b3f] text-[#fff3ef] shadow-sm hover:bg-[#8f3e34] active:bg-[#7b342c]',
  ghost:
    'text-[#5d4c39] hover:bg-[#efe2cf] active:bg-[#e4d4be]',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    disabled={disabled || isLoading}
    className={`inline-flex items-center justify-center gap-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#9a7d58] focus:ring-offset-2 focus:ring-offset-[#efe7da] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
  >
    {isLoading && (
      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    )}
    {children}
  </button>
);
