import { KnowledgeCard } from '../types';

export interface LessonKnowledgeContext {
  lessonTitle: string;
  grade: number;
  topicName?: string;
  objectives?: string[];
  knowledgeCards?: KnowledgeCard[];
  keyTakeaways?: string[];
  mode?: string;
}

const VIETNAMESE_STOP_WORDS = new Set([
  'la', 'va', 'cua', 'cho', 'cac', 'nhung', 'co', 'the', 'trong', 'duoc', 'khong',
  'voi', 'mot', 'hai', 'ba', 'bon', 'nam', 'nao', 'vay', 'thanh', 'nhieu', 'giup',
  'qua', 'ra', 'khi', 've', 'den', 'tu', 'o', 'tai', 'em', 'ban', 'nho', 'gi', 'nay',
  'do', 'kia', 'hoi', 'biet', 'hay', 'nhu', 'de', 'thi', 'ai', 'se', 'da', 'dang'
]);

/**
 * Normalizes text for matching: removes accents, lowers case, cleans non-alphanumeric chars.
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

/**
 * Checks if a normalized string contains a whole word or multi-word phrase with boundaries.
 */
function containsPhrase(textNorm: string, phraseNorm: string): boolean {
  if (!textNorm || !phraseNorm) return false;
  const paddedText = ` ${textNorm.replace(/[^a-z0-9]/g, ' ')} `;
  const paddedPhrase = ` ${phraseNorm.replace(/[^a-z0-9]/g, ' ').trim()} `;
  return paddedText.includes(paddedPhrase);
}

/**
 * Extracts meaningful keyword tokens (skipping stop words and short numbers).
 */
function extractMeaningfulWords(text: string): string[] {
  const norm = normalizeVietnamese(text).replace(/[^a-z0-9]/g, ' ');
  return norm
    .split(/\s+/)
    .filter((w) => w.length > 2 && !VIETNAMESE_STOP_WORDS.has(w));
}

/**
 * Determines whether a user query is outside the scope of the lesson.
 * Strict implementation: any question about other school subjects (math, literature, history,
 * geography, foreign affairs, pop culture, cooking, sports) or unrelated topics is marked as off-topic.
 */
