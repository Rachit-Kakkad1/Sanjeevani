import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subValue, color, isLoading }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="glass-card p-6 rounded-3xl relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={80} />
    </div>
    
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white/50 dark:bg-white/5 border border-primary/10 shadow-inner`} style={{ color }}>
        <Icon size={24} />
      </div>
      <p className="text-sm font-medium text-text-muted mb-1">{label}</p>
      {isLoading ? (
        <div className="flex items-center gap-2 h-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary/30" />
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-text-main leading-none mb-1">{value}</h3>
          <p className="text-xs font-semibold" style={{ color }}>{subValue}</p>
        </>
      )}
    </div>
  </motion.div>
);

const HeroPanel = ({ totalBill, expectedCost, overcharge, isLoading }) => {
  const savingsPercent = totalBill > 0 ? Math.round((overcharge / totalBill) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        icon={Wallet}
        label="Total Billed"
        value={`₹${totalBill.toLocaleString()}`}
        subValue="Amount to be paid"
        color="#8D7B68"
        isLoading={isLoading}
      />
      
      <StatCard 
        icon={ShieldCheck}
        label="Fair Price (CGHS)"
        value={`₹${expectedCost.toLocaleString()}`}
        subValue="Verified standard rates"
        color="#2563eb"
        isLoading={isLoading}
      />
      
      <StatCard 
        icon={TrendingUp}
        label="Potential Savings"
        value={`₹${overcharge.toLocaleString()}`}
        subValue={`${savingsPercent}% excess detected`}
        color="#22c55e"
        isLoading={isLoading}
      />

      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="premium-card p-6 rounded-3xl flex flex-col justify-between"
      >
        <div>
          <h3 className="text-lg font-bold text-text-main mb-2">Smart Audit Active</h3>
          <p className="text-sm text-text-muted">Your bills are automatically matched against 5,000+ medical standard rates.</p>
        </div>
        <button className="flex items-center gap-2 text-primary font-bold text-sm mt-4 group">
          Upgrade to Premium <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};

export default HeroPanel;