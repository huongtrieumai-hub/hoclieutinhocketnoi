import React, { useState } from 'react';
import { StudentScoreRecord } from '../../types';
import { Trophy, Download, Search, CheckCircle2, Star } from 'lucide-react';

interface Props {
  scores: StudentScoreRecord[];
}

export const StudentScoresView: React.FC<Props> = ({ scores }) => {
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = scores.filter((s) => {
    const matchGrade = filterGrade === 'all' || String(s.grade) === filterGrade;
    const matchSearch =
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchGrade && matchSearch;
  });

  const exportToCSV = () => {
    if (scores.length === 0) {
      alert('Chưa có dữ liệu điểm số nào để xuất file!');
      return;
    }
    const headers = ['Mã lượt', 'Họ tên học sinh', 'Khối lớp', 'Tên bài học', 'Điểm đạt được', 'Tổng câu hỏi', 'Tỷ lệ %', 'Ngày làm bài'];
    const rows = scores.map((s) => [
      s.id,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `Lớp ${s.grade}`,
      `"${s.lessonTitle.replace(/"/g, '""')}"`,
      s.score,
      s.totalQuestions,
      `${s.percentage}%`,
      s.completedAt,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BangDiem_TinHoc_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-600">Lọc theo khối:</span>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none"
            >
              <option value="all">Tất cả các lớp</option>
              <option value="3">Khối Lớp 3</option>
              <option value="4">Khối Lớp 4</option>
              <option value="5">Khối Lớp 5</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh, bài học..."
              className="px-3 py-1.5 pl-8 bg-white border border-slate-300 rounded-xl text-xs font-bold w-60 focus:outline-none"
            >
            </input>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Báo Cáo CSV (Excel)</span>
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <span className="text-[11px] font-bold text-blue-600 uppercase">TỔNG LƯỢT HỌC SINH LÀM BÀI</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{scores.length} lượt</div>
        </div>
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">TỶ LỆ ĐẠT ĐIỂM GIỎI (&ge;80%)</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            {scores.length > 0
              ? `${Math.round((scores.filter((s) => s.percentage >= 80).length / scores.length) * 100)}%`
              : '0%'}
          </div>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <span className="text-[11px] font-bold text-amber-600 uppercase">ĐIỂM TRUNG BÌNH CHUNG</span>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {scores.length > 0
              ? `${Math.round(scores.reduce((acc, s) => acc + s.percentage, 0) / scores.length)}%`
              : '0%'}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Tên Học Sinh</th>
                <th className="py-3 px-4">Khối Lớp</th>
                <th className="py-3 px-4">Tên Bài Học</th>
                <th className="py-3 px-4">Kết Quả</th>
                <th className="py-3 px-4">Tỷ Lệ</th>
                <th className="py-3 px-4">Ngày Hoàn Thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Chưa có học sinh nào nộp kết quả bài kiểm tra.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-black text-slate-900 flex items-center gap-1.5">
                      <span>👧</span>
                      <span>{item.studentName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-lg text-[10px] font-black">
                        Lớp {item.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.lessonTitle}</td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-amber-600">
                        {item.score}/{item.totalQuestions}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                          item.percentage >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.percentage >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.completedAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
