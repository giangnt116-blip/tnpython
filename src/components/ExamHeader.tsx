import React from 'react';
import { StudentInfo } from '../types';
import { Clock, User, Send, LayoutGrid, AlertTriangle } from 'lucide-react';

interface ExamHeaderProps {
  student: StudentInfo;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  timeLeftSeconds: number;
  onOpenNavigator: () => void;
  onRequestSubmit: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  student,
  currentIndex,
  totalQuestions,
  answeredCount,
  timeLeftSeconds,
  onOpenNavigator,
  onRequestSubmit,
}) => {
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const isLowTime = timeLeftSeconds <= 10 * 60; // Dưới 10 phút
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-3 py-2.5 sm:px-6 sm:py-3">
        {/* Top bar: Student info + Timer + Controls */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Student Info & Current question */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 truncate">
              <p className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                {student.fullName}
                {student.className && (
                  <span className="ml-1 text-[11px] sm:text-xs font-normal text-slate-400">
                    ({student.className})
                  </span>
                )}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Câu <span className="text-sky-400 font-semibold">{currentIndex + 1}</span> / {totalQuestions}
              </p>
            </div>
          </div>

          {/* Right side: Timer + Nav Button + Submit */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-colors ${
                isLowTime
                  ? 'bg-rose-500/20 border border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-800/90 border border-slate-700 text-sky-300'
              }`}
              title="Thời gian còn lại"
            >
              {isLowTime ? (
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
              )}
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            {/* Mobile Navigator toggle */}
            <button
              id="btn-mobile-navigator-toggle"
              type="button"
              onClick={onOpenNavigator}
              className="md:hidden p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
              title="Mở danh sách 100 câu hỏi"
              aria-label="Mở danh sách 100 câu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            {/* Submit button */}
            <button
              id="btn-header-submit-exam"
              type="button"
              onClick={onRequestSubmit}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-hidden"
              title="Xác nhận nộp bài thi"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span className="tracking-wide">NỘP BÀI</span>
            </button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1">
            <span className="text-slate-400">
              Đã hoàn thành <strong className="text-sky-400 font-bold">{answeredCount}</strong> / {totalQuestions}
            </span>
            <span className="font-mono font-bold text-sky-300">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 sm:h-2 overflow-hidden border border-slate-700/60">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${completionPercentage}%` }}
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
