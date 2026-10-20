import React from 'react';
import { GradeLevel, UserAccount } from '../types';
import { Search, Star, ShieldCheck, Sparkles, LogIn, User, ChevronDown, LogOut, Laptop } from 'lucide-react';

interface Props {
  selectedGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  starsEarned: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser: UserAccount | null;
  onOpenLogin: (roleTab?: 'student' | 'teacher') => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onLogout?: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<Props> = ({
  selectedGrade,
  onSelectGrade,
  starsEarned,
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenLogin,
  onOpenProfile,
  onOpenAdmin,
  onLogout,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-4 border-sky-400 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-2.5 gap-3">
          {/* Logo, Title, Slogan & Grade Menu below Slogan */}
          <div className="flex items-center gap-3 select-none">
            <div onClick={onGoHome} className="shrink-0 cursor-pointer transition transform hover:scale-105">
              <Laptop className="w-12 h-12 text-blue-600 filter drop-shadow-sm" />
            </div>

            <div className="flex flex-col gap-0.5">
              <div
                onClick={onGoHome}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-sm sm:text-base md:text-lg font-black bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 bg-clip-text text-transparent tracking-tight">
                  HỌC LIỆU TIN HỌC KẾT NỐI TRI THỨC
                </span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-[11px] rounded-lg shadow-2xs">
                  3-4-5
                </span>
              </div>

              <p className="text-[10px] sm:text-xs font-black text-blue-600 tracking-wide">
                Học vui – Nhớ lâu – Thực hành sáng tạo ✨
              </p>

              {/* Grade Menu Positioned DIRECTLY BELOW Slogan */}
              <div className="flex items-center gap-1.5 mt-1">
                {([3, 4, 5] as GradeLevel[]).map((grade) => (
                  <button
                    key={grade}
                    onClick={() => onSelectGrade(grade)}
                    className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                      selectedGrade === grade
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md scale-102 ring-2 ring-sky-300'
                        : 'bg-slate-100 hover:bg-sky-50 text-slate-800 border border-slate-200'
                    }`}
                  >
                    TIN HỌC LỚP {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Navigation & User Controls */}
          <div className="flex items-center gap-2.5">
            {/* Search bar */}
            <div className="relative hidden xl:block w-44">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm bài học..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 hover:bg-slate-50 focus:bg-white rounded-2xl text-xs font-bold border-2 border-slate-200 focus:border-sky-400 focus:outline-none transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Stars Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border-2 border-sky-200 rounded-2xl shadow-2xs">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" />
              <span className="text-xs font-black text-blue-800">
                {currentUser ? currentUser.stars : starsEarned} <span className="hidden sm:inline">sao</span>
              </span>
            </div>

            {/* USER LOGGED IN vs GUEST */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Profile pill */}
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1.5 pr-3 bg-slate-100 hover:bg-sky-50 rounded-2xl border-2 border-slate-200 hover:border-sky-400 transition cursor-pointer"
                  title="Xem thông tin tài khoản"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-lg shadow-xs">
                    {currentUser.avatar}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-black text-blue-800 leading-tight truncate max-w-[100px]">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold">
                      {currentUser.schoolClass ? `Lớp ${currentUser.schoolClass}` : currentUser.role === 'teacher' ? 'Giáo viên' : 'Admin'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Direct Admin entrance if teacher or admin */}
                {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl text-xs font-black shadow-md transition hover:scale-102 cursor-pointer border-2 border-sky-300"
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-200" />
                    <span className="hidden md:inline">Bảng Quản Trị</span>
                  </button>
                )}

                {/* Direct Logout button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Đăng xuất khỏi hệ thống"
                    className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-2xl border-2 border-slate-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden xl:inline text-xs font-black">Đăng Xuất</span>
                  </button>
                )}
              </div>
            ) : (
              /* GUEST: LOGIN BUTTONS */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenLogin('student')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl text-xs font-black shadow-md transition hover:scale-103 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </button>

                <button
                  onClick={() => onOpenLogin('teacher')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-2xl text-xs font-black shadow-md transition cursor-pointer border-2 border-sky-300"
                  title="Dành cho Giáo viên & Quản trị"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-200" />
                  <span>Giáo Viên</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Grade Switcher */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-100">
          {([3, 4, 5] as GradeLevel[]).map((grade) => (
            <button
              key={grade}
              onClick={() => onSelectGrade(grade)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                selectedGrade === grade
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md ring-2 ring-sky-300'
                  : 'text-slate-700 bg-slate-100 hover:bg-sky-50 border border-slate-200'
              }`}
            >
              Lớp {grade}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
