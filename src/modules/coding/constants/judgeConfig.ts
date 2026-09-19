/**
 * Cấu hình danh sách tập trung các bài tập hỗ trợ hệ thống Auto-Judge (V1.3).
 * Dùng chung giữa Frontend (CodingHome, PythonJudgeSection, TeacherModule) và Backend (/api/judge).
 * Hỗ trợ toàn bộ 33 bài luyện thi tháng 9: B01 đến B33.
 */
export const JUDGE_ENABLED_PROBLEMS = [
  'B01',
  'B02',
  'B03',
  'B04',
  'B05',
  'B06',
  'B07',
  'B08',
  'B09',
  'B10',
  'B11',
  'B12',
  'B13',
  'B14',
  'B15',
  'B16',
  'B17',
  'B18',
  'B19',
  'B20',
  'B21',
  'B22',
  'B23',
  'B24',
  'B25',
  'B26',
  'B27',
  'B28',
  'B29',
  'B30',
  'B31',
  'B32',
  'B33',
] as const;

export type JudgeEnabledProblemId = (typeof JUDGE_ENABLED_PROBLEMS)[number];

/**
 * Kiểm tra xem một bài tập có được kích hoạt Auto-Judge hay không dựa trên problemId và track.
 */
export function isJudgeEnabled(problemId: string, track: string = 'september'): boolean {
  if (track !== 'september') return false;
  return (JUDGE_ENABLED_PROBLEMS as readonly string[]).includes(problemId);
}

/**
 * Kiểm tra mã bài toán có nằm trong danh sách bài hợp lệ cho Auto-Judge hay không.
 */
export function isValidJudgeProblem(problemId: string): boolean {
  return (JUDGE_ENABLED_PROBLEMS as readonly string[]).includes(problemId);
}
