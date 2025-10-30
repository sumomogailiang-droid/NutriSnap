import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './common/Button';

interface UpgradePromptProps {
  variant?: 'banner' | 'card' | 'inline';
  message?: string;
  feature?: string;
}

export function UpgradePrompt({ variant = 'banner', message, feature }: UpgradePromptProps) {
  const navigate = useNavigate();

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl p-4 mb-6 animate-fadeIn">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">
                {message || 'Premiumでもっと健康に'}
              </h3>
              <p className="text-sm text-white text-opacity-90">
                {feature || '無制限の分析・詳細レポート・広告なし'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/pricing')}
            className="bg-white text-emerald-600 hover:bg-gray-50 border-none flex-shrink-0"
          >
            詳しく見る
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200 animate-slideUp">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <Sparkles className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {message || 'さらに詳しい分析を見る'}
            </h3>
            <p className="text-sm text-gray-600">
              {feature || 'Premiumプランで全機能を解放してより効果的な健康管理を'}
            </p>
          </div>
        </div>
        <Button
          fullWidth
          variant="primary"
          onClick={() => navigate('/pricing')}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Crown className="w-5 h-5 mr-2" />
          プランを見る
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate('/pricing')}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-md"
    >
      <Crown className="w-4 h-4" />
      <span className="text-sm font-medium">
        {message || 'アップグレード'}
      </span>
    </button>
  );
}
