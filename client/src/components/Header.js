import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Menu, X, User, LogOut, BarChart3, Sparkles, Image as ImageIcon } from 'lucide-react';

const Header = ({ showLoginModal, setShowLoginModal, showAdminDashboard, setShowAdminDashboard }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);

  const isActive = (path) => location.pathname === path;

  // Check for existing authentication
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('sessionToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      fetchTrialStatus();
    }
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://equipment-photo-pro.onrender.com'
        : 'http://localhost:5001';
        
      const response = await fetch(`${API_BASE_URL}/api/auth/trial-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrialStatus(data);
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
    setUser(null);
    setTrialStatus(null);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Equipment Photo Pro
              </span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Home
            </Link>
            <Link
              to="/upload"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/upload') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload & Process
            </Link>
            <Link
              to="/pricing"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/pricing') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pricing
            </Link>
          </nav>

          {/* Right side - Authentication or User Account */}
          <div className="flex items-center space-x-4">
            {user ? (
              // User is logged in - show account info
              <div className="flex items-center space-x-3">
                {/* Trial Status Badge */}
                {trialStatus && trialStatus.trialInfo && (
                  <div className="hidden sm:flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                    <Sparkles className="h-3 w-3" />
                    <span>
                      {trialStatus.canProcess ? 
                        `Trial: ${trialStatus.trialInfo.imagesUsed}/30 images, ${trialStatus.trialInfo.daysRemaining} days` :
                        'Trial expired'
                      }
                    </span>
                  </div>
                )}
                
                {/* User Stats */}
                <div className="hidden md:flex items-center space-x-2 bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-xs">
                  <ImageIcon className="h-3 w-3" />
                  <span>{user.imagesProcessedCount || 0} processed</span>
                </div>

                {/* User Email */}
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="max-w-32 truncate">{user.email}</span>
                </div>

                {/* Admin Dashboard Button */}
                {user.isAdmin && (
                  <button
                    onClick={() => setShowAdminDashboard(true)}
                    className="hidden sm:flex items-center space-x-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-xs hover:bg-purple-200 transition-colors"
                  >
                    <BarChart3 className="h-3 w-3" />
                    <span>Admin</span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs hover:bg-gray-200 transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              // User is not logged in - show sign in/up buttons
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="hidden sm:block border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/upload"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/upload') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Upload & Process
              </Link>
              <Link
                to="/pricing"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/pricing') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
            </nav>
            
            {/* Mobile user info */}
            {user && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                
                {trialStatus && trialStatus.trialInfo && (
                  <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-xs">
                    <Sparkles className="h-3 w-3" />
                    <span>
                      {trialStatus.canProcess ? 
                        `Trial: ${trialStatus.trialInfo.imagesUsed}/30 images, ${trialStatus.trialInfo.daysRemaining} days` :
                        'Trial expired'
                      }
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-xs">
                  <ImageIcon className="h-3 w-3" />
                  <span>{user.imagesProcessedCount || 0} images processed</span>
                </div>

                {user.isAdmin && (
                  <button
                    onClick={() => {
                      setShowAdminDashboard(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-md text-xs hover:bg-purple-200 transition-colors w-full"
                  >
                    <BarChart3 className="h-3 w-3" />
                    <span>Admin Dashboard</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-xs hover:bg-gray-200 transition-colors w-full"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Logout</span>
                </button>
              </div>
            )}
            
            {!user && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
