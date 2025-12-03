import React from 'react';
import { cn } from '../../utils/cn';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn('bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Screen Share App. Secure and private screen sharing.
          </p>
        </div>
      </div>
    </footer>
  );
};
