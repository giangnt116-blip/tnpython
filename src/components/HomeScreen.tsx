/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Footer } from './Footer';
import {
  FileQuestion,
  Code2,
  Clock,
  Award,
  CheckCircle2,
  Terminal,
  ArrowRight,
  Sparkles,
  Shield,
} from 'lucide-react';

interface HomeScreenProps {
  onSelectQuiz: () => void;
  onSelectCoding: () => void;
  onSelectTeacher: () => void;
  hasUncompletedExam?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectQuiz,
  onSelectCoding,
  onSelectTeacher,
  hasUncompletedExam = false,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
              PY
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                HỆ THỐNG HỌC TẬP PYTHON
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Kiểm Tra Trắc Nghiệm & Luyện Tập Lập Trình Tư Duy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-header-teacher-portal"
              onClick={onSelectTeacher}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Dành cho Giáo viên</span>
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Phiên bản 2026
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col justify-center">
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2 block">
            CHÀO MỪNG BẠN ĐẾN VỚI HỆ THỐNG
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Chọn Hình Thức Học Tập & Rèn Luyện
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
            Nâng cao kiến thức lập trình vững chắc qua bộ 100 câu trắc nghiệm chuẩn hóa hoặc rèn luyện tư duy thuật toán qua 33 bài lập trình kinh điển.
          </p>
        </div>

        {/* 2 Big Choice Cards: A and B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {/* Choice A: PYTHON 100 CHALLENGE */}
          <div
            id="card-choice-quiz"
            className="group relative bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-slate-700/80 hover:border-blue-500/60 p-7 sm:p-8 shadow-xl transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-blue-500/10"
          >
            {/* Top Accent Ribbon */}
            <div className="absolute -top-3 left-6">
              <span className="px-3 py-1 rounded-md bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                LỰA CHỌN A
              </span>
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <FileQuestion className="w-7 h-7 text-blue-400" />
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                PYTHON 100 CHALLENGE
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Đánh giá toàn diện kiến thức nền tảng ngôn ngữ Python từ cú pháp, toán tử, vòng lặp, xử lý chuỗi đến hàm.
              </p>

              {/* 3 required bullet points */}
              <div className="mt-6 space-y-3 pt-6 border-t border-slate-700/60">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-blue-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-white">100 câu</span>
                  <span className="text-slate-400 text-xs">trắc nghiệm phân hóa</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-blue-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-white">100 phút</span>
                  <span className="text-slate-400 text-xs">thời gian làm bài liên tục</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-blue-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-white">100 điểm</span>
                  <span className="text-slate-400 text-xs">thang điểm tối đa</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              {hasUncompletedExam && (
                <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 text-center font-medium">
                  Đang có bài thi chưa hoàn thành được lưu
                </div>
              )}
              <button
                id="btn-start-quiz"
                onClick={onSelectQuiz}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <span>VÀO KIỂM TRA</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Choice B: LUYỆN TẬP LẬP TRÌNH */}
          <div
            id="card-choice-coding"
            className="group relative bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-slate-700/80 hover:border-emerald-500/60 p-7 sm:p-8 shadow-xl transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            {/* Top Accent Ribbon */}
            <div className="absolute -top-3 left-6">
              <span className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                LỰA CHỌN B
              </span>
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Code2 className="w-7 h-7 text-emerald-400" />
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                LUYỆN TẬP LẬP TRÌNH
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Rèn luyện kỹ năng phân tích bài toán, tư duy giải thuật và lập trình thực chiến từ cơ bản đến nâng cao.
              </p>

              {/* 3 required bullet points */}
              <div className="mt-6 space-y-3 pt-6 border-t border-slate-700/60">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-white">33 bài</span>
                  <span className="text-slate-400 text-xs">luyện tư duy lập trình (B01 - B33)</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-emerald-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-white">Python / C++</span>
                  <span className="text-slate-400 text-xs">quy chuẩn tên file mã nguồn</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-white">stdin / stdout</span>
                  <span className="text-slate-400 text-xs">chuẩn dữ liệu vào ra thi đấu</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                id="btn-start-coding"
                onClick={onSelectCoding}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <span>VÀO LUYỆN TẬP</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer toàn hệ thống */}
      <Footer
        theme="dark"
        className="relative z-10"
        extraLink={
          <button
            id="btn-footer-teacher-portal"
            onClick={onSelectTeacher}
            className="text-[11px] text-slate-400 hover:text-blue-400 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Shield className="w-3 h-3" />
            <span>Cổng Quản Trị Giáo Viên (Teacher Portal)</span>
          </button>
        }
      />
    </div>
  );
};
