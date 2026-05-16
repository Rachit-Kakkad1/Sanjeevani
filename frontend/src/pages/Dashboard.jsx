import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, TrendingDown, Shield, Pill, FileCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import HeroPanel from '../components/HeroPanel';
import Timeline from '../components/Timeline';
import BillComparison from '../components/BillComparison';
import Analytics from '../components/Analytics';
import Insights from '../components/Insights';
import ActionPanel from '../components/ActionPanel';
import { getBillHistory } from '../utils/api';
import { trackEvent } from '../utils/analytics';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 20,
    }
  }
};

// TODO: fetch actual user stats instead of static data
export default function Dashboard({ 
  onLogout, 
  onNavigateToUpload, 
  onNavigateToGovData, 
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToReports,
  onNavigateToInsights,
  onNavigateToJanAushadhi,
  onNavigateToCghsRates,
  currentPage 
}) {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    trackEvent('page_view', { page_title: 'Dashboard' });
    async function fetchData() {
      try {
        const history = await getBillHistory();
        setBills(history || []);
      } catch (err) {
        console.error('Failed to fetch bills', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Aggregation logic
  const totalBill = bills.reduce((sum, b) => sum + (b.totalCharged || 0), 0);
  const expectedCost = bills.reduce((sum, b) => sum + (b.calculatedTotal || 0), 0);
  const overcharge = bills.reduce((sum, b) => sum + (b.totalOvercharge || 0), 0);

  // Latest bill for comparison
  const latestBill = bills.length > 0 ? bills[0] : null;
  const rawBillItems = latestBill ? latestBill.items.map(item => ({
    name: item.rawName,
    original: item.totalPrice,
    expected: item.isOvercharged ? (item.totalPrice - item.overchargeAmount) : item.totalPrice,
    flag: item.isOvercharged
  })) : [];
  
  const structuredData = latestBill ? latestBill.items.map(item => ({
    category: item.matchedReference?.category || 'Uncategorized',
    amount: item.isOvercharged ? (item.totalPrice - item.overchargeAmount) : item.totalPrice,
    status: item.isOvercharged ? 'adjusted' : 'verified'
  })) : [];

  // Analytics Aggregation
  const categoryMap = {};
  bills.forEach(b => {
    b.items.forEach(item => {
      const cat = item.matchedReference?.category || 'Other';
      if (!categoryMap[cat]) categoryMap[cat] = { charged: 0, expected: 0 };
      categoryMap[cat].charged += item.totalPrice;
      categoryMap[cat].expected += item.isOvercharged ? (item.totalPrice - item.overchargeAmount) : item.totalPrice;
    });
  });

  const barData = Object.entries(categoryMap).map(([name, data]) => ({
    name,
    charged: data.charged,
    expected: data.expected,
    diff: data.charged - data.expected
  })).sort((a, b) => b.charged - a.charged);

  const colors = ['#8D7B68', '#A4907C', '#C8B6A6', '#2563eb', '#22c55e', '#ef4444', '#f59e0b'];
  const pieData = barData.map((b, i) => ({
    name: b.name,
    value: b.charged,
    color: colors[i % colors.length],
    percent: Math.round((b.charged / (totalBill || 1)) * 100)
  }));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMap = {};
  [...bills].reverse().forEach(b => {
    const d = new Date(b.createdAt);
    const m = monthNames[d.getMonth()];
    if (!monthMap[m]) monthMap[m] = { savings: 0, count: 0 };
    monthMap[m].savings += (b.totalOvercharge || 0);
    monthMap[m].count += 1;
  });

  let cumulative = 0;
  const lineData = Object.entries(monthMap).map(([month, data]) => ({
    month,
    savings: data.savings,
    average: data.savings / data.count
  }));

  const areaData = Object.entries(monthMap).map(([month, data]) => {
    cumulative += data.savings;
    return {
      month,
      cumulative,
      target: cumulative + 5000 // dummy target curve
    };
  });

  const categoryStats = barData.map(b => ({
    name: b.name,
    status: b.diff > 0 ? 'high' : 'normal',
    message: b.diff > 0 ? `₹${b.diff} overcharged` : 'Within fair range'
  })).slice(0, 4);

  // Dynamic Insights
  const dynamicInsights = [];
  if (overcharge > 0) {
    dynamicInsights.push({
      type: 'savings',
      icon: TrendingDown,
      title: 'Potential Savings',
      description: `You can save up to ₹${overcharge.toLocaleString()} by disputing inflated charges across your bills.`,
      action: 'Start Dispute',
      color: '#22c55e',
      bg: 'bg-[#22c55e]/10',
    });
  }
  if (barData.length > 0 && barData[0].diff > 0) {
    dynamicInsights.push({
      type: 'overcharge',
      icon: AlertTriangle,
      title: 'Major Overcharge Detected',
      description: `${barData[0].name} charges are significantly higher than standard rates.`,
      action: 'View Details',
      color: '#ef4444',
      bg: 'bg-[#ef4444]/10',
    });
  }
  if (totalBill > 0) {
    dynamicInsights.push({
      type: 'verified',
      icon: FileCheck,
      title: 'Verified Data',
      description: 'All bill items have been cross-checked with latest CGHS and hospital rate cards.',
      action: 'View Source',
      color: '#2563eb',
      bg: 'bg-[#2563eb]/10',
    });
  }

  dynamicInsights.push({
    type: 'store',
    icon: Pill,
    title: 'Nearby Jan Aushadhi',
    description: 'Find nearby government-certified stores to save up to 80% on medicines.',
    action: 'Find Stores',
    onAction: () => onNavigateToJanAushadhi(),
    color: '#8D7B68',
    bg: 'bg-[#8D7B68]/10',
  });

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="min-h-screen"
    >
      <Helmet>
        <title>Dashboard | MedClear - Your Health Audit</title>
        <meta name="description" content="View your medical bill history, total savings, and overcharge analytics." />
      </Helmet>
      <Navbar 
        onLogout={onLogout} 
        onNavigateToUpload={onNavigateToUpload} 
        onNavigateToDashboard={() => {}} 
        onNavigateToReports={onNavigateToReports} 
        onNavigateToInsights={onNavigateToInsights} 
        onNavigateToGovData={onNavigateToGovData} 
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToNotifications={onNavigateToNotifications}
        onNavigateToJanAushadhi={onNavigateToJanAushadhi}
        onNavigateToCghsRates={onNavigateToCghsRates}
        currentPage={currentPage} 
      />
      
      <main className="pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="mb-8 md:mb-12">
            <HeroPanel totalBill={totalBill} expectedCost={expectedCost} overcharge={overcharge} isLoading={isLoading} />
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8 md:mb-12">
            <Timeline />
          </motion.div>

          <div className="grid xl:grid-cols-4 gap-8 mb-8 md:mb-12">
            <motion.div variants={itemVariants} className="xl:col-span-3">
              <BillComparison rawBillItems={rawBillItems} structuredData={structuredData} isLoading={isLoading} />
            </motion.div>
            
            <motion.div variants={itemVariants} className="xl:col-span-1">
              <ActionPanel onNavigateToUpload={onNavigateToUpload} />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mb-8 md:mb-12">
            <Analytics 
              barData={barData} 
              pieData={pieData} 
              lineData={lineData} 
              areaData={areaData} 
              categoryStats={categoryStats}
              isLoading={isLoading} 
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Insights insightsData={dynamicInsights} isLoading={isLoading} />
          </motion.div>
        </div>
      </main>

      <footer className="py-8 px-4 md:px-8 border-t border-[#C8B6A6]/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8D7B68] flex items-center justify-center">
              <span className="text-white font-serif text-sm font-bold">M</span>
            </div>
            <span className="text-[#8D7B68] text-sm">
              MedClear — Medical Bill Audit Platform
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-[#8D7B68]">
            <a href="#" className="hover:text-[#1a1a1a] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#1a1a1a] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#1a1a1a] transition-colors">Contact</a>
          </div>
          
          <p className="text-[#8D7B68] text-sm">
            © 2024 MedClear. All rights reserved.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}