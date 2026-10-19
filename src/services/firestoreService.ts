import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Lesson, Topic, StudentScoreRecord, UserProgress, StudySessionRecord, SchoolClass, UserAccount, BannerConfig } from '../types';
import { INITIAL_LESSONS, INITIAL_TOPICS } from '../data/mockData';
import { INITIAL_STUDY_SESSIONS } from '../data/mockStudySessions';

export const DEFAULT_CLASSES: SchoolClass[] = [
  { id: 'class_3a', name: '3A', grade: 3, teacherName: 'Cô Triệu Mai Hường', createdAt: '2026-09-01' },
  { id: 'class_3b', name: '3B', grade: 3, teacherName: 'Cô Triệu Mai Hường', createdAt: '2026-09-01' },
  { id: 'class_3c', name: '3C', grade: 3, teacherName: 'Cô Triệu Mai Hường', createdAt: '2026-09-01' },
  { id: 'class_4a', name: '4A', grade: 4, teacherName: 'Cô Triệu Mai Hường', createdAt: '2026-09-01' },
  { id: 'class_4b', name: '4B', grade: 4, teacherName: 'Cô Triệu Mai Hường', createdAt: '2026-09-01' },
  { id: 'class_4c', name: '4C', grade: 4, teacherName: 'Cô Triệu Mai Hường', createdAt: '2026-09-01' },
  { id: 'class_5a', name: '5A', grade: 5, teacherName: 'Cô Triệu Mai Hường', createdAt: '2026-09-01' },
  { id: 'class_5b', name: '5B', grade: 5, teacherName: 'Cô Triệu Mai Hường', createdAt: '2026-09-01' },
  { id: 'class_5c', name: '5C', grade: 5, teacherName: 'Cô Triệu Mai Hường', createdAt: '2026-09-01' },
];

const COLLECTIONS = {
  LESSONS: 'lessons',
  TOPICS: 'topics',
  STUDY_SESSIONS: 'studySessions',
  SCORES: 'scores',
  PROGRESS: 'userProgress',
  USERS: 'users',
  CLASSES: 'classes',
  SETTINGS: 'settings',
};

