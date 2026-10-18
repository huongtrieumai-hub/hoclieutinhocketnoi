export type GradeLevel = 3 | 4 | 5;

export interface Topic {
  id: string;
  grade: GradeLevel;
  code: string; // e.g. 'A', 'B', 'C', 'D', 'E', 'F'
  name: string; // e.g. 'Chủ đề A: Máy tính và em'
  description: string;
  icon: string;
  color: string;
}

export interface MindMapNode {
  id: string;
  title: string;
  summary?: string;
  details?: string;
  imageUrl?: string;
  color?: string;
  icon?: string;
  externalLink?: string; // Link sơ đồ tư duy tương tác hoặc liên kết web ngoài
  children?: MindMapNode[];
}

export interface KnowledgeCard {
  id: string;
  title: string;
  summary: string;
  details: string;
  imageUrl?: string;
  keyMemory: string; // Ghi nhớ cốt lõi
  videoUrl?: string;
  pdfUrl?: string;
}

export interface SimulationItem {
  id: string;
  title: string;
  type: 'built_in_keyboard' | 'built_in_mouse' | 'built_in_folders' | 'built_in_scratch' | 'external_iframe' | 'external_link';
  url?: string;
  embedAllowed?: boolean;
  instructions: string;
  thumbnailUrl?: string;
}

export enum QuestionType {
  singleChoice = 'singleChoice',
  multipleChoice = 'multipleChoice',
  trueFalse = 'trueFalse',
  fillBlank = 'fillBlank',
  matching = 'matching',
  dragDrop = 'dragDrop',
  ordering = 'ordering',
  imageSelect = 'imageSelect',
  findError = 'findError',
  scenario = 'scenario',
  clickPosition = 'clickPosition',
  mediaBased = 'mediaBased',
}

export type QuestionTypeAlias =
  | QuestionType
  | 'singleChoice'
  | 'multipleChoice'
  | 'trueFalse'
  | 'fillBlank'
  | 'matching'
  | 'dragDrop'
  | 'ordering'
  | 'imageSelect'
  | 'findError'
  | 'scenario'
  | 'clickPosition'
  | 'mediaBased'
  | 'multiple_choice'
  | 'true_false'
  | 'drag_drop';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType | QuestionTypeAlias;
  explanation: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';

  // 1. Một đáp án đúng (singleChoice)
  options?: string[]; // for multiple choice (4 options)
  optionImages?: string[]; // optional image for each option (Data URL or web URL)
  correctAnswer?: string | number | boolean | (string | number)[]; // index, text or boolean

  // 2. Nhiều đáp án đúng (multipleChoice)
  correctAnswers?: number[]; // indices of correct options

  // 3. Đúng – Sai (trueFalse)
  isTrue?: boolean; // true if the statement is correct
  trueImage?: string; // optional image for TRUE option
  falseImage?: string; // optional image for FALSE option

  // 4. Điền vào chỗ trống (fillBlank)
  correctText?: string; // accurate keyword to fill
  blanks?: string[]; // optional alternate accepted words or blanks
  blankPromptPrefix?: string;
  blankPromptSuffix?: string;
  wordBank?: string[]; // optional clickable suggestion chips
  blankAnswerImage?: string; // optional illustration/hint image for the answer

  // 5. Ghép đôi (matching)
  pairs?: Array<{ id: string; left: string; right: string; leftImage?: string; rightImage?: string }>;
  matchPairs?: Array<{ id: string; left: string; right: string }>;

  // 6. Kéo thả phân loại (dragDrop)
  categories?: string[];
  itemsToCategorize?: Array<{ id: string; text: string; category: string; imageUrl?: string }>;

  // 7. Sắp xếp thứ tự (ordering)
  orderItems?: Array<{ id: string; text: string; imageUrl?: string }>;
  correctOrder?: string[]; // IDs or text ordered correctly

  // 8. Chọn đáp án qua hình ảnh (imageSelect)
  imageOptions?: Array<{ id: string; imageUrl: string; label?: string; isCorrect?: boolean }>;

  // 9. Tìm lỗi sai (findError)
  errorText?: string;
  errorOptions?: string[]; // words/phrases to click on
  correctCorrection?: string;

  // 10. Trắc nghiệm tình huống (scenario)
  scenarioContext?: string; // description of the situation

  // 11. Chọn vị trí trên hình (clickPosition)
  targetAreaName?: string;
  targetHotspotId?: string;
  clickHotspots?: Array<{ id: string; label: string; x: number; y: number; radius?: number; isTarget: boolean }>;

  // 12. Trắc nghiệm qua âm thanh/video (mediaBased)
  mediaPrompt?: string;
}

export type GameFormat = 'quiz' | 'true_false' | 'drag_drop' | 'matching' | 'card_flip' | 'lucky_wheel' | 'mystery_doors';

export type MaterialType = 'youtube' | 'pdf' | 'pptx' | 'docx' | 'google_drive' | 'elearning_lms' | 'web_link';

export interface LearningMaterialItem {
  id: string;
  title: string;
  type: MaterialType;
  url: string;
  description?: string;
  durationSeconds?: number; // Thời lượng quy định (ví dụ: 180s, 300s)
}

