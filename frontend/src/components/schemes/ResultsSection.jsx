import { motion } from 'framer-motion';
import { ShieldCheck, IndianRupee, ArrowRight, ExternalLink, Activity } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function ResultsSection({ schemes, searchedIncome }) {
  if (!schemes || schemes.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-12 text-center border border-white/50 shadow-xl mt-8"
      >
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Activity size={32} className="text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Schemes Found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We couldn't find any specific schemes matching your current criteria. However, you may still be eligible for general hospital discounts.
        </p>
      </motion.div>
    );
  }

  const bestFit = schemes[0];
  const otherSchemes = schemes.slice(1);

  return (
    <div className="mt-8 md:mt-12 space-y-8">
      
      {/* Best Fit Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, delay: 0.2 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8D7B68] to-[#6b5a4a] text-white p-1"
      >
        {/* Animated border effect */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        <div className="relative bg-white/10 backdrop-blur-md rounded-[22px] p-8 md:p-10 border border-white/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldCheck size={180} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/30">
                  Best Fit Match
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-semibold border border-white/10">
                  Confidence: High
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{bestFit.name}</h2>
              <p className="text-white/80 text-lg mb-6 leading-relaxed max-w-2xl">
                {bestFit.description}
              </p>

              <div className="space-y-3 mb-8">
                {bestFit.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <ShieldCheck size={20} className="text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-white/90 text-md">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:w-72 bg-black/20 rounded-2xl p-6 border border-white/10 backdrop-blur-sm self-stretch flex flex-col justify-center">
              <div className="text-white/70 text-sm font-medium mb-2 uppercase tracking-wider">Estimated Coverage</div>
              <div className="text-4xl font-bold text-white mb-2 flex items-baseline">
                <IndianRupee size={28} className="text-[#C8B6A6]" />
                {bestFit.coverageAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-green-300 font-medium mb-6">
                Potential 100% savings on eligible bills
              </div>
              <button className="w-full py-3 bg-white text-[#8D7B68] rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                Apply Now <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Other Eligible Schemes */}
      {otherSchemes.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6 px-2">Other Eligible Schemes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherSchemes.map((scheme, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#8D7B68]/10 rounded-xl flex items-center justify-center text-[#8D7B68]">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">
                    {scheme.states.length > 0 ? scheme.states[0] : 'National'}
                  </span>
                </div>
                
                <h4 className="text-lg font-bold text-gray-900 mb-2">{scheme.name}</h4>
                <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-3">
                  {scheme.description}
                </p>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400 font-medium uppercase mb-1">Max Coverage</div>
                      <div className="text-lg font-bold text-[#8D7B68] flex items-center">
                        <IndianRupee size={16} />
                        {scheme.coverageAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-blue-600">
                      <ExternalLink size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
