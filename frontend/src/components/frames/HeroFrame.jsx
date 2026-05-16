import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const HeroFrame = () => {
    return (
        <section className="min-h-[85vh] w-full flex flex-col items-center justify-center relative z-10 px-6 pt-10">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-center max-w-5xl mx-auto flex flex-col items-center"
            >
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mb-8 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium inline-flex items-center gap-2 backdrop-blur-sm"
                >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Data-Driven Billing Truth
                </motion.div>
                
                <h1 className="text-6xl md:text-[5.5rem] leading-[1.1] font-black mb-8 tracking-tighter text-gray-900 drop-shadow-sm">
                    Healthcare Bills <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#9A8671] to-secondary relative">
                        Are Broken
                        <svg className="absolute w-full h-4 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path d="M0 15 Q 50 0 100 15" fill="none" stroke="currentColor" strokeWidth="4" />
                        </svg>
                    </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 font-light tracking-wide max-w-2xl mx-auto mb-12 leading-relaxed">
                    You are likely overpaying without even knowing. Upload your hospital bill, and our advanced system instantly audits it against NPPA benchmarks to secure your refund.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 rounded-full bg-dark text-white font-medium text-lg flex items-center justify-center gap-2 shadow-xl shadow-dark/20 transition-all hover:shadow-2xl hover:bg-gray-800"
                    >
                        Upload Invoice <ArrowRight size={20} />
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 rounded-full bg-white border border-gray-200 text-dark font-medium text-lg flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        See How It Works
                    </motion.button>
                </div>
            </motion.div>
        </section>
    );
};
