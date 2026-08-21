import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, HTMLAttributes, forwardRef } from 'react';

// ─── BUTTON ──────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      secondary: 'bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-700',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ─── BADGE ───────────────────────────────────────────────────────────────────

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'purple';
}

export function Badge({ variant = 'green', className, children, ...props }: BadgeProps) {
  const variants = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-700',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

// ─── CARD ────────────────────────────────────────────────────────────────────

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-200 overflow-hidden',
        hover && 'transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── SECTION ─────────────────────────────────────────────────────────────────

interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  centered?: boolean;
}

export function Section({ title, subtitle, centered, className, children, ...props }: SectionProps) {
  return (
    <section className={cn('py-16 lg:py-20', className)} {...props}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className={cn('mb-12', centered && 'text-center')}>
            {title && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-gray-200', className)} />
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
}

export function StatCard({ icon, value, label, color = 'text-green-600' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
      <div className={cn('text-3xl mb-2', color)}>{icon}</div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
