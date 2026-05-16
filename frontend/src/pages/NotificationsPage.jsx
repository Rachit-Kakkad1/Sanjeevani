import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, Trash2, ShieldCheck, TrendingDown, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

export default function NotificationsPage({ 
  onLogout, 
  onNavigateToDashboard, 
  onNavigateToUpload, 
  onNavigateToReports, 
  onNavigateToInsights, 
  onNavigateToGovData,
  onNavigateToProfile,
  onNavigateToJanAushadhi,
  onNavigateToCghsRates,
  currentPage 
}) {
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Major Overcharge Detected',
      message: 'Your recent bill from Apollo Hospital contains potential overcharges worth ₹4,200.',
      time: '2 hours ago',
      read: false,
      icon: AlertTriangle,
      color: '#ef4444'
    },
    {
      id: 2,
      type: 'success',
      title: 'Analysis Complete',
      message: 'Your medical statement has been successfully audited. 24 line items verified.',
      time: '5 hours ago',
      read: true,
      icon: CheckCircle,
      color: '#22c55e'
    },
    {
      id: 3,
      type: 'savings',
      title: 'New Savings Tip',
      message: 'Switching to generic equivalents for your regular prescriptions could save you ₹800/month.',
      time: '1 day ago',
      read: false,
      icon: TrendingDown,
      color: '#2563eb'
    },
    {
      id: 4,
      type: 'security',
      title: 'Privacy Update',
      message: 'Your medical data is now protected with our new end-to-end encryption layer.',
      time: '2 days ago',
      read: true,
      icon: ShieldCheck,
      color: '#8b5cf6'
    },
    {
      id: 5,
      type: 'info',
      title: 'New Policy Benchmark',
      message: 'CGHS has updated rates for MRI scans. We have synchronized your audit engine.',
      time: '3 days ago',
      read: true,
      icon: Info,
      color: '#8D7B68'
    }
  ];

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="min-h-screen"
      style={{ backgroundColor: '#E3D5CA' }}
    >
      <Navbar 
        onLogout={onLogout} 
        onNavigateToUpload={onNavigateToUpload}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToReports={onNavigateToReports}
        onNavigateToInsights={onNavigateToInsights}
        onNavigateToGovData={onNavigateToGovData}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToNotifications={() => {}}
        onNavigateToJanAushadhi={onNavigateToJanAushadhi}
        onNavigateToCghsRates={onNavigateToCghsRates}
        currentPage={currentPage}
      />

      <main className="pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black mb-1" style={{ color: '#1a1a1a' }}>Notifications</h1>
              <p className="text-[#8D7B68] font-medium">Stay updated with your bill audits and savings</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-white/50 text-[#8D7B68] hover:text-[#ef4444] transition-colors"
              title="Clear all"
            >
              <Trash2 size={20} />
            </motion.button>
          </motion.div>

          <div className="space-y-4">
            {notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <motion.div
                  key={notif.id}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                    notif.read 
                      ? 'bg-white/40 border-white/20 opacity-80' 
                      : 'bg-white border-white/40 shadow-md ring-1 ring-[#8D7B68]/5'
                  }`}
                >
                  {!notif.read && (
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: notif.color }} />
                  )}
                  
                  <div className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${notif.color}15` }}
                    >
                      <Icon size={24} style={{ color: notif.color }} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-bold ${notif.read ? 'text-[#1a1a1a]/70' : 'text-[#1a1a1a]'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-[10px] font-bold text-[#8D7B68]/60 flex items-center gap-1">
                          <Clock size={10} /> {notif.time}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${notif.read ? 'text-[#8D7B68]/70' : 'text-[#8D7B68]'}`}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            variants={itemVariants}
            className="mt-12 text-center"
          >
            <p className="text-sm text-[#8D7B68]/60">You're all caught up! ✨</p>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}
