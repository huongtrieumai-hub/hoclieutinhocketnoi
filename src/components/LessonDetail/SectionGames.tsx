import React, { useState, useEffect } from 'react';
import { QuizQuestion, GameFormat, ExternalGameItem, QuestionType } from '../../types';
import { StorageService } from '../../data/storage';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Star,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Gamepad2,
  ExternalLink,
  Play,
  Check,
  Volume2,
  Video as VideoIcon,
  HelpCircle as QuestionMark,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Layers,
  MousePointerClick,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerStarShower } from '../../utils/starShower';

interface Props {
  lessonId: string;
  lessonTitle: string;
  grade: number;
  gameType: GameFormat;
  questions: QuizQuestion[];
  externalGames?: ExternalGameItem[];
}

// 12 Question Type Meta for visual badges
const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string; badge: string }> = {
  singleChoice: { label: '1. Một đáp án đúng', icon: '🔘', color: 'from-blue-500 to-indigo-600', badge: '1 Đáp án' },
  multiple_choice: { label: '1. Một đáp án đúng', icon: '🔘', color: 'from-blue-500 to-indigo-600', badge: '1 Đáp án' },
  multipleChoice: { label: '2. Nhiều đáp án đúng', icon: '☑️', color: 'from-purple-500 to-indigo-600', badge: 'Đa lựa chọn' },
  trueFalse: { label: '3. Đúng – Sai', icon: '⚖️', color: 'from-emerald-500 to-teal-600', badge: 'Đúng / Sai' },
  true_false: { label: '3. Đúng – Sai', icon: '⚖️', color: 'from-emerald-500 to-teal-600', badge: 'Đúng / Sai' },
  fillBlank: { label: '4. Điền vào chỗ trống', icon: '✍️', color: 'from-amber-500 to-orange-600', badge: 'Điền từ' },
  matching: { label: '5. Ghép đôi', icon: '🔗', color: 'from-cyan-500 to-blue-600', badge: 'Ghép nối' },
  dragDrop: { label: '6. Kéo thả phân loại', icon: '🗂️', color: 'from-rose-500 to-pink-600', badge: 'Phân loại' },
  drag_drop: { label: '6. Kéo thả phân loại', icon: '🗂️', color: 'from-rose-500 to-pink-600', badge: 'Phân loại' },
  ordering: { label: '7. Sắp xếp thứ tự', icon: '🔢', color: 'from-violet-500 to-purple-600', badge: 'Thứ tự' },
  imageSelect: { label: '8. Chọn đáp án qua hình ảnh', icon: '🖼️', color: 'from-fuchsia-500 to-pink-600', badge: 'Hình ảnh' },
  findError: { label: '9. Tìm lỗi sai', icon: '🔍', color: 'from-red-500 to-orange-600', badge: 'Tìm lỗi sai' },
  scenario: { label: '10. Trắc nghiệm tình huống', icon: '💡', color: 'from-amber-500 to-yellow-600', badge: 'Tình huống' },
  clickPosition: { label: '11. Chọn vị trí trên hình', icon: '🎯', color: 'from-emerald-500 to-cyan-600', badge: 'Chỉ vị trí' },
  mediaBased: { label: '12. Trắc nghiệm âm thanh/video', icon: '🎧', color: 'from-indigo-500 to-blue-600', badge: 'Âm thanh/Video' },
};

