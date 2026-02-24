import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import useAuthStore from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    user, 
    handleGoogleCallback, 
    clearError 
  } = useAuthStore();
  
  const [callbackStatus, setCallbackStatus] = useState(null);
  const [callbackMessage, setCallbackMessage] = useState('');

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const errorParam = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      if (errorParam) {
        setCallbackStatus('error');
        setCallbackMessage(errorDescription || 'Authentication failed');
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }

      if (accessToken) {
        setCallbackStatus('processing');
        setCallbackMessage('Verifying your account...');
        
        try {
          await handleGoogleCallback();
        } catch (error) {
          if (error.message === 'PENDING_APPROVAL') {
            setCallbackStatus('pending');
            setCallbackMessage('Your account is pending approval. Please wait for administrator to activate your account.');
          } else if (error.message === 'PENDING_APPROVAL_NEW') {
            setCallbackStatus('pending_new');
            setCallbackMessage('Your account has been created and is pending approval. Please wait for administrator to activate your account.');
          } else {
            setCallbackStatus('error');
            setCallbackMessage(error.message);
          }
        }
        
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleCallback();
  }, [handleGoogleCallback]);

// Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // 1. Check the role and set the exact paths that match App.jsx
      let redirectPath = '/dashboard'; // Default for master_admin and manager
      
      if (user.role === 'technician') {
        redirectPath = '/my-tasks';
      }

      // 2. Navigate to the correct, existing path
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Reset callback status after delay
  useEffect(() => {
    if (callbackStatus === 'pending' || callbackStatus === 'pending_new') {
      const timer = setTimeout(() => {
        setCallbackStatus(null);
        setCallbackMessage('');
        clearError();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [callbackStatus, clearError]);

  // Processing state
  if (callbackStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Signing you in...</h2>
          <p className="text-gray-500">{callbackMessage}</p>
        </div>
      </div>
    );
  }

  // Pending approval state
  if (callbackStatus === 'pending' || callbackStatus === 'pending_new') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className={`w-16 h-16 ${callbackStatus === 'pending_new' ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {callbackStatus === 'pending_new' ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <Clock className="w-8 h-8 text-yellow-500" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {callbackStatus === 'pending_new' ? 'Account Created!' : 'Pending Approval'}
            </h2>
            <p className="text-gray-600 mb-6">{callbackMessage}</p>
            
            <div className="p-4 bg-blue-50 rounded-xl text-left">
              <p className="text-sm text-blue-800 font-medium">What happens next?</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Administrator will review your account</li>
                <li>• You'll be able to login once approved</li>
                <li>• Contact your administrator for urgent access</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setCallbackStatus(null);
                setCallbackMessage('');
                clearError();
              }}
              className="mt-6 w-full px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (callbackStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{callbackMessage}</p>
          <button
            onClick={() => {
              setCallbackStatus(null);
              setCallbackMessage('');
              clearError();
            }}
            className="w-full px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Normal login page
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
};

export default Login;