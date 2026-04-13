import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function GithubCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const linkGithub = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');

      if (!code) {
        setError('No authorization code provided by GitHub.');
        return;
      }

      try {
        await axios.post('/api/github/link', { code });
        // Refresh the user profile to pick up the github_linked flag
        await fetchUser();
        navigate('/'); // Redirect to review page
      } catch (err) {
        console.error('Error linking GitHub:', err);
        setError(err.response?.data?.detail || 'Failed to link GitHub account.');
      }
    };

    linkGithub();
  }, [location, navigate, fetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
        {error ? (
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Failed</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Return to App
            </button>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Linking GitHub Account...
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Please wait while we complete the secure handshake.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GithubCallback;
