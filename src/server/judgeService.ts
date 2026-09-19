import dotenv from 'dotenv';
import { getSupabaseServerClient } from './supabaseServer';

dotenv.config();

export const SUPPORTED_PROBLEMS = ['B01', 'B02', 'B03', 'B04', 'B05'] as const;
export type SupportedProblemId = (typeof SUPPORTED_PROBLEMS)[number];

export interface JudgeRequestBody {
  student_name: string;
  class_name?: string | null;
  problem_id: string;
  source_code: string;
}

export interface JudgeResponseSuccess {
  success: true;
  problem_id: string;
  score: number;
  passed_tests: number;
  total_tests: number;
  verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error';
  execution_time_ms: number | null;
}

export interface JudgeResponseError {
  success?: false;
  error: string;
}

interface JudgeTestRecord {
  test_no: number;
  input_data: string;
  expected_output: string;
  score?: number | null;
  is_active?: boolean;
}

interface Judge0SubmissionResult {
  token: string;
  status_id: number;
  status?: { id: number; description: string };
  time?: string | number | null;
  memory?: number | null;
  compile_output?: string | null;
  stderr?: string | null;
}

/**
 * Validates the judge request body.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateJudgeRequest(body: any): string | null {
  if (!body || typeof body !== 'object') {
    return 'Dữ liệu yêu cầu không hợp lệ.';
  }

  const { student_name, problem_id, source_code } = body;

  if (typeof student_name !== 'string' || student_name.trim().length === 0) {
    return 'Tên học sinh (student_name) không được để trống.';
  }

  if (
    typeof problem_id !== 'string' ||
    !SUPPORTED_PROBLEMS.includes(problem_id as SupportedProblemId)
  ) {
    return `Hệ thống hiện chỉ hỗ trợ chấm các bài: ${SUPPORTED_PROBLEMS.join(', ')}.`;
  }

  if (typeof source_code !== 'string' || source_code.trim().length === 0) {
    return 'Mã nguồn (source_code) không được để trống.';
  }

  if (source_code.length > 20000) {
    return 'Mã nguồn vượt quá giới hạn cho phép (tối đa 20.000 ký tự).';
  }

  return null;
}

/**
 * Executes the full grading workflow for supported problems (B01, B02, ...) via Judge0 and logs to Supabase.
 */
