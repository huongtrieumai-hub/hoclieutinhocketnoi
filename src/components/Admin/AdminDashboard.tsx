import React, { useState, useMemo } from 'react';
import { Lesson, Topic, StudentScoreRecord, GradeLevel, UserAccount } from '../../types';
import { StorageService } from '../../data/storage';
import { LessonEditorModal } from './LessonEditorModal';
import { StudentScoresView } from './StudentScoresView';
import { TeacherGuideModal } from './TeacherGuideModal';
import { StudentAccountsManager } from './StudentAccountsManager';
import { FirebaseAdminClaimsGuideModal } from './FirebaseAdminClaimsGuideModal';
import { CloudinaryMediaUploader } from '../CloudinaryMediaUploader';
import { TopicManager } from './TopicManager';
import { BannerSettingsManager } from './BannerSettingsManager';
import { BannerConfig } from '../../types';
import {
  BookOpen,
  Plus,
  Edit3,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  UploadCloud,
  RefreshCcw,
  HelpCircle,
  LogOut,
  Trophy,
  CheckCircle2,
  Layers,
  Sparkles,
  Eye,
  Search,
  Video,
  FileText,
  Gamepad2,
  Clock,
  Database,
  ExternalLink,
  Users,
  GraduationCap,
  ShieldCheck,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  lessons: Lesson[];
  topics: Topic[];
  currentUser?: UserAccount | null;
  bannerConfig: BannerConfig;
  onSaveBannerConfig: (config: BannerConfig) => void;
  onRefreshData: () => void;
  onExitAdmin: () => void;
  onPreviewLesson: (lesson: Lesson) => void;
}

