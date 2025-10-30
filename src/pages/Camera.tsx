import React, { useState } from 'react';
import { Camera as CameraIcon, Upload, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useStore } from '../store/store';
import { useAuth } from '../contexts/AuthContext';
import { uploadMealImage, resizeImage } from '../utils/imageUpload';
import { supabase } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';
import { PlanLimitModal } from '../components/PlanLimitModal';

export function Camera() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const setCurrentAnalysis = useStore((state) => state.setCurrentAnalysis);
  const addToast = useStore((state) => state.addToast);
  const { canScan, incrementScanCount, remainingScans } = useSubscription(user?.id);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) return;

    if (!canScan()) {
      setShowLimitModal(true);
      return;
    }

    const scanSuccess = await incrementScanCount();
    if (!scanSuccess) {
      setShowLimitModal(true);
      return;
    }

    setIsUploading(true);

    try {
      const resizedFile = await resizeImage(selectedFile);
      const imageUrl = await uploadMealImage(resizedFile, user.id);

      if (!imageUrl) {
        addToast('画像のアップロードに失敗しました', 'error');
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
      setIsAnalyzing(true);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-meal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ imageUrl }),
        }
      );

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setIsAnalyzing(false);
      setCurrentAnalysis({ ...result, imageUrl });
      navigate('/analysis');
    } catch (error) {
      console.error('Error:', error);
      addToast('分析に失敗しました', 'error');
      setIsAnalyzing(false);
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">メニューを撮影</h2>
        <p className="text-gray-600">料理の写真をアップロードして栄養分析を行います</p>
      </div>

      {!selectedImage ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-emerald-100 p-6 rounded-full mb-6">
              <CameraIcon className="w-16 h-16 text-emerald-500" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">写真を選択してください</h3>
            <p className="text-gray-500 text-center mb-8 max-w-md">
              カメラで撮影するか、ギャラリーから料理の写真を選んでください
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button size="lg" fullWidth className="cursor-pointer flex items-center justify-center gap-2">
                  <CameraIcon className="w-5 h-5" />
                  カメラで撮影
                </Button>
              </label>

              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button size="lg" fullWidth variant="outline" className="cursor-pointer flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" />
                  ギャラリーから選択
                </Button>
              </label>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected food"
                className="w-full h-auto rounded-lg max-h-[500px] object-contain"
              />
              <button
                onClick={handleCancel}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="キャンセル"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              size="lg"
              fullWidth
              onClick={handleAnalyze}
              disabled={isAnalyzing || isUploading}
              className="flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  アップロード中...
                </>
              ) : isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  分析中...
                </>
              ) : (
                '栄養分析を開始'
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleCancel}
              disabled={isAnalyzing || isUploading}
            >
              キャンセル
            </Button>
          </div>

          {isUploading && (
            <Card className="bg-amber-50 border-2 border-amber-200">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                <div>
                  <p className="font-medium text-amber-900">画像をアップロード中</p>
                  <p className="text-sm text-amber-700">画像を最適化しています...</p>
                </div>
              </div>
            </Card>
          )}

          {isAnalyzing && (
            <Card className="bg-blue-50 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <div>
                  <p className="font-medium text-blue-900">AI分析中</p>
                  <p className="text-sm text-blue-700">料理を認識してカロリーを計算しています...</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <PlanLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType="daily_scans"
        remainingScans={remainingScans()}
      />
    </div>
  );
}
