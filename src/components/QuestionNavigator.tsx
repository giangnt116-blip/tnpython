import React from 'react';
import { X } from 'lucide-react';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, string>;
  flaggedQuestionIds: number[];
  onSelectQuestion: (index: number) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  flaggedQuestionIds,
  onSelectQuestion,
  isOpenMobile,
  onCloseMobile,
}) => {
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestionIds.length;
  const flaggedSet = new Set(flaggedQuestionIds);

  const content = (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-2.5">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Danh sách 100 câu</h3>
          <p className="text-xs text-slate-500">
            Đã làm: <strong className="text-sky-600">{answeredCount}</strong> / {totalQuestions} • Xem lại:{' '}
            <strong className="text-amber-600">{flaggedCount}</strong>
          </p>
        </div>

        {/* Close button on mobile */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Đóng bảng câu hỏi"
          aria-label="Đóng bảng câu hỏi"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Legend as strictly requested:
          □ Chưa làm
          ■ Đã làm
          ● Đang xem
          🚩 Xem lại
      */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs mb-3 pb-2.5 border-b border-slate-100 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-xs bg-slate-100 border border-slate-300 shrink-0"></span>
          <span className="text-slate-700">□ Chưa làm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-xs bg-sky-600 shrink-0"></span>
          <span className="text-slate-700">■ Đã làm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-2 ring-sky-400 shrink-0"></span>
          <span className="text-slate-800 font-bold">● Đang xem</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs leading-none">🚩</span>
          <span className="text-amber-800 font-bold">Xem lại</span>
        </div>
      </div>

      {/* Grid of 100 questions */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const questionNumber = index + 1;
            const isAnswered = !!answers[questionNumber];
            const isFlagged = flaggedSet.has(questionNumber);
            const isCurrent = currentIndex === index;

            // Base status: priority 4: Chưa làm
            let statusStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';

            // Priority 3: Đã làm
            if (isAnswered) {
              statusStyle = 'bg-sky-600 text-white font-semibold hover:bg-sky-500 border-sky-600';
            }

            // Priority 2: Đánh dấu xem lại
            if (isFlagged) {
              if (isAnswered) {
                statusStyle = 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 border-amber-600';
              } else {
                statusStyle = 'bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 border-2 border-amber-400';
              }
            }

            // Priority 1: Câu hiện tại (Đang xem)
            let currentIndicator = '';
            if (isCurrent) {
              currentIndicator = 'ring-2 ring-slate-900 ring-offset-2 z-10 font-black shadow-md scale-105';
            }

            return (
              <button
                key={questionNumber}
                id={`nav-btn-q-${questionNumber}`}
                type="button"
                onClick={() => {
                  onSelectQuestion(index);
                  onCloseMobile();
                }}
                className={`relative h-9 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 ${statusStyle} ${currentIndicator}`}
                title={`Câu ${questionNumber} ${isCurrent ? '[ĐANG XEM] ' : ''}${isFlagged ? '[ĐÁNH DẤU XEM LẠI] ' : ''}${
                  isAnswered ? `(Đã làm: ${answers[questionNumber]})` : '(Chưa làm)'
                }`}
              >
                <span>{questionNumber}</span>
                {isFlagged && (
                  <span className="absolute -top-1.5 -right-1 text-[11px] leading-none pointer-events-none drop-shadow-xs">
                    🚩
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-slate-900 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-72 shrink-0 sticky top-24 self-start">
        {content}
      </div>

      {/* Mobile drawer modal */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-white shadow-2xl p-4 flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
