import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- DRAGGABLE TICKET COMPONENT ---
const IssueCard = ({ issue }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
    data: { status: issue.status }
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`bg-[#1c1c1f] p-4 rounded-xl border ${isDragging ? 'border-indigo-500 shadow-2xl cursor-grabbing' : 'border-[#2d2d30] hover:border-[#4a4a52] cursor-grab'} transition-colors duration-200 shadow-lg flex flex-col gap-3 relative`}
    >
      <p className={`font-medium text-sm leading-relaxed ${issue.status === 'DONE' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
        {issue.title}
      </p>
    </div>
  );
};

// --- DROPPABLE COLUMN COMPONENT ---
const Column = ({ id, title, dotColor, shadowColor, issues }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`flex flex-col min-h-[500px] p-2 rounded-xl transition-colors duration-200 ${isOver ? 'bg-[#2d2d30]/40 ring-1 ring-[#3f3f46]' : ''}`}
    >
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className={`h-2 w-2 rounded-full ${dotColor} ${shadowColor}`}></div>
        <h2 className="font-medium text-gray-400 text-sm">{title}</h2>
        <span className="text-[#3f3f46] text-sm ml-1">{issues.length}</span>
      </div>
      <div className="flex flex-col gap-3">
        {issues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
      </div>
    </div>
  );
};

// --- MAIN BOARD COMPONENT ---
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

  // --- DRAG AND DROP HANDLER ---
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    // If dropped outside a valid column, do nothing
    if (!over) return;

    const issueId = active.id;
    const newStatus = over.id; // 'TODO', 'IN_PROGRESS', or 'DONE'
    const oldStatus = active.data.current.status;

    // Only update if it actually moved to a new column
    if (newStatus !== oldStatus) {
      // Optimistically update the UI instantly for a snappy feel
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));

      // Make the background API call to update the database
      try {
        await fetch(`http://localhost:5000/api/issues/${issueId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (error) {
        console.error("Error updating issue in DB:", error);
      }
    }
  };

  const getIssuesByStatus = (status) => issues.filter(issue => issue.status === status);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto font-sans tracking-wide">
      <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm mb-6 inline-block transition-colors">
        &larr; Back to Workspace
      </Link>
      
      <header className="mb-10 flex justify-between items-end border-b border-[#2d2d30] pb-6 px-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100 tracking-tight">Board <span className="text-gray-600 font-normal ml-2">#{projectId}</span></h1>
        </div>
        
        <form onSubmit={handleCreateIssue} className="flex bg-[#1c1c1f] border border-[#2d2d30] rounded-lg focus-within:border-indigo-500/50 transition-colors overflow-hidden shadow-sm">
          <input 
            type="text" 
            placeholder="Create new issue..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent p-2 px-4 text-sm focus:outline-none text-gray-200 w-64 placeholder-gray-600"
          />
          <button type="submit" className="bg-[#2d2d30] hover:bg-[#3f3f46] text-gray-300 px-4 py-2 text-sm font-medium transition-colors border-l border-[#2d2d30]">
            Add
          </button>
        </form>
      </header>

      {/* DndContext wraps our droppable columns */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column 
            id="TODO" 
            title="Todo" 
            dotColor="bg-gray-500" 
            issues={getIssuesByStatus('TODO')} 
          />
          <Column 
            id="IN_PROGRESS" 
            title="In Progress" 
            dotColor="bg-orange-500" 
            shadowColor="shadow-[0_0_8px_rgba(249,115,22,0.6)]" 
            issues={getIssuesByStatus('IN_PROGRESS')} 
          />
          <Column 
            id="DONE" 
            title="Done" 
            dotColor="bg-indigo-500" 
            shadowColor="shadow-[0_0_8px_rgba(99,102,241,0.6)]" 
            issues={getIssuesByStatus('DONE')} 
          />
        </div>
      </DndContext>
    </div>
  );
}