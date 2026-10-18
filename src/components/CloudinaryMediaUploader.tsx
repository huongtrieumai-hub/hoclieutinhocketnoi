import React, { useState, useRef } from 'react';
import { CloudinaryService } from '../services/cloudinaryService';
import { UploadCloud, CheckCircle2, AlertCircle, Music, Image as ImageIcon, Loader2, Copy, ExternalLink, X } from 'lucide-react';

interface Props {
  acceptType?: 'image' | 'audio' | 'all';
  label?: string;
  onUploadSuccess?: (url: string) => void;
  currentUrl?: string;
  className?: string;
}

export const CloudinaryMediaUploader: React.FC<Props> = ({
  acceptType = 'all',
  label = 'Tải Lên Tệp Từ Máy Tính (Cloudinary)',
  onUploadSuccess,
  currentUrl = '',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>(currentUrl);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptMime =
    acceptType === 'image'
      ? 'image/*'
      : acceptType === 'audio'
      ? 'audio/*'
      : 'image/*,audio/*,video/*';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setErrorMsg(null);

    try {
      const result = await CloudinaryService.uploadFile(file, (percent) => {
        setProgress(percent);
      });

      setUploadedUrl(result.secureUrl);
      if (onUploadSuccess) {
        onUploadSuccess(result.secureUrl);
      }
    } catch (err: unknown) {
      console.error('[Cloudinary Upload Error]:', err);
      const msg = err instanceof Error ? err.message : 'Tải lên không thành công.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyLink = () => {
    if (!uploadedUrl) return;
    navigator.clipboard.writeText(uploadedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleRemove = () => {
    setUploadedUrl('');
    if (onUploadSuccess) {
      onUploadSuccess('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isAudio =
    uploadedUrl.match(/\.(mp3|wav|m4a|aac|ogg)(\?.*)?$/i) ||
    acceptType === 'audio';

  return (
    <div className={`space-y-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          {acceptType === 'audio' ? (
            <Music className="w-4 h-4 text-purple-600" />
          ) : (
            <ImageIcon className="w-4 h-4 text-blue-600" />
          )}
          <span>{label}</span>
        </label>
        <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-md">
          Cloudinary onjpako3
        </span>
      </div>

      {/* Upload Box / Input */}
      {!uploadedUrl ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptMime}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id="cloudinary-file-input"
          />

          <label
            htmlFor="cloudinary-file-input"
            className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl cursor-pointer transition text-center ${
              isUploading
                ? 'border-blue-400 bg-blue-50/50 cursor-wait'
                : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30'
            }`}
          >
            {isUploading ? (
              <div className="space-y-2 w-full max-w-xs">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <div className="text-xs font-black text-blue-800">
                  Đang tải tệp lên Cloudinary... {progress}%
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
                <div className="text-xs font-black text-slate-800">
                  Nhấn để chọn tệp {acceptType === 'audio' ? 'Âm thanh' : acceptType === 'image' ? 'Hình ảnh' : 'Hình ảnh / Âm thanh'} từ máy tính
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  Hỗ trợ JPG, PNG, WEBP, MP3, WAV, AAC... Tự động lưu lên Cloudinary onjpako3
                </div>
              </div>
            )}
          </label>
        </div>
      ) : (
        /* Preview uploaded file */
        <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-black text-slate-800 truncate">
                Đã tải lên Cloudinary thành công!
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Xóa và tải tệp khác"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Media Player or Image Preview */}
          {isAudio ? (
            <div className="pt-1">
              <audio controls src={uploadedUrl} className="w-full h-10 rounded-xl" />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center">
              <img
                src={uploadedUrl}
                alt="Cloudinary Media Preview"
                className="max-h-44 object-contain rounded-lg"
              />
            </div>
          )}

          {/* URL & Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              readOnly
              value={uploadedUrl}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isCopied ? 'Đã chép!' : 'Sao chép'}</span>
            </button>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition shrink-0"
              title="Mở liên kết Cloudinary"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Error notification */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
