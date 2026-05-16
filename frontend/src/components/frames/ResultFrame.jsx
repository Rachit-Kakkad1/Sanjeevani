import { motion } from 'framer-motion';

export const ResultFrame = () => {
    return (
        <section className="w-full flex items-center justify-center relative z-10 px-6 py-24">
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, type: "spring", stiffness: 100 }}
                className="text-center relative max-w-5xl w-full bg-white rounded-[3rem] p-16 md:p-24 shadow-2xl shadow-gray-200 border border-gray-100 overflow-hidden"
            >
                {/* Decorative background flare */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-primary/5"></div>
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-500 mb-6 drop-shadow-sm">
                        Average amount saved per bill
                    </h2>
                    <h1 className="text-7xl md:text-[8rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-green-600 drop-shadow-lg mb-8">
                        ₹42,300
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                        Don't leave your hard-earned money on the table. Join 10,000+ patients who successfully fought inflated medical costs.
                    </p>
                </div>
            </motion.div>
        </section>
    );
};