export interface InteractiveSimulationItem {
  id: string;
  title: string;
  url: string;
  platform?: 'gemini_canvas' | 'scratch' | 'phet' | 'other';
  instructions?: string;
  thumbnailUrl?: string;
}

export interface MindMapImageItem {
  id: string;
  title: string;
  imageUrl: string; // Base64 Data URL or public web URL
  caption?: string;
}

export interface ExternalGameItem {
  id: string;
  title: string;
  platform: 'wordwall' | 'wayground' | 'quizizz' | 'kahoot' | 'other';
  url: string;
  instructions?: string;
}

export interface Lesson {
  id: string;
  grade: GradeLevel;
  topicId: string;
  order: number;
  title: string;
  subtitle?: string;
  period?: string; // Tiết học: Tiết 1, Tiết 2, Tiết 1 & 2
  status?: 'published' | 'draft';
  description: string;
  coverImage?: string;
  objectives?: string[];
  isPublished: boolean;
  isDemo?: boolean;

  // Rich learning materials (YouTube, PDF, PPTX, Word, Drive, LMS)
  materials?: LearningMaterialItem[];
  requiredWatchSeconds?: number; // Thời lượng xem video & tài liệu quy định tối thiểu (mặc định 180s - 3 phút)

  // Interactive simulations (Gemini Canvas, Web Apps)
  interactiveSimulations?: InteractiveSimulationItem[];

  // Mind map images (Uploaded images PNG, JPG, WEBP with zoom & lightbox)
  mindMapImages?: MindMapImageItem[];

  // External games (Wordwall, Wayground...)
  externalGames?: ExternalGameItem[];

  // Section 1: Khởi động
  section1WarmUp: {
    storyOrQuestion: string;
    mediaType: 'image' | 'video' | 'riddle';
    mediaUrl?: string;
    riddleQuestion?: string;
    riddleAnswer?: string;
    riddleHint?: string;
  };

  // Section 2: Khám phá kiến thức
  section2Knowledge: {
    cards: KnowledgeCard[];
  };

  // Section 3: Sơ đồ tư duy tương tác
  section3MindMap: {
    rootTitle: string;
    rootSubtitle?: string;
    externalMindMapUrl?: string; // Link sơ đồ tư duy tương tác từ web khác (Coggle, Mindmeister, Miro, GitMind, Canva...)
    externalMindMapTitle?: string; // Tiêu đề sơ đồ tương tác
    allowEmbed?: boolean; // Cho phép nhúng trực tiếp qua iframe
    branches?: MindMapNode[];
  };

  // Section 4: Thực hành - Mô phỏng tương tác
  section4Simulation: {
    simulations: SimulationItem[];
  };

  // Section 5: Trò chơi kiểm tra đánh giá
  section5Games: {
    gameType: GameFormat;
    questions: QuizQuestion[];
  };

  // Section 6: Robot Tin học AI
  section6AIConfig: {
    enabled: boolean;
    difficulty: 'easy' | 'medium' | 'advanced';
    keyTakeaways: string[];
    starterPrompts: string[];
    sampleDialogues: Array<{ user: string; robot: string }>;
  };
}

export interface StudentScoreRecord {
  id: string;
  lessonId: string;
  lessonTitle: string;
  grade: GradeLevel;
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  gameType: GameFormat;
}

export interface UserProgress {
  completedLessons: string[]; // lessonIds
  quizScores: Record<string, number>; // lessonId -> best score
  starsEarned: number;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserAccount {
  id: string;
  email?: string;
  username: string;
  password?: string;
  passwordHash?: string;
  salt?: string;
  fullName: string;
  role: UserRole;
  grade?: GradeLevel;
  schoolClass?: string;
  status?: 'active' | 'pending' | 'locked';
  avatar: string;
  bio?: string;
  stars: number;
  badges: string[];
  createdAt?: string;
  customClaims?: {
    admin?: boolean;
    role?: string;
  };
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. '3A', '4B', '5C'
  grade: GradeLevel;
  teacherName?: string;
  studentCount?: number;
  createdAt?: string;
}

export interface StudySessionRecord {
  id: string;
  userId?: string;
  studentName: string;
  schoolClass?: string;
  grade: GradeLevel;
  lessonId: string;
  lessonTitle: string;
  startTime: string; // e.g. '14:20:05 16/10/2026'
  endTime?: string;
  durationSeconds: number; // e.g. 720 (12 phút)
  sectionsVisited: string[]; // e.g. ['Khởi động', 'Khám phá kiến thức', 'Mô phỏng thực hành']
  isCompleted: boolean;
  date: string; // YYYY-MM-DD
}

export interface StudentLearnerSummary {
  userId: string;
  studentName: string;
  schoolClass: string;
  grade: GradeLevel;
  avatar: string;
  totalStudySeconds: number;
  lessonsStudiedCount: number;
  completedLessonsCount: number;
  quizTakenCount: number;
  averageScore: number;
  starsEarned: number;
  lastActive: string;
  status: 'active_today' | 'active_this_week' | 'inactive';
}
