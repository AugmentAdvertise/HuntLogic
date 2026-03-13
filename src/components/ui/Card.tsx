"use client";

import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "outlined" | "interactive";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white border border-[#E0DDD5] shadow-card dark:bg-brand-bark dark:border-white/[0.12]",
  elevated: "bg-white border border-[#E0DDD5] shadow-card-hover dark:bg-brand-bark dark:border-white/[0.12]",
  outlined: "bg-transparent border border-brand-sage/20 dark:border-brand-sage/30",
  interactive:
    "bg-white border border-[#E0DDD5] shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 active:translate-y-0 cursor-pointer dark:bg-brand-bark dark:border-white/[0.12]",
};

export function Card({
  children,
  variant = "default",
  className,
  onClick,
}: CardProps) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={cn(
        "w-full rounded-xl p-6 text-left md:p-8",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-3", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("mt-4 pt-3 border-t border-brand-sage/10", className)}>
      {children}
    </div>
  );
}
