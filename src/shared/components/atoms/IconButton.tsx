import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'danger' | 'success';
type Size = 'sm' | 'md';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  default:  'bg-[#edf4f8] text-[#456882] hover:bg-[#dbeaf3] hover:text-[#234C6A]',
  primary:  'bg-[#234C6A] text-white hover:bg-[#1B3C53]',
  danger:   'bg-[#fce8ef] text-[#BD114A] hover:bg-[#f8c8d8] hover:text-[#a10d3f]',
  success:  'bg-[#d4f0e8] text-[#2FA084] hover:bg-[#b8e4d6] hover:text-[#237a63]',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 w-7 rounded-lg',
  md: 'h-8 w-8 rounded-xl',
};

export const IconButton = ({
  icon, label, variant = 'default', size = 'sm', isLoading = false, className = '', disabled, ...props
}: IconButtonProps) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    disabled={disabled || isLoading}
    className={`
      inline-flex items-center justify-center transition-colors
      focus:outline-none focus:ring-2 focus:ring-[#234C6A]/40 focus:ring-offset-1
      disabled:cursor-not-allowed disabled:opacity-50
      ${variants[variant]} ${sizes[size]} ${className}
    `}
    {...props}
  >
    {isLoading ? (
      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    ) : (
      icon
    )}
  </button>
);
