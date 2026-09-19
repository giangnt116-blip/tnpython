import { supabase } from '../../lib/supabase';
import { DbExamResult, DbCodingProgress, LatestCodingProgress, StudentOverviewSummary } from './types';

export async function fetchExamResults(): Promise<DbExamResult[]> {
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      id,
      student_name,
      class_name,
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
      exam_version,
      submitted_at
    `)
    .order('submitted_at', { ascending: false });

  if (error) {
    throw new Error(`Lỗi khi đọc kết quả trắc nghiệm: ${error.message}`);
  }

  return (data || []) as DbExamResult[];
}

export async function fetchCodingProgress(): Promise<DbCodingProgress[]> {
  const { data, error } = await supabase
    .from('coding_progress')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Lỗi khi đọc tiến độ lập trình: ${error.message}`);
  }

  return (data || []) as DbCodingProgress[];
}

/**
 * Deduplicate coding progress records.
 * Keeps only the latest record by `updated_at` for each (student_name, class_name, track, problem_id)
 */
export function deduplicateCodingProgress(records: DbCodingProgress[]): LatestCodingProgress[] {
  const map = new Map<string, DbCodingProgress>();

  for (const record of records) {
    const studentClean = (record.student_name || '').trim().toLowerCase();
    const classClean = (record.class_name || '').trim().toLowerCase();
    const trackClean = (record.track || '').toLowerCase();
    const problemClean = (record.problem_id || '').trim().toUpperCase();

    const dedupKey = `${studentClean}__${classClean}__${trackClean}__${problemClean}`;

    const existing = map.get(dedupKey);
    if (!existing) {
      map.set(dedupKey, record);
    } else {
      const existingTime = new Date(existing.updated_at || existing.created_at || 0).getTime();
      const newTime = new Date(record.updated_at || record.created_at || 0).getTime();
      if (newTime > existingTime) {
        map.set(dedupKey, record);
      }
    }
  }

  return Array.from(map.entries()).map(([dedupKey, rec]) => ({
    ...rec,
    dedupKey,
  }));
}

/**
 * Aggregate summary across exam results and latest coding progress
 */
export function buildStudentOverview(
  examResults: DbExamResult[],
  latestCoding: LatestCodingProgress[]
): {
  students: StudentOverviewSummary[];
  totalUniqueStudents: number;
  totalExamAttempts: number;
  averageExamScore: number;
  totalCodingCompleted: number;
} {
  const studentMap = new Map<string, StudentOverviewSummary>();

  const getStudentKey = (name: string, className?: string | null) => {
    return `${(name || '').trim().toLowerCase()}__${(className || '').trim().toLowerCase()}`;
  };

  const getOrCreate = (name: string, className?: string | null): StudentOverviewSummary => {
    const key = getStudentKey(name, className);
    let s = studentMap.get(key);
    if (!s) {
      s = {
        studentName: (name || '').trim(),
        className: (className || '').trim(),
        examAttempts: 0,
        highestExamScore: null,
        latestExamScore: null,
        basicCompletedCount: 0,
        septemberCompletedCount: 0,
        totalCodingCompleted: 0,
      };
      studentMap.set(key, s);
    }
    return s;
  };

  // 1. Process Exam Results
  let totalScoreSum = 0;
  for (const exam of examResults) {
    if (!exam.student_name) continue;
    totalScoreSum += exam.score || 0;

    const s = getOrCreate(exam.student_name, exam.class_name);
    s.examAttempts += 1;
    if (s.highestExamScore === null || exam.score > s.highestExamScore) {
      s.highestExamScore = exam.score;
    }
    if (s.latestExamScore === null) {
      // First one encountered is latest since ordered by submitted_at desc
      s.latestExamScore = exam.score;
    }
    if (exam.submitted_at && (!s.lastActiveAt || new Date(exam.submitted_at) > new Date(s.lastActiveAt))) {
      s.lastActiveAt = exam.submitted_at;
    }
  }

  // 2. Process Latest Coding Progress
  let totalCompletedCoding = 0;
  for (const code of latestCoding) {
    if (!code.student_name) continue;
    const s = getOrCreate(code.student_name, code.class_name);

    if (code.status === 'completed') {
      totalCompletedCoding += 1;
      if (code.track === 'basic') {
        s.basicCompletedCount += 1;
      } else if (code.track === 'september') {
        s.septemberCompletedCount += 1;
      }
      s.totalCodingCompleted = s.basicCompletedCount + s.septemberCompletedCount;
    }

    const time = code.updated_at || code.completed_at || code.started_at;
    if (time && (!s.lastActiveAt || new Date(time) > new Date(s.lastActiveAt))) {
      s.lastActiveAt = time;
    }
  }

  const studentList = Array.from(studentMap.values()).sort((a, b) => {
    // Sort by class then by name
    const classComp = a.className.localeCompare(b.className);
    if (classComp !== 0) return classComp;
    return a.studentName.localeCompare(b.studentName);
  });

  const totalExamAttempts = examResults.length;
  const averageExamScore =
    totalExamAttempts > 0 ? Math.round((totalScoreSum / totalExamAttempts) * 10) / 10 : 0;

  return {
    students: studentList,
    totalUniqueStudents: studentList.length,
    totalExamAttempts,
    averageExamScore,
    totalCodingCompleted: totalCompletedCoding,
  };
}
