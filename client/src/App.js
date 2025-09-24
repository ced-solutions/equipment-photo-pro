import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Upload from './pages/Upload';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const handleLoginSuccess = (user) => {
    // Force a page reload to update the header with new user state
    window.location.reload();
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          showLoginModal={showLoginModal}
          setShowLoginModal={setShowLoginModal}
          showAdminDashboard={showAdminDashboard}
          setShowAdminDashboard={setShowAdminDashboard}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
        
        {/* Global Modals */}
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <AdminDashboard 
          isOpen={showAdminDashboard}
          onClose={() => setShowAdminDashboard(false)}
        />
      </div>
    </Router>
  );
}

export default App;
