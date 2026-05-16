import React, { useRef } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { UPLOAD_CONFIG } from '../constants/uploadConfig';
import { trackEvent, EVENTS } from '../utils/analytics';

const FileUpload = ({ onFileSelect }) => {
  const { file, error, preview, handleFileChange, clearFile } = useFileUpload();
  const fileInputRef = useRef(null);

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
      if (onFileSelect) onFileSelect(droppedFile);
      trackEvent(EVENTS.FILE_SELECTED, { file_type: droppedFile.type, method: 'drag_and_drop' });
    }
  };

  const onFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
      if (onFileSelect) onFileSelect(selectedFile);
      trackEvent(EVENTS.FILE_SELECTED, { file_type: selectedFile.type, method: 'click_to_browse' });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    clearFile();
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={triggerFileInput}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileInputChange}
          className="hidden"
          accept={UPLOAD_CONFIG.ALLOWED_TYPES.join(',')}
        />

        {!file ? (
          <>
            <div className="p-4 bg-blue-100 rounded-full mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-gray-700">Click or drag to upload</p>
            <p className="text-sm text-gray-500 mt-2">
              Supports: JPG, PNG, WebP, PDF (Max {UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB)
            </p>
          </>
        ) : (
          <div className="w-full">
            <button
              onClick={handleRemove}
              className="absolute top-4 right-4 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex flex-col items-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg shadow-md mb-4"
                />
              ) : (
                <div className="p-6 bg-gray-100 rounded-lg mb-4">
                  {file.type.includes('pdf') ? (
                    <FileText className="w-16 h-16 text-red-500" />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-blue-500" />
                  )}
                </div>
              )}
              <p className="text-sm font-semibold text-gray-800 truncate max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
