export default function Button({ className = '', variant = 'default', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700'
  };
  return <button className={`${base} ${variants[variant] ?? variants.default} ${className}`} {...props} />;
}
