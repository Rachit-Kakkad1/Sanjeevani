export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: 'File is too large. Maximum size is 5MB.',
    INVALID_TYPE: 'Invalid file type. Please upload an image (JPG, PNG, WebP) or PDF.',
    NO_FILE: 'Please select a file to upload.'
  }
};
