import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar.tsx';
import { PublicFooter } from './PublicFooter.tsx';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#24231F] selection:bg-[#315B3B]/15 selection:text-[#315B3B]">
      {/* Public Navigation Header */}
      <PublicNavbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
};