export const SectionGames: React.FC<Props> = ({
  lessonId,
  lessonTitle,
  grade,
  questions,
  externalGames = [],
}) => {
  // Game mode tab: 'quiz' or external game id
  const [activeGameTab, setActiveGameTab] = useState<string>(() => {
    if (externalGames.length > 0) return externalGames[0].id;
    return 'quiz';
  });

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [studentName, setStudentName] = useState('');

  // Interactive state per question type
  const [selectedSingleOpt, setSelectedSingleOpt] = useState<number | null>(null);
  const [selectedMultiOpts, setSelectedMultiOpts] = useState<number[]>([]);
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<boolean | null>(null);
  const [fillBlankInput, setFillBlankInput] = useState<string>('');
  
  // Matching state: selected left id, mapped pairs { [leftId]: rightId }
  const [matchingSelectedLeft, setMatchingSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});

  // Drag & drop state: item assignments { [itemId]: categoryName }
  const [dragItemAssignments, setDragItemAssignments] = useState<Record<string, string>>({});
  const [selectedDragItemId, setSelectedDragItemId] = useState<string | null>(null);

  // Ordering state: current order of item IDs
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);

  // Image select state: selected image option ID
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Find error state: selected word/token
  const [selectedErrorWord, setSelectedErrorWord] = useState<string | null>(null);

  // Scenario state: selected option
  const [selectedScenarioOpt, setSelectedScenarioOpt] = useState<number | null>(null);

  // Click position state: selected hotspot ID
  const [clickedHotspotId, setClickedHotspotId] = useState<string | null>(null);

  // Media based state: selected option
  const [selectedMediaOpt, setSelectedMediaOpt] = useState<number | null>(null);

  const currentQ = questions[currentIdx];
  const qType = currentQ?.type ? String(currentQ.type) : 'singleChoice';
  const typeMeta = TYPE_CONFIG[qType] || TYPE_CONFIG.singleChoice;

  // Initialize interactive state when moving to a new question
  useEffect(() => {
    if (!currentQ) return;
    setIsAnswerSubmitted(false);
    setIsCurrentCorrect(null);
    setSelectedSingleOpt(null);
    setSelectedMultiOpts([]);
    setSelectedTrueFalse(null);
    setFillBlankInput('');
    setMatchingSelectedLeft(null);
    setMatchedPairs({});
    setDragItemAssignments({});
    setSelectedDragItemId(null);
    setSelectedImageId(null);
    setSelectedErrorWord(null);
    setSelectedScenarioOpt(null);
    setClickedHotspotId(null);
    setSelectedMediaOpt(null);

    // Initial setup for ordering
    if (qType === 'ordering' || qType === QuestionType.ordering) {
      const items = currentQ.orderItems || [];
      // Initial items, slightly shuffled or in given order
      const initialIds = items.map((it) => it.id);
      setCurrentOrder(initialIds);
    }
  }, [currentIdx, currentQ]);

  // Handle checking answers for any of the 12 types
  const handleCheckAnswer = () => {
    if (!currentQ || isAnswerSubmitted) return;

    let correct = false;

    switch (qType) {
      case 'singleChoice':
      case 'multiple_choice': {
        correct = selectedSingleOpt !== null && selectedSingleOpt === Number(currentQ.correctAnswer);
        break;
      }
      case 'multipleChoice': {
        const correctSet = new Set(currentQ.correctAnswers || [Number(currentQ.correctAnswer)]);
        const userSet = new Set(selectedMultiOpts);
        correct =
          correctSet.size > 0 &&
          correctSet.size === userSet.size &&
          [...correctSet].every((val) => userSet.has(val));
        break;
      }
      case 'trueFalse':
      case 'true_false': {
        const expected = currentQ.isTrue !== undefined ? currentQ.isTrue : String(currentQ.correctAnswer) === '0' || String(currentQ.correctAnswer).toLowerCase() === 'true';
        correct = selectedTrueFalse === expected;
        break;
      }
      case 'fillBlank': {
        const userWord = fillBlankInput.trim().toLowerCase();
        const expected = (currentQ.correctText || String(currentQ.correctAnswer || '')).trim().toLowerCase();
        const blanks = (currentQ.blanks || []).map((b) => b.trim().toLowerCase());
        correct = userWord === expected || blanks.includes(userWord);
        break;
      }
      case 'matching': {
        const pairs = currentQ.pairs || currentQ.matchPairs || [];
        if (pairs.length === 0) {
          correct = true;
        } else {
          // Check if every pair left matches right
          correct = pairs.every((p) => matchedPairs[p.left] === p.right || matchedPairs[p.id] === p.right);
        }
        break;
      }
      case 'dragDrop':
      case 'drag_drop': {
        const items = currentQ.itemsToCategorize || [];
        if (items.length === 0) {
          correct = true;
        } else {
          correct = items.every((it) => dragItemAssignments[it.id] === it.category);
        }
        break;
      }
      case 'ordering': {
        const expectedOrder = currentQ.correctOrder || (currentQ.orderItems || []).map((o) => o.id);
        correct =
          currentOrder.length === expectedOrder.length &&
          currentOrder.every((id, idx) => id === expectedOrder[idx]);
        break;
      }
      case 'imageSelect': {
        if (currentQ.imageOptions && currentQ.imageOptions.length > 0) {
          const selectedOpt = currentQ.imageOptions.find((im) => im.id === selectedImageId);
          correct = selectedOpt?.isCorrect === true || selectedImageId === String(currentQ.correctAnswer);
        } else {
          correct = selectedImageId === String(currentQ.correctAnswer);
        }
        break;
      }
      case 'findError': {
        const target = (currentQ.errorText || currentQ.correctCorrection || String(currentQ.correctAnswer || '')).trim().toLowerCase();
        correct = selectedErrorWord !== null && (selectedErrorWord.trim().toLowerCase() === target || selectedErrorWord === String(currentQ.correctAnswer));
        break;
      }
      case 'scenario': {
        correct = selectedScenarioOpt !== null && selectedScenarioOpt === Number(currentQ.correctAnswer);
        break;
      }
      case 'clickPosition': {
        const spots = currentQ.clickHotspots || [];
        const targetSpot = spots.find((s) => s.id === clickedHotspotId);
        correct = targetSpot?.isTarget === true || clickedHotspotId === currentQ.targetHotspotId;
        break;
      }
      case 'mediaBased': {
        correct = selectedMediaOpt !== null && selectedMediaOpt === Number(currentQ.correctAnswer);
        break;
      }
      default: {
        correct = selectedSingleOpt !== null && selectedSingleOpt === Number(currentQ.correctAnswer);
      }
    }

    setIsAnswerSubmitted(true);
    setIsCurrentCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
      const finalScore = score + (isCurrentCorrect ? 0 : 0); // already updated
      const total = questions.length;
      const pct = Math.round((finalScore / total) * 100);

      StorageService.saveScore({
        id: 'score_' + Date.now(),
        lessonId,
        lessonTitle,
        grade: grade as 3 | 4 | 5,
        studentName: studentName || 'Học sinh chăm chỉ',
        score: finalScore,
        totalQuestions: total,
        percentage: pct,
        completedAt: new Date().toLocaleDateString('vi-VN'),
        gameType: 'quiz',
      });

      if (pct >= 80) {
        triggerStarShower();
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setIsAnswerSubmitted(false);
    setIsCurrentCorrect(null);
    setScore(0);
    setIsFinished(false);
  };

  const activeExternalGame = externalGames.find((g) => g.id === activeGameTab);

  // Can user submit current question?
  const canSubmitAnswer = (): boolean => {
    if (isAnswerSubmitted) return false;
    switch (qType) {
      case 'singleChoice':
      case 'multiple_choice':
        return selectedSingleOpt !== null;
      case 'multipleChoice':
        return selectedMultiOpts.length > 0;
      case 'trueFalse':
      case 'true_false':
        return selectedTrueFalse !== null;
      case 'fillBlank':
        return fillBlankInput.trim().length > 0;
      case 'matching':
        return Object.keys(matchedPairs).length > 0;
      case 'dragDrop':
      case 'drag_drop':
        return Object.keys(dragItemAssignments).length > 0;
      case 'ordering':
        return currentOrder.length > 0;
      case 'imageSelect':
        return selectedImageId !== null;
      case 'findError':
        return selectedErrorWord !== null;
      case 'scenario':
        return selectedScenarioOpt !== null;
      case 'clickPosition':
        return clickedHotspotId !== null;
      case 'mediaBased':
        return selectedMediaOpt !== null;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-md">
            🎯
          </div>
          <div>
            <span className="px-3 py-0.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider text-amber-200">
              PHẦN 5: TRÒ CHƠI LUYỆN TẬP, KIỂM TRA ĐÁNH GIÁ
            </span>
            <h3 className="text-2xl font-black mt-0.5">Trắc Nghiệm Tự Chấm &amp; Đấu Trường Trò Chơi</h3>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-xs font-black text-sm">
            <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            <span>Điểm trắc nghiệm: {score}/{questions.length}</span>
          </div>
        )}
      </div>

      {/* Tabs Switcher: External Games (Wordwall, Wayground) + Native Quiz */}
      {(externalGames.length > 0 || questions.length > 0) && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {externalGames.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGameTab(game.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer shadow-xs ${
                activeGameTab === game.id
                  ? 'bg-rose-600 text-white shadow-md scale-102 ring-2 ring-rose-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>{game.platform === 'wordwall' ? 'Wordwall' : 'Trò chơi'}: {game.title}</span>
            </button>
          ))}

          {questions.length > 0 && (
            <button
              onClick={() => setActiveGameTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer shadow-xs ${
                activeGameTab === 'quiz'
                  ? 'bg-rose-600 text-white shadow-md scale-102 ring-2 ring-rose-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>⭐</span>
              <span>12 Dạng Trắc Nghiệm Tự Chấm ({questions.length} câu)</span>
            </button>
          )}
        </div>
      )}

      {/* VIEW A: WORDWALL / WAYGROUND EMBEDDED GAME */}
      {activeExternalGame ? (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-rose-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                TRÒ CHƠI {activeExternalGame.platform.toUpperCase()}
              </span>
              <h4 className="text-xl font-black text-slate-800 mt-1">{activeExternalGame.title}</h4>
              {activeExternalGame.instructions &&
                !activeExternalGame.instructions.toLowerCase().includes('nối hình ảnh với đáp án đúng') && (
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {activeExternalGame.instructions}
                  </p>
                )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activeExternalGame.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-lg transition hover:scale-105 cursor-pointer ring-2 ring-rose-300"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Bắt đầu trò chơi 🚀</span>
              </a>
              <a
                href={activeExternalGame.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition cursor-pointer"
                title="Mở trong tab mới"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mở Tab Mới</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-900 border-2 border-slate-200 shadow-inner">
            <iframe
              src={activeExternalGame.url}
              title={activeExternalGame.title}
              className="w-full h-full min-h-[460px]"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>

          <div className="text-center text-xs text-slate-500 font-semibold pt-1">
            🎮 <em>Em hãy nhấn vào khung trên để chơi trực tiếp hoặc bấm "Mở Tab Mới" để phóng to toàn màn hình nhé!</em>
          </div>
        </div>
      ) : questions.length > 0 ? (
        /* VIEW B: NATIVE 12-QUESTION-TYPE QUIZ EVALUATION GAME */
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-amber-200">
          {!isFinished ? (
            <div>
              {/* Progress Bar & Type Badge */}
              <div className="mb-6 space-y-2">
                <div className="flex flex-wrap justify-between items-center text-xs font-black text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full text-xs font-black shadow-xs">
                      CÂU HỎI {currentIdx + 1} / {questions.length}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5 font-bold">
                      <span>{typeMeta.icon}</span>
                      <span>{typeMeta.label}</span>
                    </span>
                  </div>
                  <span>Tiến độ: {Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Scenario Context (if type == scenario) */}
              {(qType === 'scenario' || qType === QuestionType.scenario) && currentQ.scenarioContext && (
                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 text-amber-950 mb-4 flex items-start gap-3 shadow-xs">
                  <div className="text-2xl shrink-0 mt-0.5">💡</div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                      Bối cảnh tình huống thực tế:
                    </span>
                    <p className="text-sm font-bold mt-1 leading-relaxed">
                      {currentQ.scenarioContext}
                    </p>
                  </div>
                </div>
              )}

              {/* Media Player (if type == mediaBased) */}
              {(qType === 'mediaBased' || qType === QuestionType.mediaBased) && (
                <div className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border-2 border-indigo-200 mb-4 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-black text-xs uppercase">
                    <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>Lắng nghe âm thanh / Xem video bài học</span>
                  </div>
                  {currentQ.videoUrl ? (
                    <div className="rounded-xl overflow-hidden aspect-video bg-black max-w-lg mx-auto shadow-md">
                      <iframe
                        src={currentQ.videoUrl.includes('watch?v=') ? currentQ.videoUrl.replace('watch?v=', 'embed/') : currentQ.videoUrl}
                        title="Media question"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : currentQ.audioUrl ? (
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 flex items-center gap-3">
                      <audio controls src={currentQ.audioUrl} className="w-full">
                        Trình duyệt của em không hỗ trợ phát âm thanh.
                      </audio>
                    </div>
                  ) : (
                    <div className="p-4 bg-white/80 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-700 flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-indigo-500" />
                      <span>{currentQ.mediaPrompt || 'Âm thanh mô phỏng giọng nói giáo viên hướng dẫn.'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Question Text */}
              <div className="p-5 md:p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border-2 border-amber-200 mb-6">
                <h4 className="text-lg md:text-xl font-black text-slate-800 leading-snug">
                  {currentQ?.question}
                </h4>
                {currentQ.imageUrl && qType !== 'clickPosition' && (
                  <div className="mt-4 max-w-md mx-auto rounded-xl overflow-hidden border border-amber-200 shadow-sm">
                    <img src={currentQ.imageUrl} alt="Hình minh họa câu hỏi" className="w-full max-h-56 object-cover" />
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* DYNAMIC INTERFACE FOR EACH OF THE 12 QUESTION TYPES                       */}
              {/* ========================================================================= */}

              {/* 1. Một đáp án đúng (singleChoice / multiple_choice) */}
              {(qType === 'singleChoice' || qType === 'multiple_choice' || (!currentQ.type && currentQ.options)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {currentQ?.options?.map((opt, optIdx) => {
                    const isSelected = selectedSingleOpt === optIdx;
                    const isCorrect = Number(currentQ.correctAnswer) === optIdx;
                    const optImg = currentQ.optionImages?.[optIdx];

                    let btnStyle = 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-700';

                    if (isSelected && !isAnswerSubmitted) {
                      btnStyle = 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300 font-black';
                    }

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300 font-black';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-100 border-rose-500 text-rose-900 ring-2 ring-rose-300 line-through';
                      } else {
                        btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => !isAnswerSubmitted && setSelectedSingleOpt(optIdx)}
                        disabled={isAnswerSubmitted}
                        className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all flex flex-col justify-between shadow-xs cursor-pointer ${btnStyle}`}
                      >
                        {optImg && (
                          <div className="w-full h-32 mb-2.5 rounded-xl overflow-hidden bg-white border border-slate-200/80 flex items-center justify-center p-1.5 shadow-2xs">
                            <img src={optImg} alt={opt} className="w-full h-full object-contain" />
                          </div>
                        )}
                        <div className="flex items-center justify-between w-full">
                          <span>{opt}</span>
                          {isAnswerSubmitted && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                          )}
                          {isAnswerSubmitted && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. Nhiều đáp án đúng (multipleChoice) */}
              {(qType === 'multipleChoice' || qType === QuestionType.multipleChoice) && (
                <div className="space-y-3 mb-6">
                  <div className="text-xs font-black text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 inline-block">
                    💡 Em hãy đánh dấu tích (✓) vào TẤT CẢ các đáp án đúng dưới đây:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQ?.options?.map((opt, optIdx) => {
                      const isSelected = selectedMultiOpts.includes(optIdx);
                      const correctSet = new Set(currentQ.correctAnswers || [Number(currentQ.correctAnswer)]);
                      const isActuallyCorrect = correctSet.has(optIdx);
                      const optImg = currentQ.optionImages?.[optIdx];

                      let btnStyle = 'bg-slate-50 hover:bg-purple-50 border-slate-200 text-slate-700';

                      if (isSelected && !isAnswerSubmitted) {
                        btnStyle = 'bg-purple-100 border-purple-400 text-purple-900 ring-2 ring-purple-300 font-black';
                      }

                      if (isAnswerSubmitted) {
                        if (isActuallyCorrect) {
                          btnStyle = isSelected
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300 font-black'
                            : 'bg-emerald-50 border-emerald-400 text-emerald-800 border-dashed';
                        } else if (isSelected && !isActuallyCorrect) {
                          btnStyle = 'bg-rose-100 border-rose-500 text-rose-900 ring-2 ring-rose-300 line-through';
                        } else {
                          btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                        }
                      }

                      const toggleMulti = () => {
                        if (isAnswerSubmitted) return;
                        if (selectedMultiOpts.includes(optIdx)) {
                          setSelectedMultiOpts(selectedMultiOpts.filter((i) => i !== optIdx));
                        } else {
                          setSelectedMultiOpts([...selectedMultiOpts, optIdx]);
                        }
                      };

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={toggleMulti}
                          disabled={isAnswerSubmitted}
                          className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all flex flex-col justify-between shadow-xs cursor-pointer ${btnStyle}`}
                        >
                          {optImg && (
                            <div className="w-full h-32 mb-2.5 rounded-xl overflow-hidden bg-white border border-purple-200/80 flex items-center justify-center p-1.5 shadow-2xs">
                              <img src={optImg} alt={opt} className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-xs ${
                                isSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-slate-300'
                              }`}>
                                {isSelected && '✓'}
                              </div>
                              <span>{opt}</span>
                            </div>
                            {isAnswerSubmitted && isActuallyCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                            )}
                            {isAnswerSubmitted && isSelected && !isActuallyCorrect && (
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Đúng – Sai (trueFalse / true_false) */}
              {(qType === 'trueFalse' || qType === 'true_false' || qType === QuestionType.trueFalse) && (
                <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
                  {[
                    { label: 'ĐÚNG', value: true, icon: '✅', color: 'emerald', img: currentQ.trueImage },
                    { label: 'SAI', value: false, icon: '❌', color: 'rose', img: currentQ.falseImage },
                  ].map((item) => {
                    const isSelected = selectedTrueFalse === item.value;
                    const expected = currentQ.isTrue !== undefined ? currentQ.isTrue : String(currentQ.correctAnswer) === '0' || String(currentQ.correctAnswer).toLowerCase() === 'true';
                    const isCorrect = item.value === expected;

                    let btnStyle = `bg-white hover:bg-${item.color}-50 border-slate-200 text-slate-700`;

                    if (isSelected && !isAnswerSubmitted) {
                      btnStyle = `bg-${item.color}-100 border-${item.color}-500 text-${item.color}-900 ring-4 ring-${item.color}-200 font-black scale-105`;
                    }

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-4 ring-emerald-300 font-black scale-105';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-100 border-rose-500 text-rose-900 line-through';
                      } else {
                        btnStyle = 'opacity-40 border-slate-200';
                      }
                    }

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => !isAnswerSubmitted && setSelectedTrueFalse(item.value)}
                        disabled={isAnswerSubmitted}
                        className={`p-6 rounded-3xl border-3 flex flex-col items-center justify-center gap-2 text-lg font-black transition-all shadow-md cursor-pointer ${btnStyle}`}
                      >
                        {item.img && (
                          <img src={item.img} alt={item.label} className="w-20 h-20 object-contain rounded-xl border border-slate-200 bg-white p-1 mb-1 shadow-2xs" />
                        )}
                        <span className="text-3xl">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 4. Điền vào chỗ trống (fillBlank) */}
              {(qType === 'fillBlank' || qType === QuestionType.fillBlank) && (
                <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 mb-6 space-y-4">
                  {currentQ.blankAnswerImage && (
                    <div className="max-w-xs mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-sm bg-white p-2 text-center">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">🖼️ Hình ảnh gợi ý / minh họa:</span>
                      <img src={currentQ.blankAnswerImage} alt="Gợi ý đáp án" className="w-full max-h-36 object-contain rounded-xl mx-auto" />
                    </div>
                  )}

                  <div className="text-sm font-bold text-slate-800 leading-relaxed flex flex-wrap items-center gap-2">
                    {currentQ.blankPromptPrefix && <span>{currentQ.blankPromptPrefix}</span>}
                    <input
                      type="text"
                      value={fillBlankInput}
                      onChange={(e) => !isAnswerSubmitted && setFillBlankInput(e.target.value)}
                      disabled={isAnswerSubmitted}
                      placeholder="Nhập từ còn thiếu..."
                      className={`px-4 py-2 rounded-xl border-2 font-black text-sm text-center min-w-[140px] focus:outline-none transition ${
                        isAnswerSubmitted
                          ? isCurrentCorrect
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                            : 'bg-rose-100 border-rose-500 text-rose-900'
                          : 'bg-white border-amber-400 focus:ring-2 focus:ring-amber-300'
                      }`}
                    />
                    {currentQ.blankPromptSuffix && <span>{currentQ.blankPromptSuffix}</span>}
                  </div>

                  {/* Suggestion word bank chips */}
                  {currentQ.wordBank && currentQ.wordBank.length > 0 && !isAnswerSubmitted && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-xs font-bold text-slate-500 mr-2">Gợi ý từ vựng (bấm để chọn):</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentQ.wordBank.map((word, wIdx) => (
                          <button
                            key={wIdx}
                            type="button"
                            onClick={() => setFillBlankInput(word)}
                            className="px-3 py-1.5 bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-xl border border-slate-300 text-xs font-bold transition shadow-2xs cursor-pointer"
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isAnswerSubmitted && !isCurrentCorrect && (
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      Đáp án đúng là: <strong>{currentQ.correctText || String(currentQ.correctAnswer)}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* 5. Ghép đôi (matching) */}
              {(qType === 'matching' || qType === QuestionType.matching) && (
                <div className="mb-6 space-y-4">
                  <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                    💡 Hướng dẫn: Bấm vào 1 ô bên trái, sau đó bấm vào ô tương ứng bên phải để nối chúng lại với nhau!
                  </div>

                  {(() => {
                    const pairs = currentQ.pairs || currentQ.matchPairs || [];
                    const leftItems = pairs.map((p) => ({ id: p.id || p.left, text: p.left, image: (p as any).leftImage }));
                    const rightItems = pairs.map((p) => ({ id: p.right, text: p.right, image: (p as any).rightImage }));

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Left column */}
                        <div className="space-y-2">
                          <span className="block text-xs font-black uppercase text-slate-500">Cột A: Đối tượng</span>
                          {leftItems.map((item) => {
                            const isSelected = matchingSelectedLeft === item.text;
                            const isMatched = !!matchedPairs[item.text];

                            return (
                              <button
                                key={item.id}
                                type="button"
                                disabled={isAnswerSubmitted}
                                onClick={() => {
                                  if (isAnswerSubmitted) return;
                                  setMatchingSelectedLeft(item.text);
                                }}
                                className={`w-full p-3 rounded-xl border-2 text-left font-bold text-xs transition cursor-pointer flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-blue-100 border-blue-500 text-blue-900 ring-2 ring-blue-300'
                                    : isMatched
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {item.image && (
                                    <img src={item.image} alt={item.text} className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-0.5 shrink-0" />
                                  )}
                                  <span>{item.text}</span>
                                </div>
                                {isMatched && (
                                  <span className="text-[10px] font-black bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                                    Đã nối
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Right column */}
                        <div className="space-y-2">
                          <span className="block text-xs font-black uppercase text-slate-500">Cột B: Ý nghĩa tương ứng</span>
                          {rightItems.map((item, idx) => {
                            const matchedLeftKey = Object.keys(matchedPairs).find((k) => matchedPairs[k] === item.text);

                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={isAnswerSubmitted}
                                onClick={() => {
                                  if (isAnswerSubmitted || !matchingSelectedLeft) return;
                                  setMatchedPairs({
                                    ...matchedPairs,
                                    [matchingSelectedLeft]: item.text,
                                  });
                                  setMatchingSelectedLeft(null);
                                }}
                                className={`w-full p-3 rounded-xl border-2 text-left font-bold text-xs transition cursor-pointer flex items-center justify-between gap-2 ${
                                  matchedLeftKey
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                                    : matchingSelectedLeft
                                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {item.image && (
                                    <img src={item.image} alt={item.text} className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-0.5 shrink-0" />
                                  )}
                                  <span>{item.text}</span>
                                </div>
                                {matchedLeftKey && (
                                  <span className="text-[10px] font-black bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full truncate max-w-[120px] shrink-0">
                                    ← {matchedLeftKey}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 6. Kéo thả phân loại (dragDrop / drag_drop) */}
              {(qType === 'dragDrop' || qType === 'drag_drop' || qType === QuestionType.dragDrop) && (
                <div className="mb-6 space-y-4">
                  <div className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                    💡 Hướng dẫn: Nhấp chọn một đồ vật bên dưới, sau đó nhấp vào Chiếc hộp phù hợp để phân loại!
                  </div>

                  {/* Target category buckets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(currentQ.categories || ['Nhóm 1', 'Nhóm 2']).map((cat, cIdx) => {
                      const itemsInCat = (currentQ.itemsToCategorize || []).filter(
                        (it) => dragItemAssignments[it.id] === cat
                      );

                      return (
                        <div
                          key={cIdx}
                          onClick={() => {
                            if (isAnswerSubmitted || !selectedDragItemId) return;
                            setDragItemAssignments({
                              ...dragItemAssignments,
                              [selectedDragItemId]: cat,
                            });
                            setSelectedDragItemId(null);
                          }}
                          className={`p-4 rounded-2xl border-3 min-h-[140px] transition cursor-pointer ${
                            selectedDragItemId
                              ? 'bg-rose-50/80 border-dashed border-rose-400 hover:bg-rose-100/90'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                            <span className="font-black text-xs text-slate-800">{cat}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded-full text-slate-600">
                              {itemsInCat.length} mục
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {itemsInCat.map((item) => (
                              <span
                                key={item.id}
                                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5"
                              >
                                {item.imageUrl && (
                                  <img src={item.imageUrl} alt={item.text} className="w-5 h-5 object-contain rounded-sm" />
                                )}
                                <span>{item.text}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tray of items */}
                  <div>
                    <span className="text-xs font-black uppercase text-slate-500 mb-2 block">
                      Các đồ vật cần phân loại:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(currentQ.itemsToCategorize || []).map((item) => {
                        const isAssigned = !!dragItemAssignments[item.id];
                        const isSelected = selectedDragItemId === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            disabled={isAnswerSubmitted}
                            onClick={() => {
                              if (isAnswerSubmitted) return;
                              setSelectedDragItemId(isSelected ? null : item.id);
                            }}
                            className={`px-3 py-2 rounded-xl border-2 text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300 scale-105'
                                : isAssigned
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.text} className="w-7 h-7 object-contain rounded-md bg-white border border-slate-200 p-0.5" />
                            )}
                            <span>{item.text}</span>
                            {isAssigned && <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Sắp xếp thứ tự (ordering) */}
              {(qType === 'ordering' || qType === QuestionType.ordering) && (
                <div className="mb-6 space-y-3">
                  <div className="text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-200">
                    💡 Hướng dẫn: Dùng nút Mũi Tên Lên / Xuống (⬆️ ⬇️) để sắp xếp các bước theo đúng trình tự!
                  </div>

                  <div className="space-y-2">
                    {currentOrder.map((itemId, idx) => {
                      const itemObj = (currentQ.orderItems || []).find((o) => o.id === itemId);
                      const expectedOrder = currentQ.correctOrder || (currentQ.orderItems || []).map((o) => o.id);
                      const isCorrectPosition = expectedOrder[idx] === itemId;

                      const moveUp = () => {
                        if (isAnswerSubmitted || idx === 0) return;
                        const copy = [...currentOrder];
                        const temp = copy[idx - 1];
                        copy[idx - 1] = copy[idx];
                        copy[idx] = temp;
                        setCurrentOrder(copy);
                      };

                      const moveDown = () => {
                        if (isAnswerSubmitted || idx === currentOrder.length - 1) return;
                        const copy = [...currentOrder];
                        const temp = copy[idx + 1];
                        copy[idx + 1] = copy[idx];
                        copy[idx] = temp;
                        setCurrentOrder(copy);
                      };

                      return (
                        <div
                          key={itemId}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition shadow-xs ${
                            isAnswerSubmitted
                              ? isCorrectPosition
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                                : 'bg-rose-50 border-rose-400 text-rose-900'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-800 font-black text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            {itemObj?.imageUrl && (
                              <img src={itemObj.imageUrl} alt={itemObj.text} className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white p-0.5 shrink-0" />
                            )}
                            <span className="text-xs font-bold">{itemObj?.text || itemId}</span>
                          </div>

                          {!isAnswerSubmitted && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={moveUp}
                                disabled={idx === 0}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 flex items-center justify-center cursor-pointer"
                              >
                                <MoveUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={moveDown}
                                disabled={idx === currentOrder.length - 1}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 flex items-center justify-center cursor-pointer"
                              >
                                <MoveDown className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {isAnswerSubmitted && isCorrectPosition && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          {isAnswerSubmitted && !isCorrectPosition && (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 8. Chọn đáp án qua hình ảnh (imageSelect) */}
              {(qType === 'imageSelect' || qType === QuestionType.imageSelect) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {(currentQ.imageOptions || []).map((imgOpt) => {
                    const isSelected = selectedImageId === imgOpt.id;
                    const isCorrect = imgOpt.isCorrect === true || imgOpt.id === String(currentQ.correctAnswer);

                    let cardStyle = 'border-slate-200 hover:border-fuchsia-300 bg-white';

                    if (isSelected && !isAnswerSubmitted) {
                      cardStyle = 'border-fuchsia-500 ring-4 ring-fuchsia-200 scale-102 bg-fuchsia-50';
                    }

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        cardStyle = 'border-emerald-500 ring-4 ring-emerald-300 bg-emerald-50';
                      } else if (isSelected && !isCorrect) {
                        cardStyle = 'border-rose-500 ring-4 ring-rose-300 opacity-70 bg-rose-50';
                      } else {
                        cardStyle = 'border-slate-200 opacity-40';
                      }
                    }

                    return (
                      <button
                        key={imgOpt.id}
                        type="button"
                        disabled={isAnswerSubmitted}
                        onClick={() => !isAnswerSubmitted && setSelectedImageId(imgOpt.id)}
                        className={`p-3 rounded-2xl border-3 flex flex-col items-center gap-2 transition cursor-pointer text-center shadow-xs ${cardStyle}`}
                      >
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={imgOpt.imageUrl}
                            alt={imgOpt.label || 'Hình ảnh lựa chọn'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {imgOpt.label && (
                          <span className="text-xs font-bold text-slate-800 line-clamp-1">{imgOpt.label}</span>
                        )}
                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 9. Tìm lỗi sai (findError) */}
              {(qType === 'findError' || qType === QuestionType.findError) && (
                <div className="p-6 bg-red-50/50 rounded-2xl border-2 border-red-200 mb-6 space-y-3">
                  <div className="text-xs font-bold text-red-700">
                    🔍 Hãy bấm vào từ ngữ hoặc thao tác <strong>SAI</strong> trong nội dung dưới đây:
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm font-bold text-slate-800">
                    {(currentQ.errorOptions || (currentQ.errorText || currentQ.question).split(' ')).map((word, wIdx) => {
                      const isSelected = selectedErrorWord === word;
                      const target = (currentQ.errorText || currentQ.correctCorrection || String(currentQ.correctAnswer || '')).trim().toLowerCase();
                      const isTargetError = word.trim().toLowerCase() === target || word === currentQ.correctAnswer;

                      return (
                        <button
                          key={wIdx}
                          type="button"
                          disabled={isAnswerSubmitted}
                          onClick={() => !isAnswerSubmitted && setSelectedErrorWord(word)}
                          className={`px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                            isSelected && !isAnswerSubmitted
                              ? 'bg-red-500 text-white border-red-600 ring-2 ring-red-300'
                              : isAnswerSubmitted && isTargetError
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-500 font-black'
                              : isAnswerSubmitted && isSelected && !isTargetError
                              ? 'bg-rose-200 text-rose-900 border-rose-500 line-through'
                              : 'bg-white hover:bg-red-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswerSubmitted && currentQ.correctCorrection && (
                    <div className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 mt-2">
                      💡 Sửa lại cho đúng: {currentQ.correctCorrection}
                    </div>
                  )}
                </div>
              )}

              {/* 10. Trắc nghiệm tình huống (scenario) */}
              {(qType === 'scenario' || qType === QuestionType.scenario) && (
                <div className="space-y-3 mb-6">
                  <span className="block text-xs font-black uppercase text-amber-800">
                    Lựa chọn cách xử lý văn minh &amp; an toàn nhất:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQ?.options?.map((opt, optIdx) => {
                      const isSelected = selectedScenarioOpt === optIdx;
                      const isCorrect = Number(currentQ.correctAnswer) === optIdx;
                      const optImg = currentQ.optionImages?.[optIdx];

                      let btnStyle = 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-700';

                      if (isSelected && !isAnswerSubmitted) {
                        btnStyle = 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300 font-black';
                      }

                      if (isAnswerSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300 font-black';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-100 border-rose-500 text-rose-900 ring-2 ring-rose-300 line-through';
                        } else {
                          btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isAnswerSubmitted}
                          onClick={() => !isAnswerSubmitted && setSelectedScenarioOpt(optIdx)}
                          className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all flex flex-col justify-between shadow-xs cursor-pointer ${btnStyle}`}
                        >
                          {optImg && (
                            <div className="w-full h-32 mb-2.5 rounded-xl overflow-hidden bg-white border border-amber-200/80 flex items-center justify-center p-1.5 shadow-2xs">
                              <img src={optImg} alt={opt} className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div className="flex items-center justify-between w-full">
                            <span>{opt}</span>
                            {isAnswerSubmitted && isCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                            )}
                            {isAnswerSubmitted && isSelected && !isCorrect && (
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 11. Chọn vị trí trên hình (clickPosition) */}
              {(qType === 'clickPosition' || qType === QuestionType.clickPosition) && (
                <div className="mb-6 space-y-3">
                  <div className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-emerald-600 animate-bounce" />
                    <span>Em hãy nhấp vào vị trí của: <strong>{currentQ.targetAreaName || 'bộ phận được yêu cầu'}</strong> trên hình bên dưới!</span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border-4 border-slate-200 shadow-md max-w-2xl mx-auto bg-slate-100">
                    <img
                      src={currentQ.imageUrl || 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80'}
                      alt="Sơ đồ tương tác"
                      className="w-full h-auto block"
                    />

                    {/* Interactive Hotspot pins */}
                    {(currentQ.clickHotspots || []).map((spot) => {
                      const isSelected = clickedHotspotId === spot.id;
                      const isCorrectSpot = spot.isTarget;

                      return (
                        <button
                          key={spot.id}
                          type="button"
                          disabled={isAnswerSubmitted}
                          onClick={() => !isAnswerSubmitted && setClickedHotspotId(spot.id)}
                          style={{
                            left: `${spot.x}%`,
                            top: `${spot.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                          className={`absolute z-10 px-3 py-1.5 rounded-full font-black text-xs shadow-lg transition transform hover:scale-110 cursor-pointer flex items-center gap-1 ${
                            isSelected && !isAnswerSubmitted
                              ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-200 scale-110'
                              : isAnswerSubmitted && isCorrectSpot
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-300 scale-115'
                              : isAnswerSubmitted && isSelected && !isCorrectSpot
                              ? 'bg-rose-500 text-white ring-4 ring-rose-300 line-through'
                              : 'bg-white/90 backdrop-blur-xs text-slate-800 border border-slate-300 hover:bg-white'
                          }`}
                        >
                          <span>📍</span>
                          <span>{spot.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 12. Trắc nghiệm qua âm thanh / video (mediaBased) */}
              {(qType === 'mediaBased' || qType === QuestionType.mediaBased) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {currentQ?.options?.map((opt, optIdx) => {
                    const isSelected = selectedMediaOpt === optIdx;
                    const isCorrect = Number(currentQ.correctAnswer) === optIdx;
                    const optImg = currentQ.optionImages?.[optIdx];

                    let btnStyle = 'bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-700';

                    if (isSelected && !isAnswerSubmitted) {
                      btnStyle = 'bg-indigo-100 border-indigo-400 text-indigo-900 ring-2 ring-indigo-300 font-black';
                    }

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300 font-black';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-100 border-rose-500 text-rose-900 ring-2 ring-rose-300 line-through';
                      } else {
                        btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isAnswerSubmitted}
                        onClick={() => !isAnswerSubmitted && setSelectedMediaOpt(optIdx)}
                        className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all flex flex-col justify-between shadow-xs cursor-pointer ${btnStyle}`}
                      >
                        {optImg && (
                          <div className="w-full h-32 mb-2.5 rounded-xl overflow-hidden bg-white border border-indigo-200/80 flex items-center justify-center p-1.5 shadow-2xs">
                            <img src={optImg} alt={opt} className="w-full h-full object-contain" />
                          </div>
                        )}
                        <div className="flex items-center justify-between w-full">
                          <span>{opt}</span>
                          {isAnswerSubmitted && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                          )}
                          {isAnswerSubmitted && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Explanation Card */}
              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-2xl border-2 mb-6 animate-in fade-in ${
                    isCurrentCorrect
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <div className="font-black text-sm flex items-center gap-1.5 mb-1">
                    {isCurrentCorrect ? (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>🎉 Hoan hô! Em đã trả lời chính xác!</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <span>💡 Lời giải thích giúp em ghi nhớ:</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs font-semibold leading-relaxed">
                    {currentQ?.explanation || 'Hãy ghi nhớ kiến thức trọng tâm này nhé!'}
                  </p>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={!canSubmitAnswer()}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-40 text-white rounded-2xl font-black text-sm shadow-md transition cursor-pointer"
                  >
                    Kiểm tra đáp án 🎯
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-md transition animate-bounce cursor-pointer"
                  >
                    <span>{currentIdx + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Finished screen */
            <div className="text-center py-6">
              <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-3 animate-bounce" />
              <h4 className="text-2xl font-black text-slate-800">
                {score === questions.length
                  ? '🏆 XUẤT SẮC! EM ĐÃ ĐẠT ĐIỂM TUYỆT ĐỐI!'
                  : score >= questions.length / 2
                  ? '🌟 RẤT TỐT! EM ĐÃ VƯỢT QUA BÀI KIỂM TRA!'
                  : '💪 EM CỐ GẮNG THÊM MỘT CHÚT NỮA NHÉ!'}
              </h4>

              <div className="my-6 inline-flex flex-col items-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-300 shadow-md">
                <span className="text-xs font-extrabold text-slate-500 uppercase">KẾT QUẢ ĐẠT ĐƯỢC:</span>
                <span className="text-5xl font-black text-amber-600 my-2">
                  {score} / {questions.length}
                </span>
                <div className="flex gap-1 text-2xl">
                  {[...Array(3)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        (score / questions.length) * 3 > i
                          ? 'text-amber-400 drop-shadow'
                          : 'text-slate-200'
                      }
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              <div className="max-w-xs mx-auto mb-6">
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Tên của em (ghi vào bảng vàng thành tích):
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Nhập tên em, ví dụ: Minh An Lớp 3A"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
                />
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-2xl shadow-lg transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Làm lại để đạt 10 điểm
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center border-2 border-slate-200">
          <p className="text-slate-500 font-bold">Chưa có câu hỏi hoặc trò chơi cho bài học này.</p>
        </div>
      )}
    </div>
  );
};
