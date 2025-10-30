import React, { useState, useEffect } from 'react';
import { User, Save, Activity, Target, Ruler, Weight, Crown, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useSubscription } from '../hooks/useSubscription';
import { PLAN_NAMES } from '../utils/planLimits';

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userProfile = useStore((state) => state.userProfile);
  const updateProfile = useStore((state) => state.updateProfile);
  const loadProfile = useStore((state) => state.loadProfile);
  const { subscription, isTrialing, trialDaysRemaining } = useSubscription(user?.id);

  const [formData, setFormData] = useState(userProfile || {
    name: '',
    email: '',
    gender: 'male' as const,
    age: 30,
    height: 170,
    weight: 70,
    activityLevel: 'medium' as const,
    goal: 'maintain' as const,
    bmr: 1500,
    dailyCalories: 2000,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile(user.id);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' ? Number(value) : value,
    }));
  };

  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <p className="text-center text-gray-600">プロフィールを読み込んでいます...</p>
      </div>
    );
  }

  const calculateBMR = () => {
    const { gender, age, height, weight } = formData;
    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  };

  const calculateDailyCalories = () => {
    const bmr = calculateBMR();
    const activityMultipliers = {
      low: 1.2,
      medium: 1.55,
      high: 1.9,
    };
    const goalAdjustments = {
      lose: -500,
      maintain: 0,
      gain: 500,
    };
    return Math.round(bmr * activityMultipliers[formData.activityLevel] + goalAdjustments[formData.goal]);
  };

  const handleSave = async () => {
    if (!user) return;

    const bmr = calculateBMR();
    const dailyCalories = calculateDailyCalories();
    await updateProfile({ ...formData, bmr, dailyCalories }, user.id);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(userProfile);
    setIsEditing(false);
  };

  const bmi = (formData.weight / ((formData.height / 100) ** 2)).toFixed(1);
  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: '低体重', color: 'text-blue-600' };
    if (bmi < 25) return { text: '標準', color: 'text-emerald-600' };
    if (bmi < 30) return { text: '肥満(1度)', color: 'text-amber-600' };
    return { text: '肥満(2度以上)', color: 'text-red-600' };
  };

  const bmiStatus = getBMIStatus(Number(bmi));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">プロフィール設定</h2>
        <p className="text-gray-600">あなたの情報を管理して、より正確な目標を設定できます</p>
      </div>

      {subscription && (
        <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Crown className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {PLAN_NAMES[subscription.plan_id]}プラン
                </h3>
                <p className="text-sm text-gray-600">
                  {subscription.status === 'active' && '有効'}
                  {isTrialing() && `トライアル残り${trialDaysRemaining()}日`}
                  {subscription.status === 'canceled' && '解約済み'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {subscription.plan_id === 'free' && (
                <Button
                  size="sm"
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  アップグレード
                </Button>
              )}
              {subscription.plan_id !== 'free' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/subscription')}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  管理
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-6 animate-slideUp">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-emerald-100 p-4 rounded-full">
            <User className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{userProfile.name}</h3>
            <p className="text-gray-600">{userProfile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">BMI</p>
            <p className="text-2xl font-bold text-gray-900">{bmi}</p>
            <p className={`text-xs font-semibold ${bmiStatus.color}`}>{bmiStatus.text}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">基礎代謝</p>
            <p className="text-2xl font-bold text-gray-900">{userProfile.bmr}</p>
            <p className="text-xs text-gray-600">kcal/日</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">目標カロリー</p>
            <p className="text-2xl font-bold text-gray-900">{userProfile.dailyCalories}</p>
            <p className="text-xs text-gray-600">kcal/日</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">目標</p>
            <p className="text-lg font-bold text-gray-900">
              {userProfile.goal === 'lose' && '減量'}
              {userProfile.goal === 'maintain' && '維持'}
              {userProfile.goal === 'gain' && '増量'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">基本情報</h3>
          {!isEditing && (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              編集
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                年齢
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                身長 (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Weight className="w-4 h-4" />
                体重 (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                活動レベル
              </label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="low">低い（デスクワーク）</option>
                <option value="medium">普通（軽い運動）</option>
                <option value="high">高い（激しい運動）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                目標
              </label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="lose">減量</option>
                <option value="maintain">維持</option>
                <option value="gain">増量</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <Button size="lg" onClick={handleSave} className="flex-1 flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                保存
              </Button>
              <Button size="lg" variant="outline" onClick={handleCancel} className="flex-1">
                キャンセル
              </Button>
            </div>
          )}
        </div>
      </Card>

      {isEditing && (
        <Card className="mt-6 bg-blue-50 border-2 border-blue-200 animate-fadeIn">
          <h4 className="font-semibold text-blue-900 mb-2">変更プレビュー</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">基礎代謝</p>
              <p className="text-xl font-bold text-blue-900">{calculateBMR()} kcal/日</p>
            </div>
            <div>
              <p className="text-blue-700">目標カロリー</p>
              <p className="text-xl font-bold text-blue-900">{calculateDailyCalories()} kcal/日</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
