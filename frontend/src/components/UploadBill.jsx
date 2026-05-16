import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Upload, FileText, Image, Camera, X, CheckCircle, 
  Sparkles, Zap, ArrowRight, Loader2, FileCheck, AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const dropZoneVariants = {
  idle: { 
    scale: 1,
    borderColor: '#8D7B68',
    boxShadow: '0 0 0 0 rgba(141, 123, 104, 0)'
  },
  hover: { 
    scale: 1.02,
    borderColor: '#A4907C',
    boxShadow: '0 20px 40px -10px rgba(141, 123, 104, 0.3)'
  },
  drag: { 
    scale: 1.05,
    borderColor: '#22c55e',
    boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.4)'
  }
};

const fileItemVariants = {
  hidden: { opacity: 0, scale: 0.5, x: -20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    x: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.5, 
    x: 20,
    transition: { duration: 0.2 }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.3, 0.5, 0.3],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
};

const floatVariants = {
  animate: {
    y: [0, -10, 0],
    rotate: [0, 5, -5, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
};

const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 3, repeat: Infinity, ease: 'linear' }
  }
};

function ConfettiPiece({ delay, side }) {
  const colors = ['#8D7B68', '#A4907C', '#C8B6A6', '#22c55e', '#2563eb'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      initial={{ x: side === 'left' ? -20 : 20, y: 0, opacity: 0 }}
      animate={{ 
        x: side === 'left' ? Math.random() * 400 + 200 : Math.random() * -400 - 200,
        y: Math.random() * -300 - 100,
        opacity: [1, 1, 0],
        rotate: Math.random() * 720
      }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        width: Math.random() * 8 + 4,
        height: Math.random() * 8 + 4,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        backgroundColor: color,
        left: '50%',
        top: '50%'
      }}
    />
  );
}

