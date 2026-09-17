import React, { useState } from 'react';
import { ExamResult } from '../types';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  User,
  Users,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

interface ResultScreenProps {
  result: ExamResult;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ result, onRestart }) => {
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);

  const formatTimeSpent = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes} phút`);
    parts.push(`${seconds} giây`);

    return parts.join(' ');
  };

  const totalPercentage =
    result.totalQuestions > 0
      ? Math.round((result.correctCount / result.totalQuestions) * 100)
      : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 50) return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  /**
   * Đánh giá ngắn theo chủ đề trung tính:
   * >= 80%: "Nắm khá chắc nội dung này."
   * 50% - 79%: "Cần ôn thêm một số kiến thức."
   * < 50%: "Nên ôn lại chủ đề này."
   */
  const getTopicFeedback = (percent: number) => {
    if (percent >= 80) return 'Nắm khá chắc nội dung này.';
    if (percent >= 50) return 'Cần ôn thêm một số kiến thức.';
    return 'Nên ôn lại chủ đề này.';
  };

  const getProgressBarColor = (percent: number) => {
    if (percent >= 80) return 'bg-emerald-500';
    if (percent >= 50) return 'bg-sky-500';
    return 'bg-amber-500';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-3.5 sm:p-6">
      <div className="w-full max-w-2xl bg-slate-800/90 border border-slate-700/80 rounded-3xl p-5 sm:p-9 shadow-2xl backdrop-blur-xs">
        {/* Title */}
        <div className="text-center space-y-2 mb-7">
          <div className="inline-flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-1">
            <Award className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            KẾT QUẢ BÀI KIỂM TRA
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            PYTHON 100 CHALLENGE • Đã hoàn thành và nộp bài
          </p>
        </div>

        {/* Candidate Info Card */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="truncate">
                <span className="text-xs text-slate-400 block">Họ và tên:</span>
                <strong className="text-white font-semibold text-sm sm:text-base truncate block">
                  {result.student.fullName}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="truncate">
                <span className="text-xs text-slate-400 block">Lớp:</span>
                <strong className="text-white font-semibold text-sm sm:text-base">
                  {result.student.className || '(Không có)'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Score Display Card with Overall Progress Bar */}
        <div className="text-center bg-slate-900/90 border border-slate-700/90 rounded-2xl p-5 sm:p-6 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
            Tổng điểm đạt được
          </p>
          <div className="flex items-baseline justify-center gap-2 my-2">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
              {result.score}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-400">
              / {result.totalQuestions}
            </span>
          </div>

          <div
            className={`inline-block mt-2 px-3.5 py-1 rounded-full text-xs font-semibold border ${getScoreColor(
              result.score
            )}`}
          >
            Tỷ lệ: {totalPercentage}%
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span>Tiến độ hoàn thành đúng</span>
              <span className="font-bold text-sky-400">{totalPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(
                  totalPercentage
                )}`}
                style={{ width: `${totalPercentage}%` }}
                role="progressbar"
                aria-valuenow={totalPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-7">
          <div className="bg-slate-700/30 border border-slate-700/80 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Số câu đúng</p>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{result.correctCount}</p>
          </div>

          <div className="bg-slate-700/30 border border-slate-700/80 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center text-rose-400 mb-1">
              <XCircle className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Số câu sai</p>
            <p className="text-xl font-bold text-rose-400 font-mono mt-0.5">{result.incorrectCount}</p>
          </div>

          <div className="bg-slate-700/30 border border-slate-700/80 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center text-amber-400 mb-1">
              <HelpCircle className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Số câu bỏ trống</p>
            <p className="text-xl font-bold text-amber-400 font-mono mt-0.5">{result.unansweredCount}</p>
          </div>

          <div className="bg-slate-700/30 border border-slate-700/80 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center text-sky-400 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Thời gian đã dùng</p>
            <p className="text-xs font-bold text-sky-300 font-mono mt-1 line-clamp-2">
              {formatTimeSpent(result.timeSpentSeconds)}
            </p>
          </div>
        </div>

        {/* SECTION 4 & 5: PHÂN TÍCH THEO CHỦ ĐỀ */}
        {result.categoryScores && result.categoryScores.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-700/90 rounded-2xl p-4 sm:p-5 mb-7">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/70">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                PHÂN TÍCH THEO CHỦ ĐỀ
              </h2>
            </div>

            <div className="space-y-4">
              {result.categoryScores.map((cat, index) => {
                const percentage = Math.round((cat.correct / cat.total) * 100);
                const barColor = getProgressBarColor(percentage);
                const feedback = getTopicFeedback(percentage);

                return (
                  <div key={cat.category} className="space-y-1.5 pb-3 border-b border-slate-800/80 last:border-b-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className="text-slate-200 font-medium">
                        <span className="text-slate-500 font-mono mr-1.5">{index + 1}.</span>
                        {cat.category}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-white">
                          {cat.correct} / {cat.total}
                        </span>
                        <span className="text-xs text-sky-400 font-mono font-bold w-10 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar per topic */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percentage}%` }}
                        role="progressbar"
                        aria-valuenow={percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>

                    {/* Neutral topic assessment per Requirement 5 */}
                    <p className="text-[11px] text-slate-400 italic">
                      {feedback}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strict Confidentiality notice per user requirements */}
        <div className="text-center text-xs text-slate-400 border-t border-slate-700/60 pt-4 mb-6">
          <p>
            Theo quy chế thi, bài kiểm tra không hiển thị đáp án đúng, câu sai cụ thể hay lời giải.
          </p>
          <p className="mt-1 text-slate-500">
            Dữ liệu bài thi đã được lưu và khóa không thể chỉnh sửa.
          </p>
        </div>

        {/* Restart / New Exam Button with Confirmation */}
        {!showConfirmRestart ? (
          <button
            id="btn-restart-exam"
            type="button"
            onClick={() => setShowConfirmRestart(true)}
            className="w-full py-3.5 px-4 text-sm font-bold uppercase tracking-wider text-white bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
          >
            <RotateCcw className="w-4 h-4" />
            <span>LÀM BÀI MỚI</span>
          </button>
        ) : (
          <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl animate-in fade-in space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold text-slate-200">
                Xác nhận bắt đầu bài thi mới? Toàn bộ kết quả bài thi này sẽ được đặt lại.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                id="btn-cancel-new-exam"
                type="button"
                onClick={() => setShowConfirmRestart(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                HỦY
              </button>
              <button
                id="btn-confirm-new-exam"
                type="button"
                onClick={onRestart}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                XÁC NHẬN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