export const AdminDashboard: React.FC<Props> = ({
  lessons,
  topics,
  currentUser,
  bannerConfig,
  onSaveBannerConfig,
  onRefreshData,
  onExitAdmin,
  onPreviewLesson,
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'topics' | 'scores' | 'accounts' | 'backup' | 'cloudinary' | 'banner'>('lessons');
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'all'>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isClaimsGuideOpen, setIsClaimsGuideOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Student scores
  const [scores, setScores] = useState<StudentScoreRecord[]>(() => StorageService.getScores());

  // Filter topics based on grade
  const currentTopics = useMemo(() => {
    if (filterGrade === 'all') return topics;
    return topics.filter((t) => t.grade === filterGrade);
  }, [topics, filterGrade]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons
      .filter((l) => filterGrade === 'all' || l.grade === filterGrade)
      .filter((l) => filterTopic === 'all' || l.topicId === filterTopic)
      .filter((l) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q)) ||
          (l.period && l.period.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (a.grade === b.grade ? a.order - b.order : a.grade - b.grade));
  }, [lessons, filterGrade, filterTopic, searchTerm]);

  // Lesson actions
  const handleOpenCreateModal = () => {
    setEditingLesson(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsEditorOpen(true);
  };

  const handleDuplicateLesson = (lesson: Lesson) => {
    const duplicated = StorageService.duplicateLesson(lesson.id);
    if (duplicated) {
      onRefreshData();
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const handleSaveLesson = (savedLesson: Lesson, mode: 'publish' | 'draft') => {
    StorageService.saveLesson(savedLesson);
    setIsEditorOpen(false);
    onRefreshData();
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleDeleteLesson = async (id: string) => {
    setIsDeletingLesson(true);
    try {
      await StorageService.deleteLesson(id);
      setDeleteConfirmId(null);
      onRefreshData();
      setToastMessage('Đã xóa bài giảng thành công khỏi hệ thống!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('[Admin] Lỗi khi xóa bài học:', err);
      setDeleteConfirmId(null);
      onRefreshData();
      setToastMessage('Đã xóa bài giảng khỏi thiết bị!');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsDeletingLesson(false);
    }
  };

  const handleMoveOrder = (lesson: Lesson, direction: 'up' | 'down') => {
    const gradeLessons = lessons.filter((l) => l.grade === lesson.grade).sort((a, b) => a.order - b.order);
    const currentIndex = gradeLessons.findIndex((l) => l.id === lesson.id);
    if (direction === 'up' && currentIndex > 0) {
      const prev = gradeLessons[currentIndex - 1];
      const tempOrder = lesson.order;
      lesson.order = prev.order;
      prev.order = tempOrder;
      StorageService.saveLesson(lesson);
      StorageService.saveLesson(prev);
      onRefreshData();
    } else if (direction === 'down' && currentIndex < gradeLessons.length - 1) {
      const next = gradeLessons[currentIndex + 1];
      const tempOrder = lesson.order;
      lesson.order = next.order;
      next.order = tempOrder;
      StorageService.saveLesson(lesson);
      StorageService.saveLesson(next);
      onRefreshData();
    }
  };

  // JSON Export & Import
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HocLieuTinHoc_KetNoiTriThuc_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = StorageService.importBackupData(content, mode);
        alert(result.message);
        if (result.success) {
          onRefreshData();
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToDefault = () => {
    if (confirm('Thầy cô có chắc chắn muốn khôi phục lại dữ liệu mẫu gốc SGK? Các bài mới tạo sẽ được đưa về dữ liệu chuẩn ban đầu.')) {
      StorageService.resetToDefaultMockData();
      onRefreshData();
      alert('Đã khôi phục dữ liệu mẫu gốc thành công!');
    }
  };

  // Stats
  const publishedCount = lessons.filter((l) => l.isPublished !== false).length;
  const draftCount = lessons.filter((l) => l.isPublished === false || l.status === 'draft').length;

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white shadow-lg border-b-4 border-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-400 text-slate-900 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md">
                🎓
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-md">
                  HỆ THỐNG QUẢN LÝ HỌC LIỆU SỐ
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Quản Trị Bài Giảng Tin Học Lớp 3, 4, 5
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bộ sách Kết nối tri thức với cuộc sống • Dành cho Giáo viên &amp; Nhà trường
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentUser && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs">
                  <span className="text-amber-300 font-bold">
                    👤 {currentUser.fullName} {currentUser.email ? `(${currentUser.email})` : `@${currentUser.username}`}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{currentUser.customClaims?.admin ? 'Custom Claims: ADMIN (Xác thực máy chủ)' : 'Quyền Quản Trị'}</span>
                  </span>
                </div>
              )}

              <button
                onClick={() => setIsClaimsGuideOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition cursor-pointer"
                title="Hướng dẫn phân quyền Firebase Custom Claims"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Phân Quyền Firebase &amp; Claims</span>
              </button>

              <button
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow transition cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Hướng Dẫn Soạn Bài</span>
              </button>

              <button
                onClick={onExitAdmin}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black border border-slate-700 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Quay lại giao diện Học sinh</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Renamed to Quản trị bài giảng Tin học) */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto text-xs font-black scrollbar-none">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'lessons'
                  ? 'bg-amber-400 text-slate-900 shadow-md scale-102'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Quản trị bài giảng Tin học ({lessons.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'topics'
                  ? 'bg-amber-400 text-slate-900 shadow-md scale-102'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>Quản Lý 6 Chủ Đề SGK ({topics.length}) 📁</span>
            </button>


            <button
              onClick={() => {
                setScores(StorageService.getScores());
                setActiveTab('scores');
              }}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'scores'
                  ? 'bg-amber-400 text-slate-900 shadow-md scale-102'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Kết Quả Học Tập &amp; Bảng Điểm</span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-amber-400 text-slate-900 shadow-md scale-102'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-cyan-300" />
              <span>Quản Lý Học Sinh &amp; Danh Sách Lớp 🎒</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'backup'
                  ? 'bg-amber-400 text-slate-900 shadow-md scale-102'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Sao Lưu &amp; Khôi Phục (JSON)</span>
            </button>

            <button
              onClick={() => setActiveTab('cloudinary')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'cloudinary'
                  ? 'bg-amber-400 text-slate-900 shadow-md scale-102'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-cyan-300" />
              <span>Lưu Trữ Đám Mây Cloudinary ☁️</span>
            </button>

            <button
              onClick={() => setActiveTab('banner')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'banner'
                  ? 'bg-amber-400 text-slate-900 shadow-md scale-102'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-rose-300" />
              <span>Cài Đặt Banner Web 🖼️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* TAB 1: QUẢN TRỊ BÀI GIẢNG TIN HỌC */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {/* Quick Stats overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase">TỔNG SỐ BÀI GIẢNG</span>
                <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">{lessons.length} bài</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase">ĐÃ XUẤT BẢN</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{publishedCount} bài</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase">BẢN NHÁP</span>
                <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{draftCount} bài</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase">LƯỢT THỰC HÀNH</span>
                <div className="text-xl sm:text-2xl font-black text-purple-600 mt-1">{scores.length} lượt</div>
              </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Search bar */}
                <div className="relative flex-1 min-w-[260px]">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm bài học theo tên, tiết học, chủ đề..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                {/* Button: Soạn bài học mới */}
                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md transition hover:scale-103 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Soạn bài học mới 🚀</span>
                </button>
              </div>

              {/* Filters for Grade and Topic */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs font-bold">
                {/* Grade Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-black">Khối:</span>
                  <div className="flex gap-1">
                    {(['all', 3, 4, 5] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setFilterGrade(g);
                          setFilterTopic('all');
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                          filterGrade === g
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {g === 'all' ? 'Tất cả lớp' : `Lớp ${g}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic Filter */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-slate-500 font-black">Chủ đề:</span>
                  <select
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                    className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none max-w-xs"
                  >
                    <option value="all">Tất cả chủ đề</option>
                    {currentTopics.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Lessons Table / List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-16">Thứ tự</th>
                      <th className="py-3 px-4 w-28">Khối &amp; Tiết</th>
                      <th className="py-3 px-4">Tên bài học</th>
                      <th className="py-3 px-4">Chủ đề SGK</th>
                      <th className="py-3 px-4">Học liệu tích hợp</th>
                      <th className="py-3 px-4 w-24">Trạng thái</th>
                      <th className="py-3 px-4 text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                    {filteredLessons.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                          Không tìm thấy bài giảng nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredLessons.map((lesson, idx) => {
                        const topic = topics.find((t) => t.id === lesson.topicId);
                        const isDraft = lesson.isPublished === false || lesson.status === 'draft';

                        return (
                          <tr key={lesson.id} className="hover:bg-amber-50/40 transition">
                            <td className="py-3 px-4 text-slate-400">
                              <div className="flex items-center gap-1">
                                <span>#{lesson.order || idx + 1}</span>
                                <div className="flex flex-col">
                                  <button
                                    onClick={() => handleMoveOrder(lesson, 'up')}
                                    className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                                    title="Đẩy lên trên"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveOrder(lesson, 'down')}
                                    className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                                    title="Đẩy xuống dưới"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-black w-fit">
                                  Lớp {lesson.grade}
                                </span>
                                {lesson.period && (
                                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" /> {lesson.period}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-black text-slate-900 text-sm">{lesson.title}</div>
                              {lesson.description && (
                                <div className="text-[11px] text-slate-400 font-normal line-clamp-1">
                                  {lesson.description}
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4 text-indigo-700 font-bold">
                              {topic?.name || 'Chủ đề 1: Máy tính và em'}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 text-[10px]">
                                {lesson.materials && lesson.materials.length > 0 && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                    <Video className="w-3 h-3" /> {lesson.materials.length} học liệu
                                  </span>
                                )}
                                {lesson.interactiveSimulations && lesson.interactiveSimulations.length > 0 && (
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                    <Gamepad2 className="w-3 h-3" /> {lesson.interactiveSimulations.length} mô phỏng
                                  </span>
                                )}
                                {lesson.mindMapImages && lesson.mindMapImages.length > 0 && (
                                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                                    🌳 {lesson.mindMapImages.length} ảnh sơ đồ
                                  </span>
                                )}
                                {lesson.externalGames && lesson.externalGames.length > 0 && (
                                  <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                                    🎯 {lesson.externalGames.length} trò chơi trực tuyến
                                  </span>
                                )}
                                {lesson.section5Games?.questions && lesson.section5Games.questions.length > 0 && (
                                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                    <span>❓</span> {lesson.section5Games.questions.length} câu hỏi (12 dạng)
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              {isDraft ? (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-black">
                                  Bản nháp
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black">
                                  Đã xuất bản
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => onPreviewLesson(lesson)}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition cursor-pointer"
                                  title="Xem trước bài giảng"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(lesson)}
                                  className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition cursor-pointer"
                                  title="Chỉnh sửa bài giảng"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateLesson(lesson)}
                                  className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition cursor-pointer"
                                  title="Sao chép (Nhân bản) bài học"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(lesson.id)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                                  title="Xóa bài giảng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Storage Architecture & Clarification Banner */}
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-2 font-black text-sm text-blue-950">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Thông tin Quản lý và Lưu trữ Dữ liệu:</span>
              </div>
              <p className="leading-relaxed">
                • <strong>Hiện tại:</strong> Dữ liệu bài học, hình ảnh tải lên (Data URL) và kết quả học tập được lưu trữ bền vững trong bộ nhớ ứng dụng của trình duyệt (LocalStorage).
              </p>
              <p className="leading-relaxed">
                • <strong>An toàn dữ liệu:</strong> Thầy cô nên định kỳ nhấn tab <strong>"Sao Lưu &amp; Khôi Phục (JSON)"</strong> để tải tệp sao lưu `.json` về máy tính. Khi chuyển máy tính, chỉ cần nạp lại tệp là có đầy đủ toàn bộ bài giảng.
              </p>
              <p className="leading-relaxed">
                • <strong>Kết nối Cơ sở dữ liệu đám mây (Cloud Database):</strong> Để lưu trữ vĩnh viễn trên máy chủ dùng chung cho toàn trường (Firebase / Supabase / Cloud SQL), hệ thống đã có cấu trúc dữ liệu JSON chuẩn hóa, sẵn sàng đồng bộ ngay khi kích hoạt dịch vụ đám mây.
              </p>
            </div>
          </div>
        )}

        {/* TAB: QUẢN LÝ CÁC CHỦ ĐỀ SGK (6 CHỦ ĐỀ) */}
        {activeTab === 'topics' && (
          <TopicManager
            topics={topics}
            lessons={lessons}
            onRefreshData={onRefreshData}
          />
        )}


        {/* TAB 3: SCORES VIEW */}
        {activeTab === 'scores' && <StudentScoresView scores={scores} />}

        {/* TAB 3: BACKUP & RESTORE JSON */}
        {activeTab === 'backup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Card */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-2xl">
                  📥
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Xuất Sao Lưu Dữ Liệu Học Liệu (JSON)
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Tải về toàn bộ bài học, tài liệu, mô phỏng và câu hỏi
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tệp JSON chứa toàn bộ dữ liệu {lessons.length} bài học hiện có trên ứng dụng. Thầy cô có thể chia sẻ tệp này cho các đồng nghiệp hoặc lưu trữ dự phòng.
              </p>
              <button
                onClick={handleExportJSON}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Tệp Sao Lưu Về Máy Tính (.json)</span>
              </button>
            </div>

            {/* Import Card */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl">
                  📤
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Nhập Dữ Liệu Học Liệu Từ Máy Tính
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Thêm bài giảng từ tệp JSON mà không bao giờ làm mất dữ liệu cũ
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hỗ trợ 2 chế độ nhập: <strong>Gộp dữ liệu</strong> (khuyên dùng - giữ nguyên bài cũ, chỉ thêm bài mới) hoặc <strong>Thay thế toàn bộ</strong>.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700">
                  Chế độ 1: Gộp học liệu (Không mất bài cũ)
                </label>
                <label className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Chọn tệp JSON để Gộp dữ liệu</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleImportJSON(e, 'merge')}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleResetToDefault}
                  className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục về dữ liệu mẫu gốc ban đầu</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUẢN LÝ HỌC SINH & LỚP HỌC */}
        {activeTab === 'accounts' && (
          <StudentAccountsManager currentUser={currentUser || null} />
        )}

        {/* TAB 5: LƯU TRỮ ĐÁM MÂY CLOUDINARY */}
        {activeTab === 'cloudinary' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-2xl shadow-md">
                ☁️
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  LƯU TRỮ ĐÁM MÂY CLOUDINARY
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Dự án Cloud Name: <span className="text-blue-600 font-mono">onjpako3</span> | Upload Preset: <span className="text-emerald-600 font-mono">ml_default</span>
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-xs font-semibold text-blue-900 leading-relaxed">
              💡 <strong>Hướng dẫn lưu trữ tệp:</strong> Mọi tệp Hình ảnh (PNG, JPG, WEBP, GIF, SVG) và Âm thanh (MP3, WAV, AAC, M4A) được chọn tải lên từ máy tính của Thầy/Cô sẽ được tải trực tiếp lên đám mây <strong>Cloudinary CDN (`onjpako3`)</strong> và trả về liên kết HTTPS vĩnh viễn. Thầy/Cô có thể dễ dàng sao chép liên kết để chèn vào bài học, sơ đồ tư duy hoặc âm thanh minh họa!
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CloudinaryMediaUploader
                acceptType="image"
                label="1. Tải Tệp Hình Ảnh Từ Máy Tính Lên Cloudinary"
              />

              <CloudinaryMediaUploader
                acceptType="audio"
                label="2. Tải Tệp Âm Thanh / Giọng Nói Từ Máy Tính Lên Cloudinary"
              />
            </div>
          </div>
        )}

        {/* TAB 6: CÀI ĐẶT BANNER WEB APP */}
        {activeTab === 'banner' && (
          <BannerSettingsManager
            bannerConfig={bannerConfig}
            onSaveBannerConfig={onSaveBannerConfig}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (() => {
        const targetLesson = lessons.find((l) => l.id === deleteConfirmId);
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-rose-300 animate-in fade-in zoom-in-95 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black text-slate-800">Xác Nhận Xóa Bài Giảng?</h4>
              {targetLesson && (
                <div className="my-2 p-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-black text-rose-900 line-clamp-2">
                  {targetLesson.title}
                </div>
              )}
              <p className="text-xs text-slate-500 my-2">
                Thầy cô có chắc chắn muốn xóa bài học này khỏi hệ thống không? Dữ liệu sẽ được xóa hoàn toàn trên cả thiết bị và đám mây.
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  disabled={isDeletingLesson}
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeletingLesson}
                  onClick={() => handleDeleteLesson(deleteConfirmId)}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isDeletingLesson ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <span>Xác Nhận Xóa</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Success Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Lesson Editor Modal */}
      <LessonEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveLesson}
        onPreview={(lesson) => {
          setIsEditorOpen(false);
          onPreviewLesson(lesson);
        }}
        initialLesson={editingLesson}
        topics={topics}
      />

      {/* Teacher Guide Modal */}
      <TeacherGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Firebase Custom Claims & Security Guide Modal */}
      <FirebaseAdminClaimsGuideModal
        isOpen={isClaimsGuideOpen}
        onClose={() => setIsClaimsGuideOpen(false)}
      />
    </div>
  );
};
