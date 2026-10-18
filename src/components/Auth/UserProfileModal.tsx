import React from 'react';
import { UserAccount } from '../../types';
import { Star, Award, LogOut, CheckCircle2, BookOpen, ShieldCheck, Heart } from 'lucide-react';

interface Props {
  user: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSwitchAccount: () => void;
  completedCount: number;
}

export const UserProfileModal: React.FC<Props> = ({
  user,
  isOpen,
  onClose,
  onLogout,
  onSwitchAccount,
  completedCount,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Header background with Avatar */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-black flex items-center justify-center transition"
          >
            ✕
          </button>

          <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-4xl mx-auto border-4 border-amber-300">
            {user.avatar}
          </div>

          <h3 className="text-xl font-black mt-3 drop-shadow-sm">{user.fullName}</h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs bg-white/20 px-3 py-0.5 rounded-full font-bold">
              @{user.username}
            </span>
            {user.schoolClass && (
              <span className="text-xs bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full font-black shadow-xs">
                Lớp {user.schoolClass}
              </span>
            )}
            {user.role === 'teacher' && (
              <span className="text-xs bg-purple-200 text-purple-900 px-2.5 py-0.5 rounded-full font-black shadow-xs">
                Giáo Viên
              </span>
            )}
            {user.role === 'admin' && (
              <span className="text-xs bg-rose-200 text-rose-900 px-2.5 py-0.5 rounded-full font-black shadow-xs">
                Quản Trị Viên
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <span className="text-[11px] font-extrabold text-amber-800 uppercase flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Sao Vàng</span>
              </span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {user.stars} ⭐
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center">
              <span className="text-[11px] font-extrabold text-blue-800 uppercase flex items-center justify-center gap-1">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>Bài Hoàn Thành</span>
              </span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {completedCount} bài
              </div>
            </div>
          </div>

          {/* Bio info */}
          {user.bio && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 font-semibold leading-relaxed">
              💬 <em>"{user.bio}"</em>
            </div>
          )}

          {/* Badges list */}
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
              HUY HIỆU DANH DỰ:
            </span>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((b, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-black flex items-center gap-1 shadow-2xs"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{b}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={onSwitchAccount}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Đổi tài khoản khác</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất khỏi hệ thống</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
