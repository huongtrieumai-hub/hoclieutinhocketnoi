import React from 'react';
import { GradeLevel, UserAccount, Lesson } from '../types';
import {
  Home,
  BookOpen,
  Bot,
  Star,
  User,
  ShieldCheck,
  LogIn,
  Award,
  Sparkles,
  Layers,
} from 'lucide-react';

interface Props {
  selectedGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  currentUser: UserAccount | null;
  onGoHome: () => void;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  starsEarned: number;
  activeLesson: Lesson | null;
  onSelectSection?: (sectionId: number) => void;
  isLoggedInAdmin: boolean;
}

export const BottomNavigation: React.FC<Props> = ({
  selectedGrade,
  onSelectGrade,
  currentUser,
  onGoHome,
  onOpenLogin,
  onOpenProfile,
  onOpenAdmin,
  starsEarned,
  activeLesson,
  onSelectSection,
  isLoggedInAdmin,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t-4 border-[#D79922] shadow-2xl py-2 px-3 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-around sm:justify-center sm:gap-6 md:gap-10">
        {/* 1. THẺ MENU: TRANG CHỦ / BÀI HỌC */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex flex-col items-center justify-center p-1.5 sm:px-4 sm:py-2 rounded-2xl hover:bg-slate-100 text-[#4056A1] hover:text-[#F13C20] transition cursor-pointer group shrink-0"
        >
          <div className="p-1 rounded-xl group-hover:scale-110 transition">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-[#4056A1]" />
          </div>
          <span className="text-[10px] sm:text-xs font-black tracking-tight mt-0.5">
            Trang Chủ
          </span>
        </button>

        {/* 2. THẺ MENU: ĐỔI KHỐI LỚP (3, 4, 5) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner shrink-0">
          {([3, 4, 5] as GradeLevel[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                onSelectGrade(g);
                onGoHome();
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                selectedGrade === g
                  ? 'bg-gradient-to-r from-[#4056A1] to-[#F13C20] text-white shadow-md scale-105'
                  : 'text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <span>Lớp {g}</span>
            </button>
          ))}
        </div>

        {/* 3. THẺ MENU: ROBOT AI TRỢ GIẢNG (Nếu đang học bài) HOẶC SAO TÍCH LŨY */}
        {activeLesson && onSelectSection ? (
          <button
            type="button"
            onClick={() => onSelectSection(6)} // Section 6 is AI Assistant
            className="flex flex-col items-center justify-center p-1.5 sm:px-4 sm:py-2 rounded-2xl bg-[#EFE2BA] hover:bg-[#e4d4a2] text-[#4056A1] border-2 border-[#D79922] transition cursor-pointer shrink-0 shadow-2xs hover:scale-105"
          >
            <div className="relative p-1">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-[#D79922] animate-bounce" />
              <Sparkles className="w-3 h-3 text-[#F13C20] absolute -top-1 -right-1" />
            </div>
            <span className="text-[10px] sm:text-xs font-black tracking-tight mt-0.5">
              Robot AI
            </span>
          </button>
        ) : (
          <div className="hidden xs:flex items-center gap-1 px-3 py-1.5 bg-[#EFE2BA] border-2 border-[#D79922] rounded-2xl text-[#4056A1] text-xs font-black shrink-0">
            <Star className="w-4 h-4 text-[#D79922] fill-[#D79922] animate-spin" />
            <span>{currentUser ? currentUser.stars : starsEarned} Sao</span>
          </div>
        )}

        {/* 4. THẺ MENU: QUẢN TRỊ VÀ TÀI KHOẢN */}
        {currentUser ? (
          <div className="flex items-center gap-1.5 shrink-0">
            {isLoggedInAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="flex flex-col items-center justify-center p-1.5 sm:px-4 sm:py-2 bg-[#4056A1] hover:bg-[#2f407b] text-white rounded-2xl shadow-md transition cursor-pointer border border-[#EFE2BA]"
                title="Bảng Quản Trị Hệ Thống"
              >
                <ShieldCheck className="w-5 h-5 text-[#D79922]" />
                <span className="text-[10px] sm:text-xs font-black">Quản Trị</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenProfile}
              className="flex flex-col items-center justify-center p-1.5 sm:px-4 sm:py-2 rounded-2xl hover:bg-slate-100 text-slate-700 hover:text-[#4056A1] transition cursor-pointer group"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-tr from-[#4056A1] to-[#F13C20] text-white flex items-center justify-center text-sm shadow-2xs group-hover:scale-110 transition">
                {currentUser.avatar || '👤'}
              </div>
              <span className="text-[10px] sm:text-xs font-black tracking-tight mt-0.5 truncate max-w-[70px]">
                {currentUser.fullName?.split(' ').pop() || 'Hồ Sơ'}
              </span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex flex-col items-center justify-center p-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#F13C20] to-[#D79922] hover:from-[#d62e15] hover:to-[#be8418] text-white rounded-2xl shadow-md transition cursor-pointer hover:scale-105 shrink-0"
          >
            <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[10px] sm:text-xs font-black">Đăng Nhập</span>
          </button>
        )}
      </div>
    </nav>
  );
};
