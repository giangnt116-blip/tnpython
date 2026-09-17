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
import {
  saveExam,
  loadExam,
  clearExam,
  saveResult,
  loadResult,
  clearAllExamData,
} from './utils/examStorage';

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
  const handleSubmitExam = useCallback((remainingSeconds?: number) => {
    const sec =
      remainingSeconds !== undefined
        ? remainingSeconds
        : endTimeRef.current
        ? Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000))
        : timeLeftSeconds;

    const finalResult = gradeExam(
      answersRef.current,
      sec,
      studentRef.current || undefined,
      startTimeRef.current
    );

    // Save result to localStorage and clear exam progress
    saveResult(finalResult);
    clearExam();

    setResult(finalResult);
    setIsConfirmModalOpen(false);
    setIsOpenMobileNavigator(false);
    setScreen('result');
  }, [gradeExam, timeLeftSeconds]);

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
      const finalResult = gradeExam(
        uncompletedExam.answers || {},
        0,
        uncompletedExam.student,
        uncompletedExam.startTime
      );
      saveResult(finalResult);
      clearExam();
      setResult(finalResult);
      setUncompletedExam(null);
      setScreen('result');
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
    return <StartScreen onStart={handleStartExam} />;
  }

  // Render 3: Result Screen
  if (screen === 'result' && result) {
    return <ResultScreen result={result} onRestart={handleRestart} />;
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
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={() => handleSubmitExam()}
      />
    </div>
  );
}
