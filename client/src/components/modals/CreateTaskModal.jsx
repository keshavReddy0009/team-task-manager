import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks.js';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/input.jsx';
import Button from '../ui/button.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function CreateTaskModal({ projectId, members, isOpen, onClose }) {
  const { createTask } = useTasks(projectId);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: ''
  });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createTask.mutateAsync({
        ...form,
        assigneeId: form.assigneeId || undefined,
        dueDate: form.dueDate || undefined
      });
      setIsSuccess(true);
      setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create task');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
          <Input required value={form.title} onChange={(event) => setForm((p) => ({ ...p, title: event.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={form.description}
            onChange={(event) => setForm((p) => ({ ...p, description: event.target.value }))}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={form.priority}
            onChange={(event) => setForm((p) => ({ ...p, priority: event.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <Input type="date" value={form.dueDate} onChange={(event) => setForm((p) => ({ ...p, dueDate: event.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Assignee</label>
          <select
            value={form.assigneeId}
            onChange={(event) => setForm((p) => ({ ...p, assigneeId: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {(members || []).map((member) => (
              <option key={member.userId || member.id} value={member.userId || member.id}>
                {member.user?.name || member.name}
              </option>
            ))}
          </select>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {isSuccess ? <p className="text-sm text-green-600">Task created successfully.</p> : null}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createTask.isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTask.isLoading}>
            {createTask.isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
