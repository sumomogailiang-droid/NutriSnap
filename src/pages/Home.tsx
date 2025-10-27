import React, { useEffect } from 'react';
import { Camera, Flame, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const meals = useStore((state) => state.meals);
  const userProfile = useStore((state) => state.userProfile);
  const getTodayCalories = useStore((state) => state.getTodayCalories);
  const loadProfile = useStore((state) => state.loadProfile);
  const loadMeals = useStore((state) => state.loadMeals);

  useEffect(() => {
    if (user) {
      loadProfile(user.id);
      loadMeals(user.id);
    }
  }, [user, loadProfile, loadMeals]);

  const todayCalories = getTodayCalories();
  const targetCalories = userProfile?.dailyCalories || 2000;
  const recentMeals = meals.slice(0, 3);
  const caloriePercentage = (todayCalories / targetCalories) * 100;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCalories = (calories: number) => calories.toLocaleString('ja-JP');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="mb-8 animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          こんにちは、{userProfile?.name || 'ゲスト'}さん
        </h2>
        <p className="text-gray-600">今日も健康的な食事を記録しましょう</p>
      </div>

      <div className="mb-8 animate-slideUp">
        <Button size="lg" fullWidth onClick={() => navigate('/camera')} className="flex items-center justify-center gap-3">
          <Camera className="w-6 h-6" />
          <span className="text-xl">メニューを撮影する</span>
        </Button>
      </div>

      <Card className="mb-8 animate-slideUp">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900">今日の摂取カロリー</h3>
          </div>
          <TrendingUp className={`w-5 h-5 ${caloriePercentage > 100 ? 'text-red-500' : 'text-emerald-500'}`} />
        </div>

        <div className="mb-4">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">{formatCalories(todayCalories)}</span>
            <span className="text-xl text-gray-500">/ {formatCalories(targetCalories)} kcal</span>
          </div>
        </div>

        <ProgressBar
          value={todayCalories}
          max={targetCalories}
          showPercentage
          color={caloriePercentage > 100 ? 'red' : 'emerald'}
          size="lg"
        />

        <div className="mt-4 text-center">
          {caloriePercentage < 80 && <p className="text-sm text-emerald-600">順調です！バランスの良い食事を心がけましょう</p>}
          {caloriePercentage >= 80 && caloriePercentage <= 100 && <p className="text-sm text-blue-600">目標に近づいています。あと少しです！</p>}
          {caloriePercentage > 100 && <p className="text-sm text-amber-600">目標を超えました。次の食事は軽めにしましょう</p>}
        </div>
      </Card>

      <div className="animate-slideUp">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">最近の食事</h3>
          <button onClick={() => navigate('/history')} className="text-emerald-500 hover:text-emerald-600 font-medium text-sm transition-colors">
            すべて見る →
          </button>
        </div>

        {recentMeals.length > 0 ? (
          <div className="space-y-4">
            {recentMeals.map((meal) => (
              <Card key={meal.id} hoverable className="flex gap-4">
                <img src={meal.imageUrl} alt={meal.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{formatTime(meal.timestamp)}</p>
                      <h3 className="font-semibold text-gray-900 mt-1">{meal.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Flame className="w-4 h-4" />
                      <span className="font-bold">{meal.calories}</span>
                      <span className="text-xs">kcal</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-600">
                    <span>P: {meal.protein}g</span>
                    <span>F: {meal.fat}g</span>
                    <span>C: {meal.carbs}g</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">まだ食事が記録されていません</p>
              <p className="text-sm text-gray-400 mt-1">メニューを撮影して記録を始めましょう</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
