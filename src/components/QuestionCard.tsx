import React from 'react';
import { Question } from '../types';
import { ArrowLeft, ArrowRight, Code2 } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedOption?: string;
  isFlagged?: boolean;
  onToggleFlag: () => void;
  onSelectOption: (optionKey: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  isFlagged = false,
  onToggleFlag,
  onSelectOption,
  onPrev,
  onNext,
}) => {
  const optionsKeys: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-7 shadow-xs">
      {/* Category, index badge & flag button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
            Câu {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            Chủ đề: {question.category}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Flag button */}
          <button
            id={`btn-flag-question-${question.id}`}
            type="button"
            onClick={onToggleFlag}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
              isFlagged
                ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-300/40 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
            }`}
            title="Đánh dấu câu này để xem lại trước khi nộp bài"
            aria-pressed={isFlagged}
          >
            <span className="text-sm leading-none">🚩</span>
            <span>{isFlagged ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại'}</span>
          </button>

          {selectedOption ? (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-md min-h-[36px] flex items-center">
              Đã chọn: {selectedOption}
            </span>
          ) : (
            <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md min-h-[36px] flex items-center">
              Chưa trả lời
            </span>
          )}
        </div>
      </div>

      {/* Question Text */}
      <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug tracking-tight">
        {question.question}
      </h2>

      {/* Code Block if any: strictly preserves indentation, monospace font, horizontal scroll */}
      {question.code && (
        <div className="mt-4 bg-slate-900 text-slate-100 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2 text-slate-400 mb-2 pb-1.5 border-b border-slate-800 text-xs select-none">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-300">Python</span>
          </div>
          <pre className="whitespace-pre leading-relaxed font-mono font-normal tab-size-4">
            {question.code}
          </pre>
        </div>
      )}

      {/* 4 Options: entire surface is clickable, minimum touch target >= 44px */}
      <div className="mt-5 space-y-2.5 sm:space-y-3">
        {optionsKeys.map((key) => {
          const isSelected = selectedOption === key;

          return (
            <button
              key={key}
              id={`option-btn-${question.id}-${key}`}
              type="button"
              onClick={() => onSelectOption(key)}
              className={`w-full text-left p-3.5 sm:p-4 min-h-[48px] rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden ${
                isSelected
                  ? 'bg-sky-50/90 border-sky-500 shadow-xs ring-2 ring-sky-500/25'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
              }`}
              aria-checked={isSelected}
              role="radio"
            >
              {/* Option Radio/Letter indicator */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 border border-slate-300 text-slate-700'
                }`}
              >
                {key}
              </div>

              {/* Option Text */}
              <div className="flex-1 pt-0.5 text-xs sm:text-base leading-relaxed text-slate-800 break-words">
                {question.options[key]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Prev / Next Buttons */}
      <div className="mt-7 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          id="btn-prev-question"
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-hidden ${
            currentIndex === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 active:bg-slate-100 cursor-pointer shadow-xs'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Câu trước</span>
        </button>

        <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
          Câu {currentIndex + 1} / {totalQuestions}
        </span>

        <button
          id="btn-next-question"
          type="button"
          onClick={onNext}
          disabled={currentIndex === totalQuestions - 1}
          className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden ${
            currentIndex === totalQuestions - 1
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
              : 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white cursor-pointer shadow-xs'
          }`}
        >
          <span>Câu tiếp →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
