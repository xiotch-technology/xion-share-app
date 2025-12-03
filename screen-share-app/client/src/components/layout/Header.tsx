import React from 'react';
import { Monitor, Users } from 'lucide-react';
import { cn } from '../../utils/cn';

interface HeaderProps {
  title?: string;
  roomCode?: string;
  viewerCount?: number;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Screen Share',
  roomCode,
  viewerCount,
  className,
}) => {
  return (
    <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Monitor className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {roomCode && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Room:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                  {roomCode}
                </code>
              </div>
            )}

            {viewerCount !== undefined && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{viewerCount} viewer{viewerCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
