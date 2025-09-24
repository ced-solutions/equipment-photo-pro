import React, { useState } from 'react';
import { X, Mail, Key, Loader } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState('email'); // 'email' or 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://equipment-photo-pro.onrender.com'
    : 'http://localhost:5001';

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Verification code sent to your email!');
        setStep('code');
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store session token and user data
        localStorage.setItem('sessionToken', data.sessionToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess('Login successful!');
        
        // Call success callback
        onLoginSuccess(data.user);
        
        // Close modal after a brief delay
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {step === 'email' ? 'Sign In' : 'Enter Code'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  <span>Send Verification Code</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Code Step */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                We sent a 6-digit code to:
              </p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength="6"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Key className="h-5 w-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to email
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            No password required. We'll send you a secure code to sign in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
