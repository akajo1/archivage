import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'danger' | 'success';
type Size = 'sm' | 'md';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string; // required for accessibility (shown as tooltip)
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  default:  'bg-[#f2e9da] text-[#5e503f] hover:bg-[#e9dccb] hover:text-[#3f2e1e]',
  primary:  'bg-[#806444] text-amber-50 hover:bg-[#684f35]',
  danger:   'bg-[#f3e0de] text-[#a44b3f] hover:bg-[#f1ceca] hover:text-[#8f3e34]',
  success:  'bg-[#d9e6de] text-[#3e7a5c] hover:bg-[#c5d9d0] hover:text-[#2e5c46]',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 w-7 rounded-lg text-[13px]',
  md: 'h-8 w-8 rounded-xl text-[15px]',
};

export const IconButton = ({
  icon,
  label,
  variant = 'default',
  size = 'sm',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: IconButtonProps) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    disabled={disabled || isLoading}
    className={`
      inline-flex items-center justify-center transition-colors
      focus:outline-none focus:ring-2 focus:ring-[#9a7d58]/50 focus:ring-offset-1
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

