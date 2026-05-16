import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Lightbulb, 
  TrendingDown, 
  Shield, 
  Pill, 
  FileCheck,
  ArrowRight
} from 'lucide-react';

// Insights will be passed from Dashboard

export default function Insights({ insightsData = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="relative premium-card rounded-3xl p-6 md:p-10 min-h-[300px]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A4907C]/10 to-[#8D7B68]/5 animate-pulse" />
        <div className="h-8 w-48 bg-[#8D7B68]/20 rounded-full animate-pulse mx-auto mb-4" />
        <div className="h-4 w-64 bg-[#8D7B68]/20 rounded-full animate-pulse mx-auto mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-[#8D7B68]/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (insightsData.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#A4907C]/10 to-[#8D7B68]/5 rounded-3xl" />
      
      <div className="relative premium-card rounded-3xl p-6 md:p-10">
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl md:text-3xl text-[#1a1a1a]">
            Smart Insights
          </h3>
          <p className="text-[#8D7B68] mt-2">
            AI-powered analysis and recommendations
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {insightsData.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -4,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
                onClick={() => insight.onAction && insight.onAction()}
                className={`${insight.bg} rounded-2xl p-5 cursor-pointer group transition-all duration-300`}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${insight.color}20` }}
                  >
                    <Icon size={24} style={{ color: insight.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-semibold text-[#1a1a1a] text-base mb-1"
                      style={{ color: insight.color }}
                    >
                      {insight.title}
                    </h4>
                    <p className="text-[#8D7B68] text-sm leading-relaxed mb-3">
                      {insight.description}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-1 text-sm font-medium transition-colors group-hover:gap-2"
                      style={{ color: insight.color }}
                    >
                      {insight.action}
                      <ArrowRight size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}