export async function executeJudge(
  body: JudgeRequestBody
): Promise<{ status: number; data: JudgeResponseSuccess | JudgeResponseError }> {
  // 1. Validation
  const validationError = validateJudgeRequest(body);
  if (validationError) {
    return {
      status: 400,
      data: { error: validationError },
    };
  }

  const studentName = body.student_name.trim();
  const className = body.class_name ? body.class_name.trim() : null;
  const problemId = body.problem_id as SupportedProblemId;
  const sourceCode = body.source_code;

  // 2. Obtain server Supabase client
  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err: any) {
    console.error('[Judge API] Supabase server init error:', err?.message || err);
    return {
      status: 500,
      data: { error: 'Lỗi cấu hình máy chủ: Chưa thiết lập Supabase Server Credentials.' },
    };
  }

  // 3. Query hidden tests from public.judge_tests
  let tests: JudgeTestRecord[] = [];
  try {
    const { data, error } = await supabase
      .from('judge_tests')
      .select('test_no, input_data, expected_output, score, is_active')
      .eq('problem_id', problemId)
      .eq('is_active', true)
      .order('test_no', { ascending: true });

    if (error) {
      console.error('[Judge API] Failed to fetch judge_tests:', error);
      return {
        status: 500,
        data: { error: 'Lỗi khi đọc bộ kiểm thử từ cơ sở dữ liệu.' },
      };
    }

    tests = (data || []) as JudgeTestRecord[];
  } catch (err) {
    console.error('[Judge API] Exception reading judge_tests:', err);
    return {
      status: 500,
      data: { error: 'Không thể kết nối đến cơ sở dữ liệu để lấy bộ test.' },
    };
  }

  // Enforce exactly 10 tests as requested
  if (tests.length !== 10) {
    console.error(`[Judge API] Invalid test count for ${problemId}: expected 10, got ${tests.length}`);
    return {
      status: 500,
      data: {
        error: `Bộ kiểm thử không hợp lệ: Yêu cầu đủ 10 test case nhưng hiện tìm thấy ${tests.length} test cho bài ${problemId}.`,
      },
    };
  }

  // 4. Configure Judge0 API (Judge0 CE direct instance)
  const rawJudge0Url = process.env.JUDGE0_URL || 'https://ce.judge0.com';
  const judge0Url = rawJudge0Url.replace(/\/+$/, '');

  // Default request headers for Judge0 CE
  const judge0Headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // RapidAPI headers are strictly optional - only attach if variables exist
  if (process.env.JUDGE0_API_KEY) {
    judge0Headers['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY;
  }
  if (process.env.JUDGE0_API_HOST) {
    judge0Headers['X-RapidAPI-Host'] = process.env.JUDGE0_API_HOST;
  }

  // 5. Submit Batch to Judge0
  // Python 3 language_id: 71, cpu_time_limit: 2
  const submissionsPayload = tests.map((t) => ({
    language_id: 71,
    source_code: sourceCode,
    stdin: t.input_data ?? '',
    expected_output: t.expected_output ?? '',
    cpu_time_limit: 2,
  }));

  let tokens: string[] = [];
  try {
    const submitUrl = `${judge0Url}/submissions/batch?base64_encoded=false`;
    const submitRes = await fetch(submitUrl, {
      method: 'POST',
      headers: judge0Headers,
      body: JSON.stringify({ submissions: submissionsPayload }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text().catch(() => '');
      console.error(`[Judge API] Judge0 batch submit failed: status ${submitRes.status}`, errText);
      return {
        status: 502,
        data: { error: 'Lỗi máy chủ chấm code (Judge0 submit failed).' },
      };
    }

    const submitData = await submitRes.json();
    if (Array.isArray(submitData)) {
      tokens = submitData.map((item: any) => item.token).filter(Boolean);
    } else if (submitData && Array.isArray(submitData.submissions)) {
      tokens = submitData.submissions.map((item: any) => item.token).filter(Boolean);
    }

    if (tokens.length !== tests.length) {
      console.error(`[Judge API] Received ${tokens.length} tokens, expected ${tests.length}`);
      return {
        status: 502,
        data: { error: 'Hệ thống Judge0 không trả về đủ mã bài nộp cho các test case.' },
      };
    }
  } catch (err) {
    console.error('[Judge API] Network error during Judge0 submission:', err);
    return {
      status: 502,
      data: { error: 'Không thể kết nối đến máy chủ chấm Judge0.' },
    };
  }

  // 6. Polling batch results until all tests complete (max ~10 seconds)
  const startTime = Date.now();
  const MAX_POLL_DURATION_MS = 10000;
  const POLL_INTERVAL_MS = 800;
  const tokensParam = tokens.join(',');
  const pollUrl = `${judge0Url}/submissions/batch?tokens=${encodeURIComponent(tokensParam)}&base64_encoded=false&fields=token,status_id,status,time,memory,compile_output,stderr`;

  let finalSubmissions: Judge0SubmissionResult[] | null = null;

  try {
    while (Date.now() - startTime < MAX_POLL_DURATION_MS) {
      // Delay before next polling check
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollRes = await fetch(pollUrl, {
        method: 'GET',
        headers: judge0Headers,
      });

      if (!pollRes.ok) {
        console.warn(`[Judge API] Poll request returned status ${pollRes.status}, retrying...`);
        continue;
      }

      const pollData = await pollRes.json();
      const currentList: Judge0SubmissionResult[] = Array.isArray(pollData)
        ? pollData
        : pollData && Array.isArray(pollData.submissions)
        ? pollData.submissions
        : [];

      if (currentList.length === tokens.length) {
        // Status 1: In Queue, Status 2: Processing
        const isStillProcessing = currentList.some(
          (s) => s.status_id === 1 || s.status_id === 2
        );

        if (!isStillProcessing) {
          finalSubmissions = currentList;
          break;
        }
        // Save latest snapshot in case polling times out
        finalSubmissions = currentList;
      }
    }
  } catch (err) {
    console.error('[Judge API] Polling error:', err);
    return {
      status: 502,
      data: { error: 'Lỗi trong quá trình chờ kết quả từ Judge0.' },
    };
  }

  if (!finalSubmissions || finalSubmissions.length === 0) {
    return {
      status: 502,
      data: { error: 'Không nhận được kết quả chấm từ máy chủ Judge0 sau thời gian chờ.' },
    };
  }

  // 7. Calculate score, passed tests, and verdict
  // Map results back by token to match original test order
  const resultsByToken = new Map<string, Judge0SubmissionResult>();
  for (const item of finalSubmissions) {
    if (item.token) {
      resultsByToken.set(item.token, item);
    }
  }

  let passedTests = 0;
  let totalScore = 0;
  const totalTests = tests.length;

  let hasCompilationError = false;
  let hasRuntimeError = false;
  let hasTimeLimitExceeded = false;
  let hasWrongAnswer = false;

  let maxTimeSeconds = 0;
  let hasValidTime = false;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const token = tokens[i];
    const sub = resultsByToken.get(token);

    // If a submission never finished within timeout, treat as Time Limit Exceeded
    const statusId = sub ? (sub.status_id === 1 || sub.status_id === 2 ? 5 : sub.status_id) : 5;

    // Track execution time
    if (sub && sub.time !== null && sub.time !== undefined) {
      const parsedTime = typeof sub.time === 'number' ? sub.time : parseFloat(String(sub.time));
      if (!isNaN(parsedTime)) {
        hasValidTime = true;
        if (parsedTime > maxTimeSeconds) {
          maxTimeSeconds = parsedTime;
        }
      }
    }

    // Determine individual test status
    if (statusId === 3) {
      // Accepted
      passedTests++;
      const testScore =
        test.score !== undefined && test.score !== null
          ? Number(test.score)
          : 10;
      totalScore += testScore;
    } else if (statusId === 6) {
      hasCompilationError = true;
    } else if ((statusId >= 7 && statusId <= 12) || statusId === 13 || statusId === 14) {
      hasRuntimeError = true;
    } else if (statusId === 5) {
      hasTimeLimitExceeded = true;
    } else if (statusId === 4) {
      hasWrongAnswer = true;
    } else {
      // Any other unexpected status treated as Runtime Error
      hasRuntimeError = true;
    }
  }

  // Max score is 100
  const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // Determine final verdict according to priority order:
  // 1. Compilation Error
  // 2. Runtime Error
  // 3. Time Limit Exceeded
  // 4. Wrong Answer
  // 5. Accepted
  let verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error';

  if (hasCompilationError) {
    verdict = 'Compilation Error';
  } else if (hasRuntimeError) {
    verdict = 'Runtime Error';
  } else if (hasTimeLimitExceeded) {
    verdict = 'Time Limit Exceeded';
  } else if (hasWrongAnswer) {
    verdict = 'Wrong Answer';
  } else if (passedTests === totalTests) {
    verdict = 'Accepted';
  } else {
    verdict = 'Wrong Answer';
  }

  const executionTimeMs = hasValidTime ? Math.round(maxTimeSeconds * 1000) : null;
  const submittedAt = new Date().toISOString();

  // 8. Insert record into public.coding_submissions via server Supabase client
  try {
    const { error: insertError } = await supabase.from('coding_submissions').insert({
      student_name: studentName,
      class_name: className,
      track: 'september',
      problem_id: problemId,
      language: 'python',
      source_code: sourceCode,
      score: finalScore,
      passed_tests: passedTests,
      total_tests: totalTests,
      verdict: verdict,
      execution_time_ms: executionTimeMs,
      submitted_at: submittedAt,
    });

    if (insertError) {
      console.error('[Judge API] Failed to insert coding_submission:', insertError);
      return {
        status: 500,
        data: { error: 'Lỗi khi lưu lịch sử nộp bài vào cơ sở dữ liệu.' },
      };
    }
  } catch (err) {
    console.error('[Judge API] Exception inserting coding_submission:', err);
    return {
      status: 500,
      data: { error: 'Lỗi máy chủ khi ghi nhận kết quả bài nộp.' },
    };
  }

  // 9. Response to Frontend (DO NOT return input_data, expected_output, or test secrets)
  return {
    status: 200,
    data: {
      success: true,
      problem_id: problemId,
      score: finalScore,
      passed_tests: passedTests,
      total_tests: totalTests,
      verdict: verdict,
      execution_time_ms: executionTimeMs,
    },
  };
}

/**
 * Backward compatibility alias for problem B01
 */
export const executeJudgeB01 = executeJudge;
