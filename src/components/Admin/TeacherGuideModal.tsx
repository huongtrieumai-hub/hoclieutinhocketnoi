import React from 'react';
import { BookOpen, CheckCircle2, FileJson, Sparkles, Lightbulb, Video, Gamepad2, Copy, Image as ImageIcon, Database } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              📖
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Cẩm Nang Quản Trị Bài Giảng Dành Cho Giáo Viên Tin Học
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Hướng dẫn trực quan chi tiết – Thầy cô không cần biết lập trình vẫn dễ dàng làm chủ!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-sm text-slate-700 pr-1">
          {/* Mục 1: Soạn bài học mới */}
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <h4 className="font-black text-blue-900 text-base flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
              Soạn bài học mới (Không lo mất dữ liệu cũ)
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 font-semibold text-xs leading-relaxed text-blue-950">
              <li>Tại mục <strong>"Quản trị bài giảng Tin học"</strong>, nhấn nút <strong>"Soạn bài học mới 🚀"</strong>.</li>
              <li>Chọn Khối lớp (Lớp 3, 4 hoặc 5) và Chủ đề theo SGK Kết nối tri thức.</li>
              <li>Điền Tên bài học, Mục tiêu cần đạt và các nội dung Kiến thức trọng tâm ngắn gọn.</li>
              <li>Mỗi bài học được cấp một <strong>Mã định danh duy nhất (Unique ID)</strong>, bảo đảm 100% không bị ghi đè hay mất bài đã có.</li>
            </ol>
          </div>

          {/* Mục 2: Tài liệu & Học liệu bài giảng */}
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
            <h4 className="font-black text-indigo-900 text-base flex items-center gap-2 mb-2">
              <Video className="w-5 h-5 text-indigo-600" />
              <span>Đăng tải và liên kết tài liệu bài giảng</span>
            </h4>
            <p className="text-xs font-semibold text-indigo-950 leading-relaxed mb-2">
              Chuyển sang thẻ <strong>"B. Tài liệu &amp; Học liệu"</strong>, thầy cô có thể thêm không giới hạn:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs font-semibold text-indigo-900 ml-2">
              <li><strong>Video YouTube:</strong> Tự động nhận diện đường dẫn và nhúng trực tiếp trình phát video chuẩn vào bài học.</li>
              <li><strong>Bài trình chiếu PowerPoint (PPTX):</strong> Dán link Google Slides, OneDrive hoặc slide bài giảng.</li>
              <li><strong>Tài liệu PDF &amp; Word:</strong> Dán link phiếu bài tập, tóm tắt bài học hoặc đường dẫn Google Drive công khai.</li>
              <li><strong>Bài giảng e-learning / LMS:</strong> Dán link hệ thống LMS của trường để học sinh học tiếp.</li>
            </ul>
          </div>

          {/* Mục 3: Mô phỏng bài học tương tác (Gemini Canvas) */}
          {/* Mục 3: Sơ đồ tư duy & Mô phỏng tương tác */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-emerald-50 rounded-2xl border border-purple-200">
            <h4 className="font-black text-slate-900 text-base flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">3</span>
              <span>Sơ đồ tư duy &amp; Mô phỏng tương tác bài học (Thẻ C)</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 font-semibold text-xs leading-relaxed text-slate-800">
              <li>Chuyển sang thẻ <strong>"C. Sơ đồ tư duy &amp; Mô phỏng"</strong> trong hộp thoại soạn bài.</li>
              <li><strong>Phần Sơ đồ tư duy (được đưa lên đầu):</strong> Tải ảnh sơ đồ SGK từ máy tính (hỗ trợ phóng to, thu nhỏ và toàn màn hình) hoặc gắn link sơ đồ tương tác trực tuyến (Coggle, MindMeister, Miro, Canva...).</li>
              <li><strong>Phần Mô phỏng:</strong> Dán đường dẫn bài mô phỏng đã tạo bằng Gemini Canvas, Scratch MIT, PhET Interactive hoặc các Web App giáo dục để học sinh thực hành trực tiếp.</li>
              <li>Giao diện học sinh tích hợp chung vào 1 thẻ với <strong>thanh chuyển đổi mượt mà</strong> giữa Sơ đồ tư duy và Mô phỏng tương tác.</li>
            </ol>
          </div>

          {/* Mục 4: 12 dạng câu hỏi trắc nghiệm & Quy định xem 80% thời lượng */}
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
            <h4 className="font-black text-rose-900 text-base flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs">4</span>
              12 Dạng câu hỏi trắc nghiệm tự chấm &amp; Quy định xem 80% thời lượng bài học
            </h4>
            <div className="space-y-2 text-xs font-semibold text-rose-950 leading-relaxed">
              <p>
                <strong>Hỗ trợ đầy đủ 12 dạng câu hỏi phổ biến:</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] bg-white/70 p-2.5 rounded-xl border border-rose-200">
                <span>1. Một đáp án đúng (A, B, C, D)</span>
                <span>2. Nhiều đáp án đúng (Checkbox)</span>
                <span>3. Đúng – Sai (True / False)</span>
                <span>4. Điền vào chỗ trống (Từ còn thiếu)</span>
                <span>5. Ghép đôi đối tượng (Nối vế)</span>
                <span>6. Kéo thả phân loại vào nhóm</span>
                <span>7. Sắp xếp thứ tự các bước</span>
                <span>8. Chọn đáp án qua hình ảnh</span>
                <span>9. Tìm lỗi sai &amp; sửa đúng</span>
                <span>10. Trắc nghiệm tình huống thực tế</span>
                <span>11. Chọn vị trí trên hình (Hotspots)</span>
                <span>12. Trắc nghiệm âm thanh / video clip</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs pt-1">
                <li><strong>Tải lên hình ảnh:</strong> Thầy cô có thể tải ảnh trực tiếp từ máy tính hoặc dán link ảnh minh họa cho câu hỏi và cho từng phương án trả lời.</li>
              </ul>
            </div>
          </div>

          {/* Mục 6: Sao chép (Duplicate) & Lưu trữ dữ liệu */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <h4 className="font-black text-amber-900 text-base flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">6</span>
              <Copy className="w-5 h-5 text-amber-600" />
              <span>Chức năng Sao chép bài học &amp; Quản lý lưu trữ</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs font-semibold text-amber-950">
              <li><strong>Sao chép bài học (Duplicate):</strong> Tại danh sách bài giảng, bấm nút icon chiếc kẹp giấy sao chép để nhân bản toàn bộ bài học thành bản mới, giúp soạn các bài có cấu trúc tương tự cực nhanh.</li>
              <li><strong>Lưu bản nháp vs Xuất bản:</strong> Giáo viên có thể bấm <em>"Lưu bản nháp"</em> khi chưa hoàn thiện hoặc <em>"Xuất bản bài học"</em> để học sinh nhìn thấy ngay.</li>
              <li><strong>Sao lưu an toàn (JSON Backup):</strong> Thầy cô nên định kỳ nhấn tab <em>"Sao Lưu &amp; Khôi Phục (JSON)"</em> để tải file dự phòng về máy tính cá nhân.</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            Đã hiểu rõ! Bắt đầu quản trị bài giảng ✨
          </button>
        </div>
      </div>
    </div>
  );
};
