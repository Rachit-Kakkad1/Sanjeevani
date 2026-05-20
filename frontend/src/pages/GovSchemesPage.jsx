import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import HeroSection from '../components/schemes/HeroSection';
import InputPanel from '../components/schemes/InputPanel';
import ResultsSection from '../components/schemes/ResultsSection';
import InsightsPanel from '../components/schemes/InsightsPanel';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

// TODO: animate page loading
export default function GovSchemesPage({ 
  onLogout, 
  onNavigateToUpload, 
  onNavigateToDashboard, 
  onNavigateToReports, 
  onNavigateToInsights, 
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToJanAushadhi,
  onNavigateToCghsRates,
  currentPage 
}) {
  const [schemes, setSchemes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedIncome, setSearchedIncome] = useState(null);

  const handleSearch = async (income, state) => {
    setIsLoading(true);
    setSearchedIncome(income);
    try {
      const response = await axios.get(`${API_BASE_URL}/schemes`, {
        params: { income, state }
      });
      // Simulate slight network delay for premium loader UX
      setTimeout(() => {
        setSchemes(response.data);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching schemes:", error);
      setSchemes([]);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background transition-colors duration-300"
    >
      <Helmet>
        <title>Government Schemes | Sanjeevani - Eligibility Checker</title>
        <meta name="description" content="Discover government healthcare schemes and eligibility based on your income and state." />
      </Helmet>
      <Navbar
        onLogout={onLogout}
        onNavigateToUpload={onNavigateToUpload}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToReports={onNavigateToReports}
        onNavigateToInsights={onNavigateToInsights}
        onNavigateToGovData={() => {}} // current page
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToNotifications={onNavigateToNotifications}
        onNavigateToJanAushadhi={onNavigateToJanAushadhi}
        onNavigateToCghsRates={onNavigateToCghsRates}
        currentPage={currentPage}
      />

      <main className="pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <HeroSection />
          <InputPanel onSearch={handleSearch} isLoading={isLoading} />
          {schemes && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <InsightsPanel schemes={schemes} income={searchedIncome} />
              <ResultsSection schemes={schemes} searchedIncome={searchedIncome} />
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>  );
}
