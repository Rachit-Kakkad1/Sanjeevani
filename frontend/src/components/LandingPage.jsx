import { useState, useEffect } from 'react';
import { Upload, FileText, Search, Shield, TrendingUp, DollarSign, CheckCircle, AlertCircle, BarChart3, Activity, PieChart, ArrowRight, X, Menu, Clock, Star, Quote, ChevronDown, ChevronUp, Mail, Phone, MapPin, Send, Globe, ExternalLink, Rss, MessageCircle, Info, Newspaper as NewsIcon, Eye, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const COLORS = {
  background: '#F5F0E8',
  white: '#FFFFFF',
  ink: '#0F0F0F',
  red: '#D9230F',
  blue: '#0047AB',
  yellow: '#FFD700',
  gray: '#4a4a4a',
  lightGray: '#e5e7eb'
};

const SectionHeader = ({ kicker, title, color = COLORS.ink }) => (
  <div className="border-b-4 border-black pb-4 mb-10">
    <div className="flex items-center gap-2 mb-2">
      <span className="bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">{kicker}</span>
      <div className="h-px flex-1 bg-black/10"></div>
    </div>
    <h2 className="text-4xl md:text-6xl font-black heading-serif leading-none uppercase tracking-tighter" style={{ color }}>
      {title}
    </h2>
  </div>
);

const priceComparisonData = [
  { name: 'Pharma Markup', branded: 450, generic: 85 },
  { name: 'Room Service', branded: 280, generic: 60 },
  { name: 'Lab Profits', branded: 390, generic: 45 },
  { name: 'Admin Fees', branded: 150, generic: 10 },
  { name: 'Equipment', branded: 520, generic: 30 },
];

const overchargeTrendData = [
  { month: '2020', margin: 15 },
  { month: '2021', margin: 28 },
  { month: '2022', margin: 45 },
  { month: '2023', margin: 62 },
  { month: '2024', margin: 78 },
];

const savingsData = [
  { name: 'Unfair Markups', value: 45, color: '#D9230F' },
  { name: 'Duplicate Billing', value: 25, color: '#0F0F0F' },
  { name: 'Hidden Surcharges', value: 20, color: '#0047AB' },
  { name: 'Fraud Detected', value: 10, color: '#FFD700' },
];

const billItems = [
  { item: 'Critical Care Monitoring', charged: 18500, fair: 4200, status: 'overcharge' },
  { item: 'Biomedical Waste Disposal', charged: 2200, fair: 150, status: 'overcharge' },
  { item: 'Sterilized Equipment', charged: 4500, fair: 4200, status: 'valid' },
  { item: 'Pharmacy Markup (Special)', charged: 12800, fair: 3100, status: 'overcharge' },
  { item: 'Patient Admin Fee', charged: 6500, fair: 0, status: 'overcharge' },
];

const newsHeadlines = [
  "SCAM ALERT: Major Hospitals Charging 1200% Over CPPA Limits",
  "THE LOOT: How Middle-Class Families Lose Everything to 'Hidden' Fees",
  "BREAKING: MedClear Exposes ₹12,000 Crore Medical Billing Fraud",
  "INVESTIGATION: Why Your Insurance Pays More Than You Think",
  "VICTORY: Patient Reclaims ₹1.4 Lakh After Using MedClear Audit"
];

const features = [
  { icon: FileText, title: 'Deep OCR Audit', desc: 'Surgical extraction of every hidden line-item from your medical PDFs and photos.', color: COLORS.red },
  { icon: Search, title: 'Government Sync', desc: 'Real-time cross-referencing with NPPA and CGHS mandated price ceilings.', color: COLORS.blue },
  { icon: AlertTriangle, title: 'Fraud Detection', desc: 'Logic engines designed to catch duplicate charges and unbundled procedures.', color: COLORS.ink },
  { icon: Shield, title: 'Legal Fortress', desc: 'Automated legal-grade dispute letters to force hospitals into refunding overcharges.', color: COLORS.gray },
];

const ayushmanData = [
  { proc: 'Cardiac Stent', hosp: '₹1.2L', limit: '₹35K', save: '₹85,000' },
  { proc: 'Knee Implant', hosp: '₹95K', limit: '₹42K', save: '₹53,000' },
  { proc: 'ICU Day Care', hosp: '₹25K', limit: '₹6K', save: '₹19,000' },
];

export default function LandingPage({ onNavigateToLogin }) {
  const [, setIsUploaded] = useState(false);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % newsHeadlines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Helmet>
        <title>MedClear - Exposing Medical Billing Fraud</title>
        <meta name="description" content="Surgical Precision in Auditing Medical Overcharges. Upload your bill and discover the truth about your healthcare costs." />
      </Helmet>
      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-[#F5F0E8] border-b-2 border-black px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-12 h-12 md:w-20 md:h-20 flex items-center justify-center">
              <img src="/logo.png" alt="MedClear Logo" className="w-full h-full object-contain scale-110 md:scale-125" />
            </div>
            <span className="text-2xl md:text-4xl font-black heading-serif tracking-tighter uppercase text-black">MedClear</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#investigation" className="text-xs font-bold uppercase tracking-widest hover:text-red-600 transition-colors">The Evidence</a>
            <a href="#tools" className="text-xs font-bold uppercase tracking-widest hover:text-red-600 transition-colors">Our Tools</a>
            <a href="#database" className="text-xs font-bold uppercase tracking-widest hover:text-red-600 transition-colors">The Database</a>
            <button 
              onClick={onNavigateToLogin}
              className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all paper-shadow"
            >
              Audit Now
            </button>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Breaking News Ticker */}
      <div className="bg-red-600 text-white py-1.5 border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 flex items-center overflow-hidden">
          <span className="font-black text-[10px] uppercase tracking-tighter bg-white text-red-600 px-2 mr-4 whitespace-nowrap">URGENT</span>
          <AnimatePresence mode="wait">
            <motion.p 
              key={headlineIndex}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="text-sm font-bold uppercase tracking-wide whitespace-nowrap"
            >
              {newsHeadlines[headlineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        
        {/* Masthead */}
        <header className="text-center border-b-4 md:border-b-8 border-black pb-6 md:pb-10 mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-b-2 border-black pb-2 mb-4 text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] gap-2">
            <span>Vol. XLII --- No. 12,847</span>
            <span className="text-black text-[10px] md:text-sm">TUESDAY, APRIL 14, 2026</span>
            <span>Price: One Truth</span>
          </div>
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[12vw] md:text-[8rem] font-black leading-[0.8] tracking-tighter heading-serif mb-4 md:mb-6 break-words"
          >
            MEDCLEAR
          </motion.h1>
          <div className="h-1.5 md:h-2 bg-black w-full mb-1"></div>
          <div className="h-0.5 md:h-1 bg-black w-full"></div>
        </header>

        {/* Hero Section: The Lead Story */}
        <section className="grid lg:grid-cols-12 gap-10 mb-24 items-start">
          <div className="lg:col-span-8 border-r-0 lg:border-r-2 border-black lg:pr-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-black text-red-600 uppercase tracking-widest border-b-2 border-red-600">Special Investigative Report</span>
                <span className="text-xs text-gray-400 font-bold tracking-widest">• 5 Min Read</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black heading-serif leading-[0.9] tracking-tighter mb-8 uppercase">
                THE GREAT HOSPITAL <span className="text-red-600">HEIST.</span>
              </h2>
              <p className="text-2xl md:text-3xl font-bold leading-tight mb-8 text-gray-700 italic border-l-8 border-black pl-6">
                "We found line-items marked as 'Administrative Comfort' costing patients ₹12,000 for a single bed-sheet change."
              </p>
              
              <div className="columns-1 md:columns-2 gap-8 text-lg text-gray-900 leading-relaxed font-serif space-y-4 md:space-y-0">
                <p className="mb-4">
                  <span className="text-6xl float-left mr-3 mt-2 font-black leading-[0.8]">I</span>t starts with a simple admission. A fever, an elective surgery, or an emergency. But by the time the discharge papers arrive, families are handed a document that feels more like a ransom note than a medical invoice. 
                </p>
                <p className="mb-4">
                   Investigations by MedClear's data bureau have uncovered a systematic pattern of looting. Hospitals are unbundling procedures, charging for sterile equipment that was never used, and marking up essential medicines by over 800%—direct violations of government price ceilings.
                </p>
                <p>
                  "Most patients are too tired or too grateful to argue," says one anonymous auditor. "Middle-class families are losing 30% of their life savings to charges that are technically illegal under NPPA guidelines. We are here to stop the drain."
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 mt-12">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onNavigateToLogin}
                  className="bg-red-600 text-white px-10 py-5 font-black text-xl uppercase tracking-tighter paper-shadow flex items-center justify-center gap-3"
                >
                  <Upload className="w-6 h-6" /> UPLOAD YOUR BILL
                </motion.button>
                <button 
                  onClick={onNavigateToLogin}
                  className="bg-transparent border-4 border-black px-10 py-5 font-black text-xl uppercase tracking-tighter hover:bg-black hover:text-white transition-all"
                >
                  SEE THE EVIDENCE
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* The Evidence Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white border-4 border-black p-6 paper-shadow-red"
            >
              <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-4">
                <h3 className="font-black text-xl uppercase tracking-tighter">EXHIBIT A: AUDIT</h3>
                <Star className="text-red-600 fill-red-600 w-5 h-5" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border-2 border-red-600 animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-red-600 w-5 h-5" />
                    <span className="text-[10px] font-black uppercase text-red-600">Overcharge Detected</span>
                  </div>
                  <p className="text-3xl font-black text-red-600">₹42,300</p>
                </div>
                <div className="space-y-2">
                  {billItems.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-xs font-bold border-b border-gray-100 pb-2">
                      <span className="text-gray-500">{item.item}</span>
                      <span className={item.status === 'overcharge' ? 'text-red-600' : 'text-black'}>₹{item.charged}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 bg-black text-white font-black text-xs uppercase tracking-widest mt-4">Generate Legal Letter</button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="border-4 border-black p-4 bg-yellow-400">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/60">Total Recaptured</p>
                <p className="text-4xl font-black tracking-tighter">₹2.4 CRORE</p>
              </div>
              <div className="border-4 border-black p-4 bg-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/60">Average Saving</p>
                <p className="text-4xl font-black tracking-tighter">₹28,400</p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Investigation Section */}
        <section id="investigation" className="mb-24">
          <SectionHeader kicker="Investigation" title="THE NUMBERS DON'T LIE" color={COLORS.red} />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-white border-4 border-black p-6 paper-shadow-hover transition-all"
            >
              <h3 className="font-black text-lg mb-6 border-b-2 border-black pb-2 flex items-center gap-2 uppercase">
                <BarChart3 className="w-5 h-5" /> Pharma Markups Exposed
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={priceComparisonData}>
                    <XAxis dataKey="name" fontSize={10} hide />
                    <YAxis hide />
                    <Tooltip cursor={{fill: '#fef3c7'}} contentStyle={{ border: '2px solid black', borderRadius: 0 }} />
                    <Bar dataKey="branded" fill={COLORS.red} />
                    <Bar dataKey="generic" fill={COLORS.ink} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs font-bold text-gray-500 mt-4 italic">Comparison of bill charges vs. actual market costs for identical procedures.</p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="bg-white border-4 border-black p-6 paper-shadow-hover transition-all"
            >
              <h3 className="font-black text-lg mb-6 border-b-2 border-black pb-2 flex items-center gap-2 uppercase">
                <Activity className="w-5 h-5" /> The Loot Trajectory
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={overchargeTrendData}>
                    <XAxis dataKey="month" fontSize={10} stroke="#000" />
                    <YAxis hide />
                    <Tooltip contentStyle={{ border: '2px solid black', borderRadius: 0 }} />
                    <Line type="step" dataKey="margin" stroke={COLORS.red} strokeWidth={4} dot={{ r: 6, fill: COLORS.ink }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs font-bold text-gray-500 mt-4 italic">The percentage increase in non-clinical surcharges across private hospitals (2020-2024).</p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="bg-white border-4 border-black p-6 paper-shadow-hover transition-all flex flex-col"
            >
              <h3 className="font-black text-lg mb-6 border-b-2 border-black pb-2 flex items-center gap-2 uppercase">
                <PieChart className="w-5 h-5" /> Savings Breakdown
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <RechartsPie>
                    <Pie data={savingsData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} stroke="none" dataKey="value">
                      {savingsData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ border: '2px solid black', borderRadius: 0 }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="mt-auto space-y-1">
                {savingsData.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                    <span className="flex items-center gap-1"><div className="w-2 h-2" style={{backgroundColor: d.color}}></div>{d.name}</span>
                    <span>{d.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Demo Section - Premium Light Theme */}
        <section className="bg-white text-black p-10 md:p-20 mb-24 border-8 border-black paper-shadow-hover transition-all">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black heading-serif leading-none mb-6 uppercase">SEE THE OCR ENGINE <span className="text-red-600">TEAR THROUGH</span> LIES.</h2>
              <p className="text-xl text-gray-600 mb-10 font-medium">Our engine doesn't just read text; it understands the unbundled codes hospitals use to hide markups. It's surgical. It's precise. It's built for truth.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black flex items-center justify-center font-black text-white">01</div>
                  <p className="font-bold text-gray-800">Extract line-items from messy, multi-page PDFs.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black flex items-center justify-center font-black text-white">02</div>
                  <p className="font-bold text-gray-800">Auto-map charges to CPPA/NPPA schedules.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black flex items-center justify-center font-black text-white">03</div>
                  <p className="font-bold text-gray-800">Flag discrepancies & generate legal dispute files.</p>
                </div>
              </div>
            </motion.div>
            <div className="relative aspect-video bg-gray-50 border-4 border-black overflow-hidden flex items-center justify-center paper-shadow">
               <div className="text-center group cursor-pointer">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                     <ArrowRight className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest text-black">Watch System Demo</span>
               </div>
            </div>
          </div>
        </section>

        {/* Features / Investigation Tools */}
        <section id="tools" className="mb-24">
          <SectionHeader kicker="The Arsenal" title="BATTLE-READY INVESTIGATION TOOLS" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white border-4 border-black p-6 paper-shadow-hover transition-all"
              >
                <div className="w-14 h-14 bg-black flex items-center justify-center mb-6">
                  <f.icon className="text-white w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-3 uppercase tracking-tighter">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Government Database Sync (GV) - God-Level Light Theme */}
        <section id="database" className="mb-24 border-8 border-black p-1 transition-all">
           <div className="bg-white text-black p-8 md:p-12 paper-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b-4 border-black pb-8">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-tight">Official Bulletin</span>
                       <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ministry of Health Registry</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black heading-serif leading-none tracking-tighter uppercase">NATIONAL <span className="text-red-600">PRICE REGISTRY</span> SYNC</h2>
                    <div className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest flex items-center gap-2">
                       Update Frequency: 24H • Connection Status: 
                       <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="flex items-center gap-1 text-green-600 font-black">
                          <div className="w-2 h-2 rounded-full bg-green-600"></div> LIVE ONLINE
                       </motion.span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="px-4 py-2 border-2 border-black font-black text-[10px] uppercase bg-gray-50">NPPA Ledger: v4.2</div>
                    <div className="px-4 py-2 border-2 border-black font-black text-[10px] uppercase bg-gray-50">CGHS Master: v2.1</div>
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <th className="py-4 px-2">Procedure / Scheduled Implant</th>
                          <th className="py-4 px-2">Private Hospital Avg</th>
                          <th className="py-4 px-2">Govt. Mandated Ceiling</th>
                          <th className="py-4 px-2 text-red-600">The Overcharge Gap</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm font-bold">
                       {ayushmanData.map((d, i) => (
                         <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-2 heading-serif uppercase tracking-tight">{d.proc}</td>
                            <td className="py-4 px-2 text-gray-400 strike-through line-through">₹{Number(d.hosp.replace('₹','').replace('L','00000').replace('K','000')).toLocaleString()}</td>
                            <td className="py-4 px-2 text-black bg-yellow-400 font-black px-3 border border-black shadow-[2px_2px_0_0_#000]">₹{Number(d.limit.replace('₹','').replace('K','000')).toLocaleString()}</td>
                            <td className="py-4 px-2 text-red-600 font-black text-lg tracking-tighter">+{d.save}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="mt-8 pt-6 border-t font-bold text-gray-400 text-[10px] uppercase tracking-widest flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Verified by NPPA Schedules under Drugs Prices Control Order (DPCO)
                 </div>
                 <button className="text-black border-b-2 border-black hover:pb-1 transition-all">Download Full Schedule</button>
              </div>
           </div>
        </section>

        {/* Testimonials: Voices of the Looted */}
        <section className="mb-24">
           <SectionHeader kicker="The Survivors" title="VOICES OF THE RECLAIMED" />
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                { name: "Sumanth Reddy", city: "Hyderabad", story: "Hospital charged ₹4L for a cardiac stent that was capped at ₹35k. MedClear generated the legal letter in seconds. Recaptured ₹84,000 within a month." },
                { name: "Anita Kapoor", city: "Delhi", story: "Bill analysis found ₹12,000 billed for 'Bio-Disposable Kit' which already included in room charges. Pure unbundling fraud." },
                { name: "Maj. Vinod Tyagi", city: "Pune", story: "They think army veterans won't check the math. MedClear checked it for me and flagged ₹45k in drug markups. The hospital had to re-issue the bill." }
              ].map((t, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 border-2 border-black/10 bg-white relative"
                >
                   <Quote className="absolute top-4 right-4 text-black/5 w-12 h-12" />
                   <p className="text-lg font-serif italic mb-6 leading-relaxed">"{t.story}"</p>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black rounded-full"></div>
                      <div>
                         <p className="font-bold text-sm tracking-tighter">{t.name}</p>
                         <p className="text-[10px] font-black uppercase text-gray-400">{t.city}</p>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Final CTA - Premium God-Level Light Theme */}
        <section className="text-center py-32 mb-10 border-t-8 border-black bg-white">
           <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
           >
              <h2 className="text-6xl md:text-[9rem] font-black heading-serif leading-[0.8] tracking-tighter mb-10 uppercase">
                STOP THE <span className="text-red-600">HEIST.</span>
              </h2>
              <p className="text-xl md:text-2xl font-black max-w-2xl mx-auto mb-12 text-gray-800 uppercase tracking-tight">
                 Join 250,000+ Indian families who have reclaimed their savings. Audit is free. Ignorance is expensive.
              </p>
              <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
                 <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: '12px 12px 0px 0px #000' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNavigateToLogin}
                    className="bg-red-600 text-white px-16 py-8 font-black text-2xl uppercase tracking-tighter border-4 border-black shadow-[8px_8px_0px_0px_#000] hover:bg-red-700 transition-all"
                 >
                    Audit My Bill Now
                 </motion.button>
                 <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: '12px 12px 0px 0px #D9230F' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNavigateToLogin}
                    className="bg-white text-black px-16 py-8 font-black text-2xl uppercase tracking-tighter border-4 border-black shadow-[8px_8px_0px_0px_#000] hover:bg-gray-50 transition-all"
                 >
                    Join The Bureau
                 </motion.button>
              </div>
              <p className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">The Medical Billing Authority • Est. 2024</p>
           </motion.div>
        </section>

      </main>

      {/* Footer - Premium Light Theme */}
      <footer className="bg-[#F5F0E8] text-black pt-20 pb-10 border-t-8 border-black">
         <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-12 gap-12 mb-20">
            <div className="md:col-span-12 lg:col-span-4">
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-20 h-20 flex items-center justify-center">
                   <img src="/logo.png" alt="MedClear Logo" className="w-full h-full object-contain scale-110" />
                 </div>
                 <h2 className="text-4xl font-black heading-serif tracking-tighter uppercase">MEDCLEAR</h2>
               </div>
               <p className="text-gray-600 font-bold mb-8 leading-relaxed">
                  The Medical Billing Authority. Exposing the systemic looting of private healthcare since 2026. Data-driven, legal-ready, patient-first.
               </p>
               <div className="flex gap-4">
                  {[MessageCircle, Globe, Rss].map((Icon, i) => (
                    <div key={i} className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white cursor-pointer transition-colors shadow-[4px_4px_0_0_#000]">
                       <Icon size={18} />
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="md:col-span-4 lg:col-span-2 space-y-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-red-600 pb-2 border-b-2 border-black">Archive</h3>
               <ul className="text-xs font-bold space-y-3 text-gray-500">
                  <li className="hover:text-black cursor-pointer transition-colors">The Stent Loot (2026)</li>
                  <li className="hover:text-black cursor-pointer transition-colors">ICU Pricing Fraud</li>
                  <li className="hover:text-black cursor-pointer transition-colors">Hospital List</li>
                  <li className="hover:text-black cursor-pointer transition-colors">CPPA Guidelines</li>
               </ul>
            </div>

            <div className="md:col-span-4 lg:col-span-2 space-y-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-red-600 pb-2 border-b-2 border-black">Bureau</h3>
               <ul className="text-xs font-bold space-y-3 text-gray-500">
                  <li className="hover:text-black cursor-pointer transition-colors">About the Audit</li>
                  <li className="hover:text-black cursor-pointer transition-colors">Expert Panel</li>
                  <li className="hover:text-black cursor-pointer transition-colors">Legal Support</li>
                  <li className="hover:text-black cursor-pointer transition-colors">Contact Press</li>
               </ul>
            </div>

            <div className="md:col-span-4 lg:col-span-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-red-600 pb-2 border-b-2 border-black mb-6">Dispatch Subscription</h3>
               <p className="text-xs font-bold text-gray-600 mb-6 uppercase tracking-wider">Join 150,000+ receiving weekly fraud alerts.</p>
               <div className="flex border-4 border-black group focus-within:shadow-[8px_8px_0_0_#D9230F] transition-all">
                  <input type="email" placeholder="YOUR EMAIL ADDRESS" className="bg-white flex-1 px-4 py-3 outline-none text-xs font-black uppercase" />
                  <button className="bg-black text-white px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors">JOIN</button>
               </div>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto px-4 pt-10 border-t-2 border-black flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-[10px] font-black uppercase text-gray-400">© 2026 MedClear Gazette. The truth is free. Auditing is mandatory.</span>
            <div className="flex gap-8 text-[10px] font-black uppercase text-gray-400">
               <a href="#" className="hover:text-black">Privacy</a>
               <a href="#" className="hover:text-black">Terms</a>
               <a href="#" className="hover:text-black">Cookies</a>
            </div>
         </div>
      </footer>
    </div>
  );
}