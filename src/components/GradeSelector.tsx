import React from 'react';
import { GradeLevel } from '../types';
import { Sparkles, Trophy, BookOpen } from 'lucide-react';

interface Props {
  selectedGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  gradeStats: Record<GradeLevel, { total: number; completed: number }>;
}

const GRADE_INFO = [
  {
    grade: 3 as GradeLevel,
    title: 'TIN HỌC LỚP 3',
    subtitle: 'Bước đầu làm quen với bạn máy tính',
    mascot: '💻',
    bgGradient: 'from-blue-500 via-sky-500 to-cyan-400',
    borderColor: 'border-blue-400',
    tag: 'Chủ đề 1 – 6',
  },
  {
    grade: 4 as GradeLevel,
    title: 'TIN HỌC LỚP 4',
    subtitle: 'Khám phá phần mềm & Internet an toàn',
    mascot: '🖥️',
    bgGradient: 'from-emerald-500 via-teal-500 to-green-400',
    borderColor: 'border-emerald-400',
    tag: 'Chủ đề 1 – 6',
  },
  {
    grade: 5 as GradeLevel,
    title: 'TIN HỌC LỚP 5',
    subtitle: 'Lưu trữ thông tin & Lập trình Scratch',
    mascot: '🐱',
    bgGradient: 'from-amber-500 via-orange-500 to-rose-400',
    borderColor: 'border-amber-400',
    tag: 'Chủ đề 1 – 6',
  },
];

export const GradeSelector: React.FC<Props> = ({
  selectedGrade,
  onSelectGrade,
  gradeStats,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {GRADE_INFO.map((item) => {
        const isSelected = selectedGrade === item.grade;
        const stats = gradeStats[item.grade] || { total: 0, completed: 0 };
        const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

        return (
          <div
            key={item.grade}
            onClick={() => onSelectGrade(item.grade)}
            className={`relative p-6 rounded-3xl cursor-pointer transition-all duration-300 select-none shadow-lg overflow-hidden border-4 ${
              item.borderColor
            } ${
              isSelected
                ? 'scale-103 ring-4 ring-[#D79922] shadow-2xl'
                : 'hover:scale-101 hover:shadow-xl opacity-90'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-95`} />

            {/* Content */}
            <div className="relative z-10 text-white flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-[11px] font-black uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <h3 className="text-2xl font-black mt-2 drop-shadow-sm">{item.title}</h3>
                  <p className="text-xs text-white/90 font-bold mt-1">{item.subtitle}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl shadow-inner backdrop-blur-xs">
                  {item.mascot}
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="flex justify-between items-center text-xs font-black mb-1.5">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Tiến độ học tập:</span>
                  </span>
                  <span>{stats.completed}/{stats.total} bài ({percent}%)</span>
                </div>
                <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5">
                  <div
                    style={{ width: `${percent}%` }}
                    className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                className={`mt-4 w-full py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md ${
                  isSelected
                    ? 'bg-white text-slate-900 ring-2 ring-white/50'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {isSelected ? 'Đang chọn xem lớp này ✨' : `Vào học Lớp ${item.grade} →`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
