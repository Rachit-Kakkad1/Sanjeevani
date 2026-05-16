import { motion } from 'framer-motion';

export const EmotionalPainFrame = () => {
    return (
        <section className="w-full flex items-center justify-center relative z-10 px-6 py-20">
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center max-w-4xl bg-white/60 backdrop-blur-3xl border border-white/80 shadow-2xl shadow-primary/5 p-16 rounded-[3rem]"
            >
                <div className="w-16 h-16 bg-alert/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="text-alert text-2xl">⚠️</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-6 tracking-tight">
                    Patients pay <span className="text-alert bg-alert/10 px-3 py-1 rounded-xl">lakhs</span> in hidden fees.
                </h2>
                <h3 className="text-2xl md:text-3xl text-gray-600 font-light leading-relaxed">
                    Hospitals frequently inflate consumable costs, overcharge for room rents, and bypass government price caps. 
                    <strong className="font-semibold text-gray-900"> And you pay the price.</strong>
                </h3>
            </motion.div>
        </section>
    );
};
