import { motion } from 'framer-motion';

export const SolutionFrame = () => {
    return (
        <section className="w-full flex items-center justify-center relative z-10 px-6 py-32 overflow-hidden">
            {/* Background glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                whileInView={{ scale: 1, opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                className="text-center relative z-10"
            >
                <div className="mb-6 mx-auto w-24 h-24 bg-white shadow-xl shadow-gray-200/50 rounded-3xl flex items-center justify-center border border-gray-100">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </div>
                
                <h2 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter mb-6 relative inline-block">
                    Meet MedClear
                </h2>
                <p className="text-2xl text-gray-500 font-light max-w-2xl mx-auto">
                    The ultimate automated auditor that identifies, disputes, and re-prices your medical bills in seconds.
                </p>
            </motion.div>
        </section>
    );
};
