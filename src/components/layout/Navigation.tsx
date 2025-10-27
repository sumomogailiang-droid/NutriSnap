import React from 'react';
import { Home, BarChart3, History, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'ホーム', path: '/' },
    { icon: BarChart3, label: '統計', path: '/stats' },
    { icon: History, label: '履歴', path: '/history' },
    { icon: User, label: '設定', path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full group"
              aria-label={item.label}
            >
              <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className={`text-xs mt-1 transition-colors ${isActive ? 'text-emerald-500 font-medium' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
