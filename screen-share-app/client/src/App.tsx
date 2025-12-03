import { useState } from 'react';
import { HostController } from './components/host/HostController';
import { ViewerController } from './components/viewer/ViewerController';
import { Button } from './components/common/Button';

type AppMode = 'home' | 'host' | 'viewer';

function App() {
  const [mode, setMode] = useState<AppMode>('home');

  const handleBackToHome = () => {
    setMode('home');
  };

  if (mode === 'host') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Screen Share Host
            </h1>
            <Button onClick={handleBackToHome} variant="outline">
              Back to Home
            </Button>
          </div>
          <HostController />
        </div>
      </div>
    );
  }

  if (mode === 'viewer') {
    return <ViewerController onConnectionChange={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Screen Share
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Share your screen securely with anyone, anywhere
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Share Your Screen
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start sharing your screen and generate a secure room code for viewers to connect.
              </p>
              <Button
                onClick={() => setMode('host')}
                className="w-full"
                size="lg"
              >
                Start Sharing
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                View a Screen
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter a room code to connect and view someone's shared screen in real-time.
              </p>
              <Button
                onClick={() => setMode('viewer')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Join Session
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Secure • Real-time • No downloads required</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
