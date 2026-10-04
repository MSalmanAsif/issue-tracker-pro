import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjects([newProject, ...projects]);
        setName('');
        setDescription('');
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto font-sans tracking-wide">
      <header className="mb-10 border-b border-[#2d2d30] pb-6">
        <h1 className="text-3xl font-semibold text-gray-100 tracking-tight">Workspaces</h1>
        <p className="text-gray-500 mt-2">Manage your active projects</p>
      </header>

      {/* --- CREATE PROJECT FORM --- */}
      <form onSubmit={handleCreateProject} className="bg-[#1c1c1f] p-6 rounded-xl border border-[#2d2d30] mb-10 shadow-lg">
        <h2 className="text-sm font-medium mb-4 text-gray-300 tracking-wide uppercase">New Workspace</h2>
        <div className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Project Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border border-[#2d2d30] p-3 rounded-lg focus:outline-none focus:border-indigo-500/50 text-gray-200 placeholder-gray-600 transition-colors"
          />
          <textarea 
            placeholder="Project Description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-transparent border border-[#2d2d30] p-3 rounded-lg focus:outline-none focus:border-indigo-500/50 text-gray-200 placeholder-gray-600 h-24 resize-none transition-colors"
          />
          <button 
            type="submit" 
            className="bg-indigo-600 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-indigo-700 transition-colors w-fit text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            Create Workspace
          </button>
        </div>
      </form>

      {/* --- PROJECTS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((project) => (
          <div key={project.id} className="bg-[#1c1c1f] p-6 rounded-xl border border-[#2d2d30] hover:border-[#4a4a52] transition-all duration-200 group shadow-lg flex flex-col">
            <h3 className="text-lg font-medium text-gray-200 mb-2">{project.name}</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">{project.description}</p>
            
            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-[#2d2d30] pt-4 mt-auto">
              <span>{new Date(project.created_at).toLocaleDateString()}</span>
              <Link 
                to={`/projects/${project.id}`} 
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Open Board &rarr;
              </Link>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <p className="text-gray-600 italic col-span-2 text-sm">No workspaces found. Create your first one above.</p>
        )}
      </div>
    </div>
  )
}