import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  // Handle Form Submission
  const handleCreateProject = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    
    if (!name.trim()) return alert('Project name is required');

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const newProject = await response.json();
        // Add the new project to the top of our list immediately
        setProjects([newProject, ...projects]);
        // Clear the form inputs
        setName('');
        setDescription('');
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Issue Tracker Pro</h1>
        <p className="text-gray-600">Active Projects</p>
      </header>

      {/* --- CREATE PROJECT FORM --- */}
      <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Create New Project</h2>
        <div className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Project Name (e.g., E-commerce Redesign)" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea 
            placeholder="Project Description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
         
        </div>
      </form>

      {/* --- PROJECTS GRID --- */}
     {/* --- PROJECTS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{project.description}</p>
            
            {/* THIS is where the link belongs! */}
            <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-4 mt-2">
              <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
              <Link 
                to={`/projects/${project.id}`} 
                className="text-blue-600 hover:underline font-medium"
              >
                View Issues &rarr;
              </Link>
            </div>

          </div>
        ))}
        
        {projects.length === 0 && (
          <p className="text-gray-500 italic col-span-2">No projects found. Create one above!</p>
        )}
      </div>
    </div>
  )
}