export const FirestoreService = {
  // Check if database is empty and seed initial curriculum data
  async seedInitialDataIfNeeded(): Promise<void> {
    try {
      const lessonsRef = collection(db, COLLECTIONS.LESSONS);
      const snapshot = await getDocs(lessonsRef);
      if (snapshot.empty) {
        console.log('[Firestore] Empty lessons collection detected. Seeding initial curriculum data...');

        // 1. Seed Topics
        for (const topic of INITIAL_TOPICS) {
          await setDoc(doc(db, COLLECTIONS.TOPICS, topic.id), topic);
        }

        // 2. Seed Lessons
        for (const lesson of INITIAL_LESSONS) {
          await setDoc(doc(db, COLLECTIONS.LESSONS, lesson.id), lesson);
        }

        // 3. Seed initial Study Sessions sample
        for (const session of INITIAL_STUDY_SESSIONS.slice(0, 10)) {
          await setDoc(doc(db, COLLECTIONS.STUDY_SESSIONS, session.id), session);
        }

        // 4. Seed Classes
        for (const cls of DEFAULT_CLASSES) {
          await setDoc(doc(db, COLLECTIONS.CLASSES, cls.id), cls);
        }

        console.log('[Firestore] Successfully seeded initial curriculum, topics, and classes.');
      } else {
        // Check if classes need to be seeded even if lessons already exist
        const classesRef = collection(db, COLLECTIONS.CLASSES);
        const classesSnap = await getDocs(classesRef);
        if (classesSnap.empty) {
          for (const cls of DEFAULT_CLASSES) {
            await setDoc(doc(db, COLLECTIONS.CLASSES, cls.id), cls);
          }
        }
      }
    } catch (e) {
      console.warn('[Firestore] Seed check skipped or failed:', e);
    }
  },

  // --- LESSONS ---
  async getLessons(): Promise<Lesson[]> {
    const path = COLLECTIONS.LESSONS;
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return [];
      }
      return snap.docs.map((d) => d.data() as Lesson);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeLessons(onUpdate: (lessons: Lesson[]) => void, onError?: (err: Error) => void): () => void {
    const path = COLLECTIONS.LESSONS;
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Lesson);
        onUpdate(list);
      },
      (error) => {
        if (onError) onError(error as Error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async saveLesson(lesson: Lesson): Promise<void> {
    const path = `${COLLECTIONS.LESSONS}/${lesson.id}`;
    try {
      await setDoc(doc(db, COLLECTIONS.LESSONS, lesson.id), lesson);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteLesson(lessonId: string): Promise<void> {
    const path = `${COLLECTIONS.LESSONS}/${lessonId}`;
    try {
      await deleteDoc(doc(db, COLLECTIONS.LESSONS, lessonId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- TOPICS ---
  async standardizeAndSyncTopics(): Promise<void> {
    const path = COLLECTIONS.TOPICS;
    try {
      for (const topic of INITIAL_TOPICS) {
        await setDoc(doc(db, COLLECTIONS.TOPICS, topic.id), topic);
      }
      console.log('[Firestore] Standardized and synced all 18 topics to Firestore.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getTopics(): Promise<Topic[]> {
    const path = COLLECTIONS.TOPICS;
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return INITIAL_TOPICS;
      }
      return snap.docs.map((d) => d.data() as Topic);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeTopics(onUpdate: (topics: Topic[]) => void): () => void {
    const path = COLLECTIONS.TOPICS;
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Topic);

        // Normalize topics ensuring all 18 standard topics exist with official SGK names
        const mergedMap = new Map<string, Topic>();
        INITIAL_TOPICS.forEach((init) => mergedMap.set(init.id, { ...init }));

        list.forEach((t) => {
          const init = mergedMap.get(t.id);
          let cleanName = t.name;

          // If legacy letter naming is detected e.g. "Chủ đề A:", "Chủ đề B:" or truncated text
          if (/Chủ đề [A-F]/i.test(cleanName) || (cleanName.includes('tìm kiếm thông tin') && !cleanName.includes('và trao đổi'))) {
            if (init) {
              cleanName = init.name;
              // Clean up in Firestore in background
              setDoc(doc(db, COLLECTIONS.TOPICS, t.id), { ...t, name: cleanName }).catch(console.warn);
            }
          }

          if (init) {
            mergedMap.set(t.id, { ...init, ...t, name: cleanName });
          } else {
            mergedMap.set(t.id, t);
          }
        });

        // If Firestore had missing standard topics (e.g. only 4 topics existed), write missing ones
        if (list.length < INITIAL_TOPICS.length) {
          INITIAL_TOPICS.forEach((init) => {
            if (!list.some((d) => d.id === init.id)) {
              setDoc(doc(db, COLLECTIONS.TOPICS, init.id), init).catch(console.warn);
            }
          });
        }

        const result = Array.from(mergedMap.values());
        onUpdate(result);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async saveTopic(topic: Topic): Promise<void> {
    const path = `${COLLECTIONS.TOPICS}/${topic.id}`;
    try {
      await setDoc(doc(db, COLLECTIONS.TOPICS, topic.id), topic);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- STUDY SESSIONS ---
  async saveStudySession(session: StudySessionRecord): Promise<void> {
    const path = `${COLLECTIONS.STUDY_SESSIONS}/${session.id}`;
    try {
      await setDoc(doc(db, COLLECTIONS.STUDY_SESSIONS, session.id), session);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeStudySessions(onUpdate: (sessions: StudySessionRecord[]) => void): () => void {
    const path = COLLECTIONS.STUDY_SESSIONS;
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as StudySessionRecord);
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // --- QUIZ SCORES ---
  async saveScore(record: StudentScoreRecord): Promise<void> {
    const path = `${COLLECTIONS.SCORES}/${record.id}`;
    try {
      await setDoc(doc(db, COLLECTIONS.SCORES, record.id), record);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeScores(onUpdate: (scores: StudentScoreRecord[]) => void): () => void {
    const path = COLLECTIONS.SCORES;
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as StudentScoreRecord);
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // --- PROGRESS ---
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    const path = `${COLLECTIONS.PROGRESS}/${userId}`;
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.PROGRESS, userId));
      if (snap.exists()) {
        return snap.data() as UserProgress;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveUserProgress(userId: string, progress: UserProgress): Promise<void> {
    const path = `${COLLECTIONS.PROGRESS}/${userId}`;
    try {
      await setDoc(doc(db, COLLECTIONS.PROGRESS, userId), progress);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- CLASSES ---
  async getClasses(): Promise<SchoolClass[]> {
    const path = COLLECTIONS.CLASSES;
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return DEFAULT_CLASSES;
      }
      return snap.docs.map((d) => d.data() as SchoolClass);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeClasses(onUpdate: (classes: SchoolClass[]) => void): () => void {
    const path = COLLECTIONS.CLASSES;
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as SchoolClass);
        if (list.length > 0) {
          onUpdate(list);
        } else {
          onUpdate(DEFAULT_CLASSES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async saveClass(schoolClass: SchoolClass): Promise<void> {
    const path = `${COLLECTIONS.CLASSES}/${schoolClass.id}`;
    try {
      await setDoc(doc(db, COLLECTIONS.CLASSES, schoolClass.id), schoolClass);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteClass(classId: string): Promise<void> {
    const path = `${COLLECTIONS.CLASSES}/${classId}`;
    try {
      await deleteDoc(doc(db, COLLECTIONS.CLASSES, classId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- USERS MANAGEMENT ---
  async getUsers(): Promise<UserAccount[]> {
    const path = COLLECTIONS.USERS;
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map((d) => d.data() as UserAccount);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeUsers(onUpdate: (users: UserAccount[]) => void): () => void {
    const path = COLLECTIONS.USERS;
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as UserAccount);
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async saveUser(user: UserAccount): Promise<void> {
    const path = `${COLLECTIONS.USERS}/${user.id}`;
    try {
      await setDoc(doc(db, COLLECTIONS.USERS, user.id), user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteUser(userId: string): Promise<void> {
    const path = `${COLLECTIONS.USERS}/${userId}`;
    try {
      await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- BANNER CONFIGURATION ---
  async getBannerConfig(): Promise<BannerConfig | null> {
    const path = `${COLLECTIONS.SETTINGS}/bannerConfig`;
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'bannerConfig'));
      if (snap.exists()) {
        return snap.data() as BannerConfig;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveBannerConfig(config: BannerConfig): Promise<void> {
    const path = `${COLLECTIONS.SETTINGS}/bannerConfig`;
    try {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'bannerConfig'), config);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeBannerConfig(onUpdate: (config: BannerConfig) => void): () => void {
    const path = `${COLLECTIONS.SETTINGS}/bannerConfig`;
    return onSnapshot(
      doc(db, COLLECTIONS.SETTINGS, 'bannerConfig'),
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as BannerConfig);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },
};
