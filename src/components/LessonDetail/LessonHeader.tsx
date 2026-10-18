import React, { useState } from 'react';
import { Lesson } from '../../types';
import { ArrowLeft, CheckCircle2, Target, Award, Sparkles, Clock, BookOpen, Video, Gamepad2, Brain, Trophy, Bot } from 'lucide-react';

interface Props {
  lesson: Lesson;
  topicName?: string;
  activeSection: number;
  onSelectSection: (section: number) => void;
  onBack: () => void;
  isCompleted: boolean;
  onToggleComplete: () => void;
  studySeconds?: number;
  materialsWatchSeconds?: number;
  requiredWatchSeconds?: number;
  hasMetWatchRequirement?: boolean;
}

const SECTIONS = [
  { id: 1, name: '1. Mục tiêu & Trọng tâm', icon: '🎯', color: 'from-blue-600 to-indigo-600' },
  { id: 2, name: '2. Video & Tài liệu', icon: '🎬', color: 'from-indigo-600 to-purple-600' },
  { id: 3, name: '3. Mô phỏng & Sơ đồ tư duy', icon: '🎮', color: 'from-emerald-500 to-teal-600' },
  { id: 4, name: '4. Trò chơi kiểm tra', icon: '🎯', color: 'from-rose-500 to-pink-500' },
  { id: 5, name: '5. Robot Tin Học AI', icon: '🤖', color: 'from-teal-500 to-emerald-600' },
];

export const LessonHeader: React.FC<Props> = ({
  lesson,
  topicName,
  activeSection,
  onSelectSection,
  onBack,
  isCompleted,
  onToggleComplete,
  studySeconds = 0,
  materialsWatchSeconds = 0,
  requiredWatchSeconds = 180,
  hasMetWatchRequirement = false,
}) => {
  const [showObjectivesModal, setShowObjectivesModal] = useState(false);

  return (
    <div className="space-y-4">
      {/* Top Bar: 1. Tên chủ đề – Tên bài học – Tiết học */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-md border-2 border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition shadow-xs cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-black rounded-full">
                Lớp {lesson.grade}
              </span>
              {lesson.period && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-black rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-700" />
                  <span>{lesson.period}</span>
                </span>
              )}
              {topicName && (
                <span className="text-xs font-black text-indigo-700">
                  {topicName}
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 mt-1">
              {lesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Study Timer Badge */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-300 text-emerald-900 rounded-2xl text-xs font-black shadow-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>
              Thời gian học: {Math.floor(studySeconds / 60).toString().padStart(2, '0')}:
              {(studySeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* 80% Video Watch Requirement Status Badge */}
          <div
            onClick={() => onSelectSection(2)}
            title="Nhấn để xem Video & Tài liệu"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black shadow-xs cursor-pointer transition border ${
              hasMetWatchRequirement
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <span>{hasMetWatchRequirement ? '✅' : '⏳'}</span>
            <span className="hidden sm:inline">Video:</span>
            <span>{Math.min(100, Math.round((materialsWatchSeconds / requiredWatchSeconds) * 100))}% / 80%</span>
          </div>

          {/* Objectives Button */}
          <button
            onClick={() => setShowObjectivesModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs font-bold transition border border-indigo-200 cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>Mục tiêu</span>
          </button>

          {/* Mark Completed Button */}
          <button
            onClick={onToggleComplete}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition shadow-sm cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : hasMetWatchRequirement
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md ring-2 ring-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'Đã học xong ⭐' : 'Đánh dấu đã học'}</span>
          </button>
        </div>
      </div>

      {/* 6 Sections Tabs Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer shadow-xs select-none ${
                isActive
                  ? `bg-gradient-to-r ${sec.color} text-white shadow-md scale-102 ring-2 ring-white`
                  : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span className="text-base">{sec.icon}</span>
              <span>{sec.name}</span>
            </button>
          );
        })}
      </div>

      {/* Objectives Modal */}
      {showObjectivesModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-indigo-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-indigo-600" />
                <h4 className="text-lg font-black text-slate-800">Mục Tiêu Bài Học</h4>
              </div>
              <button
                onClick={() => setShowObjectivesModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3 font-semibold">
              Sau khi học xong bài này, học sinh sẽ:
            </p>

            <div className="space-y-2 mb-6">
              {(lesson.objectives || ['Nắm vững kiến thức trọng tâm của bài học.', 'Thực hành thành thạo các kỹ năng trên máy tính.']).map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs font-bold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowObjectivesModal(false)}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow cursor-pointer"
              >
                Đã rõ, bắt đầu học! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
