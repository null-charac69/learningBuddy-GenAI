import React from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export const Spinner = ({ label, className = '' }) => (
  <div className={`flex items-center gap-3 text-text-secondary ${className}`} role="status">
    <span className="h-5 w-5 rounded-full border-2 border-accent border-t-highlight animate-spin" />
    {label && <span className="text-sm">{label}</span>}
  </div>
);

export const Alert = ({ kind = 'error', children, onClose }) => {
  if (!children) return null;
  const styles =
    kind === 'error'
      ? 'bg-danger/15 border-danger/50 text-red-200'
      : 'bg-success/15 border-success/50 text-green-200';
  const Icon = kind === 'error' ? FiAlertCircle : FiCheckCircle;
  return (
    <div className={`flex items-start gap-3 p-3 border rounded-lg text-sm ${styles}`} role="alert">
      <Icon className="mt-0.5 shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100" aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
};

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
      {subtitle && <p className="text-text-secondary mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export const EmptyState = ({ icon: Icon, title, children }) => (
  <div className="flex flex-col items-center text-center py-12 px-6">
    {Icon && <Icon className="text-4xl text-text-secondary mb-3" />}
    <p className="font-semibold">{title}</p>
    <div className="text-text-secondary text-sm mt-1 max-w-md">{children}</div>
  </div>
);
