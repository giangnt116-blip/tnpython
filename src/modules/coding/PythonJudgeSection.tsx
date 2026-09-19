/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ProblemStatus } from '../../types';
import { CodingStudentInfo } from '../../utils/codingStorage';
import {
  Play,
  Trash2,
  Clipboard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  AlertOctagon,
  FileCode,
  Loader2,
  Sparkles,
  Info,
  Check,
  User,
} from 'lucide-react';

interface PythonJudgeSectionProps {
  problemId: string;
  problemTitle: string;
  track: 'basic' | 'september';
  status: ProblemStatus;
  studentInfo?: CodingStudentInfo | null;
  onUpdateStatus: (code: string, newStatus: ProblemStatus) => void | Promise<void>;
  onRequestStudentInfo?: () => void;
}

interface JudgeResultData {
  success: boolean;
  problem_id: string;
  score: number;
  passed_tests: number;
  total_tests: number;
  verdict: string;
  execution_time_ms?: number;
}

export const PythonJudgeSection: React.FC<PythonJudgeSectionProps> = ({
  problemId,
  problemTitle,
  track,
  status,
  studentInfo,
  onUpdateStatus,
  onRequestStudentInfo,
}) => {
  const isSupported = track === 'september' && ['B01', 'B02', 'B03', 'B04', 'B05'].includes(problemId);
  const draftStorageKey = `python_submission_draft_${track}_${problemId}`;

  const [code, setCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(draftStorageKey) || '';
    }
    return '';
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResultData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync draft code changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(draftStorageKey, code);
    } catch (e) {
      console.warn('Không thể lưu code nháp vào localStorage:', e);
    }
  }, [code, draftStorageKey]);

  // Handle Tab key in code editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indent = '    '; // 4 spaces for Python
      const newCode = code.substring(0, start) + indent + code.substring(end);

      setCode(newCode);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
            start + indent.length;
        }
      });
    }
  };

  // Handle Paste from Clipboard
  const handlePasteCode = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setCode(text);
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 2000);
        }
      } else {
        alert('Trình duyệt không hỗ trợ dán tự động. Vui lòng bấm Ctrl+V vào khung soạn thảo.');
      }
    } catch {
      alert('Không có quyền truy cập clipboard. Vui lòng dán trực tiếp bằng phím tắt Ctrl+V.');
    }
  };

  // Handle Clear Code
  const handleClearCode = () => {
    setCode('');
    setJudgeResult(null);
    setErrorMessage(null);
    setShowClearConfirm(false);
  };

  // Handle Submit Code to Judge0 API
  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Check student info
    if (!studentInfo || !studentInfo.fullName?.trim()) {
      if (onRequestStudentInfo) {
        onRequestStudentInfo();
      } else {
        setErrorMessage('Vui lòng cung cấp họ và tên học sinh trước khi nộp bài.');
      }
      return;
    }

    // Check empty code
    if (!code.trim()) {
      setErrorMessage('Vui lòng viết mã nguồn Python trước khi bấm CHẤM BÀI.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: studentInfo.fullName.trim(),
          class_name: studentInfo.className?.trim() || null,
          problem_id: problemId,
          source_code: code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const err = data?.error || 'Không thể chấm bài lúc này. Vui lòng thử lại.';
        setErrorMessage(err);
        return;
      }

      setJudgeResult(data);

      // Handle status update
      if (data.verdict === 'Accepted') {
        await onUpdateStatus(problemId, 'completed');
      } else {
        if (status === 'not_started') {
          await onUpdateStatus(problemId, 'in_progress');
        }
      }
    } catch (err: unknown) {
      console.error('Lỗi khi gọi /api/judge:', err);
      setErrorMessage('Không thể chấm bài lúc này. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Coming Soon for B03-B33 (or non-supported problems)
  if (!isSupported) {
    return (
      <section className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-600 flex items-center justify-center shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Nộp bài Python
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Chấm tự động: Sắp mở
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hệ thống chấm tự động hiện đang được kích hoạt cho các bài <strong>B01</strong> đến <strong>B05</strong>. Các bài tiếp theo (B06 - B33) sẽ được cập nhật bộ kiểm thử tự động trong thời gian tới.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Verdict style and icon helper
  const getVerdictPresentation = (verdict: string) => {
    switch (verdict) {
      case 'Accepted':
        return {
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          containerClass: 'bg-emerald-50/70 border-emerald-300',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          title: 'Accepted',
          description: 'Tuyệt vời! Thuật toán của em đã vượt qua toàn bộ các bộ kiểm thử.',
        };
      case 'Wrong Answer':
        return {
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
          containerClass: 'bg-rose-50/70 border-rose-300',
          icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
          title: 'Wrong Answer',
          description: 'Kết quả tính toán chưa chính xác ở một số bộ test. Em hãy kiểm tra lại điều kiện hoặc giải thuật nhé!',
        };
      case 'Time Limit Exceeded':
        return {
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
          containerClass: 'bg-amber-50/70 border-amber-300',
          icon: <Clock className="w-6 h-6 text-amber-600" />,
          title: 'Time Limit Exceeded',
          description: 'Chương trình vượt quá thời gian cho phép (2.0s). Hãy tối ưu vòng lặp (ví dụ duyệt tới căn bậc 2 của n).',
        };
      case 'Compilation Error':
        return {
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
          containerClass: 'bg-purple-50/70 border-purple-300',
          icon: <FileCode className="w-6 h-6 text-purple-600" />,
          title: 'Compilation Error',
          description: 'Mã nguồn có lỗi cú pháp Python. Em hãy kiểm tra các dấu ngoặc, thụt đầu dòng (indentation).',
        };
      case 'Runtime Error':
      default:
        return {
          badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
          containerClass: 'bg-orange-50/70 border-orange-300',
          icon: <AlertOctagon className="w-6 h-6 text-orange-600" />,
          title: verdict || 'Runtime Error',
          description: 'Chương trình phát sinh lỗi trong quá trình thực thi (chia cho 0, ép kiểu sai hoặc lỗi ngoại lệ).',
        };
    }
  };

  const verdictInfo = judgeResult ? getVerdictPresentation(judgeResult.verdict) : null;

  return (
    <section id="section-python-judge" className="space-y-5 pt-2">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden text-slate-200">
        {/* Header bar of Code Editor */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                NỘP BÀI PYTHON
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Python 3.x
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {problemId}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Chấm bài tự động với Judge0 Engine trực tiếp
              </p>
            </div>
          </div>

          {/* Action buttons on top of editor */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-paste-code"
              onClick={handlePasteCode}
              title="Dán code từ clipboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Đã dán</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                  <span>DÁN CODE</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-clear-code"
              onClick={() => {
                if (code.trim().length > 0) {
                  setShowClearConfirm(true);
                }
              }}
              disabled={!code.trim() || isSubmitting}
              title="Xóa toàn bộ mã nguồn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>XÓA CODE</span>
            </button>
          </div>
        </div>

        {/* Student Info Bar if available */}
        <div className="px-5 py-2 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Học sinh nộp bài:</span>
            {studentInfo?.fullName ? (
              <span className="font-semibold text-white">
                {studentInfo.fullName}
                {studentInfo.className ? ` (${studentInfo.className})` : ''}
              </span>
            ) : (
              <button
                type="button"
                onClick={onRequestStudentInfo}
                className="text-amber-400 hover:underline cursor-pointer font-medium"
              >
                Nhập tên học sinh để nộp bài
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Nhấn Tab để thụt lề 4 khoảng trắng
          </span>
        </div>

        {/* Monospace Code Editor Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="python-code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            placeholder="# Viết code Python của em tại đây"
            spellCheck={false}
            className="w-full min-h-[320px] p-5 font-mono text-sm leading-relaxed bg-slate-950 text-emerald-300 border-0 focus:ring-0 focus:outline-hidden resize-y whitespace-pre overflow-x-auto selection:bg-blue-600 selection:text-white"
          />
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Thời gian giới hạn: 2.0s • Bộ nhớ: 128MB • 10 hidden tests</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-submit-judge"
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] shadow-md shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang chấm bài...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>CHẤM BÀI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Network or Error Alert */}
      {errorMessage && (
        <div
          id="judge-error-alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-sm animate-in fade-in"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-900">Thông báo từ hệ thống</h4>
            <p className="mt-0.5 text-rose-800 leading-relaxed">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* RESULT CARD */}
      {judgeResult && verdictInfo && (
        <div
          id="judge-result-card"
          className={`rounded-2xl border p-6 transition-all shadow-sm animate-in fade-in slide-in-from-bottom-3 ${verdictInfo.containerClass}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              {verdictInfo.icon}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  KẾT QUẢ CHẤM
                </span>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <span
                    id="judge-result-verdict"
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-extrabold border ${verdictInfo.badgeClass}`}
                  >
                    {verdictInfo.title}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Bài: {judgeResult.problem_id}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Badge */}
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                  Điểm số
                </span>
                <span
                  id="judge-result-score"
                  className={`text-2xl font-black ${
                    judgeResult.score === 100
                      ? 'text-emerald-600'
                      : judgeResult.score > 0
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {judgeResult.score}
                  <span className="text-sm font-semibold text-slate-400">/100</span>
                </span>
              </div>
            </div>
          </div>

          {/* Test Passed and Execution Time Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-xs text-slate-500 font-medium block">
                Test đúng
              </span>
              <span id="judge-result-passed-tests" className="text-base font-bold text-slate-800 mt-1 block">
                {judgeResult.passed_tests} / {judgeResult.total_tests} test cases
              </span>
            </div>

            <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-xs text-slate-500 font-medium block">
                Kết quả
              </span>
              <span className="text-base font-bold text-slate-800 mt-1 block">
                {judgeResult.verdict}
              </span>
            </div>

            <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-xs text-slate-500 font-medium block">
                Thời gian thực thi
              </span>
              <span id="judge-result-time" className="text-base font-bold text-slate-800 mt-1 block font-mono">
                {judgeResult.execution_time_ms !== undefined
                  ? `${judgeResult.execution_time_ms} ms`
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* Descriptive Verdict Note */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-start gap-2 text-xs text-slate-700">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{verdictInfo.description}</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing Code */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Xóa toàn bộ mã nguồn?
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 text-center leading-relaxed">
              Thao tác này sẽ xóa sạch code Python hiện tại trong khung soạn thảo.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleClearCode}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
