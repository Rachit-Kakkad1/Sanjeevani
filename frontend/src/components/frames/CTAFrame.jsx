import { motion } from 'framer-motion';

export const CTAFrame = () => {
    return (
        <section className="w-full flex items-center justify-center relative z-10 px-6 py-20 pb-32">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-primary overflow-hidden rounded-[3rem] p-16 md:p-24 shadow-2xl relative max-w-6xl w-full text-center"
            >
                {/* Abstract background shapes inside CTA */}
                <div className="absolute -top-[50%] -left-[10%] w-[80%] h-[150%] bg-secondary/30 rounded-full blur-[80px] pointer-events-none transform -rotate-12"></div>
                <div className="absolute -bottom-[50%] -right-[10%] w-[60%] h-[150%] bg-[#C8B6A6]/20 rounded-full blur-[80px] pointer-events-none transform rotate-12"></div>
                
                <div className="relative z-10">
                    <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        Upload your first bill. <br className="hidden md:block" />
                        Get your money back.
                    </h2>
                    <p className="text-xl md:text-2xl text-primary-50 text-white/80 mb-12 font-light max-w-2xl mx-auto">
                        Stop letting hospitals overcharge you blindly. Join thousands of patients saving lakhs today.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-primary font-bold text-lg px-10 py-5 rounded-full shadow-xl hover:shadow-2xl transition-all"
                        >
                            Upload Bill Now
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-transparent text-white border-2 border-white/30 font-medium text-lg px-10 py-5 rounded-full hover:bg-white/10 transition-all backdrop-blur-sm"
                        >
                            View Sample Report
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};
