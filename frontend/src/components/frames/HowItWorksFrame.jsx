import { motion } from 'framer-motion';
import { UploadCloud, Zap, ShieldCheck, Scale } from 'lucide-react';

export const HowItWorksFrame = () => {
    const steps = [
        { id: 1, title: "Snap & Upload", desc: "Securely upload pictures of your multi-page hospital invoices. No sorting required.", icon: <UploadCloud size={28} /> },
        { id: 2, title: "Data Extraction", desc: "Our advanced OCR technology extracts granular data, ICD codes, and specific line-items instantly.", icon: <Zap size={28} /> },
        { id: 3, title: "Benchmark Check", desc: "Prices are cross-referenced with CGHS and NPPA government ceilings.", icon: <Scale size={28} /> },
        { id: 4, title: "Dispute & Refund", desc: "We generate a legal-grade dispute report to help you reclaim your money.", icon: <ShieldCheck size={28} /> },
    ];

    return (
        <section className="w-full flex flex-col items-center justify-center relative z-10 py-24 px-6 bg-white/40 border-y border-gray-100">
            <div className="max-w-6xl w-full">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">How It Works</h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">A completely automated pipeline designed to audit your bills efficiently and legally.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: index * 0.15, duration: 0.6 }}
                            className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/80 border border-gray-100 flex flex-col text-left group hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                                {step.icon}
                            </div>
                            <div className="text-sm font-bold text-gray-400 mb-2 font-mono">STEP 0{step.id}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
