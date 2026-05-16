import { motion } from 'framer-motion';

export const ProblemVizFrame = () => {
    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.3 }
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <section className="w-full flex flex-col md:flex-row items-center justify-center gap-16 relative z-10 px-6 py-20 max-w-6xl mx-auto">
            <div className="flex-1 space-y-6">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-alert text-sm font-semibold border border-red-100"
                >
                    <span className="w-2 h-2 rounded-full bg-alert"></span>
                    Fraud Detection
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight"
                >
                    See exactly where you are losing money
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-600 leading-relaxed"
                >
                    Complex medical billing codes disguise inflated prices. Our system breaks it down line-by-line, highlighting identical consumables billed at 4x the market rate.
                </motion.p>
            </div>

            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={listVariants}
                className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl shadow-gray-200/60 border border-gray-100 flex-1 relative"
            >
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-alert/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold shadow-md">H</div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-none">City Hospital</h3>
                            <p className="text-gray-400 text-sm mt-1">Invoice #84729</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <motion.div variants={itemVariants} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 text-gray-700">
                        <span className="font-medium">Consultation Fee</span>
                        <span className="font-mono text-gray-900 font-semibold">₹ 1,500</span>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 text-gray-700">
                        <span className="font-medium">Room Rent (General)</span>
                        <span className="font-mono text-gray-900 font-semibold">₹ 8,000</span>
                    </motion.div>
                    {/* The overcharged item */}
                    <motion.div 
                        variants={itemVariants} 
                        className="flex justify-between items-center p-4 rounded-2xl bg-red-50 border border-red-100 relative group transition-all"
                    >
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 flex items-center gap-2">
                                Surgical Consumables
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-alert text-white px-2 py-0.5 rounded-md shadow-sm">Inflated 400%</span>
                            </span>
                            <span className="text-xs text-alert font-medium mt-1">NPPA Cap: ₹10,500</span>
                        </div>
                        <span className="font-mono text-alert font-bold text-lg line-through decoration-alert/30">₹ 42,300</span>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 text-gray-700">
                        <span className="font-medium">Pharmacy</span>
                        <span className="font-mono text-gray-900 font-semibold">₹ 6,200</span>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-600">Total Billed</span>
                    <span className="text-3xl font-black font-mono text-dark">₹ 58,000</span>
                </motion.div>
            </motion.div>
        </section>
    );
};
