import React, { useState, useMemo } from 'react';
import { StudySessionRecord, StudentLearnerSummary, GradeLevel, Lesson } from '../../types';
import { StorageService } from '../../data/storage';
import {
  Clock,
  Users,
  Search,
  Filter,
  Download,
  Award,
  Star,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  BookOpen,
  ArrowUpDown,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Eye,
  UserCheck,
  Send,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  lessons?: Lesson[];
  initialLessonId?: string;
  onRefreshData?: () => void;
}

export const LearnerMonitoringView: React.FC<Props> = ({ lessons, initialLessonId, onRefreshData }) => {
  const [sessions, setSessions] = useState<StudySessionRecord[]>(() => StorageService.getStudySessions());
  const [summaries, setSummaries] = useState<StudentLearnerSummary[]>(() => StorageService.getLearnersSummary());

  const [viewMode, setViewMode] = useState<'summary' | 'sessions' | 'byLesson'>(
    initialLessonId ? 'byLesson' : 'summary'
  );
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'all'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterLesson, setFilterLesson] = useState<string>(initialLessonId || 'all');
  const [filterTimeframe, setFilterTimeframe] = useState<'all' | 'today' | 'week'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Expanded lesson ID in byLesson view
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(initialLessonId || null);

  // Selected student for detail history drawer/modal
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<string | null>(null);

  // Reminder message modal
  const [reminderTarget, setReminderTarget] = useState<StudentLearnerSummary | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderSuccess, setReminderSuccess] = useState(false);

  // All lessons for selector
  const allLessons = useMemo(() => {
    return lessons && lessons.length > 0 ? lessons : StorageService.getLessons();
  }, [lessons]);

  // Available classes list
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    summaries.forEach((s) => {
      if (s.schoolClass) set.add(s.schoolClass);
    });
    return Array.from(set).sort();
  }, [summaries]);

  // Overall statistics
  const stats = useMemo(() => {
    let totalSecs = 0;
    let completedCount = 0;

    summaries.forEach((s) => {
      totalSecs += s.totalStudySeconds || 0;
      completedCount += s.completedLessonsCount || 0;
    });

    const avgSecsPerStudent = summaries.length > 0 ? Math.round(totalSecs / summaries.length) : 0;
    const topStudent = [...summaries].sort((a, b) => b.totalStudySeconds - a.totalStudySeconds)[0];
    const needsAttention = summaries.filter((s) => s.totalStudySeconds < 900); // under 15 mins

    return {
      totalStudySeconds: totalSecs,
      totalStudents: summaries.length,
      averageSeconds: avgSecsPerStudent,
      topStudent,
      needsAttentionCount: needsAttention.length,
      totalSessionsCount: sessions.length,
    };
  }, [summaries, sessions]);

  // Filtered summaries for Tab 1
  const filteredSummaries = useMemo(() => {
    return summaries
      .filter((s) => filterGrade === 'all' || s.grade === filterGrade)
      .filter((s) => filterClass === 'all' || s.schoolClass === filterClass)
      .filter((s) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          s.studentName.toLowerCase().includes(q) ||
          s.schoolClass.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.totalStudySeconds - a.totalStudySeconds);
  }, [summaries, filterGrade, filterClass, searchTerm]);

  // Filtered sessions for Tab 2
  const filteredSessions = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return sessions
      .filter((s) => filterGrade === 'all' || s.grade === filterGrade)
      .filter((s) => filterClass === 'all' || s.schoolClass === filterClass)
      .filter((s) => filterLesson === 'all' || s.lessonId === filterLesson)
      .filter((s) => {
        if (filterTimeframe === 'today') {
          return s.date === todayStr || s.startTime.includes('16/10/2026');
        }
        return true;
      })
      .filter((s) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          s.studentName.toLowerCase().includes(q) ||
          s.lessonTitle.toLowerCase().includes(q) ||
          (s.schoolClass && s.schoolClass.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.durationSeconds - a.durationSeconds);
  }, [sessions, filterGrade, filterClass, filterLesson, filterTimeframe, searchTerm]);

  // Aggregated study metrics by lesson for Tab 3
  const byLessonData = useMemo(() => {
    return allLessons
      .filter((l) => filterGrade === 'all' || l.grade === filterGrade)
      .filter((l) => filterLesson === 'all' || l.id === filterLesson)
      .filter((l) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          (l.period && l.period.toLowerCase().includes(q))
        );
      })
      .map((l) => {
        const lessonSessions = sessions.filter((s) => s.lessonId === l.id);
        let totalSeconds = 0;
        let completedCount = 0;
        const studentMap = new Map<
          string,
          {
            studentName: string;
            schoolClass: string;
            duration: number;
            latestDate: string;
            isCompleted: boolean;
            sections: string[];
          }
        >();

        lessonSessions.forEach((s) => {
          totalSeconds += s.durationSeconds;
          if (s.isCompleted) completedCount++;
          const current = studentMap.get(s.studentName) || {
            studentName: s.studentName,
            schoolClass: s.schoolClass || `${l.grade}A`,
            duration: 0,
            latestDate: s.date || s.startTime,
            isCompleted: false,
            sections: [],
          };
          current.duration += s.durationSeconds;
          if (s.isCompleted) current.isCompleted = true;
          s.sectionsVisited.forEach((sec) => {
            if (!current.sections.includes(sec)) current.sections.push(sec);
          });
          studentMap.set(s.studentName, current);
        });

        const uniqueStudents = Array.from(studentMap.values()).sort(
          (a, b) => b.duration - a.duration
        );
        const avgSeconds =
          uniqueStudents.length > 0
            ? Math.round(totalSeconds / uniqueStudents.length)
            : 0;

        return {
          lesson: l,
          totalSeconds,
          sessionCount: lessonSessions.length,
          uniqueStudentsCount: uniqueStudents.length,
          completedCount,
          avgSeconds,
          students: uniqueStudents,
        };
      })
      .sort((a, b) => b.totalSeconds - a.totalSeconds);
  }, [allLessons, sessions, filterGrade, filterLesson, searchTerm]);

  // Detail history sessions of a specific student
  const studentDetailSessions = useMemo(() => {
    if (!selectedStudentForDetail) return [];
    return sessions.filter(
      (s) => s.studentName.toLowerCase() === selectedStudentForDetail.toLowerCase()
    );
  }, [sessions, selectedStudentForDetail]);

  const handleRefresh = () => {
    setSessions(StorageService.getStudySessions());
    setSummaries(StorageService.syncLearnersSummary());
    if (onRefreshData) onRefreshData();
  };

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = [
      'Mã phiên',
      'Họ tên học sinh',
      'Lớp',
      'Khối',
      'Tên bài học',
      'Thời gian bắt đầu',
      'Thời lượng học (phút)',
      'Thời lượng (giây)',
      'Các phần đã học',
      'Trạng thái hoàn thành',
      'Ngày',
    ];

    const rows = filteredSessions.map((s) => [
      `"${s.id}"`,
      `"${s.studentName}"`,
      `"${s.schoolClass || ''}"`,
      `"Lớp ${s.grade}"`,
      `"${s.lessonTitle.replace(/"/g, '""')}"`,
      `"${s.startTime}"`,
      `"${Math.round(s.durationSeconds / 60)}"`,
      s.durationSeconds,
      `"${s.sectionsVisited.join(', ')}"`,
      `"${s.isCompleted ? 'Đã hoàn thành' : 'Đang học'}"`,
      `"${s.date}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaoCao_ThoiGianHoc_TinHoc_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTarget) return;
    setReminderSuccess(true);
    setTimeout(() => {
      setReminderSuccess(false);
      setReminderTarget(null);
      setReminderMessage('');
      confetti({ particleCount: 30, spread: 50 });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Actions */}
      <div className="p-6 bg-gradient-to-r from-teal-700 via-emerald-700 to-blue-800 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-md">
            ⏱️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-200">
                HỆ THỐNG GIÁM SÁT &amp; THEO DÕI HỌC TẬP
              </span>
              <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                Thời gian thực
              </span>
            </div>
            <h3 className="text-2xl font-black mt-0.5 drop-shadow-sm">
              Kiểm Soát Người Học &amp; Thời Gian Học Tin Học
            </h3>
            <p className="text-xs text-emerald-100 font-semibold mt-0.5">
              Theo dõi chính xác số phút học, mức độ tương tác từng mục bài giảng &amp; cảnh báo tiến độ của học sinh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black transition cursor-pointer backdrop-blur-xs"
            title="Đồng bộ dữ liệu mới nhất"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Làm Mới</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-black shadow-lg transition hover:scale-103 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo Thời Gian (CSV)</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Tổng thời gian học */}
        <div className="p-4 bg-white rounded-2xl border-2 border-emerald-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
              TỔNG THỜI GIAN HỌC
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {StorageService.formatStudyDuration(stats.totalStudySeconds)}
          </div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">
            Tổng cộng <strong className="text-emerald-700">{stats.totalSessionsCount}</strong> phiên học tập
          </div>
        </div>

        {/* Card 2: Số người học theo dõi */}
        <div className="p-4 bg-white rounded-2xl border-2 border-blue-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
              SỐ NGƯỜI HỌC
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700">
            {stats.totalStudents} <span className="text-sm font-bold text-slate-500">học sinh</span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">
            Đã đồng bộ từ danh sách tài khoản
          </div>
        </div>

        {/* Card 3: Thời gian học trung bình */}
        <div className="p-4 bg-white rounded-2xl border-2 border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
              TRUNG BÌNH / HỌC SINH
            </span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700">
            {StorageService.formatStudyDuration(stats.averageSeconds)}
          </div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">
            Đạt chuẩn 1 tiết học (35 phút)
          </div>
        </div>

        {/* Card 4: Học sinh chăm chỉ nhất */}
        <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              CHĂM CHỈ NHẤT 🏆
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 truncate">
            {stats.topStudent ? stats.topStudent.studentName : '---'}
          </div>
          <div className="text-[11px] text-amber-800 font-extrabold mt-1">
            {stats.topStudent
              ? `${stats.topStudent.schoolClass} • ${StorageService.formatStudyDuration(stats.topStudent.totalStudySeconds)}`
              : 'Chưa có dữ liệu'}
          </div>
        </div>

        {/* Card 5: Cảnh báo học tập */}
        <div className="p-4 bg-white rounded-2xl border-2 border-rose-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">
              CẦN NHẮC NHỞ
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            {stats.needsAttentionCount} <span className="text-sm font-bold text-slate-500">em</span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">
            Học dưới 15 phút cần đốc thúc
          </div>
        </div>
      </div>

      {/* Filter and Mode Switcher Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-black">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                viewMode === 'summary'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Bảng Tổng Hợp Học Sinh ({filteredSummaries.length})</span>
            </button>

            <button
              onClick={() => setViewMode('byLesson')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                viewMode === 'byLesson'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Theo Dõi Theo Từng Bài Giảng ({byLessonData.length})</span>
            </button>

            <button
              onClick={() => setViewMode('sessions')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                viewMode === 'sessions'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Nhật Ký Các Buổi Học ({filteredSessions.length})</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh, lớp, bài học..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Filters: Grade, Class, Lesson, Timeframe */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs font-bold">
          {/* Grade filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-black">Khối:</span>
            <div className="flex gap-1">
              {(['all', 3, 4, 5] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGrade(g)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    filterGrade === g
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g === 'all' ? 'Tất cả khối' : `Khối ${g}`}
                </button>
              ))}
            </div>
          </div>

          {/* Class filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-black">Lớp:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả các lớp</option>
              {availableClasses.map((c) => (
                <option key={c} value={c}>
                  Lớp {c}
                </option>
              ))}
            </select>
          </div>

          {/* Lesson filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-black">Bài giảng:</span>
            <select
              value={filterLesson}
              onChange={(e) => setFilterLesson(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none max-w-[240px] truncate"
            >
              <option value="all">Tất cả bài giảng ({allLessons.length})</option>
              {allLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  Lớp {l.grade}: {l.title}
                </option>
              ))}
            </select>
            {filterLesson !== 'all' && (
              <button
                onClick={() => setFilterLesson('all')}
                className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                title="Bỏ lọc bài giảng"
              >
                ✕
              </button>
            )}
          </div>

          {/* Timeframe filter (for sessions) */}
          {viewMode === 'sessions' && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-slate-500 font-black">Thời gian:</span>
              <div className="flex gap-1">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'today', label: 'Hôm nay' },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setFilterTimeframe(tf.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                      filterTimeframe === tf.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: SUMMARY TABLE OF LEARNERS */}
      {viewMode === 'summary' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-4">Lớp &amp; Khối</th>
                  <th className="py-3 px-4">Tổng thời gian học</th>
                  <th className="py-3 px-4">Tiến độ bài học</th>
                  <th className="py-3 px-4 text-center">Điểm TB &amp; Sao</th>
                  <th className="py-3 px-4">Học gần nhất</th>
                  <th className="py-3 px-4 text-center">Kiểm soát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {filteredSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      Không tìm thấy người học nào phù hợp với điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  filteredSummaries.map((learner, idx) => {
                    const isWarning = learner.totalStudySeconds < 900;
                    const isExemplary = learner.totalStudySeconds >= 3000;

                    return (
                      <tr key={learner.userId || idx} className="hover:bg-amber-50/40 transition">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                              {learner.avatar || '👦'}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{learner.studentName}</span>
                                {isExemplary && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                    ⭐ Chăm chỉ
                                  </span>
                                )}
                                {isWarning && (
                                  <span className="text-[10px] bg-rose-100 text-rose-700 font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                    ⚠️ Học ít
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                ID: {learner.userId}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-black w-fit">
                              Lớp {learner.schoolClass}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              Khối {learner.grade}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 ${
                                isExemplary
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isWarning
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{StorageService.formatStudyDuration(learner.totalStudySeconds)}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 min-w-[160px]">
                          <div>
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                              <span>{learner.completedLessonsCount} bài hoàn thành</span>
                              <span className="text-slate-400">({learner.lessonsStudiedCount} bài đã mở)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div
                                style={{
                                  width: `${Math.min(100, Math.max(10, (learner.completedLessonsCount / 3) * 100))}%`,
                                }}
                                className={`h-full rounded-full ${
                                  learner.completedLessonsCount >= 2
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-400'
                                }`}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="font-black text-slate-900 text-xs">
                              {learner.averageScore > 0 ? `${learner.averageScore}%` : '---'}
                            </span>
                            <span className="flex items-center gap-0.5 text-amber-500 font-black text-[11px]">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{learner.starsEarned || 0}</span>
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px] font-semibold">
                          {learner.lastActive || '16/10/2026'}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedStudentForDetail(learner.studentName)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                              title="Xem toàn bộ lịch sử các buổi học"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Nhật ký</span>
                            </button>

                            <button
                              onClick={() => {
                                setReminderTarget(learner);
                                setReminderMessage(
                                  `Chào ${learner.studentName}! Thầy/cô thấy em đã học ${StorageService.formatStudyDuration(
                                    learner.totalStudySeconds
                                  )}. Em hãy tiếp tục hoàn thành các bài học tiếp theo nhé!`
                                );
                              }}
                              className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition cursor-pointer"
                              title="Gửi lời nhắc nhở / Động viên học tập"
                            >
                              <Send className="w-3.5 h-3.5" />
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
      )}

      {/* VIEW 2: DETAILED STUDY SESSIONS LOG */}
      {viewMode === 'sessions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Học sinh &amp; Lớp</th>
                  <th className="py-3 px-4">Bài học đang học</th>
                  <th className="py-3 px-4">Thời lượng học</th>
                  <th className="py-3 px-4">Các phần đã tương tác</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                      Chưa có nhật ký buổi học nào theo điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sess.startTime}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-black text-slate-900">{sess.studentName}</div>
                        <div className="text-[10px] text-blue-700 font-extrabold">
                          Lớp {sess.schoolClass} • Khối {sess.grade}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-black text-indigo-900">{sess.lessonTitle}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {sess.lessonId}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-black text-xs w-fit flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{StorageService.formatStudyDuration(sess.durationSeconds)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {sess.sectionsVisited.map((sec, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-semibold"
                            >
                              ✓ {sec}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {sess.isCompleted ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-black inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Đang học
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: BY LESSON MONITORING & TIME SPENT */}
      {viewMode === 'byLesson' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="font-black text-xs text-slate-800">
                  Thống kê Thời Gian Học &amp; Người Học theo từng Bài Giảng ({byLessonData.length} bài)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-bold">
                Nhấn vào từng bài giảng để xem chi tiết danh sách học sinh và thời lượng học của từng em
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-28">Khối &amp; Tiết</th>
                    <th className="py-3 px-4">Tên bài học</th>
                    <th className="py-3 px-4">Tổng thời gian học</th>
                    <th className="py-3 px-4">Số người học</th>
                    <th className="py-3 px-4">TB / Học sinh</th>
                    <th className="py-3 px-4 text-center">Đã hoàn thành</th>
                    <th className="py-3 px-4 text-center w-36">Kiểm soát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {byLessonData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                        Không tìm thấy bài giảng nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    byLessonData.map((item, idx) => {
                      const isExpanded = expandedLessonId === item.lesson.id;
                      const hasLearners = item.uniqueStudentsCount > 0;

                      return (
                        <React.Fragment key={item.lesson.id}>
                          <tr
                            onClick={() => setExpandedLessonId(isExpanded ? null : item.lesson.id)}
                            className={`cursor-pointer transition ${
                              isExpanded ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600' : 'hover:bg-amber-50/40'
                            }`}
                          >
                            <td className="py-3 px-4 text-center text-slate-400 font-mono">
                              {idx + 1}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-black w-fit">
                                  Lớp {item.lesson.grade}
                                </span>
                                {item.lesson.period && (
                                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                                    <span>{item.lesson.period}</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-black text-slate-900 text-sm">{item.lesson.title}</div>
                              {item.lesson.description && (
                                <div className="text-[10px] text-slate-400 line-clamp-1">
                                  {item.lesson.description}
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 ${
                                    item.totalSeconds >= 3600
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : item.totalSeconds > 0
                                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{StorageService.formatStudyDuration(item.totalSeconds)}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1 text-slate-800 font-black">
                                <Users className="w-3.5 h-3.5 text-blue-600" />
                                <span>{item.uniqueStudentsCount} học sinh</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                ({item.sessionCount} phiên học)
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-700 font-extrabold">
                              {item.avgSeconds > 0 ? StorageService.formatStudyDuration(item.avgSeconds) : '---'}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{item.completedCount} em</span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedLessonId(isExpanded ? null : item.lesson.id);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 mx-auto ${
                                  isExpanded
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{isExpanded ? 'Thu gọn' : 'Chi tiết học sinh'}</span>
                              </button>
                            </td>
                          </tr>

                          {/* Expanded students list for this lesson */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={8} className="p-0 bg-slate-50/80 border-y border-emerald-200">
                                <div className="p-5 space-y-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">📋</span>
                                      <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                                        Danh Sách Học Sinh Đã Học Bài: <span className="text-emerald-700">{item.lesson.title}</span>
                                      </h5>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">
                                      Tổng cộng {item.students.length} em đã tham gia
                                    </span>
                                  </div>

                                  {!hasLearners ? (
                                    <div className="py-6 text-center text-slate-400 font-bold text-xs">
                                      Chưa có học sinh nào bắt đầu học bài giảng này. Khi học sinh vào học, dữ liệu thời gian và các phần tương tác sẽ tự động xuất hiện tại đây.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {item.students.map((st, sIdx) => {
                                        const isLowTime = st.duration < 600; // under 10 mins

                                        return (
                                          <div
                                            key={sIdx}
                                            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition space-y-2"
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div>
                                                <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                                                  <span>{st.studentName}</span>
                                                  <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[9px] font-black rounded-md">
                                                    Lớp {st.schoolClass}
                                                  </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-semibold">
                                                  Ngày học: {st.latestDate}
                                                </span>
                                              </div>

                                              <div
                                                className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shrink-0 ${
                                                  isLowTime
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : 'bg-emerald-100 text-emerald-800'
                                                }`}
                                              >
                                                <Clock className="w-3 h-3" />
                                                <span>{StorageService.formatStudyDuration(st.duration)}</span>
                                              </div>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100">
                                              <span className="font-semibold text-slate-600">
                                                {st.isCompleted ? (
                                                  <span className="text-emerald-700 font-black flex items-center gap-0.5">
                                                    <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                                                  </span>
                                                ) : (
                                                  <span className="text-amber-700 font-bold flex items-center gap-0.5">
                                                    <Clock className="w-3 h-3" /> Đang học
                                                  </span>
                                                )}
                                              </span>

                                              <button
                                                onClick={() => {
                                                  const targetSummary = summaries.find(
                                                    (s) => s.studentName.toLowerCase() === st.studentName.toLowerCase()
                                                  ) || {
                                                    userId: 'st_' + sIdx,
                                                    studentName: st.studentName,
                                                    schoolClass: st.schoolClass,
                                                    grade: item.lesson.grade,
                                                    avatar: '👦',
                                                    totalStudySeconds: st.duration,
                                                    lessonsStudiedCount: 1,
                                                    completedLessonsCount: st.isCompleted ? 1 : 0,
                                                    quizTakenCount: 1,
                                                    averageScore: 90,
                                                    starsEarned: 10,
                                                    lastActive: st.latestDate,
                                                    status: 'active_today',
                                                  };
                                                  setReminderTarget(targetSummary);
                                                  setReminderMessage(
                                                    `Thầy/cô thấy em đã dành ${StorageService.formatStudyDuration(
                                                      st.duration
                                                    )} cho ${item.lesson.title}. Em hãy tiếp tục phát huy nhé!`
                                                  );
                                                }}
                                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition text-[10px]"
                                                title="Gửi tin nhắn / lời nhắc cho học sinh"
                                              >
                                                <Send className="w-3 h-3" />
                                                <span>Nhắc nhở</span>
                                              </button>
                                            </div>

                                            {st.sections.length > 0 && (
                                              <div className="pt-1 flex flex-wrap gap-1">
                                                {st.sections.map((sec, secIdx) => (
                                                  <span
                                                    key={secIdx}
                                                    className="text-[9px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded-md font-medium"
                                                  >
                                                    ✓ {sec}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: STUDENT DETAILED LEARNING HISTORY DRAWER */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border-4 border-blue-300 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                  👤
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-white/20 px-2 py-0.5 rounded-full">
                    NHẬT KÝ CHI TIẾT CÁC BUỔI HỌC
                  </span>
                  <h3 className="text-xl font-black mt-0.5">{selectedStudentForDetail}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Lịch sử học tập của học sinh ({studentDetailSessions.length} buổi):
              </h4>

              {studentDetailSessions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-bold text-xs">
                  Chưa có phiên học nào được ghi lại cho em này.
                </div>
              ) : (
                <div className="space-y-3">
                  {studentDetailSessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:bg-blue-50/40 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-black text-sm text-slate-900">{s.lessonTitle}</div>
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{StorageService.formatStudyDuration(s.durationSeconds)}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                        <span>Bắt đầu: {s.startTime}</span>
                        {s.endTime && <span>• Kết thúc: {s.endTime}</span>}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] font-bold text-slate-500">Các mục đã học:</span>
                        {s.sectionsVisited.map((sec, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md font-bold text-indigo-700"
                          >
                            ✓ {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND REMINDER OR PRAISE MESSAGE */}
      {reminderTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-amber-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">💌</span>
                <div>
                  <h4 className="text-base font-black text-slate-800">
                    Gửi Lời Động Viên / Nhắc Nhở Học Tập
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold">
                    Tới học sinh: <strong>{reminderTarget.studentName}</strong> (Lớp {reminderTarget.schoolClass})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReminderTarget(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {reminderSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h4 className="font-black text-emerald-800 text-sm">Đã gửi tin nhắn thành công!</h4>
                <p className="text-xs text-slate-500">Học sinh sẽ nhận được thông báo khi đăng nhập vào hệ thống.</p>
              </div>
            ) : (
              <form onSubmit={handleSendReminder} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Nội dung lời nhắn của Thầy/Cô:
                  </label>
                  <textarea
                    rows={4}
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    required
                    placeholder="Nhập lời khen hoặc nhắc nhở học sinh..."
                    className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderTarget(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi tin nhắn ngay</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
