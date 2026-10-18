import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

type CustomRequest = any;
type CustomResponse = any;

function generateFallbackResponse(
  message: string,
  lessonTitle: string,
  grade: number,
  mode: string,
  keyPoints: string[] = []
): string {
  const pointsSummary = keyPoints.length > 0
    ? keyPoints.slice(0, 3).map((p, i) => `${i + 1}️⃣ ${p}`).join('\n')
    : 'Hãy luôn ghi nhớ quy tắc sử dụng máy tính an toàn và đúng tư thế nhé!';

  switch (mode) {
    case 'hint':
      return `🤖 **Gợi ý từ Robot Tin Học:**\nTrong bài **${lessonTitle}** (Lớp ${grade}), em hãy chú ý đến chi tiết sau:\n${pointsSummary}\n\n💡 *Em thử suy nghĩ xem điều này ứng dụng vào thực tế như thế nào nhé!* ✨`;
    case 'explain':
      return `🤖 **Giải thích cho bạn nhỏ Lớp ${grade}:**\nBài **${lessonTitle}** rất thú vị! Hãy ghi nhớ điểm quan trọng này:\n${pointsSummary}\n\n🌟 *Khi chúng mình hiểu được nguyên lý này, việc học Tin học sẽ rất vui!*`;
    case 'quiz':
      return `🤖 **Câu hỏi thử thách từ Robot Tin Học:**\nTrong bài **${lessonTitle}**, em chọn đáp án nào đúng?\n❓ *"Hành động nào đúng khi ngồi làm việc với máy tính?"*\nA. Ngồi thẳng lưng, mắt cách màn hình 50-80cm\nB. Vừa ăn bánh vừa gõ phím\n\n👉 *Hãy nhắn chữ cái đáp án cho Robot xem em nhớ bài chuẩn không nhé!* 🎯`;
    default:
      return `🤖 **Robot Tin Học trả lời:**\nĐối với câu hỏi của em trong bài **"${lessonTitle}"**:\n\n${pointsSummary}\n\n👏 Em đã rất chủ động đặt câu hỏi, đó là phẩm chất tuyệt vời của một "Nhà thông thái nhí"!`;
  }
}

export default async function handler(req: CustomRequest, res: CustomResponse) {
  // Support CORS for Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, lessonTitle, grade, topic, keyTakeaways, mode, history, customApiKey } = req.body || {};

    const currentGrade = grade || 3;
    const currentLesson = lessonTitle || 'Tin học Tiểu học';
    const currentTopic = topic || 'Máy tính và em';
    const points: string[] = Array.isArray(keyTakeaways) ? keyTakeaways : [];

    // Prioritize key in request header/body, or process.env.GEMINI_API_KEY / VITE_GEMINI_API_KEY
    const apiKey =
      customApiKey ||
      (req.headers['x-gemini-key'] as string) ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const fallbackReply = generateFallbackResponse(
        message || '',
        currentLesson,
        currentGrade,
        mode || 'chat',
        points
      );
      return res.status(200).json({
        reply: fallbackReply,
        source: 'local_mentor',
        success: true,
        notice: 'Gemini API Key chưa được cài đặt trên Vercel. Bạn có thể cài đặt GEMINI_API_KEY trong Vercel Project Settings.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `
Bạn là "ROBOT TIN HỌC" - trợ lý ảo học tập thông minh, vui tươi, thân thiện dành cho học sinh tiểu học (Lớp ${currentGrade}, từ 8 đến 11 tuổi) tại Việt Nam, theo bộ sách "Kết nối tri thức với cuộc sống".

Thông tin bài học hiện tại:
- Lớp: ${currentGrade}
- Chủ đề: ${currentTopic}
- Tên bài học: ${currentLesson}
- Các kiến thức trọng tâm cần bám sát:
${points.map((p: string, i: number) => `  ${i + 1}. ${p}`).join('\n')}

Quy tắc ứng xử và sư phạm (BẮT BUỘC):
1. Giọng điệu: Vui tươi, ấm áp, động viên, xưng hô "Robot Tin Học / Tớ" và gọi học sinh là "bạn nhỏ / em / cậu". Sử dụng các emoji sinh động (🤖 💻 ⭐ 🚀 💡 ✨ 👏).
2. Sư phạm gợi mở: KHÔNG đưa ngay đáp án bài tập khi học sinh hỏi câu đố hay trắc nghiệm; hãy đặt câu hỏi gợi ý để học sinh tự suy nghĩ và khám phá.
3. Độ tuổi phù hợp: Dùng từ ngữ đơn giản, ví von gần gũi với đời sống trẻ thơ.
4. An toàn cho trẻ em: KHÔNG ĐƯỢC hỏi hoặc lưu trữ thông tin cá nhân của học sinh.
    `.trim();

    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((h: { role: string; text: string }) => `${h.role === 'user' ? 'Học sinh' : 'Robot'}: ${h.text}`).join('\n')
      : '';

    const prompt = `
Lịch sử trò chuyện trước đó:
${formattedHistory}

Yêu cầu hiện tại của học sinh (Chế độ: ${mode || 'chat'}):
"${message || 'Em muốn nhờ Robot hướng dẫn học bài này!'}"

Hãy trả lời học sinh bằng tiếng Việt thật truyền cảm hứng và phù hợp với học sinh Lớp ${currentGrade}:
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || generateFallbackResponse(message, currentLesson, currentGrade, mode, points);

    return res.status(200).json({
      reply: replyText,
      source: 'gemini',
      success: true,
    });
  } catch (error: any) {
    console.error('Error in Vercel /api/robot-tinhoc:', error);
    const fallbackReply = generateFallbackResponse(
      req.body?.message || '',
      req.body?.lessonTitle || 'Tin học',
      req.body?.grade || 3,
      req.body?.mode || 'chat',
      req.body?.keyTakeaways || []
    );
    return res.status(200).json({
      reply: fallbackReply,
      source: 'fallback_error',
      error: error?.message || String(error),
      success: true,
    });
  }
}
