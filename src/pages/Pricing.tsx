import React, { useState } from 'react';
import { Check, X, Crown, Sparkles, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

export function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      monthlyPrice: 0,
      yearlyPrice: 0,
      color: 'gray',
      description: '基本機能で始める',
      features: [
        { text: '1日3回までの食事分析', included: true },
        { text: '7日間の履歴閲覧', included: true },
        { text: '基本的な統計情報', included: true },
        { text: '広告表示', included: true },
        { text: '無制限の食事分析', included: false },
        { text: 'AI栄養士チャット', included: false },
        { text: 'レシピ自動生成', included: false },
        { text: '家族アカウント', included: false },
      ],
      badge: null,
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: Crown,
      monthlyPrice: 480,
      yearlyPrice: 4800,
      color: 'emerald',
      description: '本格的な健康管理',
      features: [
        { text: '無制限の食事分析', included: true },
        { text: '30日間の履歴保存', included: true },
        { text: '詳細な栄養素分析', included: true },
        { text: '週次レポート（PDF）', included: true },
        { text: 'バーコードスキャン', included: true },
        { text: 'カスタム目標設定', included: true },
        { text: '広告非表示', included: true },
        { text: 'CSVエクスポート', included: true },
      ],
      badge: '人気No.1',
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Sparkles,
      monthlyPrice: 980,
      yearlyPrice: 9800,
      color: 'purple',
      description: 'プロフェッショナル向け',
      features: [
        { text: 'Premium全機能', included: true },
        { text: '無制限の履歴保存', included: true },
        { text: 'AI栄養士チャット24時間', included: true },
        { text: '月次詳細分析レポート', included: true },
        { text: 'レシピ自動生成', included: true },
        { text: 'Apple Health/Google Fit連携', included: true },
        { text: '家族アカウント（最大4人）', included: true },
        { text: '優先サポート', included: true },
      ],
      badge: 'おすすめ',
    },
    {
      id: 'family',
      name: 'Family',
      icon: Users,
      monthlyPrice: 1480,
      yearlyPrice: 14800,
      color: 'blue',
      description: '家族全員で健康管理',
      features: [
        { text: 'Pro全機能 × 最大6人', included: true },
        { text: '家族間での記録共有', included: true },
        { text: '子供向け成長記録', included: true },
        { text: 'アレルギー管理機能', included: true },
        { text: '家族全体の栄養分析', included: true },
        { text: '個別目標設定', included: true },
        { text: '家族チャレンジ機能', included: true },
        { text: 'ファミリーレポート', included: true },
      ],
      badge: '最大3ヶ月お得',
    },
  ];

  const handleSubscribe = (planId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (planId === 'free') {
      navigate('/profile');
      return;
    }

    alert('Stripe連携は環境変数設定後に有効化されます。\n現在はデモモードです。');
  };

  const calculateSavings = (monthly: number, yearly: number) => {
    const yearlySavings = (monthly * 12) - yearly;
    const monthsOff = Math.round(yearlySavings / monthly);
    return monthsOff > 0 ? `${monthsOff}ヶ月分お得` : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="text-center mb-12 animate-fadeIn">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          あなたに合った<span className="text-emerald-500">プラン</span>を選ぼう
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          7日間の無料トライアル付き。いつでもキャンセル可能。
        </p>

        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white shadow-md text-gray-900 font-medium'
                : 'text-gray-600'
            }`}
          >
            月額
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md transition-all ${
              billingCycle === 'yearly'
                ? 'bg-white shadow-md text-gray-900 font-medium'
                : 'text-gray-600'
            }`}
          >
            年額
            <span className="ml-2 text-xs text-emerald-500 font-semibold">
              最大2ヶ月分お得
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);
          const savings = calculateSavings(plan.monthlyPrice, plan.yearlyPrice);

          return (
            <Card
              key={plan.id}
              className="relative transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 bg-${plan.color}-500 text-white px-3 py-1 rounded-full text-xs font-bold`}>
                  {plan.badge}
                </div>
              )}

              <div className="text-center mb-6 pt-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-${plan.color}-100 rounded-full mb-4`}>
                  <Icon className={`w-6 h-6 text-${plan.color}-500`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">¥{price.toLocaleString()}</span>
                  <span className="text-gray-600 ml-1">/月</span>
                </div>
                {billingCycle === 'yearly' && savings && (
                  <p className="text-sm text-emerald-500 font-medium mt-1">{savings}</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                fullWidth
                variant={plan.id === 'premium' ? 'primary' : 'outline'}
                onClick={() => handleSubscribe(plan.id)}
                className={`font-semibold ${
                  plan.id === 'premium' ? 'shadow-lg hover:shadow-xl' : ''
                }`}
              >
                {plan.id === 'free' ? '現在のプラン' : '今すぐ始める'}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 mb-8 animate-slideUp">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Fitness プラン
              </h2>
              <p className="text-gray-600">トレーニング愛好者のための特別プラン</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-3xl font-bold text-gray-900">¥680</span>
              <span className="text-gray-600">/月</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                'Premium全機能',
                'プロテイン・サプリ管理',
                '筋トレメニュー別カロリー計算',
                '増量期・減量期モード',
                'トレーナー共有機能',
                '運動消費カロリー自動計算',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-orange-500 mt-0.5" />
                  <span className="text-sm text-gray-900">{feature}</span>
                </div>
              ))}
            </div>

            <Button fullWidth className="bg-orange-500 hover:bg-orange-600" onClick={() => handleSubscribe('fitness')}>
              Fitnessプランを始める
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          よくある質問
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              q: '無料トライアルはありますか？',
              a: 'はい、すべての有料プランで7日間の無料トライアルをご利用いただけます。期間中はいつでもキャンセル可能です。',
            },
            {
              q: 'プランの変更はできますか？',
              a: 'いつでもアップグレード・ダウングレードが可能です。日割り計算で差額を調整いたします。',
            },
            {
              q: '解約時のデータはどうなりますか？',
              a: '解約後30日間はデータを保持します。再登録時に復元可能です。',
            },
            {
              q: '支払い方法は？',
              a: 'クレジットカード、デビットカード、Apple Pay、Google Payに対応しています。',
            },
          ].map((faq, idx) => (
            <Card key={idx}>
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center py-8 border-t border-gray-200">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {['SSL暗号化通信', 'PCI DSS準拠', '30日返金保証', '10万人以上が利用'].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-5 h-5 text-emerald-500" />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
