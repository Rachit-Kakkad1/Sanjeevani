import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, User, LayoutDashboard, FileUp, Database, MapPin, LogOut, ChevronDown, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ 
  onLogout, 
  onNavigateToUpload, 
  onNavigateToDashboard, 
  onNavigateToReports, 
  onNavigateToInsights, 
  onNavigateToGovData, 
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToJanAushadhi,
  onNavigateToCghsRates,
  currentPage 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: onNavigateToDashboard },
    { id: 'upload', label: 'Upload Bill', icon: FileUp, action: onNavigateToUpload },
    { id: 'jan-aushadhi', label: 'Store Finder', icon: MapPin, action: onNavigateToJanAushadhi },
    { id: 'cghs-rates', label: 'CGHS Rates', icon: Activity, action: onNavigateToCghsRates },
    { id: 'gov-data', label: 'Gov Schemes', icon: Database, action: onNavigateToGovData },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Guest User", "email": "guest@sanjeevani.ai"}');

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'py-3 bg-background/80 backdrop-blur-xl border-b border-primary/10 shadow-lg' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={onNavigateToDashboard}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight text-text-main">
              Sanjee<span className="text-primary">vani</span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={link.action}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  currentPage === link.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-muted hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />
            
            <button 
              onClick={onNavigateToNotifications}
              className="p-2.5 rounded-xl hover:bg-primary/5 text-text-muted transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 bg-white/5"
              >
                <div className="text-right">
                  <p className="text-xs font-bold text-text-main leading-none mb-1">{user.name}</p>
                  <p className="text-[10px] text-text-muted leading-none">Pro Plan</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-56 glass-card rounded-2xl py-2 shadow-2xl z-50 overflow-hidden"
                  >
                    <button 
                      onClick={() => { setIsProfileOpen(false); onNavigateToProfile(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-primary/10 transition-colors"
                    >
                      <User className="w-4 h-4 text-primary" />
                      My Profile
                    </button>
                    <div className="h-px bg-primary/10 my-1 mx-2"></div>
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            <ThemeToggle />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-text-main hover:bg-primary/5 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-primary/10 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => { link.action(); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    currentPage === link.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-text-muted hover:bg-primary/5'
                  }`}
                >
                  <link.icon size={20} />
                  {link.label}
                </button>
              ))}
              <div className="h-px bg-primary/10 my-2"></div>
              <button 
                onClick={() => { onNavigateToProfile(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-text-muted"
              >
                <User size={20} />
                Profile
              </button>
              <button 
                onClick={onLogout}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-red-500"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;// TODO: refine mobile menu animations with stagger effect
