import React, { useState } from 'react';
import { BannerConfig, DEFAULT_BANNER_CONFIG } from '../../types';
import { CloudinaryService } from '../../services/cloudinaryService';
import {
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Save,
  Eye,
  Sliders,
  Type,
  LogIn,
  UserCheck,
  Laptop,
  Smartphone,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  bannerConfig: BannerConfig;
  onSaveBannerConfig: (config: BannerConfig) => void;
}

// Curated educational banner templates for quick preview/selection
const SAMPLE_BANNERS = [
  {
    name: '🌟 Banner Học Liệu Tin Học (Ảnh bạn tải lên)',
    url: '/banner.svg',
    description: 'Bầu trời xanh, Robot AI thông minh, học sinh vui học & máy tính',
  },
  {
    name: 'Phòng Tin Học Vui Nhộn',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80',
    description: 'Lớp học hiện đại, học sinh tương tác học tập',
  },
  {
    name: 'Công Nghệ & Lập Trình Thiếu Nhi',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80',
    description: 'Không gian số, máy tính và đồ họa sáng tạo',
  },
  {
    name: 'Robot & Trí Tuệ Nhân Tạo',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&auto=format&fit=crop&q=80',
    description: 'Khoa học công nghệ và bạn Robot đồng hành',
  },
  {
    name: 'Bàn Học & Máy Tính Sáng Tạo',
    url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1600&auto=format&fit=crop&q=80',
    description: 'Bàn phím, chuột và màn hình máy tính trực quan',
  },
];

