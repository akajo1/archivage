import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   'bg-[#234C6A] text-white shadow-sm hover:bg-[#1B3C53] active:bg-[#162e42] disabled:bg-[#7aaac4]',
  secondary: 'bg-[#edf4f8] text-[#234C6A] border border-[#c4d4df] shadow-sm hover:bg-[#dbeaf3] active:bg-[#cce0ed]',
  danger:    'bg-[#BD114A] text-white shadow-sm hover:bg-[#a10d3f] active:bg-[#8a0b35]',
  ghost:     'text-[#456882] hover:bg-[#dbeaf3] active:bg-[#cce0ed]',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
};

export const Button = ({
  variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props
}: ButtonProps) => (
  <button
    {...props}
    disabled={disabled || isLoading}
    className={`inline-flex items-center justify-center gap-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#234C6A]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
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
