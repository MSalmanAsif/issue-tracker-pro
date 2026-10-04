import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Projects from './pages/Projects';
import IssueBoard from './pages/IssueBoard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The home page shows the list of projects */}
        <Route path="/" element={<Projects />} />
        
        {/* The dynamic route shows the board for a specific project */}
        <Route path="/projects/:projectId" element={<IssueBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;