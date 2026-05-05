import { Link } from 'react-router-dom';
import Button from '../components/ui/button.jsx';

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-4xl font-semibold text-slate-900">Team Task Manager</h1>
      <p className="mt-4 text-slate-600">Collaborate with your team, track progress, and stay organized.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/login">
          <Button>Log in</Button>
        </Link>
        <Link to="/signup">
          <Button variant="secondary">Create account</Button>
        </Link>
      </div>
    </div>
  );
}
