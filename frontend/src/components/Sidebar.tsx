import React from 'react';
import type { NavItem, Page } from '../types'; // Assuming types.ts exists and defines NavItem and Page
// Removed unused LucideIcon import

interface SidebarProps {
  navItems: NavItem[];
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, currentPage, navigateTo }) => {
  return (
    // Keeping the dark theme for sidebar for contrast, minor padding adjustments
    <aside className="w-64 bg-slate-900 text-slate-200 p-5 space-y-3 flex flex-col shadow-lg">
      <div className="text-3xl font-bold text-white p-3 mb-5 border-b border-slate-700 text-center">
        Mini CRM
      </div>
      <nav className="flex-grow space-y-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.page)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ease-in-out
                        ${isActive
                          ? 'bg-sky-600 text-white shadow-md scale-105' // Enhanced active state
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white focus:outline-none'
                        }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-2 text-center text-xs text-slate-500">
        Xeno CRM v0.1.0
      </div>
    </aside>
  );
};