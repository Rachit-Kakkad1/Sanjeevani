import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-8 md:p-12 mb-8 md:mb-12 shadow-2xl">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br from-[#8D7B68]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-gradient-to-tr from-[#A4907C]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-[#8D7B68]/20 text-[#C8B6A6] text-sm font-semibold tracking-wider uppercase mb-4 border border-[#8D7B68]/30">
            Financial Assistance
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Reduce Your Medical Bills with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8B6A6] to-[#A4907C]">Government Support</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl leading-relaxed">
            Discover eligible state and national healthcare schemes designed to significantly lower your out-of-pocket medical expenses. Enter your details below to find your best fit.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
