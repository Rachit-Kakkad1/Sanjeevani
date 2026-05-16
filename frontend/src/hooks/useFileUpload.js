import { useState, useCallback } from 'react';
import { validateFile } from '../utils/fileValidation';

export const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = useCallback((selectedFile) => {
    setError(null);
    
    if (!selectedFile) return;

    const { valid, error: validationError } = validateFile(selectedFile);
    
    if (!valid) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
    setPreview(null);
  }, []);

  return {
    file,
    error,
    preview,
    handleFileChange,
    clearFile
  };
};
