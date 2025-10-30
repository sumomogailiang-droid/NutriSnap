import React from 'react';
import { Camera, LogOut, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';

export function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription(user?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nutri<span className="text-emerald-500">Snap</span>
            </h1>
            {subscription && subscription.plan_id !== 'free' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full text-xs font-semibold">
                <Crown className="w-3 h-3" />
                {subscription.plan_id.toUpperCase()}
              </div>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/pricing')} className="text-gray-600 hover:text-emerald-500 font-medium transition-colors">
              プラン
            </button>
            <button onClick={() => navigate('/')} className="text-gray-600 hover:text-emerald-500 font-medium transition-colors">
              ホーム
            </button>
            <button onClick={() => navigate('/stats')} className="text-gray-600 hover:text-emerald-500 font-medium transition-colors">
              統計
            </button>
            <button onClick={() => navigate('/history')} className="text-gray-600 hover:text-emerald-500 font-medium transition-colors">
              履歴
            </button>
            <button onClick={() => navigate('/profile')} className="text-gray-600 hover:text-emerald-500 font-medium transition-colors">
              設定
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
