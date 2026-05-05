import Button from './ui/button.jsx';

const statusStyles = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-sky-100 text-sky-700',
  DONE: 'bg-emerald-100 text-emerald-700',
  OVERDUE: 'bg-rose-100 text-rose-700'
};

export default function TaskCard({ task, onToggleStatus, onDelete }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
          <p className="mt-2 text-sm text-slate-600">{task.description || 'No description provided.'}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status] || 'bg-slate-100 text-slate-700'}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {onToggleStatus && (
          <Button variant="secondary" onClick={onToggleStatus}>
            Update Status
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" onClick={onDelete}>Delete</Button>
        )}
      </div>
    </article>
  );
}
