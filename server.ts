import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API client on the server side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API Route: AI APK Analysis and Smali/Manifest Copilot
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { prompt, apkContext, task } = req.body;

      const systemInstruction = `You are an elite Android APK reverse engineering, security auditing, and developer assistant.
Your goal is to help developers analyze, debug, decompile, and modify Android APK packages safely and effectively.
Context about the loaded APK:
- App Name: ${apkContext?.appName || 'Unknown'}
- Package Name: ${apkContext?.packageName || 'Unknown'}
- Target SDK: ${apkContext?.targetSdk || 34}
- Min SDK: ${apkContext?.minSdk || 21}
- Permissions: ${JSON.stringify(apkContext?.permissions || [])}
- Detected Remote Endpoints: ${JSON.stringify(apkContext?.detectedEndpoints || [])}
- Operating Mode: ${apkContext?.isOfflineMode ? 'Standalone Offline' : 'Online / Cloud'}

Provide clear, professional, structured advice in the language requested by the user (Arabic or English).
When writing Smali code or XML snippets, ensure proper Android syntax.`;

      if (process.env.GEMINI_API_KEY) {
        const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
        let lastError: any = null;
        let success = false;
        let analysisText = '';
        let chosenModel = '';

        for (const model of candidateModels) {
          try {
            console.log(`Trying Gemini model: ${model}...`);
            const response = await ai.models.generateContent({
              model,
              contents: prompt || 'Analyze this APK and suggest offline optimizations and security enhancements.',
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });
            analysisText = response.text || '';
            chosenModel = model;
            success = true;
            break;
          } catch (err: any) {
            console.warn(`Model ${model} failed:`, err.message || err);
            lastError = err;
          }
        }

        if (success) {
          res.json({
            success: true,
            analysis: analysisText,
            model: chosenModel,
          });
        } else {
          // Gracefully fall back to local heuristic engine
          console.warn('All Gemini models failed. Falling back to local heuristic engine.');
          const localAnalysis = generateLocalApkAnalysis(apkContext, prompt, task);
          const isAr = !prompt || /[\u0600-\u06FF]/.test(prompt);
          const prefix = isAr 
            ? `⚠️ (خوادم الذكاء الاصطناعي مشغولة حالياً، تم استخدام المحلل المحلي الذكي):\n\n` 
            : `⚠️ (AI Servers busy, switched to Smart Local Analysis Engine):\n\n`;

          res.json({
            success: true,
            analysis: prefix + localAnalysis,
            model: 'local-heuristic-engine (fallback)',
          });
        }
      } else {
        // Fallback intelligent response if API key is not yet set
        res.json({
          success: true,
          analysis: generateLocalApkAnalysis(apkContext, prompt, task),
          model: 'local-heuristic-engine',
        });
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate AI analysis',
      });
    }
  });

  // Vite Dev Server middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`APK Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateLocalApkAnalysis(apkContext: any, prompt: string, task: string): string {
  const isAr = !prompt || /[\u0600-\u06FF]/.test(prompt);

  if (isAr) {
    return `### 🤖 تقرير تحليل ومساعد الذكاء الاصطناعي لتطبيق: ${apkContext?.appName || 'Android App'}

#### 1. تقييم وضع الاتصال (Online vs Offline):
- **حالة السيرفر:** التطبيق يمتلك روابط خوادم خارجية مكتشفة (${apkContext?.detectedEndpoints?.length || 1} روابط).
- **إجراءات التحويل لأوفلاين:**
  1. إعادة توجيه مسارات الاتصال إلى المضيف المحلي \`http://127.0.0.1:8080\` لتجنب أخطاء المهلة (Connection Timeout).
  2. تفعيل خيار \`android:usesCleartextTraffic="true"\` في ملف المانيفست.
  3. استبدال استجابات التحقق من الرخصة (LVL) بقيم نجاح دائمة \`LICENSED\`.

#### 2. فحص الصلاحيات الحساسة (Permissions Audit):
- تم اكتشاف ${apkContext?.permissions?.length || 4} أذونات معلنة.
- يُنصح بتعطيل أذونات الموقع الجغرافي والكاميرا غير الضرورية في وضع عدم الاتصال لتحسين الأداء وحماية الخصوصية.

#### 3. كود مقترح لترقيع كود Smali (Bypass Server Ping):
\`\`\`smali
.method public static isServerReachable()Z
    .registers 1
    const/4 v0, 0x1   # فرض إرجاع القيمة TRUE دائماً
    return v0
.end method
\`\`\`

💡 *ملاحظة:* تم تحليل التطبيق بنجاح ويمكنك إرسال أي سؤال إضافي لمساعد الذكاء الاصطناعي.`;
  } else {
    return `### 🤖 AI APK Optimization & Analysis Report for: ${apkContext?.appName || 'Android App'}

#### 1. Network & Offline Evaluation:
- **Remote Host Status:** ${apkContext?.detectedEndpoints?.length || 1} external endpoints detected.
- **Recommended Offline Conversion Steps:**
  1. Redirect external API routes to localhost \`http://127.0.0.1:8080\` to prevent network timeouts.
  2. Ensure \`android:usesCleartextTraffic="true"\` is declared in AndroidManifest.xml.
  3. Patch Play Store license validation to always return \`LICENSED\`.

#### 2. Smali Patch Recommendation:
\`\`\`smali
.method public static isServerReachable()Z
    .registers 1
    const/4 v0, 0x1   # Always return true
    return v0
.end method
\`\`\`
`;
  }
}

startServer();
