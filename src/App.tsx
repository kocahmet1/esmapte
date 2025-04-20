import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ScoreProvider } from './context/ScoreContext';

// Pages
import Home from './pages/Home';

// Reading components
import MCSingle from './pages/Reading/MCSingle';
import MCMulti from './pages/Reading/MCMulti';
import Reorder from './pages/Reading/Reorder';
import DragBlank from './pages/Reading/DragBlank';
import DropdownBlank from './pages/Reading/DropdownBlank';

// Writing components
import Summarize from './pages/Writing/Summarize';
import Essay from './pages/Writing/Essay';

const App: React.FC = () => {
  return (
    <Router>
      <ScoreProvider>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home />} />
          
          {/* Reading routes */}
          <Route path="/reading/mc-single" element={<MCSingle />} />
          <Route path="/reading/mc-multi" element={<MCMulti />} />
          <Route path="/reading/reorder" element={<Reorder />} />
          <Route path="/reading/drag-blank" element={<DragBlank />} />
          <Route path="/reading/dropdown-blank" element={<DropdownBlank />} />
          
          {/* Writing routes */}
          <Route path="/writing/summarize" element={<Summarize />} />
          <Route path="/writing/essay" element={<Essay />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </ScoreProvider>
    </Router>
  );
};

export default App;
