import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  generateKnowledgeGroundedResponse,
  isQuestionOffTopic,
  buildOffTopicResponse,
  LessonKnowledgeContext,
} from './src/services/robotAIEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
  }
}

// API endpoint for Robot Tin Học chat
app.post('/api/robot-tinhoc', async (req, res) => {
  try {
    const {
      message,
      lessonTitle,
      grade,
      topic,
      keyTakeaways,
      objectives,
      knowledgeCards,
      mode,
      history,
      customApiKey,
    } = req.body;

    const currentGrade = Number(grade) || 3;
    const currentLesson = lessonTitle || 'Tin học Tiểu học';
    const currentTopic = topic || 'Máy tính và em';
    const points: string[] = Array.isArray(keyTakeaways) ? keyTakeaways : [];
    const objList: string[] = Array.isArray(objectives) ? objectives : [];
    const cardList = Array.isArray(knowledgeCards) ? knowledgeCards : [];

    const lessonContext: LessonKnowledgeContext = {
      lessonTitle: currentLesson,
      grade: currentGrade,
      topicName: currentTopic,
      objectives: objList,
      knowledgeCards: cardList,
      keyTakeaways: points,
      mode: mode || 'chat',
    };

    const userMessage = (message || '').trim();

    // 1. STRICT OFF-TOPIC CHECK:
    // If the question is outside the scope of the lesson, robot must state:
    // "Nội dung này nằm ngoài bài học, tôi không hỗ trợ bạn được."
    if (isQuestionOffTopic(userMessage, lessonContext)) {
      return res.json({
        reply: buildOffTopicResponse(currentLesson),
        source: 'knowledge_engine_relevance',
        success: true,
      });
    }

    const effectiveApiKey =
      customApiKey ||
      (req.headers['x-gemini-key'] as string) ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    let activeAi = ai;
    if ((customApiKey || req.headers['x-gemini-key']) && effectiveApiKey) {
      try {
        activeAi = new GoogleGenAI({
          apiKey: effectiveApiKey,
          httpOptions: {
            headers: { 'User-Agent': 'aistudio-build' },
          },
        });
      } catch (e) {
        console.warn('Failed to init custom Gemini key:', e);
      }
    }

    // If Gemini client is not initialized, use knowledge-grounded engine directly
    if (!activeAi) {
      const smartReply = generateKnowledgeGroundedResponse(userMessage, lessonContext);
      return res.json({
        reply: smartReply,
        source: 'knowledge_engine',
        success: true,
      });
    }

    // Compile full theory text from objectives & cards for Gemini system instruction
    const objectivesText = objList.length > 0
      ? objList.map((o: string, i: number) => `  ${i + 1}. ${o}`).join('\n')
      : 'Nắm vững kiến thức trọng tâm của bài học và thực hành an toàn.';

    const cardsTheoryText = cardList.length > 0
      ? cardList
          .map(
            (c: any, i: number) => `
[MỤC ${i + 1} KIẾN THỨC TRỌNG TÂM]: ${c.title}
- Tóm tắt: ${c.summary || ''}
- Chi tiết lý thuyết: ${c.details || ''}
${c.keyMemory ? `- Ghi nhớ cốt lõi: ${c.keyMemory}` : ''}
`
          )
          .join('\n')
      : points.map((p: string, i: number) => `  ${i + 1}. ${p}`).join('\n');

    const systemInstruction = `
Bạn là "ROBOT TIN HỌC" - trợ lý ảo học tập thông minh, vui tươi, thân thiện dành cho học sinh tiểu học (Lớp ${currentGrade}, từ 8 đến 11 tuổi) tại Việt Nam, theo bộ sách "Kết nối tri thức với cuộc sống".

TÀI LIỆU LÝ THUYẾT VÀ NỘI DUNG BÀI HỌC BẮT BUỘC BÁM SÁT:
- Tên bài học: ${currentLesson}
- Chủ đề: ${currentTopic}
- Lớp: ${currentGrade}

🎯 MỤC TIÊU BÀI HỌC (OBJECTIVES):
${objectivesText}

📖 CÁC THẺ KIẾN THỨC LÝ THUYẾT TRỌNG TÂM (KNOWLEDGE CARDS):
${cardsTheoryText}

QUY TẮC SƯ PHẠM VÀ PHẢN HỒI (TUYỆT ĐỐI TUÂN THỦ):
1. QUY TẮC BÁM SÁT BÀI HỌC (QUAN TRỌNG NHẤT):
   - Nếu câu hỏi của học sinh KHÔNG LIÊN QUAN đến bài học "${currentLesson}" (ví dụ: hỏi về toán học, văn học, lịch sử, địa lý, nấu ăn, bóng đá, ca sĩ, phim ảnh, đời sống, hoặc câu hỏi ngoài nội dung bài học):
     BẠN BẮT BUỘC PHẢI TRẢ LỜI ĐÚNG THEO NỘI DUNG SAU:
     "Nội dung này nằm ngoài bài học, tôi không hỗ trợ bạn được. Em hãy đặt câu hỏi liên quan đến bài học ${currentLesson} nhé!"
2. ĐỐI VỚI CÂU HỎI LIÊN QUAN ĐẾN BÀI HỌC:
   - Hãy đọc kỹ "Mục tiêu bài học" và "Các thẻ kiến thức lý thuyết trọng tâm" được cung cấp ở trên để giải thích, gợi ý hoặc trả lời một cách chính xác, sư phạm và dễ hiểu nhất cho học sinh Lớp ${currentGrade}.
   - Khi học sinh hỏi "giải thích bài" hoặc hỏi tổng quan, hãy trình bày rõ ràng:
     + Mục tiêu bài học cần đạt
     + Các phần kiến thức lý thuyết trọng tâm (trích xuất chuẩn xác từ các thẻ kiến thức ở trên)
     + Ví dụ thực tế gần gũi và lời động viên em nhỏ.
3. GIỌNG ĐIỆU:
   - Vui tươi, ấm áp, động viên, xưng hô "Robot Tin Học / Tớ" và gọi học sinh là "em / bạn nhỏ". Sử dụng emoji sinh động (🤖 💻 ⭐ 🚀 💡 ✨ 👏).
4. KHÔNG HỎI thông tin cá nhân của học sinh.
    `.trim();

    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((h: { role: string; text: string }) => `${h.role === 'user' ? 'Học sinh' : 'Robot'}: ${h.text}`).join('\n')
      : '';

    const prompt = `
Lịch sử trò chuyện trước đó:
${formattedHistory}

Yêu cầu hiện tại của học sinh (Chế độ: ${mode || 'chat'}):
"${userMessage || 'Em muốn nhờ Robot hướng dẫn học bài này!'}"

Hãy trả lời học sinh bằng tiếng Việt thật truyền cảm hứng và phù hợp với học sinh Lớp ${currentGrade}:
    `.trim();

    let replyText = '';
    try {
      const response = await activeAi.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });
      replyText = response.text || '';
    } catch (modelErr) {
      console.warn('Gemini generateContent error, using knowledge-grounded response:', modelErr);
      replyText = generateKnowledgeGroundedResponse(userMessage, lessonContext);
    }

    if (!replyText) {
      replyText = generateKnowledgeGroundedResponse(userMessage, lessonContext);
    }

    res.json({
      reply: replyText,
      source: 'gemini',
      success: true,
    });
  } catch (error) {
    console.error('Error in /api/robot-tinhoc:', error);
    // Graceful fallback on API error
    const currentLesson = req.body?.lessonTitle || 'Tin học';
    const fallbackReply = generateKnowledgeGroundedResponse(
      req.body?.message || '',
      {
        lessonTitle: currentLesson,
        grade: req.body?.grade || 3,
        topicName: req.body?.topic || 'Tin học',
        objectives: req.body?.objectives || [],
        knowledgeCards: req.body?.knowledgeCards || [],
        keyTakeaways: req.body?.keyTakeaways || [],
        mode: req.body?.mode || 'chat',
      }
    );
    res.json({
      reply: fallbackReply,
      source: 'fallback_error',
      success: true,
    });
  }
});

// Endpoint: Stream Vietnamese Text-To-Speech audio (MP3)
app.get('/api/tts', async (req, res) => {
  try {
    const text = ((req.query.text as string) || '').trim();
    if (!text) {
      return res.status(400).send('Missing text parameter');
    }
    // Limit to 200 chars per audio chunk for Google TTS compatibility
    const cleanText = text.replace(/[*#_`]/g, '').slice(0, 200);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

    const upstreamRes = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('TTS upstream service unavailable');
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const buffer = Buffer.from(await upstreamRes.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.warn('[TTS API] Error streaming Vietnamese TTS:', err);
    res.status(500).send('TTS stream error');
  }
});

// Start server with Vite middleware in development or static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const portArgIndex = process.argv.indexOf('--port');
  const portFromArgs = portArgIndex !== -1 ? process.argv[portArgIndex + 1] : undefined;
  const PORT = portFromArgs || (!isProd ? 3000 : (process.env.PORT || 3000));
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🤖 Học Liệu Tin Học Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
