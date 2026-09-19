/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CodingProblem, ProblemStatus } from '../../types';
import { ProblemCard } from './ProblemCard';
import { Footer } from '../../components/Footer';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Circle,
  ArrowLeft,
  FolderArchive,
  Sparkles,
} from 'lucide-react';

interface ProblemListViewProps {
  problems: CodingProblem[];
  statuses: Record<string, ProblemStatus>;
  groupType: 'basic' | 'september';
  groupTitle: string;
  groupBadge: string;
  groupSubtitle: string;
  onSelectProblem: (problem: CodingProblem) => void;
  onBackToSelection: () => void;
}

export const ProblemListView: React.FC<ProblemListViewProps> = ({
  problems,
  statuses,
  groupType,
  groupTitle,
  groupBadge,
  groupSubtitle,
  onSelectProblem,
  onBackToSelection,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | ProblemStatus>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Stats calculation
  const totalCount = problems.length;
  let completedCount = 0;
  let inProgressCount = 0;

  problems.forEach((p) => {
    const code = p.code || p.id;
    const st = statuses[code] || 'not_started';
    if (st === 'completed') completedCount++;
    else if (st === 'in_progress') inProgressCount++;
  });

  const notStartedCount = totalCount - completedCount - inProgressCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Extract unique topics for dropdown filter
  const topics = useMemo(() => {
    return Array.from(new Set(problems.map((p) => p.topic).filter(Boolean))) as string[];
  }, [problems]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const code = p.code || p.id;
      const st = statuses[code] || 'not_started';

      if (filterStatus !== 'all' && st !== filterStatus) return false;
      if (selectedTopic !== 'all' && p.topic !== selectedTopic) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchCode = code.toLowerCase().includes(q);
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchTopic = (p.topic || '').toLowerCase().includes(q);
        return matchCode || matchTitle || matchTopic;
      }

      return true;
    });
  }, [problems, statuses, filterStatus, selectedTopic, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* Top sticky navigation header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-to-selection"
              onClick={onBackToSelection}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>CHỌN NHÓM BÀI</span>
            </button>

            <span className="hidden sm:inline-block w-px h-6 bg-slate-200" />

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  groupType === 'september'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-blue-100 text-blue-900 border border-blue-300'
                }`}
              >
                {groupType === 'september' ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <FolderArchive className="w-3.5 h-3.5 text-blue-600" />
                )}
                {groupBadge}
              </span>
            </div>
          </div>

          {/* Quick Progress counter */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Đã hoàn thành:</span>
              <span className="font-bold text-slate-900 text-sm">
                {completedCount} / {totalCount} bài
              </span>
            </div>
            <div className="w-24 sm:w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  groupType === 'september' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 min-w-[36px]">
              {progressPercent}%
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Banner Section */}
        <div
          className={`rounded-2xl p-6 sm:p-8 text-white shadow-xs mb-8 ${
            groupType === 'september'
              ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-500/20'
              : 'bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 border border-slate-700'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 mb-3 border border-white/10">
                {groupBadge} • {totalCount} BÀI TẬP
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {groupTitle}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {groupSubtitle}
              </p>
            </div>

            {/* Progress Card */}
            <div className="bg-black/30 backdrop-blur-xs p-4 rounded-xl border border-white/10 min-w-[240px]">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-medium">
                <span>Tiến độ thực hiện</span>
                <span className="text-white font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all duration-300 ${
                    groupType === 'september' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-xs">
                <div>
                  <div className="font-bold text-white text-base">{notStartedCount}</div>
                  <div className="text-[11px] text-slate-400">Chưa làm</div>
                </div>
                <div>
                  <div className="font-bold text-amber-300 text-base">{inProgressCount}</div>
                  <div className="text-[11px] text-amber-200/80">Đang làm</div>
                </div>
                <div>
                  <div className="font-bold text-emerald-300 text-base">{completedCount}</div>
                  <div className="text-[11px] text-emerald-200/80">Hoàn thành</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-problem"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã bài, tên bài..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
            {/* Status pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                id="filter-all"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({totalCount})
              </button>
              <button
                id="filter-not-started"
                onClick={() => setFilterStatus('not_started')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  filterStatus === 'not_started'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chưa làm ({notStartedCount})
              </button>
              <button
                id="filter-in-progress"
                onClick={() => setFilterStatus('in_progress')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  filterStatus === 'in_progress'
                    ? 'bg-white text-amber-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đang làm ({inProgressCount})
              </button>
              <button
                id="filter-completed"
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  filterStatus === 'completed'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã xong ({completedCount})
              </button>
            </div>

            {/* Topic Filter Dropdown */}
            {topics.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  id="select-topic-filter"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Tất cả chủ đề</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Problem Cards Grid */}
        {filteredProblems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProblems.map((problem) => {
              const code = problem.code || problem.id;
              const status = statuses[code] || 'not_started';
              return (
                <ProblemCard
                  key={code}
                  problem={problem}
                  status={status}
                  groupBadge={groupBadge}
                  onViewProblem={onSelectProblem}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Không tìm thấy bài tập phù hợp
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc trạng thái.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setSelectedTopic('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </main>

      {/* Footer toàn hệ thống */}
      <Footer theme="light" />
    </div>
  );
};
