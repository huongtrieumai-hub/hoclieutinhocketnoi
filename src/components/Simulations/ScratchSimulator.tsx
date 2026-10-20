import React, { useState } from 'react';
import { Play, Square, RotateCcw, Plus, Trash2, Sparkles, Laptop } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScratchCommand {
  id: string;
  type: 'move' | 'turn' | 'say' | 'costume' | 'sound';
  text: string;
  color: string;
  value?: number | string;
}

const AVAILABLE_BLOCKS: Array<{ type: ScratchCommand['type']; text: string; color: string; value: number | string }> = [
  { type: 'move', text: '🚶 Di chuyển 30 bước', color: 'bg-blue-600 text-white', value: 30 },
  { type: 'turn', text: '🔄 Quay phải 45 độ', color: 'bg-blue-500 text-white', value: 45 },
  { type: 'say', text: '💬 Nói "Xin chào bạn nhỏ!"', color: 'bg-purple-600 text-white', value: 'Xin chào bạn nhỏ!' },
  { type: 'costume', text: '🎨 Đổi trang phục rực rỡ', color: 'bg-cyan-600 text-white', value: 'sparkle' },
  { type: 'sound', text: '🔊 Khởi động Máy Tính! 💻', color: 'bg-emerald-600 text-white', value: 'beep' },
];

