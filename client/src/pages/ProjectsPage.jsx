import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects.js';
import { useAuth } from '../hooks/useAuth.jsx';
import Navbar from '../components/Navbar.jsx';
import Button from '../components/ui/button.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useState } from 'react';

export default function ProjectsPage() {
  const { projectsQuery, updateProject } = useProjects();
  const { user } = useAuth();
  const [tab, setTab] = useState('ALL');

  const data = projectsQuery.data;
  console.log('Projects API:', data);
  const projects = data || [];
  const filteredProjects = projects.filter((project) => (tab === 'ALL' ? true : project.status === tab));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
          </div>
          <Link to="/projects/new">
            <Button>New Project</Button>
          </Link>
        </div>

        <div className="mb-6 flex gap-2">
          {['ALL', 'ACTIVE', 'ARCHIVED'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${tab === value ? 'bg-sky-600 text-white' : 'bg-white text-slate-700'}`}
            >
              {value === 'ALL' ? 'All' : value === 'ACTIVE' ? 'Active' : 'Archived'}
            </button>
          ))}
        </div>

        {projectsQuery.isLoading ? (
          <div className="flex justify-center rounded-xl bg-white p-8">
            <Spinner className="h-6 w-6 text-sky-600" />
          </div>
        ) : projectsQuery.isError ? (
          <p className="text-rose-600">Unable to load your projects.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredProjects.length ? (
              filteredProjects.map((project) => {
                const isGlobalAdmin = user?.role === 'ADMIN';
                const memberRecord = project.members?.find((member) => member.userId === user?.id);
                const isProjectAdmin = memberRecord?.role === 'ADMIN' || project.ownerId === user?.id;
                const canArchive = isGlobalAdmin || isProjectAdmin;
                return (
                  <div key={project.id} className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <Link to={`/projects/${project.id}`}>
                        <h2 className="text-lg font-semibold text-slate-900 hover:text-sky-700">{project.name}</h2>
                      </Link>
                      <Badge variant={project.status === 'ACTIVE' ? 'done' : 'todo'}>{project.status}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{project.description || 'No description provided.'}</p>
                    <p className="mt-3 text-sm text-slate-700">Owner: {project.owner?.name || 'Unknown'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        Members: {project.members?.length ?? 0}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        Tasks: {project.taskCount ?? project.tasks?.length ?? 0}
                      </span>
                    </div>
                    {canArchive && project.status === 'ACTIVE' ? (
                      <Button
                        variant="secondary"
                        className="mt-4"
                        onClick={() => updateProject.mutate({ id: project.id, data: { status: 'ARCHIVED' } })}
                      >
                        Archive
                      </Button>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="md:col-span-2">
                <EmptyState title="No projects found" message="Create a new project to get started." />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
