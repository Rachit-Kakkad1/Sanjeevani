import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowRight, Loader2, CheckCircle, Sparkles, Shield, FileText, Image, X, Zap } from 'lucide-react';

import Navbar from '../Navbar';
import ProcessTimeline from './ProcessTimeline';
import { uploadBill, getSSEUrl } from '../../utils/api';

const floatVariants = {
  animate: {
    y: [0, -8, 0],
    rotate: [0, 5, -5, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
};

function ConfettiPiece({ delay, side }) {
  const colors = ['#8D7B68', '#A4907C', '#C8B6A6', '#22c55e', '#2563eb'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      initial={{ x: side === 'left' ? -30 : 30, y: 0, opacity: 0 }}
      animate={{ 
        x: side === 'left' ? Math.random() * 300 + 100 : Math.random() * -300 - 100,
        y: Math.random() * -200 - 50,
        opacity: [1, 1, 0],
        rotate: Math.random() * 720
      }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        width: Math.random() * 6 + 3,
        height: Math.random() * 6 + 3,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        backgroundColor: color,
        left: '50%',
        top: '50%'
      }}
    />
  );
}

export default function UploadPage({ 
  onNavigateToDashboard, 
  onNavigateToReports, 
  onNavigateToInsights, 
  onNavigateToGovData,
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToJanAushadhi,
  onNavigateToCghsRates,
  onLogout,
  currentPage 
}) {
  const [files, setFiles] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [processStep, setProcessStep] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const eventSourceRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles) => {
    const valid = newFiles
      .filter(file => file.type === 'application/pdf' || file.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type
      }));
    
    if (valid.length > 0) {
      setFiles(prev => [...prev, ...valid]);
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    const valid = selected
      .filter(file => file.type === 'application/pdf' || file.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type
      }));
    
    if (valid.length > 0) {
      setFiles(prev => [...prev, ...valid]);
    }
    e.target.value = '';
  };

  const handleTrySample = async () => {
    try {
      const response = await fetch('/sample-bill.png');
      const blob = await response.blob();
      const file = new File([blob], 'sample-bill.png', { type: 'image/png' });
      addFiles([file]);
    } catch (err) {
      console.error('Failed to load sample:', err);
    }
  };

  const removeFile = (id) => {
    setFiles(f => f.filter(x => x.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const subscribeToJob = (jobId) => {
    const eventSource = new EventSource(getSSEUrl(jobId));
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.status === 'PROCESSING') {
          setProcessStep(2);
        } else if (data.status === 'COMPLETED') {
          setProcessStep(3);
          setStatus('completed');
          if (data.result) {
            setResult(data.result);
            localStorage.setItem('lastBill', JSON.stringify(data.result));
          }
          eventSource.close();
        } else if (data.status?.startsWith('FAILED') || data.status === 'TIMEOUT') {
          setStatus('error');
          setError(data.error || 'Processing failed or timed out');
          eventSource.close();
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.onerror = () => {
      if (status !== 'completed') {
        setStatus('error');
        setError('Connection to server lost');
      }
      eventSource.close();
    };
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    
    setStatus('uploading');
    setProcessStep(1);
    setError(null);

    try {
      const data = await uploadBill(files[0].file);
      
      if (data && data.jobId) {
        setJobId(data.jobId);
        subscribeToJob(data.jobId);
      } else {
        throw new Error('Upload failed: No Job ID received');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Failed to upload bill');
    }
  };

  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => {
        onNavigateToReports();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onNavigateToReports]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const isProcessing = status === 'uploading' || status === 'processing';
  const isComplete = status === 'completed';
  const hasError = status === 'error';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#E3D5CA' }}
    >
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 80%, rgba(141, 123, 104, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(164, 144, 124, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 80%, rgba(141, 123, 104, 0.3) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
        style={{ backgroundColor: '#8D7B68', top: '-10%', left: '-10%' }}
        animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div 
        className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-15"
        style={{ backgroundColor: '#A4907C', bottom: '-5%', right: '-5%' }}
        animate={{ x: [0, -80, 0], y: [0, -60, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />

      <Navbar 
        onLogout={onLogout} 
        onNavigateToUpload={() => {}} 
        onNavigateToDashboard={onNavigateToDashboard} 
        onNavigateToReports={onNavigateToReports} 
        onNavigateToInsights={onNavigateToInsights} 
        onNavigateToGovData={onNavigateToGovData} 
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToNotifications={onNavigateToNotifications}
        onNavigateToJanAushadhi={onNavigateToJanAushadhi}
        onNavigateToCghsRates={onNavigateToCghsRates}
        currentPage={currentPage} 
      />

      <main className="pt-24 pb-12 px-4 md:px-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <motion.div animate={floatVariants.animate} className="inline-flex mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8D7B68] to-[#A4907C] flex items-center justify-center shadow-lg">
                <Sparkles size={28} className="text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#1a1a1a' }}>
              Upload Your Medical Bill
            </h1>
            <p className="text-lg text-[#8D7B68]">
              AI-powered analysis to find overcharges in seconds
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.02, x: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigateToDashboard}
              className="text-base font-medium text-[#8D7B68] hover:underline flex items-center gap-1"
            >
              <ArrowRight size={18} className="rotate-180" />
              Back to Dashboard
            </motion.button>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isComplete && !hasError ? (
              <motion.div
                key="upload-area"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <motion.div animate={isDragging ? { scale: 1.02 } : { scale: 1 }} className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{ 
                      background: `linear-gradient(135deg, rgba(141, 123, 104, ${isDragging ? 0.2 : 0.1}), rgba(164, 144, 124, ${isDragging ? 0.15 : 0.05}))`
                    }}
                    animate={isDragging ? { scale: [1, 1.01, 1], opacity: [0.2, 0.35, 0.2] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  
                  <motion.div
                    onMouseEnter={() => setIsDragging(true)}
                    onMouseLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="relative border-2 border-dashed rounded-3xl p-10 md:p-12 transition-all cursor-pointer"
                    style={{ 
                      borderColor: isDragging ? '#22c55e' : 'rgba(141, 123, 104, 0.5)',
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(10px)'
                    }}
                    whileHover={{ borderColor: 'rgba(141, 123, 104, 0.8)' }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <input
                      type="file"
                      id="file-input"
                      multiple
                      accept="application/pdf,image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        animate={{ 
                          scale: isDragging ? [1, 1.15, 1] : 1,
                          rotate: isDragging ? [0, 10, -10, 0] : 0
                        }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8D7B68]/20 to-[#A4907C]/20 flex items-center justify-center mb-5"
                      >
                        <motion.div animate={floatVariants.animate}>
                          <Upload size={36} className="text-[#8D7B68]" />
                        </motion.div>
                      </motion.div>
                      
                      <p className="text-2xl font-semibold mb-2" style={{ color: '#1a1a1a' }}>
                        {isDragging ? 'Release to upload' : 'Drop your medical bill here'}
                      </p>
                      <p className="text-base text-[#8D7B68]/70 mb-5">or click to browse files</p>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrySample();
                        }}
                        className="mb-8 px-6 py-2.5 rounded-xl text-sm font-bold bg-white border border-[#8D7B68]/20 text-[#8D7B68] shadow-sm flex items-center gap-2 hover:bg-[#8D7B68]/5 transition-colors"
                      >
                        <Zap size={14} className="fill-[#8D7B68]" />
                        Try a Sample Bill
                      </motion.button>
                      
                      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                        {[
                          { icon: FileText, label: 'PDF', color: '#ef4444' },
                          { icon: Image, label: 'Images', color: '#2563eb' },
                          { icon: Shield, label: 'Secure', color: '#22c55e' }
                        ].map((item) => (
                          <motion.div 
                            key={item.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.08, y: -3 }}
                            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/60 backdrop-blur-sm border border-[#8D7B68]/15 text-xs md:text-base font-medium"
                            style={{ color: item.color }}
                          >
                            <item.icon size={14} className="md:w-4 md:h-4" />
                            {item.label}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {files.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 space-y-2"
                  >
                    {files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-[#8D7B68]/15 shadow-sm"
                      >
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: file.type === 'application/pdf' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)' }}>
                          {file.type === 'application/pdf' ? (
                            <FileText size={16} className="text-[#ef4444]" />
                          ) : (
                            <Image size={16} className="text-[#2563eb]" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <p className="text-sm md:text-base font-bold truncate" style={{ color: '#1a1a1a' }}>{file.name}</p>
                           <p className="text-[10px] md:text-sm text-[#8D7B68]/70">{formatFileSize(file.size)}</p>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.15, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ef4444]/10 shrink-0"
                        >
                          <X size={14} className="text-[#ef4444]" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {files.length > 0 && !isProcessing && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyze}
                    className="w-full mt-5 py-3.5 md:py-4 rounded-2xl font-bold text-sm md:text-base text-white flex items-center justify-center gap-2 shadow-lg"
                    style={{ 
                      background: 'linear-gradient(135deg, #8D7B68, #A4907C)',
                      boxShadow: '0 10px 30px -5px rgba(141, 123, 104, 0.35)'
                    }}
                  >
                    <Zap size={18} className="md:w-5 md:h-5" />
                    Analyze Bill
                    <ArrowRight size={18} className="md:w-5 md:h-5" />
                  </motion.button>
                )}

                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6"
                  >
                    <div className="p-5 rounded-2xl bg-white/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 size={16} className="text-[#8D7B68]" />
                          </motion.div>
                          <span className="text-base font-medium" style={{ color: '#8D7B68' }}>
                            {status === 'uploading' ? 'Uploading' : 'Processing'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <ProcessTimeline currentStep={processStep} />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : hasError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#ef4444]/20 flex items-center justify-center">
                  <X size={48} className="text-[#ef4444]" />
                </div>
                
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
                  Processing Failed
                </h2>
                
                <p className="text-lg text-[#ef4444] mb-4">
                  {error || 'An error occurred'}
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setStatus('idle'); setFiles([]); setError(null); setJobId(null); }}
                  className="px-6 py-3 rounded-2xl font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #8D7B68, #A4907C)' }}
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative py-12 text-center"
              >
                {[...Array(15)].map((_, i) => (
                  <ConfettiPiece key={i} delay={i * 0.05} side={i % 2 === 0 ? 'left' : 'right'} />
                ))}
                
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#22c55e]/20 flex items-center justify-center"
                >
                  <CheckCircle size={48} className="text-[#22c55e]" />
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}
                >
                  Analysis Complete!
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-[#8D7B68] mb-2"
                >
                  Redirecting to your detailed report...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm text-sm font-medium" style={{ color: '#8D7B68' }}>
              <Shield size={16} />
              Your data is encrypted and secure
            </div>
          </motion.div>
        </div>
      </main>

      <div className="fixed top-0 left-0 w-24 h-24 border-t-[1px] border-l-[1px] opacity-10 m-6" style={{ borderColor: '#8D7B68' }} />
      <div className="fixed bottom-0 right-0 w-24 h-24 border-b-[1px] border-r-[1px] opacity-10 m-6" style={{ borderColor: '#8D7B68' }} />
    </motion.div>
  );
}