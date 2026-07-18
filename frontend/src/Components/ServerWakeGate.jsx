import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import logo from '../Assets/olivarezlogo.png';

const HEALTH_URL = `${API_BASE_URL}/health`;
// Render free tier cold starts can take 30-50s; give it a generous window
// before treating it as an actual failure rather than just a slow wake-up.
const TIMEOUT_MS = 60000;

const ServerWakeGate = ({ children }) => {
  const [status, setStatus] = useState('checking'); // checking | ready | error

  const pingServer = () => {
    setStatus('checking');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    fetch(HEALTH_URL, { signal: controller.signal })
      .then((res) => setStatus(res.ok ? 'ready' : 'error'))
      .catch(() => setStatus('error'))
      .finally(() => clearTimeout(timeoutId));
  };

  useEffect(() => {
    pingServer();
  }, []);

  if (status === 'ready') return children;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white px-6">
      <img src={logo} alt="Olivarez General Hospital" className="h-16 w-auto" />

      {status === 'checking' && (
        <>
          <span className="loading loading-spinner loading-lg text-orange-700"></span>
          <p className="text-center text-sm text-gray-600">
            Please wait, we&apos;re loading the content for you...
            <br />
            <span className="text-xs text-gray-400">
              This can take up to a minute on first visit.
            </span>
          </p>
        </>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-gray-600">
            We couldn&apos;t reach the server. Please try again.
          </p>
          <button
            onClick={pingServer}
            className="btn btn-sm border-none bg-orange-700 text-white hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default ServerWakeGate;