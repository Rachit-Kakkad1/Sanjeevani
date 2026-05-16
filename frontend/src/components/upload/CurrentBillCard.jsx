import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingDown, AlertTriangle, ArrowDown, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1500 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    const endValue = value;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(endValue * easeOut);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

export default function CurrentBillCard({ bill }) {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!bill) return null;

  const totalCharged = bill.totalCharged || 0;
  const calculatedTotal = bill.calculatedTotal || 0;
  const totalOvercharge = bill.totalOvercharge || 0;
  const hospitalName = bill.hospitalName || 'Medical Bill';
  const jobId = bill.jobId || '';
  
  const savingsPercent = totalCharged > 0 ? Math.round((totalOvercharge / totalCharged) * 100) : 0;

  const cardData = [
    {
      label: 'Total Bill',
      value: totalCharged,
      prefix: '₹',
      icon: DollarSign,
      color: '#1a1a1a',
      bgColor: 'rgba(141, 123, 104, 0.1)'
    },
    {
      label: 'Fair Estimate',
      value: calculatedTotal,
      prefix: '₹',
      icon: TrendingDown,
      color: '#2563eb',
      bgColor: 'rgba(37, 99, 235, 0.1)'
    },
    {
      label: 'Potential Refund',
      value: totalOvercharge,
      prefix: '₹',
      icon: AlertTriangle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(200,182,166,0.35))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(141, 123, 104, 0.2)'
      }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8D7B68]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#ef4444]/5 rounded-full blur-2xl" />

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1a1a1a' }}>
                Analysis Summary
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <CheckCircle2 size={18} className="text-[#22c55e]" />
                </motion.div>
              </h3>
              <p className="text-sm text-[#8D7B68]/70 mt-0.5">{hospitalName} • ID: {jobId.slice(0, 8)}</p>
            </div>
            {savingsPercent > 0 && (
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="px-4 py-1.5 rounded-full bg-[#ef4444]/10 text-sm font-bold shadow-sm" 
                style={{ color: '#ef4444' }}
              >
                {savingsPercent}% OVERCHARGED
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardData.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4 rounded-xl border border-white/40 shadow-sm transition-all"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={16} style={{ color: card.color }} />
                    <span className="text-sm font-semibold" style={{ color: card.color }}>
                      {card.label}
                    </span>
                  </div>
                  <div className="text-2xl font-black" style={{ color: card.color }}>
                    <AnimatedNumber value={card.value} prefix={card.prefix} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8">
            <motion.button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center gap-2 w-full py-3 md:py-2 text-sm font-bold text-[#8D7B68] rounded-lg hover:bg-[#8D7B68]/5 transition-colors border border-[#8D7B68]/10"
            >
              {showDetails ? (
                <>Hide Itemized Audit <ChevronUp size={16} /></>
              ) : (
                <>Show Itemized Audit <ChevronDown size={16} /></>
              )}
            </motion.button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 border-t border-[#8D7B68]/15 pt-4">
                    {(!bill.items || bill.items.length === 0) ? (
                      <div className="py-8 text-center bg-[#8D7B68]/5 rounded-xl border border-dashed border-[#8D7B68]/20">
                        <AlertTriangle size={24} className="mx-auto text-amber-500 mb-2" />
                        <p className="text-sm font-bold text-[#1a1a1a]">No Line Items Extracted</p>
                        <p className="text-xs text-[#8D7B68]/70 mt-1 max-w-[250px] mx-auto">
                          We couldn't clearly identify individual rows. Please ensure the image is well-lit and the table is flat.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto -mx-6 px-6">
                        <table className="w-full text-left min-w-[500px]">
                          <thead>
                            <tr className="text-[10px] uppercase tracking-wider text-[#8D7B68]/60 font-bold border-b border-[#8D7B68]/10">
                              <th className="pb-3 pl-2">Description</th>
                              <th className="pb-3 text-center">Charged</th>
                              <th className="pb-3 text-center">Reference</th>
                              <th className="pb-3 text-right pr-2">Adjustment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#8D7B68]/5">
                            {bill.items.map((item, idx) => (
                              <motion.tr 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="group hover:bg-[#8D7B68]/5 transition-colors"
                              >
                                <td className="py-3 pl-2">
                                  <p className="text-xs md:text-sm font-bold text-[#1a1a1a] uppercase truncate max-w-[150px] md:max-w-none" title={item.rawName}>{item.rawName}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-[#8D7B68]/10 text-[#8D7B68]">
                                      {item.matchMethod}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 text-center font-bold text-xs md:text-sm">
                                  {item.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: bill.currency || 'INR', maximumFractionDigits: 0 })}
                                </td>
                                <td className="py-3 text-center font-bold text-xs md:text-sm text-blue-600">
                                  {(item.totalPrice - item.overchargeAmount).toLocaleString('en-IN', { style: 'currency', currency: bill.currency || 'INR', maximumFractionDigits: 0 })}
                                </td>
                                <td className="py-3 text-right pr-2">
                                  {item.isOvercharged ? (
                                    <span className="text-xs md:text-sm font-black text-red-500">
                                      -{item.overchargeAmount.toLocaleString('en-IN', { style: 'currency', currency: bill.currency || 'INR', maximumFractionDigits: 0 })}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] md:text-xs font-bold text-[#22c55e]">Verified</span>
                                  )}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}