export const BannerSettingsManager: React.FC<Props> = ({
  bannerConfig,
  onSaveBannerConfig,
}) => {
  const [imageUrl, setImageUrl] = useState(bannerConfig.imageUrl || '');
  const [bgPosition, setBgPosition] = useState<BannerConfig['bgPosition']>(bannerConfig.bgPosition || 'center');
  const [bgSize, setBgSize] = useState<BannerConfig['bgSize']>(bannerConfig.bgSize || 'cover');
  const [overlayColor, setOverlayColor] = useState<BannerConfig['overlayColor']>(bannerConfig.overlayColor || 'gradient');
  const [opacity, setOpacity] = useState<number>(bannerConfig.opacity ?? 80);
  const [headline, setHeadline] = useState(bannerConfig.headline || DEFAULT_BANNER_CONFIG.headline || 'Học Liệu Tin Học 3–4–5!');
  const [tagline, setTagline] = useState(bannerConfig.tagline || DEFAULT_BANNER_CONFIG.tagline || 'Bộ Sách Kết Nối Tri Thức Với Cuộc Sống');
  const [subtext, setSubtext] = useState(bannerConfig.subtext || DEFAULT_BANNER_CONFIG.subtext || '');
  const [showMascot, setShowMascot] = useState(bannerConfig.showMascot ?? true);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewAuthMode, setPreviewAuthMode] = useState<'guest' | 'logged'>('guest');

  // Handle Upload from Computer with instant preview & Cloudinary CDN sync
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadPercent(15);
    setUploadSuccessMsg(null);

    // 1. Instant preview via FileReader (0ms wait time)
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setImageUrl(dataUrl);
        setUploadSuccessMsg(`Đang xử lý ảnh từ máy tính: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);

    // 2. Concurrently upload to Cloudinary for permanent CDN link across devices
    CloudinaryService.uploadFile(file, (p) => {
      setUploadPercent(p);
    })
      .then((result) => {
        setImageUrl(result.secureUrl);
        setUploadSuccessMsg(`Tải ảnh lên đám mây thành công: ${file.name}`);
        setTimeout(() => setUploadSuccessMsg(null), 4000);
      })
      .catch((err) => {
        console.warn('Cloudinary upload notice, using local image data:', err);
        setUploadSuccessMsg(`Đã nạp ảnh thành công từ máy tính: ${file.name}`);
        setTimeout(() => setUploadSuccessMsg(null), 4000);
      })
      .finally(() => {
        setIsUploading(false);
        e.target.value = '';
      });
  };

  // Apply URL from input
  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setImageUrl(customUrlInput.trim());
    setCustomUrlInput('');
    setUploadSuccessMsg('Đã áp dụng link ảnh công khai!');
    setTimeout(() => setUploadSuccessMsg(null), 3000);
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm('Thầy cô có muốn khôi phục lại Banner về ảnh chuẩn theo thiết kế SGK Kết Nối Tri Thức?')) {
      setImageUrl(DEFAULT_BANNER_CONFIG.imageUrl || '/banner.svg');
      setBgPosition('right');
      setBgSize('cover');
      setOverlayColor('none');
      setOpacity(85);
      setHeadline(DEFAULT_BANNER_CONFIG.headline || 'Học Liệu Tin Học 3–4–5!');
      setTagline(DEFAULT_BANNER_CONFIG.tagline || 'Bộ Sách Kết Nối Tri Thức Với Cuộc Sống');
      setSubtext(DEFAULT_BANNER_CONFIG.subtext || '');
      setShowMascot(false);

      const def: BannerConfig = {
        ...DEFAULT_BANNER_CONFIG,
        imageUrl: '/banner.svg',
        updatedAt: new Date().toISOString(),
      };
      onSaveBannerConfig(def);
      setUploadSuccessMsg('Đã khôi phục banner chuẩn SGK thành công!');
      setTimeout(() => setUploadSuccessMsg(null), 3000);
    }
  };

  // Save changes
  const handleSaveAll = () => {
    const updated: BannerConfig = {
      imageUrl: imageUrl.trim(),
      bgPosition,
      bgSize,
      overlayColor,
      opacity: Number(opacity) || 80,
      headline: headline.trim(),
      tagline: tagline.trim(),
      subtext: subtext.trim(),
      showMascot,
      updatedAt: new Date().toISOString(),
    };

    onSaveBannerConfig(updated);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    setUploadSuccessMsg('Đã lưu và đồng bộ cài đặt Banner Web App thành công!');
    setTimeout(() => setUploadSuccessMsg(null), 4000);
  };

  // Overlay background styles calculation
  const getOverlayBackground = () => {
    if (overlayColor === 'none') return 'transparent';
    if (overlayColor === 'dark') return 'rgba(15, 23, 42, 0.75)';
    if (overlayColor === 'light') return 'rgba(255, 255, 255, 0.75)';
    // Default gradient overlay: Kết Nối Tri Thức themed
    return 'linear-gradient(to right, rgba(15, 44, 89, 0.92) 0%, rgba(200, 16, 46, 0.78) 55%, rgba(240, 130, 0, 0.65) 100%)';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-lg">
              🖼️
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-200 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>CÀI ĐẶT GIAO DIỆN HỆ THỐNG</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Thay Đổi Ảnh Banner Trang Chủ Web App
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Tải ảnh nền banner từ máy tính hoặc nhập liên kết ảnh công khai. Tự động tương thích và co giãn đẹp mắt trên máy tính, máy tính bảng và điện thoại.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition cursor-pointer"
              title="Khôi phục nền chuyển màu đỏ cam ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
            </button>

            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs shadow-md transition transform hover:scale-102 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cài Đặt Banner</span>
            </button>
          </div>
        </div>

        {uploadSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs font-black text-emerald-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* LIVE INTERACTIVE BANNER PREVIEW */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              XEM TRƯỚC BANNER THỜI GIAN THỰC (LIVE PREVIEW)
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            {/* Device Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> Máy tính
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Điện thoại
              </button>
            </div>

            {/* Auth State Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewAuthMode('guest')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  previewAuthMode === 'guest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Khách (Chưa đăng nhập)
              </button>
              <button
                type="button"
                onClick={() => setPreviewAuthMode('logged')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  previewAuthMode === 'logged' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Đã đăng nhập
              </button>
            </div>
          </div>
        </div>

        {/* The Live Banner Frame */}
        <div className={`mx-auto transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-md' : 'w-full'}`}>
          <div
            style={{
              backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
              backgroundPosition: bgPosition,
              backgroundSize: bgSize,
              backgroundRepeat: 'no-repeat',
            }}
            className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 text-white shadow-2xl border-b-4 border-[#F08200] min-h-[220px] flex items-center ${
              !imageUrl ? 'bg-gradient-to-r from-[#0F2C59] via-[#C8102E] to-[#F08200]' : 'bg-slate-900'
            }`}
          >
            {/* Color Overlay Layer for perfect text contrast and character visibility */}
            {imageUrl && overlayColor !== 'none' && (
              <div
                style={{
                  background: getOverlayBackground(),
                  opacity: (opacity || 80) / 100,
                }}
                className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
              />
            )}

            {/* Left Content Area (Text & Buttons) */}
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFF0AD] text-[#0F2C59] rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#F08200] animate-spin" />
                <span>{tagline || 'Bộ Sách Kết Nối Tri Thức Với Cuộc Sống'}</span>
              </div>

              {previewAuthMode === 'guest' ? (
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black drop-shadow-sm leading-tight text-white">
                    {headline || 'Học Liệu Tin Học 3–4–5!'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#FFF0AD] font-bold leading-relaxed mt-1">
                    {subtext ||
                      'Khám phá bài giảng số tương tác, sơ đồ tư duy, mô phỏng gõ phím & chuột, trò chơi ôn tập và tương tác cùng Robot Tin Học!'}
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black drop-shadow-sm leading-tight text-white">
                    Chào bạn Học Sinh 👦
                  </h1>
                  <p className="text-xs sm:text-sm text-[#FFF0AD] font-bold leading-relaxed mt-1">
                    Chúc em một ngày học tập môn Tin học thật hứng khởi, tích lũy thêm nhiều sao vàng và thực hành sáng tạo!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                {previewAuthMode === 'guest' ? (
                  <>
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-[#FFF0AD] text-[#0F2C59] rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer border-2 border-[#F08200]"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#C8102E]" />
                      <span>Đăng Nhập Tài Khoản</span>
                    </button>

                    <button
                      type="button"
                      className="px-5 py-2.5 bg-[#C8102E] text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer border-2 border-[#FFF0AD]"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Đăng Ký Tài Khoản Mới</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-white/95 text-xs font-bold bg-[#0F2C59]/60 border border-[#F08200] px-4 py-2 rounded-2xl backdrop-blur-xs">
                    <span>✨ Em hãy chọn bài học ở danh sách bên dưới để bắt đầu học nhé!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative Mascot */}
            {showMascot && (
              <div className="absolute -right-6 -bottom-8 text-9xl opacity-30 sm:opacity-50 select-none pointer-events-none">
                🤖
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTROLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: TẢI ẢNH LÊN HOẶC NHẬP LINK */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <ImageIcon className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              1. NGUỒN ẢNH BANNER CHÍNH
            </h3>
          </div>

          {/* Option A: Tải từ máy tính */}
          <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Cách 1: Tải ảnh trực tiếp từ máy tính</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                PNG, JPG, WEBP, SVG
              </span>
            </div>

            <label className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs shadow-md transition flex flex-col items-center justify-center gap-2 cursor-pointer text-center">
              <Upload className="w-5 h-5 text-blue-200 animate-bounce" />
              <span>{isUploading ? `Đang tải ảnh lên... ${uploadPercent}%` : 'Bấm để chọn tệp ảnh từ máy tính của Thầy/Cô'}</span>
              <span className="text-[10px] font-normal text-blue-100">
                Lưu trữ CDN đám mây Cloudinary onjpako3 hoặc bộ nhớ dự án
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFile}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {isUploading && (
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  style={{ width: `${uploadPercent}%` }}
                  className="bg-blue-600 h-full transition-all duration-300"
                />
              </div>
            )}
          </div>

          {/* Option B: Nhập link ảnh trực tuyến */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-emerald-600" />
              <span>Cách 2: Nhập đường dẫn ảnh trực tuyến (Public URL)</span>
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://... ảnh banner công khai (.png, .jpg)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer shrink-0"
              >
                Áp dụng link
              </button>
            </div>

            {imageUrl && (
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                <span className="font-mono text-[11px] text-slate-600 truncate max-w-xs">
                  {imageUrl.startsWith('data:') ? 'Ảnh tải lên từ máy tính (Data URL)' : imageUrl}
                </span>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-rose-600 hover:text-rose-700 font-bold p-1 cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Gỡ ảnh này và quay lại nền gradient"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Gỡ ảnh
                </button>
              </div>
            )}
          </div>

          {/* Option C: Mẫu Banner Có Sẵn */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Hoặc chọn nhanh từ Kho mẫu Banner sư phạm:</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_BANNERS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setImageUrl(s.url);
                    setBgPosition('center');
                    setBgSize('cover');
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 text-left transition cursor-pointer group"
                >
                  <div className="font-black text-slate-800 text-[11px] group-hover:text-amber-800">
                    {s.name}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{s.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 2: TÙY CHỈNH BỐ CỤC, MÀU SẮC & LỚP PHỦ */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              2. BỐ CỤC &amp; HIỂN THỊ
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Vị trí ảnh nền */}
            <div>
              <label className="block font-black text-slate-700 mb-1.5">
                Vị trí căn chỉnh ảnh nền:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'center', label: 'Căn giữa (Center)' },
                  { id: 'right', label: 'Căn phải (Right)' },
                  { id: 'left', label: 'Căn trái (Left)' },
                  { id: 'top', label: 'Căn trên (Top)' },
                  { id: 'bottom', label: 'Căn dưới (Bottom)' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setBgPosition(pos.id as any)}
                    className={`px-3 py-2 rounded-xl font-bold transition text-xs cursor-pointer ${
                      bgPosition === pos.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Gợi ý: Chọn "Căn phải" nếu ảnh có nhân vật hoặc robot ở phía bên phải để tránh bị che bởi chữ.
              </p>
            </div>

            {/* Kiểu lớp phủ */}
            <div>
              <label className="block font-black text-slate-700 mb-1.5">
                Kiểu lớp phủ màu (Overlay):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gradient', label: 'Chuyển màu Kết nối tri thức (Đỏ-Cam-Xanh)' },
                  { id: 'dark', label: 'Tối nhẹ (Làm nổi chữ trắng)' },
                  { id: 'light', label: 'Sáng nhẹ' },
                  { id: 'none', label: 'Không phủ (Ảnh tự nhiên)' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setOverlayColor(c.id as any)}
                    className={`p-2.5 rounded-xl font-bold transition text-xs text-left cursor-pointer ${
                      overlayColor === c.id
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Độ mờ lớp phủ slider */}
            {overlayColor !== 'none' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-slate-700">Độ mờ lớp phủ tương phản:</span>
                  <span className="font-black text-indigo-700">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>20% (Trong suốt)</span>
                  <span>80% (Khuyên dùng để chữ sắc nét)</span>
                  <span>100% (Đậm nhất)</span>
                </div>
              </div>
            )}

            {/* Mascot Robot toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-black text-slate-800">Hiển thị Mascot Robot Tin học 🤖</span>
                <p className="text-[11px] text-slate-400">Hình minh họa 3D trang trí ở góc phải banner</p>
              </div>
              <input
                type="checkbox"
                checked={showMascot}
                onChange={(e) => setShowMascot(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PANEL 3: TÙY CHỈNH VĂN BẢN TIÊU ĐỀ */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Type className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            3. NỘI DUNG VĂN BẢN TRÊN BANNER
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-black text-slate-700 mb-1">
              Huy hiệu trên cùng (Tagline):
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Bộ Sách Kết Nối Tri Thức Với Cuộc Sống"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block font-black text-slate-700 mb-1">
              Tiêu đề chính (Headline):
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Học Liệu Tin Học 3–4–5!"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-black text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-black text-slate-700 mb-1">
              Đoạn văn giới thiệu / Lời chào:
            </label>
            <textarea
              rows={2}
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              placeholder="Khám phá bài giảng số tương tác, sơ đồ tư duy..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs shadow-md transition transform hover:scale-102 cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Toàn Bộ Cài Đặt Banner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
