import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects.js';
import Navbar from '../components/Navbar.jsx';
import Button from '../components/ui/button.jsx';

export default function ProjectsPage() {
  const { projectsQuery } = useProjects();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">Projects</p>
            <h1 className="text-3xl font-semibold text-slate-900">Your workspace</h1>
          </div>
          <Link to="/projects/new">
            <Button>Create project</Button>
          </Link>
        </div>

        {projectsQuery.isLoading ? (
          <p className="text-slate-600">Loading projects...</p>
        ) : projectsQuery.isError ? (
          <p className="text-rose-600">Unable to load your projects.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projectsQuery.data?.length ? (
              projectsQuery.data.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:shadow-md">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
                      <p className="mt-2 text-sm text-slate-600">{project.description || 'No description provided.'}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">{project.status}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                No projects found. Create your first project to start collaborating.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
