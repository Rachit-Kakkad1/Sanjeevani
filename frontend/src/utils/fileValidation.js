import { UPLOAD_CONFIG } from '../constants/uploadConfig';

/**
 * Enhanced file validation utility
 */
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: UPLOAD_CONFIG.ERROR_MESSAGES.NO_FILE };
  }

  if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: UPLOAD_CONFIG.ERROR_MESSAGES.INVALID_TYPE };
  }

  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return { valid: false, error: UPLOAD_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  return { valid: true, error: null };
};
