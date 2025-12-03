import { generateRoomCode as clientGenerateRoomCode } from '../../../shared/utils/codeGenerator';

export const generateRoomCode = clientGenerateRoomCode;

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatRoomCode = (code: string): string => {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
};
