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

export type ProblemStatus = 'not_started' | 'in_progress' | 'completed';

export interface CodingProblem {
  id: string;
  code?: string;
  title: string;
  topic?: string;
  difficulty?: string;
  statement?: string;
  description?: string;
  input?: string;
  inputFormat?: string;
  output?: string;
  outputFormat?: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  explanation?: string;
  pythonFile?: string;
  pythonFilename?: string;
  cppFile?: string;
  cppFilename?: string;
  submission?: string;
  source?: string;
}
