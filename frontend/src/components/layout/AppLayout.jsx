import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import NetworkBackground from './NetworkBackground';
import { NAVIGATION_TABS } from '../../utils/constants';

export default function AppLayout({
  children,
  currentTab,
  onSelectTab,
  onOpenAddTransaction
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeTabMeta = NAVIGATION_TABS.find((t) => t.id === currentTab);
  const activeTabName = activeTabMeta ? activeTabMeta.label : 'Dashboard';

  return (
    <div className="min-h-screen bg-[#050509] text-white flex relative overflow-x-hidden">
      {/* Background canvas from Reference Video 1 */}
      <NetworkBackground nodeCount={45} interactive={false} />

      {/* Flowing Pink-Purple Gradient Waves from Reference Image 2 */}
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-[#FF1493]/15 via-[#D900A8]/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-[#7800B8]/15 via-[#35004F]/20 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={onSelectTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 relative z-10 min-w-0">
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddTransaction={onOpenAddTransaction}
          activeTabName={activeTabName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
