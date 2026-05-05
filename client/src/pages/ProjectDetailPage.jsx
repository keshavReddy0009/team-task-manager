import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject, useProjects } from '../hooks/useProjects.js';
import { useTasks } from '../hooks/useTasks.js';
import { useAuth } from '../hooks/useAuth.jsx';
import Navbar from '../components/Navbar.jsx';
import Button from '../components/ui/button.jsx';
import Input from '../components/ui/input.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import CreateTaskModal from '../components/modals/CreateTaskModal.jsx';
import TaskDetailModal from '../components/modals/TaskDetailModal.jsx';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { updateProject, deleteProject, addMember, removeMember } = useProjects();
  const projectQuery = useProject(id);
  const [filters, setFilters] = useState({ status: '', priority: '', assigneeId: '' });
  const taskState = useTasks(id, filters);
  const [memberForm, setMemberForm] = useState({ email: '', role: 'MEMBER' });
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [activeTab, setActiveTab] = useState('TASKS');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const project = projectQuery.data;
  const tasks = taskState.tasksQuery.data || [];
  const members = project?.members || [];
  const myMembership = members.find((member) => member.userId === user?.id);
  const isProjectAdmin = user?.role === 'ADMIN' || myMembership?.role === 'ADMIN' || project?.ownerId === user?.id;
  const grouped = useMemo(
    () => ({
      TODO: tasks.filter((task) => task.status === 'TODO'),
      IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS'),
      DONE: tasks.filter((task) => task.status === 'DONE'),
      OVERDUE: tasks.filter((task) => task.status === 'OVERDUE')
    }),
    [tasks]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{project?.name || 'Project'}</h1>
            <p className="mt-2 text-slate-600">{project?.description || 'No description'}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={project?.status === 'ACTIVE' ? 'done' : 'todo'}>{project?.status || 'ACTIVE'}</Badge>
              <span className="text-sm text-slate-700">Owner: {project?.owner?.name || 'Unknown'}</span>
            </div>
          </div>
          {isProjectAdmin ? (
            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!isEditing) {
                    setProjectForm({ name: project?.name || '', description: project?.description || '' });
                  }
                  setIsEditing((prev) => !prev);
                }}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </div>
          ) : null}
        </div>

        {projectQuery.isLoading ? (
          <div className="flex justify-center rounded-xl bg-white p-8">
            <Spinner className="h-6 w-6 text-sky-600" />
          </div>
        ) : projectQuery.isError ? (
          <p className="text-rose-600">Unable to load project.</p>
        ) : (
          <div className="space-y-6">
            {isEditing ? (
              <form
                className="rounded-xl bg-white p-5 shadow-sm"
                onSubmit={async (event) => {
                  event.preventDefault();
                  await updateProject.mutateAsync({ id, data: projectForm });
                  setIsEditing(false);
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Project name"
                    value={projectForm.name || project?.name || ''}
                    onChange={(event) => setProjectForm((p) => ({ ...p, name: event.target.value }))}
                  />
                  <Input
                    placeholder="Description"
                    value={projectForm.description || project?.description || ''}
                    onChange={(event) => setProjectForm((p) => ({ ...p, description: event.target.value }))}
                  />
                </div>
                <Button type="submit" className="mt-3" disabled={updateProject.isLoading}>
                  {updateProject.isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Save
                </Button>
              </form>
            ) : null}

            <div className="flex gap-2">
              <Button variant={activeTab === 'TASKS' ? 'default' : 'secondary'} onClick={() => setActiveTab('TASKS')}>
                Tasks
              </Button>
              <Button variant={activeTab === 'MEMBERS' ? 'default' : 'secondary'} onClick={() => setActiveTab('MEMBERS')}>
                Members
              </Button>
            </div>

            {activeTab === 'TASKS' ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                    <option value="">All status</option>
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                  <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}>
                    <option value="">All priority</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                  <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setFilters((p) => ({ ...p, assigneeId: e.target.value }))}>
                    <option value="">All assignees</option>
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.user?.name}
                      </option>
                    ))}
                  </select>
                  <Button className="ml-auto" onClick={() => setCreateTaskOpen(true)}>
                    Add Task
                  </Button>
                </div>

                {taskState.tasksQuery.isLoading ? (
                  <div className="flex justify-center p-8">
                    <Spinner className="h-6 w-6 text-sky-600" />
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-4">
                    {['TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE'].map((status) => (
                      <div key={status} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-slate-800">{status}</h3>
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs">{grouped[status].length}</span>
                        </div>
                        <div className="space-y-3">
                          {grouped[status].map((task) => {
                            const dueInRed = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                            const assigneeName = task.assignee?.name || 'Unassigned';
                            const initials = assigneeName
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase();
                            return (
                              <button
                                key={task.id}
                                type="button"
                                onClick={() => setSelectedTask(task)}
                                className="w-full rounded-lg bg-white p-3 text-left shadow-sm"
                              >
                                <p className="font-medium text-slate-900">{task.title}</p>
                                <div className="mt-2">
                                  <Badge variant={task.priority.toLowerCase()}>{task.priority}</Badge>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-700">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">{initials}</span>
                                  <span>{assigneeName}</span>
                                </div>
                                <p className={`mt-2 text-xs ${dueInRed ? 'text-red-600' : 'text-slate-600'}`}>
                                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
                {members.length === 0 ? (
                  <EmptyState title="No members" message="Add collaborators to this project." />
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => {
                      const name = member.user?.name || member.name || member.user?.email;
                      const memberInitials = name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();
                      return (
                        <div key={member.userId || member.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold">
                              {memberInitials}
                            </span>
                            <div>
                              <p className="font-medium text-slate-900">{name}</p>
                              <p className="text-sm text-slate-600">{member.user?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={member.role === 'ADMIN' ? 'admin' : 'member'}>{member.role}</Badge>
                            {isProjectAdmin && member.userId !== project.ownerId ? (
                              <Button
                                variant="danger"
                                onClick={() => removeMember.mutate({ projectId: id, userId: member.userId })}
                              >
                                Remove
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isProjectAdmin ? (
                  <form
                    className="mt-6 flex flex-wrap items-end gap-3"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      await addMember.mutateAsync({ projectId: id, data: memberForm });
                      setMemberForm({ email: '', role: 'MEMBER' });
                    }}
                  >
                    <div className="min-w-[220px] flex-1">
                      <label className="mb-1 block text-sm text-slate-700">Email</label>
                      <Input
                        type="email"
                        value={memberForm.email}
                        onChange={(event) => setMemberForm((prev) => ({ ...prev, email: event.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-700">Role</label>
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={memberForm.role}
                        onChange={(event) => setMemberForm((prev) => ({ ...prev, role: event.target.value }))}
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <Button type="submit" disabled={addMember.isLoading}>
                      {addMember.isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                      Add
                    </Button>
                  </form>
                ) : null}
              </section>
            )}
          </div>
        )}
      </main>

      <CreateTaskModal projectId={id} members={members} isOpen={createTaskOpen} onClose={() => setCreateTaskOpen(false)} />
      <TaskDetailModal
        task={selectedTask}
        projectId={id}
        currentUser={user}
        projectMembers={members}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
      />
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteProject.mutateAsync(id);
          setDeleteOpen(false);
          window.location.href = '/projects';
        }}
        title="Delete project?"
        message="This will delete the project and all tasks."
        isLoading={deleteProject.isLoading}
      />
    </div>
  );
}
