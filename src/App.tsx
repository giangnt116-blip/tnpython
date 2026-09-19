/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { questions } from './data/questions.js';
import { StudentInfo, ExamResult, Question, CategoryScore, SavedExamState } from './types';
import { StartScreen } from './components/StartScreen';
import { ExamHeader } from './components/ExamHeader';
import { QuestionCard } from './components/QuestionCard';
import { QuestionNavigator } from './components/QuestionNavigator';
import { SubmitConfirmModal } from './components/SubmitConfirmModal';
import { ResultScreen } from './components/ResultScreen';
import { ResumeExamModal } from './components/ResumeExamModal';
import { HomeScreen } from './components/HomeScreen';
import { CodingHome } from './modules/coding/CodingHome';
import { TeacherModule } from './modules/teacher/TeacherModule';
import {
  saveExam,
  loadExam,
  clearExam,
  saveResult,
  loadResult,
  clearAllExamData,
  isResultSynced,
  setResultSynced,
  savePendingPayload,
  loadPendingPayload,
  clearPendingPayload,
} from './utils/examStorage';
import { saveExamResult, ExamResultInput } from './services/examResults';

const TOTAL_EXAM_MINUTES = 100;
const TOTAL_EXAM_SECONDS = TOTAL_EXAM_MINUTES * 60; // 6000 seconds

const CATEGORY_ORDER = [
  'Biến và kiểu dữ liệu',
  'Toán tử số học',
  'Toán tử so sánh và logic',
  'Nhập/Xuất dữ liệu (input/print)',
  'Câu lệnh rẽ nhánh if - elif - else',
  'Vòng lặp for',
  'Vòng lặp while',
  'Chuỗi (string) cơ bản',
  'List cơ bản',
  'Hàm (function) cơ bản',
];

