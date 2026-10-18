import React, { useState, useEffect } from 'react';
import { RefreshCw, Award, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const HOME_ROW_KEYS = [
  { key: 'A', finger: 'Út trái', hand: 'left', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { key: 'S', finger: 'Áp út trái', hand: 'left', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { key: 'D', finger: 'Giữa trái', hand: 'left', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { key: 'F', finger: 'Trỏ trái (Có gờ)', hand: 'left', isBump: true, color: 'bg-blue-100 text-blue-700 border-blue-400 font-extrabold ring-2 ring-blue-400' },
  { key: 'G', finger: 'Trỏ trái vươn sang', hand: 'left', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { key: 'H', finger: 'Trỏ phải vươn sang', hand: 'right', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { key: 'J', finger: 'Trỏ phải (Có gờ)', hand: 'right', isBump: true, color: 'bg-purple-100 text-purple-700 border-purple-400 font-extrabold ring-2 ring-purple-400' },
  { key: 'K', finger: 'Giữa phải', hand: 'right', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { key: 'L', finger: 'Áp út phải', hand: 'right', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { key: ';', finger: 'Út phải', hand: 'right', color: 'bg-rose-100 text-rose-700 border-rose-300' },
];

const PRACTICE_EXERCISES = [
  { name: 'Bài 1: Làm quen phím mốc có gờ F và J', sequence: ['F', 'F', 'J', 'J', 'F', 'J', 'F', 'J'] },
  { name: 'Bài 2: Tay trái hàng cơ sở (A S D F)', sequence: ['A', 'S', 'D', 'F', 'F', 'D', 'S', 'A'] },
  { name: 'Bài 3: Tay phải hàng cơ sở (J K L ;)', sequence: ['J', 'K', 'L', ';', ';', 'L', 'K', 'J'] },
  { name: 'Bài 4: Kết hợp cả hai tay nhịp nhàng', sequence: ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';', 'F', 'J'] },
];

export const KeyboardSimulator: React.FC = () => {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentExercise = PRACTICE_EXERCISES[exerciseIndex];
  const targetChar = currentExercise.sequence[charIndex];

  // Listen to physical keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;
      const key = e.key.toUpperCase();
      handleKeyInput(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [charIndex, exerciseIndex, isCompleted]);

  const handleKeyInput = (key: string) => {
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 250);

    if (key === targetChar) {
      if (charIndex + 1 < currentExercise.sequence.length) {
        setCharIndex(charIndex + 1);
      } else {
        setIsCompleted(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } else {
      setErrorCount((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setCharIndex(0);
    setErrorCount(0);
    setIsCompleted(false);
  };

  const handleNextExercise = () => {
    setExerciseIndex((prev) => (prev + 1) % PRACTICE_EXERCISES.length);
    handleReset();
  };

  const currentKeyInfo = HOME_ROW_KEYS.find((k) => k.key === targetChar);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-amber-200">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-1">
            MÔ PHỎNG BÀN PHÍM 10 NGÓN TIỂU HỌC
          </span>
          <h3 className="text-xl font-black text-slate-800">{currentExercise.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
          >
            <RefreshCw className="w-4 h-4" /> Làm lại
          </button>
          <button
            onClick={handleNextExercise}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition"
          >
            Bài tiếp theo →
          </button>
        </div>
      </div>

      {/* Target letter display box */}
      <div className="my-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 text-center relative overflow-hidden">
        {isCompleted ? (
          <div className="py-4">
            <Award className="w-16 h-16 text-amber-500 mx-auto mb-2 animate-bounce" />
            <h4 className="text-2xl font-black text-emerald-600">🎉 Tuyệt vời! Em đã hoàn thành bài gõ!</h4>
            <p className="text-slate-600 mt-1">Số lỗi bấm nhầm: {errorCount} lần. Em đã làm rất tốt!</p>
            <button
              onClick={handleNextExercise}
              className="mt-4 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg transition"
            >
              Chuyển sang bài tiếp theo nào 🚀
            </button>
          </div>
        ) : (
          <div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Hãy bấm phím trên bàn phím hoặc nhấn chuột vào phím dưới đây:
            </div>
            <div className="flex items-center justify-center gap-3 my-4">
              {currentExercise.sequence.map((char, idx) => (
                <span
                  key={idx}
                  className={`w-12 h-14 flex items-center justify-center text-2xl font-black rounded-xl border-2 transition-all ${
                    idx < charIndex
                      ? 'bg-emerald-500 text-white border-emerald-600 scale-90 opacity-70'
                      : idx === charIndex
                      ? 'bg-amber-400 text-slate-900 border-amber-500 scale-110 shadow-lg ring-4 ring-amber-200 animate-pulse'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>

            {currentKeyInfo && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-blue-200 shadow-sm text-sm font-bold text-blue-900 mt-2">
                <span>👉 Phím cần gõ: <strong className="text-lg text-amber-600">{targetChar}</strong></span>
                <span className="text-slate-300">|</span>
                <span>Ngón tay phân công: <strong className="text-blue-700">{currentKeyInfo.finger}</strong></span>
                {currentKeyInfo.isBump && (
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">✨ Phím mốc có gờ nổi</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Keyboard */}
      <div className="bg-slate-800 p-5 rounded-2xl shadow-inner max-w-3xl mx-auto">
        <div className="text-xs font-bold text-slate-400 mb-2 flex justify-between">
          <span>HÀNG PHÍM CƠ SỞ (HOME ROW)</span>
          <span>Nhấn chuột vào phím để gõ</span>
        </div>

        <div className="grid grid-cols-10 gap-2">
          {HOME_ROW_KEYS.map((item) => {
            const isTarget = item.key === targetChar && !isCompleted;
            const isPressed = pressedKey === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleKeyInput(item.key)}
                className={`relative flex flex-col items-center justify-center h-20 rounded-xl font-black text-xl border-2 transition-all cursor-pointer ${
                  item.color
                } ${
                  isTarget
                    ? 'ring-4 ring-amber-400 bg-amber-300 text-slate-900 scale-105 shadow-xl animate-bounce'
                    : ''
                } ${isPressed ? 'scale-95 bg-emerald-300' : 'hover:-translate-y-0.5 shadow-md'}`}
              >
                <span>{item.key}</span>
                {item.isBump && (
                  <span className="absolute bottom-1 w-4 h-1 bg-slate-700 rounded-full" title="Gờ nổi định vị" />
                )}
                <span className="text-[10px] font-semibold text-slate-500 mt-1 truncate max-w-full px-1">
                  {item.finger.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Spacebar */}
        <div className="mt-3 flex justify-center">
          <div className="w-1/2 h-10 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-xl flex items-center justify-center text-slate-300 text-xs font-bold shadow">
            Phím Cách (Spacebar) - Phân công cho 2 ngón tay cái
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-semibold flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          <strong>Mẹo của Robot:</strong> Đặt ngón trỏ tay trái lên phím <strong>F</strong>, ngón trỏ tay phải lên phím <strong>J</strong>. Sờ thấy gờ nổi nhỏ là em đã đặt tay chuẩn xác rồi đó!
        </span>
      </div>
    </div>
  );
};