export default function UploadBill({ onNavigateToDashboard }) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const controls = useAnimation();

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
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleRealUpload = async () => {
    if (files.length === 0) return;
    setUploadProgress(10);
    
    const formData = new FormData();
    formData.append('file', files[0].file);

    try {
      const res = await fetch(`${API_BASE_URL}/bills/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      const jobId = data.data.jobId;
      setUploadProgress(20);

      // Transition to SSE
      const eventSource = new EventSource(`${API_BASE_URL}/bills/job/${jobId}/stream`);

      eventSource.onmessage = (e) => {
        const payload = JSON.parse(e.data);
        
        switch (payload.status) {
          case 'QUEUED':
            setUploadProgress(30);
            break;
          case 'PROCESSING':
            setUploadProgress(prev => Math.min(prev + 5, 90)); // Simulate progressive load
            break;
          case 'COMPLETED':
            eventSource.close();
            setUploadProgress(100);
            setTimeout(() => {
              setUploadComplete(true);
              setAuditResult(payload.result);
            }, 500);
            break;
          case 'FAILED_OCR':
          case 'FAILED_MATCH':
          case 'TIMEOUT':
            eventSource.close();
            alert('Analysis Interrupted: ' + payload.error);
            setUploadProgress(null);
            break;
          default:
            break;
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        alert('Network connection to stream lost.');
        setUploadProgress(null);
      };
      
    } catch (err) {
      alert('Upload failed: ' + err.message);
      setUploadProgress(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const resetUpload = () => {
    setFiles([]);
    setUploadProgress(null);
    setUploadComplete(false);
  };

  if (uploadComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: '#E3D5CA' }}
      >
        <div className="relative">
          {[...Array(20)].map((_, i) => (
            <ConfettiPiece key={i} delay={i * 0.05} side={i % 2 === 0 ? 'left' : 'right'} />
          ))}
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#22c55e]/20 flex items-center justify-center"
            >
              <CheckCircle size={48} className="text-[#22c55e]" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-serif font-bold mb-3"
              style={{ color: '#8D7B68' }}
            >
              Analysis Complete!
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-[#8D7B68] mb-8 w-full max-w-lg mx-auto text-left bg-white p-6 rounded-2xl shadow-sm border border-[#8D7B68]/20"
            >
              {auditResult ? (
                <>
                  <div className="flex justify-between font-bold text-lg mb-4 border-b pb-2">
                    <span>Total Charged:</span>
                    <span>${auditResult.totalCharged.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mb-4 text-[#ef4444] border-b pb-2">
                    <span>Overcharge Detected:</span>
                    <span>${auditResult.totalOvercharge.toFixed(2)}</span>
                  </div>
                  <h3 className="font-semibold mb-2">Item Breakdown:</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {auditResult.items.map((item, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border ${item.isOvercharged ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between">
                          <span className="font-medium truncate max-w-[200px]" title={item.rawName}>{item.rawName}</span>
                          <span>${item.totalPrice.toFixed(2)}</span>
                        </div>
                        {item.isOvercharged && (
                          <div className="text-xs text-red-600 mt-1">
                            Overcharged by ${item.overchargeAmount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p>Results are being prepared...</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetUpload}
                className="px-8 py-3 rounded-2xl font-semibold border-2"
                style={{ borderColor: '#8D7B68', color: '#8D7B68' }}
              >
                Upload Another
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateToDashboard}
                className="px-8 py-3 rounded-2xl font-semibold text-white"
                style={{ backgroundColor: '#8D7B68' }}
              >
                Go to Dashboard
                <ArrowRight size={18} className="inline ml-2" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-6 md:p-12"
      style={{ backgroundColor: '#E3D5CA' }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div variants={itemVariants} className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateToDashboard}
            className="flex items-center gap-2 text-[#8D7B68] font-medium hover:opacity-70 transition-opacity"
          >
            <ArrowRight size={18} className="rotate-180" />
            Back to Dashboard
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div
            animate={floatVariants.animate}
            className="inline-flex"
          >
            <Sparkles size={32} className="text-[#8D7B68] mr-3 mt-1" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4" style={{ color: '#8D7B68' }}>
            Upload Your Medical Bill
          </h1>
          <p className="text-lg text-[#8D7B68]/80 max-w-2xl mx-auto">
            Drag and drop your bill, click to browse, or snap a photo — we accept PDF and images
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.div
            variants={dropZoneVariants}
            initial="idle"
            animate={isDragging ? 'drag' : 'idle'}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            className="relative cursor-pointer"
          >
            <motion.div
              variants={pulseVariants}
              animate={isDragging ? 'animate' : ''}
              className="absolute inset-0 rounded-3xl"
              style={{ 
                background: `linear-gradient(135deg, rgba(141, 123, 104, 0.1), rgba(164, 144, 124, 0.1))`,
              }}
            />
            
            <div className="relative border-2 border-dashed rounded-3xl p-12 md:p-20 transition-all bg-white/30 backdrop-blur-sm">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <motion.div
                animate={{ y: isDragging ? -10 : 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ 
                    scale: isDragging ? [1, 1.2, 1] : 1,
                    rotate: isDragging ? [0, 10, -10, 0] : 0
                  }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 rounded-2xl bg-[#8D7B68]/10 flex items-center justify-center mb-6"
                >
                  <Upload size={36} className="text-[#8D7B68]" />
                </motion.div>
                
                <p className="text-xl font-semibold mb-2" style={{ color: '#8D7B68' }}>
                  {isDragging ? 'Drop your file here!' : 'Drag & drop your bill here'}
                </p>
                <p className="text-[#8D7B68]/60 mb-6">or click to browse files</p>
                
                <div className="flex flex-wrap justify-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#8D7B68]/10 text-sm"
                    style={{ color: '#8D7B68' }}
                  >
                    <FileText size={16} /> PDF
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#8D7B68]/10 text-sm"
                    style={{ color: '#8D7B68' }}
                  >
                    <Image size={16} /> Images
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#8D7B68]/10 text-sm"
                    style={{ color: '#8D7B68' }}
                  >
                    <Camera size={16} /> Photo
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCameraCapture}
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold"
              style={{ backgroundColor: '#8D7B68', color: 'white' }}
            >
              <Camera size={20} />
              Take Photo
            </motion.button>
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold" style={{ color: '#8D7B68' }}>
                  Selected Files ({files.length})
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium underline"
                  style={{ color: '#8D7B68' }}
                >
                  Add more
                </motion.button>
              </div>
              
              <div className="space-y-3">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <motion.div
                      key={file.id}
                      variants={fileItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-[#8D7B68]/20"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: '#8D7B68'/10 }}
                      >
                        {file.type === 'application/pdf' ? (
                          <FileText size={24} className="text-[#ef4444]" />
                        ) : (
                          <Image size={24} className="text-[#2563eb]" />
                        )}
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: '#1a1a1a' }}>
                          {file.name}
                        </p>
                        <p className="text-sm" style={{ color: '#8D7B68' }}>
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFile(file.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ef4444]/10"
                      >
                        <X size={18} className="text-[#ef4444]" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {uploadProgress !== null ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-6 rounded-2xl bg-white/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium" style={{ color: '#8D7B68' }}>
                      Uploading...
                    </span>
                    <span className="font-bold" style={{ color: '#8D7B68' }}>
                      {Math.min(Math.round(uploadProgress), 100)}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[#8D7B68]/20 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#8D7B68' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(uploadProgress, 100)}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRealUpload}
                  className="w-full mt-6 py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-3"
                  style={{ backgroundColor: '#8D7B68' }}
                >
                  <Zap size={20} />
                  Analyze My Bill
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          variants={itemVariants}
          className="mt-12 flex flex-wrap justify-center gap-6"
        >
          {[
            { icon: FileCheck, text: '100% Secure' },
            { icon: AlertCircle, text: 'PDF & Images' },
            { icon: Sparkles, text: 'AI-Powered Analysis' }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm"
              >
                <Icon size={16} style={{ color: '#8D7B68' }} />
                <span className="text-sm font-medium" style={{ color: '#8D7B68' }}>
                  {item.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/30 backdrop-blur-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={18} style={{ color: '#8D7B68' }} />
            </motion.div>
            <span className="text-sm" style={{ color: '#8D7B68' }}>
              Processing typically takes 30-60 seconds
            </span>
          </div>
        </motion.div>
      </div>

      <div className="fixed top-0 left-0 w-32 h-32 border-t-[1px] border-l-[1px] opacity-10 m-8" style={{ borderColor: '#8D7B68' }} />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-[1px] border-r-[1px] opacity-10 m-8" style={{ borderColor: '#8D7B68' }} />
    </motion.div>
  );
}
