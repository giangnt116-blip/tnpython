import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { Award, Clock, FileQuestion, User, Users, ArrowRight } from 'lucide-react';

interface StartScreenProps {
  onStart: (student: StudentInfo) => void;
  onBack?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onBack }) => {
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!fullName.trim()) {
      return;
    }
    onStart({
      fullName: fullName.trim(),
      className: className.trim(),
    });
  };

  const isNameEmpty = touched && !fullName.trim();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative">
      {onBack && (
        <button
          id="btn-back-home"
          onClick={onBack}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
        >
          <span>← Màn hình chính</span>
        </button>
      )}
      <div className="w-full max-w-lg bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xs">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-2">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            PYTHON 100 CHALLENGE
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium">
            Kiểm tra kiến thức Python cơ bản
          </p>

          <div className="pt-3 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm font-semibold text-sky-300">
            <span className="inline-flex items-center gap-1.5 bg-slate-700/60 px-3 py-1.5 rounded-full border border-slate-600/50">
              <FileQuestion className="w-4 h-4 text-sky-400" />
              100 câu hỏi
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5 bg-slate-700/60 px-3 py-1.5 rounded-full border border-slate-600/50">
              <Clock className="w-4 h-4 text-sky-400" />
              100 phút
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5 bg-slate-700/60 px-3 py-1.5 rounded-full border border-slate-600/50">
              <Award className="w-4 h-4 text-sky-400" />
              100 điểm
            </span>
          </div>
        </div>

        {/* Instructions notice */}
        <div className="bg-slate-700/30 border border-slate-700 rounded-xl p-4 mb-6 text-xs text-slate-300 space-y-1.5">
          <p className="font-semibold text-slate-200">Lưu ý trước khi làm bài:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Mỗi câu trả lời đúng được cộng 1 điểm.</li>
            <li>Hệ thống tự động nộp bài khi hết 100 phút.</li>
            <li>Bạn có thể tự do chuyển câu và sửa đáp án trong thời gian làm bài.</li>
          </ul>
        </div>

        {/* Student Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="input-fullname" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Họ và tên học sinh <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-fullname"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (touched) setTouched(false);
                }}
                placeholder="Ví dụ: Nguyễn Văn A"
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/90 border rounded-xl focus:outline-hidden focus:ring-2 transition-all ${
                  isNameEmpty
                    ? 'border-rose-500 focus:ring-rose-500/40 text-white'
                    : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/30 text-white'
                }`}
              />
            </div>
            {isNameEmpty && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                Vui lòng nhập họ và tên học sinh để bắt đầu làm bài.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="input-classname" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Lớp <span className="text-slate-500 font-normal">(không bắt buộc)</span>
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-classname"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Ví dụ: 10A1, Python K25..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/90 border border-slate-700 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 text-white focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <button
            id="btn-start-exam"
            type="submit"
            className="w-full mt-6 py-3 px-5 text-sm font-bold uppercase tracking-wider text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>BẮT ĐẦU LÀM BÀI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
