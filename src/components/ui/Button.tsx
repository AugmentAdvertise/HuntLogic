"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-cta text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-brand-orange active:translate-y-0",
  secondary:
    "bg-brand-forest text-brand-cream hover:bg-brand-forestLight focus-visible:ring-brand-forest dark:bg-brand-sage dark:hover:bg-brand-forest",
  outline:
    "border border-brand-sage/30 text-brand-bark bg-transparent hover:bg-brand-sage/5 focus-visible:ring-brand-sage dark:text-brand-cream dark:border-brand-sage/50 dark:hover:bg-brand-sage/10",
  ghost:
    "text-brand-sage hover:bg-brand-sage/10 focus-visible:ring-brand-sage dark:text-brand-cream/70 dark:hover:bg-brand-sage/10",
  danger:
    "bg-danger text-white hover:bg-red-600 focus-visible:ring-danger",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm min-h-[36px]",
  md: "px-4 py-2.5 text-base min-h-[44px]",
  lg: "px-6 py-3 text-lg min-h-[52px]",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[8px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : iconLeft ? (
        <span className="shrink-0">{iconLeft}</span>
      ) : null}
      {children}
      {iconRight && !isLoading && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </button>
  );
}
