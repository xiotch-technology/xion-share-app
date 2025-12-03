import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ConnectionStatus as ConnectionStatusType } from '../../types';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  message?: string;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  message,
  className,
}) => {
  const getStatusConfig = (status: ConnectionStatusType) => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          text: 'Connected',
        };
      case 'connecting':
        return {
          icon: Wifi,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          text: 'Connecting...',
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          text: 'Disconnected',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          text: 'Connection Error',
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          text: 'Unknown',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium',
        config.bgColor
      )}>
        <Icon className={cn('w-4 h-4', config.color)} />
        <span className={config.color}>{config.text}</span>
      </div>
      {message && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {message}
        </span>
      )}
    </div>
  );
};
