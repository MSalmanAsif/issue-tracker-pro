import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function IssueBoard() {
  const { projectId } = useParams();
  const [issues, setIssues] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/projects/${projectId}/issues`)
      .then((res) => res.json())
      .then((data) => setIssues(data))
      .catch((err) => console.error("Error fetching issues:", err));
  }, [projectId]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const newIssue = await response.json();
        setIssues([newIssue, ...issues]);
        setTitle('');
      }
    } catch (error) {
      console.error("Error creating issue:", error);
    }
  };

  // NEW: Function to update ticket status in the database and UI
  const moveIssue = async (issueId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/issues/${issueId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the local state so the ticket instantly moves on screen
        setIssues(issues.map(issue => 
          issue.id === issueId ? { ...issue, status: newStatus } : issue
        ));
      }
    } catch (error) {
      console.error("Error updating issue:", error);
    }
  };

  const getIssuesByStatus = (status) => issues.filter(issue => issue.status === status);

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block font-medium">
        &larr; Back to Projects
      </Link>
      
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Board</h1>
          <p className="text-gray-600">Managing issues for Project ID: {projectId}</p>
        </div>
        
        <form onSubmit={handleCreateIssue} className="flex gap-2">
          <input 
            type="text" 
            placeholder="What needs to be done?" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-gray-900">
            Add Ticket
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TODO Column */}
        <div className="bg-gray-100 p-4 rounded-lg min-h-[500px]">
          <h2 className="font-bold text-gray-700 mb-4 border-b pb-2 flex justify-between">
            TODO <span className="bg-gray-200 text-gray-600 px-2 rounded-full text-sm">{getIssuesByStatus('TODO').length}</span>
          </h2>
          <div className="flex flex-col gap-3">
            {getIssuesByStatus('TODO').map(issue => (
              <div key={issue.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 group">
                <p className="font-medium text-gray-800 mb-3">{issue.title}</p>
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveIssue(issue.id, 'IN_PROGRESS')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 font-medium">
                    Start &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="bg-gray-100 p-4 rounded-lg min-h-[500px]">
          <h2 className="font-bold text-gray-700 mb-4 border-b pb-2 flex justify-between">
            IN PROGRESS <span className="bg-gray-200 text-gray-600 px-2 rounded-full text-sm">{getIssuesByStatus('IN_PROGRESS').length}</span>
          </h2>
          <div className="flex flex-col gap-3">
            {getIssuesByStatus('IN_PROGRESS').map(issue => (
              <div key={issue.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 group">
                <p className="font-medium text-gray-800 mb-3">{issue.title}</p>
                <div className="flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveIssue(issue.id, 'TODO')} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">
                    &larr; Back
                  </button>
                  <button onClick={() => moveIssue(issue.id, 'DONE')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 font-medium">
                    Complete &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DONE Column */}
        <div className="bg-gray-100 p-4 rounded-lg min-h-[500px]">
          <h2 className="font-bold text-gray-700 mb-4 border-b pb-2 flex justify-between">
            DONE <span className="bg-gray-200 text-gray-600 px-2 rounded-full text-sm">{getIssuesByStatus('DONE').length}</span>
          </h2>
          <div className="flex flex-col gap-3">
            {getIssuesByStatus('DONE').map(issue => (
              <div key={issue.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 group">
                <p className="font-medium text-gray-500 line-through mb-3">{issue.title}</p>
                <div className="flex justify-start opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveIssue(issue.id, 'IN_PROGRESS')} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">
                    &larr; Reopen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}