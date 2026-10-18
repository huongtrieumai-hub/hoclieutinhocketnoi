import React, { useState } from 'react';
import { StorageService } from '../../data/storage';
import { ShieldCheck, Lock, Key, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (StorageService.verifyAdminPin(pin)) {
      setError(false);
      setPin('');
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              🔐
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Khu Vực Quản Trị Giáo Viên</h3>
              <p className="text-xs text-slate-500 font-semibold">Dành riêng cho thầy cô soạn bài &amp; quản lý học liệu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Nhập mã PIN hoặc Mật khẩu Giáo viên:
            </label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Mã PIN mặc định: 123456 hoặc giaovien123"
                className="w-full px-4 py-3 pl-10 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-amber-500 text-sm font-bold"
                autoFocus
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {error && (
              <p className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Mã PIN không đúng! (Thử: 123456 hoặc giaovien123)
              </p>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 font-semibold">
            💡 <strong>Gợi ý:</strong> Mã truy cập mặc định là <strong>123456</strong> hoặc <strong>giaovien123</strong>. Thầy cô có thể đổi mã PIN sau khi đăng nhập.
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl"
            >
              Quay lại học sinh
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-md transition"
            >
              Đăng Nhập Quản Trị 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
