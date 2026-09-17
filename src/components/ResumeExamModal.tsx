import React, { useState, useEffect } from 'react';
import { SavedExamState } from '../types';
import { Clock, User, CheckCircle2, RotateCcw, Play, AlertTriangle } from 'lucide-react';

interface ResumeExamModalProps {
  savedExam: SavedExamState;
  totalQuestions: number;
  onResume: () => void;
  onReset: () => void;
}

export const ResumeExamModal: React.FC<ResumeExamModalProps> = ({
  savedExam,
  totalQuestions,
  onResume,
  onReset,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [remainingSec, setRemainingSec] = useState(() =>
    Math.max(0, Math.floor((savedExam.endTime - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const sec = Math.max(0, Math.floor((savedExam.endTime - Date.now()) / 1000));
      setRemainingSec(sec);
    }, 1000);
    return () => clearInterval(timer);
  }, [savedExam.endTime]);

  const formatTime = (totalSec: number) => {
    if (totalSec <= 0) return '00:00:00 (Đã hết giờ)';
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const answeredCount = Object.keys(savedExam.answers || {}).length;
  const isTimeExpired = remainingSec <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {!showConfirmReset ? (
          <>
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                Phát hiện bài thi chưa hoàn thành
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Hệ thống tìm thấy phiên làm bài trước đó chưa được nộp.
              </p>
            </div>

            {/* Candidate details card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 mb-6 space-y-3.5 text-sm">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/60">
                <span className="text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-400" />
                  Họ tên học sinh:
                </span>
                <strong className="text-white font-semibold">
                  {savedExam.student.fullName}
                </strong>
              </div>

              {savedExam.student.className && (
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/60">
                  <span className="text-slate-400">Lớp:</span>
                  <span className="text-slate-200 font-medium">
                    {savedExam.student.className}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/60">
                <span className="text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Đã trả lời:
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  Thời gian còn lại:
                </span>
                <span
                  className={`font-mono font-bold ${
                    isTimeExpired ? 'text-rose-400' : 'text-sky-300'
                  }`}
                >
                  {formatTime(remainingSec)}
                </span>
              </div>
            </div>

            {isTimeExpired && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl mb-6 text-xs text-rose-300">
                Thời gian 100 phút của bài thi này đã hết. Nếu nhấn Tiếp tục, hệ thống sẽ tự động tổng kết và nộp bài thi của bạn.
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-resume-reset-intent"
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>LÀM LẠI TỪ ĐẦU</span>
              </button>

              <button
                id="btn-resume-continue"
                type="button"
                onClick={onResume}
                className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>TIẾP TỤC BÀI THI</span>
              </button>
            </div>
          </>
        ) : (
          /* Confirmation before resetting */
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Xác nhận làm lại từ đầu?</h3>
                <p className="text-xs text-slate-400">
                  Toàn bộ đáp án đã làm của bài thi dở dang này sẽ bị xóa hoàn toàn.
                </p>
              </div>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-slate-200">Bạn sắp xóa bài thi của:</p>
              <p>• Họ tên: <strong className="text-white">{savedExam.student.fullName}</strong></p>
              <p>• Đã làm: <strong className="text-white">{answeredCount} / {totalQuestions}</strong> câu</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="btn-cancel-reset"
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                QUAY LẠI
              </button>
              <button
                id="btn-confirm-reset"
                type="button"
                onClick={onReset}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                XÓA & LÀM LẠI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
