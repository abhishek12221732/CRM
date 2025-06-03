import React from 'react';
import { Icon as LucideIcon } from 'lucide-react';
import type { NavItem, Page } from '../types'; 
// Define the structure for a navigation item


interface SidebarProps {
  navItems: NavItem[];
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, currentPage, navigateTo }) => {
  return (
    <aside className="w-64 bg-slate-800 text-slate-100 p-4 space-y-2 flex flex-col">
      <div className="text-2xl font-bold text-white p-3 mb-6 border-b border-slate-700">
        Mini CRM
      </div>
      <nav className="flex-grow">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.page)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition-colors
                        ${currentPage === item.page ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              <IconComponent className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-2 text-center text-xs text-slate-400">
        Xeno CRM v0.1.0
      </div>
    </aside>
  );
};