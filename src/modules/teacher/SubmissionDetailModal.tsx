import React, { useState, useEffect } from 'react';
import { DbCodingSubmission } from './types';
import { X, Copy, Check, Terminal, Code2, Clock, CheckCircle2, XCircle, AlertTriangle, PlayCircle } from 'lucide-react';
import { septemberCodingProblems } from '../../data/septemberCodingProblems';

interface SubmissionDetailModalProps {
  submission: DbCodingSubmission | null;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!submission) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(submission.source_code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is blocked
      const textArea = document.createElement('textarea');
      textArea.value = submission.source_code || '';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find problem title
  const prob = septemberCodingProblems.find(
    (p) => p.id.toUpperCase() === (submission.problem_id || '').toUpperCase()
  );
  const problemTitle = prob ? prob.title : submission.problem_id;

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepted
          </span>
        );
      case 'Wrong Answer':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Wrong Answer
          </span>
        );
      case 'Compilation Error':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Compilation Error
          </span>
        );
      case 'Runtime Error':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Runtime Error
          </span>
        );
      case 'Time Limit Exceeded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <Clock className="w-3.5 h-3.5" />
            Time Limit Exceeded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">
            {verdict}
          </span>
        );
    }
  };

  const codeLines = (submission.source_code || '').split('\n');

  return (
    <div
      id="modal-submission-detail"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  THÔNG TIN BÀI NỘP
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  ID: #{submission.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chi tiết kết quả chấm tự động và mã nguồn bài nộp của học sinh
              </p>
            </div>
          </div>

          <button
            id="btn-close-submission-modal"
            onClick={onClose}
            title="Đóng cửa sổ (Esc)"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Học sinh
              </span>
              <span className="text-xs font-bold text-white mt-0.5 block truncate" title={submission.student_name}>
                {submission.student_name}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Lớp
              </span>
              <span className="text-xs font-mono font-semibold text-slate-200 mt-0.5 block">
                {submission.class_name ? `Lớp ${submission.class_name}` : '—'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Bài nộp (Problem)
              </span>
              <span className="text-xs font-bold text-blue-400 mt-0.5 block truncate" title={`${submission.problem_id}: ${problemTitle}`}>
                {submission.problem_id} - {problemTitle}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Track
              </span>
              <span className="text-xs font-medium text-slate-300 mt-0.5 block">
                {submission.track === 'september' ? 'Luyện thi tháng 9' : submission.track}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ngôn ngữ
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400 mt-0.5 block">
                {submission.language}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Điểm số
              </span>
              <span className="text-sm font-mono font-black text-white mt-0.5 block">
                {submission.score}{' '}
                <span className="text-[10px] font-normal text-slate-400">/ 100</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Test đúng / Tổng test
              </span>
              <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 block">
                {submission.passed_tests} / {submission.total_tests}{' '}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({Math.round((submission.passed_tests / (submission.total_tests || 1)) * 100)}%)
                </span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Thời gian chạy
              </span>
              <span className="text-xs font-mono text-slate-300 mt-0.5 block">
                {submission.execution_time_ms !== null && submission.execution_time_ms !== undefined
                  ? `${submission.execution_time_ms} ms`
                  : '—'}
              </span>
            </div>
          </div>

          {/* Verdict & Submitted At Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Kết quả chấm (Verdict):</span>
              {getVerdictBadge(submission.verdict)}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Thời điểm nộp: {formatDate(submission.submitted_at)}</span>
            </div>
          </div>

          {/* Source Code Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  MÃ NGUỒN ĐÃ NỘP
                </h3>
                <span className="text-[10px] text-slate-400">
                  ({codeLines.length} dòng • Chỉ xem)
                </span>
              </div>

              <button
                id="btn-copy-submission-code"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>SAO CHÉP CODE</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Block with line numbers */}
            <div className="relative rounded-xl border border-slate-700/80 bg-slate-950/90 overflow-hidden shadow-inner">
              <div className="max-h-[340px] overflow-auto p-3.5 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin">
                <table className="w-full border-collapse">
                  <tbody>
                    {codeLines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="pr-3 text-right text-slate-600 select-none w-8 text-[11px] align-top">
                          {idx + 1}
                        </td>
                        <td className="whitespace-pre font-mono text-slate-200 select-text">
                          {line || ' '}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90 shrink-0">
          <span className="text-[11px] text-slate-500">
            Mã nguồn được lưu trữ tại thời điểm nộp bài của học sinh.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};
