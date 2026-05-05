import Navbar from '../components/Navbar.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useDashboard } from '../hooks/useDashboard.js';

const isOverdueDate = (date, status) => {
  if (!date || status === 'DONE') return false;
  return new Date(date) < new Date();
};

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  const stats = {
    totalProjects: data?.totalProjects || 0,
    totalTasks: data?.totalTasks || 0,
    inProgress: data?.tasksByStatus?.IN_PROGRESS || 0,
    overdue: data?.tasksByStatus?.OVERDUE || 0
  };
  const myTasks = data?.myTasks || [];
  const overdueTasks = data?.overdueTasks || [];
  const recentTasks = data?.recentTasks || [];

  if (isLoading) return <Spinner className="h-6 w-6 text-sky-600" />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {isError ? (
          <p className="rounded-xl bg-white p-6 text-red-600">Unable to load dashboard data.</p>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-blue-50 p-5">
                <p className="text-sm text-blue-700">Total Projects</p>
                <p className="mt-2 text-3xl font-semibold text-blue-900">{stats.totalProjects}</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-5">
                <p className="text-sm text-purple-700">Total Tasks</p>
                <p className="mt-2 text-3xl font-semibold text-purple-900">{stats.totalTasks}</p>
              </div>
              <div className="rounded-xl bg-yellow-50 p-5">
                <p className="text-sm text-yellow-700">In Progress</p>
                <p className="mt-2 text-3xl font-semibold text-yellow-900">{stats.inProgress}</p>
              </div>
              <div className={`rounded-xl p-5 ${stats.overdue > 0 ? 'bg-red-100 ring-2 ring-red-300' : 'bg-red-50'}`}>
                <p className="text-sm text-red-700">Overdue</p>
                <p className="mt-2 text-3xl font-semibold text-red-900">{stats.overdue}</p>
              </div>
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">My Tasks</h2>
              {myTasks.length === 0 ? (
                <div className="mt-4">
                  <EmptyState title="No tasks assigned" message="Tasks assigned to you will appear here." />
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="text-left text-slate-600">
                        <th className="py-2 pr-4">Task title</th>
                        <th className="py-2 pr-4">Project</th>
                        <th className="py-2 pr-4">Priority</th>
                        <th className="py-2 pr-4">Due date</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myTasks.map((task) => (
                        <tr key={task.id} className="text-slate-800">
                          <td className="py-3 pr-4">{task.title}</td>
                          <td className="py-3 pr-4">{task.project?.name || '-'}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={(task.priority || 'LOW').toLowerCase()}>{task.priority || 'LOW'}</Badge>
                          </td>
                          <td className={`py-3 pr-4 ${isOverdueDate(task.dueDate, task.status) ? 'text-red-600' : ''}`}>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3">
                            <Badge variant={(task.status || 'TODO').toLowerCase()}>{task.status || 'TODO'}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {overdueTasks.length > 0 ? (
              <section className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Overdue Tasks</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {overdueTasks.map((task) => {
                    const daysOverdue = Math.max(
                      1,
                      Math.ceil((Date.now() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                    );
                    return (
                      <div key={task.id} className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="font-semibold text-red-900">{task.title}</p>
                        <p className="text-sm text-red-700">{task.project?.name}</p>
                        <p className="mt-2 text-sm text-red-700">{daysOverdue} day(s) overdue</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {recentTasks.length > 0 ? (
              <section className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {recentTasks.map((task) => (
                    <li key={task.id} className="rounded-md bg-slate-50 px-3 py-2">
                      {task.title}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
