import { motion } from 'framer-motion';
import { Search, IndianRupee, MapPin } from 'lucide-react';
import { useState } from 'react';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir"
];

export default function InputPanel({ onSearch, isLoading }) {
  const [income, setIncome] = useState('');
  const [state, setState] = useState('');

  const handleIncomeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setIncome(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (income && state) {
      onSearch(Number(income), state);
    }
  };

  const formatCurrency = (val) => {
    if (!val) return '';
    return Number(val).toLocaleString('en-IN');
  };

  return (
    <motion.div 
      className="glass-card p-6 md:p-8 rounded-2xl border border-white/50 shadow-xl relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[#8D7B68]" />
      
      <h2 className="text-xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
        <Search className="text-[#8D7B68]" size={24} />
        Check Eligibility
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-6">
        
        {/* Income Input */}
        <div className="md:col-span-5 relative group">
          <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-[#8D7B68]">
            Annual Family Income
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee size={18} className="text-gray-400 group-focus-within:text-[#8D7B68] transition-colors" />
            </div>
            <input
              type="text"
              value={formatCurrency(income)}
              onChange={handleIncomeChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8D7B68] focus:border-transparent outline-none transition-all text-base md:text-lg font-medium text-gray-900 placeholder-gray-400"
              placeholder="e.g. 5,00,000"
            />
          </div>
        </div>

        {/* State Dropdown */}
        <div className="md:col-span-5 relative group">
          <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-[#8D7B68]">
            State of Residence
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin size={18} className="text-gray-400 group-focus-within:text-[#8D7B68] transition-colors" />
            </div>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8D7B68] focus:border-transparent outline-none transition-all text-base md:text-lg font-medium text-gray-900 appearance-none cursor-pointer"
            >
              <option value="" disabled className="text-gray-400">Select State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {/* Custom dropdown arrow to replace default */}
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex items-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !income || !state}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              isLoading || !income || !state 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#8D7B68] to-[#A4907C] hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Search size={18} />
                <span>Find Schemes</span>
              </div>
            )}
          </motion.button>
        </div>

      </form>
    </motion.div>
  );
}
