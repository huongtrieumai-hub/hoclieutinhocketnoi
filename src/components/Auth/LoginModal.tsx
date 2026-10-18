import React, { useState, useEffect } from 'react';
import { UserAccount, GradeLevel } from '../../types';
import { AuthService, DEMO_ACCOUNTS } from '../../data/authData';
import {
  Sparkles,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  UserPlus,
  BookOpen,
  Laptop,
  Bot,
  KeyRound,
  RotateCcw,
  X,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialRoleTab?: 'student' | 'teacher';
}

export const LoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRoleTab = 'student',
}) => {
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [roleTab, setRoleTab] = useState<'student' | 'teacher'>(initialRoleTab);

  // Login inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  // Registration inputs
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGrade, setRegGrade] = useState<GradeLevel>(3);
  const [regAvatar, setRegAvatar] = useState<string>('👦');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password inputs
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotFullName, setForgotFullName] = useState('');
  const [forgotClass, setForgotClass] = useState('3A');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  // Google login loading
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Rate limit countdown effect
  useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const timer = setInterval(() => {
      setRateLimitSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  if (!isOpen) return null;

  // ====================== HANDLERS ======================

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập Tên đăng nhập của em!');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập Mật khẩu!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.login(username, password);
      if (res.success && res.user) {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.message || 'Đăng nhập không thành công.');
        const check = AuthService.getRateLimitStatus(username);
        if (check.isBlocked) {
          setRateLimitSeconds(check.remainingSeconds);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation 1: Required fields
    if (!regFullName.trim()) {
      setErrorMessage('Em vui lòng nhập đầy đủ Họ và tên nhé!');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Em vui lòng nhập Tên đăng nhập mong muốn!');
      return;
    }
    if (regUsername.trim().length < 3) {
      setErrorMessage('Tên đăng nhập phải có ít nhất 3 ký tự!');
      return;
    }
    const cleanUser = regUsername.trim();
    const isEmail = cleanUser.includes('@');

    if (!isEmail && !/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      setErrorMessage('Tên đăng nhập chỉ gồm các chữ cái tiếng Anh, chữ số và dấu gạch dưới (_) không dấu, hoặc địa chỉ email hợp lệ!');
      return;
    }

    // Validation 2: Password rules
    if (!regPassword) {
      setErrorMessage('Em hãy nhập Mật khẩu bảo mật nhé!');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu cần có độ dài tối thiểu 6 ký tự để bảo mật tài khoản!');
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (isEmail) {
        // Firebase Authentication email registration
        res = await AuthService.registerWithEmail({
          email: cleanUser,
          password: regPassword.trim(),
          fullName: regFullName.trim(),
          grade: regGrade,
          avatar: regAvatar,
        });
      } else {
        res = await AuthService.register({
          fullName: regFullName.trim(),
          username: cleanUser,
          password: regPassword.trim(),
          grade: regGrade,
          schoolClass: `Lớp ${regGrade}`,
          avatar: regAvatar,
        });
      }

      if (res.success && res.user) {
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
        setSuccessMessage('Chúc mừng! Em đã tạo tài khoản thành công.');
        // Auto-switch to login mode with prefilled credentials
        setUsername(res.user.email || res.user.username);
        setPassword(regPassword);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Đăng ký không thành công.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotUsername.trim() || !forgotFullName.trim()) {
      setErrorMessage('Em hãy điền đầy đủ Tên đăng nhập và Họ tên đã đăng ký để xác minh nhé!');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage('Hai mật khẩu mới chưa khớp nhau!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.recoverStudentPassword(
        forgotUsername,
        forgotFullName,
        forgotClass,
        forgotNewPassword
      );
      if (res.success) {
        confetti({ particleCount: 60, spread: 70 });
        setSuccessMessage('Đổi mật khẩu thành công! Em hãy dùng mật khẩu mới này để đăng nhập nhé.');
        setUsername(forgotUsername);
        setPassword(forgotNewPassword);
        setTimeout(() => {
          setViewMode('login');
          setSuccessMessage(null);
        }, 2000);
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoClick = async (demo: UserAccount) => {
    setUsername(demo.username);
    setPassword(demo.username === 'admin' ? 'admin123' : '123456');
    setErrorMessage(null);
    setSuccessMessage(null);

    const logged = await AuthService.quickDemoLogin(demo.username);
    if (logged) {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      onLoginSuccess(logged);
      onClose();
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const res = await AuthService.signInWithGoogle(roleTab);
      if (res.success && res.user) {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.message || 'Đăng nhập Google chưa thành công.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95 overflow-hidden my-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white font-black flex items-center justify-center transition cursor-pointer shadow-sm"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D EDUCATIONAL HERO HEADER */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-r from-blue-600 via-emerald-600 to-amber-500 text-white overflow-hidden">
          {/* Subtle background decorative shapes */}
          <div className="absolute -right-6 -bottom-8 opacity-20 pointer-events-none text-9xl">
            💻
          </div>
          <div className="absolute left-1/3 -top-6 opacity-15 pointer-events-none text-8xl">
            📚
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-3xl shadow-lg shrink-0 transform -rotate-3 hover:rotate-0 transition">
              {viewMode === 'register' ? '🎒' : viewMode === 'forgot' ? '🔑' : '🤖'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 bg-white/25 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-200">
                  HỆ THỐNG HỌC LIỆU SỐ TIỂU HỌC
                </span>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-900 rounded-md text-[10px] font-black shadow-xs">
                  KNTT 3-4-5
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 drop-shadow-sm flex items-center gap-2">
                <span>HỌC LIỆU TIN HỌC</span>
                <span className="text-amber-300 text-lg">✨</span>
              </h2>
              <p className="text-xs text-blue-100 font-bold mt-0.5 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-cyan-200" />
                <span>
                  {viewMode === 'register'
                    ? 'Đăng ký tài khoản học sinh mới'
                    : viewMode === 'forgot'
                    ? 'Khôi phục mật khẩu tài khoản học sinh'
                    : 'Khám phá thế giới Tin học cùng Robot AI'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* Rate limit warning banner */}
        {rateLimitSeconds > 0 && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center gap-2 text-amber-800 text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
            <span>Tạm dừng thử lại: Còn {rateLimitSeconds} giây...</span>
          </div>
        )}

        {/* ===================== VIEW 1: LOGIN FORM ===================== */}
        {viewMode === 'login' && (
          <div className="p-6 sm:p-7 space-y-5">
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email hoặc Tên Đăng Nhập:</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Email hoặc Tên đăng nhập (ví dụ: an@gmail.com, hocsinh3)..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition shadow-2xs"
                    autoFocus
                  />
                  <div className="absolute left-3.5 top-3.5 text-slate-400">👤</div>
                </div>
                <p className="text-[10px] text-slate-500 font-bold mt-1">
                  💡 Học sinh đăng nhập bằng Email hoặc Tên đăng nhập. Thầy/Cô quản trị đăng nhập bằng Email tài khoản.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mật Khẩu:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Quên mật khẩu?</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition shadow-2xs"
                  />
                  <div className="absolute left-3.5 top-3.5 text-slate-400">🔒</div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ACTION BUTTON: ĐĂNG NHẬP */}
              <button
                type="submit"
                disabled={isLoading || rateLimitSeconds > 0}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang kiểm tra thông tin...</span>
                  </span>
                ) : (
                  <>
                    <span>ĐĂNG NHẬP NGAY</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* ACTION BUTTON: ĐĂNG KÝ TÀI KHOẢN MỚI */}
              <button
                type="button"
                onClick={() => {
                  setViewMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 rounded-2xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs"
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>CHƯA CÓ TÀI KHOẢN? ĐĂNG KÝ TÀI KHOẢN HỌC SINH MỚI</span>
              </button>
            </form>

            {/* GOOGLE SIGN IN (FIREBASE AUTH) */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">
                Hoặc đăng nhập nhanh
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-black text-slate-700 shadow-2xs hover:shadow-xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Đang mở liên kết Google...' : 'Đăng nhập với Google Account'}</span>
            </button>

            {/* DEMO ACCOUNTS QUICK LOGIN CARDS */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                ⚡ TÀI KHOẢN MẪU DÀNH CHO THỬ NGHIỆM:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickDemoClick(acc)}
                    className="p-2.5 bg-slate-50 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-300 rounded-2xl text-left transition flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition">
                      {acc.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-800 truncate group-hover:text-amber-800">
                        {acc.fullName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold truncate">
                        @{acc.username}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW 2: REGISTER FORM ===================== */}
        {viewMode === 'register' && (
          <div className="p-6 sm:p-7 space-y-4 max-h-[75vh] overflow-y-auto">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  1. Họ và tên học sinh (*):
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An, Trần Thùy Linh..."
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition shadow-2xs"
                  required
                />
              </div>

              {/* Tên đăng nhập */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  2. Tên đăng nhập mong muốn (* không dấu, không trùng):
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Ví dụ: an_lop3, thuy_linh4, kiet5..."
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition shadow-2xs"
                  required
                />
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  💡 Gợi ý: Dùng tên em ghép với lớp học để dễ nhớ và không bị trùng!
                </p>
              </div>

              {/* Chọn khối lớp */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>3. Chọn Khối Lớp (*):</span>
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  {([3, 4, 5] as GradeLevel[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setRegGrade(g)}
                      className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        regGrade === g
                          ? 'bg-blue-600 text-white shadow-md scale-101'
                          : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Lớp {g}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  4. Mật khẩu (* tối thiểu 6 ký tự):
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Nhập mật khẩu bảo mật của em..."
                    className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Avatar picker */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  5. Chọn hình đại diện yêu thích:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {['👦', '👧', '🚀', '🤖', '🐱', '🦁', '🌟', '🎨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setRegAvatar(emoji)}
                      className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition cursor-pointer shrink-0 ${
                        regAvatar === emoji
                          ? 'bg-amber-100 border-3 border-amber-400 scale-110 shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 border-2 border-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="sm:w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="sm:w-2/3 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Đang khởi tạo tài khoản...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>TẠO TÀI KHOẢN HỌC SINH MỚI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================== VIEW 3: FORGOT PASSWORD ===================== */}
        {viewMode === 'forgot' && (
          <div className="p-6 sm:p-7 space-y-4">
            <div className="p-3.5 bg-blue-50 border-2 border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed font-semibold">
              💡 <strong>Học sinh thân mến:</strong> Em có thể tự đặt lại mật khẩu bằng cách xác minh đúng Tên đăng nhập, Họ tên và Lớp học của mình. Hoặc em có thể báo trực tiếp Thầy/Cô Tin học để Thầy/Cô bấm "Đặt lại mật khẩu" trong Bảng Quản Trị nhé!
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  1. Tên đăng nhập của em:
                </label>
                <input
                  type="text"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  placeholder="Ví dụ: hocsinh3, nam_an..."
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition shadow-2xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    2. Họ và tên chính xác:
                  </label>
                  <input
                    type="text"
                    value={forgotFullName}
                    onChange={(e) => setForgotFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh An..."
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    3. Lớp học của em:
                  </label>
                  <input
                    type="text"
                    value={forgotClass}
                    onChange={(e) => setForgotClass(e.target.value)}
                    placeholder="Ví dụ: 3A, 4B..."
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    4. Mật khẩu mới (* tối thiểu 6 ký tự):
                  </label>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    5. Nhập lại mật khẩu mới:
                  </label>
                  <input
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu mới..."
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="sm:w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="sm:w-2/3 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>XÁC NHẬN ĐẶT LẠI MẬT KHẨU</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
