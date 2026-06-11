"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EnhancedEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const iconMap: Record<string, React.ReactNode> = {
  leaves: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
      <path d="M30 55 L45 70 L70 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    </svg>
  ),
  approvals: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="35" r="15" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <path d="M20 75 C20 60 35 50 50 50 C65 50 80 60 80 75" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <path d="M40 50 L55 65 L75 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  ),
  search: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="42" cy="42" r="20" stroke="currentColor" strokeWidth="3" opacity="0.4" />
      <path d="M56 56 L78 78" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <line x1="50" y1="52" x2="70" y2="72" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.2" />
    </svg>
  ),
  error: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M38 38 L62 62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M62 38 L38 62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="2" opacity="0.3" />
    </svg>
  ),
  celebrate: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.3" />
      <path d="M35 55 L45 65 L65 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <path d="M18 25 L22 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M78 30 L82 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M25 70 L20 78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),
};

export function EnhancedEmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  actionHref,
  onAction,
  className,
  size = "md",
}: EnhancedEmptyStateProps) {
  const iconElement = typeof icon === "string" ? iconMap[icon] : icon;

  const sizeClasses = {
    sm: "py-8",
    md: "py-12",
    lg: "py-16",
  };

  const iconSizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "flex flex-col items-center justify-center text-center px-6",
        sizeClasses[size],
        className
      )}
    >
      {iconElement && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className={cn(
            "mb-6 text-[var(--text-muted)]",
            iconSizes[size]
          )}
        >
          {iconElement}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1.5">{title}</h3>
        {description && (
          <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">{description}</p>
        )}
      </motion.div>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-6"
        >
          {action}
        </motion.div>
      )}
      {actionLabel && actionHref && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-6"
        >
          <Link href={actionHref} className="btn-primary">
            {actionLabel}
          </Link>
        </motion.div>
      )}
      {actionLabel && onAction && !actionHref && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-6"
        >
          <button onClick={onAction} className="btn-primary">
            {actionLabel}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
