import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, FileText, Share2, HelpCircle } from 'lucide-react';

const ActionButton = ({ icon: Icon, label, description, onClick, primary }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left transition-all ${
      primary 
        ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20' 
        : 'glass-card border border-primary/10 hover:border-primary/30 text-text-main'
    }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
      primary ? 'bg-white/20' : 'bg-primary/10 text-primary'
    }`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="font-bold text-sm">{label}</p>
      <p className={`text-[11px] ${primary ? 'text-white/70' : 'text-text-muted'}`}>{description}</p>
    </div>
  </motion.button>
);

const ActionPanel = ({ onNavigateToUpload }) => {
  return (
    <div className="flex flex-col gap-4">
      <ActionButton 
        icon={FileUp}
        label="Analyze New Bill"
        description="Upload hospital invoice or lab report"
        primary
        onClick={onNavigateToUpload}
      />
      
      <ActionButton 
        icon={FileText}
        label="Saved Reports"
        description="Access your audit history"
        onClick={() => {}}
      />
      
      <ActionButton 
        icon={Share2}
        label="Export Data"
        description="Download for insurance claims"
        onClick={() => {}}
      />
      
      <ActionButton 
        icon={HelpCircle}
        label="Audit Support"
        description="Get help with bill disputes"
        onClick={() => {}}
      />

      <motion.div 
        className="mt-2 p-5 rounded-3xl bg-primary/5 border border-primary/10 text-center"
      >
        <p className="text-xs text-text-muted mb-3">Insurance claim acceptance rate</p>
        <div className="text-2xl font-serif font-bold text-primary">94.2%</div>
        <div className="w-full h-1.5 bg-primary/10 rounded-full mt-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '94.2%' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-primary"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ActionPanel;