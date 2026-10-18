import React, { useState } from 'react';
import { MousePointer, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

type MouseTask = 'single_click' | 'double_click' | 'right_click' | 'drag_drop';

export const MouseSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MouseTask>('single_click');
  const [singleScore, setSingleScore] = useState(0);
  const [doubleUnlocked, setDoubleUnlocked] = useState(false);
  const [rightMenuOpen, setRightMenuOpen] = useState(false);
  const [rightClickedItem, setRightClickedItem] = useState<string | null>(null);

  // Drag & drop state
  const [apples, setApples] = useState([
    { id: 1, name: 'Quả táo đỏ 🍎', inBasket: false },
    { id: 2, name: 'Quả táo xanh 🍏', inBasket: false },
    { id: 3, name: 'Ngôi sao vàng ⭐', inBasket: false },
  ]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleSingleClickTarget = () => {
    setSingleScore((s) => s + 1);
    if ((singleScore + 1) % 5 === 0) {
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const handleDoubleClickChest = () => {
    setDoubleUnlocked(true);
    confetti({ particleCount: 70, spread: 80 });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setRightMenuOpen(true);
  };

  const handleDragStart = (id: number) => {
    setDraggedItem(id);
  };

  const handleDropToBasket = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem !== null) {
      setApples((prev) =>
        prev.map((item) => (item.id === draggedItem ? { ...item, inBasket: true } : item))
      );
      setDraggedItem(null);
      confetti({ particleCount: 40, spread: 50 });
    }
  };

  const resetAll = () => {
    setSingleScore(0);
    setDoubleUnlocked(false);
    setRightMenuOpen(false);
    setRightClickedItem(null);
    setApples(apples.map((a) => ({ ...a, inBasket: false })));
  };

  const allApplesInBasket = apples.every((a) => a.inBasket);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-blue-200">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-1">
            MÔ PHỎNG THAO TÁC CHUỘT ĐIÊU LUYỆN
          </span>
          <h3 className="text-xl font-black text-slate-800">Luyện 4 Thao Tác Chuột Chuẩn SGK</h3>
        </div>
        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
        >
          <RefreshCw className="w-4 h-4" /> Làm lại
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 my-4">
        {[
          { id: 'single_click', label: '1. Nhấp đơn (Click chuột trái)', icon: '🎯' },
          { id: 'double_click', label: '2. Nhấp đúp (Double click)', icon: '🎁' },
          { id: 'right_click', label: '3. Nhấp chuột phải', icon: '📋' },
          { id: 'drag_drop', label: '4. Kéo và thả (Drag & Drop)', icon: '🧺' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MouseTask)}
            className={`px-4 py-2 rounded-2xl text-sm font-black transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Single Click */}
      {activeTab === 'single_click' && (
        <div className="p-8 bg-gradient-to-b from-sky-50 to-blue-50 rounded-2xl border-2 border-sky-200 text-center">
          <h4 className="text-lg font-black text-blue-900 mb-1">Thao tác: Nhấp chuột trái một lần bằng ngón tay trỏ</h4>
          <p className="text-slate-600 text-sm mb-6">Hãy nhấp vào chú bóng bay may mắn để tích luỹ điểm!</p>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleSingleClickTarget}
              className="w-28 h-28 bg-gradient-to-tr from-rose-500 to-amber-400 rounded-full shadow-xl flex flex-col items-center justify-center text-white font-black hover:scale-110 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <span className="text-3xl">🎈</span>
              <span className="text-xs uppercase mt-1">Bấm tớ đi!</span>
            </button>
          </div>

          <div className="mt-6 inline-flex items-center gap-3 px-6 py-2.5 bg-white rounded-full border border-blue-200 shadow-md">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="font-extrabold text-slate-700">
              Số lần nhấp chuẩn xác: <strong className="text-2xl text-blue-600">{singleScore}</strong> cái
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Double Click */}
      {activeTab === 'double_click' && (
        <div className="p-8 bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 text-center">
          <h4 className="text-lg font-black text-amber-900 mb-1">Thao tác: Nhấp đúp (Bấm nút trái 2 lần liên tiếp thật nhanh)</h4>
          <p className="text-slate-600 text-sm mb-6">Hãy nhấp đúp vào chiếc rương ma thuật để mở kho báu tri thức!</p>

          <div className="flex flex-col items-center justify-center">
            <div
              onDoubleClick={handleDoubleClickChest}
              className={`w-36 h-36 rounded-3xl flex flex-col items-center justify-center text-5xl cursor-pointer transition-all shadow-xl select-none ${
                doubleUnlocked
                  ? 'bg-gradient-to-tr from-emerald-400 to-teal-500 ring-4 ring-emerald-300 scale-105'
                  : 'bg-gradient-to-tr from-amber-400 to-orange-500 hover:scale-105 active:scale-95'
              }`}
            >
              <span>{doubleUnlocked ? '💎' : '🎁'}</span>
              <span className="text-xs font-black text-white mt-2 px-2 py-0.5 bg-black/20 rounded-full">
                {doubleUnlocked ? 'ĐÃ MỞ RƯƠNG!' : 'NHẤP ĐÚP VÀO ĐÂY'}
              </span>
            </div>

            {doubleUnlocked ? (
              <div className="mt-4 p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-800 font-bold max-w-md">
                🎉 Hoan hô! Em đã thành thạo thao tác Nhấp đúp chuột! Trong máy tính, nhấp đúp thường dùng để mở một tệp bài học hoặc khởi động một phần mềm đó!
              </div>
            ) : (
              <p className="text-xs text-amber-700 mt-4 font-semibold">
                💡 <em>Mẹo: Bấm "tạch - tạch" 2 lần thật nhanh bằng ngón trỏ nhé!</em>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Right Click */}
      {activeTab === 'right_click' && (
        <div className="p-8 bg-gradient-to-b from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 text-center">
          <h4 className="text-lg font-black text-purple-900 mb-1">Thao tác: Nhấp chuột phải bằng ngón tay giữa</h4>
          <p className="text-slate-600 text-sm mb-6">Hãy nhấp chuột phải vào vùng bảng dưới đây để mở Bảng chọn lệnh (Menu)!</p>

          <div
            onContextMenu={handleContextMenu}
            className="w-full max-w-md mx-auto h-44 bg-white rounded-2xl border-2 border-dashed border-purple-400 flex flex-col items-center justify-center relative cursor-context-menu shadow-inner p-4"
          >
            <MousePointer className="w-10 h-10 text-purple-500 mb-2" />
            <span className="text-sm font-extrabold text-purple-800">
              NHẤP CHUỘT PHẢI VÀO Ô NÀY!
            </span>
            <span className="text-xs text-slate-500 mt-1">(Bằng ngón tay giữa của bàn tay phải)</span>

            {rightMenuOpen && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 w-48 text-left z-10 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                  MENU LỆNH TẮT
                </div>
                {['Mở bài giảng', 'Tạo thư mục mới', 'Đổi tên tệp', 'Xem thông tin'].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setRightClickedItem(item);
                      setRightMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-purple-100 hover:text-purple-900 transition flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <span className="text-[10px] text-slate-400">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {rightClickedItem && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-900 rounded-xl text-sm font-bold">
              <CheckCircle2 className="w-4 h-4 text-purple-700" />
              <span>Em vừa chọn lệnh: <strong>"{rightClickedItem}"</strong>! Nhấp chuột phải rất tiện lợi đúng không nào!</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Drag & Drop */}
      {activeTab === 'drag_drop' && (
        <div className="p-8 bg-gradient-to-b from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
          <div className="text-center mb-6">
            <h4 className="text-lg font-black text-emerald-900 mb-1">Thao tác: Kéo và thả (Drag and Drop)</h4>
            <p className="text-slate-600 text-sm">
              Nhấn giữ chuột trái vào đồ vật, kéo sang chiếc giỏ rồi thả chuột ra!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Items to drag */}
            <div className="p-6 bg-white rounded-2xl border border-emerald-200 shadow-sm">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">
                Đồ vật cần thu gom:
              </div>
              <div className="flex flex-wrap gap-3">
                {apples
                  .filter((a) => !a.inBasket)
                  .map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      className="px-4 py-3 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 rounded-2xl text-slate-800 font-extrabold cursor-grab active:cursor-grabbing shadow-md hover:scale-105 transition-all flex items-center gap-2 select-none"
                    >
                      <MousePointer className="w-4 h-4 text-amber-700" />
                      <span>{item.name}</span>
                    </div>
                  ))}
                {allApplesInBasket && (
                  <div className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Đã thu gom hết đồ vật vào giỏ! Xuất sắc!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Drop zone: Basket */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropToBasket}
              className={`p-6 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center min-h-[160px] transition-all ${
                allApplesInBasket
                  ? 'bg-emerald-100 border-emerald-400'
                  : 'bg-white border-teal-300 hover:bg-teal-50'
              }`}
            >
              <span className="text-5xl mb-2">🧺</span>
              <span className="text-sm font-black text-teal-900">CHIẾC GIỎ THÔNG THÁI</span>
              <span className="text-xs text-slate-500 mt-1">Kéo và thả đồ vật vào đây!</span>

              <div className="flex flex-wrap gap-2 mt-3">
                {apples
                  .filter((a) => a.inBasket)
                  .map((item) => (
                    <span key={item.id} className="px-3 py-1 bg-teal-500 text-white rounded-xl text-xs font-bold shadow">
                      {item.name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
