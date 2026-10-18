import React, { useState } from 'react';
import { LearningMaterialItem } from '../../types';
import {
  Video,
  FileText,
  Presentation,
  FileCode,
  Globe,
  ExternalLink,
  Play,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface Props {
  materials?: LearningMaterialItem[];
  lessonTitle: string;
  materialsWatchSeconds?: number;
  requiredWatchSeconds?: number;
  hasMetWatchRequirement?: boolean;
  onAttemptCompleteLesson?: () => void;
  isCompleted?: boolean;
}

// Convert normal YouTube watch link to embed link
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
}

export const SectionMaterials: React.FC<Props> = ({
  materials = [],
  lessonTitle,
  materialsWatchSeconds = 0,
  requiredWatchSeconds = 180,
  hasMetWatchRequirement = false,
  onAttemptCompleteLesson,
  isCompleted = false,
}) => {
  const [selectedMatId, setSelectedMatId] = useState<string>(() => {
    return materials.length > 0 ? materials[0].id : '';
  });

  const required80Seconds = Math.round(requiredWatchSeconds * 0.8);
  const currentPct = Math.min(100, Math.round((materialsWatchSeconds / requiredWatchSeconds) * 100));
  const reqPct = 80;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!materials || materials.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border-2 border-slate-200">
        <Video className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h4 className="text-base font-black text-slate-700">Chưa có tài liệu bài giảng đính kèm</h4>
        <p className="text-xs text-slate-500 mt-1">
          Giáo viên có thể thêm Video YouTube, Slide PowerPoint hoặc file PDF trong mục "Quản trị bài giảng Tin học".
        </p>
      </div>
    );
  }

  const activeMat = materials.find((m) => m.id === selectedMatId) || materials[0];
  const ytEmbed = activeMat.type === 'youtube' ? getYouTubeEmbedUrl(activeMat.url) : null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Video className="w-5 h-5 text-rose-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'pptx':
        return <Presentation className="w-5 h-5 text-orange-500" />;
      case 'docx':
        return <FileCode className="w-5 h-5 text-blue-500" />;
      default:
        return <Globe className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-md">
            🎬
          </div>
          <div>
            <span className="px-3 py-0.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider text-amber-200">
              PHẦN 2: VIDEO &amp; TÀI LIỆU BÀI GIẢNG
            </span>
            <h3 className="text-2xl font-black mt-0.5">Kho Học Liệu Trực Quan</h3>
          </div>
        </div>

        {/* Live Watch Status Capsule */}
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 text-xs font-black">
          <Clock className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Thời gian xem: {formatTime(materialsWatchSeconds)} / {formatTime(requiredWatchSeconds)}</span>
        </div>
      </div>

      {/* 80% Duration Requirement Progress Bar Card */}
      <div className={`p-5 rounded-3xl border-3 shadow-md transition-all ${
        hasMetWatchRequirement
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-400'
          : 'bg-gradient-to-r from-amber-50 via-orange-50 to-blue-50 border-amber-300'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {hasMetWatchRequirement ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Điều Kiện Hoàn Thành Bài Học
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  hasMetWatchRequirement ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {hasMetWatchRequirement ? '✅ ĐÃ ĐỦ ĐIỀU KIỆN (≥ 80%)' : `⏳ BẮT BUỘC XEM 80% THỜI LƯỢNG`}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                {hasMetWatchRequirement
                  ? 'Chúc mừng em! Em đã theo dõi đủ 80% thời lượng quy định và có thể hoàn thành bài học để nhận 3 sao vàng!'
                  : `Em cần xem video và tài liệu ít nhất ${formatTime(required80Seconds)} (80% của ${formatTime(requiredWatchSeconds)}). Hãy tiếp tục theo dõi thêm ${Math.max(0, required80Seconds - materialsWatchSeconds)} giây nữa nhé!`}
              </p>
            </div>
          </div>

          {/* Action button: When >= 80%, show Complete Lesson button */}
          {onAttemptCompleteLesson && (
            <button
              onClick={onAttemptCompleteLesson}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition transform hover:scale-105 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-600 text-white'
                  : hasMetWatchRequirement
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-2 ring-emerald-300'
                  : 'bg-slate-200 text-slate-500 hover:bg-amber-100 hover:text-amber-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{isCompleted ? 'Đã hoàn thành bài ⭐' : hasMetWatchRequirement ? 'Hoàn thành bài học ⭐' : 'Xem tiến độ hoàn thành'}</span>
            </button>
          )}
        </div>

        {/* Progress Tracker Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-black text-slate-600">
            <span>Tiến độ đã xem: {currentPct}% ({formatTime(materialsWatchSeconds)})</span>
            <span className="flex items-center gap-1 text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mốc hoàn thành 80%: {formatTime(required80Seconds)}</span>
            </span>
          </div>

          <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            {/* 80% Threshold Marker Line */}
            <div
              style={{ left: '80%' }}
              className="absolute top-0 bottom-0 w-1 bg-amber-600 z-10 shadow"
              title="Mốc tối thiểu 80%"
            />

            <div
              style={{ width: `${Math.min(100, currentPct)}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                hasMetWatchRequirement
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-green-600'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Materials List Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {materials.map((mat) => {
          const isSelected = activeMat.id === mat.id;
          return (
            <button
              key={mat.id}
              onClick={() => setSelectedMatId(mat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md scale-102 ring-2 ring-blue-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {getIcon(mat.type)}
              <span className="truncate max-w-[200px]">{mat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Material Display Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-blue-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              {getIcon(activeMat.type)}
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-800">{activeMat.title}</h4>
              {activeMat.description && (
                <p className="text-xs text-slate-500 font-semibold">{activeMat.description}</p>
              )}
            </div>
          </div>

          <a
            href={activeMat.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Mở trong tab mới</span>
          </a>
        </div>

        {/* Embedded Content */}
        {activeMat.type === 'youtube' && ytEmbed ? (
          <div className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-900 border-2 border-slate-200 shadow-inner">
            <iframe
              src={ytEmbed}
              title={activeMat.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
              {activeMat.type === 'pdf' ? '📄' : activeMat.type === 'pptx' ? '📊' : '🌐'}
            </div>
            <div>
              <h5 className="text-base font-black text-slate-800">{activeMat.title}</h5>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Tài liệu học tập được chia sẻ công khai. Em có thể nhấp vào nút dưới đây để xem trực tiếp trên trình duyệt.
              </p>
            </div>
            <div>
              <a
                href={activeMat.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs shadow-md transition transform hover:scale-105"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Xem Ngay Tài Liệu Này 🚀</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
