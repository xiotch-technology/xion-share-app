import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { copyToClipboard } from '../../utils/helpers';
import { cn } from '../../utils/cn';
import { Check, Copy, RefreshCw } from 'lucide-react';

interface ShareCodeProps {
  roomCode: string;
  onRegenerateCode: () => void;
  isConnected: boolean;
  viewerCount: number;
}

export const ShareCode: React.FC<ShareCodeProps> = ({
  roomCode,
  onRegenerateCode,
  isConnected,
  viewerCount,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopyCode = async () => {
    try {
      await copyToClipboard(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateCode();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Share Code
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Share this code with viewers to connect
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input
            value={roomCode}
            readOnly
            className="text-center font-mono text-lg tracking-wider"
            placeholder="Generating code..."
          />
        </div>
        <Button
          onClick={handleCopyCode}
          variant="outline"
          size="sm"
          className="px-3"
          disabled={!roomCode}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
        <Button
          onClick={handleRegenerate}
          variant="outline"
          size="sm"
          className="px-3"
          disabled={isRegenerating}
        >
          <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
        </Button>
      </div>

      <div className="flex items-center justify-center space-x-4 text-sm">
        <div className={cn(
          "flex items-center space-x-1",
          isConnected ? "text-green-600 dark:text-green-400" : "text-gray-500"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-gray-400"
          )} />
          <span>{isConnected ? 'Connected' : 'Waiting'}</span>
        </div>

        <div className="text-gray-600 dark:text-gray-400">
          {viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Code expires when you stop sharing or refresh the page
      </div>
    </div>
  );
};
