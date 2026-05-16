import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

/* ─── Icon Components ─── */
const ShieldCheckIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.2" />
    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldMedicalIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 4L8 12v8c0 11.1 6.84 21.48 16 24 9.16-2.52 16-12.9 16-24v-8L24 4z" fill="#8D7B68" />
    <path d="M24 4L8 12v8c0 11.1 6.84 21.48 16 24 9.16-2.52 16-12.9 16-24v-8L24 4z" fill="url(#shieldGrad)" />
    <path d="M22 18v4h-4v4h4v4h4v-4h4v-4h-4v-4h-4z" fill="white" />
    <defs>
      <linearGradient id="shieldGrad" x1="8" y1="4" x2="40" y2="48">
        <stop offset="0%" stopColor="#A4907C" />
        <stop offset="100%" stopColor="#8D7B68" />
      </linearGradient>
    </defs>
  </svg>
);

const BarChartIcon = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="17" y="4" width="4" height="17" rx="1" fill="currentColor" />
  </svg>
);

const LockIcon = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" opacity="0.8" />
    <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="16" r="1.5" fill="white" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8D7B68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const LockSmallIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8D7B68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

/* ─── Feature Cards ─── */
const features = [
  { icon: ShieldCheckIcon, title: 'Audit & Verify', desc: 'AI-powered bill audits' },
  { icon: BarChartIcon, title: 'Prevent Overcharge', desc: 'Identify unfair billing' },
  { icon: LockIcon, title: 'Secure & Private', desc: 'Your data is 100% protected' },
];

/* ─── Main Component ─── */
const LoginPage = ({ onNavigateBack, onNavigateToDashboard }) => {

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        
        localStorage.setItem('user', JSON.stringify({
          name: userInfo.data.name,
          email: userInfo.data.email,
          picture: userInfo.data.picture,
          joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }));
        
        onNavigateToDashboard();
      } catch (err) {
        console.error('Failed to fetch user info', err);
      }
    },
    onError: error => console.error('Login Failed:', error)
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: '#F5EFE7' }}>
      
      {/* ─── Left Panel ─── */}
      <div className="hidden lg:flex lg:w-[48%] flex-col relative overflow-hidden">
        
        {/* Full-bleed Background Image */}
        <img
          src="/parliament.png"
          alt="Government building"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'sepia(20%) saturate(70%) brightness(1.05)' }}
        />
        
        {/* Gradient Mask Overlay — heavy at top (for text readability), lighter at bottom (image shows through) */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(180deg, 
              rgba(245, 239, 231, 0.97) 0%, 
              rgba(245, 239, 231, 0.94) 15%,
              rgba(232, 221, 212, 0.88) 35%,
              rgba(227, 213, 202, 0.75) 55%,
              rgba(227, 213, 202, 0.50) 75%,
              rgba(227, 213, 202, 0.30) 90%,
              rgba(227, 213, 202, 0.15) 100%
            )
          `
        }} />

        {/* Logo — on top of everything */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3 p-8 pb-0"
        >
          <div className="w-10 h-10 rounded-xl bg-[#8D7B68] flex items-center justify-center shadow-lg">
            <ShieldCheckIcon size={22} className="text-white" />
          </div>
          <div>
            <span className="text-[#1a1a1a] font-bold text-lg tracking-wide">MEDCLEAR</span>
            <p className="text-[#8D7B68] text-[10px] tracking-[0.15em] uppercase -mt-1">The Medical Billing Authority</p>
          </div>
        </motion.div>

        {/* Content — on top of everything */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 xl:px-14 pb-0">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(141, 123, 104, 0.15)' }}
            >
              <ShieldCheckIcon size={16} className="text-[#8D7B68]" />
              <span className="text-[#8D7B68] text-sm font-medium">Trusted. Transparent. Accountable.</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeUp} custom={1}
              className="text-[2.6rem] xl:text-[3rem] font-bold leading-[1.15] text-[#1a1a1a] mb-6"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Building a fairer<br />
              healthcare system<br />
              <span style={{
                background: 'linear-gradient(135deg, #A4907C, #8D7B68)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                with data and<br />transparency.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p variants={fadeUp} custom={2}
              className="text-[#5a5a5a] text-base leading-relaxed max-w-sm mb-10"
            >
              MedClear is India's trusted platform for auditing medical bills, exposing overcharges, and ensuring accountability in healthcare.
            </motion.p>

            {/* Feature Cards */}
            <motion.div variants={fadeUp} custom={3}
              className="flex gap-6 mb-8"
            >
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex flex-col items-center text-center w-28">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm"
                      style={{ backgroundColor: 'rgba(141, 123, 104, 0.18)' }}
                    >
                      <Icon size={26} className="text-[#8D7B68]" />
                    </div>
                    <span className="text-[#1a1a1a] text-xs font-bold mb-1">{f.title}</span>
                    <span className="text-[#7a6a5a] text-[11px] leading-tight">{f.desc}</span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16"
        style={{ backgroundColor: '#ffffff' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Shield Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <ShieldMedicalIcon size={56} />
            </motion.div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2" style={{ fontFamily: "'Georgia', serif" }}>
              Welcome Back
            </h1>
            <p className="text-[#8D7B68] text-sm">
              Sign in to continue to your MedClear account
            </p>
          </div>

          {/* Google Button */}
          <motion.button
            onClick={() => login()}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 px-6 flex items-center justify-center gap-3 rounded-xl font-medium text-[#1a1a1a] bg-white border border-[#e0e0e0] shadow-sm hover:shadow-md transition-all cursor-pointer mb-6"
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>


        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-auto pt-8"
        >
          <div className="flex items-center justify-center gap-2 text-xs text-[#8D7B68]">
            <LockSmallIcon />
            <span>
              By signing in, you agree to our{' '}
              <button className="underline cursor-pointer font-medium hover:text-[#1a1a1a] transition-colors">Terms of Service</button>
              {' '}and{' '}
              <button className="underline cursor-pointer font-medium hover:text-[#1a1a1a] transition-colors">Privacy Policy</button>.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