export function isQuestionOffTopic(message: string, context: LessonKnowledgeContext): boolean {
  const raw = (message || '').trim();
  if (!raw) return false;
  const norm = normalizeVietnamese(raw);

  // 1. Explicit off-topic phrases across multiple domains (Math, Literature, Geography, History, Pop culture, etc.)
  const offTopicPhrases = [
    // Geography / Countries
    'thu do', 'nuoc phap', 'nuoc my', 'trung quoc', 'nga', 'nhat ban', 'paris', 'london',
    'bac kinh', 'tokyo', 'song me kong', 'song hong', 'nui everest', 'thoi tiet hom nay',
    'ngay mai mua khong', 'bien dong', 'chau a', 'chau au', 'chau my', 'nam cuc',
    // Math / Formulas
    'giai toan', 'phuong trinh', 'dien tich', 'chu vi', 'tam giac', 'hinh thang', 'hinh tron',
    'can bac hai', 'hinh hoc', 'so nguyen to', 'phan so', 'tich phan', 'dao ham', '1 + 1',
    '2 + 2', 'phep cong', 'phep tru', 'phep nhan', 'phep chia',
    // Literature / Vietnamese
    'tap lam van', 'ta con cho', 'ta con meo', 'ta me', 'ta co giao', 'ta ngoi truong',
    'phan tich bai tho', 'soan bai', 'bai van', 'tu dong am', 'tu trai nghia',
    // Science / Biology
    'con ho', 'con voi', 'con su tu', 'khung long', 'quang hop', 'he mat troi', 'sao hoa',
    'sao kim', 'trai dat quay', 'dong vat an co', 'thuc vat', 'tai sao la cay',
    // History
    'vua hung', 'quang trung', 'dien bien phu', 'bac ho sinh', 'chien thang', 'chien tranh',
    'thoi ly', 'thoi tran', 'nam 1945', 'nam 1975', 'lich su viet nam',
    // Pop culture / Singers / Sports / Non-IT Games
    'messi', 'ronaldo', 'da bong', 'ngoai hang anh', 'world cup', 'roblox', 'free fire',
    'lien quan', 'pubg', 'blackpink', 'bts', 'son tung', 'rap viet', 'doraemon', 'conan',
    // Daily life / nonsense
    'nau an', 'lam banh', 'banh pizza', 'luoc trung', 'mon ngon', 'yeu la gi', 'to tinh',
    'ban gai', 'ban trai', 'ke chuyen ma', 'ke chuyen cuoi', 'hat cho nghe', 'doc tho',
  ];

  const hasExplicitOffTopic = offTopicPhrases.some((phrase) => containsPhrase(norm, phrase));

  // 2. Greetings and prompt actions (ALWAYS IN-SCOPE if not mixed with off-topic question)
  const greetingPhrases = [
    'chao', 'hello', 'hi robot', 'robot oi', 'em chao', 'xin chao', 'ban la ai',
    'ban ten gi', 'ten ban la gi', 'giup to', 'giup em', 'hom nay hoc gi',
    'bai nay hoc gi', 'huong dan', 'em chua hieu', 'giai thich', 'goi y', 'do vui',
    'cau hoi', 'on tap', 'bai tap', 'tinh huong', 'tom tat', 'muc tieu',
    'trong tam', 'ly thuyet', 'bai 1', 'bai 2', 'bai 3', 'bai 4', 'bai 5', 'bai 6',
  ];
  const isGreetingOrPrompt = greetingPhrases.some((phrase) => containsPhrase(norm, phrase));

  // 3. Lesson concepts & IT terminology matching
  const lessonTitleNorm = normalizeVietnamese(context.lessonTitle || '');
  const topicNorm = normalizeVietnamese(context.topicName || '');

  // Core IT terminology list (elementary level)
  const itTerms = [
    'may tinh', 'phan cung', 'phan mem', 'ban phim', 'chuot', 'man hinh', 'than may',
    'loa', 'may in', 'thiet bi', 'du lieu', 'thong tin', 'chuong trinh', 'windows',
    'word', 'paint', 'chrome', 'google', 'trinh duyet', 'internet', 'mang', 'thu muc',
    'tep', 'folder', 'file', 'o dia', 'usb', 'hang phim', 'f va j', 'phim cach',
    'enter', 'shift', 'caps lock', 'go 10 ngon', 'scratch', 'lap trinh', 'nhan vat',
    'khoi lenh', 'san khau', 've hinh', 'trinh chieu', 'powerpoint', 'slide', 'an toan',
    'bao ve', 'tat may', 'bat may', 'tu the', 'khoang cach', 'hardware', 'software',
  ];

  const hasITTerm = itTerms.some((term) => containsPhrase(norm, term));

  // Check if query contains meaningful words from lesson title, objectives, or cards
  const lessonWords = [
    ...extractMeaningfulWords(context.lessonTitle || ''),
    ...extractMeaningfulWords(context.topicName || ''),
    ...(context.objectives || []).flatMap((o) => extractMeaningfulWords(o)),
    ...(context.knowledgeCards || []).flatMap((c) => [
      ...extractMeaningfulWords(c.title || ''),
      ...extractMeaningfulWords(c.summary || ''),
      ...extractMeaningfulWords(c.details || ''),
    ]),
  ];

  const userWords = extractMeaningfulWords(raw);
  const matchedLessonWords = userWords.filter((w) => lessonWords.includes(w));

  // Decision logic:
  // If user asked an explicitly off-topic subject and didn't mention any IT terms:
  if (hasExplicitOffTopic && !hasITTerm) {
    return true;
  }

  // If query mentions IT terms or matches lesson words:
  if (hasITTerm || matchedLessonWords.length >= 2 || containsPhrase(norm, lessonTitleNorm) || containsPhrase(norm, topicNorm)) {
    return false;
  }

  // If query is a friendly greeting or student asking for prompt/hint/explain/quiz:
  if (isGreetingOrPrompt) {
    return false;
  }

  // If user input has 2+ words and neither matches IT terms, nor lesson words, nor greetings:
  if (userWords.length >= 2) {
    return true;
  }

  return false;
}

