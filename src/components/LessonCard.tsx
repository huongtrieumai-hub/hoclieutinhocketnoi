import React from 'react';
import { Lesson } from '../types';
import { Play, CheckCircle2, Star, Clock, Sparkles } from 'lucide-react';

interface Props {
  lesson: Lesson;
  topicName?: string;
  isCompleted: boolean;
  score?: number;
  onStartLearning: (lesson: Lesson) => void;
}

export const LessonCard: React.FC<Props> = ({
  lesson,
  topicName,
  isCompleted,
  score,
  onStartLearning,
}) => {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-sky-400 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Card Cover Image with Status Badge */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={
              lesson.coverImage ||
              'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop&q=80'
            }
            alt={lesson.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs rounded-xl shadow-md border border-white/30">
              LỚP {lesson.grade}
            </span>

            {isCompleted ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã học ⭐</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-black/60 text-white font-bold text-xs rounded-xl backdrop-blur-xs">
                Chưa học
              </span>
            )}
          </div>

          {/* SGK indicator */}
          {lesson.isDemo && (
            <div className="absolute bottom-3 left-3 px-2.5 py-0.5 bg-blue-900/85 text-sky-200 border border-sky-400/50 backdrop-blur-xs rounded-lg text-[10px] font-bold">
              SGK Kết nối tri thức
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {topicName && (
            <div className="text-[11px] font-black text-sky-600 uppercase tracking-wider mb-1 line-clamp-1">
              {topicName}
            </div>
          )}

          <h3 className="text-lg font-black text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {lesson.title}
          </h3>

          <p className="text-xs text-slate-600 font-semibold mt-1.5 line-clamp-2">
            {lesson.description}
          </p>

          {/* Features Highlights */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1 bg-sky-50 text-blue-700 px-2.5 py-1 rounded-lg border border-sky-200">
              🌳 Sơ đồ tư duy
            </span>
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-100">
              🎮 Mô phỏng
            </span>
            <span className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-100">
              🎯 {lesson.section5Games.questions.length} câu đố
            </span>
            <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
              🤖 Robot AI
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onStartLearning(lesson)}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-black text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-102 border border-white/30"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Bắt đầu học 🚀</span>
        </button>
      </div>
    </div>
  );
};
