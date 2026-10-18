import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Volume2, Sparkles, HelpCircle, Lightbulb, RefreshCw, VolumeX } from 'lucide-react';

interface Props {
  lessonTitle: string;
  grade: number;
  topicName: string;
  keyTakeaways: string[];
  starterPrompts: string[];
  sampleDialogues: Array<{ user: string; robot: string }>;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'robot';
  text: string;
  timestamp: string;
}

export const SectionAIAssistant: React.FC<Props> = ({
  lessonTitle,
  grade,
  topicName,
  keyTakeaways,
  starterPrompts,
  sampleDialogues,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial welcome message from Robot Tin Học
    return [
      {
        id: 'init-1',
        sender: 'robot',
        text: `🤖 Chào bạn nhỏ Lớp ${grade}! Tớ là **Robot Tin Học**, người bạn đồng hành của em trong bài học **"${lessonTitle}"**.\n\nEm có điều gì chưa hiểu trong bài, muốn tớ gợi ý, giải thích hay đố một câu đố vui nào? Em hãy nhấn vào các nút gợi ý phía dưới hoặc gõ câu hỏi cho tớ nhé! 🌟`,
        timestamp: 'Vừa xong',
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Voice playback
  const speakText = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingMessageId === id) {
        setSpeakingMessageId(null);
        return;
      }
      // Remove markdown characters for cleaner speech
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      utterance.onstart = () => setSpeakingMessageId(id);
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Send message to server /api/robot-tinhoc
  const handleSendMessage = async (textToSend: string, mode = 'chat') => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/robot-tinhoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          lessonTitle,
          grade,
          topic: topicName,
          keyTakeaways,
          mode,
          history: messages.map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })),
        }),
      });

      const data = await response.json();
      const reply = data.reply || '🤖 Tớ đã nhận được câu hỏi của em! Hãy luôn kiên trì học hỏi nhé!';

      const robotMsg: ChatMessage = {
        id: 'msg_robot_' + Date.now(),
        sender: 'robot',
        text: reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, robotMsg]);
    } catch (err) {
      console.error('Error contacting robot tinhoc:', err);
      // Friendly pedagogical fallback
      const fallbackMsg: ChatMessage = {
        id: 'msg_robot_fallback_' + Date.now(),
        sender: 'robot',
        text: `🤖 **Robot Tin Học xin gợi ý:**\nTrong bài **${lessonTitle}**, em hãy nhớ kỹ nội dung trọng tâm này nhé:\n${keyTakeaways.slice(0, 2).map((k) => `✨ ${k}`).join('\n')}\n\nEm đã hiểu phần này chưa, hay muốn Robot đố câu tiếp theo nào?`,
        timestamp: 'Vừa xong',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl shadow-inner backdrop-blur-xs animate-bounce">
            🤖
          </div>
          <div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider">
              PHẦN 6: HỎI ĐÁP CÙNG TRỢ LÝ AI
            </span>
            <h3 className="text-2xl font-black mt-1">Robot Tin Học Thông Thái</h3>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-xl text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
          <span>Sẵn sàng trợ giúp</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl shadow-xl border-4 border-emerald-200 overflow-hidden flex flex-col h-[560px]">
        {/* Quick Mode Buttons Toolbar */}
        <div className="p-3 bg-emerald-50/80 border-b border-emerald-100 flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-extrabold text-emerald-800 uppercase mr-1">
            Nút bấm nhanh:
          </span>
          <button
            onClick={() => handleSendMessage('Robot hãy gợi ý cách học bài này cho em với!', 'hint')}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-black transition shadow-xs"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>💡 Gợi ý cho em</span>
          </button>
          <button
            onClick={() => handleSendMessage('Robot hãy giải thích bài này thật dễ hiểu cho em nhé!', 'explain')}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl text-xs font-black transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>🌟 Giải thích dễ hiểu</span>
          </button>
          <button
            onClick={() => handleSendMessage('Robot hãy đố em một câu hỏi thử thách về bài học này!', 'quiz')}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-black transition shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>❓ Đố câu tiếp theo</span>
          </button>
          <button
            onClick={() => handleSendMessage('Robot hãy cho em một tình huống thực tế để vận dụng kiến thức bài này!', 'real_world')}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl text-xs font-black transition shadow-xs"
          >
            <span>🎯 Tình huống thực tế</span>
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-500 text-white animate-pulse'
                }`}
              >
                {msg.sender === 'user' ? '👧' : '🤖'}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-4 shadow-sm relative group ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border-2 border-emerald-100 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line text-sm leading-relaxed font-semibold">
                  {msg.text}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'robot' && (
                    <button
                      onClick={() => speakText(msg.id, msg.text)}
                      className={`flex items-center gap-1 font-bold transition px-2 py-0.5 rounded-lg ${
                        speakingMessageId === msg.id
                          ? 'bg-rose-100 text-rose-600 animate-pulse'
                          : 'hover:bg-slate-100 text-slate-500 hover:text-emerald-700'
                      }`}
                      title="Đọc to câu trả lời"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{speakingMessageId === msg.id ? 'Đang đọc...' : 'Nghe đọc'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shrink-0 animate-spin">
                🤖
              </div>
              <div className="p-4 bg-white border border-emerald-200 rounded-3xl rounded-tl-none text-xs font-bold text-slate-500 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                <span>Robot Tin Học đang suy nghĩ câu trả lời hay nhất cho em...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Carousel */}
        {starterPrompts && starterPrompts.length > 0 && (
          <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[10px] font-black text-slate-400 shrink-0">HỎI NHANH:</span>
            {starterPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 px-3 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-full font-bold text-[11px] transition shadow-2xs"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputMessage);
            }}
            placeholder="Nhập câu hỏi em muốn hỏi Robot Tin Học..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-emerald-500 text-sm font-bold placeholder:text-slate-400"
          />
          <button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={isLoading || !inputMessage.trim()}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center gap-1.5"
          >
            <span>Gửi</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
