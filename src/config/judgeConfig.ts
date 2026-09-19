/**
 * Cấu hình danh sách các bài tập hỗ trợ Auto-Judge tập trung (V1.1).
 * Dùng chung giữa Frontend và Backend / Server.
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
] as const;

export type JudgeEnabledProblemId = (typeof JUDGE_ENABLED_PROBLEMS)[number];

export function isJudgeEnabled(problemId: string, track: string = 'september'): boolean {
  if (track !== 'september') return false;
  return (JUDGE_ENABLED_PROBLEMS as readonly string[]).includes(problemId);
}
