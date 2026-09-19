export interface TeacherAccount {
  user_id: string;
  display_name: string;
}

export interface TeacherUser {
  id: string;
  email?: string;
  displayName: string;
}

export interface DbExamResult {
  id: string | number;
  student_name: string;
  class_name: string | null;
  score: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  duration_seconds: number;
  topic_1_score?: number;
  topic_2_score?: number;
  topic_3_score?: number;
  topic_4_score?: number;
  topic_5_score?: number;
  topic_6_score?: number;
  topic_7_score?: number;
  topic_8_score?: number;
  topic_9_score?: number;
  topic_10_score?: number;
  answers_json?: Record<string, string | null>;
  exam_version?: string;
  submitted_at?: string;
}

export interface DbCodingProgress {
  id?: string | number;
  student_name: string;
  class_name: string | null;
  track: 'basic' | 'september';
  problem_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at?: string | null;
  completed_at?: string | null;
  updated_at?: string;
  created_at?: string;
}

export interface LatestCodingProgress extends DbCodingProgress {
  dedupKey: string;
}

export interface StudentOverviewSummary {
  studentName: string;
  className: string;
  examAttempts: number;
  highestExamScore: number | null;
  latestExamScore: number | null;
  basicCompletedCount: number;
  septemberCompletedCount: number;
  totalCodingCompleted: number;
  lastActiveAt?: string;
}
