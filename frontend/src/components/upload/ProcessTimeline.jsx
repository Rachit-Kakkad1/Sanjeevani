import { motion } from 'framer-motion';
import { Upload, Scan, Cpu, CheckCircle, Loader2 } from 'lucide-react';

const steps = [
  { id: 1, label: 'Upload', icon: Upload },
  { id: 2, label: 'OCR', icon: Scan },
  { id: 3, label: 'Analysis', icon: Cpu },
  { id: 4, label: 'Done', icon: CheckCircle },
];

export default function ProcessTimeline({ currentStep = 1 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-[#8D7B68]/15 rounded-full" />
        
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full"
          style={{ background: 'linear-gradient(90deg, #8D7B68, #22c55e)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.6 }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                <motion.div
                  animate={isCurrent ? {
                    scale: [1, 1.1, 1],
                    boxShadow: ['0 0 0 0 rgba(141, 123, 104, 0.3)', '0 0 0 8px rgba(141, 123, 104, 0)', '0 0 0 0 rgba(141, 123, 104, 0)']
                  } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#8D7B68] to-[#A4907C]' 
                      : 'bg-white/60 border border-[#8D7B68]/20'
                  }`}
                >
                  {isCurrent ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 size={16} className="text-white" />
                    </motion.div>
                  ) : isActive ? (
                    <Icon size={16} className="text-white" />
                  ) : (
                    <span className="text-[#8D7B68]/50 font-bold text-xs">{step.id}</span>
                  )}
                </motion.div>

                {isActive && !isCurrent && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#22c55e] flex items-center justify-center"
                  >
                    <CheckCircle size={8} className="text-white" />
                  </motion.div>
                )}
              </motion.div>

              <div className="absolute top-10 text-center">
                <p className={`text-xs font-medium ${isActive ? 'text-[#1a1a1a]' : 'text-[#8D7B68]/50'}`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