/**
 * Standard refusal response required by the user:
 * "Nội dung này nằm ngoài bài học, tôi không hỗ trợ bạn được."
 */
export function buildOffTopicResponse(lessonTitle: string): string {
  return `🤖 **Robot Tin Học:**\nNội dung này nằm ngoài bài học, tôi không hỗ trợ bạn được.\n\n💡 *Em hãy đặt các câu hỏi liên quan đến kiến thức của bài học **"${lessonTitle}"** (ví dụ: mục tiêu bài học, định nghĩa, ví dụ minh họa, cách sử dụng an toàn...) để Robot hỗ trợ em nhé!* 🌟`;
}

/**
 * Generates an intelligent, high-fidelity response grounded strictly in the lesson's
 * objectives (Mục tiêu bài học) and knowledge cards (Kiến thức trọng tâm).
 */
export function generateKnowledgeGroundedResponse(
  message: string,
  context: LessonKnowledgeContext
): string {
  const {
    lessonTitle,
    grade,
    topicName = 'Tin học',
    objectives = [],
    knowledgeCards = [],
    keyTakeaways = [],
    mode = 'chat',
  } = context;

  const raw = (message || '').trim();
  const normMsg = normalizeVietnamese(raw);

  // 1. Strict check for off-topic queries
  if (isQuestionOffTopic(raw, context)) {
    return buildOffTopicResponse(lessonTitle);
  }

  // 2. Format Objectives (Mục tiêu bài học)
  const formattedObjectives = objectives.length > 0
    ? objectives.map((obj, i) => `   🎯 **Mục tiêu ${i + 1}:** ${obj}`).join('\n')
    : `   🎯 **Mục tiêu cốt lõi:** Nắm vững kiến thức bài học "${lessonTitle}" và vận dụng thực hành an toàn.`;

  // 3. Format Knowledge Cards (Kiến thức trọng tâm)
  const cardsSummary = knowledgeCards.length > 0
    ? knowledgeCards.map((c) => {
        const lines: string[] = [];
        lines.push(`📌 **${c.title}**`);
        if (c.details || c.summary) {
          const detailLines = (c.details || c.summary)
            .split('\n')
            .filter((l) => l.trim().length > 0)
            .map((l) => `   • ${l.replace(/^[-•*]\s*/, '').trim()}`)
            .join('\n');
          lines.push(detailLines);
        }
        if (c.keyMemory) {
          lines.push(`   💡 *Ghi nhớ:* ${c.keyMemory}`);
        }
        return lines.join('\n');
      }).join('\n\n')
    : (keyTakeaways.length > 0
        ? keyTakeaways.map((k, i) => `📌 **Trọng tâm ${i + 1}:** ${k}`).join('\n')
        : `📌 **Kiến thức trọng tâm:** Hãy luôn tuân thủ các quy tắc an toàn khi sử dụng máy tính.`);

  // 4. Handle Modes and Specific Inquiries

  // A. EXPLAIN MODE or "giải thích bài" / "giải thích" / general lesson summary
  if (
    mode === 'explain' ||
    containsPhrase(normMsg, 'giai thich') ||
    containsPhrase(normMsg, 'bai 1') ||
    containsPhrase(normMsg, 'bai nay') ||
    containsPhrase(normMsg, 'hoc bai')
  ) {
    return `🤖 **Robot Tin Học xin giải thích chi tiết bài học "${lessonTitle}" cho bạn nhỏ Lớp ${grade} nhé:**

🎯 **MỤC TIÊU BÀI HỌC CẦN ĐẠT:**
${formattedObjectives}

📖 **KIẾN THỨC LÝ THUYẾT TRỌNG TÂM:**
${cardsSummary}

🌟 *Lời khuyên của Robot:* Em hãy đọc kỹ từng phần và liên hệ với chiếc máy tính em đang sử dụng hằng ngày nhé. Em có muốn Robot đố một câu đố vui để kiểm tra xem em nhớ bài chưa nào? 🚀`;
  }

  // B. OBJECTIVES INQUIRY (Hỏi về mục tiêu bài học)
  if (
    containsPhrase(normMsg, 'muc tieu') ||
    containsPhrase(normMsg, 'can dat') ||
    containsPhrase(normMsg, 'yeu cau')
  ) {
    return `🤖 **Mục tiêu của bài học "${lessonTitle}" (Lớp ${grade}):**

Sau khi học xong bài này, em cần đạt được các mục tiêu sau:
${formattedObjectives}

💡 *Em đã tự tin mình đạt được những mục tiêu nào ở trên chưa? Hãy nói cho Robot biết phần nào em cần hỗ trợ thêm nhé!* ✨`;
  }

  // C. HINT MODE or "gợi ý"
  if (mode === 'hint' || containsPhrase(normMsg, 'goi y')) {
    const firstCard = knowledgeCards[0];
    const hintText = firstCard
      ? `Em hãy chú ý trọng tâm: **${firstCard.title}**!\n${firstCard.summary || firstCard.details}`
      : (keyTakeaways[0] || 'Hãy nắm chắc định nghĩa và ví dụ trong bài học.');

    return `🤖 **Gợi ý từ Robot Tin Học:**
Trong bài **"${lessonTitle}"**, điểm mấu chốt em cần nhớ nhất là:

${hintText}

💡 *Em thử suy nghĩ xem điểm này ứng dụng vào thực tế khi em ngồi trước máy tính như thế nào nhé!*`;
  }

  // D. QUIZ MODE or "đố câu tiếp theo" / "đố em"
  if (mode === 'quiz' || containsPhrase(normMsg, 'do') || containsPhrase(normMsg, 'cau do')) {
    if (containsPhrase(normMsg, 'phan cung') || containsPhrase(normMsg, 'phan mem') || containsPhrase(normalizeVietnamese(lessonTitle), 'phan cung')) {
      return `🤖 **Câu hỏi thử thách trí nhớ từ Robot Tin Học:**
Trong bài **"${lessonTitle}"**, em hãy thử sức trả lời câu này nhé:

❓ *"Thiết bị nào dưới đây là PHẦN CỨNG của máy tính?"*
A. Bàn phím máy tính ⌨️
B. Phần mềm vẽ Paint 🎨
C. Phần mềm soạn thảo Word 📝
D. Hệ điều hành Windows 🪟

👉 *Em hãy nhắn chữ cái đáp án (A, B, C hoặc D) cho Robot xem em nhớ bài chuẩn không nào!* 🎯`;
    }

    if (containsPhrase(normalizeVietnamese(lessonTitle), 'ban phim') || containsPhrase(normMsg, 'ban phim')) {
      return `🤖 **Câu hỏi thử thách trí nhớ từ Robot Tin Học:**
Trong bài **"${lessonTitle}"**, em hãy trả lời xem:

❓ *"Hai phím nào trên hàng phím cơ sở có gờ nổi để đặt hai ngón tay trỏ?"*
A. Phím A và Phím L
B. Phím F và Phím J
C. Phím G và Phím H
D. Phím Space và Phím Enter

👉 *Em hãy nhắn đáp án cho Robot nhé!* 🎯`;
    }

    return `🤖 **Câu hỏi thử thách từ Robot Tin Học:**
Theo kiến thức trọng tâm của bài **"${lessonTitle}"**:

❓ *"Theo em, hành động nào dưới đây là đúng quy tắc và an toàn khi sử dụng máy tính?"*
A. Vừa ăn bánh uống nước vừa gõ bàn phím
B. Tắt máy bằng cách rút đột ngột dây cắm nguồn điện
C. Ngồi thẳng lưng, mắt cách màn hình 50 - 80cm và tắt máy đúng quy trình
D. Dùng vật nhọn gõ mạnh vào màn hình máy tính

👉 *Nhắn chữ cái đáp án đúng (A, B, C hoặc D) cho Robot ngay nhé!* 🎯`;
  }

  // E. REAL WORLD SITUATION (Tình huống thực tế)
  if (mode === 'real_world' || containsPhrase(normMsg, 'tinh huong') || containsPhrase(normMsg, 'thuc te')) {
    if (containsPhrase(normalizeVietnamese(lessonTitle), 'phan cung') || containsPhrase(normalizeVietnamese(lessonTitle), 'phan mem')) {
      return `🤖 **Tình huống thực tế cho em:**
Giả sử bạn Nam mới mua một chiếc máy vi tính rất đẹp, có đủ màn hình, chuột, bàn phím và thân máy nhưng chưa được cài bất kỳ hệ điều hành hay phần mềm nào. Nam bật máy lên và bảo: *"Mình sẽ vào vẽ tranh bằng Paint ngay bây giờ!"*

🤔 *Theo em, bạn Nam có mở phần mềm Paint để vẽ tranh được ngay không? Tại sao? (Dựa vào mối quan hệ giữa phần cứng và phần mềm mà em đã học)*`;
    }

    return `🤖 **Tình huống thực tế cho em:**
Khi ngồi học Tin học trong phòng máy của trường, bạn cùng bàn với em muốn rút phích cắm điện để cắm sạc đồ chơi điện tử khi máy tính đang chạy.

🤔 *Dựa vào quy tắc an toàn bài **"${lessonTitle}"**, em sẽ khuyên bạn điều gì để bảo vệ thiết bị và an toàn cho chính mình?*`;
  }

  // F. GREETINGS (Chào hỏi)
  if (containsPhrase(normMsg, 'chao') || containsPhrase(normMsg, 'hello') || containsPhrase(normMsg, 'hi')) {
    return `🤖 **Chào bạn nhỏ Lớp ${grade}!** Tớ là Robot Tin Học thông thái.
Hôm nay chúng mình cùng học bài: **"${lessonTitle}"**.

Tớ đã nạp toàn bộ kiến thức:
✅ **${objectives.length} Mục tiêu bài học**
✅ **${knowledgeCards.length} Thẻ kiến thức lý thuyết trọng tâm**

Em có câu hỏi nào về bài học này, hay muốn tớ giải thích phần nào, cứ nhắn cho tớ nhé! 🌟`;
  }

  // G. SEARCH SPECIFIC KNOWLEDGE CARD BY KEYWORDS
  let bestCard: KnowledgeCard | null = null;
  let highestScore = 0;

  for (const card of knowledgeCards) {
    const cardWords = [
      ...extractMeaningfulWords(card.title || ''),
      ...extractMeaningfulWords(card.summary || ''),
      ...extractMeaningfulWords(card.details || ''),
    ];
    let score = 0;
    const userWords = extractMeaningfulWords(raw);
    for (const w of userWords) {
      if (cardWords.includes(w)) score++;
    }
    if (score > highestScore) {
      highestScore = score;
      bestCard = card;
    }
  }

  if (bestCard && highestScore >= 2) {
    return `🤖 **Robot Tin Học trả lời theo kiến thức bài học "${lessonTitle}":**

📌 **Về nội dung: ${bestCard.title}**
${bestCard.details || bestCard.summary}
${bestCard.keyMemory ? `\n💡 *Ghi nhớ:* ${bestCard.keyMemory}` : ''}

👏 Em đặt câu hỏi rất đúng trọng tâm bài học! Em có muốn Robot giải thích rõ hơn phần này hay đố một câu đố không? ⭐`;
  }

  // H. GENERAL IN-SCOPE RESPONSE
  return `🤖 **Robot Tin Học xin trả lời câu hỏi của em trong bài "${lessonTitle}":**

Dựa vào mục tiêu và nội dung lý thuyết trọng tâm của bài:
${cardsSummary}

💡 *Em có thể hỏi chi tiết hơn về từng mục hoặc nhấn các nút gợi ý nhanh phía trên để cùng Robot luyện tập nhé!* 🚀`;
}
