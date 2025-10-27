import React from 'react';
import { TrendingUp, Target, Flame, Award } from 'lucide-react';
import { useStore } from '../store/store';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { mockWeeklyStats, mockMacroBalance } from '../utils/mockData';

export function Stats() {
  const userProfile = useStore((state) => state.userProfile);
  const meals = useStore((state) => state.meals);

  const weeklyStats = mockWeeklyStats;
  const macroBalance = mockMacroBalance;

  const maxCalories = Math.max(...weeklyStats.map((s) => s.calories));
  const avgCalories = Math.round(weeklyStats.reduce((sum, s) => sum + s.calories, 0) / weeklyStats.length);
  const totalMeals = meals.length;
  const daysTracked = new Set(meals.map((m) => new Date(m.timestamp).toDateString())).size;

  const totalMacros = macroBalance.protein + macroBalance.fat + macroBalance.carbs;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">統計</h2>
        <p className="text-gray-600">あなたの食事記録を分析します</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Flame className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">平均カロリー</p>
              <p className="text-2xl font-bold text-gray-900">{avgCalories}</p>
            </div>
          </div>
        </Card>

        <Card className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">目標カロリー</p>
              <p className="text-2xl font-bold text-gray-900">{userProfile.dailyCalories}</p>
            </div>
          </div>
        </Card>

        <Card className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">記録日数</p>
              <p className="text-2xl font-bold text-gray-900">{daysTracked}</p>
            </div>
          </div>
        </Card>

        <Card className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">総食事数</p>
              <p className="text-2xl font-bold text-gray-900">{totalMeals}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6 animate-slideUp">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">週間カロリー推移</h3>
        <div className="space-y-3">
          {weeklyStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-12">{stat.date}</span>
              <div className="flex-1">
                <div className="relative">
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg transition-all duration-500 flex items-center justify-end px-2"
                      style={{ width: `${(stat.calories / maxCalories) * 100}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{stat.calories}</span>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-500 w-16 text-right">
                {Math.round((stat.calories / userProfile.dailyCalories) * 100)}%
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <span>目標: {userProfile.dailyCalories} kcal/日</span>
          <span>平均: {avgCalories} kcal/日</span>
        </div>
      </Card>

      <Card className="animate-slideUp">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">マクロ栄養バランス</h3>
        <p className="text-sm text-gray-600 mb-6">過去7日間の平均的な栄養素の割合</p>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">タンパク質</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{macroBalance.protein}%</span>
            </div>
            <ProgressBar
              value={macroBalance.protein}
              max={totalMacros}
              color="red"
              size="md"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">脂質</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{macroBalance.fat}%</span>
            </div>
            <ProgressBar
              value={macroBalance.fat}
              max={totalMacros}
              color="amber"
              size="md"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">炭水化物</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{macroBalance.carbs}%</span>
            </div>
            <ProgressBar
              value={macroBalance.carbs}
              max={totalMacros}
              color="blue"
              size="md"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">推奨バランス:</span> タンパク質 20-35% / 脂質 20-30% / 炭水化物 45-65%
          </p>
        </div>
      </Card>
    </div>
  );
}
