/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProblemStatus } from '../types';

export type CodingGroupType = 'basic' | 'september';

export interface ProblemStatusRecord {
  problemId: string;
  status: ProblemStatus;
  startedAt?: number;
  completedAt?: number;
}

export interface CodingStudentInfo {
  fullName: string;
  className?: string;
}

export const CODING_STUDENT_STORAGE_KEY = 'python_coding_student_info_v1';

export function getCodingStudentInfo(): CodingStudentInfo | null {
  try {
    const raw = localStorage.getItem(CODING_STUDENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.fullName === 'string' && parsed.fullName.trim()) {
        return {
          fullName: parsed.fullName.trim(),
          className: parsed.className ? String(parsed.className).trim() : '',
        };
      }
    }
    // Fallback to quiz state or result if student previously took quiz
    const examRaw = localStorage.getItem('python_100_exam_state');
    if (examRaw) {
      const parsed = JSON.parse(examRaw);
      if (parsed?.student?.fullName?.trim()) {
        const info: CodingStudentInfo = {
          fullName: parsed.student.fullName.trim(),
          className: parsed.student.className?.trim() || '',
        };
        localStorage.setItem(CODING_STUDENT_STORAGE_KEY, JSON.stringify(info));
        return info;
      }
    }
    const resultRaw = localStorage.getItem('python_100_exam_result');
    if (resultRaw) {
      const parsed = JSON.parse(resultRaw);
      if (parsed?.student?.fullName?.trim()) {
        const info: CodingStudentInfo = {
          fullName: parsed.student.fullName.trim(),
          className: parsed.student.className?.trim() || '',
        };
        localStorage.setItem(CODING_STUDENT_STORAGE_KEY, JSON.stringify(info));
        return info;
      }
    }
    return null;
  } catch (error) {
    console.warn('Lỗi khi đọc thông tin học sinh từ localStorage:', error);
    return null;
  }
}

export function saveCodingStudentInfo(info: CodingStudentInfo): void {
  try {
    localStorage.setItem(CODING_STUDENT_STORAGE_KEY, JSON.stringify(info));
  } catch (error) {
    console.warn('Lỗi khi lưu thông tin học sinh vào localStorage:', error);
  }
}

const STORAGE_KEYS: Record<CodingGroupType, string> = {
  basic: 'python_coding_basic_statuses_v1',
  september: 'python_coding_september_statuses_v1',
};

// Legacy key for migration
const LEGACY_STORAGE_KEY = 'python_coding_problem_statuses_v1';

/**
 * Get all problem status records for a given group ('basic' | 'september')
 */
export function getGroupProblemRecords(group: CodingGroupType): Record<string, ProblemStatusRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[group]);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure normalized format
      const result: Record<string, ProblemStatusRecord> = {};
      for (const [key, val] of Object.entries(parsed)) {
        if (typeof val === 'string') {
          result[key] = { problemId: key, status: val as ProblemStatus };
        } else if (val && typeof val === 'object') {
          result[key] = val as ProblemStatusRecord;
        }
      }
      return result;
    }

    // If 'basic' group has no record yet, check legacy storage key to preserve previous user work
    if (group === 'basic') {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        const result: Record<string, ProblemStatusRecord> = {};
        for (const [key, val] of Object.entries(legacyParsed)) {
          result[key] = {
            problemId: key,
            status: typeof val === 'string' ? (val as ProblemStatus) : ((val as any)?.status || 'not_started'),
            startedAt: Date.now(),
          };
        }
        // Save to the new basic key
        localStorage.setItem(STORAGE_KEYS.basic, JSON.stringify(result));
        return result;
      }
    }

    return {};
  } catch (error) {
    console.warn(`Lỗi khi đọc trạng thái bài tập nhóm ${group} từ localStorage:`, error);
    return {};
  }
}

/**
 * Get simple map of problemId -> ProblemStatus for easy UI consumption
 */
export function getGroupProblemStatuses(group: CodingGroupType): Record<string, ProblemStatus> {
  const records = getGroupProblemRecords(group);
  const map: Record<string, ProblemStatus> = {};
  for (const [id, rec] of Object.entries(records)) {
    map[id] = rec.status;
  }
  return map;
}

/**
 * Get single problem record for a given group
 */
export function getGroupProblemRecord(
  group: CodingGroupType,
  problemId: string
): ProblemStatusRecord | undefined {
  const records = getGroupProblemRecords(group);
  return records[problemId];
}

/**
 * Update problem status with timestamps and return the updated record
 */
export function setGroupProblemStatus(
  group: CodingGroupType,
  problemId: string,
  status: ProblemStatus
): ProblemStatusRecord {
  try {
    const records = getGroupProblemRecords(group);
    const existing = records[problemId] || { problemId, status: 'not_started' };
    const now = Date.now();

    const updated: ProblemStatusRecord = {
      ...existing,
      problemId,
      status,
      startedAt: existing.startedAt || (status !== 'not_started' ? now : undefined),
      completedAt: status === 'completed' ? now : undefined,
    };

    records[problemId] = updated;
    localStorage.setItem(STORAGE_KEYS[group], JSON.stringify(records));
    return updated;
  } catch (error) {
    console.warn(`Lỗi khi lưu trạng thái bài tập nhóm ${group}:`, error);
    return {
      problemId,
      status,
      startedAt: Date.now(),
      completedAt: status === 'completed' ? Date.now() : undefined,
    };
  }
}

/**
 * Clear statuses for a group
 */
export function clearGroupCodingStatuses(group: CodingGroupType): void {
  try {
    localStorage.removeItem(STORAGE_KEYS[group]);
  } catch (error) {
    console.warn(`Lỗi khi xóa trạng thái bài tập nhóm ${group}:`, error);
  }
}

// Backward compatibility helper
export function getCodingStatuses(): Record<string, ProblemStatus> {
  return getGroupProblemStatuses('basic');
}

export function getProblemStatus(code: string): ProblemStatus {
  const statuses = getGroupProblemStatuses('basic');
  return statuses[code] || 'not_started';
}

export function setProblemStatus(code: string, status: ProblemStatus): void {
  setGroupProblemStatus('basic', code, status);
}

export function clearCodingStatuses(): void {
  clearGroupCodingStatuses('basic');
}
