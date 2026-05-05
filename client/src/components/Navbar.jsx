import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Button from './ui/button.jsx';
import Badge from './ui/Badge.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-xl font-semibold text-slate-900">TaskFlow</Link>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive ? 'text-sky-700 underline underline-offset-4' : 'text-slate-600 hover:text-slate-900'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive ? 'text-sky-700 underline underline-offset-4' : 'text-slate-600 hover:text-slate-900'}`
            }
          >
            Projects
          </NavLink>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">{user?.name || user?.email}</span>
          <Badge variant={user?.role === 'ADMIN' ? 'admin' : 'member'}>{user?.role || 'MEMBER'}</Badge>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </div>
    </header>
  );
}
