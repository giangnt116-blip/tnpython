import { SavedExamState, ExamResult } from '../types';

const STORAGE_KEY_EXAM = 'python_100_exam_state';
const STORAGE_KEY_RESULT = 'python_100_exam_result';

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
}
