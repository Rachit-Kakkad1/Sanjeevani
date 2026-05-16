import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Bell, CreditCard, ChevronRight, Settings, Camera } from 'lucide-react';
import Navbar from '../components/Navbar';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

export default function ProfilePage({ 
  onLogout, 
  onNavigateToDashboard, 
  onNavigateToUpload, 
  onNavigateToReports, 
  onNavigateToInsights, 
  onNavigateToGovData,
  onNavigateToNotifications,
  onNavigateToJanAushadhi,
  onNavigateToCghsRates,
  currentPage 
}) {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const user = {
    name: storedUser?.name || 'Rachit Kakkad',
    email: storedUser?.email || 'rachit.kakkad@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    joined: storedUser?.joined || 'April 2024',
    avatar: storedUser?.picture || null
  };

  const sections = [
    {
      title: 'Account Settings',
      items: [
        { icon: User, label: 'Personal Information', value: 'Manage your profile details', color: '#8D7B68' },
        { icon: Mail, label: 'Email & Security', value: 'Password, 2FA, and recovery', color: '#2563eb' },
        { icon: Bell, label: 'Notifications', value: 'Alerts and update preferences', color: '#f59e0b', onClick: onNavigateToNotifications },
      ]
    },
    {
      title: 'Healthcare & Billing',
      items: [
        { icon: Shield, label: 'Insurance Details', value: 'Manage policies and providers', color: '#22c55e' },
        { icon: CreditCard, label: 'Payment Methods', value: 'Saved cards and UPI IDs', color: '#8b5cf6' },
      ]
    }
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="min-h-screen bg-background transition-colors duration-300"
    >
      <Navbar
        onLogout={onLogout}
        onNavigateToUpload={onNavigateToUpload}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToReports={onNavigateToReports}
        onNavigateToInsights={onNavigateToInsights}
        onNavigateToGovData={onNavigateToGovData}
        onNavigateToProfile={() => {}}
        onNavigateToNotifications={onNavigateToNotifications}
        onNavigateToJanAushadhi={onNavigateToJanAushadhi}
        onNavigateToCghsRates={onNavigateToCghsRates}
        currentPage={currentPage}
      />

      <main className="pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header Profile Card */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />

            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-4 border-background shadow-xl overflow-hidden"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <>
                      <User size={48} className="text-white/80 md:hidden" />
                      <User size={64} className="text-white/80 hidden md:block" />
                    </>
                  )}
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-card shadow-lg border border-primary/20 text-primary"
                >
                  <Camera size={18} />
                </motion.button>
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-black mb-1 text-text-main">{user.name}</h1>
                <p className="text-sm md:text-base text-primary font-medium mb-4">Member since {user.joined}</p>

                <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-2 md:gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-[10px] md:text-xs font-bold text-primary border border-primary/10">
                    <Mail size={14} /> {user.email}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-[10px] md:text-xs font-bold text-primary border border-primary/10">
                    <MapPin size={14} /> {user.location}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Settings Sections */}
          {sections.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants} className="mb-8">
              <h2 className="text-sm uppercase tracking-widest font-black text-primary/60 mb-4 px-2">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ x: 10, backgroundColor: 'var(--color-primary-10)' }}
                      onClick={item.onClick}
                      className="w-full flex items-center justify-between p-4 rounded-2xl glass-card border border-primary/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>      
                          <Icon size={20} style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="font-bold text-text-main">{item.label}</p>
                          <p className="text-xs text-text-muted">{item.value}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-text-muted/40" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Danger Zone */}
          <motion.div variants={itemVariants}>
            <button
              onClick={onLogout}
              className="w-full p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              Logout from Account
            </button>
          </motion.div>
        </div>
      </main>
    </motion.div>  );
}
