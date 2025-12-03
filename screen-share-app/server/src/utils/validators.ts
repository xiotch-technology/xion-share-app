// import { validateRoomCode as clientValidateRoomCode } from '../../shared/utils/validators';

export const validateRoomCode = clientValidateRoomCode;

export const validateUserId = (userId: string): boolean => {
  return typeof userId === 'string' && userId.length > 0 && userId.length <= 100;
};
