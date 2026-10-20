/**
 * VietnameseSpeechService - Dịch vụ đọc bài học tiếng Việt chuẩn âm điệu
 * Tự động ưu tiên giọng đọc tiếng Việt của trình duyệt (Google Tiếng Việt, Microsoft Hoài My, Nam Minh, v.v.)
 * Tự động chuyển tiếp sang luồng âm thanh phát âm tiếng Việt chuẩn (/api/tts) khi thiết bị không cài sẵn giọng tiếng Việt.
 */

class VietnameseSpeechServiceClass {
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking = false;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const v = window.speechSynthesis.getVoices();
    if (v && v.length > 0) {
      this.voices = v;
      this.voicesLoaded = true;
    }
  }

  /**
   * Tìm giọng tiếng Việt chuẩn trong danh sách voice của trình duyệt/hệ điều hành
   */
  public getVietnameseVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    this.loadVoices();

    // 1. Tìm chính xác vi-VN hoặc vi_VN
    const exactVi = this.voices.find(
      (v) => v.lang === 'vi-VN' || v.lang === 'vi_VN' || v.lang.toLowerCase() === 'vi-vn'
    );
    if (exactVi) return exactVi;

    // 2. Tìm tiền tố vi
    const prefixVi = this.voices.find((v) => v.lang.toLowerCase().startsWith('vi'));
    if (prefixVi) return prefixVi;

    // 3. Tìm theo tên giọng
    const nameVi = this.voices.find(
      (v) =>
        v.name.toLowerCase().includes('vietnam') ||
        v.name.toLowerCase().includes('tiếng việt') ||
        v.name.toLowerCase().includes('hoaimy') ||
        v.name.toLowerCase().includes('namminh') ||
        v.name.toLowerCase().includes('mai')
    );
    if (nameVi) return nameVi;

    return null;
  }

  /**
   * Làm sạch văn bản và chuyển đổi các từ viết tắt sư phạm để đọc tự nhiên nhất
   */
  public cleanTextForVietnameseSpeech(text: string): string {
    if (!text) return '';

    return (
      text
        // Xóa cú pháp markdown
        .replace(/[*#_`~[\]]/g, '')
        // Mở rộng từ viết tắt thường gặp trong SGK Tin học
        .replace(/\bSGK\b/gi, 'Sách giáo khoa')
        .replace(/\bVD:\s*/gi, 'Ví dụ: ')
        .replace(/\b1\.\s*/g, 'Phần 1: ')
        .replace(/\b2\.\s*/g, 'Phần 2: ')
        .replace(/\b3\.\s*/g, 'Phần 3: ')
        .replace(/\b4\.\s*/g, 'Phần 4: ')
        .replace(/\b5\.\s*/g, 'Phần 5: ')
        .replace(/\b6\.\s*/g, 'Phần 6: ')
        .replace(/\bLớp 3\b/gi, 'Lớp ba')
        .replace(/\bLớp 4\b/gi, 'Lớp bốn')
        .replace(/\bLớp 5\b/gi, 'Lớp năm')
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  /**
   * Dừng toàn bộ giọng đọc (cả SpeechSynthesis và Audio phát trực tiếp)
   */
  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isSpeaking = false;
  }

  /**
   * Phát âm thanh qua luồng API TTS tiếng Việt chuẩn (chia nhỏ câu)
   */
  private playOnlineVietnameseTTS(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void
  ) {
    // Tách thành từng câu ngắn (< 150 ký tự) để đọc trôi chảy
    const rawSentences = text
      .split(/(?<=[.?!;:\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const chunks: string[] = [];
    rawSentences.forEach((sentence) => {
      if (sentence.length <= 150) {
        chunks.push(sentence);
      } else {
        // Cắt thêm theo dấu phẩy nếu câu quá dài
        const subParts = sentence.split(/,\s+/);
        let cur = '';
        subParts.forEach((part) => {
          if ((cur + ', ' + part).length <= 150) {
            cur = cur ? cur + ', ' + part : part;
          } else {
            if (cur) chunks.push(cur);
            cur = part;
          }
        });
        if (cur) chunks.push(cur);
      }
    });

    if (chunks.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    let currentIndex = 0;
    this.isSpeaking = true;
    if (onStart) onStart();

    const playNext = () => {
      if (!this.isSpeaking || currentIndex >= chunks.length) {
        this.isSpeaking = false;
        this.currentAudio = null;
        if (onEnd) onEnd();
        return;
      }

      const chunkText = chunks[currentIndex];
      currentIndex++;

      const audioUrl = `/api/tts?text=${encodeURIComponent(chunkText)}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        playNext();
      };

      audio.onerror = () => {
        console.warn('[TTS] Audio chunk error, moving to next');
        playNext();
      };

      audio.play().catch((err) => {
        console.warn('[TTS] Audio play error:', err);
        this.isSpeaking = false;
        if (onError) onError();
      });
    };

    playNext();
  }

  /**
   * Đọc nội dung bài học bằng tiếng Việt nam
   * Tự động phát hiện và chọn giọng tiếng Việt chuẩn, không bao giờ đọc bằng tiếng Anh.
   */
  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err?: unknown) => void
  ): () => void {
    this.stop();

    const cleanText = this.cleanTextForVietnameseSpeech(text);
    if (!cleanText) {
      if (onEnd) onEnd();
      return () => this.stop();
    }

    const viVoice = this.getVietnameseVoice();

    // Trường hợp 1: Thiết bị / Trình duyệt có giọng tiếng Việt bản địa (Google Tiếng Việt, Microsoft Hoài My, v.v.)
    if ('speechSynthesis' in window && viVoice) {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = viVoice;
        utterance.lang = 'vi-VN';
        utterance.rate = 0.92; // Tốc độ vừa phải, rõ từng chữ cho học sinh tiểu học
        utterance.pitch = 1.05;

        utterance.onstart = () => {
          this.isSpeaking = true;
          if (onStart) onStart();
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          console.warn('[SpeechSynthesis] Error with native voice, falling back to online TTS:', e);
          this.playOnlineVietnameseTTS(cleanText, onStart, onEnd, onError);
        };

        window.speechSynthesis.speak(utterance);
        return () => this.stop();
      } catch (err) {
        console.warn('[SpeechSynthesis] Failed to initialize, using online TTS:', err);
      }
    }

    // Trường hợp 2: Không có giọng tiếng Việt trong hệ điều hành -> Dùng giọng đọc tiếng Việt chuẩn qua /api/tts
    this.playOnlineVietnameseTTS(cleanText, onStart, onEnd, onError);

    return () => this.stop();
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const VietnameseSpeechService = new VietnameseSpeechServiceClass();
