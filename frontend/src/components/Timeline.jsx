import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Scan, Search, CheckCircle } from 'lucide-react';

const steps = [
  { id: 1, name: 'Upload', icon: Upload, label: 'Upload Bill' },
  { id: 2, name: 'OCR', icon: Scan, label: 'OCR Processing' },
  { id: 3, name: 'Analysis', icon: Search, label: 'AI Analysis' },
  { id: 4, name: 'Result', icon: CheckCircle, label: 'Results Ready' },
];

export default function Timeline() {
  const [activeStep, setActiveStep] = useState(4);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= 4) return 4;
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setProgress((activeStep / 4) * 100);
  }, [activeStep]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#8D7B68]/5 via-[#A4907C]/5 to-[#8D7B68]/5 rounded-3xl blur-xl" />
      
      <div className="relative premium-card rounded-3xl p-6 md:p-10">
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl md:text-3xl text-[#1a1a1a]">
            Audit Process
          </h3>
          <p className="text-[#8D7B68] mt-2">
            Real-time bill analysis powered by AI
          </p>
        </div>

        <div className="flex items-center justify-between max-w-4xl mx-auto relative px-2">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-[#C8B6A6]/30 rounded-full -translate-y-1/2 z-0" />
          
          <motion.div
            className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-[#8D7B68] to-[#22c55e] rounded-full -translate-y-1/2 z-0"
            initial={{ width: '0%' }}
            animate={{ width: `${progress * 0.92}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />

          {steps.map((step, index) => {
            const isActive = activeStep >= step.id;
            const isCurrent = activeStep === step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative group cursor-pointer`}
                >
                  <motion.div
                    animate={{
                      scale: isCurrent ? [1, 1.1, 1] : 1,
                      boxShadow: isActive 
                        ? '0 0 20px rgba(139, 123, 104, 0.4)' 
                        : '0 0 0px rgba(139, 123, 104, 0)',
                    }}
                    transition={{
                      scale: { duration: 1, repeat: isCurrent ? Infinity : 0, repeatDelay: 1 },
                      boxShadow: { duration: 0.5 },
                    }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-[#8D7B68] text-white'
                        : 'bg-white/80 text-[#8D7B68]'
                    }`}
                  >
                    <Icon size={20} className="sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </motion.div>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-[#22c55e] rounded-full flex items-center justify-center border-2 border-white"
                    >
                      <CheckCircle size={10} className="text-white" />
                    </motion.div>
                  )}

                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className={`text-[10px] md:text-sm font-bold md:font-medium px-2 py-0.5 md:px-3 md:py-1 rounded-full ${
                      isActive
                        ? 'bg-[#8D7B68]/10 text-[#8D7B68]'
                        : 'text-[#8D7B68]/40'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-sm font-medium">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-[#22c55e] rounded-full"
            />
            Analysis Complete
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}