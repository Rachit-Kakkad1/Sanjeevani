import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import UploadPage from './components/upload/UploadPage';
import ReportsPage from './components/reports/ReportsPage';
import InsightsPage from './components/insights/InsightsPage';
import Dashboard from './pages/Dashboard';
import GovSchemesPage from './pages/GovSchemesPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import JanAushadhiMap from './pages/JanAushadhiMap';
import CghsRatesPage from './pages/CghsRatesPage';

function App() { // Main app component
  // TODO: Implement React Router for cleaner navigation
  const [currentPage, setCurrentPage] = useState('landing');

  const handleLogout = () => {
    setCurrentPage('landing');
  };

  return (
    <div className="relative overflow-x-hidden">
      <Helmet>
        <title>Sanjeevani - The Ultimate Medical Bill Advocate</title>
        <meta name="description" content="AI-powered medical bill auditing tool to detect overcharges and billing fraud." />
      </Helmet>
      {currentPage === 'landing' && (
        <LandingPage onNavigateToLogin={() => setCurrentPage('login')} />
      )}
      {currentPage === 'login' && (
        <LoginPage 
          onNavigateBack={() => setCurrentPage('landing')} 
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard 
          onLogout={handleLogout} 
          onNavigateToUpload={() => setCurrentPage('upload')} 
          onNavigateToGovData={() => setCurrentPage('gov-data')} 
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToNotifications={() => setCurrentPage('notifications')}
          onNavigateToReports={() => setCurrentPage('reports')}
          onNavigateToInsights={() => setCurrentPage('insights')}
          onNavigateToJanAushadhi={() => setCurrentPage('jan-aushadhi')}
          onNavigateToCghsRates={() => setCurrentPage('cghs-rates')}
          currentPage={currentPage} 
        />
      )}
      {currentPage === 'upload' && (
        <UploadPage 
          onNavigateToDashboard={() => setCurrentPage('dashboard')} 
          onNavigateToReports={() => setCurrentPage('reports')}
          onNavigateToInsights={() => setCurrentPage('insights')}
          onNavigateToGovData={() => setCurrentPage('gov-data')}
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToNotifications={() => setCurrentPage('notifications')}
          onNavigateToJanAushadhi={() => setCurrentPage('jan-aushadhi')}
          onNavigateToCghsRates={() => setCurrentPage('cghs-rates')}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
      )}
      {currentPage === 'reports' && (
        <ReportsPage 
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
          onNavigateToUpload={() => setCurrentPage('upload')}
          onNavigateToInsights={() => setCurrentPage('insights')}
          onNavigateToGovData={() => setCurrentPage('gov-data')}
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToNotifications={() => setCurrentPage('notifications')}
          onNavigateToJanAushadhi={() => setCurrentPage('jan-aushadhi')}
          onNavigateToCghsRates={() => setCurrentPage('cghs-rates')}
          currentPage={currentPage}
        />
      )}
      {currentPage === 'insights' && (
        <InsightsPage 
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
          onNavigateToUpload={() => setCurrentPage('upload')}
          onNavigateToGovData={() => setCurrentPage('gov-data')}
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToNotifications={() => setCurrentPage('notifications')}
          onNavigateToJanAushadhi={() => setCurrentPage('jan-aushadhi')}
          onNavigateToCghsRates={() => setCurrentPage('cghs-rates')}
          currentPage={currentPage}
        />
      )}
      {currentPage === 'gov-data' && (
        <GovSchemesPage 
          onLogout={handleLogout}
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
          onNavigateToUpload={() => setCurrentPage('upload')}
          onNavigateToReports={() => setCurrentPage('reports')}
          onNavigateToInsights={() => setCurrentPage('insights')}
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToNotifications={() => setCurrentPage('notifications')}
          onNavigateToJanAushadhi={() => setCurrentPage('jan-aushadhi')}
          onNavigateToCghsRates={() => setCurrentPage('cghs-rates')}
          currentPage={currentPage}
        />
      )}
      {currentPage === 'profile' && (
        <ProfilePage 
          onLogout={handleLogout}
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
          onNavigateToUpload={() => setCurrentPage('upload')}
          onNavigateToReports={() => setCurrentPage('reports')}
          onNavigateToInsights={() => setCurrentPage('insights')}
          onNavigateToGovData={() => setCurrentPage('gov-data')}
          onNavigateToNotifications={() => setCurrentPage('notifications')}
          onNavigateToJanAushadhi={() => setCurrentPage('jan-aushadhi')}
          onNavigateToCghsRates={() => setCurrentPage('cghs-rates')}
          currentPage={currentPage}
        />
      )}
      {currentPage === 'notifications' && (
        <NotificationsPage 
          onLogout={handleLogout}
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
          onNavigateToUpload={() => setCurrentPage('upload')}
          onNavigateToReports={() => setCurrentPage('reports')}
          onNavigateToInsights={() => setCurrentPage('insights')}
          onNavigateToGovData={() => setCurrentPage('gov-data')}
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToJanAushadhi={() => setCurrentPage('jan-aushadhi')}
          onNavigateToCghsRates={() => setCurrentPage('cghs-rates')}
          currentPage={currentPage}
        />
      )}
      {currentPage === 'jan-aushadhi' && (
        <JanAushadhiMap 
          onLogout={handleLogout}
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
          onNavigateToUpload={() => setCurrentPage('upload')}
          onNavigateToReports={() => setCurrentPage('reports')}
          onNavigateToInsights={() => setCurrentPage('insights')}
          onNavigateToGovData={() => setCurrentPage('gov-data')}
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToNotifications={() => setCurrentPage('notifications')}
          onNavigateToCghsRates={() => setCurrentPage('cghs-rates')}
          currentPage={currentPage}
        />
      )}
      {currentPage === 'cghs-rates' && (
        <CghsRatesPage 
          onLogout={handleLogout}
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
          onNavigateToUpload={() => setCurrentPage('upload')}
          onNavigateToReports={() => setCurrentPage('reports')}
          onNavigateToInsights={() => setCurrentPage('insights')}
          onNavigateToGovData={() => setCurrentPage('gov-data')}
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToNotifications={() => setCurrentPage('notifications')}
          onNavigateToJanAushadhi={() => setCurrentPage('jan-aushadhi')}
          currentPage={currentPage}
        />
      )}
    </div>
  );
}

export default App;
