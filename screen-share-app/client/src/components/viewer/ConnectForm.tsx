import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { validateRoomCode } from '../../../../shared/utils/validators';
import { cn } from '../../utils/cn';

interface ConnectFormProps {
  onConnect: (roomCode: string) => void;
  disabled?: boolean;
}

export const ConnectForm: React.FC<ConnectFormProps> = ({
  onConnect,
  disabled = false,
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = roomCode.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Please enter a room code');
      return;
    }

    if (!validateRoomCode(trimmedCode)) {
      setError('Room code must be 6 alphanumeric characters');
      return;
    }

    setError(null);
    onConnect(trimmedCode);
  };

  const handleInputChange = (value: string) => {
    // Auto-format input: uppercase, alphanumeric only, max 6 chars
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setRoomCode(formatted);

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Room Code
          </label>
          <Input
            id="roomCode"
            type="text"
            value={roomCode}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className={cn(
              "text-center text-lg font-mono tracking-wider",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            disabled={disabled}
            autoComplete="off"
            autoFocus
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter the 6-character code shared by the host
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={disabled || !roomCode.trim()}
          className="w-full"
          size="lg"
        >
          {disabled ? 'Connecting...' : 'Connect to Room'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Make sure you have the correct room code from the host
        </p>
      </div>
    </div>
  );
};
