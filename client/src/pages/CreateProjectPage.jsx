import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects.js';
import Navbar from '../components/Navbar.jsx';
import Input from '../components/ui/input.jsx';
import Button from '../components/ui/button.jsx';

export default function CreateProjectPage() {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { createProject } = useProjects();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await createProject.mutateAsync(form);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create project');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm shadow-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">Create a new project</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Project name</label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Project name" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Optional project details"
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit">Create project</Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/projects')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
