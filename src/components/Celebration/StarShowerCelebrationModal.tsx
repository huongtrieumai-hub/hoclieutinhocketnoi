import React, { useEffect, useState } from 'react';
import { Star, Sparkles, Trophy, Award, X, RotateCcw, ArrowRight } from 'lucide-react';
import { triggerStarShower } from '../../utils/starShower';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  grade: number;
  studentName?: string;
  totalStars?: number;
  onNextLesson?: () => void;
}

export const StarShowerCelebrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lessonTitle,
  grade,
  studentName = 'Em học sinh',
  totalStars = 3,
  onNextLesson,
}) => {
  const [starsFalling, setStarsFalling] = useState<Array<{ id: number; left: number; delay: number; size: number; duration: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate randomized CSS falling stars
      const newStars = Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: Math.random() * 96 + 2, // 2% to 98%
        delay: Math.random() * 2, // 0s to 2s
        size: Math.floor(Math.random() * 18) + 14, // 14px to 32px
        duration: Math.random() * 2 + 2.5, // 2.5s to 4.5s
      }));
      setStarsFalling(newStars);

      // Trigger the canvas-confetti star shower
      triggerStarShower();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm overflow-hidden animate-fade-in">
      {/* Background Falling CSS Stars (Star Shower visual layer) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {starsFalling.map((star) => (
          <div
            key={star.id}
            style={{
              left: `${star.left}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              fontSize: `${star.size}px`,
            }}
            className="absolute top-0 text-amber-300 animate-fall-star select-none filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          >
            ★
          </div>
        ))}
      </div>

      {/* Main Celebration Card */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-white to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-300 p-6 sm:p-8 text-center overflow-hidden transform animate-scale-up z-10">
        {/* Decorative corner ribbons/glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Three Stars Trophy Header */}
        <div className="flex justify-center items-center gap-2 mb-4 pt-2">
          <div className="transform -rotate-12 animate-bounce [animation-delay:150ms]">
            <Star className="w-10 h-10 sm:w-12 sm:h-12 fill-amber-400 text-amber-500 drop-shadow-md" />
          </div>
          <div className="transform scale-125 -translate-y-2 animate-bounce [animation-delay:0ms]">
            <div className="relative">
              <Star className="w-12 h-12 sm:w-16 sm:h-16 fill-amber-300 text-amber-500 drop-shadow-lg" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-spin [animation-duration:4s]" />
            </div>
          </div>
          <div className="transform rotate-12 animate-bounce [animation-delay:300ms]">
            <Star className="w-10 h-10 sm:w-12 sm:h-12 fill-amber-400 text-amber-500 drop-shadow-md" />
          </div>
        </div>

        {/* Badge & Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs rounded-full uppercase tracking-wider shadow-sm mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Mưa Sao Khen Thưởng • Lớp {grade}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-snug mb-2">
          🎉 CHÚC MỪNG EM! 🎉
        </h3>

        <p className="text-slate-600 text-sm font-semibold mb-4">
          <span className="text-indigo-600 font-extrabold">{studentName}</span> đã xuất sắc hoàn thành:
          <span className="block text-base sm:text-lg font-black text-slate-900 mt-1 line-clamp-2 px-2">
            "{lessonTitle}"
          </span>
        </p>

        {/* Reward Callout Box */}
        <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-2 border-amber-300 rounded-2xl p-4 mb-5 shadow-inner">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-md shrink-0">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">Phần thưởng bài học</div>
              <div className="text-lg sm:text-xl font-black text-amber-900 flex items-center gap-1.5">
                <span>+3 Sao Vàng</span>
                <span className="text-xl">⭐⭐⭐</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-between text-xs font-black text-amber-900 px-1">
            <span>Tổng số sao tích lũy:</span>
            <span className="inline-flex items-center gap-1 bg-amber-400/50 px-2.5 py-0.5 rounded-full text-amber-950 font-black">
              ⭐ {totalStars} sao
            </span>
          </div>
        </div>

        {/* Encouraging Quote */}
        <p className="text-xs text-slate-600 font-medium italic mb-6">
          "Học tập chăm chỉ, mỗi ngày một bước tiến mới. Em là ngôi sao sáng của lớp!"
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center">
          <button
            onClick={() => triggerStarShower()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-extrabold rounded-2xl text-xs transition border border-amber-300 shadow-xs cursor-pointer active:scale-95"
            title="Bắn lại hiệu ứng mưa sao rơi"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <span>Mưa sao lần nữa 🌠</span>
          </button>

          {onNextLesson ? (
            <button
              onClick={() => {
                onClose();
                onNextLesson();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl text-xs shadow-md transition transform hover:scale-102 active:scale-95 cursor-pointer"
            >
              <span>Bài tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-2xl text-xs shadow-md transition transform hover:scale-102 active:scale-95 cursor-pointer"
            >
              <span>Tuyệt vời! Tiếp tục học 🎉</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
