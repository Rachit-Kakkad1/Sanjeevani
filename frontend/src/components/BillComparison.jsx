import { motion } from 'framer-motion';
import { FileText, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

export default function BillComparison({ rawBillItems = [], structuredData = [], isLoading = false }) {
  const totalOriginal = rawBillItems.reduce((sum, item) => sum + item.original, 0);
  const totalExpected = rawBillItems.reduce((sum, item) => sum + item.expected, 0);

  if (isLoading) {
    return (
      <div className="relative premium-card rounded-3xl p-6 md:p-10 min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A4907C]/10 to-[#8D7B68]/5 animate-pulse" />
        <div className="relative">
          <div className="h-8 w-48 bg-[#8D7B68]/20 rounded-full animate-pulse mx-auto mb-4" />
          <div className="h-4 w-64 bg-[#8D7B68]/20 rounded-full animate-pulse mx-auto mb-10" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-6 h-[300px] animate-pulse" />
            <div className="glass-card rounded-2xl p-6 h-[300px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (rawBillItems.length === 0) {
    return (
      <div className="relative premium-card rounded-3xl p-6 md:p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#8D7B68]/10 flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-[#8D7B68]" />
        </div>
        <h3 className="font-serif text-2xl text-[#1a1a1a] mb-2">No Bills Processed Yet</h3>
        <p className="text-[#8D7B68]">Upload a bill to see the transformation and savings.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#A4907C]/10 to-[#8D7B68]/5 rounded-3xl" />
      
      <div className="relative premium-card rounded-3xl p-6 md:p-10">
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl md:text-3xl text-[#1a1a1a]">
            Bill Transformation
          </h3>
          <p className="text-[#8D7B68] mt-2">
            Raw bill converted to structured data
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-4 md:p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <FileText size={20} className="text-[#8D7B68]" />
              <h4 className="font-serif text-lg md:text-xl text-[#1a1a1a]">Original Bill</h4>
            </div>

            <div className="space-y-3 md:space-y-4">
              {rawBillItems.map((item, index) => (
                <motion.div
                  key={`${item.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    item.flag ? 'bg-[#ef4444]/5 border border-[#ef4444]/20' : 'bg-white/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {item.flag ? (
                      <AlertCircle size={16} className="text-[#ef4444] shrink-0" />
                    ) : (
                      <CheckCircle size={16} className="text-[#22c55e] shrink-0" />
                    )}
                    <span className="text-[#1a1a1a] font-medium text-xs md:text-sm truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 ml-2">
                    <span className="text-[#1a1a1a] font-semibold text-xs md:text-sm">₹{item.original.toLocaleString()}</span>
                    {item.flag && (
                      <ArrowRight size={14} className="text-[#ef4444]" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#C8B6A6]/30 flex items-center justify-between">
              <span className="text-[#8D7B68] text-sm font-medium">Total Charged</span>
              <span className="text-xl md:text-2xl font-serif font-bold text-[#1a1a1a]">
                ₹{totalOriginal.toLocaleString()}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-4 md:p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle size={20} className="text-[#22c55e]" />
              <h4 className="font-serif text-lg md:text-xl text-[#1a1a1a]">Structured Data</h4>
            </div>

            <div className="space-y-3 md:space-y-4">
              {structuredData.map((item, index) => (
                <motion.div
                  key={`${item.category}-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/40"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      item.status === 'verified' ? 'bg-[#22c55e]' : 'bg-[#2563eb]'
                    }`} />
                    <span className="text-[#1a1a1a] font-medium text-xs md:text-sm truncate">{item.category}</span>
                  </div>
                  <span className="text-[#1a1a1a] font-semibold text-xs md:text-sm ml-2">₹{item.amount.toLocaleString()}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#C8B6A6]/30 flex items-center justify-between">
              <span className="text-[#8D7B68] text-sm font-medium">Expected Cost</span>
              <span className="text-xl md:text-2xl font-serif font-bold text-[#22c55e]">
                ₹{totalExpected.toLocaleString()}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2563eb]/10 text-[#2563eb] text-sm font-medium">
            <ArrowRight size={16} />
            Transforming {rawBillItems.filter(i => i.flag).length} inflated items
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}