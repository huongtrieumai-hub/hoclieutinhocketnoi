import React, { useState, useEffect, useMemo } from 'react';
import { GradeLevel, Lesson, Topic, UserProgress, UserAccount, BannerConfig, DEFAULT_BANNER_CONFIG } from './types';
import { StorageService } from './data/storage';
import { AuthService, DEMO_ACCOUNTS } from './data/authData';
import { Navbar } from './components/Navbar';

import { GradeSelector } from './components/GradeSelector';
import { LessonCard } from './components/LessonCard';
import { LessonHeader } from './components/LessonDetail/LessonHeader';
import { SectionKnowledge } from './components/LessonDetail/SectionKnowledge';
import { SectionMaterials } from './components/LessonDetail/SectionMaterials';
import { SectionMindMap } from './components/LessonDetail/SectionMindMap';
import { SectionSimulations } from './components/LessonDetail/SectionSimulations';
import { SectionSimulationsAndMindMap } from './components/LessonDetail/SectionSimulationsAndMindMap';
import { SectionGames } from './components/LessonDetail/SectionGames';
import { SectionAIAssistant } from './components/LessonDetail/SectionAIAssistant';
import { LoginModal } from './components/Auth/LoginModal';
import { UserProfileModal } from './components/Auth/UserProfileModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { BottomNavigation } from './components/BottomNavigation';
import { StarShowerCelebrationModal } from './components/Celebration/StarShowerCelebrationModal';
import { triggerStarShower } from './utils/starShower';
import { FirestoreService } from './services/firestoreService';
import { testConnection, db } from './firebase';
import { getDoc, doc } from 'firebase/firestore';
import {
  Sparkles,
  BookOpen,
  Search,
  ArrowRight,
  Zap,
  UserCheck,
  Award,
  Star,
  LogIn,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // State
  const [lessons, setLessons] = useState<Lesson[]>(() => StorageService.getLessons());
  const [topics, setTopics] = useState<Topic[]>(() => StorageService.getTopics());
  const [progress, setProgress] = useState<UserProgress>(() => StorageService.getProgress());

  // User auth state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => AuthService.getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalRole, setLoginModalRole] = useState<'student' | 'teacher'>('student');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(() => {
    const user = AuthService.getCurrentUser();
    return user?.grade || 3;
  });
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeSection, setActiveSection] = useState<number>(1);

  // Active study session timer state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [studySeconds, setStudySeconds] = useState<number>(0);
  const [materialsWatchSeconds, setMaterialsWatchSeconds] = useState<number>(0);
  const [showDurationWarningModal, setShowDurationWarningModal] = useState<boolean>(false);
  const [visitedSections, setVisitedSections] = useState<string[]>(['1. Khám phá & Trọng tâm']);

  // Star shower celebration state
  const [showStarShowerModal, setShowStarShowerModal] = useState(false);
  const [completedCelebrationInfo, setCompletedCelebrationInfo] = useState<{ title: string; grade: number } | null>(null);

  // Admin view state
  const [isLoggedInAdmin, setIsLoggedInAdmin] = useState(false);
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(() => StorageService.getBannerConfig());

  const handleSaveBannerConfig = (config: BannerConfig) => {
    setBannerConfig(config);
    StorageService.saveBannerConfig(config);
  };

  const refreshAllData = () => {
    setLessons(StorageService.getLessons());
    setTopics(StorageService.getTopics());
    setProgress(StorageService.getProgress());
    setCurrentUser(AuthService.getCurrentUser());
    setBannerConfig(StorageService.getBannerConfig());
  };

  // Grade Statistics (total & completed)
  const gradeStats = useMemo(() => {
    const stats: Record<GradeLevel, { total: number; completed: number }> = {
      3: { total: 0, completed: 0 },
      4: { total: 0, completed: 0 },
      5: { total: 0, completed: 0 },
    };

    lessons.forEach((l) => {
      if (stats[l.grade]) {
        stats[l.grade].total++;
        if (progress.completedLessons.includes(l.id)) {
          stats[l.grade].completed++;
        }
      }
    });

    return stats;
  }, [lessons, progress]);

  // Topics for the selected grade
  const currentGradeTopics = useMemo(() => {
    return topics
      .filter((t) => t.grade === selectedGrade)
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [topics, selectedGrade]);

  // Filtered lessons for display
  const displayedLessons = useMemo(() => {
    return lessons
      .filter((l) => l.grade === selectedGrade)
      .filter((l) => selectedTopicId === 'all' || l.topicId === selectedTopicId)
      .filter((l) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => a.order - b.order);
  }, [lessons, selectedGrade, selectedTopicId, searchQuery]);

  // Real-time study timer for active lesson
  useEffect(() => {
    if (!activeLesson) {
      setStudySeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setStudySeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeLesson]);

  // Hook tracking video and document view duration in Section 2 (Video & Tài liệu)
  useEffect(() => {
    if (!activeLesson || activeSection !== 2) return;

    const interval = setInterval(() => {
      setMaterialsWatchSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeLesson, activeSection]);

  // Real-time Firestore synchronization for lessons, topics, and user progress
  useEffect(() => {
    testConnection().catch(console.warn);
    FirestoreService.seedInitialDataIfNeeded().catch(console.warn);

    // Live real-time subscription for lessons from Firestore
    const unsubLessons = FirestoreService.subscribeLessons(
      (firestoreLessons) => {
        if (Array.isArray(firestoreLessons)) {
          setLessons(firestoreLessons);
          StorageService.saveLessons(firestoreLessons);
        }
      },
      (err) => console.warn('[Firestore] Live lessons subscription notice:', err)
    );

    // Live real-time subscription for topics from Firestore
    const unsubTopics = FirestoreService.subscribeTopics(
      (firestoreTopics) => {
        if (Array.isArray(firestoreTopics) && firestoreTopics.length > 0) {
          setTopics(firestoreTopics);
          StorageService.saveTopics(firestoreTopics);
        }
      }
    );

    // Live real-time subscription for banner configuration from Firestore
    const unsubBanner = FirestoreService.subscribeBannerConfig(
      (firestoreBanner) => {
        if (firestoreBanner) {
          setBannerConfig(firestoreBanner);
          StorageService.saveBannerConfig(firestoreBanner);
        }
      }
    );

    const user = AuthService.getCurrentUser();
    if (user) {
      FirestoreService.getUserProgress(user.id)
        .then((saved) => {
          if (saved) {
            setProgress(saved);
          }
        })
        .catch(console.warn);
    }

    return () => {
      unsubLessons();
      unsubTopics();
      unsubBanner();
    };
  }, []);

  // Periodic auto-save study session every 10 seconds
  useEffect(() => {
    if (!activeLesson || studySeconds <= 0 || !currentSessionId) return;

    if (studySeconds % 10 === 0) {
      StorageService.saveStudySession({
        id: currentSessionId,
        userId: currentUser?.id,
        studentName: currentUser?.fullName || 'Học sinh khách',
        schoolClass: currentUser?.schoolClass || `${activeLesson.grade}A`,
        grade: activeLesson.grade,
        lessonId: activeLesson.id,
        lessonTitle: activeLesson.title,
        startTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
        durationSeconds: studySeconds,
        sectionsVisited: visitedSections,
        isCompleted: progress.completedLessons.includes(activeLesson.id),
        date: new Date().toISOString().slice(0, 10),
      });
    }
  }, [studySeconds, activeLesson, currentSessionId, currentUser, visitedSections, progress.completedLessons]);

  // Calculate required watch duration and 80% threshold
  const requiredWatchDuration = activeLesson?.requiredWatchSeconds || 180;
  const required80Percent = Math.round(requiredWatchDuration * 0.8);
  const hasMetWatchRequirement = materialsWatchSeconds >= required80Percent;

  const handleStartLearning = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setActiveSection(1);
    setStudySeconds(0);
    setMaterialsWatchSeconds(0);
    const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setCurrentSessionId(newSessionId);
    const initialSections = ['1. Mục tiêu & Trọng tâm'];
    setVisitedSections(initialSections);

    // Initial record
    StorageService.saveStudySession({
      id: newSessionId,
      userId: currentUser?.id,
      studentName: currentUser?.fullName || 'Học sinh khách',
      schoolClass: currentUser?.schoolClass || `${lesson.grade}A`,
      grade: lesson.grade,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      startTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
      durationSeconds: 1,
      sectionsVisited: initialSections,
      isCompleted: progress.completedLessons.includes(lesson.id),
      date: new Date().toISOString().slice(0, 10),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSection = (secNum: number) => {
    setActiveSection(secNum);
    const secNames: Record<number, string> = {
      1: '1. Mục tiêu & Trọng tâm',
      2: '2. Video & Tài liệu',
      3: '3. Sơ đồ tư duy & Mô phỏng',
      4: '4. Trò chơi kiểm tra',
      5: '5. Robot Tin Học AI',
    };
    const name = secNames[secNum];
    if (name && !visitedSections.includes(name)) {
      setVisitedSections((prev) => [...prev, name]);
    }
  };

  const handleBackToHome = () => {
    if (activeLesson && currentSessionId && studySeconds > 2) {
      StorageService.saveStudySession({
        id: currentSessionId,
        userId: currentUser?.id,
        studentName: currentUser?.fullName || 'Học sinh khách',
        schoolClass: currentUser?.schoolClass || `${activeLesson.grade}A`,
        grade: activeLesson.grade,
        lessonId: activeLesson.id,
        lessonTitle: activeLesson.title,
        startTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
        endTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
        durationSeconds: studySeconds,
        sectionsVisited: visitedSections,
        isCompleted: progress.completedLessons.includes(activeLesson.id),
        date: new Date().toISOString().slice(0, 10),
      });
    }
    setActiveLesson(null);
    setCurrentSessionId(null);
    setStudySeconds(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleComplete = () => {
    if (!activeLesson) return;
    const isComp = progress.completedLessons.includes(activeLesson.id);
    if (!isComp) {
      StorageService.markLessonCompleted(activeLesson.id, 3);
      if (currentUser) {
        currentUser.stars = (currentUser.stars || 0) + 3;
        AuthService.setCurrentUser(currentUser);
        setCurrentUser({ ...currentUser });
        FirestoreService.saveUser(currentUser).catch(console.warn);
      }

      // Update study session as completed
      if (currentSessionId) {
        StorageService.saveStudySession({
          id: currentSessionId,
          userId: currentUser?.id,
          studentName: currentUser?.fullName || 'Học sinh khách',
          schoolClass: currentUser?.schoolClass || `${activeLesson.grade}A`,
          grade: activeLesson.grade,
          lessonId: activeLesson.id,
          lessonTitle: activeLesson.title,
          startTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
          durationSeconds: studySeconds,
          sectionsVisited: visitedSections,
          isCompleted: true,
          date: new Date().toISOString().slice(0, 10),
        });
      }

      const updated = StorageService.getProgress();
      if (currentUser) {
        FirestoreService.saveUserProgress(currentUser.id, updated).catch(console.warn);
      }

      // Trigger spectacular Star Shower animation and open celebratory modal
      setCompletedCelebrationInfo({
        title: activeLesson.title,
        grade: activeLesson.grade,
      });
      setShowStarShowerModal(true);
      triggerStarShower();
    } else {
      const updated = {
        ...progress,
        completedLessons: progress.completedLessons.filter((id) => id !== activeLesson.id),
      };
      StorageService.saveProgress(updated);
      if (currentUser) {
        FirestoreService.saveUserProgress(currentUser.id, updated).catch(console.warn);
      }
    }
    setProgress(StorageService.getProgress());
  };

  const handleGoToNextLesson = () => {
    if (!activeLesson) return;
    const sameGradeLessons = lessons.filter((l) => l.grade === activeLesson.grade);
    const currentIndex = sameGradeLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex + 1 < sameGradeLessons.length) {
      handleStartLearning(sameGradeLessons[currentIndex + 1]);
    }
  };

  // Login handler
  const handleLoginSuccess = async (user: UserAccount) => {
    let activeUser = user;
    try {
      const snap = await getDoc(doc(db, 'users', user.id));
      if (snap.exists()) {
        activeUser = snap.data() as UserAccount;
      }
    } catch (e) {
      console.warn('[Firestore] Could not load user directly from Firestore:', e);
    }

    setCurrentUser(activeUser);
    AuthService.setCurrentUser(activeUser);

    if (activeUser.grade) {
      setSelectedGrade(activeUser.grade);
    }
    // Load student's own progress from Firestore
    FirestoreService.getUserProgress(activeUser.id)
      .then((saved) => {
        if (saved) {
          setProgress(saved);
        }
      })
      .catch(console.warn);

    if (activeUser.role === 'teacher' || activeUser.role === 'admin') {
      setIsLoggedInAdmin(true);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setProgress(StorageService.getProgress());
    setIsProfileModalOpen(false);
    setIsLoggedInAdmin(false);
  };

  // Quick 1-click login from home page banner
  const handleQuickDemoCard = async (demoAccount: UserAccount) => {
    const logged = await AuthService.quickDemoLogin(demoAccount.username);
    if (logged) {
      setCurrentUser(logged);
      if (logged.grade) {
        setSelectedGrade(logged.grade);
      }
      FirestoreService.getUserProgress(logged.id)
        .then((saved) => {
          if (saved) setProgress(saved);
        })
        .catch(console.warn);

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      if (logged.role === 'teacher' || logged.role === 'admin') {
        setIsLoggedInAdmin(true);
      }
    }
  };

  // Admin Dashboard Mode
  if (isLoggedInAdmin) {
    return (
      <AdminDashboard
        lessons={lessons}
        topics={topics}
        currentUser={currentUser}
        bannerConfig={bannerConfig}
        onSaveBannerConfig={handleSaveBannerConfig}
        onRefreshData={refreshAllData}
        onExitAdmin={() => setIsLoggedInAdmin(false)}
        onPreviewLesson={(l) => {
          setIsLoggedInAdmin(false);
          handleStartLearning(l);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-sky-200 selection:text-blue-900">
      {/* Navbar with User Account Integration */}
      <Navbar
        selectedGrade={selectedGrade}
        onSelectGrade={(g) => {
          setSelectedGrade(g);
          setSelectedTopicId('all');
          setActiveLesson(null);
        }}
        starsEarned={progress.starsEarned}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onOpenLogin={(role = 'student') => {
          setLoginModalRole(role);
          setIsLoginModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdmin={() => {
          if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
            setIsLoggedInAdmin(true);
          } else {
            setLoginModalRole('teacher');
            setIsLoginModalOpen(true);
          }
        }}
        onLogout={handleLogout}
        onGoHome={handleBackToHome}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 sm:pb-32">
        {/* VIEW 1: LESSON DETAIL VIEW */}
        {activeLesson ? (
          <div className="space-y-6">
            <LessonHeader
              lesson={activeLesson}
              topicName={topics.find((t) => t.id === activeLesson.topicId)?.name}
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
              onBack={handleBackToHome}
              isCompleted={progress.completedLessons.includes(activeLesson.id)}
              onToggleComplete={handleToggleComplete}
              studySeconds={studySeconds}
              materialsWatchSeconds={materialsWatchSeconds}
              requiredWatchSeconds={requiredWatchDuration}
              hasMetWatchRequirement={hasMetWatchRequirement}
            />

            {/* 6 Sections Rendering in requested pedagogical sequence */}
            {activeSection === 1 && (
              <div className="space-y-6">
                <SectionKnowledge
                  cards={activeLesson.section2Knowledge.cards}
                  objectives={activeLesson.objectives}
                />
              </div>
            )}

            {activeSection === 2 && (
              <SectionMaterials
                materials={activeLesson.materials}
                lessonTitle={activeLesson.title}
                materialsWatchSeconds={materialsWatchSeconds}
                requiredWatchSeconds={requiredWatchDuration}
                hasMetWatchRequirement={hasMetWatchRequirement}
                onAttemptCompleteLesson={handleToggleComplete}
                isCompleted={progress.completedLessons.includes(activeLesson.id)}
              />
            )}

            {activeSection === 3 && (
              <SectionSimulationsAndMindMap
                simulations={activeLesson.section4Simulation.simulations}
                interactiveSimulations={activeLesson.interactiveSimulations}
                lessonTitle={activeLesson.title}
                materialsWatchSeconds={materialsWatchSeconds}
                requiredWatchSeconds={requiredWatchDuration}
                hasMetWatchRequirement={hasMetWatchRequirement}
                onAttemptCompleteLesson={handleToggleComplete}
                isCompleted={progress.completedLessons.includes(activeLesson.id)}
                mindMapData={activeLesson.section3MindMap}
                mindMapImages={activeLesson.mindMapImages}
              />
            )}

            {activeSection === 4 && (
              <SectionGames
                lessonId={activeLesson.id}
                lessonTitle={activeLesson.title}
                grade={activeLesson.grade}
                gameType={activeLesson.section5Games.gameType}
                questions={activeLesson.section5Games.questions}
                externalGames={activeLesson.externalGames}
              />
            )}

            {activeSection === 5 && (
              <SectionAIAssistant
                lessonTitle={activeLesson.title}
                grade={activeLesson.grade}
                topicName={
                  topics.find((t) => t.id === activeLesson.topicId)?.name || 'Tin học'
                }
                keyTakeaways={activeLesson.section6AIConfig.keyTakeaways}
                starterPrompts={activeLesson.section6AIConfig.starterPrompts}
                sampleDialogues={activeLesson.section6AIConfig.sampleDialogues}
                onAttemptCompleteLesson={handleToggleComplete}
                isCompleted={progress.completedLessons.includes(activeLesson.id)}
              />
            )}
          </div>
        ) : (
          /* VIEW 2: STUDENT HOME VIEW */
          <div className="space-y-8">
            {/* Friendly Hero Banner */}
            <div
              style={{
                backgroundImage: bannerConfig.imageUrl ? `url("${bannerConfig.imageUrl}")` : undefined,
                backgroundPosition: bannerConfig.bgPosition || 'center',
                backgroundSize: bannerConfig.bgSize || 'cover',
                backgroundRepeat: 'no-repeat',
              }}
              className={`relative overflow-hidden rounded-3xl p-6 md:p-10 text-white shadow-2xl border-b-4 border-sky-400 min-h-[260px] md:min-h-[300px] flex items-center transition-all duration-300 ${
                !bannerConfig.imageUrl
                  ? 'bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#06B6D4]'
                  : 'bg-slate-900'
              }`}
            >
              {/* Color Overlay Layer for perfect text contrast and legibility without distorting character */}
              {bannerConfig.imageUrl && bannerConfig.overlayColor !== 'none' && (
                <div
                  style={{
                    background:
                      bannerConfig.overlayColor === 'dark'
                        ? 'rgba(15, 23, 42, 0.75)'
                        : bannerConfig.overlayColor === 'light'
                        ? 'rgba(255, 255, 255, 0.75)'
                        : 'linear-gradient(to right, rgba(29, 78, 216, 0.92) 0%, rgba(37, 99, 235, 0.78) 55%, rgba(6, 182, 212, 0.65) 100%)',
                    opacity: (bannerConfig.opacity ?? 80) / 100,
                  }}
                  className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
                />
              )}

              <div className="relative z-10 max-w-2xl space-y-3 bg-gradient-to-r from-sky-950/40 via-sky-900/20 to-transparent sm:bg-transparent rounded-2xl p-3 sm:p-0 backdrop-blur-[2px] sm:backdrop-blur-none">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 border border-white/30 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
                  <span>{bannerConfig.tagline || 'Bộ Sách Kết Nối Tri Thức Với Cuộc Sống'}</span>
                </div>

                {currentUser ? (
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-black drop-shadow-sm leading-tight text-white">
                      Chào{' '}
                      {currentUser.fullName?.startsWith('Cô ') || currentUser.fullName?.startsWith('Thầy ')
                        ? currentUser.fullName.replace(/Hương/g, 'Hường')
                        : `bạn ${currentUser.fullName?.replace(/^Thầy\s+Quản\s+Trị\s+Hệ\s+Thống/i, 'Quản Trị Hệ Thống').replace(/Hương/g, 'Hường')}`}{' '}
                      {currentUser.avatar}
                    </h1>
                    <p className="text-sm sm:text-base text-sky-100 font-bold leading-relaxed mt-1">
                      {currentUser.role === 'admin' || currentUser.role === 'teacher'
                        ? 'Chúc Cô một ngày giảng dạy và làm việc hiệu quả, đồng hành cùng các em học sinh sáng tạo!'
                        : 'Chúc em một ngày học tập môn Tin học thật hứng khởi, tích lũy thêm nhiều sao vàng và thực hành sáng tạo!'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-black drop-shadow-sm leading-tight text-white">
                      {bannerConfig.headline || 'Học Liệu Tin Học 3–4–5!'}
                    </h1>
                    <p className="text-sm sm:text-base text-sky-100 font-bold leading-relaxed mt-1">
                      {bannerConfig.subtext || (
                        <>
                          Khám phá bài giảng số tương tác, sơ đồ tư duy, mô phỏng gõ phím &amp; chuột, trò chơi ôn tập và tương tác cùng <strong>Robot Tin Học</strong>!
                        </>
                      )}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap gap-3">
                  {!currentUser ? (
                    <>
                      <button
                        onClick={() => {
                          setLoginModalRole('student');
                          setIsLoginModalOpen(true);
                        }}
                        className="px-6 py-3 bg-white hover:bg-sky-50 text-blue-700 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition transform hover:scale-105 flex items-center gap-2 cursor-pointer border-2 border-sky-300"
                      >
                        <LogIn className="w-4 h-4 text-blue-600" />
                        <span>Đăng Nhập Tài Khoản</span>
                      </button>

                      <button
                        onClick={() => {
                          setLoginModalRole('student');
                          setIsLoginModalOpen(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl transition transform hover:scale-105 flex items-center gap-2 cursor-pointer border-2 border-white/40"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Đăng Ký Tài Khoản Mới</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-white/95 text-xs sm:text-sm font-bold bg-blue-900/60 border border-sky-400/50 px-4 py-2.5 rounded-2xl backdrop-blur-xs">
                      <span>✨ Em hãy chọn bài học ở danh sách bên dưới để bắt đầu học nhé!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative 3D Mascot */}
              {(bannerConfig.showMascot ?? true) && (
                <div className="absolute -right-6 -bottom-8 text-9xl opacity-30 sm:opacity-50 select-none pointer-events-none">
                  🤖
                </div>
              )}
            </div>

            {/* Area 1: 3 Grade Selector Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800">
                    Chọn Khối Lớp Để Học
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Chương trình Tin học tiểu học Lớp 3, Lớp 4, Lớp 5 chuẩn SGK
                  </p>
                </div>
              </div>

              <GradeSelector
                selectedGrade={selectedGrade}
                onSelectGrade={(g) => {
                  setSelectedGrade(g);
                  setSelectedTopicId('all');
                }}
                gradeStats={gradeStats}
              />
            </div>

            {/* Area 2: Topic Filter Pills for Current Grade */}
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  CÁC CHỦ ĐỀ MÔN TIN HỌC LỚP {selectedGrade}:
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {displayedLessons.length} bài học
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedTopicId('all')}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                    selectedTopicId === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md ring-2 ring-sky-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-sky-50 border border-slate-200'
                  }`}
                >
                  Tất cả chủ đề ✨
                </button>
                {currentGradeTopics.map((top) => {
                  const isSelected = selectedTopicId === top.id;
                  return (
                    <button
                      key={top.id}
                      onClick={() => setSelectedTopicId(top.id)}
                      className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md ring-2 ring-sky-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-sky-50 border border-slate-200'
                      }`}
                    >
                      <span>{top.icon}</span>
                      <span>{top.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area 3: Lessons Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>DANH SÁCH BÀI HỌC LỚP {selectedGrade}</span>
                  <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                    {displayedLessons.length} bài
                  </span>
                </h3>
              </div>

              {displayedLessons.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-300">
                  <div className="text-5xl mb-3">🔍</div>
                  <h4 className="text-lg font-black text-slate-700">
                    Không tìm thấy bài học phù hợp
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Thầy cô hoặc học sinh hãy thử tìm với từ khóa khác hoặc bấm nút "Tất cả chủ đề" nhé!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedLessons.map((lesson) => {
                    const topic = topics.find((t) => t.id === lesson.topicId);
                    return (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        topicName={topic?.name}
                        isCompleted={progress.completedLessons.includes(lesson.id)}
                        score={progress.quizScores[lesson.id]}
                        onStartLearning={handleStartLearning}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t-2 border-slate-200 pt-6 pb-32 sm:pb-28 text-center text-xs text-slate-500 font-semibold">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hộp Bản quyền & Tác giả thiết kế */}
          <div className="p-4 bg-gradient-to-r from-slate-50 via-amber-50/50 to-slate-50 rounded-2xl border-2 border-slate-200 text-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="font-bold text-xs flex items-center gap-1.5 text-slate-800">
              <span className="text-base">📜</span>
              <span>© 2026 Học Liệu Tin Học Kết Nối. Bản quyền thuộc về tác giả.</span>
            </div>
            <div className="text-xs font-bold text-slate-700">
              Giao diện &amp; Nội dung thiết kế bởi <span className="text-amber-700 font-black underline decoration-amber-400 decoration-2 underline-offset-2">Triệu Mai Hường</span>.
            </div>
          </div>
        </div>
      </footer>



      {/* Modern Login Modal with Demo Accounts */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRoleTab={loginModalRole}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        user={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={handleLogout}
        onSwitchAccount={() => {
          setIsProfileModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        completedCount={progress.completedLessons.length}
      />

      {/* Star Shower Celebration Modal on Lesson Completion */}
      <StarShowerCelebrationModal
        isOpen={showStarShowerModal}
        onClose={() => setShowStarShowerModal(false)}
        lessonTitle={completedCelebrationInfo?.title || activeLesson?.title || 'Bài học'}
        grade={completedCelebrationInfo?.grade || activeLesson?.grade || selectedGrade}
        studentName={currentUser?.fullName || 'Em học sinh'}
        totalStars={currentUser?.stars || (progress.completedLessons.length * 3)}
        onNextLesson={
          activeLesson &&
          lessons.filter((l) => l.grade === activeLesson.grade).findIndex((l) => l.id === activeLesson.id) + 1 <
            lessons.filter((l) => l.grade === activeLesson.grade).length
            ? handleGoToNextLesson
            : undefined
        }
      />

      {/* Footer / Bottom Navigation Menu Bar for multi-device compatibility */}
      <BottomNavigation
        selectedGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
        currentUser={currentUser}
        onGoHome={handleBackToHome}
        onOpenLogin={() => {
          setLoginModalRole('student');
          setIsLoginModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdmin={() => {
          if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
            setIsLoggedInAdmin(true);
          } else {
            setLoginModalRole('teacher');
            setIsLoginModalOpen(true);
          }
        }}
        starsEarned={progress.starsEarned}
        activeLesson={activeLesson}
        onSelectSection={handleSelectSection}
        isLoggedInAdmin={isLoggedInAdmin}
      />
    </div>
  );
}
