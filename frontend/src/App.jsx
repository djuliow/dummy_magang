import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardPage from './pages/DashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import SensorMonitoringPage from './pages/SensorMonitoringPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AIChatPage from './pages/AIChatPage';
import UserManagementPage from './pages/UserManagementPage';

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'sensors': return <SensorMonitoringPage />;
      case 'ai_chat': return <AIChatPage />;
      case 'notifications': return <NotificationsPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      case 'user_mgmt': return <UserManagementPage />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-[#40493d]">Page "{currentPage}" is under construction</h2>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans overflow-hidden flex h-screen">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        userRole={user?.profile?.role}
      />
      <div className="md:ml-64 flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header onMenuClick={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto p-4 md:p-12 bg-[#f9f9f9]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
