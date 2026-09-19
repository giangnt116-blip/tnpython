/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CodingProblem, ProblemStatus } from '../../types';
import { CodingStudentInfo } from '../../utils/codingStorage';
import { PythonJudgeSection } from './PythonJudgeSection';
import {
  ArrowLeft,
  Copy,
  Check,
  FileCode,
  Terminal,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  Circle,
  FolderArchive,
  Play,
  RotateCcw,
} from 'lucide-react';

interface ProblemDetailProps {
  problem: CodingProblem;
  status: ProblemStatus;
  groupBadge?: string;
  track?: 'basic' | 'september';
  isSyncing?: boolean;
  syncNotification?: string | null;
  studentName?: string;
  studentInfo?: CodingStudentInfo | null;
  onBack: () => void;
  onUpdateStatus: (code: string, newStatus: ProblemStatus) => void | Promise<void>;
  onRequestStudentInfo?: () => void;
}

export const ProblemDetail: React.FC<ProblemDetailProps> = ({
  problem,
  status,
  groupBadge,
  track = 'september',
  isSyncing = false,
  syncNotification = null,
  studentName,
  studentInfo,
  onBack,
  onUpdateStatus,
  onRequestStudentInfo,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState<boolean>(false);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const code = problem.code || problem.id;
  const statement = problem.statement || problem.description || '';
  const input = problem.input || problem.inputFormat || '';
  const output = problem.output || problem.outputFormat || '';
  const pythonFilename = problem.pythonFile || problem.pythonFilename || `${code}.py`;
  const cppFilename = problem.cppFile || problem.cppFilename || `${code}.cpp`;
  const topic = problem.topic || 'Luyện tư duy';
  const difficulty = problem.difficulty || 'Trung bình';
  const constraints = problem.constraints || '';
  const sampleInput = problem.sampleInput || '';
  const sampleOutput = problem.sampleOutput || '';
  const explanation = problem.explanation || '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      {/* Top sticky sub-header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-to-list"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>QUAY VỀ DANH SÁCH</span>
            </button>

            {groupBadge && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                <FolderArchive className="w-3.5 h-3.5 text-slate-500" />
                {groupBadge}
              </span>
            )}
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Trạng thái:
            </span>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                id="btn-status-not-started"
                onClick={() => onUpdateStatus(code, 'not_started')}
                disabled={isSyncing}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  status === 'not_started'
                    ? 'bg-white text-slate-800 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Circle className="w-3 h-3 text-slate-400" />
                Chưa làm
              </button>
              <button
                id="btn-status-in-progress"
                onClick={() => onUpdateStatus(code, 'in_progress')}
                disabled={isSyncing}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  status === 'in_progress'
                    ? 'bg-amber-500 text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Clock className="w-3 h-3" />
                Đang làm
              </button>
              <button
                id="btn-status-completed"
                onClick={() => setShowCompleteConfirm(true)}
                disabled={isSyncing}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  status === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Đã xong
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header section */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-mono text-sm font-bold border border-blue-400/30">
                {code}
              </span>
              {groupBadge && (
                <span className="px-3 py-1 rounded-lg bg-white/15 text-white text-xs font-semibold border border-white/20">
                  {groupBadge}
                </span>
              )}
              <span className="px-3 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-medium">
                {topic}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                {difficulty}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {problem.title}
            </h1>

            {/* Target file names */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">Python file:</span>
                <span className="text-amber-300 font-bold">{pythonFilename}</span>
                <button
                  onClick={() => handleCopy(pythonFilename, 'py-file')}
                  title="Sao chép tên file"
                  className="ml-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedField === 'py-file' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">C++ file:</span>
                <span className="text-cyan-300 font-bold">{cppFilename}</span>
                <button
                  onClick={() => handleCopy(cppFilename, 'cpp-file')}
                  title="Sao chép tên file"
                  className="ml-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedField === 'cpp-file' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Dedicated Status Action Banner */}
          <div className="px-6 py-4 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tiến độ:
              </span>
              {status === 'not_started' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                  <Circle className="w-3.5 h-3.5 text-slate-400" />
                  Chưa làm
                </span>
              )}
              {status === 'in_progress' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  Đang làm
                </span>
              )}
              {status === 'completed' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Đã hoàn thành
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {status === 'not_started' && (
                <button
                  id="btn-action-start"
                  onClick={() => onUpdateStatus(code, 'in_progress')}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>BẮT ĐẦU LÀM BÀI</span>
                </button>
              )}

              {status === 'in_progress' && (
                <button
                  id="btn-action-complete"
                  onClick={() => setShowCompleteConfirm(true)}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ĐÁNH DẤU HOÀN THÀNH</span>
                </button>
              )}

              {status === 'completed' && (
                <div className="flex items-center gap-2.5">
                  <div
                    id="badge-action-completed"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ĐÃ HOÀN THÀNH</span>
                  </div>
                  <button
                    id="btn-action-rework"
                    onClick={() => onUpdateStatus(code, 'in_progress')}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
                    title="Chuyển lại về trạng thái Đang làm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ĐÁNH DẤU LÀ ĐANG LÀM LẠI</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body specifications */}
          <div className="p-6 sm:p-8 space-y-7">
            {/* 1. Đề bài */}
            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                Đề bài
              </h2>
              <div className="text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-sm sm:text-base whitespace-pre-line">
                {statement}
              </div>
            </section>

            {/* 2. Dữ liệu vào & Kết quả ra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Dữ liệu vào (Input)
                </h2>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {input}
                </div>
              </section>

              <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Kết quả ra (Output)
                </h2>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {output}
                </div>
              </section>
            </div>

            {/* 3. Giới hạn */}
            {constraints && (
              <section className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
                <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Giới hạn
                </h2>
                <div className="text-sm text-amber-950 font-mono">
                  {constraints}
                </div>
              </section>
            )}

            {/* 4. Ví dụ (Sample Input & Output) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sample Input */}
              <section className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Sample Input
                  </h2>
                  <button
                    onClick={() => handleCopy(sampleInput, 'sample-input')}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    {copiedField === 'sample-input' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto border border-slate-800 flex-1 min-h-[80px]">
                  {sampleInput}
                </div>
              </section>

              {/* Sample Output */}
              <section className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Sample Output
                  </h2>
                  <button
                    onClick={() => handleCopy(sampleOutput, 'sample-output')}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    {copiedField === 'sample-output' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 text-cyan-400 p-4 rounded-xl font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto border border-slate-800 flex-1 min-h-[80px]">
                  {sampleOutput}
                </div>
              </section>
            </div>

            {/* 5. Giải thích ví dụ */}
            {explanation && (
              <section>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  Giải thích ví dụ
                </h2>
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                  {explanation}
                </div>
              </section>
            )}

            {/* 6. Quy cách nộp bài (nếu có) */}
            {problem.submission && (
              <section className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Quy cách nộp bài:</span>
                <p>{problem.submission}</p>
              </section>
            )}

            {/* 7. Nguồn tài liệu (nếu có) */}
            {problem.source && (
              <div className="text-[11px] text-slate-400 font-mono italic">
                Nguồn: {problem.source}
              </div>
            )}

            {/* 8. Khu vực nộp bài Python & Chấm tự động */}
            <div className="pt-4 border-t border-slate-200">
              <PythonJudgeSection
                problemId={code}
                problemTitle={problem.title}
                track={track}
                status={status}
                studentInfo={studentInfo}
                onUpdateStatus={onUpdateStatus}
                onRequestStudentInfo={onRequestStudentInfo}
              />
            </div>
          </div>

          {/* Footer Back Button */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              id="btn-footer-back"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← QUAY VỀ DANH SÁCH</span>
            </button>

            <span className="text-xs text-slate-500 font-mono">
              Bài {code} • {groupBadge || '33 bài luyện tập'}
            </span>
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Marking Completed */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">
              Xác nhận hoàn thành bài tập?
            </h3>
            <p className="mt-2 text-sm text-slate-600 text-center leading-relaxed">
              Bạn có chắc chắn muốn đánh dấu bài <strong>{code} - {problem.title}</strong> là <strong>Đã hoàn thành</strong>?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                id="btn-cancel-complete"
                onClick={() => setShowCompleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-confirm-complete"
                onClick={() => {
                  setShowCompleteConfirm(false);
                  onUpdateStatus(code, 'completed');
                }}
                disabled={isSyncing}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSyncing ? 'Đang lưu...' : 'Xác nhận hoàn thành'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-intrusive Toast for Sync Notification */}
      {syncNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{syncNotification}</span>
        </div>
      )}
    </div>
  );
};
