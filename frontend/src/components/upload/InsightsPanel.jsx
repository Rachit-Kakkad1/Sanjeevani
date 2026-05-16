import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PiggyBank, 
  AlertTriangle, 
  TrendingDown, 
  Pill, 
  Building2,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Lightbulb
} from 'lucide-react';

export default function InsightsPanel({ bills = [], loading = false }) {
  const insights = useMemo(() => {
    if (bills.length === 0) return [];

    const report = [];
    const totalSavings = bills.reduce((sum, b) => sum + (b.totalOvercharge || 0), 0).toLocaleString();
    const overchargedBills = bills.filter(b => b.totalOvercharge > 0);
    const latestBill = bills[0];
    const latestOverchargePercent = latestBill.totalCharged > 0 
      ? Math.round((latestBill.totalOvercharge / latestBill.totalCharged) * 100) 
      : 0;

    // 1. Total Savings
    report.push({
      id: 1,
      type: 'savings',
      icon: PiggyBank,
      title: `Saved ₹${totalSavings} Total`,
      description: `Based on ${bills.length} bills analyzed, MedClear has saved you ₹${totalSavings} in potential overcharges.`,
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)'
    });

    // 2. High Alert (if latest reflects high overcharge)
    if (latestOverchargePercent > 20) {
      report.push({
        id: 2,
        type: 'alert',
        icon: AlertTriangle,
        title: 'Critical Overcharge Alert',
        description: `Your latest bill from ${latestBill.hospitalName || 'the hospital'} has a ${latestOverchargePercent}% overcharge rate. Immediate audit recommended.`,
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)'
      });
    }

    // 3. Category Insights
    const items = bills.flatMap(b => b.items || []);
    const medicineOvercharges = items.filter(i => i.isOvercharged && (i.rawName.toLowerCase().includes('tab') || i.rawName.toLowerCase().includes('inj') || i.rawName.toLowerCase().includes('mg')));
    
    if (medicineOvercharges.length > 5) {
      report.push({
        id: 3,
        type: 'recommendation',
        icon: Pill,
        title: 'High Medicine Surcharge',
        description: `We detected ${medicineOvercharges.length} medicines priced above reference. Ask for generic equivalents to save up to 60%.`,
        color: '#2563eb',
        bgColor: 'rgba(37, 99, 235, 0.1)'
      });
    }

    // 4. Hospital Insight
    const hospitalMap = {};
    bills.forEach(b => {
      if (b.hospitalName) {
        hospitalMap[b.hospitalName] = (hospitalMap[b.hospitalName] || 0) + (b.totalOvercharge || 0);
      }
    });
    
    const worstHospital = Object.entries(hospitalMap).sort((a,b) => b[1] - a[1])[0];
    if (worstHospital && worstHospital[1] > 5000) {
      report.push({
        id: 5,
        type: 'hospital',
        icon: Building2,
        title: `Audit focus: ${worstHospital[0]}`,
        description: `${worstHospital[0]} has the highest cumulative overcharge (₹${worstHospital[1].toLocaleString()}) across your history.`,
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)'
      });
    }

    // 5. Default tips if report too short
    if (report.length < 3) {
      report.push({
        id: 6,
        type: 'tip',
        icon: Sparkles,
        title: 'AI Smart Tip',
        description: 'Always check if "Nursing Charges" or "Service Fees" align with Ward category standards.',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.1)'
      });
    }

    return report;
  }, [bills]);

  if (loading) return null;

  if (bills.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-white/40 backdrop-blur-sm rounded-2xl border border-[#8D7B68]/10">
        <Lightbulb size={40} className="mx-auto text-[#8D7B68]/30 mb-4" />
        <h4 className="text-lg font-bold text-[#1a1a1a] mb-1">No AI Insights Yet</h4>
        <p className="text-sm text-[#8D7B68]/60">Upload your bills to unlock smart savings recommendations.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold" style={{ color: '#1a1a1a' }}>
            Smart Insights
          </h3>
          <div className="px-2 py-0.5 rounded-full bg-[#8D7B68]/10 text-xs font-medium" style={{ color: '#8D7B68' }}>
            AI GENERATED
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, x: 2 }}
          className="flex items-center gap-1 text-xs font-medium" style={{ color: '#8D7B68' }}
        >
          View All
          <ArrowRight size={12} />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="group relative p-4 rounded-xl cursor-pointer"
              style={{ 
                background: 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(200,182,166,0.25))',
                border: '1px solid rgba(141, 123, 104, 0.12)'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: insight.bgColor }}>
                  <Icon size={16} style={{ color: insight.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold mb-1" style={{ color: '#1a1a1a' }}>
                    {insight.title}
                  </h4>
                  <p className="text-xs text-[#8D7B68]/80 leading-relaxed line-clamp-2">
                    {insight.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-4 flex items-center justify-center gap-2 p-3 rounded-lg"
        style={{ 
          background: 'linear-gradient(145deg, rgba(255,255,255,0.6), rgba(200,182,166,0.2))',
          border: '1px solid rgba(141, 123, 104, 0.12)'
        }}
      >
        <Shield size={14} className="text-[#22c55e]" />
        <span className="text-xs" style={{ color: '#6b6b6b' }}>
          <span className="font-semibold">Privacy First:</span> Your data is end-to-end encrypted
        </span>
      </motion.div>
    </motion.div>
  );
}
