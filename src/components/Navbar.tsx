import React from 'react';
import { GradeLevel, UserAccount } from '../types';
import { Search, Star, ShieldCheck, Sparkles, LogIn, User, ChevronDown, LogOut } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-4 border-amber-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo & Slogan */}
          <div
            onClick={onGoHome}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-400 flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform">
              💻
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-lg font-black bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 bg-clip-text text-transparent tracking-tight">
                  HỌC LIỆU TIN HỌC KẾT NỐI TRI THỨC
                </span>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-900 font-black text-[11px] rounded-lg shadow-2xs">
                  3-4-5
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-extrabold text-amber-600 tracking-wide">
                Học vui – Nhớ lâu – Thực hành sáng tạo ✨
              </p>
            </div>
          </div>

          {/* Grade Quick Switcher (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {([3, 4, 5] as GradeLevel[]).map((grade) => (
              <button
                key={grade}
                onClick={() => onSelectGrade(grade)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  selectedGrade === grade
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                TIN HỌC LỚP {grade}
              </button>
            ))}
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
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 hover:bg-slate-50 focus:bg-white rounded-2xl text-xs font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Stars Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-2xl shadow-2xs">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400 animate-spin" />
              <span className="text-xs font-black text-amber-900">
                {currentUser ? currentUser.stars : starsEarned} <span className="hidden sm:inline">sao</span>
              </span>
            </div>

            {/* USER LOGGED IN vs GUEST */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Profile pill */}
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1.5 pr-3 bg-slate-100 hover:bg-slate-200 rounded-2xl border border-slate-200 transition cursor-pointer"
                  title="Xem thông tin tài khoản"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-amber-400 flex items-center justify-center text-lg shadow-xs">
                    {currentUser.avatar}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-black text-slate-900 leading-tight truncate max-w-[100px]">
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
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-black shadow-md transition hover:scale-102 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span className="hidden md:inline">Bảng Quản Trị</span>
                  </button>
                )}

                {/* Direct Logout button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Đăng xuất khỏi hệ thống"
                    className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-2xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
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
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-slate-100 rounded-2xl text-xs font-black shadow-md transition cursor-pointer"
                  title="Dành cho Giáo viên & Quản trị"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
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
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                selectedGrade === grade
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 bg-slate-100'
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
