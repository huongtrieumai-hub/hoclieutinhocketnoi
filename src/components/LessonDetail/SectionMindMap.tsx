import React, { useState } from 'react';
import { MindMapImageItem } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Globe,
  ExternalLink,
  RefreshCw,
  Compass,
} from 'lucide-react';

interface Props {
  data?: {
    rootTitle?: string;
    rootSubtitle?: string;
    externalMindMapUrl?: string;
    externalMindMapTitle?: string;
    allowEmbed?: boolean;
    branches?: any[];
  };
  mindMapImages?: MindMapImageItem[];
}

export const SectionMindMap: React.FC<Props> = ({ data, mindMapImages = [] }) => {
  const externalUrl = data?.externalMindMapUrl?.trim();
  const externalTitle = data?.externalMindMapTitle?.trim() || 'Sơ Đồ Tư Duy Tương Tác Web Ngoài';

  // Mode: 'external' (interactive web mind map) | 'images' (SGK diagram images)
  const [viewMode, setViewMode] = useState<'external' | 'images'>(() => {
    if (externalUrl) return 'external';
    if (mindMapImages.length > 0) return 'images';
    return 'external';
  });

  // Mindmap Image Viewer State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imgZoom, setImgZoom] = useState(1);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);

  // External MindMap Iframe State
  const [iframeKey, setIframeKey] = useState(1);
  const [isIframeFullscreen, setIsIframeFullscreen] = useState(false);

  const activeImage = mindMapImages.length > 0 ? mindMapImages[activeImageIndex] : null;
  const hasExternal = Boolean(externalUrl);
  const hasImages = mindMapImages.length > 0;

  // Empty state when neither is provided
  if (!hasExternal && !hasImages) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-500 rounded-3xl text-white shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-md">
            🌳
          </div>
          <div>
            <span className="px-3 py-0.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider text-amber-200">
              PHẦN 4: SƠ ĐỒ TƯ DUY KIẾN THỨC
            </span>
            <h3 className="text-2xl font-black mt-0.5">Sơ Đồ Tư Duy Bài Học</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-purple-200 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
            🌳
          </div>
          <h4 className="text-base font-black text-slate-800">Chưa có sơ đồ tư duy cho bài học này</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Giáo viên có thể gắn link sơ đồ tư duy tương tác trực tuyến từ Coggle, MindMeister, Miro, GitMind hoặc tải ảnh sơ đồ SGK trong phần <strong>"Quản trị bài giảng Tin học"</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-500 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-md">
            🌳
          </div>
          <div>
            <span className="px-3 py-0.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider text-amber-200">
              PHẦN 4: SƠ ĐỒ TƯ DUY KIẾN THỨC
            </span>
            <h3 className="text-2xl font-black mt-0.5">Sơ Đồ Tư Duy Bài Học</h3>
          </div>
        </div>

        {/* External direct link button if available */}
        {hasExternal && externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-black rounded-2xl shadow transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Mở trên Web gốc 🚀</span>
          </a>
        )}
      </div>

      {/* Navigation Switcher Tabs if both external link & SGK images exist */}
      {hasExternal && hasImages && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-black">
          <button
            onClick={() => setViewMode('external')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
              viewMode === 'external'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>🌐 Sơ Đồ Tư Duy Tương Tác Web Ngoài (Coggle/Miro/...)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setViewMode('images')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
              viewMode === 'images'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>🖼️ Hình Ảnh Sơ Đồ Chuẩn SGK ({mindMapImages.length})</span>
          </button>
        </div>
      )}

      {/* VIEW 1: INTERACTIVE EXTERNAL MIND MAP (COGGLE, MINDMEISTER, MIRO, CANVA, ETC.) */}
      {(viewMode === 'external' || !hasImages) && hasExternal && externalUrl && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-blue-200 space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">
                🌐
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded-md">
                    SƠ ĐỒ TƯ DUY TƯƠNG TÁC TỪ WEB KHÁC
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Đang kết nối
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-800 mt-0.5">{externalTitle}</h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                title="Tải lại sơ đồ"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsIframeFullscreen(true)}
                className="flex items-center gap-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Xem toàn màn hình"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Toàn màn hình</span>
              </button>

              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở trong Tab mới 🚀</span>
              </a>
            </div>
          </div>

          {/* Embedded Interactive Viewer */}
          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-inner relative min-h-[540px]">
            <iframe
              key={iframeKey}
              src={externalUrl}
              title={externalTitle}
              className="w-full h-[540px] md:h-[640px] border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50/80 rounded-2xl border border-blue-100 text-xs font-semibold text-blue-900">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                💡 <em>Gợi ý tương tác:</em> Em có thể lăn chuột để phóng to/thu nhỏ, giữ chuột để kéo di chuyển sơ đồ và nhấp chuột vào các nhánh để học bài nhé!
              </span>
            </div>
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 underline font-black text-xs shrink-0"
            >
              Không tải được sơ đồ? Bấm vào đây để mở trực tiếp
            </a>
          </div>
        </div>
      )}

      {/* Fullscreen Modal for External Interactive Mind Map */}
      {isIframeFullscreen && externalUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col p-4 animate-in fade-in">
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/30 flex items-center justify-center text-lg">
                🌐
              </div>
              <div>
                <h4 className="text-base font-black">{externalTitle}</h4>
                <span className="text-xs text-slate-300">Sơ đồ tư duy tương tác toàn màn hình</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở trong Tab mới</span>
              </a>
              <button
                onClick={() => setIsIframeFullscreen(false)}
                className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition"
                title="Thu nhỏ"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-2xl bg-slate-900 mt-3 border border-white/10 shadow-2xl">
            <iframe
              src={externalUrl}
              title={externalTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            />
          </div>
        </div>
      )}

      {/* VIEW 2: HÌNH ẢNH SƠ ĐỒ TƯ DUY KIẾN THỨC SGK */}
      {(viewMode === 'images' || !hasExternal) && hasImages && activeImage && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-purple-200 space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-black text-purple-700 uppercase tracking-wider">
                HÌNH ẢNH SƠ ĐỒ TƯ DUY CHUẨN SGK:
              </span>
              <h4 className="text-lg font-black text-slate-800">{activeImage.title}</h4>
              {activeImage.caption && (
                <p className="text-xs text-slate-500 font-semibold">{activeImage.caption}</p>
              )}
            </div>

            {/* Image Viewer Controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setImgZoom((z) => Math.min(2.5, z + 0.25))}
                className="p-1.5 bg-white hover:bg-purple-100 text-slate-700 hover:text-purple-700 rounded-xl transition cursor-pointer"
                title="Phóng to ảnh"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImgZoom((z) => Math.max(0.75, z - 0.25))}
                className="p-1.5 bg-white hover:bg-purple-100 text-slate-700 hover:text-purple-700 rounded-xl transition cursor-pointer"
                title="Thu nhỏ ảnh"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImgZoom(1)}
                className="px-2 py-1 bg-white hover:bg-purple-100 text-slate-700 hover:text-purple-700 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Đặt lại kích thước"
              >
                {Math.round(imgZoom * 100)}%
              </button>
              <button
                onClick={() => setIsFullscreenImage(true)}
                className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition cursor-pointer shadow-xs"
                title="Xem toàn màn hình"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Multiple Mind Maps Switcher if more than 1 */}
          {mindMapImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {mindMapImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setImgZoom(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    activeImageIndex === idx
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sơ đồ {idx + 1}: {img.title}
                </button>
              ))}
            </div>
          )}

          {/* Image Container */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-900/5 min-h-[360px] flex items-center justify-center p-4">
            <img
              src={activeImage.imageUrl}
              alt={activeImage.title}
              style={{
                transform: `scale(${imgZoom})`,
                transition: 'transform 0.25s ease-out',
                maxHeight: '520px',
              }}
              className="object-contain rounded-xl shadow-lg cursor-zoom-in"
              onClick={() => setIsFullscreenImage(true)}
            />
          </div>

          <div className="text-center text-xs text-slate-500 font-semibold">
            🔍 <em>Nhấn trực tiếp vào ảnh hoặc bấm nút ⛶ để xem toàn màn hình rõ nét trên máy tính và điện thoại.</em>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal for Mind Map Image */}
      {isFullscreenImage && activeImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col p-4 animate-in fade-in">
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/20">
            <div>
              <h4 className="text-base font-black">{activeImage.title}</h4>
              <span className="text-xs text-slate-400">Xem toàn màn hình độ phân giải cao</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setImgZoom((z) => Math.min(3, z + 0.25))}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white cursor-pointer"
                title="Phóng to"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setImgZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white cursor-pointer"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setImgZoom(1)}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                Đặt lại ({Math.round(imgZoom * 100)}%)
              </button>
              <button
                onClick={() => setIsFullscreenImage(false)}
                className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
                title="Đóng toàn màn hình"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={activeImage.imageUrl}
              alt={activeImage.title}
              style={{
                transform: `scale(${imgZoom})`,
                transition: 'transform 0.2s ease-out',
                maxWidth: '90vw',
                maxHeight: '80vh',
              }}
              className="object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
