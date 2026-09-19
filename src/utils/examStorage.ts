import { SavedExamState, ExamResult } from '../types';
import { ExamResultInput } from '../services/examResults';

const STORAGE_KEY_EXAM = 'python_100_exam_state';
const STORAGE_KEY_RESULT = 'python_100_exam_result';
const STORAGE_KEY_SYNCED = 'python_100_result_synced';
const STORAGE_KEY_PENDING_PAYLOAD = 'python_100_pending_supabase_payload';

/**
 * Save in-progress exam state to localStorage
 */
export function saveExam(state: SavedExamState): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXAM, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save exam to localStorage:', error);
  }
}

/**
 * Load in-progress exam state from localStorage
 */
export function loadExam(): SavedExamState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXAM);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.student && parsed.student.fullName && parsed.endTime) {
      return parsed as SavedExamState;
    }
    return null;
  } catch (error) {
    console.error('Failed to load exam from localStorage:', error);
    return null;
  }
}

/**
 * Clear in-progress exam from localStorage
 */
export function clearExam(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_EXAM);
  } catch (error) {
    console.error('Failed to clear exam from localStorage:', error);
  }
}

/**
 * Checks if there is an active exam that is currently in progress
 */
export function hasActiveExam(): boolean {
  const exam = loadExam();
  return exam !== null && exam.status === 'in_progress';
}

/**
 * Save completed exam result to localStorage
 */
export function saveResult(result: ExamResult): void {
  try {
    localStorage.setItem(STORAGE_KEY_RESULT, JSON.stringify(result));
  } catch (error) {
    console.error('Failed to save exam result to localStorage:', error);
  }
}

/**
 * Load completed exam result from localStorage
 */
export function loadResult(): ExamResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESULT);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.student && typeof parsed.score === 'number') {
      return parsed as ExamResult;
    }
    return null;
  } catch (error) {
    console.error('Failed to load exam result from localStorage:', error);
    return null;
  }
}

/**
 * Clear completed exam result from localStorage
 */
export function clearResult(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_RESULT);
  } catch (error) {
    console.error('Failed to clear exam result from localStorage:', error);
  }
}

/**
 * Clear both exam state and exam result
 */
export function clearAllExamData(): void {
  clearExam();
  clearResult();
  clearPendingPayload();
  try {
    localStorage.removeItem(STORAGE_KEY_SYNCED);
  } catch {}
}

/**
 * Check if the exam result has been successfully synced to Supabase
 */
export function isResultSynced(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_SYNCED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Set the exam result sync status in localStorage
 */
export function setResultSynced(synced: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_SYNCED, synced ? 'true' : 'false');
  } catch (error) {
    console.error('Failed to set resultSynced in localStorage:', error);
  }
}

/**
 * Save pending Supabase payload to localStorage when offline or sync fails
 */
export function savePendingPayload(payload: ExamResultInput): void {
  try {
    localStorage.setItem(STORAGE_KEY_PENDING_PAYLOAD, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save pending payload:', error);
  }
}

/**
 * Load pending Supabase payload from localStorage
 */
export function loadPendingPayload(): ExamResultInput | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_PAYLOAD);
    if (!raw) return null;
    return JSON.parse(raw) as ExamResultInput;
  } catch {
    return null;
  }
}

/**
 * Clear pending Supabase payload from localStorage
 */
export function clearPendingPayload(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PENDING_PAYLOAD);
  } catch {}
}
