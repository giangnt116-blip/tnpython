/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CodingProblem, ProblemStatus } from '../../types';
import { CheckCircle2, Clock, Circle, ArrowRight, Code2 } from 'lucide-react';

interface ProblemCardProps {
  problem: CodingProblem;
  status: ProblemStatus;
  groupBadge?: string;
  onViewProblem: (problem: CodingProblem) => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  status,
  groupBadge,
  onViewProblem,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã hoàn thành
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Đang làm
          </span>
        );
      case 'not_started':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Circle className="w-3.5 h-3.5 text-slate-400" />
            Chưa làm
          </span>
        );
    }
  };

  const getDifficultyBadge = () => {
    switch (problem.difficulty) {
      case 'Dễ':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Dễ
          </span>
        );
      case 'Trung bình':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Trung bình
          </span>
        );
      case 'Vận dụng':
      case 'Khá':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            Vận dụng
          </span>
        );
      case 'Vận dụng cao':
      case 'Nâng cao':
      case 'Khó':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            {problem.difficulty}
          </span>
        );
      default:
        return problem.difficulty ? (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
            {problem.difficulty}
          </span>
        ) : null;
    }
  };

  const code = problem.code || problem.id;
  const description = problem.statement || problem.description || '';
  const pythonFile = problem.pythonFile || problem.pythonFilename || `${code}.py`;
  const cppFile = problem.cppFile || problem.cppFilename || `${code}.cpp`;
  const topic = problem.topic || 'Luyện tư duy';

  return (
    <div
      id={`card-${code}`}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-300"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold tracking-wider">
              {code}
            </span>
            {getDifficultyBadge()}
            {groupBadge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline">
                {groupBadge}
              </span>
            )}
          </div>
          {getStatusBadge()}
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {problem.title}
        </h3>

        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{topic}</span>
        </div>

        <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
            {pythonFile}
          </span>
          <span className="text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">
            {cppFile}
          </span>
        </div>

        <button
          id={`btn-view-${code}`}
          onClick={() => onViewProblem(problem)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <span>XEM BÀI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
