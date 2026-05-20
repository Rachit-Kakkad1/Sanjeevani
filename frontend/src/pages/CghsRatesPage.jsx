import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, Download, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import CghsTable from '../components/CghsTable';
import { getCghsProcedures, getClassifications } from '../services/cghs.service';
import { trackEvent } from '../utils/analytics';

// TODO: tweak page transition variants
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
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function CghsRatesPage({ 
  onLogout, 
  onNavigateToDashboard, 
  onNavigateToUpload, 
  onNavigateToReports, 
  onNavigateToInsights, 
  onNavigateToGovData, 
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToJanAushadhi,
  currentPage 
}) {
  const [procedures, setProcedures] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedClassification, setSelectedClassification] = useState('All');
  const limit = 20;

  const fetchProcedures = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCghsProcedures({
        search,
        classification: selectedClassification,
        page,
        limit
      });
      setProcedures(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch procedures', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedClassification, page]);

  useEffect(() => {
    trackEvent('page_view', { page_title: 'CGHS Rates' });
    async function init() {
      try {
        const cats = await getClassifications();
        setClassifications(cats);
      } catch (err) {
        console.error('Failed to fetch classifications', err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProcedures();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProcedures]);

  const totalPages = Math.ceil(total / limit);

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="min-h-screen bg-[#0a0a0b] text-white"
    >
      <Helmet>
        <title>CGHS Rates Explorer | Sanjeevani</title>
      </Helmet>
      
      <Navbar 
        onLogout={onLogout} 
        onNavigateToUpload={onNavigateToUpload} 
        onNavigateToDashboard={onNavigateToDashboard} 
        onNavigateToReports={onNavigateToReports} 
        onNavigateToInsights={onNavigateToInsights} 
        onNavigateToGovData={onNavigateToGovData} 
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToNotifications={onNavigateToNotifications}
        onNavigateToJanAushadhi={onNavigateToJanAushadhi}
        onNavigateToCghsRates={() => {}}
        currentPage={currentPage} 
      />

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-4">
            CGHS Medical Procedure Rates
          </h1>
          <p className="text-gray-400 text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-teal-500" />
            Government-approved benchmark pricing reference for medical procedures.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="md:col-span-2 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search by procedure name or code (e.g., Liver, LB124)..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-teal-500/50 transition-all backdrop-blur-sm"
            />
          </div>

          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-500 transition-colors" />
            <select 
              value={selectedClassification}
              onChange={(e) => { setSelectedClassification(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-teal-500/50 transition-all backdrop-blur-sm appearance-none cursor-pointer"
            >
              <option value="All">All Classifications</option>
              {classifications.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm">
            <span className="text-gray-400 text-sm">Total Procedures</span>
            <span className="text-2xl font-mono text-teal-400">{total.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Table Section */}
        <motion.div variants={itemVariants} className="min-h-[600px]">
          <CghsTable data={procedures} loading={loading} />
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            variants={itemVariants}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-teal-400 font-mono text-lg font-bold">{page}</span>
              <span className="text-gray-500">of</span>
              <span className="text-gray-400 font-mono">{totalPages}</span>
            </div>

            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </main>

      <footer className="mt-20 py-12 px-4 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-white font-bold">S</span>
            </div>
            <div>
              <p className="text-white font-bold">Sanjeevani</p>
              <p className="text-gray-500 text-xs">Medical Bill Transparency Initiative</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Sanjeevani. Benchmarked against official CGHS data.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
