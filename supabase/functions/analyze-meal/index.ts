import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisResult {
  dishName: string;
  calories: number;
  macros: {
    protein: number;
    fat: number;
    carbs: number;
    sodium?: number;
  };
  confidence: number;
  alternatives: Array<{
    name: string;
    caloriesDiff: number;
    reason: string;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const mockResults: AnalysisResult[] = [
      {
        dishName: "ハンバーガーセット",
        calories: 850,
        macros: { protein: 32, fat: 42, carbs: 78, sodium: 2.1 },
        confidence: 0.92,
        alternatives: [
          { name: "グリルチキンサラダ", caloriesDiff: -450, reason: "高タンパク・低脂質でヘルシー" },
          { name: "照り焼きチキンバーガー", caloriesDiff: -200, reason: "カロリー30%オフ" },
        ],
      },
      {
        dishName: "親子丼",
        calories: 620,
        macros: { protein: 28, fat: 18, carbs: 85, sodium: 1.8 },
        confidence: 0.95,
        alternatives: [
          { name: "そば", caloriesDiff: -280, reason: "低カロリーで消化に良い" },
          { name: "親子丼（小盛り）", caloriesDiff: -180, reason: "ご飯の量を減らしてカロリーダウン" },
        ],
      },
      {
        dishName: "カルボナーラ",
        calories: 780,
        macros: { protein: 24, fat: 38, carbs: 82, sodium: 2.3 },
        confidence: 0.88,
        alternatives: [
          { name: "ペペロンチーノ", caloriesDiff: -320, reason: "オイルベースでシンプル" },
          { name: "トマトパスタ", caloriesDiff: -280, reason: "クリーム不使用でヘルシー" },
        ],
      },
      {
        dishName: "ラーメン",
        calories: 720,
        macros: { protein: 26, fat: 32, carbs: 78, sodium: 3.2 },
        confidence: 0.90,
        alternatives: [
          { name: "つけ麺（野菜増し）", caloriesDiff: -150, reason: "スープを残せばカロリーオフ" },
          { name: "塩ラーメン", caloriesDiff: -180, reason: "脂質控えめ" },
        ],
      },
      {
        dishName: "寿司盛り合わせ",
        calories: 480,
        macros: { protein: 42, fat: 8, carbs: 68, sodium: 2.0 },
        confidence: 0.93,
        alternatives: [
          { name: "刺身定食", caloriesDiff: -120, reason: "ご飯の量を調整可能" },
          { name: "手巻き寿司", caloriesDiff: -80, reason: "自分で量を調整できる" },
        ],
      },
    ];

    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return new Response(
      JSON.stringify(randomResult),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-meal function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});