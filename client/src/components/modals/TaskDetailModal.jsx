import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTasks } from '../../hooks/useTasks.js';
import Modal from '../ui/Modal.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/button.jsx';
import Input from '../ui/input.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function TaskDetailModal({ task, projectId, currentUser, projectMembers, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const { updateTask, updateTaskStatus, deleteTask } = useTasks(projectId);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate ? String(task.dueDate).slice(0, 10) : '',
    assigneeId: task?.assigneeId || ''
  });

  const isProjectAdmin = useMemo(() => {
    const memberRecord = projectMembers?.find((member) => (member.userId || member.id) === currentUser?.id);
    return currentUser?.role === 'ADMIN' || memberRecord?.role === 'ADMIN';
  }, [currentUser?.id, currentUser?.role, projectMembers]);
  const canEdit = task?.creatorId === currentUser?.id || isProjectAdmin;
  const canChangeStatus = task?.assigneeId === currentUser?.id || isProjectAdmin;
  const dateInRed = task?.dueDate && new Date(task.dueDate) < new Date() && task?.status !== 'DONE';

  useEffect(() => {
    setForm({
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? String(task.dueDate).slice(0, 10) : '',
      assigneeId: task?.assigneeId || ''
    });
    setIsEditing(false);
  }, [task]);

  if (!task) return null;

  const onSave = async (event) => {
    event.preventDefault();
    await updateTask.mutateAsync({ taskId: task.id, data: { ...form, assigneeId: form.assigneeId || null } });
    setIsEditing(false);
    onClose();
  };

  const onDelete = async () => {
    await deleteTask.mutateAsync(task.id);
    await queryClient.invalidateQueries(['tasks', projectId]);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
        <div className="space-y-4 text-sm">
          {!isEditing ? (
            <>
              <h3 className="text-xl font-semibold text-slate-900">{task.title}</h3>
              <p className="text-slate-600">{task.description || 'No description'}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={task.priority.toLowerCase()}>{task.priority}</Badge>
                <Badge variant={task.status.toLowerCase()}>{task.status}</Badge>
              </div>
              <p className={dateInRed ? 'text-red-600' : 'text-slate-700'}>
                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
              </p>
              <p className="text-slate-700">Assignee: {task.assignee?.name || 'Unassigned'}</p>
              <p className="text-slate-700">Creator: {task.creator?.name || 'Unknown'}</p>

              {canChangeStatus ? (
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  value={task.status}
                  onChange={(event) => updateTaskStatus.mutate({ taskId: task.id, status: event.target.value })}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              ) : null}
              <div className="flex justify-end gap-3">
                {canEdit ? (
                  <Button type="button" variant="secondary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                ) : null}
                {canEdit ? (
                  <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>
                    Delete
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <form onSubmit={onSave} className="space-y-3">
              <Input value={form.title} onChange={(event) => setForm((p) => ({ ...p, title: event.target.value }))} required />
              <textarea
                value={form.description}
                onChange={(event) => setForm((p) => ({ ...p, description: event.target.value }))}
                rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.priority}
                  onChange={(event) => setForm((p) => ({ ...p, priority: event.target.value }))}
                  className="rounded-md border border-slate-300 px-3 py-2"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
                <Input type="date" value={form.dueDate} onChange={(event) => setForm((p) => ({ ...p, dueDate: event.target.value }))} />
              </div>
              <select
                value={form.assigneeId}
                onChange={(event) => setForm((p) => ({ ...p, assigneeId: event.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="">Unassigned</option>
                {(projectMembers || []).map((member) => {
                  const id = member.userId || member.id;
                  const name = member.user?.name || member.name;
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTask.isLoading}>
                  {updateTask.isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Save
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        title="Delete task?"
        message="This action cannot be undone."
        isLoading={deleteTask.isLoading}
      />
    </>
  );
}
