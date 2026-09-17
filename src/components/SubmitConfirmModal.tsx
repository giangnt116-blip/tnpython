import React from 'react';
import { AlertCircle, Clock, CheckCircle2, HelpCircle, CheckCheck } from 'lucide-react';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  flaggedCount: number;
  timeLeftSeconds: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  totalQuestions,
  answeredCount,
  unansweredCount,
  flaggedCount,
  timeLeftSeconds,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const formatTime = (totalSec: number) => {
    if (totalSec <= 0) return '00:00:00';
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const isAllAnsweredAndUnflagged = unansweredCount === 0 && flaggedCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Xác nhận nộp bài
            </h3>
            <p className="text-xs text-slate-500">
              Bạn có chắc chắn muốn kết thúc bài thi ngay bây giờ?
            </p>
          </div>
        </div>

        {/* Exam status breakdown */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 my-4 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Đã trả lời:
            </span>
            <span className="font-bold text-emerald-700 font-mono">
              {answeredCount} / {totalQuestions}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Chưa trả lời:
            </span>
            <span
              className={`font-bold font-mono ${
                unansweredCount > 0 ? 'text-amber-700' : 'text-slate-700'
              }`}
            >
              {unansweredCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="text-sm leading-none">🚩</span>
              Đánh dấu xem lại:
            </span>
            <span
              className={`font-bold font-mono ${
                flaggedCount > 0 ? 'text-amber-700' : 'text-slate-700'
              }`}
            >
              {flaggedCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
            <span className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-sky-600" />
              Thời gian còn lại:
            </span>
            <span className="font-mono font-bold text-sky-700">
              {formatTime(timeLeftSeconds)}
            </span>
          </div>
        </div>

        {/* Warnings / Notifications per requirements */}
        <div className="space-y-2.5 mb-5">
          {unansweredCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 leading-relaxed font-medium">
              Bạn còn {unansweredCount} câu chưa trả lời. Các câu bỏ trống sẽ nhận 0 điểm.
            </div>
          )}

          {flaggedCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 leading-relaxed font-medium flex items-start gap-2">
              <span className="text-sm shrink-0 leading-none">🚩</span>
              <span>Bạn còn {flaggedCount} câu đã đánh dấu xem lại.</span>
            </div>
          )}

          {isAllAnsweredAndUnflagged && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 leading-relaxed font-medium flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bạn đã hoàn thành tất cả câu hỏi.</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="btn-cancel-submit"
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-hidden"
          >
            QUAY LẠI
          </button>
          <button
            id="btn-confirm-submit"
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-hidden"
          >
            NỘP BÀI
          </button>
        </div>
      </div>
    </div>
  );
};
