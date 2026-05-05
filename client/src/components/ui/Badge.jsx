const variantClasses = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
  admin: 'bg-purple-100 text-purple-700',
  member: 'bg-slate-100 text-slate-700'
};

export default function Badge({ variant = 'todo', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${variantClasses[variant] ?? variantClasses.todo} ${className}`}
    >
      {children}
    </span>
  );
}
