import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ErrorBoundary from './ErrorBoundary';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row text-on-surface">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Mobile Top Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
