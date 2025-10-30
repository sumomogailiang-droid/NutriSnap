import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, X, Zap, TrendingUp } from 'lucide-react';
import { Card } from './common/Card';
import { Button } from './common/Button';

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'daily_scans' | 'history' | 'export' | 'ai_chat';
  remainingScans?: number;
}

export function PlanLimitModal({ isOpen, onClose, limitType, remainingScans = 0 }: PlanLimitModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const content = {
    daily_scans: {
      title: '本日の分析回数に達しました',
      description: '無料プランは1日3回までの食事分析が可能です。明日になるとリセットされます。',
      icon: Zap,
      benefits: [
        '無制限の食事分析',
        '30日間の履歴保存',
        '詳細な栄養素分析',
        '広告非表示',
      ],
    },
    history: {
      title: '履歴の閲覧期間を超えています',
      description: '無料プランでは過去7日間の履歴のみ閲覧できます。',
      icon: TrendingUp,
      benefits: [
        '30日間以上の履歴保存',
        '無制限の食事分析',
        'データエクスポート',
        '詳細レポート',
      ],
    },
    export: {
      title: 'データエクスポートは有料プラン限定です',
      description: 'データをCSVでエクスポートするにはPremiumプラン以上が必要です。',
      icon: Crown,
      benefits: [
        'CSVエクスポート機能',
        '無制限の食事分析',
        '詳細な統計情報',
        'カスタムレポート',
      ],
    },
    ai_chat: {
      title: 'AI栄養士チャットは有料プラン限定です',
      description: 'AI栄養士に相談するにはProプラン以上が必要です。',
      icon: Crown,
      benefits: [
        'AI栄養士24時間サポート',
        '無制限の食事分析',
        'レシピ自動生成',
        '優先サポート',
      ],
    },
  };

  const { title, description, icon: Icon, benefits } = content[limitType];

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <Card className="max-w-lg w-full animate-slideUp">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Icon className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              {limitType === 'daily_scans' && remainingScans > 0 && (
                <p className="text-sm text-gray-600 mt-1">残り{remainingScans}回</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">{description}</p>

        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900">Premiumプランで解放</h3>
          </div>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            fullWidth
            variant="primary"
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          >
            <Crown className="w-5 h-5 mr-2" />
            Premiumにアップグレード
          </Button>
          <Button fullWidth variant="outline" onClick={onClose}>
            後で
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          7日間の無料トライアル付き・いつでもキャンセル可能
        </p>
      </Card>
    </div>
  );
}