export default function App() {
  // Check on initial load if an unsubmitted exam or existing result exists
  const [uncompletedExam, setUncompletedExam] = useState<SavedExamState | null>(() => {
    const existingResult = loadResult();
    if (existingResult) return null;
    const active = loadExam();
    if (active && active.status === 'in_progress') {
      return active;
    }
    return null;
  });

  const [result, setResult] = useState<ExamResult | null>(() => {
    return loadResult();
  });

  const [mainModule, setMainModule] = useState<'home' | 'quiz' | 'coding' | 'teacher'>(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/teacher') || window.location.hash === '#teacher')
    ) {
      return 'teacher';
    }
    return 'home';
  });

  // Keep URL in sync with teacher portal
  useEffect(() => {
    const handlePopState = () => {
      if (
        window.location.pathname.startsWith('/teacher') ||
        window.location.hash === '#teacher'
      ) {
        setMainModule('teacher');
      } else if (mainModule === 'teacher') {
        setMainModule('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [mainModule]);

  const handleNavigateTeacher = () => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/teacher') {
      window.history.pushState(null, '', '/teacher');
    }
    setMainModule('teacher');
  };

  const handleNavigateHomeFromTeacher = () => {
    if (typeof window !== 'undefined' && window.location.pathname === '/teacher') {
      window.history.pushState(null, '', '/');
    }
    setMainModule('home');
  };

  const [screen, setScreen] = useState<'start' | 'exam' | 'result'>(() => {
    if (loadResult()) return 'result';
    return 'start';
  });

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(TOTAL_EXAM_SECONDS);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isOpenMobileNavigator, setIsOpenMobileNavigator] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const [isSynced, setIsSynced] = useState<boolean>(() => {
    return isResultSynced();
  });

  const retryAttemptedRef = useRef<boolean>(false);

  // Retry sync if result was saved locally but not yet synced to Supabase
  useEffect(() => {
    if (isResultSynced()) {
      setIsSynced(true);
      return;
    }

    const pendingPayload = loadPendingPayload();
    if (!pendingPayload) return;

    if (retryAttemptedRef.current) return;
    retryAttemptedRef.current = true;

    const performRetry = async () => {
      try {
        await saveExamResult(pendingPayload);
        setResultSynced(true);
        clearPendingPayload();
        setIsSynced(true);
        console.log('Đã tự động đồng bộ kết quả thi lên Supabase thành công.');
      } catch (err) {
        console.warn('Tự động đồng bộ lại lên Supabase chưa thành công:', err);
      }
    };

    if (navigator.onLine) {
      performRetry();
    } else {
      const handleOnline = () => {
        performRetry();
        window.removeEventListener('online', handleOnline);
      };
      window.addEventListener('online', handleOnline);
      return () => window.removeEventListener('online', handleOnline);
    }
  }, []);

  // Refs for callbacks & intervals
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const studentRef = useRef(student);
  studentRef.current = student;
  const endTimeRef = useRef(endTime);
  endTimeRef.current = endTime;
  const startTimeRef = useRef(startTime);
  startTimeRef.current = startTime;

  // Grade exam function - computes score and category breakdowns
  const gradeExam = useCallback((
    studentAnswers: Record<number, string>,
    remainingSeconds: number,
    candidateInfo?: StudentInfo,
    customStartTime?: number
  ): ExamResult => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    const allQuestions = questions as Question[];

    allQuestions.forEach((q) => {
      const userAns = studentAnswers[q.id];
      if (!userAns) {
        unanswered += 1;
      } else if (userAns.trim().toUpperCase() === q.answer.trim().toUpperCase()) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    });

    // Compute category scores according to questions.js categories
    const categoryScores: CategoryScore[] = CATEGORY_ORDER.map((catName) => {
      const catQuestions = allQuestions.filter((q) => q.category === catName);
      let catCorrect = 0;
      catQuestions.forEach((q) => {
        const uAns = studentAnswers[q.id];
        if (uAns && uAns.trim().toUpperCase() === q.answer.trim().toUpperCase()) {
          catCorrect += 1;
        }
      });
      return {
        category: catName,
        correct: catCorrect,
        total: catQuestions.length,
      };
    });

    let timeSpent = Math.max(0, TOTAL_EXAM_SECONDS - remainingSeconds);
    if (customStartTime && customStartTime > 0) {
      const actualElapsed = Math.floor((Date.now() - customStartTime) / 1000);
      timeSpent = Math.min(TOTAL_EXAM_SECONDS, Math.max(0, actualElapsed));
    }

    return {
      student: candidateInfo || studentRef.current || { fullName: 'Học sinh', className: '' },
      score: correct, // 1 point per correct answer, max 100
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      timeSpentSeconds: timeSpent,
      totalQuestions: allQuestions.length,
      categoryScores,
      submittedAt: Date.now(),
    };
  }, []);

  // Submit exam logic
  const handleSubmitExam = useCallback(
    async (
      remainingSeconds?: number,
      forcedAnswers?: Record<number, string>,
      forcedStudent?: StudentInfo,
      forcedStartTime?: number
    ) => {
      // Prevent multiple submissions
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      const curAnswers = forcedAnswers || answersRef.current;
      const curStudent = forcedStudent || studentRef.current || { fullName: 'Học sinh', className: '' };
      const curStartTime = forcedStartTime !== undefined ? forcedStartTime : startTimeRef.current;

      // 1. Chấm điểm
      const sec =
        remainingSeconds !== undefined
          ? remainingSeconds
          : endTimeRef.current
          ? Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000))
          : timeLeftSeconds;

      const finalResult = gradeExam(
        curAnswers,
        sec,
        curStudent,
        curStartTime
      );

      // 2. Tính: score, correct_count, wrong_count, blank_count, duration_seconds
      const score = finalResult.score;
      const correct_count = finalResult.correctCount;
      const wrong_count = finalResult.incorrectCount;
      const blank_count = finalResult.unansweredCount;
      const duration_seconds = finalResult.timeSpentSeconds;

      // 3. Tính điểm 10 chủ đề (dựa trên field category của questions.js theo đúng thứ tự)
      const topic_1_score = finalResult.categoryScores[0]?.correct ?? 0;
      const topic_2_score = finalResult.categoryScores[1]?.correct ?? 0;
      const topic_3_score = finalResult.categoryScores[2]?.correct ?? 0;
      const topic_4_score = finalResult.categoryScores[3]?.correct ?? 0;
      const topic_5_score = finalResult.categoryScores[4]?.correct ?? 0;
      const topic_6_score = finalResult.categoryScores[5]?.correct ?? 0;
      const topic_7_score = finalResult.categoryScores[6]?.correct ?? 0;
      const topic_8_score = finalResult.categoryScores[7]?.correct ?? 0;
      const topic_9_score = finalResult.categoryScores[8]?.correct ?? 0;
      const topic_10_score = finalResult.categoryScores[9]?.correct ?? 0;

      // 4. Chuẩn bị answers_json (lựa chọn của học sinh dạng { "1": "B", ..., "100": null }, không lưu đáp án đúng)
      const answers_json: Record<string, string | null> = {};
      for (let i = 1; i <= 100; i++) {
        answers_json[String(i)] = curAnswers[i] || null;
      }

      const supabasePayload: ExamResultInput = {
        student_name: finalResult.student.fullName,
        class_name: finalResult.student.className ? finalResult.student.className : null,
        score,
        correct_count,
        wrong_count,
        blank_count,
        duration_seconds,
        topic_1_score,
        topic_2_score,
        topic_3_score,
        topic_4_score,
        topic_5_score,
        topic_6_score,
        topic_7_score,
        topic_8_score,
        topic_9_score,
        topic_10_score,
        answers_json,
        exam_version: 'python100-v1',
      };

      // Luôn lưu toàn bộ kết quả vào localStorage và xóa dữ liệu làm dở
      saveResult(finalResult);
      clearExam();

      // 5. Gọi saveExamResult()
      let syncSuccess = false;
      try {
        await saveExamResult(supabasePayload);
        syncSuccess = true;
        setResultSynced(true);
        clearPendingPayload();
      } catch (error) {
        console.warn('Supabase saveExamResult error (fallback to local):', error);
        syncSuccess = false;
        setResultSynced(false);
        savePendingPayload(supabasePayload);
      }

      // 6. Sau đó chuyển sang ResultScreen
      setResult(finalResult);
      setIsSynced(syncSuccess);
      setIsConfirmModalOpen(false);
      setIsOpenMobileNavigator(false);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      setScreen('result');
    },
    [gradeExam, timeLeftSeconds]
  );

  // Persistent Timer: Calculates from absolute endTime
  useEffect(() => {
    if (screen !== 'exam' || !endTime) return;

    const checkTime = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);

      if (remaining <= 0) {
        // Time is up -> automatically submit
        handleSubmitExam(0);
      }
    };

    checkTime();
    const timer = setInterval(checkTime, 1000);

    return () => clearInterval(timer);
  }, [screen, endTime, handleSubmitExam]);

  // Auto-save exam progress to localStorage on any state change during exam
  useEffect(() => {
    if (screen === 'exam' && student && endTime) {
      saveExam({
        student,
        answers,
        currentIndex,
        flaggedQuestionIds,
        startTime,
        endTime,
        status: 'in_progress',
      });
    }
  }, [screen, student, answers, currentIndex, flaggedQuestionIds, startTime, endTime]);

  // Start a fresh exam
  const handleStartExam = (info: StudentInfo) => {
    const now = Date.now();
    const calculatedEndTime = now + TOTAL_EXAM_SECONDS * 1000;

    setStudent(info);
    setAnswers({});
    setFlaggedQuestionIds([]);
    setCurrentIndex(0);
    setStartTime(now);
    setEndTime(calculatedEndTime);
    setTimeLeftSeconds(TOTAL_EXAM_SECONDS);
    setIsConfirmModalOpen(false);
    setIsOpenMobileNavigator(false);
    setResult(null);

    // Save initial exam state
    saveExam({
      student: info,
      answers: {},
      currentIndex: 0,
      flaggedQuestionIds: [],
      startTime: now,
      endTime: calculatedEndTime,
      status: 'in_progress',
    });

    setScreen('exam');
  };

  // Resume uncompleted exam from modal
  const handleResumeExam = () => {
    if (!uncompletedExam) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.floor((uncompletedExam.endTime - now) / 1000));

    // If time already expired while student was away, grade and submit immediately
    if (remaining <= 0) {
      handleSubmitExam(
        0,
        uncompletedExam.answers || {},
        uncompletedExam.student,
        uncompletedExam.startTime
      );
      setUncompletedExam(null);
      return;
    }

    // Restore full state
    setStudent(uncompletedExam.student);
    setAnswers(uncompletedExam.answers || {});
    setFlaggedQuestionIds(uncompletedExam.flaggedQuestionIds || []);
    setCurrentIndex(uncompletedExam.currentIndex || 0);
    setStartTime(uncompletedExam.startTime);
    setEndTime(uncompletedExam.endTime);
    setTimeLeftSeconds(remaining);
    setUncompletedExam(null);
    setScreen('exam');
  };

  // Reset and discard uncompleted exam
  const handleResetUncompletedExam = () => {
    clearExam();
    setUncompletedExam(null);
    setScreen('start');
  };

  // Restart / New Exam from Result Screen
  const handleRestart = () => {
    clearAllExamData();
    setStudent(null);
    setAnswers({});
    setFlaggedQuestionIds([]);
    setCurrentIndex(0);
    setStartTime(0);
    setEndTime(0);
    setTimeLeftSeconds(TOTAL_EXAM_SECONDS);
    setResult(null);
    setIsSynced(false);
    setUncompletedExam(null);
    setScreen('start');
  };

  // Option selection
  const handleSelectOption = (optionKey: string) => {
    const currentQ = questions[currentIndex] as Question;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionKey,
    }));
  };

  // Flag toggle handler
  const handleToggleFlag = (questionId: number) => {
    setFlaggedQuestionIds((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      }
      return [...prev, questionId];
    });
  };

  // Navigation
  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  // 1. Home Screen (First screen of the application)
  if (mainModule === 'home') {
    return (
      <HomeScreen
        onSelectQuiz={() => setMainModule('quiz')}
        onSelectCoding={() => setMainModule('coding')}
        onSelectTeacher={handleNavigateTeacher}
        hasUncompletedExam={!!uncompletedExam}
      />
    );
  }

  // 2. Teacher Portal Module
  if (mainModule === 'teacher') {
    return <TeacherModule onBackToHome={handleNavigateHomeFromTeacher} />;
  }

  // 3. Coding Practice Module
  if (mainModule === 'coding') {
    return <CodingHome onBackToHome={() => setMainModule('home')} />;
  }

  // 3. Quiz Module (Existing logic preserved 100%)
  // Modal 1: Detect uncompleted exam
  if (uncompletedExam) {
    return (
      <ResumeExamModal
        savedExam={uncompletedExam}
        totalQuestions={questions.length}
        onResume={handleResumeExam}
        onReset={handleResetUncompletedExam}
      />
    );
  }

  // Render 1: Start Screen
  if (screen === 'start') {
    return <StartScreen onStart={handleStartExam} onBack={() => setMainModule('home')} />;
  }

  // Render 3: Result Screen
  if (screen === 'result' && result) {
    return <ResultScreen result={result} isSynced={isSynced} onRestart={handleRestart} />;
  }

  // Render 2: Exam Screen
  const currentQuestion = questions[currentIndex] as Question;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const isCurrentFlagged = flaggedQuestionIds.includes(currentQuestion.id);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <ExamHeader
        student={student || { fullName: '', className: '' }}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        timeLeftSeconds={timeLeftSeconds}
        isSubmitting={isSubmitting}
        onOpenNavigator={() => setIsOpenMobileNavigator(true)}
        onRequestSubmit={() => setIsConfirmModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
        {/* Left: Active Question Card */}
        <div className="flex-1 min-w-0">
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            selectedOption={answers[currentQuestion.id]}
            isFlagged={isCurrentFlagged}
            onToggleFlag={() => handleToggleFlag(currentQuestion.id)}
            onSelectOption={handleSelectOption}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>

        {/* Right: 100 Questions Navigator (Desktop sidebar & Mobile drawer) */}
        <QuestionNavigator
          totalQuestions={questions.length}
          currentIndex={currentIndex}
          answers={answers}
          flaggedQuestionIds={flaggedQuestionIds}
          onSelectQuestion={(idx) => setCurrentIndex(idx)}
          isOpenMobile={isOpenMobileNavigator}
          onCloseMobile={() => setIsOpenMobileNavigator(false)}
        />
      </main>

      {/* Submit Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={isConfirmModalOpen}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        flaggedCount={flaggedQuestionIds.length}
        timeLeftSeconds={timeLeftSeconds}
        isSubmitting={isSubmitting}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={() => handleSubmitExam()}
      />
    </div>
  );
}
