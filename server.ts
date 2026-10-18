import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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

// Fallback smart responses for Robot Tin Hoc when API key is not configured or in offline simulation
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
      return `🤖 **Gợi ý từ Robot Tin Học:**\nTrong bài **${lessonTitle}** (Lớp ${grade}), em hãy chú ý đến chi tiết sau:\n${pointsSummary}\n\n💡 *Em thử suy nghĩ xem điều này ứng dụng vào thực tế như thế nào nhé! Em đã nghĩ ra chưa?* ✨`;
    case 'explain':
      return `🤖 **Giải thích siêu dễ hiểu cho bạn nhỏ Lớp ${grade}:**\nBài **${lessonTitle}** giống như một trò chơi thú vị! Hãy tưởng tượng:\n${pointsSummary}\n\n🌟 *Khi chúng mình hiểu được nguyên lý này, việc học Tin học sẽ vừa vui vừa làm được bao nhiêu việc sáng tạo!*`;
    case 'quiz':
      return `🤖 **Câu hỏi thử thách trí nhớ từ Robot Tin Học:**\nTrong bài **${lessonTitle}**, em hãy thử trả lời câu này nhé:\n❓ *"Theo em, hành động nào dưới đây là đúng khi sử dụng máy tính?"*\nA. Ngồi thẳng lưng, mắt cách màn hình 50-80cm\nB. Vừa ăn bánh vừa gõ phím\nC. Tắt máy bằng cách rút phích cắm đột ngột\n\n👉 *Em hãy nhắn chữ cái đáp án cho Robot xem em nhớ bài chuẩn không nào!* 🎯`;
    case 'real_world':
      return `🤖 **Tình huống thực tế cho em:**\nGiả sử hôm nay bạn Na và bạn Minh cùng ngồi học nhóm với máy tính ở trường. Bạn Minh muốn mở một bức ảnh bài học đã lưu hôm qua trong bài **${lessonTitle}**.\n🤔 *Nếu là em, em sẽ hướng dẫn bạn Minh tìm lại bài học đó như thế nào cho nhanh nhất?*`;
    default:
      if (message.toLowerCase().includes('chào') || message.toLowerCase().includes('hello')) {
        return `🤖 **Chào bạn nhỏ chăm chỉ!** Tớ là Robot Tin Học, người bạn đồng hành của em trong bài học **${lessonTitle}** (Lớp ${grade}). Em có điều gì chưa hiểu trong bài hay muốn tớ đố một câu đố vui không nào? 🌟`;
      }
      return `🤖 **Robot Tin Học xin trả lời:**\nĐối với câu hỏi của em trong bài **"${lessonTitle}"**:\n\n${pointsSummary}\n\n👏 Em đã rất chủ động đặt câu hỏi, đó là phẩm chất tuyệt vời của một "Nhà thông thái nhí"! Em có muốn tớ đố thêm một câu về bài học này không?`;
  }
}

// API endpoint for Robot Tin Học chat
app.post('/api/robot-tinhoc', async (req, res) => {
  try {
    const { message, lessonTitle, grade, topic, keyTakeaways, mode, history } = req.body;

    const currentGrade = grade || 3;
    const currentLesson = lessonTitle || 'Tin học Tiểu học';
    const currentTopic = topic || 'Máy tính và em';
    const points: string[] = Array.isArray(keyTakeaways) ? keyTakeaways : [];

    // If Gemini client is not initialized or fails, use high-fidelity rule-based pedagogical fallback
    if (!ai) {
      const fallbackReply = generateFallbackResponse(
        message || '',
        currentLesson,
        currentGrade,
        mode || 'chat',
        points
      );
      return res.json({
        reply: fallbackReply,
        source: 'local_mentor',
        success: true,
      });
    }

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
3. Độ tuổi phù hợp: Dùng từ ngữ đơn giản, ví von gần gũi với đời sống trẻ thơ (như so sánh chuột máy tính với chú chuột nhỏ, thư mục như ngăn kéo tủ...).
4. An toàn cho trẻ em: KHÔNG ĐƯỢC hỏi hoặc lưu trữ họ tên đầy đủ, số điện thoại, địa chỉ nhà hay bất kỳ thông tin cá nhân nào của học sinh.
5. Trung thực bám sát: Chỉ giải thích kiến thức có trong SGK và nội dung bài học. Nếu học sinh hỏi kiến thức vượt ngoài phạm vi, hãy hướng dẫn học sinh hỏi thêm thầy cô giáo.
6. Chế độ (mode):
   - 'hint': Đưa ra 1 gợi ý ngắn gọn, súc tích, mở nút thắt tư duy.
   - 'explain': Giải thích khái niệm bằng một ví dụ sinh động, dễ hình dung nhất.
   - 'quiz': Đặt 1 câu hỏi tương tác trắc nghiệm hoặc đúng/sai thú vị kèm 3-4 đáp án.
   - 'real_world': Đặt 1 tình huống đời thực để học sinh áp dụng kiến thức.
   - 'chat': Trò chuyện, giải đáp thắc mắc của học sinh thân thiện.
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

    res.json({
      reply: replyText,
      source: 'gemini',
      success: true,
    });
  } catch (error) {
    console.error('Error in /api/robot-tinhoc:', error);
    // Graceful fallback on API error
    const fallbackReply = generateFallbackResponse(
      req.body?.message || '',
      req.body?.lessonTitle || 'Tin học',
      req.body?.grade || 3,
      req.body?.mode || 'chat',
      req.body?.keyTakeaways || []
    );
    res.json({
      reply: fallbackReply,
      source: 'fallback_error',
      success: true,
    });
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