export const ScratchSimulator: React.FC = () => {
  const [script, setScript] = useState<ScratchCommand[]>([
    { id: '1', type: 'move', text: '🚶 Di chuyển 30 bước', color: 'bg-blue-600 text-white', value: 30 },
    { id: '2', type: 'say', text: '💬 Nói "Xin chào bạn nhỏ!"', color: 'bg-purple-600 text-white', value: 'Xin chào bạn nhỏ!' },
    { id: '3', type: 'turn', text: '🔄 Quay phải 45 độ', color: 'bg-blue-500 text-white', value: 45 },
  ]);

  // Cat state on stage
  const [catPos, setCatPos] = useState({ x: 0, y: 0, rotation: 0 });
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [isSparkling, setIsSparkling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const addBlockToScript = (block: typeof AVAILABLE_BLOCKS[0]) => {
    const newCmd: ScratchCommand = {
      id: 'cmd_' + Date.now(),
      type: block.type,
      text: block.text,
      color: block.color,
      value: block.value,
    };
    setScript([...script, newCmd]);
  };

  const removeBlock = (id: string) => {
    setScript(script.filter((b) => b.id !== id));
  };

  const resetStage = () => {
    setCatPos({ x: 0, y: 0, rotation: 0 });
    setSpeechBubble(null);
    setIsSparkling(false);
    setIsRunning(false);
    setActiveStepIndex(null);
  };

  const runScript = async () => {
    if (isRunning || script.length === 0) return;
    setIsRunning(true);
    setSpeechBubble(null);

    let curX = catPos.x;
    let curY = catPos.y;
    let curRot = catPos.rotation;

    for (let i = 0; i < script.length; i++) {
      setActiveStepIndex(i);
      const cmd = script[i];

      if (cmd.type === 'move') {
        const rad = (curRot * Math.PI) / 180;
        curX += Math.cos(rad) * Number(cmd.value || 30);
        curY += Math.sin(rad) * Number(cmd.value || 30);
        // keep inside bounds
        curX = Math.max(-140, Math.min(140, curX));
        curY = Math.max(-80, Math.min(80, curY));
        setCatPos({ x: curX, y: curY, rotation: curRot });
      } else if (cmd.type === 'turn') {
        curRot = (curRot + Number(cmd.value || 45)) % 360;
        setCatPos({ x: curX, y: curY, rotation: curRot });
      } else if (cmd.type === 'say') {
        setSpeechBubble(String(cmd.value || 'Xin chào!'));
      } else if (cmd.type === 'costume') {
        setIsSparkling(true);
        setTimeout(() => setIsSparkling(false), 800);
      } else if (cmd.type === 'sound') {
        setSpeechBubble('Bíp bíp! Máy tính đã sẵn sàng! 💻✨');
      }

      await new Promise((r) => setTimeout(r, 600));
    }

    confetti({ particleCount: 50, spread: 60 });
    setIsRunning(false);
    setActiveStepIndex(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-sky-200">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="inline-block px-3 py-1 bg-sky-100 text-sky-800 text-xs font-black rounded-full mb-1">
            SÂN CHƠI SCRATCH MINI - LẬP TRÌNH KHỐI LỚP 5
          </span>
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Laptop className="w-6 h-6 text-blue-600" />
            Điều Khiển Máy Tính Laptop Thông Minh
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runScript}
            disabled={isRunning || script.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-black shadow-md transition"
          >
            <Play className="w-4 h-4 fill-white" /> Bấm Cờ Xanh (Chạy)
          </button>
          <button
            onClick={resetStage}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-sm font-bold transition"
            title="Dừng và Đặt lại vị trí ban đầu"
          >
            <RotateCcw className="w-4 h-4" /> Đặt lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4">
        {/* Col 1: Palette Blocks (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
            KHỐI LỆNH CÓ SẴN (BẤM ĐỂ THÊM VÀO KỊCH BẢN):
          </div>
          <div className="space-y-2">
            {AVAILABLE_BLOCKS.map((block, idx) => (
              <button
                key={idx}
                onClick={() => addBlockToScript(block)}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:scale-102 active:scale-95 transition flex items-center justify-between ${block.color}`}
              >
                <span>{block.text}</span>
                <Plus className="w-4 h-4 shrink-0" />
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] font-semibold text-amber-900">
            💡 <strong>Mẹo Scratch:</strong> Các khối lệnh được ghép từ trên xuống dưới, tạo thành một kịch bản hoàn chỉnh cho nhân vật!
          </div>
        </div>

        {/* Col 2: Active Script (4 cols) */}
        <div className="lg:col-span-4 bg-slate-100 p-4 rounded-2xl border-2 border-dashed border-slate-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
              KỊCH BẢN CỦA CHÚ MÈO ({script.length} lệnh):
            </span>
            {script.length > 0 && (
              <button
                onClick={() => setScript([])}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                Xóa hết
              </button>
            )}
          </div>

          {/* Green Flag header block */}
          <div className="px-3 py-2 bg-amber-400 text-slate-900 font-extrabold text-xs rounded-t-xl rounded-br-xl shadow flex items-center gap-2 mb-2">
            <Play className="w-3.5 h-3.5 fill-slate-900" />
            <span>Khi bấm vào LÁ CỜ XANH</span>
          </div>

          <div className="space-y-1.5 min-h-[160px]">
            {script.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-bold">
                Chưa có khối lệnh nào. Hãy bấm các khối bên trái để ghép kịch bản!
              </div>
            ) : (
              script.map((cmd, idx) => (
                <div
                  key={cmd.id}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center justify-between transition-all ${
                    cmd.color
                  } ${
                    activeStepIndex === idx ? 'ring-4 ring-amber-400 scale-105 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full">{idx + 1}</span>
                    <span>{cmd.text}</span>
                  </div>
                  <button
                    onClick={() => removeBlock(cmd.id)}
                    className="text-white/70 hover:text-white p-1"
                    title="Xóa lệnh này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 3: Stage Preview (4 cols) */}
        <div className="lg:col-span-4 bg-sky-50 rounded-2xl border-4 border-sky-300 p-4 flex flex-col items-center justify-between min-h-[280px] relative overflow-hidden">
          <div className="w-full flex justify-between items-center text-[10px] font-black text-sky-800 uppercase">
            <span>SÂN KHẤU (STAGE)</span>
            <span>TỌA ĐỘ: X={Math.round(catPos.x)} | Y={Math.round(catPos.y)}</span>
          </div>

          {/* Speech bubble */}
          {speechBubble && (
            <div className="absolute top-10 bg-white border-2 border-slate-700 px-3 py-1.5 rounded-2xl text-xs font-black text-slate-800 shadow-lg animate-in fade-in zoom-in-90 z-20">
              {speechBubble}
              <div className="absolute -bottom-2 left-6 w-3 h-3 bg-white border-b-2 border-r-2 border-slate-700 rotate-45" />
            </div>
          )}

          {/* Laptop Sprite Avatar (Replaced Cat with Laptop Computer) */}
          <div
            style={{
              transform: `translate(${catPos.x}px, ${catPos.y}px) rotate(${catPos.rotation}deg)`,
              transition: 'transform 0.4s ease-out',
            }}
            className="relative my-auto flex flex-col items-center justify-center cursor-pointer select-none"
          >
            {isSparkling && (
              <Sparkles className="w-8 h-8 text-cyan-400 absolute -top-4 -right-4 animate-spin" />
            )}
            <div className={`text-6xl filter drop-shadow-md transition-all ${isSparkling ? 'scale-125' : ''}`}>
              💻
            </div>
            <span className="text-[10px] font-black bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-2.5 py-0.5 rounded-full mt-1 shadow-sm flex items-center gap-1">
              <Laptop className="w-3 h-3" /> Máy tính Laptop
            </span>
          </div>

          <div className="w-full text-center text-[11px] text-sky-700 font-bold">
            {isRunning ? '⏳ Đang thực hiện kịch bản...' : 'Nhấn Cờ Xanh ở trên để xem Máy tính Laptop chạy lệnh!'}
          </div>
        </div>
      </div>
    </div>
  );
};
