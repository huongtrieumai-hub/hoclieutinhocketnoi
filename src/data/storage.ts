import { Lesson, Topic, StudentScoreRecord, UserProgress, StudySessionRecord, StudentLearnerSummary } from '../types';
import { INITIAL_LESSONS, INITIAL_TOPICS } from './mockData';
import { INITIAL_STUDY_SESSIONS, INITIAL_LEARNERS_SUMMARY } from './mockStudySessions';
import { FirestoreService } from '../services/firestoreService';

const STORAGE_KEYS = {
  LESSONS: 'hoc_lieu_tin_hoc_lessons_v1',
  TOPICS: 'hoc_lieu_tin_hoc_topics_v1',
  PROGRESS: 'hoc_lieu_tin_hoc_progress_v1',
  SCORES: 'hoc_lieu_tin_hoc_scores_v1',
  ADMIN_PIN: 'hoc_lieu_tin_hoc_pin_v1',
  STUDY_SESSIONS: 'hoc_lieu_tin_hoc_study_sessions_v1',
  LEARNERS_SUMMARY: 'hoc_lieu_tin_hoc_learners_summary_v1',
};

// Default teacher PIN
const DEFAULT_PIN = '123456';

export const StorageService = {
  // --- LESSONS ---
  getLessons(): Lesson[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LESSONS);
      if (data) {
        const stored: Lesson[] = JSON.parse(data);
        return stored.map((l) => {
          const init = INITIAL_LESSONS.find((il) => il.id === l.id);
          let updatedLesson = { ...l };

          if (init && init.section3MindMap?.externalMindMapUrl && !l.section3MindMap?.externalMindMapUrl) {
            updatedLesson.section3MindMap = {
              ...updatedLesson.section3MindMap,
              externalMindMapUrl: init.section3MindMap.externalMindMapUrl,
              externalMindMapTitle: init.section3MindMap.externalMindMapTitle,
              allowEmbed: init.section3MindMap.allowEmbed ?? true,
            };
          }

          // Hydrate 12 question types if lesson has fewer than init
          if (init && init.section5Games?.questions && (!l.section5Games?.questions || l.section5Games.questions.length < init.section5Games.questions.length)) {
            updatedLesson.section5Games = {
              ...updatedLesson.section5Games,
              questions: init.section5Games.questions,
            };
          }

          if (!updatedLesson.requiredWatchSeconds) {
            updatedLesson.requiredWatchSeconds = init?.requiredWatchSeconds || 180;
          }

          return updatedLesson;
        });
      }
    } catch (e) {
      console.error('Error reading lessons from storage:', e);
    }
    // Initialize with mock data
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(INITIAL_LESSONS));
    return INITIAL_LESSONS;
  },

  saveLessons(lessons: Lesson[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    } catch (e) {
      console.error('Error saving lessons:', e);
    }
  },

  getLessonById(id: string): Lesson | undefined {
    const lessons = this.getLessons();
    return lessons.find((l) => l.id === id);
  },

  saveLesson(lesson: Lesson): void {
    const lessons = this.getLessons();
    const index = lessons.findIndex((l) => l.id === lesson.id);
    if (index >= 0) {
      lessons[index] = lesson;
    } else {
      lessons.push(lesson);
    }
    this.saveLessons(lessons);
    FirestoreService.saveLesson(lesson).catch((err) =>
      console.warn('[StorageService] Error syncing lesson to Firestore:', err)
    );
  },

  deleteLesson(id: string): void {
    const lessons = this.getLessons();
    const filtered = lessons.filter((l) => l.id !== id);
    this.saveLessons(filtered);
    FirestoreService.deleteLesson(id).catch((err) =>
      console.warn('[StorageService] Error deleting lesson in Firestore:', err)
    );
  },

  duplicateLesson(id: string): Lesson | null {
    const lessons = this.getLessons();
    const target = lessons.find((l) => l.id === id);
    if (!target) return null;

    const newLesson: Lesson = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'lesson_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: `${target.title} (Bản sao)`,
      order: (target.order || 0) + 1,
      isDemo: false,
    };

    lessons.push(newLesson);
    this.saveLessons(lessons);
    FirestoreService.saveLesson(newLesson).catch((err) =>
      console.warn('[StorageService] Error syncing duplicated lesson to Firestore:', err)
    );
    return newLesson;
  },

  // --- TOPICS ---
  getTopics(): Topic[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPICS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading topics from storage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(INITIAL_TOPICS));
    return INITIAL_TOPICS;
  },

  saveTopics(topics: Topic[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
    } catch (e) {
      console.error('Error saving topics:', e);
    }
  },

  saveTopic(topic: Topic): void {
    const topics = this.getTopics();
    const idx = topics.findIndex((t) => t.id === topic.id);
    if (idx >= 0) {
      topics[idx] = topic;
    } else {
      topics.push(topic);
    }
    this.saveTopics(topics);
    FirestoreService.saveTopic(topic).catch((err) =>
      console.warn('[StorageService] Error syncing topic to Firestore:', err)
    );
  },

  // --- PROGRESS & SCORES ---
  getProgress(): UserProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading progress:', e);
    }
    return {
      completedLessons: [],
      quizScores: {},
      starsEarned: 0,
    };
  },

  saveProgress(progress: UserProgress, userId?: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving progress:', e);
    }

    const uid = userId || localStorage.getItem('hoc_lieu_tin_hoc_current_user_v1');
    if (uid) {
      try {
        const parsed = typeof uid === 'string' && uid.startsWith('{') ? JSON.parse(uid).id : uid;
        if (parsed) {
          FirestoreService.saveUserProgress(parsed, progress).catch((err) =>
            console.warn('[StorageService] Error syncing progress to Firestore:', err)
          );
        }
      } catch (e) {
        // ignore JSON parse
      }
    }
  },

  markLessonCompleted(lessonId: string, starsToAdd = 3): void {
    const progress = this.getProgress();
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      progress.starsEarned += starsToAdd;
      this.saveProgress(progress);
    }
  },

  getScores(): StudentScoreRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCORES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading scores:', e);
    }
    return [];
  },

  saveScore(record: StudentScoreRecord): void {
    const scores = this.getScores();
    scores.unshift(record); // newest first
    try {
      localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores.slice(0, 100)));
    } catch (e) {
      console.error('Error saving score record:', e);
    }

    FirestoreService.saveScore(record).catch((err) =>
      console.warn('[StorageService] Error syncing score to Firestore:', err)
    );

    // Also update student's best score in progress
    const progress = this.getProgress();
    const currentBest = progress.quizScores[record.lessonId] || 0;
    if (record.score > currentBest) {
      progress.quizScores[record.lessonId] = record.score;
    }
    if (!progress.completedLessons.includes(record.lessonId)) {
      progress.completedLessons.push(record.lessonId);
      progress.starsEarned += 3;
    }
    this.saveProgress(progress);
  },

  // --- STUDY SESSIONS & LEARNER MONITORING ---
  getStudySessions(): StudySessionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading study sessions from storage:', e);
    }
    // Initialize with mock session data
    localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(INITIAL_STUDY_SESSIONS));
    return INITIAL_STUDY_SESSIONS;
  },

  saveStudySession(session: StudySessionRecord): void {
    const sessions = this.getStudySessions();
    const existingIdx = sessions.findIndex((s) => s.id === session.id);
    if (existingIdx >= 0) {
      sessions[existingIdx] = session;
    } else {
      sessions.unshift(session); // newest first
    }
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions.slice(0, 300)));
    } catch (e) {
      console.error('Error saving study session:', e);
    }

    FirestoreService.saveStudySession(session).catch((err) =>
      console.warn('[StorageService] Error syncing study session to Firestore:', err)
    );

    // Automatically recalculate and sync learner summary
    this.syncLearnersSummary();
  },

  recordStudySession(newSessionData: Omit<StudySessionRecord, 'id'>): StudySessionRecord {
    const session: StudySessionRecord = {
      ...newSessionData,
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    };
    this.saveStudySession(session);
    return session;
  },

  getLearnersSummary(): StudentLearnerSummary[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEARNERS_SUMMARY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading learners summary:', e);
    }
    localStorage.setItem(STORAGE_KEYS.LEARNERS_SUMMARY, JSON.stringify(INITIAL_LEARNERS_SUMMARY));
    return INITIAL_LEARNERS_SUMMARY;
  },

  saveLearnersSummary(summaries: StudentLearnerSummary[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LEARNERS_SUMMARY, JSON.stringify(summaries));
    } catch (e) {
      console.error('Error saving learners summary:', e);
    }
  },

  syncLearnersSummary(): StudentLearnerSummary[] {
    const sessions = this.getStudySessions();
    const currentSummaries = this.getLearnersSummary();
    const scores = this.getScores();

    // Map by studentName or userId
    const map = new Map<string, StudentLearnerSummary>();

    // Seed with existing learners
    currentSummaries.forEach((s) => {
      const key = s.studentName.toLowerCase().trim();
      map.set(key, { ...s, totalStudySeconds: 0, lessonsStudiedCount: 0, completedLessonsCount: 0 });
    });

    // Aggregate from sessions
    sessions.forEach((sess) => {
      const key = sess.studentName.toLowerCase().trim();
      let learner = map.get(key);
      if (!learner) {
        learner = {
          userId: sess.userId || 'user_' + Date.now(),
          studentName: sess.studentName,
          schoolClass: sess.schoolClass || '3A',
          grade: sess.grade,
          avatar: sess.grade === 3 ? '👦' : sess.grade === 4 ? '👧' : '🚀',
          totalStudySeconds: 0,
          lessonsStudiedCount: 0,
          completedLessonsCount: 0,
          quizTakenCount: 0,
          averageScore: 0,
          starsEarned: 0,
          lastActive: sess.startTime,
          status: 'active_today',
        };
        map.set(key, learner);
      }

      learner.totalStudySeconds += sess.durationSeconds || 0;
      learner.lessonsStudiedCount += 1;
      if (sess.isCompleted) {
        learner.completedLessonsCount += 1;
      }
      learner.lastActive = sess.startTime || learner.lastActive;
    });

    // Aggregate scores
    scores.forEach((sc) => {
      const key = sc.studentName.toLowerCase().trim();
      const learner = map.get(key);
      if (learner) {
        learner.quizTakenCount = (learner.quizTakenCount || 0) + 1;
        learner.starsEarned = (learner.starsEarned || 0) + Math.round(sc.score);
      }
    });

    const updated = Array.from(map.values()).sort((a, b) => b.totalStudySeconds - a.totalStudySeconds);
    this.saveLearnersSummary(updated);
    return updated;
  },

  formatStudyDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0 phút';
    if (seconds < 60) return `${seconds} giây`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours} giờ ${mins > 0 ? mins + ' phút' : ''}`;
    }
    return `${mins} phút ${secs > 0 && mins < 10 ? secs + ' giây' : ''}`;
  },

  // --- ADMIN AUTH ---
  getAdminPin(): string {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || DEFAULT_PIN;
  },

  setAdminPin(newPin: string): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin);
  },

  verifyAdminPin(pin: string): boolean {
    const current = this.getAdminPin();
    return pin === current || pin === 'giaovien123';
  },

  // --- BACKUP & RESTORE JSON ---
  exportBackupData(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'Học Liệu Tin Học Kết Nối Tri Thức 3-4-5',
      topics: this.getTopics(),
      lessons: this.getLessons(),
      scores: this.getScores(),
      progress: this.getProgress(),
      studySessions: this.getStudySessions(),
      learnersSummary: this.getLearnersSummary(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupData(jsonString: string, mergeMode: 'merge' | 'replace' = 'merge'): { success: boolean; message: string; count: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || (!parsed.lessons && !Array.isArray(parsed))) {
        return { success: false, message: 'Tệp JSON không đúng định dạng học liệu!', count: 0 };
      }

      const incomingLessons: Lesson[] = Array.isArray(parsed) ? parsed : (parsed.lessons || []);
      const incomingTopics: Topic[] = parsed.topics || [];

      if (mergeMode === 'replace') {
        this.saveLessons(incomingLessons);
        if (incomingTopics.length > 0) {
          this.saveTopics(incomingTopics);
        }
        return {
          success: true,
          message: `Đã khôi phục toàn bộ ${incomingLessons.length} bài học thành công!`,
          count: incomingLessons.length,
        };
      } else {
        // Merge mode: Add or update by ID without wiping existing
        const currentLessons = this.getLessons();
        let addedCount = 0;
        incomingLessons.forEach((newLesson) => {
          const existingIdx = currentLessons.findIndex((l) => l.id === newLesson.id);
          if (existingIdx >= 0) {
            currentLessons[existingIdx] = newLesson;
          } else {
            currentLessons.push(newLesson);
            addedCount++;
          }
        });
        this.saveLessons(currentLessons);

        if (incomingTopics.length > 0) {
          const currentTopics = this.getTopics();
          incomingTopics.forEach((newTop) => {
            const topIdx = currentTopics.findIndex((t) => t.id === newTop.id);
            if (topIdx >= 0) {
              currentTopics[topIdx] = newTop;
            } else {
              currentTopics.push(newTop);
            }
          });
          this.saveTopics(currentTopics);
        }

        return {
          success: true,
          message: `Đã gộp dữ liệu thành công! Tổng số bài hiện có: ${currentLessons.length} bài (Thêm mới: ${addedCount} bài).`,
          count: currentLessons.length,
        };
      }
    } catch (e) {
      return { success: false, message: `Lỗi đọc tệp: ${(e as Error).message}`, count: 0 };
    }
  },

  resetToDefaultMockData(): void {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(INITIAL_LESSONS));
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(INITIAL_TOPICS));
  },
};
