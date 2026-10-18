import React, { useState } from 'react';
import {
  Lesson,
  Topic,
  KnowledgeCard,
  MindMapNode,
  QuizQuestion,
  SimulationItem,
  LearningMaterialItem,
  InteractiveSimulationItem,
  MindMapImageItem,
  ExternalGameItem,
  MaterialType,
  QuestionType,
} from '../../types';
import {
  Plus,
  Trash2,
  Save,
  X,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  Video,
  FileText,
  Presentation,
  FileCode,
  Link as LinkIcon,
  Globe,
  Upload,
  Image as ImageIcon,
  Gamepad2,
  Eye,
  ExternalLink,
  HelpCircle,
  Clock,
  Play,
  RotateCcw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: Lesson, mode: 'publish' | 'draft') => void;
  onPreview?: (lesson: Lesson) => void;
  initialLesson?: Lesson | null;
  topics: Topic[];
}

export const LessonEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  onPreview,
  initialLesson,
  topics,
}) => {
  if (!isOpen) return null;

  const isEditing = !!initialLesson;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'info' | 'materials' | 'sim_mindmap' | 'games' | 'warmup_ai'>('info');
  const [simMindmapEditorSubTab, setSimMindmapEditorSubTab] = useState<'all' | 'sim' | 'mindmap'>('all');

  // A. THÔNG TIN BÀI HỌC
  const [grade, setGrade] = useState<3 | 4 | 5>(initialLesson?.grade || 3);
  const [topicId, setTopicId] = useState(initialLesson?.topicId || topics[0]?.id || 'top-3-a');
  const [title, setTitle] = useState(initialLesson?.title || '');
  const [period, setPeriod] = useState(initialLesson?.period || '');
  const [description, setDescription] = useState(initialLesson?.description || '');
  const [coverImage, setCoverImage] = useState(
    initialLesson?.coverImage || 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80'
  );
  const [objectives, setObjectives] = useState<string[]>(
    initialLesson?.objectives || [
      'Nhận biết được kiến thức trọng tâm của bài học.',
      'Vận dụng kiến thức vào bài tập thực hành trên máy tính.',
    ]
  );
  const [newObjective, setNewObjective] = useState('');

  // Kiến thức trọng tâm (Thẻ kiến thức)
  const [cards, setCards] = useState<KnowledgeCard[]>(
    initialLesson?.section2Knowledge?.cards || [
      {
        id: 'c_1',
        title: '1. Kiến thức trọng tâm phần 1',
        summary: 'Tóm tắt ngắn gọn khái niệm để học sinh nắm bắt nhanh.',
        details: 'Giải thích chi tiết với các ví dụ thực tế gần gũi.',
        keyMemory: 'Ghi nhớ cốt lõi của phần này!',
      },
    ]
  );

  // B. TÀI LIỆU VÀ HỌC LIỆU BÀI GIẢNG
  const [materials, setMaterials] = useState<LearningMaterialItem[]>(
    initialLesson?.materials || [
      {
        id: 'mat_demo_1',
        title: 'Video Bài Giảng YouTube',
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=0hG-2tQtdlE',
        description: 'Video bài giảng trực quan cho học sinh.',
      },
    ]
  );
  const [requiredWatchSeconds, setRequiredWatchSeconds] = useState<number>(
    initialLesson?.requiredWatchSeconds || 180
  );

  // C. MÔ PHỎNG BÀI HỌC TƯƠNG TÁC
  const [interactiveSimulations, setInteractiveSimulations] = useState<InteractiveSimulationItem[]>(
    initialLesson?.interactiveSimulations || [
      {
        id: 'sim_demo_1',
        title: 'Mô Phỏng Thực Hành Gemini Canvas',
        url: 'https://scratch.mit.edu/projects/embed/10128407/',
        platform: 'gemini_canvas',
        instructions: 'Nhấn vào các phần tử trên màn hình để thực hành tương tác.',
      },
    ]
  );
  const [simPreviewUrl, setSimPreviewUrl] = useState<string | null>(null);

  // D. SƠ ĐỒ TƯ DUY KIẾN THỨC (Ảnh tải lên + Sơ đồ cây)
  const [mindMapImages, setMindMapImages] = useState<MindMapImageItem[]>(
    initialLesson?.mindMapImages || [
      {
        id: 'mm_demo_1',
        title: 'Sơ Đồ Tư Duy Bài Học (Tổng quan)',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
        caption: 'Sơ đồ tư duy trực quan giúp học sinh ghi nhớ nhanh vai trò từng phần.',
      },
    ]
  );

  // Sơ đồ tư duy (Liên kết tương tác web ngoài & Hình ảnh sơ đồ)
  const [externalMindMapUrl, setExternalMindMapUrl] = useState(initialLesson?.section3MindMap?.externalMindMapUrl || '');
  const [externalMindMapTitle, setExternalMindMapTitle] = useState(initialLesson?.section3MindMap?.externalMindMapTitle || '');
  const [allowMindMapEmbed, setAllowMindMapEmbed] = useState(initialLesson?.section3MindMap?.allowEmbed ?? true);

  // E. TRÒ CHƠI KIỂM TRA, ĐÁNH GIÁ (Wordwall / Wayground + Trắc nghiệm)
  const [externalGames, setExternalGames] = useState<ExternalGameItem[]>(
    initialLesson?.externalGames || [
      {
        id: 'game_demo_1',
        title: 'Trò Chơi Wordwall Ôn Tập',
        platform: 'wordwall',
        url: 'https://wordwall.net/embed/78e82ef620e74e6d87e07ebbfbe90c0f?themeId=1&templateId=3&fontStackId=0',
        instructions: 'Nối hình ảnh với đáp án đúng để đạt điểm tối đa.',
      },
    ]
  );
  const [gamePreviewUrl, setGamePreviewUrl] = useState<string | null>(null);

  // Ngân hàng câu hỏi trắc nghiệm
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialLesson?.section5Games?.questions || [
      {
        id: 'q_1',
        question: 'Câu hỏi kiểm tra kiến thức bài học?',
        type: 'multiple_choice',
        options: ['A. Phương án 1', 'B. Phương án 2 (Đúng)', 'C. Phương án 3', 'D. Phương án 4'],
        correctAnswer: 1,
        explanation: 'Giải thích vì sao phương án B là chính xác.',
      },
    ]
  );

  // F. KHỞI ĐỘNG & AI
  const [warmupStory, setWarmupStory] = useState(initialLesson?.section1WarmUp?.storyOrQuestion || '');
  const [riddleQuestion, setRiddleQuestion] = useState(initialLesson?.section1WarmUp?.riddleQuestion || '');
  const [riddleAnswer, setRiddleAnswer] = useState(initialLesson?.section1WarmUp?.riddleAnswer || '');
  const [riddleHint, setRiddleHint] = useState(initialLesson?.section1WarmUp?.riddleHint || '');

  const [aiKeyTakeaways, setAiKeyTakeaways] = useState<string>(
    initialLesson?.section6AIConfig?.keyTakeaways?.join('\n') || 'Kiến thức trọng tâm bài học\nCách sử dụng máy tính an toàn'
  );

  // Helper build full Lesson object
  const buildLessonObject = (mode: 'publish' | 'draft'): Lesson => {
    return {
      id: initialLesson?.id || 'lesson_' + Date.now(),
      grade,
      topicId,
      order: initialLesson?.order || 99,
      title: title.trim(),
      subtitle: '',
      period: period.trim() || initialLesson?.period || '',
      status: mode === 'publish' ? 'published' : 'draft',
      description: description.trim() || title.trim(),
      coverImage: coverImage.trim(),
      objectives: objectives.filter((o) => o.trim().length > 0),
      isPublished: mode === 'publish',
      isDemo: false,

      // Rich new features
      materials,
      requiredWatchSeconds: Number(requiredWatchSeconds) || 180,
      interactiveSimulations,
      mindMapImages,
      externalGames,

      section1WarmUp: {
        storyOrQuestion: '',
        mediaType: 'riddle',
        riddleQuestion,
        riddleAnswer,
        riddleHint,
      },

      section2Knowledge: {
        cards,
      },

      section3MindMap: {
        rootTitle: title.trim() || 'SƠ ĐỒ TƯ DUY',
        externalMindMapUrl: externalMindMapUrl.trim(),
        externalMindMapTitle: externalMindMapTitle.trim(),
        allowEmbed: allowMindMapEmbed,
      },

      section4Simulation: {
        simulations: [
          {
            id: 'sim_default',
            title: interactiveSimulations[0]?.title || 'Mô phỏng thực hành',
            type: 'external_iframe',
            url: interactiveSimulations[0]?.url,
            instructions: interactiveSimulations[0]?.instructions || 'Học sinh thực hành theo hướng dẫn.',
          },
        ],
      },

      section5Games: {
        gameType: 'quiz',
        questions,
      },

      section6AIConfig: {
        enabled: true,
        difficulty: 'medium',
        keyTakeaways: aiKeyTakeaways.split('\n').filter((k) => k.trim().length > 0),
        starterPrompts: [
          `Robot hãy giải thích bài ${title} cho em!`,
          'Em muốn được đố một câu hỏi ôn tập!',
        ],
        sampleDialogues: [],
      },
    };
  };

  const handleSaveDraft = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập Tên bài học!');
      return;
    }
    const lesson = buildLessonObject('draft');
    onSave(lesson, 'draft');
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập Tên bài học!');
      return;
    }
    const lesson = buildLessonObject('publish');
    onSave(lesson, 'publish');
  };

  const handlePreviewCurrent = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập Tên bài học trước khi xem trước!');
      return;
    }
    const lesson = buildLessonObject('publish');
    if (onPreview) {
      onPreview(lesson);
    }
  };

  // Image Upload handler for Mind Map
  const handleUploadMindMapImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      alert('Vui lòng chọn tệp ảnh có định dạng PNG, JPG, JPEG hoặc WEBP!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const newImg: MindMapImageItem = {
          id: 'mm_img_' + Date.now(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: dataUrl,
          caption: 'Ảnh sơ đồ tư duy tải lên từ máy tính',
        };
        setMindMapImages([...mindMapImages, newImg]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReplaceMindMapImage = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      alert('Vui lòng chọn tệp ảnh có định dạng PNG, JPG, JPEG hoặc WEBP!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const updated = [...mindMapImages];
        updated[idx].imageUrl = dataUrl;
        setMindMapImages(updated);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Universal Image Upload handler for Questions and Answers
  const handleUploadImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp|gif|svg\+xml)$/i)) {
      alert('Vui lòng chọn tệp hình ảnh có định dạng PNG, JPG, JPEG, WEBP hoặc GIF!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSuccess(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              📝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  {isEditing ? 'CHỈNH SỬA BÀI HỌC' : 'SOẠN BÀI HỌC MỚI'}
                </span>
                <span className="text-xs bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                  Lớp {grade}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-0.5 drop-shadow-sm">
                {title || 'Soạn Bài Giảng Tin Học Tiểu Học (Kết Nối Tri Thức)'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none">
          {[
            { id: 'info', label: 'A. Thông tin bài học', icon: '📋' },
            { id: 'materials', label: 'B. Tài liệu & Học liệu', icon: '📚' },
            { id: 'sim_mindmap', label: 'C. Mô phỏng & Sơ đồ tư duy', icon: '🎮' },
            { id: 'games', label: 'D. Trò chơi đánh giá', icon: '🎯' },
            { id: 'warmup_ai', label: 'E. Câu đố & Robot AI', icon: '🤖' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2.5 rounded-xl shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-amber-500 text-white font-black shadow-sm scale-102'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-700">
          {/* TAB A: THÔNG TIN BÀI HỌC */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">1. Khối Lớp:</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value) as 3 | 4 | 5)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    <option value={3}>Tin học Lớp 3</option>
                    <option value={4}>Tin học Lớp 4</option>
                    <option value={5}>Tin học Lớp 5</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">2. Thuộc Chủ Đề (SGK):</label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    {topics
                      .filter((t) => t.grade === grade)
                      .map((top) => (
                        <option key={top.id} value={top.id}>
                          {top.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">3. Tên Bài Học (theo SGK Kết Nối Tri Thức):</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Bài 3: Máy tính - Những người bạn mới"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">4. Mục Tiêu Bài Học:</label>
                <div className="space-y-1.5 mb-2">
                  {objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-600 font-black">✓</span>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => {
                          const updated = [...objectives];
                          updated[idx] = e.target.value;
                          setObjectives(updated);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold"
                      />
                      <button
                        onClick={() => setObjectives(objectives.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Xóa mục tiêu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Thêm mục tiêu cần đạt mới..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newObjective.trim()) {
                        setObjectives([...objectives, newObjective.trim()]);
                        setNewObjective('');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm
                  </button>
                </div>
              </div>

              {/* Nội dung kiến thức trọng tâm (Thẻ bài học) */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-800 text-sm">
                    5. Kiến thức trọng tâm ({cards.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCards([
                        ...cards,
                        {
                          id: 'c_' + Date.now(),
                          title: `Kiến thức phần ${cards.length + 1}`,
                          summary: '',
                          details: '',
                          keyMemory: '',
                        },
                      ])
                    }
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Thêm kiến thức trọng tâm
                  </button>
                </div>

                {cards.map((c, idx) => (
                  <div key={c.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-indigo-700">Thẻ {idx + 1}</span>
                      <button
                        onClick={() => setCards(cards.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Xóa thẻ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Tiêu đề kiến thức:</label>
                      <input
                        type="text"
                        value={c.title}
                        onChange={(e) => {
                          const updated = [...cards];
                          updated[idx].title = e.target.value;
                          setCards(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Nội dung kiến thức &amp; Giải thích chi tiết:</label>
                      <textarea
                        rows={3}
                        value={c.details || c.summary}
                        onChange={(e) => {
                          const updated = [...cards];
                          updated[idx].details = e.target.value;
                          updated[idx].summary = e.target.value;
                          setCards(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200"
                        placeholder="Nội dung kiến thức trọng tâm cho học sinh..."
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-amber-800">Ghi nhớ cốt lõi (Key Takeaway):</label>
                      <input
                        type="text"
                        value={c.keyMemory}
                        onChange={(e) => {
                          const updated = [...cards];
                          updated[idx].keyMemory = e.target.value;
                          setCards(updated);
                        }}
                        placeholder="Ví dụ: Thân máy = Bộ não chỉ huy!"
                        className="w-full px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-300 font-bold text-amber-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB B: TÀI LIỆU VÀ HỌC LIỆU BÀI GIẢNG */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    Kho Tài Liệu &amp; Học Liệu Bài Giảng ({materials.length})
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Hỗ trợ: Video YouTube, Slide PowerPoint (PPTX), Tài liệu PDF, Word, Google Drive, LMS...
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setMaterials([
                      ...materials,
                      {
                        id: 'mat_' + Date.now(),
                        title: 'Tài liệu mới',
                        type: 'youtube',
                        url: '',
                        description: '',
                      },
                    ])
                  }
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> + Thêm học liệu
                </button>
              </div>

              {/* Thiết lập thời lượng quy định & điều kiện 80% */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
                <div className="max-w-md">
                  <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    ⏱️ Thời lượng xem Video &amp; Tài liệu quy định:
                  </span>
                  <p className="text-[11px] text-blue-700 font-medium mt-1 leading-relaxed">
                    Điều kiện bắt buộc: Học sinh phải theo dõi ít nhất <strong>80% thời lượng quy định</strong> ({Math.round((requiredWatchSeconds || 180) * 0.8)} giây / {Math.floor((requiredWatchSeconds || 180) / 60)} phút {(requiredWatchSeconds || 180) % 60}s) mới được hệ thống xác nhận hoàn thành bài học.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-300 shadow-xs">
                  <input
                    type="number"
                    min={30}
                    step={10}
                    value={requiredWatchSeconds}
                    onChange={(e) => setRequiredWatchSeconds(Math.max(30, Number(e.target.value) || 180))}
                    className="w-20 px-2 py-1 text-center font-black text-sm text-blue-900 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-600">giây</span>
                </div>
              </div>

              {materials.map((mat, idx) => (
                <div key={mat.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-blue-700 flex items-center gap-1.5">
                      {mat.type === 'youtube' && <Video className="w-4 h-4 text-rose-500" />}
                      {mat.type === 'pdf' && <FileText className="w-4 h-4 text-red-500" />}
                      {mat.type === 'pptx' && <Presentation className="w-4 h-4 text-orange-500" />}
                      {mat.type === 'docx' && <FileCode className="w-4 h-4 text-blue-500" />}
                      {mat.type === 'google_drive' && <Globe className="w-4 h-4 text-emerald-500" />}
                      <span>Học liệu {idx + 1}</span>
                    </span>
                    <button
                      onClick={() => setMaterials(materials.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Xóa học liệu này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Loại học liệu:</label>
                      <select
                        value={mat.type}
                        onChange={(e) => {
                          const updated = [...materials];
                          updated[idx].type = e.target.value as MaterialType;
                          setMaterials(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-300 font-bold"
                      >
                        <option value="youtube">Video YouTube</option>
                        <option value="pdf">Tài liệu PDF</option>
                        <option value="pptx">Bài trình chiếu PowerPoint (PPTX)</option>
                        <option value="docx">Tài liệu Word (DOCX)</option>
                        <option value="google_drive">Đường dẫn Google Drive công khai</option>
                        <option value="elearning_lms">Bài giảng e-learning / LMS</option>
                        <option value="web_link">Đường dẫn tài liệu Internet</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold mb-1">Tiêu đề học liệu:</label>
                      <input
                        type="text"
                        value={mat.title}
                        onChange={(e) => {
                          const updated = [...materials];
                          updated[idx].title = e.target.value;
                          setMaterials(updated);
                        }}
                        placeholder="Ví dụ: Video hướng dẫn gõ bàn phím 10 ngón..."
                        className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-300 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Đường dẫn liên kết (URL):</label>
                    <input
                      type="text"
                      value={mat.url}
                      onChange={(e) => {
                        const updated = [...materials];
                        updated[idx].url = e.target.value;
                        setMaterials(updated);
                      }}
                      placeholder="https://www.youtube.com/watch?v=... hoặc link Google Drive, PDF..."
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Ghi chú / Hướng dẫn học sinh:</label>
                    <input
                      type="text"
                      value={mat.description || ''}
                      onChange={(e) => {
                        const updated = [...materials];
                        updated[idx].description = e.target.value;
                        setMaterials(updated);
                      }}
                      placeholder="Mô tả ngắn cho học sinh..."
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB C: MÔ PHỎNG TƯƠNG TÁC & SƠ ĐỒ TƯ DUY */}
          {activeTab === 'sim_mindmap' && (
            <div className="space-y-6">
              {/* Sub-tab Switcher for Tab C */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-purple-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span>🎮</span>
                    <span>🌳</span>
                    <span>C. Mô Phỏng Tương Tác &amp; Sơ Đồ Tư Duy</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSimMindmapEditorSubTab('all')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                      simMindmapEditorSubTab === 'all'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Xem tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMindmapEditorSubTab('sim')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                      simMindmapEditorSubTab === 'sim'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <span>🎮 Mô phỏng ({interactiveSimulations.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMindmapEditorSubTab('mindmap')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                      simMindmapEditorSubTab === 'mindmap'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <span>🌳 Sơ đồ tư duy ({mindMapImages.length})</span>
                  </button>
                </div>
              </div>

              {/* MỤC 1: MÔ PHỎNG BÀI HỌC TƯƠNG TÁC */}
              {(simMindmapEditorSubTab === 'all' || simMindmapEditorSubTab === 'sim') && (
                <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">
                        1. Mô Phỏng Bài Học Tương Tác ({interactiveSimulations.length})
                      </h4>
                  <p className="text-slate-500 text-[11px]">
                    Giáo viên dán đường dẫn mô phỏng đã tạo bằng Gemini Canvas, Scratch, PhET hoặc nền tảng tương tác khác.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setInteractiveSimulations([
                      ...interactiveSimulations,
                      {
                        id: 'sim_' + Date.now(),
                        title: 'Mô phỏng tương tác mới',
                        url: '',
                        platform: 'gemini_canvas',
                        instructions: 'Học sinh nhấn để thực hành trực tiếp.',
                      },
                    ])
                  }
                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> + Thêm mô phỏng
                </button>
              </div>

              {interactiveSimulations.map((sim, idx) => (
                <div key={sim.id} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-emerald-800 flex items-center gap-1.5">
                      <Gamepad2 className="w-4 h-4 text-emerald-600" />
                      <span>Bài mô phỏng {idx + 1}</span>
                    </span>
                    <button
                      onClick={() => setInteractiveSimulations(interactiveSimulations.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Xóa mô phỏng này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold mb-1">Tên mô phỏng:</label>
                      <input
                        type="text"
                        value={sim.title}
                        onChange={(e) => {
                          const updated = [...interactiveSimulations];
                          updated[idx].title = e.target.value;
                          setInteractiveSimulations(updated);
                        }}
                        placeholder="Ví dụ: Mô phỏng luyện chuột / Scratch / Canvas..."
                        className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-300 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Nền tảng tạo:</label>
                      <select
                        value={sim.platform || 'gemini_canvas'}
                        onChange={(e) => {
                          const updated = [...interactiveSimulations];
                          updated[idx].platform = e.target.value as any;
                          setInteractiveSimulations(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-300 font-bold"
                      >
                        <option value="gemini_canvas">Gemini Canvas</option>
                        <option value="scratch">Scratch MIT</option>
                        <option value="phet">PhET Interactive</option>
                        <option value="other">Nền tảng khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Đường dẫn mô phỏng (URL):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={sim.url}
                        onChange={(e) => {
                          const updated = [...interactiveSimulations];
                          updated[idx].url = e.target.value;
                          setInteractiveSimulations(updated);
                        }}
                        placeholder="https://..."
                        className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-slate-300 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (sim.url) {
                            setSimPreviewUrl(sim.url);
                          } else {
                            alert('Vui lòng nhập đường dẫn URL để xem trước!');
                          }
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem trước</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Hướng dẫn thực hành:</label>
                    <input
                      type="text"
                      value={sim.instructions || ''}
                      onChange={(e) => {
                        const updated = [...interactiveSimulations];
                        updated[idx].instructions = e.target.value;
                        setInteractiveSimulations(updated);
                      }}
                      placeholder="Hướng dẫn học sinh các bước làm bài thực hành..."
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              ))}

              {/* Preview Modal for Simulation */}
              {simPreviewUrl && (
                <div className="p-4 bg-slate-900 rounded-2xl border-2 border-emerald-400 text-white space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-emerald-400">⚡ Xem trước mô phỏng:</span>
                    <button
                      onClick={() => setSimPreviewUrl(null)}
                      className="text-slate-400 hover:text-white font-bold"
                    >
                      Đóng xem trước [✕]
                    </button>
                  </div>
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-700">
                    <iframe
                      src={simPreviewUrl}
                      title="Simulation Preview"
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

              {/* MỤC 2: SƠ ĐỒ TƯ DUY KIẾN THỨC */}
              {(simMindmapEditorSubTab === 'all' || simMindmapEditorSubTab === 'mindmap') && (
                <div className="space-y-6 pt-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-purple-200">
                    <span className="text-sm font-black text-purple-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span>2. Sơ Đồ Tư Duy Kiến Thức SGK</span>
                    </span>
                  </div>

                  {/* Mục 2.1: Tải ảnh sơ đồ tư duy */}
                  <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-purple-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span>Hình Ảnh Sơ Đồ Tư Duy ({mindMapImages.length} ảnh)</span>
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      Hỗ trợ tải lên từ máy tính (PNG, JPG, JPEG, WEBP) hoặc dán link ảnh trực tuyến. Học sinh có thể phóng to, thu nhỏ và xem toàn màn hình.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Nhập đường dẫn URL ảnh sơ đồ tư duy (PNG, JPG, WEBP):');
                        if (url && url.trim()) {
                          setMindMapImages([
                            ...mindMapImages,
                            {
                              id: 'mm_img_' + Date.now(),
                              title: 'Sơ đồ tư duy trực quan',
                              imageUrl: url.trim(),
                              caption: 'Sơ đồ kiến thức trọng tâm',
                            },
                          ]);
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer text-xs transition"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Thêm bằng URL ảnh</span>
                    </button>

                    <label className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh từ máy tính</span>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        onChange={handleUploadMindMapImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* List of uploaded Mind Map Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {mindMapImages.map((img, idx) => (
                    <div key={img.id} className="p-3 bg-white border border-purple-200 rounded-xl space-y-2.5 shadow-xs">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-purple-800">Sơ đồ ảnh #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 border border-purple-200 transition">
                            <Upload className="w-3 h-3" />
                            <span>Thay ảnh</span>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.webp"
                              onChange={(e) => handleReplaceMindMapImage(idx, e)}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setMindMapImages(mindMapImages.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Xóa sơ đồ này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center relative group">
                        <img
                          src={img.imageUrl}
                          alt={img.title}
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Tiêu đề sơ đồ:</label>
                        <input
                          type="text"
                          value={img.title}
                          onChange={(e) => {
                            const updated = [...mindMapImages];
                            updated[idx].title = e.target.value;
                            setMindMapImages(updated);
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Chú thích:</label>
                        <input
                          type="text"
                          value={img.caption || ''}
                          onChange={(e) => {
                            const updated = [...mindMapImages];
                            updated[idx].caption = e.target.value;
                            setMindMapImages(updated);
                          }}
                          placeholder="Mô tả nội dung sơ đồ tư duy..."
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mục 2: Gắn Link Sơ Đồ Tư Duy Tương Tác Từ Web Khác */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-blue-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Gắn Link Sơ Đồ Tư Duy Tương Tác Từ Web Khác</span>
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Gắn đường link sơ đồ tư duy tương tác trực tuyến từ Coggle.it, MindMeister, Miro, GitMind, Canva, Whimsical... Học sinh có thể tương tác trực tiếp hoặc mở toàn màn hình.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Đường dẫn URL sơ đồ tư duy tương tác:
                    </label>
                    <input
                      type="url"
                      value={externalMindMapUrl}
                      onChange={(e) => setExternalMindMapUrl(e.target.value)}
                      placeholder="https://coggle.it/diagram/... hoặc https://www.mindmeister.com/..."
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-blue-200 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên hiển thị sơ đồ (Tùy chọn):
                    </label>
                    <input
                      type="text"
                      value={externalMindMapTitle}
                      onChange={(e) => setExternalMindMapTitle(e.target.value)}
                      placeholder="Ví dụ: Sơ đồ tương tác Coggle: Các bộ phận máy tính"
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-blue-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-blue-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-blue-900">
                    <input
                      type="checkbox"
                      checked={allowMindMapEmbed}
                      onChange={(e) => setAllowMindMapEmbed(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Cho phép nhúng xem và tương tác trực tiếp trên trang bài giảng (qua iframe)</span>
                  </label>

                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-slate-400 font-bold">Mẫu link tham khảo:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setExternalMindMapUrl('https://coggle.it/diagram/Zg1m2_demo/t/may-tinh-va-em');
                        setExternalMindMapTitle('Sơ đồ tư duy Coggle: Kiến thức Tin học');
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 font-bold cursor-pointer transition"
                    >
                      Coggle.it
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExternalMindMapUrl('https://www.mindmeister.com/maps/public_map_shell/demo');
                        setExternalMindMapTitle('Sơ đồ MindMeister: Hệ thống kiến thức');
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 font-bold cursor-pointer transition"
                    >
                      MindMeister
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExternalMindMapUrl('https://miro.com/app/live-embed/demo');
                        setExternalMindMapTitle('Bảng sơ đồ tương tác Miro');
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 font-bold cursor-pointer transition"
                    >
                      Miro
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

          {/* TAB D: TRÒ CHƠI KIỂM TRA, ĐÁNH GIÁ */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              {/* Mục 1: Trò chơi nhúng từ Wordwall, Wayground */}
              <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black text-rose-900 flex items-center gap-1.5">
                      <Gamepad2 className="w-4 h-4 text-rose-600" />
                      <span>Trò Chơi Trực Tuyến ({externalGames.length})</span>
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      Nhúng liên kết trò chơi sinh động từ Wordwall, Wayground, Quizizz, Kahoot để học sinh củng cố kiến thức.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExternalGames([
                        ...externalGames,
                        {
                          id: 'game_' + Date.now(),
                          title: 'Trò chơi mới',
                          platform: 'wordwall',
                          url: '',
                          instructions: 'Học sinh nhấn Bắt đầu để làm bài.',
                        },
                      ])
                    }
                    className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Thêm trò chơi
                  </button>
                </div>

                {externalGames.map((g, idx) => (
                  <div key={g.id} className="p-3.5 bg-white border border-rose-200 rounded-xl space-y-2.5 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-rose-700">Trò chơi {idx + 1}</span>
                      <button
                        onClick={() => setExternalGames(externalGames.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Xóa trò chơi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-bold mb-1">Tên trò chơi:</label>
                        <input
                          type="text"
                          value={g.title}
                          onChange={(e) => {
                            const updated = [...externalGames];
                            updated[idx].title = e.target.value;
                            setExternalGames(updated);
                          }}
                          placeholder="Ví dụ: Trò chơi ghép nối Wordwall..."
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Nền tảng:</label>
                        <select
                          value={g.platform}
                          onChange={(e) => {
                            const updated = [...externalGames];
                            updated[idx].platform = e.target.value as any;
                            setExternalGames(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold bg-white"
                        >
                          <option value="wordwall">Wordwall</option>
                          <option value="wayground">Wayground</option>
                          <option value="quizizz">Quizizz</option>
                          <option value="kahoot">Kahoot</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Đường dẫn liên kết nhúng (URL):</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={g.url}
                          onChange={(e) => {
                            const updated = [...externalGames];
                            updated[idx].url = e.target.value;
                            setExternalGames(updated);
                          }}
                          placeholder="https://wordwall.net/embed/... hoặc link trò chơi..."
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (g.url) {
                              setGamePreviewUrl(g.url);
                            } else {
                              alert('Vui lòng nhập đường dẫn để xem thử trò chơi!');
                            }
                          }}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem thử</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Game Preview */}
                {gamePreviewUrl && (
                  <div className="p-4 bg-slate-900 rounded-2xl border-2 border-rose-400 text-white space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-rose-400">⚡ Xem thử trò chơi:</span>
                      <button
                        onClick={() => setGamePreviewUrl(null)}
                        className="text-slate-400 hover:text-white font-bold"
                      >
                        Đóng xem trước [✕]
                      </button>
                    </div>
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-700">
                      <iframe
                        src={gamePreviewUrl}
                        title="Game Preview"
                        className="w-full h-full"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mục 2: Ngân hàng câu hỏi trắc nghiệm tự chấm điểm (Hỗ trợ 12 dạng câu hỏi) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <span className="font-black text-slate-800 text-sm flex items-center gap-2">
                      <span>🎯</span>
                      <span>Ngân Hàng Câu Hỏi Tự Chấm ({questions.length} câu)</span>
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Hỗ trợ đầy đủ 12 dạng câu hỏi trắc nghiệm phổ biến trong dạy học Tin học Tiểu học.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Quick preset selector */}
                    <select
                      onChange={(e) => {
                        const val = e.target.value as QuestionType;
                        if (!val) return;
                        const newQ: QuizQuestion = {
                          id: 'q_' + Date.now(),
                          type: val,
                          question: 'Câu hỏi mới dạng: ' + val,
                          explanation: 'Lời giải thích chi tiết cho học sinh ghi nhớ.',
                        };

                        if (val === QuestionType.singleChoice) {
                          newQ.question = 'Bộ phận nào được ví như "bộ não" của máy tính?';
                          newQ.options = ['Màn hình', 'Thân máy tính', 'Bàn phím', 'Chuột'];
                          newQ.correctAnswer = 1;
                        } else if (val === QuestionType.multipleChoice) {
                          newQ.question = 'Những bộ phận nào thuộc 4 bộ phận cơ bản của máy tính? (Chọn tất cả đáp án đúng)';
                          newQ.options = ['Thân máy', 'Bàn phím', 'Nồi cơm điện', 'Chuột', 'Màn hình'];
                          newQ.correctAnswers = [0, 1, 3, 4];
                        } else if (val === QuestionType.trueFalse) {
                          newQ.question = 'Màn hình máy tính là thiết bị dùng để nhập thông tin vào máy tính.';
                          newQ.isTrue = false;
                        } else if (val === QuestionType.fillBlank) {
                          newQ.question = 'Hai phím có gờ nổi trên hàng phím cơ sở là phím [F] và phím [J].';
                          newQ.blankPromptPrefix = 'Hai phím có gờ nổi trên hàng cơ sở là phím';
                          newQ.blankPromptSuffix = 'và phím J để đặt 2 ngón trỏ.';
                          newQ.correctText = 'F';
                          newQ.wordBank = ['F', 'A', 'Space', 'Enter'];
                        } else if (val === QuestionType.matching) {
                          newQ.question = 'Nối tên bộ phận máy tính với chức năng tương ứng:';
                          newQ.pairs = [
                            { id: 'p1', left: 'Thân máy', right: 'Bộ não xử lý dữ liệu' },
                            { id: 'p2', left: 'Màn hình', right: 'Hiển thị kết quả ra ngoài' },
                            { id: 'p3', left: 'Bàn phím', right: 'Nhập chữ cái và con số' },
                            { id: 'p4', left: 'Chuột', right: 'Điều khiển con trỏ trên màn hình' },
                          ];
                        } else if (val === QuestionType.dragDrop) {
                          newQ.question = 'Phân loại các thiết bị vào nhóm "Thiết bị Vào" hoặc "Thiết bị Ra":';
                          newQ.categories = ['Thiết bị Vào (Nhập)', 'Thiết bị Ra (Xuất)'];
                          newQ.itemsToCategorize = [
                            { id: 'd1', text: 'Bàn phím', category: 'Thiết bị Vào (Nhập)' },
                            { id: 'd2', text: 'Chuột máy tính', category: 'Thiết bị Vào (Nhập)' },
                            { id: 'd3', text: 'Màn hình', category: 'Thiết bị Ra (Xuất)' },
                            { id: 'd4', text: 'Loa máy tính', category: 'Thiết bị Ra (Xuất)' },
                          ];
                        } else if (val === QuestionType.ordering) {
                          newQ.question = 'Sắp xếp đúng trình tự các bước để bật máy tính để bàn:';
                          newQ.orderItems = [
                            { id: 's1', text: '1. Bật công tắc màn hình' },
                            { id: 's2', text: '2. Bấm nút nguồn trên thân máy' },
                            { id: 's3', text: '3. Chờ màn hình chính xuất hiện' },
                          ];
                          newQ.correctOrder = ['s1', 's2', 's3'];
                        } else if (val === QuestionType.imageSelect) {
                          newQ.question = 'Quan sát các hình dưới đây và chọn hình ảnh chiếc Chuột máy tính:';
                          newQ.imageOptions = [
                            { id: 'im1', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80', label: 'Màn hình', isCorrect: false },
                            { id: 'im2', imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&q=80', label: 'Chuột máy tính', isCorrect: true },
                            { id: 'im3', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80', label: 'Bàn phím', isCorrect: false },
                          ];
                          newQ.correctAnswer = 'im2';
                        } else if (val === QuestionType.findError) {
                          newQ.question = 'Tìm từ ngữ SAI trong câu quy tắc an toàn phòng máy dưới đây:';
                          newQ.errorText = 'Học sinh được phép vừa ăn bánh vừa gõ phím máy tính.';
                          newQ.errorOptions = ['Học sinh', 'được phép', 'vừa ăn bánh', 'vừa gõ phím'];
                          newQ.correctCorrection = 'KHÔNG ĐƯỢC PHÉP ăn uống khi đang dùng máy tính.';
                          newQ.correctAnswer = 'được phép';
                        } else if (val === QuestionType.scenario) {
                          newQ.question = 'Em nên làm gì trong tình huống này?';
                          newQ.scenarioContext = 'Trong giờ học Tin học, bạn bên cạnh vô tình làm đổ nước lên bàn gần giắc cắm điện.';
                          newQ.options = [
                            'A. Tự lấy tay lau giắc điện',
                            'B. Báo ngay với thầy cô giáo và không chạm vào chỗ có nước (Đúng)',
                            'C. Cắm lại giắc điện thử xem máy còn chạy không',
                            'D. Mặc kệ và tiếp tục chơi',
                          ];
                          newQ.correctAnswer = 1;
                        } else if (val === QuestionType.clickPosition) {
                          newQ.question = 'Em hãy nhấp vào vị trí của [Màn hình máy tính] trên sơ đồ:';
                          newQ.targetAreaName = 'Màn hình máy tính';
                          newQ.imageUrl = 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80';
                          newQ.clickHotspots = [
                            { id: 'sp1', label: 'Màn hình', x: 48, y: 38, isTarget: true },
                            { id: 'sp2', label: 'Thân máy', x: 82, y: 50, isTarget: false },
                            { id: 'sp3', label: 'Bàn phím', x: 42, y: 78, isTarget: false },
                          ];
                        } else if (val === QuestionType.mediaBased) {
                          newQ.question = 'Quan sát clip hướng dẫn tư thế ngồi gõ bàn phím và trả lời: Lưng cần ở tư thế nào?';
                          newQ.videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                          newQ.options = [
                            'A. Ngồi thẳng lưng, mắt cách màn hình 50-80cm (Đúng)',
                            'B. Cúi gập sát mặt vào bàn phím',
                            'C. Nằm bò ra bàn',
                            'D. Ngồi vẹo sang một bên',
                          ];
                          newQ.correctAnswer = 0;
                        }

                        setQuestions([...questions, newQ]);
                        e.target.value = '';
                      }}
                      defaultValue=""
                      className="px-2.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>⚡ Thêm mẫu 1 trong 12 dạng...</option>
                      <option value={QuestionType.singleChoice}>1. Một đáp án đúng (A, B, C, D)</option>
                      <option value={QuestionType.multipleChoice}>2. Nhiều đáp án đúng (Đa lựa chọn)</option>
                      <option value={QuestionType.trueFalse}>3. Đúng – Sai</option>
                      <option value={QuestionType.fillBlank}>4. Điền vào chỗ trống</option>
                      <option value={QuestionType.matching}>5. Ghép đôi</option>
                      <option value={QuestionType.dragDrop}>6. Kéo thả phân loại</option>
                      <option value={QuestionType.ordering}>7. Sắp xếp thứ tự</option>
                      <option value={QuestionType.imageSelect}>8. Chọn đáp án qua hình ảnh</option>
                      <option value={QuestionType.findError}>9. Tìm lỗi sai</option>
                      <option value={QuestionType.scenario}>10. Trắc nghiệm tình huống</option>
                      <option value={QuestionType.clickPosition}>11. Chọn vị trí trên hình</option>
                      <option value={QuestionType.mediaBased}>12. Trắc nghiệm âm thanh/video</option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        setQuestions([
                          ...questions,
                          {
                            id: 'q_' + Date.now(),
                            question: 'Nội dung câu hỏi mới?',
                            type: QuestionType.singleChoice,
                            options: ['Phương án A', 'Phương án B (Đúng)', 'Phương án C', 'Phương án D'],
                            correctAnswer: 1,
                            explanation: 'Lời giải thích ngắn gọn.',
                          },
                        ])
                      }
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Thêm câu hỏi
                    </button>
                  </div>
                </div>

                {questions.map((q, qIdx) => {
                  const currentType = (q.type as QuestionType) || QuestionType.singleChoice;

                  return (
                    <div key={q.id} className="p-4 bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-xs">
                      {/* Card Header: Question Index + Type Selector + Delete */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                            {qIdx + 1}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">Câu {qIdx + 1}</span>

                          {/* 12 Question Types Dropdown */}
                          <select
                            value={currentType}
                            onChange={(e) => {
                              const updated = [...questions];
                              const nextType = e.target.value as QuestionType;
                              updated[qIdx].type = nextType;

                              // Initialize sensible defaults when switching type
                              if (nextType === QuestionType.multipleChoice && !updated[qIdx].correctAnswers) {
                                updated[qIdx].correctAnswers = [0];
                              }
                              if (nextType === QuestionType.trueFalse && updated[qIdx].isTrue === undefined) {
                                updated[qIdx].isTrue = true;
                              }
                              if (nextType === QuestionType.fillBlank && !updated[qIdx].correctText) {
                                updated[qIdx].correctText = 'Từ cần điền';
                              }
                              if (nextType === QuestionType.matching && (!updated[qIdx].pairs || updated[qIdx].pairs?.length === 0)) {
                                updated[qIdx].pairs = [
                                  { id: 'p1', left: 'Thân máy', right: 'Bộ não xử lý' },
                                  { id: 'p2', left: 'Màn hình', right: 'Hiển thị kết quả' },
                                ];
                              }
                              if (nextType === QuestionType.dragDrop && (!updated[qIdx].categories || updated[qIdx].categories?.length === 0)) {
                                updated[qIdx].categories = ['Thiết bị Vào', 'Thiết bị Ra'];
                                updated[qIdx].itemsToCategorize = [
                                  { id: 'it1', text: 'Bàn phím', category: 'Thiết bị Vào' },
                                  { id: 'it2', text: 'Màn hình', category: 'Thiết bị Ra' },
                                ];
                              }
                              if (nextType === QuestionType.ordering && (!updated[qIdx].orderItems || updated[qIdx].orderItems?.length === 0)) {
                                updated[qIdx].orderItems = [
                                  { id: 'o1', text: 'Bước 1: Bật màn hình' },
                                  { id: 'o2', text: 'Bước 2: Bấm nút nguồn thân máy' },
                                ];
                                updated[qIdx].correctOrder = ['o1', 'o2'];
                              }
                              if (nextType === QuestionType.imageSelect && (!updated[qIdx].imageOptions || updated[qIdx].imageOptions?.length === 0)) {
                                updated[qIdx].imageOptions = [
                                  { id: 'img1', imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&q=80', label: 'Chuột máy tính', isCorrect: true },
                                  { id: 'img2', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80', label: 'Bàn phím', isCorrect: false },
                                ];
                                updated[qIdx].correctAnswer = 'img1';
                              }

                              setQuestions(updated);
                            }}
                            className="px-2.5 py-1 rounded-lg border-2 border-indigo-200 text-xs font-black text-indigo-900 bg-indigo-50/50 cursor-pointer"
                          >
                            <option value={QuestionType.singleChoice}>1. Một đáp án đúng (Single Choice)</option>
                            <option value={QuestionType.multipleChoice}>2. Nhiều đáp án đúng (Multiple Choice)</option>
                            <option value={QuestionType.trueFalse}>3. Đúng – Sai (True/False)</option>
                            <option value={QuestionType.fillBlank}>4. Điền vào chỗ trống (Fill in Blank)</option>
                            <option value={QuestionType.matching}>5. Ghép đôi (Matching Pairs)</option>
                            <option value={QuestionType.dragDrop}>6. Kéo thả phân loại (Drag &amp; Drop)</option>
                            <option value={QuestionType.ordering}>7. Sắp xếp thứ tự (Ordering Steps)</option>
                            <option value={QuestionType.imageSelect}>8. Chọn đáp án qua hình ảnh (Image Select)</option>
                            <option value={QuestionType.findError}>9. Tìm lỗi sai (Find Error)</option>
                            <option value={QuestionType.scenario}>10. Trắc nghiệm tình huống (Scenario)</option>
                            <option value={QuestionType.clickPosition}>11. Chọn vị trí trên hình (Click Hotspot)</option>
                            <option value={QuestionType.mediaBased}>12. Trắc nghiệm âm thanh/video (Media Based)</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Question Text */}
                      <div>
                        <label className="block text-[11px] font-black text-slate-600 mb-0.5">Nội dung câu hỏi:</label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIdx].question = e.target.value;
                            setQuestions(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      {/* Upload ảnh & Link ảnh cho CÂU HỎI */}
                      <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                            <span>Hình ảnh minh họa cho câu hỏi (Tùy chọn):</span>
                          </label>

                          <div className="flex items-center gap-1.5">
                            <label className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] flex items-center gap-1 border border-blue-200 cursor-pointer transition shadow-2xs">
                              <Upload className="w-3 h-3" />
                              <span>Tải ảnh câu hỏi từ máy tính</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleUploadImageFile(e, (dataUrl) => {
                                    const updated = [...questions];
                                    updated[qIdx].imageUrl = dataUrl;
                                    setQuestions(updated);
                                  })
                                }
                                className="hidden"
                              />
                            </label>

                            {q.imageUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...questions];
                                  updated[qIdx].imageUrl = undefined;
                                  setQuestions(updated);
                                }}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-[11px] flex items-center gap-1 border border-rose-200"
                                title="Xóa ảnh câu hỏi"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa ảnh</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Image Preview & URL input */}
                        <div className="flex items-center gap-3">
                          {q.imageUrl ? (
                            <div className="relative group shrink-0">
                              <img
                                src={q.imageUrl}
                                alt="Ảnh câu hỏi"
                                className="w-16 h-12 object-cover rounded-lg border-2 border-blue-400 shadow-sm"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-12 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs shrink-0 bg-white">
                              <ImageIcon className="w-5 h-5 text-slate-300" />
                            </div>
                          )}

                          <input
                            type="text"
                            value={q.imageUrl || ''}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].imageUrl = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder="Hoặc dán URL ảnh câu hỏi (https://...)"
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                          />
                        </div>

                        {currentType === QuestionType.mediaBased && (
                          <div className="pt-1 border-t border-slate-200">
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Link Video YouTube / Âm thanh MP3:</label>
                            <input
                              type="text"
                              value={q.videoUrl || q.audioUrl || ''}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[qIdx].videoUrl = e.target.value;
                                setQuestions(updated);
                              }}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                            />
                          </div>
                        )}
                      </div>

                      {/* ========================================================= */}
                      {/* TYPE-SPECIFIC EDITOR FOR 12 TYPES                         */}
                      {/* ========================================================= */}

                      {/* 1. Một đáp án đúng */}
                      {(currentType === QuestionType.singleChoice || currentType === 'multiple_choice' as any) && (
                        <div className="space-y-2 pt-1">
                          <label className="block text-[11px] font-bold text-slate-600">
                            Các phương án trả lời (Tích tròn đáp án đúng, có thể tải kèm ảnh cho từng phương án):
                          </label>
                          {(q.options || ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D']).map((opt, optIdx) => {
                            const optImg = q.optionImages?.[optIdx];

                            return (
                              <div key={optIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                <input
                                  type="radio"
                                  name={`rad_ans_${q.id}`}
                                  checked={Number(q.correctAnswer) === optIdx}
                                  onChange={() => {
                                    const updated = [...questions];
                                    updated[qIdx].correctAnswer = optIdx;
                                    setQuestions(updated);
                                  }}
                                  className="w-4 h-4 text-emerald-600 cursor-pointer ml-1"
                                />

                                {/* Option Image Preview & Upload */}
                                {optImg ? (
                                  <div className="relative group shrink-0">
                                    <img
                                      src={optImg}
                                      alt={`Ảnh phương án ${optIdx + 1}`}
                                      className="w-9 h-9 object-cover rounded-lg border border-blue-400"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...questions];
                                        const imgs = [...(updated[qIdx].optionImages || [])];
                                        imgs[optIdx] = '';
                                        updated[qIdx].optionImages = imgs;
                                        setQuestions(updated);
                                      }}
                                      className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow cursor-pointer"
                                      title="Xóa ảnh phương án"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <label
                                    title="Tải ảnh cho phương án này từ máy tính"
                                    className="p-1.5 bg-white hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded-lg border border-slate-200 cursor-pointer flex items-center gap-1 text-[11px] font-bold shrink-0 transition"
                                  >
                                    <Upload className="w-3 h-3 text-blue-600" />
                                    <span>Tải ảnh</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleUploadImageFile(e, (dataUrl) => {
                                          const updated = [...questions];
                                          const imgs = [...(updated[qIdx].optionImages || [])];
                                          imgs[optIdx] = dataUrl;
                                          updated[qIdx].optionImages = imgs;
                                          setQuestions(updated);
                                        })
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                )}

                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    if (!updated[qIdx].options) {
                                      updated[qIdx].options = ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'];
                                    }
                                    updated[qIdx].options![optIdx] = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  placeholder={`Nội dung phương án ${String.fromCharCode(65 + optIdx)}`}
                                  className="flex-1 min-w-[140px] px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                                />

                                <input
                                  type="text"
                                  value={optImg || ''}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    const imgs = [...(updated[qIdx].optionImages || [])];
                                    imgs[optIdx] = e.target.value;
                                    updated[qIdx].optionImages = imgs;
                                    setQuestions(updated);
                                  }}
                                  placeholder="Hoặc URL ảnh"
                                  className="w-28 px-1.5 py-1 rounded-lg border border-slate-200 text-[10px] bg-white text-slate-600"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. Nhiều đáp án đúng */}
                      {currentType === QuestionType.multipleChoice && (
                        <div className="space-y-2 pt-1">
                          <div className="flex justify-between items-center">
                            <label className="block text-[11px] font-bold text-purple-700">
                              Các phương án (Tích chọn ô vuông để chọn TẤT CẢ các đáp án đúng, có thể tải kèm ảnh):
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...questions];
                                const opts = updated[qIdx].options || [];
                                updated[qIdx].options = [...opts, `Phương án ${opts.length + 1}`];
                                setQuestions(updated);
                              }}
                              className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
                            >
                              + Thêm phương án
                            </button>
                          </div>
                          {(q.options || ['Phương án 1', 'Phương án 2']).map((opt, optIdx) => {
                            const correctList = q.correctAnswers || [Number(q.correctAnswer) || 0];
                            const isChecked = correctList.includes(optIdx);
                            const optImg = q.optionImages?.[optIdx];

                            return (
                              <div key={optIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    let list = updated[qIdx].correctAnswers ? [...updated[qIdx].correctAnswers!] : [0];
                                    if (e.target.checked) {
                                      list = Array.from(new Set([...list, optIdx]));
                                    } else {
                                      list = list.filter((i) => i !== optIdx);
                                    }
                                    updated[qIdx].correctAnswers = list;
                                    setQuestions(updated);
                                  }}
                                  className="w-4 h-4 text-purple-600 rounded cursor-pointer ml-1"
                                />

                                {/* Option Image Preview & Upload */}
                                {optImg ? (
                                  <div className="relative group shrink-0">
                                    <img
                                      src={optImg}
                                      alt={`Ảnh phương án ${optIdx + 1}`}
                                      className="w-9 h-9 object-cover rounded-lg border border-purple-400"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...questions];
                                        const imgs = [...(updated[qIdx].optionImages || [])];
                                        imgs[optIdx] = '';
                                        updated[qIdx].optionImages = imgs;
                                        setQuestions(updated);
                                      }}
                                      className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow cursor-pointer"
                                      title="Xóa ảnh phương án"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <label
                                    title="Tải ảnh cho phương án này từ máy tính"
                                    className="p-1.5 bg-white hover:bg-purple-50 text-slate-500 hover:text-purple-700 rounded-lg border border-slate-200 cursor-pointer flex items-center gap-1 text-[11px] font-bold shrink-0 transition"
                                  >
                                    <Upload className="w-3 h-3 text-purple-600" />
                                    <span>Tải ảnh</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleUploadImageFile(e, (dataUrl) => {
                                          const updated = [...questions];
                                          const imgs = [...(updated[qIdx].optionImages || [])];
                                          imgs[optIdx] = dataUrl;
                                          updated[qIdx].optionImages = imgs;
                                          setQuestions(updated);
                                        })
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                )}

                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    if (updated[qIdx].options) {
                                      updated[qIdx].options![optIdx] = e.target.value;
                                      setQuestions(updated);
                                    }
                                  }}
                                  placeholder={`Nội dung phương án ${optIdx + 1}`}
                                  className="flex-1 min-w-[140px] px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                                />

                                <input
                                  type="text"
                                  value={optImg || ''}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    const imgs = [...(updated[qIdx].optionImages || [])];
                                    imgs[optIdx] = e.target.value;
                                    updated[qIdx].optionImages = imgs;
                                    setQuestions(updated);
                                  }}
                                  placeholder="Hoặc URL ảnh"
                                  className="w-28 px-1.5 py-1 rounded-lg border border-slate-200 text-[10px] bg-white text-slate-600"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. Đúng – Sai */}
                      {(currentType === QuestionType.trueFalse || currentType === 'true_false' as any) && (
                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                          <label className="block text-[11px] font-bold text-emerald-900">
                            Đáp án đúng của nhận định này:
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-xs font-black text-emerald-800 cursor-pointer">
                              <input
                                type="radio"
                                name={`tf_${q.id}`}
                                checked={q.isTrue !== false}
                                onChange={() => {
                                  const updated = [...questions];
                                  updated[qIdx].isTrue = true;
                                  setQuestions(updated);
                                }}
                                className="w-4 h-4 text-emerald-600"
                              />
                              <span>🟢 ĐÚNG</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs font-black text-rose-800 cursor-pointer">
                              <input
                                type="radio"
                                name={`tf_${q.id}`}
                                checked={q.isTrue === false}
                                onChange={() => {
                                  const updated = [...questions];
                                  updated[qIdx].isTrue = false;
                                  setQuestions(updated);
                                }}
                                className="w-4 h-4 text-rose-600"
                              />
                              <span>🔴 SAI</span>
                            </label>
                          </div>

                          {/* Hình ảnh minh họa cho ĐÚNG / SAI */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60">
                            {/* True Image */}
                            <div className="p-2.5 bg-white rounded-xl border border-emerald-200 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
                                  <span>🟢</span> Ảnh minh họa đáp án ĐÚNG (Tùy chọn):
                                </span>
                                <label className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200 cursor-pointer flex items-center gap-1">
                                  <Upload className="w-2.5 h-2.5" />
                                  <span>Tải ảnh</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleUploadImageFile(e, (dataUrl) => {
                                        const updated = [...questions];
                                        updated[qIdx].trueImage = dataUrl;
                                        setQuestions(updated);
                                      })
                                    }
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                {q.trueImage ? (
                                  <div className="relative group shrink-0">
                                    <img src={q.trueImage} alt="True option" className="w-10 h-10 object-cover rounded-lg border border-emerald-400" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...questions];
                                        updated[qIdx].trueImage = undefined;
                                        setQuestions(updated);
                                      }}
                                      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center"
                                    >✕</button>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300 shrink-0">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                )}
                                <input
                                  type="text"
                                  value={q.trueImage || ''}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    updated[qIdx].trueImage = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  placeholder="Hoặc dán URL ảnh (https://...)"
                                  className="flex-1 px-2 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50"
                                />
                              </div>
                            </div>

                            {/* False Image */}
                            <div className="p-2.5 bg-white rounded-xl border border-rose-200 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-rose-800 flex items-center gap-1">
                                  <span>🔴</span> Ảnh minh họa đáp án SAI (Tùy chọn):
                                </span>
                                <label className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold border border-rose-200 cursor-pointer flex items-center gap-1">
                                  <Upload className="w-2.5 h-2.5" />
                                  <span>Tải ảnh</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleUploadImageFile(e, (dataUrl) => {
                                        const updated = [...questions];
                                        updated[qIdx].falseImage = dataUrl;
                                        setQuestions(updated);
                                      })
                                    }
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                {q.falseImage ? (
                                  <div className="relative group shrink-0">
                                    <img src={q.falseImage} alt="False option" className="w-10 h-10 object-cover rounded-lg border border-rose-400" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...questions];
                                        updated[qIdx].falseImage = undefined;
                                        setQuestions(updated);
                                      }}
                                      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center"
                                    >✕</button>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300 shrink-0">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                )}
                                <input
                                  type="text"
                                  value={q.falseImage || ''}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    updated[qIdx].falseImage = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  placeholder="Hoặc dán URL ảnh (https://...)"
                                  className="flex-1 px-2 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. Điền vào chỗ trống */}
                      {currentType === QuestionType.fillBlank && (
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Từ cần điền chính xác:</label>
                              <input
                                type="text"
                                value={q.correctText || ''}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[qIdx].correctText = e.target.value;
                                  setQuestions(updated);
                                }}
                                placeholder="Ví dụ: F"
                                className="w-full px-2.5 py-1 rounded-lg border border-amber-300 font-bold text-xs bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Ngân hàng từ gợi ý (cách nhau dấu phẩy):</label>
                              <input
                                type="text"
                                value={(q.wordBank || []).join(', ')}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[qIdx].wordBank = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                  setQuestions(updated);
                                }}
                                placeholder="F, A, Space, Enter"
                                className="w-full px-2.5 py-1 rounded-lg border border-amber-300 text-xs bg-white"
                              />
                            </div>
                          </div>

                          {/* Hình ảnh minh họa cho đáp án điền vào chỗ trống */}
                          <div className="p-2 bg-white rounded-xl border border-amber-200 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-amber-900 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-amber-600" />
                                <span>Hình ảnh gợi ý / minh họa đáp án điền (Tùy chọn):</span>
                              </span>
                              <label className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold border border-amber-200 cursor-pointer flex items-center gap-1">
                                <Upload className="w-2.5 h-2.5" />
                                <span>Tải ảnh từ máy</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleUploadImageFile(e, (dataUrl) => {
                                      const updated = [...questions];
                                      updated[qIdx].blankAnswerImage = dataUrl;
                                      setQuestions(updated);
                                    })
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              {q.blankAnswerImage ? (
                                <div className="relative group shrink-0">
                                  <img src={q.blankAnswerImage} alt="Gợi ý đáp án" className="w-10 h-10 object-cover rounded-lg border border-amber-400" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...questions];
                                      updated[qIdx].blankAnswerImage = undefined;
                                      setQuestions(updated);
                                    }}
                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center"
                                  >✕</button>
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300 shrink-0">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}
                              <input
                                type="text"
                                value={q.blankAnswerImage || ''}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[qIdx].blankAnswerImage = e.target.value;
                                  setQuestions(updated);
                                }}
                                placeholder="Hoặc dán URL ảnh minh họa đáp án (https://...)"
                                className="flex-1 px-2 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Đoạn văn trước ô trống:</label>
                              <input
                                type="text"
                                value={q.blankPromptPrefix || ''}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[qIdx].blankPromptPrefix = e.target.value;
                                  setQuestions(updated);
                                }}
                                placeholder="Ví dụ: Hai phím có gờ nổi là phím"
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Đoạn văn sau ô trống:</label>
                              <input
                                type="text"
                                value={q.blankPromptSuffix || ''}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[qIdx].blankPromptSuffix = e.target.value;
                                  setQuestions(updated);
                                }}
                                placeholder="Ví dụ: và phím J."
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 5. Ghép đôi */}
                      {currentType === QuestionType.matching && (
                        <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200 space-y-2.5">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[11px] font-black text-cyan-900">Danh sách các cặp ghép (Cột Trái ⟷ Cột Phải):</span>
                              <p className="text-[10px] text-cyan-700">Có thể tải hình ảnh cho cả Vế Trái và Vế Phải để tạo cặp ghép chữ-ảnh hoặc ảnh-ảnh sinh động.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...questions];
                                const pairs = updated[qIdx].pairs || [];
                                updated[qIdx].pairs = [...pairs, { id: 'p_' + Date.now(), left: 'Đối tượng mới', right: 'Mô tả tương ứng' }];
                                setQuestions(updated);
                              }}
                              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-[10px] font-black shrink-0 transition"
                            >
                              + Thêm cặp ghép
                            </button>
                          </div>

                          {(q.pairs || []).map((p, pIdx) => (
                            <div key={p.id || pIdx} className="p-2.5 bg-white rounded-xl border border-cyan-200 space-y-2 shadow-2xs">
                              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                                 {/* Vế Trái */}
                                <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
                                  {p.leftImage ? (
                                    <div className="relative group shrink-0">
                                      <img src={p.leftImage} alt="Left" className="w-8 h-8 object-cover rounded-lg border border-cyan-400" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...questions];
                                          if (updated[qIdx].pairs) updated[qIdx].pairs![pIdx].leftImage = undefined;
                                          setQuestions(updated);
                                        }}
                                        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center cursor-pointer"
                                        title="Xóa ảnh vế trái"
                                      >✕</button>
                                    </div>
                                  ) : (
                                    <label className="p-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg border border-cyan-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0">
                                      <Upload className="w-2.5 h-2.5" />
                                      <span>Ảnh Trái</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleUploadImageFile(e, (dataUrl) => {
                                            const updated = [...questions];
                                            if (updated[qIdx].pairs) updated[qIdx].pairs![pIdx].leftImage = dataUrl;
                                            setQuestions(updated);
                                          })
                                        }
                                        className="hidden"
                                      />
                                    </label>
                                  )}
                                  <input
                                    type="text"
                                    value={p.left}
                                    onChange={(e) => {
                                      const updated = [...questions];
                                      if (updated[qIdx].pairs) updated[qIdx].pairs![pIdx].left = e.target.value;
                                      setQuestions(updated);
                                    }}
                                    placeholder="Tên vế Trái"
                                    className="flex-1 min-w-[100px] px-2 py-1 rounded-lg border border-cyan-300 text-xs font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={p.leftImage || ''}
                                    onChange={(e) => {
                                      const updated = [...questions];
                                      if (updated[qIdx].pairs) updated[qIdx].pairs![pIdx].leftImage = e.target.value;
                                      setQuestions(updated);
                                    }}
                                    placeholder="URL ảnh Trái"
                                    className="w-24 px-1 py-1 rounded-lg border border-slate-200 text-[10px]"
                                  />
                                </div>

                                <span className="text-cyan-700 font-extrabold text-sm">⟷</span>

                                {/* Vế Phải */}
                                <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={p.right}
                                    onChange={(e) => {
                                      const updated = [...questions];
                                      if (updated[qIdx].pairs) updated[qIdx].pairs![pIdx].right = e.target.value;
                                      setQuestions(updated);
                                    }}
                                    placeholder="Nội dung vế Phải"
                                    className="flex-1 min-w-[100px] px-2 py-1 rounded-lg border border-cyan-300 text-xs"
                                  />
                                  {p.rightImage ? (
                                    <div className="relative group shrink-0">
                                      <img src={p.rightImage} alt="Right" className="w-8 h-8 object-cover rounded-lg border border-cyan-400" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...questions];
                                          if (updated[qIdx].pairs) updated[qIdx].pairs![pIdx].rightImage = undefined;
                                          setQuestions(updated);
                                        }}
                                        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center cursor-pointer"
                                        title="Xóa ảnh vế phải"
                                      >✕</button>
                                    </div>
                                  ) : (
                                    <label className="p-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg border border-cyan-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0">
                                      <Upload className="w-2.5 h-2.5" />
                                      <span>Ảnh Phải</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleUploadImageFile(e, (dataUrl) => {
                                            const updated = [...questions];
                                            if (updated[qIdx].pairs) updated[qIdx].pairs![pIdx].rightImage = dataUrl;
                                            setQuestions(updated);
                                          })
                                        }
                                        className="hidden"
                                      />
                                    </label>
                                  )}
                                  <input
                                    type="text"
                                    value={p.rightImage || ''}
                                    onChange={(e) => {
                                      const updated = [...questions];
                                      if (updated[qIdx].pairs) updated[qIdx].pairs![pIdx].rightImage = e.target.value;
                                      setQuestions(updated);
                                    }}
                                    placeholder="URL ảnh Phải"
                                    className="w-24 px-1 py-1 rounded-lg border border-slate-200 text-[10px]"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...questions];
                                    updated[qIdx].pairs = updated[qIdx].pairs?.filter((_, i) => i !== pIdx);
                                    setQuestions(updated);
                                  }}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                                  title="Xóa cặp ghép này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 6. Kéo thả phân loại */}
                      {(currentType === QuestionType.dragDrop || currentType === 'drag_drop' as any) && (
                        <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-rose-900 mb-0.5">
                              Tên các nhóm phân loại (cách nhau dấu phẩy):
                            </label>
                            <input
                              type="text"
                              value={(q.categories || []).join(', ')}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[qIdx].categories = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                setQuestions(updated);
                              }}
                              placeholder="Thiết bị Vào, Thiết bị Ra"
                              className="w-full px-2.5 py-1 rounded-lg border border-rose-300 text-xs font-bold bg-white"
                            />
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[10px] font-bold text-slate-700">Các mục cần kéo thả phân loại:</span>
                                <p className="text-[10px] text-slate-500">Có thể tải hình ảnh cho từng đối tượng cần phân loại.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...questions];
                                  const items = updated[qIdx].itemsToCategorize || [];
                                  const firstCat = updated[qIdx].categories?.[0] || 'Nhóm 1';
                                  updated[qIdx].itemsToCategorize = [...items, { id: 'it_' + Date.now(), text: 'Mục mới', category: firstCat }];
                                  setQuestions(updated);
                                }}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold"
                              >
                                + Thêm mục
                              </button>
                            </div>

                            {(q.itemsToCategorize || []).map((it, itIdx) => (
                              <div key={it.id || itIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 bg-white rounded-xl border border-rose-200 shadow-2xs">
                                {/* Thumbnail & Upload Button */}
                                {it.imageUrl ? (
                                  <div className="relative group shrink-0">
                                    <img src={it.imageUrl} alt={it.text} className="w-8 h-8 object-cover rounded-lg border border-rose-400" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...questions];
                                        if (updated[qIdx].itemsToCategorize) updated[qIdx].itemsToCategorize![itIdx].imageUrl = undefined;
                                        setQuestions(updated);
                                      }}
                                      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center"
                                      title="Xóa ảnh"
                                    >✕</button>
                                  </div>
                                ) : (
                                  <label className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0">
                                    <Upload className="w-2.5 h-2.5" />
                                    <span>Ảnh</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleUploadImageFile(e, (dataUrl) => {
                                          const updated = [...questions];
                                          if (updated[qIdx].itemsToCategorize) updated[qIdx].itemsToCategorize![itIdx].imageUrl = dataUrl;
                                          setQuestions(updated);
                                        })
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                )}

                                <input
                                  type="text"
                                  value={it.text}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    if (updated[qIdx].itemsToCategorize) updated[qIdx].itemsToCategorize![itIdx].text = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  placeholder="Tên mục"
                                  className="flex-1 px-2 py-1 rounded-lg border border-slate-300 text-xs font-medium"
                                />

                                <input
                                  type="text"
                                  value={it.imageUrl || ''}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    if (updated[qIdx].itemsToCategorize) updated[qIdx].itemsToCategorize![itIdx].imageUrl = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  placeholder="Hoặc URL ảnh"
                                  className="w-28 px-1.5 py-1 rounded-lg border border-slate-200 text-[10px]"
                                />

                                <select
                                  value={it.category}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    if (updated[qIdx].itemsToCategorize) updated[qIdx].itemsToCategorize![itIdx].category = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  className="px-2 py-1 rounded-lg border border-rose-300 text-xs font-bold text-rose-900 bg-white"
                                >
                                  {(q.categories || ['Nhóm 1', 'Nhóm 2']).map((c, cI) => (
                                    <option key={cI} value={c}>{c}</option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...questions];
                                    updated[qIdx].itemsToCategorize = updated[qIdx].itemsToCategorize?.filter((_, i) => i !== itIdx);
                                    setQuestions(updated);
                                  }}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 7. Sắp xếp thứ tự */}
                      {currentType === QuestionType.ordering && (
                        <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-200 space-y-2.5">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[11px] font-black text-violet-900">Các bước theo đúng thứ tự chuẩn từ trên xuống dưới:</span>
                              <p className="text-[10px] text-violet-700">Có thể tải ảnh minh họa cho từng bước thực hiện.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...questions];
                                const items = updated[qIdx].orderItems || [];
                                const newId = 'step_' + (items.length + 1);
                                const newItems = [...items, { id: newId, text: `Bước ${items.length + 1}` }];
                                updated[qIdx].orderItems = newItems;
                                updated[qIdx].correctOrder = newItems.map((o) => o.id);
                                setQuestions(updated);
                              }}
                              className="px-2 py-0.5 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-[10px] font-bold"
                            >
                              + Thêm bước
                            </button>
                          </div>
                          {(q.orderItems || []).map((step, sIdx) => (
                            <div key={step.id || sIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 bg-white rounded-xl border border-violet-200 shadow-2xs">
                              <span className="text-xs font-black text-violet-700 w-5 text-center">{sIdx + 1}.</span>

                              {/* Step Image */}
                              {step.imageUrl ? (
                                <div className="relative group shrink-0">
                                  <img src={step.imageUrl} alt={step.text} className="w-8 h-8 object-cover rounded-lg border border-violet-400" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...questions];
                                      if (updated[qIdx].orderItems) updated[qIdx].orderItems![sIdx].imageUrl = undefined;
                                      setQuestions(updated);
                                    }}
                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center"
                                    title="Xóa ảnh bước"
                                  >✕</button>
                                </div>
                              ) : (
                                <label className="p-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg border border-violet-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0">
                                  <Upload className="w-2.5 h-2.5" />
                                  <span>Ảnh</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleUploadImageFile(e, (dataUrl) => {
                                        const updated = [...questions];
                                        if (updated[qIdx].orderItems) updated[qIdx].orderItems![sIdx].imageUrl = dataUrl;
                                        setQuestions(updated);
                                      })
                                    }
                                    className="hidden"
                                  />
                                </label>
                              )}

                              <input
                                type="text"
                                value={step.text}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  if (updated[qIdx].orderItems) updated[qIdx].orderItems![sIdx].text = e.target.value;
                                  setQuestions(updated);
                                }}
                                className="flex-1 px-2.5 py-1 rounded-lg border border-violet-300 text-xs font-medium"
                              />

                              <input
                                type="text"
                                value={step.imageUrl || ''}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  if (updated[qIdx].orderItems) updated[qIdx].orderItems![sIdx].imageUrl = e.target.value;
                                  setQuestions(updated);
                                }}
                                placeholder="Hoặc URL ảnh"
                                className="w-28 px-1.5 py-1 rounded-lg border border-slate-200 text-[10px]"
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...questions];
                                  const filtered = updated[qIdx].orderItems?.filter((_, i) => i !== sIdx) || [];
                                  updated[qIdx].orderItems = filtered;
                                  updated[qIdx].correctOrder = filtered.map((o) => o.id);
                                  setQuestions(updated);
                                }}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 8. Chọn đáp án qua hình ảnh */}
                      {currentType === QuestionType.imageSelect && (
                        <div className="p-3 bg-fuchsia-50/50 rounded-xl border border-fuchsia-200 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black text-fuchsia-900">Các thẻ hình ảnh (Tích radio hình đúng):</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...questions];
                                const opts = updated[qIdx].imageOptions || [];
                                updated[qIdx].imageOptions = [...opts, { id: 'img_' + Date.now(), imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80', label: 'Hình mới', isCorrect: false }];
                                setQuestions(updated);
                              }}
                              className="text-[10px] font-bold text-fuchsia-700 hover:text-fuchsia-900"
                            >
                              + Thêm hình ảnh
                            </button>
                          </div>
                          {(q.imageOptions || []).map((img, iIdx) => (
                            <div key={img.id || iIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 bg-white rounded-xl border border-fuchsia-200 shadow-2xs">
                              <input
                                type="radio"
                                name={`img_correct_${q.id}`}
                                checked={img.isCorrect || q.correctAnswer === img.id}
                                onChange={() => {
                                  const updated = [...questions];
                                  if (updated[qIdx].imageOptions) {
                                    updated[qIdx].imageOptions = updated[qIdx].imageOptions!.map((im, idx) => ({
                                      ...im,
                                      isCorrect: idx === iIdx,
                                    }));
                                  }
                                  updated[qIdx].correctAnswer = img.id;
                                  setQuestions(updated);
                                }}
                                className="w-4 h-4 text-fuchsia-600 cursor-pointer"
                                title="Đánh dấu đây là hình đáp án ĐÚNG"
                              />

                              {/* Thumbnail preview */}
                              {img.imageUrl ? (
                                <img
                                  src={img.imageUrl}
                                  alt={img.label || 'Thumbnail'}
                                  className="w-10 h-10 object-cover rounded-lg border border-fuchsia-300 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs shrink-0 bg-slate-50">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}

                              {/* Upload Button */}
                              <label className="px-2 py-1 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 rounded-lg font-bold text-[11px] flex items-center gap-1 border border-fuchsia-200 cursor-pointer shrink-0 transition">
                                <Upload className="w-3 h-3 text-fuchsia-600" />
                                <span>Tải ảnh</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleUploadImageFile(e, (dataUrl) => {
                                      const updated = [...questions];
                                      if (updated[qIdx].imageOptions) {
                                        updated[qIdx].imageOptions![iIdx].imageUrl = dataUrl;
                                      }
                                      setQuestions(updated);
                                    })
                                  }
                                  className="hidden"
                                />
                              </label>

                              <input
                                type="text"
                                value={img.label || ''}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  if (updated[qIdx].imageOptions) updated[qIdx].imageOptions![iIdx].label = e.target.value;
                                  setQuestions(updated);
                                }}
                                placeholder="Nhãn tên hình (VD: Màn hình)"
                                className="w-32 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                              />
                              <input
                                type="text"
                                value={img.imageUrl}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  if (updated[qIdx].imageOptions) updated[qIdx].imageOptions![iIdx].imageUrl = e.target.value;
                                  setQuestions(updated);
                                }}
                                placeholder="Hoặc URL ảnh (https://...)"
                                className="flex-1 px-2 py-1 rounded-lg border border-slate-300 text-xs font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...questions];
                                  updated[qIdx].imageOptions = updated[qIdx].imageOptions?.filter((_, i) => i !== iIdx);
                                  setQuestions(updated);
                                }}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs transition"
                                title="Xóa hình này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 9. Tìm lỗi sai */}
                      {currentType === QuestionType.findError && (
                        <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 space-y-2">
                          <label className="block text-[10px] font-bold text-red-900 mb-0.5">Câu văn chứa lỗi sai:</label>
                          <input
                            type="text"
                            value={q.errorText || ''}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].errorText = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder="Ví dụ: Học sinh được phép vừa ăn bánh vừa gõ phím máy tính."
                            className="w-full px-2.5 py-1 rounded-lg border border-red-300 text-xs font-bold"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-red-900 mb-0.5">Từ ngữ SAI cần học sinh phát hiện:</label>
                              <input
                                type="text"
                                value={String(q.correctAnswer || '')}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[qIdx].correctAnswer = e.target.value;
                                  setQuestions(updated);
                                }}
                                placeholder="được phép"
                                className="w-full px-2.5 py-1 rounded-lg border border-red-300 text-xs font-black text-red-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-emerald-900 mb-0.5">Cách sửa lại cho đúng:</label>
                              <input
                                type="text"
                                value={q.correctCorrection || ''}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[qIdx].correctCorrection = e.target.value;
                                  setQuestions(updated);
                                }}
                                placeholder="KHÔNG ĐƯỢC PHÉP ăn uống..."
                                className="w-full px-2.5 py-1 rounded-lg border border-emerald-300 text-xs font-bold text-emerald-800"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 10. Trắc nghiệm tình huống */}
                      {currentType === QuestionType.scenario && (
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                          <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Mô tả bối cảnh tình huống thực tế:</label>
                          <textarea
                            rows={2}
                            value={q.scenarioContext || ''}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].scenarioContext = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder="Tình huống: Trong giờ thực hành..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 text-xs font-medium"
                          />
                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-slate-700">Các phương án ứng xử:</span>
                            {(q.options || ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D']).map((opt, optIdx) => {
                              const optImg = q.optionImages?.[optIdx];
                              return (
                                <div key={optIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 bg-white rounded-xl border border-amber-200">
                                  <input
                                    type="radio"
                                    name={`scen_${q.id}`}
                                    checked={Number(q.correctAnswer) === optIdx}
                                    onChange={() => {
                                      const updated = [...questions];
                                      updated[qIdx].correctAnswer = optIdx;
                                      setQuestions(updated);
                                    }}
                                    className="w-4 h-4 text-amber-600 cursor-pointer ml-1"
                                  />

                                  {/* Option Image */}
                                  {optImg ? (
                                    <div className="relative group shrink-0">
                                      <img src={optImg} alt={`Ảnh ${optIdx + 1}`} className="w-8 h-8 object-cover rounded-lg border border-amber-400" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...questions];
                                          const imgs = [...(updated[qIdx].optionImages || [])];
                                          imgs[optIdx] = '';
                                          updated[qIdx].optionImages = imgs;
                                          setQuestions(updated);
                                        }}
                                        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center"
                                        title="Xóa ảnh"
                                      >✕</button>
                                    </div>
                                  ) : (
                                    <label className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0">
                                      <Upload className="w-2.5 h-2.5" />
                                      <span>Ảnh</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleUploadImageFile(e, (dataUrl) => {
                                            const updated = [...questions];
                                            const imgs = [...(updated[qIdx].optionImages || [])];
                                            imgs[optIdx] = dataUrl;
                                            updated[qIdx].optionImages = imgs;
                                            setQuestions(updated);
                                          })
                                        }
                                        className="hidden"
                                      />
                                    </label>
                                  )}

                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const updated = [...questions];
                                      if (!updated[qIdx].options) {
                                        updated[qIdx].options = ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'];
                                      }
                                      updated[qIdx].options![optIdx] = e.target.value;
                                      setQuestions(updated);
                                    }}
                                    className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium"
                                  />

                                  <input
                                    type="text"
                                    value={optImg || ''}
                                    onChange={(e) => {
                                      const updated = [...questions];
                                      const imgs = [...(updated[qIdx].optionImages || [])];
                                      imgs[optIdx] = e.target.value;
                                      updated[qIdx].optionImages = imgs;
                                      setQuestions(updated);
                                    }}
                                    placeholder="Hoặc URL ảnh"
                                    className="w-24 px-1.5 py-1 rounded-lg border border-slate-200 text-[10px]"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 11. Chọn vị trí trên hình */}
                      {currentType === QuestionType.clickPosition && (
                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                          <div>
                            <label className="block text-[10px] font-bold text-emerald-900 mb-0.5">Tên bộ phận yêu cầu học sinh nhấp vào:</label>
                            <input
                              type="text"
                              value={q.targetAreaName || ''}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[qIdx].targetAreaName = e.target.value;
                                setQuestions(updated);
                              }}
                              placeholder="Ví dụ: Màn hình máy tính"
                              className="w-full px-2.5 py-1 rounded-lg border border-emerald-300 text-xs font-bold"
                            />
                          </div>

                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-700">Các điểm ghim (Hotspots x %, y %):</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...questions];
                                  const spots = updated[qIdx].clickHotspots || [];
                                  updated[qIdx].clickHotspots = [...spots, { id: 'sp_' + Date.now(), label: 'Điểm mới', x: 50, y: 50, isTarget: false }];
                                  setQuestions(updated);
                                }}
                                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900"
                              >
                                + Thêm điểm ghim
                              </button>
                            </div>

                            {(q.clickHotspots || []).map((spot, sIdx) => (
                              <div key={spot.id || sIdx} className="flex items-center gap-2">
                                <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                                  <input
                                    type="radio"
                                    name={`spot_target_${q.id}`}
                                    checked={spot.isTarget}
                                    onChange={() => {
                                      const updated = [...questions];
                                      if (updated[qIdx].clickHotspots) {
                                        updated[qIdx].clickHotspots = updated[qIdx].clickHotspots!.map((s, i) => ({
                                          ...s,
                                          isTarget: i === sIdx,
                                        }));
                                      }
                                      setQuestions(updated);
                                    }}
                                    className="w-4 h-4 text-emerald-600"
                                  />
                                  <span>Đúng</span>
                                </label>
                                <input
                                  type="text"
                                  value={spot.label}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    if (updated[qIdx].clickHotspots) updated[qIdx].clickHotspots![sIdx].label = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  placeholder="Nhãn điểm"
                                  className="w-28 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                                />
                                <span className="text-[11px] text-slate-500 font-bold">X:</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={spot.x}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    if (updated[qIdx].clickHotspots) updated[qIdx].clickHotspots![sIdx].x = Number(e.target.value);
                                    setQuestions(updated);
                                  }}
                                  className="w-16 px-1.5 py-1 rounded-lg border border-slate-300 text-xs text-center"
                                />
                                <span className="text-[11px] text-slate-500 font-bold">% Y:</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={spot.y}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    if (updated[qIdx].clickHotspots) updated[qIdx].clickHotspots![sIdx].y = Number(e.target.value);
                                    setQuestions(updated);
                                  }}
                                  className="w-16 px-1.5 py-1 rounded-lg border border-slate-300 text-xs text-center"
                                />
                                <span className="text-[11px] text-slate-500 font-bold">%</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...questions];
                                    updated[qIdx].clickHotspots = updated[qIdx].clickHotspots?.filter((_, i) => i !== sIdx);
                                    setQuestions(updated);
                                  }}
                                  className="text-rose-500 hover:text-rose-700 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 12. Trắc nghiệm qua âm thanh / video */}
                      {currentType === QuestionType.mediaBased && (
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-[11px] font-bold text-indigo-800">
                            Các phương án trả lời cho media (Tích tròn đáp án đúng):
                          </label>
                          {(q.options || ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D']).map((opt, optIdx) => {
                            const optImg = q.optionImages?.[optIdx];
                            return (
                              <div key={optIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 bg-white rounded-xl border border-indigo-200">
                                <input
                                  type="radio"
                                  name={`med_ans_${q.id}`}
                                  checked={Number(q.correctAnswer) === optIdx}
                                  onChange={() => {
                                    const updated = [...questions];
                                    updated[qIdx].correctAnswer = optIdx;
                                    setQuestions(updated);
                                  }}
                                  className="w-4 h-4 text-indigo-600 cursor-pointer ml-1"
                                />

                                {/* Option Image */}
                                {optImg ? (
                                  <div className="relative group shrink-0">
                                    <img src={optImg} alt={`Ảnh ${optIdx + 1}`} className="w-8 h-8 object-cover rounded-lg border border-indigo-400" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...questions];
                                        const imgs = [...(updated[qIdx].optionImages || [])];
                                        imgs[optIdx] = '';
                                        updated[qIdx].optionImages = imgs;
                                        setQuestions(updated);
                                      }}
                                      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center"
                                      title="Xóa ảnh"
                                    >✕</button>
                                  </div>
                                ) : (
                                  <label className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0">
                                    <Upload className="w-2.5 h-2.5" />
                                    <span>Ảnh</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleUploadImageFile(e, (dataUrl) => {
                                          const updated = [...questions];
                                          const imgs = [...(updated[qIdx].optionImages || [])];
                                          imgs[optIdx] = dataUrl;
                                          updated[qIdx].optionImages = imgs;
                                          setQuestions(updated);
                                        })
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                )}

                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    if (!updated[qIdx].options) {
                                      updated[qIdx].options = ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'];
                                    }
                                    updated[qIdx].options![optIdx] = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium"
                                />

                                <input
                                  type="text"
                                  value={optImg || ''}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    const imgs = [...(updated[qIdx].optionImages || [])];
                                    imgs[optIdx] = e.target.value;
                                    updated[qIdx].optionImages = imgs;
                                    setQuestions(updated);
                                  }}
                                  placeholder="Hoặc URL ảnh"
                                  className="w-24 px-1.5 py-1 rounded-lg border border-slate-200 text-[10px]"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Lời giải thích giúp học sinh hiểu sâu:</label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIdx].explanation = e.target.value;
                            setQuestions(updated);
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB E: KHỞI ĐỘNG & ROBOT AI */}
          {activeTab === 'warmup_ai' && (
            <div className="space-y-4">

              <div>
                <label className="block font-black text-slate-700 mb-1">Câu đố vui mở đầu:</label>
                <input
                  type="text"
                  value={riddleQuestion}
                  onChange={(e) => setRiddleQuestion(e.target.value)}
                  placeholder="Ví dụ: Đố em bạn nào..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">Gợi ý câu đố:</label>
                  <input
                    type="text"
                    value={riddleHint}
                    onChange={(e) => setRiddleHint(e.target.value)}
                    placeholder="Gợi ý nhỏ..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">Đáp án câu đố:</label>
                  <input
                    type="text"
                    value={riddleAnswer}
                    onChange={(e) => setRiddleAnswer(e.target.value)}
                    placeholder="Đáp án..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block font-black text-slate-700 mb-1">
                  Kiến thức trọng tâm Robot Tin Học AI được tham khảo (Mỗi dòng một ý):
                </label>
                <textarea
                  rows={3}
                  value={aiKeyTakeaways}
                  onChange={(e) => setAiKeyTakeaways(e.target.value)}
                  placeholder="Ý 1&#10;Ý 2&#10;Ý 3..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Lưu bản nháp, Xem trước, Xuất bản bài học */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
          >
            Hủy bỏ
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreviewCurrent}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-black text-xs rounded-xl transition"
            >
              <Eye className="w-4 h-4" />
              <span>Xem trước</span>
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs rounded-xl transition"
            >
              <Clock className="w-4 h-4" />
              <span>Lưu Bản Nháp</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Xuất Bản Bài Học 🚀</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
