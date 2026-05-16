import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign, ChevronDown, ChevronRight, PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon, Activity } from 'lucide-react';

// Data props will be passed from Dashboard

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-2xl border border-[#8D7B68]/20"
      >
        <p className="text-[#8D7B68] font-bold text-base mb-3">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#6b6b6b] text-sm font-medium">{entry.name}:</span>
            <span className="font-bold text-[#1a1a1a]">₹{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
}

function PieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-2xl border border-[#8D7B68]/20"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-bold text-[#1a1a1a]">{data.name}</span>
        </div>
        <p className="text-2xl font-bold" style={{ color: data.color }}>₹{data.value.toLocaleString()}</p>
        <p className="text-[#8D7B68] text-sm">{data.percent}% of total</p>
      </motion.div>
    );
  }
  return null;
}

export default function Analytics({ 
  barData = [], 
  pieData = [], 
  lineData = [], 
  areaData = [], 
  categoryStats = [],
  isLoading = false
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openSection, setOpenSection] = useState('charged');
  
  if (isLoading) {
    return (
      <div className="relative premium-card rounded-3xl p-6 md:p-10 min-h-[600px] flex flex-col gap-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8D7B68]/5 to-[#A4907C]/5 animate-pulse" />
        <div className="h-10 w-64 bg-[#8D7B68]/20 rounded-full animate-pulse mx-auto" />
        <div className="flex gap-6 justify-center">
          <div className="h-24 w-40 bg-[#8D7B68]/20 rounded-2xl animate-pulse" />
          <div className="h-24 w-40 bg-[#8D7B68]/20 rounded-2xl animate-pulse" />
          <div className="h-24 w-40 bg-[#22c55e]/20 rounded-2xl animate-pulse" />
        </div>
        <div className="h-12 w-full bg-[#8D7B68]/20 rounded-2xl animate-pulse mt-4" />
        <div className="flex-1 bg-[#8D7B68]/10 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (barData.length === 0) {
    return null; // Dashboard handles empty state gracefully
  }

  const totalCharged = barData.reduce((sum, item) => sum + item.charged, 0);
  const totalExpected = barData.reduce((sum, item) => sum + item.expected, 0);
  const totalSavings = totalCharged - totalExpected;

  const sections = [
    { id: 'charged', title: 'Charged vs Expected', icon: BarChart3, chart: 'bar' },
    { id: 'breakdown', title: 'Category Breakdown', icon: PieChartIcon, chart: 'pie' },
    { id: 'savings', title: 'Monthly Savings', icon: LineChartIcon, chart: 'line' },
    { id: 'cumulative', title: 'Cumulative', icon: Activity, chart: 'area' },
  ];

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#8D7B68]/5 to-[#A4907C]/5 rounded-3xl" />
      
      <div className="relative premium-card rounded-3xl p-6 md:p-10">
        <div className="text-center mb-8">
          <motion.h3 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-3xl md:text-4xl text-[#1a1a1a] mb-3"
          >
            Analytics Overview
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#8D7B68] text-lg"
          >
            Comprehensive breakdown of your medical expenses
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 mb-10"
        >
          <div className="glass-card rounded-2xl px-8 py-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign size={20} className="text-[#ef4444]" />
              <span className="text-[#8D7B68] text-sm font-medium">Total Charged</span>
            </div>
            <p className="text-3xl font-bold text-[#1a1a1a]">₹{totalCharged.toLocaleString()}</p>
          </div>
          
          <div className="glass-card rounded-2xl px-8 py-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign size={20} className="text-[#22c55e]" />
              <span className="text-[#8D7B68] text-sm font-medium">Expected Cost</span>
            </div>
            <p className="text-3xl font-bold text-[#1a1a1a]">₹{totalExpected.toLocaleString()}</p>
          </div>
          
          <div className="glass-card rounded-2xl px-8 py-5 text-center bg-gradient-to-br from-[#22c55e]/10 to-[#22c55e]/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown size={20} className="text-[#22c55e]" />
              <span className="text-[#22c55e] text-sm font-medium">Potential Savings</span>
            </div>
            <p className="text-3xl font-bold text-[#22c55e]">₹{totalSavings.toLocaleString()}</p>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-3 mb-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSection(section.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-medium transition-all ${
                  openSection === section.id || (openSection === null && section.id === 'charged')
                    ? 'bg-[#8D7B68] text-white shadow-lg'
                    : 'glass-card text-[#8D7B68] hover:bg-[#8D7B68]/10'
                }`}
              >
                <Icon size={18} />
                <span className="text-base">{section.title}</span>
                {openSection === section.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {(openSection === 'charged' || openSection === null) && (
            <motion.div
              key="charged"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-serif text-xl text-[#1a1a1a]">
                  Charged vs Expected by Category
                </h4>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ef4444]/15 text-[#ef4444]">
                  +{Math.round((totalSavings / totalCharged) * 100)}% Over
                </span>
              </div>
              <div className="h-[280px] w-full" style={{ minHeight: '280px' }}>
                <ResponsiveContainer width="99.9%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={barData} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 123, 104, 0.15)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#8D7B68', fontSize: 11 }} 
                      axisLine={{ stroke: '#C8B6A6/50' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#8D7B68', fontSize: 11 }}
                      axisLine={{ stroke: '#C8B6A6/50' }}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="charged" 
                      name="Charged" 
                      fill="#ef4444" 
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                    />
                    <Bar 
                      dataKey="expected" 
                      name="Expected" 
                      fill="#22c55e" 
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="text-sm text-[#8D7B68]">Charged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                  <span className="text-sm text-[#8D7B68]">Expected (CGHS)</span>
                </div>
              </div>
            </motion.div>
          )}

          {openSection === 'breakdown' && (
            <motion.div
              key="breakdown"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-serif text-xl text-[#1a1a1a]">Category Breakdown</h4>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8D7B68]/15 text-[#8D7B68]">5 Categories</span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="h-[280px] w-full md:w-[55%]" style={{ minHeight: '280px' }}>
                  <ResponsiveContainer width="99.9%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        animationDuration={1500}
                        onMouseEnter={(_, index) => setSelectedCategory(index)}
                        onMouseLeave={() => setSelectedCategory(null)}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={selectedCategory === index ? 3 : 1} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-[45%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                  {pieData.map((entry, index) => (
                    <motion.div
                      key={`${entry.name}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-xl transition-all ${selectedCategory === index ? 'bg-[#8D7B68]/10' : 'bg-white/40'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm font-medium text-[#1a1a1a]">{entry.name}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-[#8D7B68]">₹{entry.value.toLocaleString()}</span>
                        <span className="text-xs font-bold" style={{ color: entry.color }}>{entry.percent}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {openSection === 'savings' && (
            <motion.div
              key="savings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-serif text-xl text-[#1a1a1a]">Monthly Savings Trend</h4>
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#22c55e]" />
                  <span className="text-sm font-bold text-[#22c55e]">+24%</span>
                </div>
              </div>
              <div className="h-[220px] w-full" style={{ minHeight: '220px' }}>
                <ResponsiveContainer width="99.9%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 123, 104, 0.15)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#8D7B68', fontSize: 11 }} axisLine={{ stroke: '#C8B6A6/50' }} tickLine={false} />
                    <YAxis tick={{ fill: '#8D7B68', fontSize: 11 }} axisLine={{ stroke: '#C8B6A6/50' }} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="savings" name="Your Savings" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5, stroke: 'white' }} activeDot={{ r: 8 }} animationDuration={2000} />
                    <Line type="monotone" dataKey="average" name="Average" stroke="#8D7B68" strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={2000} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {openSection === 'cumulative' && (
            <motion.div
              key="cumulative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-serif text-xl text-[#1a1a1a]">Cumulative Savings</h4>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2563eb]/15 text-[#2563eb]">Yearly Goal</span>
              </div>
              <div className="h-[220px] w-full" style={{ minHeight: '220px' }}>
                <ResponsiveContainer width="99.9%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 123, 104, 0.15)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#8D7B68', fontSize: 11 }} axisLine={{ stroke: '#C8B6A6/50' }} tickLine={false} />
                    <YAxis tick={{ fill: '#8D7B68', fontSize: 11 }} axisLine={{ stroke: '#C8B6A6/50' }} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="target" name="Target" stroke="#2563eb" strokeWidth={2} strokeDasharray="5 5" fill="transparent" animationDuration={2000} />
                    <Area type="monotone" dataKey="cumulative" name="Your Savings" stroke="#22c55e" strokeWidth={3} fill="url(#colorCumulative)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <h4 className="font-serif text-xl text-[#1a1a1a] mb-5 px-2">Category Analysis</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
            {categoryStats.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className={`p-4 rounded-2xl border transition-all ${
                  item.status === 'high' 
                    ? 'bg-[#ef4444]/5 border-[#ef4444]/20 shadow-sm' 
                    : 'bg-[#22c55e]/5 border-[#22c55e]/20 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {item.status === 'high' ? (
                    <AlertCircle size={18} className="text-[#ef4444]" />
                  ) : (
                    <CheckCircle size={18} className="text-[#22c55e]" />
                  )}
                  <span className="font-bold text-[#1a1a1a] text-sm md:text-base">{item.name}</span>
                </div>
                <p className={`text-xs md:text-sm font-medium ${
                  item.status === 'high' ? 'text-[#ef4444]' : 'text-[#22c55e]'
                }`}>
                  {item.message}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}