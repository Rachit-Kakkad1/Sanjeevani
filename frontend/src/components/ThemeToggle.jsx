import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-white/10 dark:bg-white/5 border border-primary/20 hover:border-primary/40 text-primary transition-all duration-300 focus:outline-none shadow-sm"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 fill-slate-600 text-slate-600" />
      ) : (
        <Sun className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;