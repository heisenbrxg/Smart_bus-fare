import React, { useState } from 'react';
import { WalletAccount } from '../types';
import { Fingerprint, Smartphone, AlertCircle, CheckCircle, Lock, UserPlus } from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  onLogin: (account: WalletAccount) => void;
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Try to login with backend API
      const response = await api.login(userId, password);

      if (response.success && response.data) {
        setSuccess(true);
        setTimeout(() => {
          onLogin(response.data!);
        }, 800);
      } else {
        setError(response.error || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!userId) {
      setError('Please enter your User ID first');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Verify fingerprint with backend
      const response = await api.loginWithFingerprint(userId);

      if (response.success && response.data) {
        setSuccess(true);
        setTimeout(() => {
          onLogin(response.data!);
        }, 800);
      } else {
        setError(response.error || 'Fingerprint verification failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Fingerprint scanner not available or failed to verify');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl mb-4 shadow-lg">
            <Fingerprint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SmartBus Fare</h1>
          <p className="text-gray-500 text-sm">Fingerprint-Based Travel System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Welcome Back</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* User ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID or Mobile Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter User ID or Mobile"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Demo password: 1234</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Login successful! Redirecting...</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Biometric Login */}
          <button
            onClick={handleBiometricLogin}
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-blue-200 text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Fingerprint className="w-5 h-5" />
            <span>Login with Fingerprint</span>
          </button>

          {/* New User Registration */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
            <button
              onClick={onNavigateToRegister}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-800 transition-all shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              <span>Register New User</span>
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-600 mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-500">User ID: <span className="font-mono font-semibold text-gray-700">1001</span> or <span className="font-mono font-semibold text-gray-700">1002</span></p>
            <p className="text-xs text-gray-500 mt-1">Mobile: <span className="font-mono font-semibold text-gray-700">9876543210</span></p>
            <p className="text-xs text-gray-500 mt-1">Password: <span className="font-mono font-semibold text-gray-700">1234</span></p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Secure • Fast • Contactless
        </p>
      </div>
    </div>
  );
};

export default Login;
