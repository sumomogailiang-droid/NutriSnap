import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown, Calendar, CreditCard, Download, AlertCircle,
  Check, TrendingUp, FileText, Settings
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { PLAN_NAMES, PLAN_PRICES, PLAN_LIMITS } from '../utils/planLimits';

export function Subscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, usage, loading, trialDaysRemaining, isTrialing, cancelSubscription } = useSubscription(user?.id);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">サブスクリプション情報が見つかりません</h2>
          <p className="text-gray-600 mb-6">プランを選択してください</p>
          <Button onClick={() => navigate('/pricing')}>プランを見る</Button>
        </Card>
      </div>
    );
  }

  const planLimits = PLAN_LIMITS[subscription.plan_id];
  const planName = PLAN_NAMES[subscription.plan_id];
  const planPrice = PLAN_PRICES[subscription.plan_id];
  const scansUsed = usage?.meal_scans_count || 0;
  const scansLimit = planLimits.dailyScans;
  const scansPercentage = scansLimit === -1 ? 0 : (scansUsed / scansLimit) * 100;

  const handleCancelSubscription = async () => {
    const success = await cancelSubscription();
    if (success) {
      setShowCancelModal(false);
      alert('サブスクリプションを解約しました。現在の期間終了まで引き続きご利用いただけます。');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">サブスクリプション管理</h1>
        <p className="text-gray-600">プランと使用状況を管理</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Crown className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{planName}プラン</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    subscription.status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                    subscription.status === 'past_due' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {subscription.status === 'active' && '有効'}
                    {subscription.status === 'trialing' && 'トライアル中'}
                    {subscription.status === 'past_due' && '支払い遅延'}
                    {subscription.status === 'canceled' && '解約済み'}
                  </span>
                  {subscription.cancel_at_period_end && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      解約予定
                    </span>
                  )}
                </div>
              </div>
            </div>
            {subscription.plan_id !== 'free' && (
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">¥{planPrice.monthly.toLocaleString()}</div>
                <div className="text-sm text-gray-600">/ 月</div>
              </div>
            )}
          </div>

          {isTrialing() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">無料トライアル中</p>
                  <p className="text-sm text-blue-700 mt-1">
                    残り{trialDaysRemaining()}日間、すべての機能を無料でお試しいただけます。
                  </p>
                </div>
              </div>
            </div>
          )}

          {subscription.current_period_end && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <Calendar className="w-4 h-4" />
              <span>
                次回更新日: {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
              </span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">プラン特典</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  {scansLimit === -1 ? '無制限の食事分析' : `1日${scansLimit}回の食事分析`}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  {planLimits.historyDays === -1 ? '無制限の履歴保存' : `${planLimits.historyDays}日間の履歴`}
                </span>
              </div>
              {planLimits.aiChat && (
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">AI栄養士チャット</span>
                </div>
              )}
              {planLimits.exportData && (
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">データエクスポート</span>
                </div>
              )}
              {planLimits.familyAccounts > 0 && (
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    家族アカウント（最大{planLimits.familyAccounts}人）
                  </span>
                </div>
              )}
              {!planLimits.adsEnabled && (
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">広告非表示</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="primary"
              onClick={() => navigate('/pricing')}
              className="flex-1"
            >
              プランを変更
            </Button>
            {subscription.plan_id !== 'free' && !subscription.cancel_at_period_end && (
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(true)}
                className="flex-1"
              >
                解約する
              </Button>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-gray-900">今日の使用状況</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">食事分析</span>
                  <span className="font-medium text-gray-900">
                    {scansLimit === -1 ? `${scansUsed}回` : `${scansUsed} / ${scansLimit}回`}
                  </span>
                </div>
                {scansLimit !== -1 && (
                  <ProgressBar
                    progress={scansPercentage}
                    color={scansPercentage > 80 ? 'red' : 'emerald'}
                  />
                )}
              </div>
              {scansLimit !== -1 && scansUsed >= scansLimit && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    本日の上限に達しました。明日リセットされます。
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-gray-900">お支払い情報</h3>
            </div>
            {subscription.stripe_customer_id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">支払い方法</span>
                  <span className="text-gray-900">••••  1234</span>
                </div>
                <Button variant="outline" size="sm" fullWidth>
                  <Settings className="w-4 h-4 mr-2" />
                  支払い方法を変更
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">無料プランです</p>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-gray-900">請求履歴</h3>
            </div>
            <div className="space-y-2">
              {subscription.plan_id === 'free' ? (
                <p className="text-sm text-gray-600">請求履歴はありません</p>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                    <span className="text-gray-600">2024年1月</span>
                    <span className="text-gray-900">¥{planPrice.monthly.toLocaleString()}</span>
                  </div>
                  <Button variant="outline" size="sm" fullWidth>
                    <Download className="w-4 h-4 mr-2" />
                    すべてダウンロード
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="text-center mb-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">サブスクリプションを解約しますか？</h2>
              <p className="text-gray-600">
                解約後も現在の期間終了まで引き続きご利用いただけます。
                {subscription.current_period_end && (
                  <>
                    <br />
                    期間終了日: {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
                  </>
                )}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCancelModal(false)}
              >
                キャンセル
              </Button>
              <Button
                fullWidth
                className="bg-red-500 hover:bg-red-600"
                onClick={handleCancelSubscription}
              >
                解約する
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
