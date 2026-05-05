import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import Navbar from '../components/Navbar.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboard();

  const taskStatus = useMemo(
    () => data?.tasksByStatus || [],
    [data]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-sky-600">Dashboard</p>
              <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {user?.name}</h1>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">
              Track projects, tasks, and deadlines in one place.
            </div>
          </div>

          {isLoading ? (
            <p className="text-slate-600">Loading dashboard...</p>
          ) : isError ? (
            <p className="text-rose-600">Unable to load dashboard data.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Projects</p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalProjects ?? 0}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Assigned tasks</p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalTasks ?? 0}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Overdue</p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.overdueTasks ?? 0}</p>
              </div>
            </div>
          )}
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Task status</h2>
            <div className="mt-4 space-y-3">
              {taskStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-medium text-slate-700">{item.status.replace('_', ' ')}</span>
                  <span className="text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Recent tasks</h2>
            <div className="mt-4 space-y-3">
              {data?.recentTasks?.length ? (
                data.recentTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{task.description || 'No description.'}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">{task.status}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No recent tasks available.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
