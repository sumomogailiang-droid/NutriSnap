import React, { useState } from 'react';
import { Flame, Trash2, Search, Calendar, Filter, Download } from 'lucide-react';
import { useStore } from '../store/store';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { PlanLimitModal } from '../components/PlanLimitModal';
import { UpgradePrompt } from '../components/UpgradePrompt';

export function History() {
  const { user } = useAuth();
  const meals = useStore((state) => state.meals);
  const removeMeal = useStore((state) => state.removeMeal);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitType, setLimitType] = useState<'history' | 'export'>('history');
  const { subscription } = useSubscription(user?.id);

  const planLimits = subscription ? { historyDays: subscription.plan_id === 'free' ? 7 : subscription.plan_id === 'premium' ? 30 : -1 } : { historyDays: 7 };

  const filterMealsByPlan = (meals: typeof meals) => {
    if (planLimits.historyDays === -1) return meals;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - planLimits.historyDays);
    return meals.filter(meal => new Date(meal.timestamp) >= cutoffDate);
  };

  const filteredByPlan = filterMealsByPlan(meals);

  const groupedMeals = filteredByPlan.reduce((groups, meal) => {
    const date = new Date(meal.timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(meal);
    return groups;
  }, {} as Record<string, typeof meals>);

  const filteredMeals = Object.entries(groupedMeals).filter(([date, meals]) => {
    if (selectedDate !== 'all' && date !== selectedDate) return false;
    if (searchQuery) {
      return meals.some((meal) => meal.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  const dates = Object.keys(groupedMeals);
  const totalCalories = filteredByPlan.reduce((sum, meal) => sum + meal.calories, 0);
  const avgCalories = filteredByPlan.length > 0 ? Math.round(totalCalories / filteredByPlan.length) : 0;

  const handleExport = () => {
    if (subscription?.plan_id === 'free') {
      setLimitType('export');
      setShowLimitModal(true);
      return;
    }
    const csv = ['日時,食事名,カロリー,タンパク質,炭水化物,脂質'].concat(
      filteredByPlan.map(m => `${m.timestamp},${m.name},${m.calories},${m.protein}g,${m.carbs}g,${m.fat}g`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meal_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = (id: string, mealName: string) => {
    if (window.confirm(`「${mealName}」を削除しますか？`)) {
      removeMeal(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">食事履歴</h2>
        <p className="text-gray-600">過去の食事記録を確認・管理できます</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">総記録数</p>
              <p className="text-3xl font-bold text-gray-900">{filteredByPlan.length}</p>
              {planLimits.historyDays !== -1 && (
                <p className="text-xs text-gray-500 mt-1">過去{planLimits.historyDays}日間</p>
              )}
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Flame className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">平均カロリー</p>
              <p className="text-3xl font-bold text-gray-900">{avgCalories}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {subscription?.plan_id === 'free' && filteredByPlan.length > 0 && (
        <UpgradePrompt
          variant="banner"
          message="もっと長期間の履歴を見る"
          feature="Premiumプランで30日間以上の履歴保存・データエクスポート"
        />
      )}

      <Card className="mb-6 animate-slideUp">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="食事名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">すべての日付</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            エクスポート
          </Button>
        </div>
      </Card>

      {filteredMeals.length > 0 ? (
        <div className="space-y-6">
          {filteredMeals.map(([date, dateMeals]) => (
            <div key={date} className="animate-slideUp">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
                <span className="text-sm text-gray-500 ml-2">
                  ({dateMeals.reduce((sum, m) => sum + m.calories, 0)} kcal)
                </span>
              </div>

              <div className="space-y-3">
                {dateMeals.map((meal) => (
                  <Card key={meal.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">{formatTime(meal.timestamp)}</p>
                            <h4 className="font-semibold text-gray-900 mt-1 truncate">{meal.name}</h4>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-600 flex-shrink-0">
                            <Flame className="w-4 h-4" />
                            <span className="font-bold">{meal.calories}</span>
                            <span className="text-xs">kcal</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-4 text-xs text-gray-600">
                            <span>P: {meal.protein}g</span>
                            <span>F: {meal.fat}g</span>
                            <span>C: {meal.carbs}g</span>
                          </div>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(meal.id, meal.name)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            削除
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || selectedDate !== 'all' ? '該当する食事が見つかりません' : '食事記録がありません'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedDate !== 'all'
                ? '検索条件を変更してみてください'
                : 'メニューを撮影して記録を始めましょう'}
            </p>
          </div>
        </Card>
      )}

      <PlanLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType={limitType}
      />
    </div>
  );
}
