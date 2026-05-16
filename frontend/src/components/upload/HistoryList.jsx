import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, ChevronRight, Building2, Loader2, AlertCircle } from 'lucide-react';

export default function HistoryList({ onSelectBill, history = [], loading = false, error = null }) {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 bg-white/30 backdrop-blur-sm rounded-2xl border border-[#8D7B68]/10">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 size={32} className="text-[#8D7B68]" />
        </motion.div>
        <p className="mt-4 text-[#8D7B68] font-medium">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <AlertCircle size={32} className="mx-auto text-red-400 mb-3" />
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="w-full p-12 text-center bg-white/40 backdrop-blur-sm rounded-2xl border border-[#8D7B68]/10">
        <FileText size={40} className="mx-auto text-[#8D7B68]/30 mb-4" />
        <h4 className="text-lg font-bold text-[#1a1a1a] mb-1">No Bills Found</h4>
        <p className="text-sm text-[#8D7B68]/60">Upload your first bill to start tracking overcharges.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-base md:text-lg font-bold" style={{ color: '#1a1a1a' }}>
          Recent Bills
        </h3>
        <motion.button
          whileHover={{ scale: 1.05, x: 2 }}
          className="flex items-center gap-1 text-xs md:text-sm font-medium" style={{ color: '#8D7B68' }}
        >
          View All
          <ChevronRight size={14} />
        </motion.button>
      </div>

      <div className="overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          <AnimatePresence>
            {history.map((bill, index) => {
              const overchargePercent = bill.totalCharged > 0 
                ? Math.round((bill.totalOvercharge / bill.totalCharged) * 100) 
                : 0;
              
              return (
                <motion.div
                  key={bill._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  onClick={() => onSelectBill?.(bill)}
                  className="group relative w-64 flex-shrink-0 p-4 rounded-xl cursor-pointer"
                  style={{ 
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(200,182,166,0.25))',
                    border: '1px solid rgba(141, 123, 104, 0.15)'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(141, 123, 104, 0.15)' }}>
                      <Building2 size={14} className="text-[#8D7B68]" />
                    </div>
                    <span 
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: overchargePercent > 20 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: overchargePercent > 20 ? '#ef4444' : '#f59e0b'
                      }}
                    >
                      {overchargePercent}% Saved
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold mb-1 truncate" style={{ color: '#1a1a1a' }}>
                    {bill.hospitalName || 'Medical Bill'}
                  </h4>
                  <p className="text-xs text-[#8D7B68]/70 mb-2 flex items-center gap-1">
                    <Calendar size={10} />
                    {formatDate(bill.createdAt)}
                  </p>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-[#8D7B68]/60">Total</p>
                      <p className="text-base font-bold" style={{ color: '#1a1a1a' }}>₹{bill.totalCharged.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#8D7B68]/60">Overcharge</p>
                      <p className="text-sm font-semibold" style={{ color: overchargePercent > 20 ? '#ef4444' : '#f59e0b' }}>
                        +₹{bill.totalOvercharge.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#8D7B68]/10">
                    <div className="h-1.5 rounded-full bg-[#8D7B68]/15 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: overchargePercent > 20 ? '#ef4444' : '#f59e0b' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${overchargePercent}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
