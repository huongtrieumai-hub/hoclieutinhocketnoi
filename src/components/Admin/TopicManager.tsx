import React, { useState, useMemo } from 'react';
import { Topic, Lesson, GradeLevel } from '../../types';
import { StorageService } from '../../data/storage';
import { FirestoreService } from '../../services/firestoreService';
import { OFFICIAL_TOPICS_LIST, INITIAL_TOPICS } from '../../data/mockData';
import {
  Layers,
  Sparkles,
  Edit3,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Search,
  CloudUpload,
  RefreshCw,
  FolderOpen,
  ShieldAlert,
  Save,
  X,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  topics: Topic[];
  lessons: Lesson[];
  onRefreshData: () => void;
}

export const TopicManager: React.FC<Props> = ({
  topics,
  lessons,
  onRefreshData,
}) => {
  const [selectedGradeTab, setSelectedGradeTab] = useState<GradeLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Edit topic modal state
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState('💻');

  // Count lessons per topic
  const lessonCountMap = useMemo(() => {
    const map = new Map<string, number>();
    lessons.forEach((l) => {
      map.set(l.topicId, (map.get(l.topicId) || 0) + 1);
    });
    return map;
  }, [lessons]);

  // Filter topics based on grade and search
  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => selectedGradeTab === 'all' || t.grade === selectedGradeTab)
      .filter((t) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        return a.id.localeCompare(b.id);
      });
  }, [topics, selectedGradeTab, searchTerm]);

  // Handle Synchronize & Standardize All 18 Topics to Firestore & LocalStorage
  const handleStandardizeAndSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      await FirestoreService.standardizeAndSyncTopics();
      StorageService.saveTopics(INITIAL_TOPICS);
      onRefreshData();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setSyncSuccessMsg('Đã chuẩn hóa và đồng bộ thành công toàn bộ 6 Chủ Đề chuẩn SGK lên Đám mây (Firestore)!');
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    } catch (err: unknown) {
      console.error('Error standardizing topics:', err);
      // Fallback local save
      StorageService.saveTopics(INITIAL_TOPICS);
      onRefreshData();
      setSyncSuccessMsg('Đã chuẩn hóa 6 Chủ Đề chuẩn SGK thành công trong bộ nhớ hệ thống!');
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setEditName(topic.name);
    setEditDescription(topic.description || '');
    setEditIcon(topic.icon || '💻');
  };

  // Save Topic Edits
  const handleSaveEdit = async () => {
    if (!editingTopic || !editName.trim()) return;

    const updated: Topic = {
      ...editingTopic,
      name: editName.trim(),
      description: editDescription.trim(),
      icon: editIcon.trim(),
    };

    StorageService.saveTopic(updated);
    try {
      await FirestoreService.saveTopic(updated);
    } catch (e) {
      console.warn('Sync topic to Firestore notice:', e);
    }

    setEditingTopic(null);
    onRefreshData();
    confetti({ particleCount: 40, spread: 50 });
  };

  // Reset a single topic to official textbook standard
  const handleResetSingleTopic = async (topic: Topic) => {
    const init = INITIAL_TOPICS.find((it) => it.id === topic.id);
    if (!init) return;

    const resetTopic: Topic = {
      ...topic,
      name: init.name,
      description: init.description,
      icon: init.icon,
      color: init.color,
    };

    StorageService.saveTopic(resetTopic);
    try {
      await FirestoreService.saveTopic(resetTopic);
    } catch (e) {
      console.warn('Sync topic to Firestore notice:', e);
    }
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center text-3xl shadow-lg">
              📁
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>CHƯƠNG TRÌNH SGK KẾT NỐI TRI THỨC VỚI CUỘC SỐNG</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Quản Lý Danh Mục 6 Chủ Đề Môn Tin Học 3–4–5
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Chuẩn hóa tên gọi và nội dung 6 chủ đề xuyên suốt các khối Lớp 3, Lớp 4 và Lớp 5 theo quy định của Bộ Giáo Dục &amp; Đào Tạo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleStandardizeAndSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs shadow-md transition transform hover:scale-102 cursor-pointer disabled:opacity-50"
              title="Đồng bộ lại tên chuẩn 6 chủ đề vào Firestore và bộ nhớ ứng dụng"
            >
              <CloudUpload className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>{isSyncing ? 'Đang đồng bộ...' : '⚡ Chuẩn Hóa & Đồng Bộ 6 Chủ Đề (Firestore)'}</span>
            </button>

            <button
              onClick={onRefreshData}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tải lại</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {syncSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs font-black text-emerald-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Official 6 Themes Reference Box */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>📋</span> DANH MỤC 6 CHỦ ĐỀ CHUẨN SGK TIN HỌC TIỂU HỌC:
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Áp dụng thống nhất cho toàn bộ hệ thống bài giảng
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {OFFICIAL_TOPICS_LIST.map((topic) => (
              <div
                key={topic.num}
                className="p-3.5 bg-slate-50 hover:bg-amber-50/50 rounded-2xl border border-slate-200 transition space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-white text-slate-800 rounded-lg text-[10px] font-black border border-slate-200 shadow-2xs">
                    Chủ đề {topic.num}
                  </span>
                  <span className="text-xl group-hover:scale-110 transition">{topic.icon}</span>
                </div>
                <h4 className="font-black text-slate-900 text-xs leading-snug">
                  {topic.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Grade tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          <span className="text-slate-500 font-black mr-1">Lọc khối:</span>
          {(['all', 3, 4, 5] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGradeTab(g)}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                selectedGradeTab === g
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g === 'all' ? 'Tất cả các lớp (18 chủ đề)' : `Tin học Lớp ${g} (6 chủ đề)`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm chủ đề..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Topics List Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-extrabold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-16">Khối</th>
                <th className="py-3.5 px-4 w-28">Thứ tự</th>
                <th className="py-3.5 px-4">Tên chủ đề SGK chuẩn</th>
                <th className="py-3.5 px-4">Mô tả nội dung</th>
                <th className="py-3.5 px-4 w-32 text-center">Bài học liên kết</th>
                <th className="py-3.5 px-4 text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    Không tìm thấy chủ đề nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredTopics.map((topic) => {
                  const count = lessonCountMap.get(topic.id) || 0;
                  const init = INITIAL_TOPICS.find((it) => it.id === topic.id);
                  const isMatchOfficial = init && init.name === topic.name;

                  return (
                    <tr key={topic.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg text-[10px] font-black">
                          Lớp {topic.grade}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{topic.icon || '💻'}</span>
                          <span className="text-[11px] font-mono text-slate-500 font-extrabold">
                            #{topic.id.replace('top-', '')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{topic.name}</span>
                          {isMatchOfficial ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                              ✓ Chuẩn SGK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800">
                              Đã tùy biến
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-normal text-[11px] max-w-xs">
                        {topic.description || 'Chưa có mô tả'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          count > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {count} bài học
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(topic)}
                            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer text-xs"
                            title="Chỉnh sửa tên và mô tả chủ đề"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>

                          <button
                            onClick={() => handleResetSingleTopic(topic)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition cursor-pointer"
                            title="Khôi phục lại tên chuẩn SGK Kết nối tri thức"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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

      {/* Edit Topic Modal */}
      {editingTopic && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border-4 border-amber-300 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{editIcon}</span>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    Chỉnh Sửa Chủ Đề (Lớp {editingTopic.grade})
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Mã: {editingTopic.id}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingTopic(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Biểu tượng minh họa (Emoji):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="w-16 px-3 py-2 text-center text-lg bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {['💻', '🌐', '📁', '🛡️', '🎨', '🧩', '🖥️', '🗂️', '📝', '🤖', '📊', '🐱'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setEditIcon(emoji)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-amber-100 text-base flex items-center justify-center cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Tên Chủ Đề SGK:
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ví dụ: Chủ đề 1: Máy tính và em"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Mô Tả Chủ Đề:
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Mô tả nội dung trọng tâm của chủ đề này..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingTopic(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
