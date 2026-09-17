export interface Question {
  id: number;
  category: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  code?: string;
  sourceNote?: string;
}

export interface StudentInfo {
  fullName: string;
  className: string;
}

export interface CategoryScore {
  category: string;
  correct: number;
  total: number;
}

export interface ExamResult {
  student: StudentInfo;
  score: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  timeSpentSeconds: number;
  totalQuestions: number;
  categoryScores: CategoryScore[];
  submittedAt: number;
}

export interface SavedExamState {
  student: StudentInfo;
  answers: Record<number, string>;
  currentIndex: number;
  flaggedQuestionIds: number[];
  startTime: number;
  endTime: number;
  status: 'in_progress' | 'submitted';
}
