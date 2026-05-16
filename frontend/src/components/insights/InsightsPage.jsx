import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  PiggyBank, 
  AlertTriangle, 
  TrendingDown, 
  Pill, 
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Zap,
  FileText,
  Crown,
  Rocket
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

import Navbar from '../Navbar';

const floatAnimations = [
  { x: [0, 30, 0], y: [0, -20, 0], rotate: [0, 10, 0], duration: 8 },
  { x: [0, -25, 0], y: [0, 15, 0], rotate: [0, -8, 0], duration: 10 },
  { x: [0, 20, 0], y: [0, -30, 0], rotate: [0, 15, 0], duration: 12 },
];

const statsData = [
  { label: 'Total Bills Analyzed', value: '47', icon: FileText, color: '#8D7B68', bg: 'rgba(141, 123, 104, 0.15)' },
  { label: 'Overcharges Detected', value: '23', icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  { label: 'Total Saved', value: 'â‚¹24k', icon: PiggyBank, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
  { label: 'Success Rate', value: '94%', icon: Target, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)' },
];

const insightsData = [
  {
    id: 1,
    type: 'savings',
    icon: PiggyBank,
    title: 'You saved â‚¹12,400 this year',
    description: 'Based on 47 bills analyzed, you\'ve avoided â‚¹12,400 in overcharges through our recommendations.',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    stat: 'â‚¹12,400',
    glow: 'shadow-[#22c55e]/20'
  },
  {
    id: 2,
    type: 'alert',
    icon: AlertTriangle,
    title: 'Hospital charges 30% higher',
    description: 'Apollo Hospital charges 30% more than the government-mandated rates for similar procedures.',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    stat: '30%',
    glow: 'shadow-[#ef4444]/20'
  },
  {
    id: 3,
    type: 'recommendation',
    icon: Pill,
    title: 'Switch to generic medicines',
    description: 'We found 8 branded medicines that have generic equivalents at 60% lower cost.',
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.1)',
    stat: '60%',
    glow: 'shadow-[#2563eb]/20'
  },
  {
    id: 4,
    type: 'trend',
    icon: TrendingDown,
    title: 'Lab test costs trending down',
    description: 'Your lab test expenses have decreased by 18% compared to last year after optimization.',
    color: '#8D7B68',
    bgColor: 'rgba(141, 123, 104, 0.1)',
    stat: '-18%',
    glow: 'shadow-[#8D7B68]/20'
  },
  {
    id: 5,
    type: 'hospital',
    icon: Building2,
    title: 'Better option nearby',
    description: 'Max Hospital is 2km away and offers the same MRI scan at 40% lower cost.',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    stat: '40%',
    glow: 'shadow-[#f59e0b]/20'
  },
  {
    id: 6,
    type: 'tip',
    icon: Sparkles,
    title: 'Insurance claim tip',
    description: 'You can claim â‚¹8,500 more by including previously rejected line items.',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    stat: 'â‚¹8,500',
    glow: 'shadow-[#8b5cf6]/20'
  }
];

const recentActivity = [
  { action: 'Bill analyzed', hospital: 'Apollo Hospital', amount: 'â‚¹45,800', status: 'completed', time: '2 hours ago' },
  { action: 'Overcharge found', hospital: 'Fortis Healthcare', amount: 'â‚¹12,400', status: 'alert', time: '1 day ago' },
  { action: 'Savings identified', hospital: 'Max Hospital', amount: 'â‚¹2,800', status: 'success', time: '3 days ago' },
  { action: 'Report generated', hospital: 'Medanta', amount: 'â‚¹28,500', status: 'completed', time: '1 week ago' },
];

const savingsChart = [
  { month: 'Jan', value: 1200 },
  { month: 'Feb', value: 1800 },
  { month: 'Mar', value: 1400 },
  { month: 'Apr', value: 2100 },
  { month: 'May', value: 2800 },
  { month: 'Jun', value: 1600 },
];

const overchargeChart = [
  { month: 'Jan', value: 3200 },
  { month: 'Feb', value: 4800 },
  { month: 'Mar', value: 2900 },
  { month: 'Apr', value: 5600 },
  { month: 'May', value: 7200 },
  { month: 'Jun', value: 4100 },
];

function CustomTooltip({ active, payload, label, color, prefix }) {
  if (active && payload && payload.length) {
    return (
      <div 
        className="px-4 py-3 rounded-xl shadow-2xl"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(141, 123, 104, 0.2)'
        }}
      >
        <p className="text-sm font-medium" style={{ color: '#8D7B68' }}>{label}</p>
        <p className="text-xl font-bold" style={{ color }}>
          {prefix}{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

function AnimatedBarChart({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={180} minWidth={0} minHeight={0}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 123, 104, 0.1)" vertical={false} />
        <XAxis 
          dataKey="month" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#8D7B68', fontSize: 12 }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#8D7B68', fontSize: 12 }}
          tickFormatter={(value) => `â‚¹${value / 1000}k`}
        />
        <Tooltip content={<CustomTooltip color={color} prefix="â‚¹" />} />
        <Bar 
          dataKey="value" 
          fill={color}
          radius={[6, 6, 0, 0]}
          animationDuration={1500}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function InsightsPage({ 
  onNavigateToDashboard, 
  onNavigateToUpload, 
  onNavigateToGovData, 
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToJanAushadhi,
  onNavigateToCghsRates,
  currentPage 
}) {
  const [activeInsight, setActiveInsight] = useState(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#E3D5CA' }}
    >
      <Navbar 
        onLogout={onNavigateToDashboard} 
        onNavigateToUpload={onNavigateToUpload}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToGovData={onNavigateToGovData}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToNotifications={onNavigateToNotifications}
        onNavigateToJanAushadhi={onNavigateToJanAushadhi}
        onNavigateToCghsRates={onNavigateToCghsRates}
        currentPage={currentPage}
      />

      <main className="pt-24 pb-12 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-10 text-center"
          >
            <motion.div
              className="inline-flex mb-6"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{ background: 'linear-gradient(135deg, #8D7B68, #A4907C)' }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8D7B68] to-[#A4907C] flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <Crown size={36} className="text-white" />
                </div>
              </div>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
              Smart Insights
            </h1>
            <p className="text-xl text-[#8D7B68] max-w-2xl mx-auto">
              AI-powered analytics to help you understand your medical expenses and save more
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -8, rotate: index % 2 === 0 ? 3 : -3 }}
                  className="relative p-6 rounded-3xl overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.5))',
                    border: '1px solid rgba(141, 123, 104, 0.2)',
                    boxShadow: '0 10px 40px -10px rgba(141, 123, 104, 0.2)'
                  }}
                >
                  <motion.div
                    className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20"
                    style={{ backgroundColor: stat.color }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  />
                  
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: stat.bg }}
                    >
                      <Icon size={24} style={{ color: stat.color }} />
                    </motion.div>
                    <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-sm text-[#8D7B68] mt-1">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-6 rounded-3xl"
              style={{ 
                background: 'linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.5))',
                border: '1px solid rgba(141, 123, 104, 0.2)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 flex items-center justify-center">
                    <TrendingUp size={20} className="text-[#22c55e]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#1a1a1a' }}>Savings Trend</h3>
                    <p className="text-sm text-[#8D7B68]">Monthly savings over time</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#22c55e]">+24%</span>
              </div>
              <AnimatedBarChart data={savingsChart} color="#22c55e" />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-6 rounded-3xl"
              style={{ 
                background: 'linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.5))',
                border: '1px solid rgba(141, 123, 104, 0.2)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ef4444]/15 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-[#ef4444]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#1a1a1a' }}>Overcharge Pattern</h3>
                    <p className="text-sm text-[#8D7B68]">Monthly overcharges detected</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#ef4444]">+8%</span>
              </div>
              <AnimatedBarChart data={overchargeChart} color="#ef4444" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
                Key Insights
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: 'rgba(141, 123, 104, 0.1)', color: '#8D7B68' }}
              >
                View All
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {insightsData.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 30, rotate: index % 2 === 0 ? -3 : 3 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                    whileHover={{ 
                      scale: 1.03, 
                      y: -8,
                      boxShadow: '0 20px 60px -10px rgba(141, 123, 104, 0.3)'
                    }}
                    onHoverStart={() => setActiveInsight(insight.id)}
                    onHoverEnd={() => setActiveInsight(null)}
                    className="relative p-6 rounded-3xl cursor-pointer overflow-hidden"
                    style={{ 
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                      border: '1px solid rgba(141, 123, 104, 0.15)'
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-0"
                      style={{ background: `linear-gradient(135deg, ${insight.bgColor}, transparent)` }}
                      animate={{ 
                        opacity: activeInsight === insight.id ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <motion.div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl"
                      style={{ 
                        backgroundColor: insight.color,
                        opacity: activeInsight === insight.id ? 0.3 : 0.1
                      }}
                      animate={{
                        scale: activeInsight === insight.id ? [1, 1.5, 1] : 1
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: insight.bgColor }}
                        >
                          <Icon size={28} style={{ color: insight.color }} />
                        </motion.div>
                        
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className="px-3 py-1.5 rounded-full text-sm font-bold"
                          style={{ 
                            backgroundColor: insight.bgColor, 
                            color: insight.color,
                            boxShadow: `0 4px 15px ${insight.color}33`
                          }}
                        >
                          {insight.stat}
                        </motion.span>
                      </div>

                      <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1a1a' }}>
                        {insight.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#6b6b6b' }}>
                        {insight.description}
                      </p>

                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1 mt-4 text-sm font-medium"
                        style={{ color: insight.color }}
                      >
                        Learn more
                        <ArrowRight size={14} />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1a1a1a' }}>
              Recent Activity
            </h2>
            
            <div className="rounded-3xl overflow-hidden" style={{ 
              background: 'linear-gradient(145deg, rgba(255,255,FFFFFF,0.85), rgba(255,255,255,0.5))',
              border: '1px solid rgba(141, 123, 104, 0.15)'
            }}>
              {recentActivity.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ x: 10, backgroundColor: 'rgba(141, 123, 104, 0.05)' }}
                  className="flex items-center justify-between p-5 border-b border-[#8D7B68]/10 last:border-0 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: item.status === 'alert' ? 'rgba(239, 68, 68, 0.15)' : 
                                        item.status === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(141, 123, 104, 0.15)'
                      }}
                    >
                      {item.status === 'alert' ? (
                        <AlertTriangle size={22} className="text-[#ef4444]" />
                      ) : item.status === 'success' ? (
                        <CheckCircle size={22} className="text-[#22c55e]" />
                      ) : (
                        <FileText size={22} className="text-[#8D7B68]" />
                      )}
                    </motion.div>
                    
                    <div>
                      <p className="text-base font-bold" style={{ color: '#1a1a1a' }}>{item.action}</p>
                      <p className="text-sm" style={{ color: '#6b6b6b' }}>{item.hospital}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <motion.p 
                      className="text-lg font-bold"
                      style={{ 
                        color: item.status === 'alert' ? '#ef4444' : '#1a1a1a'
                      }}
                    >
                      {item.amount}
                    </motion.p>
                    <p className="text-sm flex items-center gap-1" style={{ color: '#8D7B68' }}>
                      <Clock size={12} />
                      {item.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-10 flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigateToUpload}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-2xl"
              style={{ 
                background: 'linear-gradient(135deg, #8D7B68, #A4907C)',
                boxShadow: '0 10px 40px -5px rgba(141, 123, 104, 0.4)'
              }}
            >
              <Zap size={24} />
              Start New Analysis
              <Rocket size={20} />
            </motion.button>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}
