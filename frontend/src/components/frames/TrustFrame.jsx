import { motion } from 'framer-motion';
import { ShieldCheck, FileKey, CheckCircle } from 'lucide-react';

export const TrustFrame = () => {
    return (
        <section className="w-full flex flex-col items-center justify-center relative z-10 px-6 py-20 bg-gray-50 border-y border-gray-100">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-sm mb-4">
                    <ShieldCheck size={18} /> Built on Trust
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                    Backed by Verified Government Data
                </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-10 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col items-start hover:shadow-xl transition-shadow"
                >
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                        <FileKey size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">NPPA Integration</h3>
                    <p className="text-gray-600 leading-relaxed">
                        National Pharmaceutical Pricing Authority ceilings are rigorously enforced on every single consumable extracted from your invoice.
                    </p>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-10 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col items-start hover:shadow-xl transition-shadow"
                >
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">CGHS Benchmarking</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Procedural costs are automatically cross-checked and flagged against official Central Government Health Scheme rates.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
