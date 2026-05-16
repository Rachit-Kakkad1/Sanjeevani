import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Image, X, Check, FileCheck } from 'lucide-react';

const dropZoneVariants = {
  idle: { scale: 1, borderColor: 'rgba(141, 123, 104, 0.4)' },
  hover: { scale: 1.01, borderColor: 'rgba(141, 123, 104, 0.8)' },
  drag: { scale: 1.02, borderColor: 'rgba(34, 197, 94, 0.8)' }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.02, 1],
    opacity: [0.1, 0.2, 0.1],
    transition: { duration: 2, repeat: Infinity }
  }
};

export default function UploadZone({ files, onFilesChange, uploadProgress, uploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles
      .filter(file => file.type === 'application/pdf' || file.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type
      }));
    
    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const removeFile = (id) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
        {!uploadComplete ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={dropZoneVariants}
              initial="idle"
              animate={isDragging ? 'drag' : 'idle'}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              whileHover="hover"
              whileTap={{ scale: 0.995 }}
              className="relative cursor-pointer"
            >
              <motion.div
                variants={pulseVariants}
                animate={isDragging ? 'animate' : ''}
                className="absolute inset-0 rounded-2xl"
                style={{ background: `linear-gradient(135deg, rgba(141, 123, 104, ${isDragging ? 0.15 : 0.08}), rgba(164, 144, 124, ${isDragging ? 0.1 : 0.05}))` }}
              />
              
              <div 
                className="relative border-2 border-dashed rounded-2xl p-6 transition-all"
                style={{ 
                  borderColor: isDragging ? '#22c55e' : 'rgba(141, 123, 104, 0.4)',
                  background: 'rgba(255, 255, 255, 0.4)'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    animate={{ scale: isDragging ? [1, 1.1, 1] : 1 }}
                    className="w-12 h-12 rounded-xl bg-[#8D7B68]/15 flex items-center justify-center mb-3"
                  >
                    <Upload size={24} className="text-[#8D7B68]" />
                  </motion.div>
                  
                  <p className="text-sm font-semibold mb-1" style={{ color: '#1a1a1a' }}>
                    {isDragging ? 'Release to upload' : 'Drop your medical bill here'}
                  </p>
                  <p className="text-xs text-[#8D7B68]/70 mb-3">or click to browse</p>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { icon: FileText, label: 'PDF', color: '#ef4444' },
                      { icon: Image, label: 'Images', color: '#2563eb' }
                    ].map((item) => (
                      <div 
                        key={item.label}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/50 text-xs font-medium"
                        style={{ color: item.color }}
                      >
                        <item.icon size={12} />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 space-y-2"
              >
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-[#8D7B68]/10"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: file.type === 'application/pdf' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)' }}>
                      {file.type === 'application/pdf' ? (
                        <FileText size={14} className="text-[#ef4444]" />
                      ) : (
                        <Image size={14} className="text-[#2563eb]" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#1a1a1a' }}>{file.name}</p>
                      <p className="text-xs text-[#8D7B68]/60">{formatFileSize(file.size)}</p>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                      className="w-6 h-6 rounded-full flex items-center justify-center bg-[#ef4444]/10"
                    >
                      <X size={12} className="text-[#ef4444]" />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {uploadProgress !== null && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 p-3 rounded-lg bg-white/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: '#8D7B68' }}>Processing</span>
                  <span className="text-xs font-bold" style={{ color: '#8D7B68' }}>{Math.min(Math.round(uploadProgress), 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#8D7B68]/15 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: '#8D7B68' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(uploadProgress, 100)}%` }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <Check size={28} className="text-[#22c55e] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#22c55e]">Upload Complete!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
