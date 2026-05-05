import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject, useProjects } from '../hooks/useProjects.js';
import { useTasks } from '../hooks/useTasks.js';
import Navbar from '../components/Navbar.jsx';
import TaskCard from '../components/TaskCard.jsx';
import Button from '../components/ui/button.jsx';
import Input from '../components/ui/input.jsx';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateProject, addMember, removeMember } = useProjects();
  const projectQuery = useProject(id);
  const taskState = useTasks(id);
  const [memberForm, setMemberForm] = useState({ email: '', role: 'MEMBER' });
  const [projectForm, setProjectForm] = useState({ name: '', description: '', status: 'ACTIVE' });
  const [error, setError] = useState('');

  const project = projectQuery.data;
  const tasks = taskState.tasksQuery.data || [];

  const canEdit = project?.ownerId !== undefined;

  useEffect(() => {
    if (project) {
      setProjectForm({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'ACTIVE'
      });
    }
  }, [project]);

  const handleProjectChange = (event) => {
    setProjectForm({ ...projectForm, [event.target.name]: event.target.value });
  };

  const handleProjectSave = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await updateProject.mutateAsync({ id, data: projectForm });
      projectQuery.refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update project');
    }
  };

  const handleMemberChange = (event) => {
    setMemberForm({ ...memberForm, [event.target.name]: event.target.value });
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await addMember.mutateAsync({ projectId: id, data: memberForm });
      projectQuery.refetch();
      setMemberForm({ email: '', role: 'MEMBER' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add member');
    }
  };

  const statusLabel = (status) => status.replace('_', ' ');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">Project details</p>
            <h1 className="text-3xl font-semibold text-slate-900">{project?.name || 'Project'}</h1>
          </div>
          <Button variant="secondary" onClick={() => navigate('/projects')}>Back to projects</Button>
        </div>

        {projectQuery.isLoading ? (
          <p className="text-slate-600">Loading project...</p>
        ) : projectQuery.isError ? (
          <p className="text-rose-600">Unable to load project.</p>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">About this project</h2>
              <p className="mt-3 text-slate-600">{project?.description || 'No description available.'}</p>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="font-semibold text-slate-900">{project?.status}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Members</span>
                  <span className="font-semibold text-slate-900">{project?.members?.length ?? 0}</span>
                </div>
              </div>

              {canEdit && (
                <form onSubmit={handleProjectSave} className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Update project</h3>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                    <Input name="name" value={projectForm.name} onChange={handleProjectChange} placeholder="Project name" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      name="description"
                      value={projectForm.description}
                      onChange={handleProjectChange}
                      rows="4"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="Project description"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                    <select
                      name="status"
                      value={projectForm.status}
                      onChange={handleProjectChange}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  {error && <p className="text-sm text-rose-600">{error}</p>}
                  <Button type="submit">Save project</Button>
                </form>
              )}
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Project members</h3>
                <div className="mt-4 space-y-3">
                  {project?.members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{member.user.email}</p>
                        <p className="text-sm text-slate-600">{member.role}</p>
                      </div>
                      {canEdit && member.userId !== project.ownerId && (
                        <Button variant="danger" size="sm" onClick={() => removeMember.mutateAsync({ projectId: id, userId: member.userId })}>
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {canEdit && (
                  <form onSubmit={handleAddMember} className="mt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-slate-900">Invite member</h4>
                    <Input name="email" value={memberForm.email} onChange={handleMemberChange} placeholder="Member email" />
                    <select
                      name="role"
                      value={memberForm.role}
                      onChange={handleMemberChange}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <Button type="submit">Invite member</Button>
                  </form>
                )}
              </section>
            </aside>
          </div>
        )}

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Project tasks</h2>
              <p className="text-sm text-slate-600">Manage all tasks for this project.</p>
            </div>
          </div>

          {taskState.tasksQuery.isLoading ? (
            <p className="text-slate-600">Loading tasks...</p>
          ) : taskState.tasksQuery.isError ? (
            <p className="text-rose-600">Unable to load project tasks.</p>
          ) : (
            <div className="space-y-4">
              {tasks.length ? (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={() => taskState.updateTaskStatus.mutateAsync({ taskId: task.id, status: task.status === 'DONE' ? 'TODO' : 'DONE' })}
                    onDelete={() => taskState.deleteTask.mutateAsync(task.id)}
                  />
                ))
              ) : (
                <p className="text-slate-500">No tasks yet for this project.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
