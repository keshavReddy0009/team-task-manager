import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Button from './ui/button.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-xl font-semibold text-slate-900">Task Manager</Link>
          <Link to="/projects" className="text-sm font-medium text-slate-600 hover:text-slate-900">Projects</Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.email}</span>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </div>
    </header>
  );
}
