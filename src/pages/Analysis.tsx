import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Flame, TrendingDown, Beef, Droplet, Wheat, ArrowRight } from 'lucide-react';
import { useStore } from '../store/store';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import type { Meal } from '../types';

export function Analysis() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentAnalysis = useStore((state) => state.currentAnalysis);
  const addMeal = useStore((state) => state.addMeal);

  if (!currentAnalysis) {
    navigate('/camera');
    return null;
  }

  const handleSaveMeal = async () => {
    if (!user) return;

    const newMeal: Omit<Meal, 'id' | 'timestamp'> = {
      name: currentAnalysis.dishName,
      calories: currentAnalysis.calories,
      protein: currentAnalysis.macros.protein,
      fat: currentAnalysis.macros.fat,
      carbs: currentAnalysis.macros.carbs,
      imageUrl: currentAnalysis.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    };
    await addMeal(newMeal, user.id);
    navigate('/');
  };

  const confidencePercentage = Math.round(currentAnalysis.confidence * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">分析結果</h2>
        <p className="text-gray-600">AIが料理を認識して栄養情報を分析しました</p>
      </div>

      <div className="space-y-6">
        {currentAnalysis.imageUrl && (
          <Card className="p-4 animate-fadeIn">
            <img
              src={currentAnalysis.imageUrl}
              alt={currentAnalysis.dishName}
              className="w-full h-auto rounded-lg max-h-[300px] object-contain"
            />
          </Card>
        )}

        <Card className="animate-slideUp">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{currentAnalysis.dishName}</h3>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-gray-600">
                  認識精度: <span className="font-semibold text-emerald-600">{confidencePercentage}%</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg">
              <Flame className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-emerald-600">{currentAnalysis.calories}</p>
                <p className="text-xs text-gray-600">kcal</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col items-center">
              <Beef className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-xs text-gray-600">タンパク質</p>
              <p className="text-xl font-bold text-gray-900">{currentAnalysis.macros.protein}g</p>
            </div>
            <div className="flex flex-col items-center">
              <Droplet className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-xs text-gray-600">脂質</p>
              <p className="text-xl font-bold text-gray-900">{currentAnalysis.macros.fat}g</p>
            </div>
            <div className="flex flex-col items-center">
              <Wheat className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-xs text-gray-600">炭水化物</p>
              <p className="text-xl font-bold text-gray-900">{currentAnalysis.macros.carbs}g</p>
            </div>
          </div>

          {currentAnalysis.macros.sodium && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">塩分</span>
                <span className="font-semibold text-gray-900">{currentAnalysis.macros.sodium}g</span>
              </div>
            </div>
          )}
        </Card>

        {currentAnalysis.alternatives.length > 0 && (
          <Card className="animate-slideUp">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">ヘルシーな代替案</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">より低カロリーな選択肢を提案します</p>

            <div className="space-y-3">
              {currentAnalysis.alternatives.map((alt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{alt.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{alt.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{alt.caloriesDiff}</p>
                      <p className="text-xs text-gray-500">kcal</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-4">
          <Button size="lg" fullWidth onClick={handleSaveMeal} className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            この食事を記録
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/camera')}>
            再撮影
          </Button>
        </div>
      </div>
    </div>
  );
}
