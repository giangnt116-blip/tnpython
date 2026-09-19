import React, { useState, useMemo } from 'react';
import { DbExamResult, DbCodingProgress, DbCodingSubmission } from './types';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import { Footer } from '../../components/Footer';
import { basicCodingProblems } from '../../data/basicCodingProblems';
import { septemberCodingProblems } from '../../data/septemberCodingProblems';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  FileCheck2,
  Filter,
  Layers,
  Sparkles,
  User,
  X,
  ExternalLink,
  Info,
  Circle,
  Clock3,
  Terminal,
  XCircle,
  AlertTriangle,
  Check,
} from 'lucide-react';

interface TeacherStudentDetailProps {
  studentName: string;
  className: string;
  examResults: DbExamResult[];
  rawCodingProgress: DbCodingProgress[];
  codingSubmissions?: DbCodingSubmission[];
  onBack: () => void;
}

type DetailTab = 'overview' | 'exams' | 'coding' | 'submissions';

export const TeacherStudentDetail: React.FC<TeacherStudentDetailProps> = ({
  studentName,
  className,
  examResults,
  rawCodingProgress,
  codingSubmissions = [],
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  // Selected exam attempt for topic inspector
  const [selectedExamDetail, setSelectedExamDetail] = useState<DbExamResult | null>(null);

  // Selected submission for code inspector modal
  const [selectedSubmission, setSelectedSubmission] = useState<DbCodingSubmission | null>(null);

  // Filter for submissions tab by problem
  const [submissionProblemFilter, setSubmissionProblemFilter] = useState<string>('all');

  // Selected coding problem for inspect modal
  const [selectedProblemDetail, setSelectedProblemDetail] = useState<{
    problemId: string;
    title: string;
    track: 'basic' | 'september';
    trackName: string;
    status: 'completed' | 'in_progress' | 'not_started';
    startedAt?: string | null;
    completedAt?: string | null;
    updatedAt?: string | null;
  } | null>(null);

  // Filter for coding track in the Coding tab
  const [codingTrackFilter, setCodingTrackFilter] = useState<'all' | 'basic' | 'september'>('all');
  const [codingStatusFilter, setCodingStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');

  // 1. Filter exam results for this exact student (student_name + class_name)
  const studentExams = useMemo(() => {
    const sName = studentName.trim().toLowerCase();
    const cName = className.trim().toLowerCase();

    return examResults
      .filter((e) => {
        const itemStudent = (e.student_name || '').trim().toLowerCase();
        const itemClass = (e.class_name || '').trim().toLowerCase();
        return itemStudent === sName && itemClass === cName;
      })
      .sort((a, b) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime());
  }, [examResults, studentName, className]);

  // 2. Filter and deduplicate coding progress for this exact student (student_name + class_name)
  // Keeps the latest record by updated_at for each (track + problem_id)
  const studentCodingMap = useMemo(() => {
    const sName = studentName.trim().toLowerCase();
    const cName = className.trim().toLowerCase();

    const relevant = rawCodingProgress.filter((c) => {
      const itemStudent = (c.student_name || '').trim().toLowerCase();
      const itemClass = (c.class_name || '').trim().toLowerCase();
      return itemStudent === sName && itemClass === cName;
    });

    const map = new Map<string, DbCodingProgress>();
    for (const rec of relevant) {
      const key = `${rec.track}__${(rec.problem_id || '').trim().toUpperCase()}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, rec);
      } else {
        const existTime = new Date(existing.updated_at || existing.created_at || 0).getTime();
        const newTime = new Date(rec.updated_at || rec.created_at || 0).getTime();
        if (newTime > existTime) {
          map.set(key, rec);
        }
      }
    }
    return map;
  }, [rawCodingProgress, studentName, className]);

  // Lookup map for problem titles
  const problemTitles = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of basicCodingProblems) {
      map.set(`basic__${p.code.toUpperCase()}`, p.title);
    }
    for (const p of septemberCodingProblems) {
      map.set(`september__${p.id.toUpperCase()}`, p.title);
    }
    return map;
  }, []);

  // 3. Compute 6 Overview Metrics
  const examAttempts = studentExams.length;

  const highestScore = useMemo(() => {
    if (studentExams.length === 0) return null;
    return Math.max(...studentExams.map((e) => e.score || 0));
  }, [studentExams]);

  const latestScore = useMemo(() => {
    if (studentExams.length === 0) return null;
    return studentExams[0].score ?? 0;
  }, [studentExams]);

  const averageScore = useMemo(() => {
    if (studentExams.length === 0) return null;
    const sum = studentExams.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return Math.round((sum / studentExams.length) * 10) / 10;
  }, [studentExams]);

  const basicCompletedCount = useMemo(() => {
    let count = 0;
    for (const p of basicCodingProblems) {
      const rec = studentCodingMap.get(`basic__${p.code.toUpperCase()}`);
      if (rec?.status === 'completed') count++;
    }
    return count;
  }, [studentCodingMap]);

  const septemberCompletedCount = useMemo(() => {
    let count = 0;
    for (const p of septemberCodingProblems) {
      const rec = studentCodingMap.get(`september__${p.id.toUpperCase()}`);
      if (rec?.status === 'completed') count++;
    }
    return count;
  }, [studentCodingMap]);

  const basicPct = Math.round((basicCompletedCount / 33) * 100);
  const septemberPct = Math.round((septemberCompletedCount / 33) * 100);

  // Helper date formatter
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Helper duration formatter
  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}p ${s < 10 ? '0' : ''}${s}s`;
  };

  // 3b. Filter coding submissions for this student (Requirement 5)
  const studentSubmissions = useMemo(() => {
    if (!codingSubmissions || codingSubmissions.length === 0) return [];
    const sName = studentName.trim().toLowerCase();
    const cName = className.trim().toLowerCase();

    return codingSubmissions
      .filter((s) => {
        const itemStudent = (s.student_name || '').trim().toLowerCase();
        const itemClass = (s.class_name || '').trim().toLowerCase();
        if (itemStudent !== sName) return false;
        if (cName && itemClass && itemClass !== cName) return false;
        return true;
      })
      .sort((a, b) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime());
  }, [codingSubmissions, studentName, className]);

  // Statistics for Problem B01 - B05 (Requirement 6)
  const problemSummaries = useMemo(() => {
    const problems = ['B01', 'B02', 'B03', 'B04', 'B05'];
    return problems.map((pid) => {
      const subs = studentSubmissions.filter(
        (s) => (s.problem_id || '').trim().toUpperCase() === pid
      );
      const prob = septemberCodingProblems.find((p) => p.id.toUpperCase() === pid);
      const title = prob ? prob.title : pid;
      const totalAttempts = subs.length;
      const isAccepted = subs.some((s) => s.verdict === 'Accepted');
      const highestScore = totalAttempts > 0 ? Math.max(...subs.map((s) => s.score || 0)) : null;
      const latestSub = subs[0] || null;

      // Status in coding_progress (if available)
      const rec = studentCodingMap.get(`september__${pid}`);
      const progressStatus = rec?.status || (isAccepted ? 'completed' : totalAttempts > 0 ? 'in_progress' : 'not_started');

      return {
        id: pid,
        title,
        totalAttempts,
        isAccepted,
        highestScore,
        latestScore: latestSub ? latestSub.score : null,
        latestVerdict: latestSub ? latestSub.verdict : null,
        latestSubmittedAt: latestSub ? latestSub.submitted_at : null,
        progressStatus,
      };
    });
  }, [studentSubmissions, studentCodingMap]);

  // Filtered submissions list for the submissions tab table
  const filteredStudentSubmissions = useMemo(() => {
    if (submissionProblemFilter === 'all') return studentSubmissions;
    return studentSubmissions.filter(
      (s) => (s.problem_id || '').trim().toUpperCase() === submissionProblemFilter.toUpperCase()
    );
  }, [studentSubmissions, submissionProblemFilter]);

  // 4. Merge recent activities (Up to 10)
  interface RecentActivity {
    id: string;
    timeStr: string;
    timestamp: number;
    title: string;
    detail: string;
    type: 'quiz' | 'coding' | 'submission';
    status?: 'completed' | 'in_progress';
  }

  const recentActivities = useMemo(() => {
    const list: RecentActivity[] = [];

    // Add quiz attempts
    for (const exam of studentExams) {
      const time = exam.submitted_at;
      if (time) {
        const d = new Date(time);
        list.push({
          id: `quiz_${exam.id}`,
          timeStr: formatDate(time),
          timestamp: d.getTime(),
          title: `Làm quiz: ${exam.score}/100`,
          detail: `Đúng ${exam.correct_count}/40 câu • Sai ${exam.wrong_count} • Thời gian: ${formatDuration(exam.duration_seconds)}`,
          type: 'quiz',
        });
      }
    }

    // Add coding submissions (Judge)
    for (const sub of studentSubmissions) {
      const time = sub.submitted_at;
      if (time) {
        const d = new Date(time);
        list.push({
          id: `sub_${sub.id}`,
          timeStr: formatDate(time),
          timestamp: d.getTime(),
          title: `Nộp bài ${sub.problem_id}: ${sub.verdict} (${sub.score}/100)`,
          detail: `Đúng ${sub.passed_tests}/${sub.total_tests} test • Ngôn ngữ: ${sub.language} • ${sub.execution_time_ms !== null && sub.execution_time_ms !== undefined ? `${sub.execution_time_ms} ms` : ''}`,
          type: 'submission',
        });
      }
    }

    // Add coding progress updates
    for (const [key, rec] of studentCodingMap.entries()) {
      const time = rec.updated_at || rec.completed_at || rec.started_at;
      if (time && rec.status !== 'not_started') {
        const d = new Date(time);
        const pId = rec.problem_id.toUpperCase();
        const pTitle = problemTitles.get(key) || pId;
        const trackLabel = rec.track === 'basic' ? 'Cơ bản & Trung bình' : 'Luyện thi tháng 9';

        const isDone = rec.status === 'completed';
        list.push({
          id: `coding_${key}`,
          timeStr: formatDate(time),
          timestamp: d.getTime(),
          title: `${isDone ? 'Hoàn thành' : 'Đang làm'} ${pId} - ${trackLabel}`,
          detail: `Bài: ${pTitle}`,
          type: 'coding',
          status: rec.status,
        });
      }
    }

    // Sort newest first and limit to 10
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list.slice(0, 10);
  }, [studentExams, studentSubmissions, studentCodingMap, problemTitles]);

  return (
    <div className="space-y-6">
      {/* Top Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-dashboard"
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>QUAY LẠI DASHBOARD</span>
          </button>

          <div className="h-6 w-px bg-slate-700 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-white tracking-tight">
                {studentName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                {className ? `Lớp ${className}` : 'Chưa phân lớp'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hồ sơ chi tiết trắc nghiệm Python và tiến độ lập trình
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TỔNG QUAN
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'exams'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>LỊCH SỬ QUIZ</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px] font-mono">
              {examAttempts}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('coding')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'coding'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>TIẾN ĐỘ CODING</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px] font-mono">
              {basicCompletedCount + septemberCompletedCount}/66
            </span>
          </button>
          <button
            id="tab-detail-submissions"
            onClick={() => setActiveTab('submissions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'submissions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>BÀI NỘP</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px] font-mono">
              {studentSubmissions.length}
            </span>
          </button>
        </div>
      </div>

      {/* 6 Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Tổng số lần làm quiz */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              SỐ LẦN LÀM QUIZ
            </span>
            <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {examAttempts}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {examAttempts > 0 ? `${examAttempts} lượt nộp bài` : 'Chưa có dữ liệu'}
          </p>
        </div>

        {/* Card 2: Điểm cao nhất */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ĐIỂM CAO NHẤT
            </span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {highestScore !== null ? (
              <>
                {highestScore}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">/ 100</span>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-500 font-sans">Chưa có dữ liệu</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Kỷ lục điểm đạt được</p>
        </div>

        {/* Card 3: Điểm gần nhất */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ĐIỂM GẦN NHẤT
            </span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">
            {latestScore !== null ? (
              <>
                {latestScore}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">/ 100</span>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-500 font-sans">Chưa có dữ liệu</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Lần nộp gần nhất</p>
        </div>

        {/* Card 4: Điểm trung bình */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ĐIỂM TRUNG BÌNH
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {averageScore !== null ? (
              <>
                {averageScore}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">/ 100</span>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-500 font-sans">Chưa có dữ liệu</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Tính trên mọi lần thi</p>
        </div>

        {/* Card 5: Bài Cơ bản đã hoàn thành */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              CƠ BẢN & TB
            </span>
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {basicCompletedCount}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">/ 33</span>
          </div>
          <div className="w-full bg-slate-700/70 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${basicPct}%` }}
            />
          </div>
        </div>

        {/* Card 6: Bài Luyện thi tháng 9 đã hoàn thành */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              THI THÁNG 9
            </span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {septemberCompletedCount}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">/ 33</span>
          </div>
          <div className="w-full bg-slate-700/70 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${septemberPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: TỔNG QUAN */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Mini Breakdown of Quiz & Coding */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Track Progress Summary */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center justify-between mb-4">
                <span className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  <span>Tiến Độ 2 Track Lập Trình</span>
                </span>
                <button
                  onClick={() => setActiveTab('coding')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  Xem chi tiết từng bài →
                </button>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Track 1: Cơ bản & Trung bình */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">
                      CƠ BẢN & TRUNG BÌNH
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {basicCompletedCount} / 33 bài ({basicPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${basicPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Bao gồm 33 bài rèn luyện cú pháp cơ bản, toán tử, vòng lặp và mảng.
                  </p>
                </div>

                {/* Track 2: Luyện thi tháng 9 */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">
                      LUYỆN THI THÁNG 9
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {septemberCompletedCount} / 33 bài ({septemberPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${septemberPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Bao gồm 33 bài nâng cao ôn luyện tuyển chọn phục vụ kỳ thi chuyên tin.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Quiz Attempts Preview */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Bài Thi Trắc Nghiệm Gần Nhất</span>
                </h3>
                {examAttempts > 0 && (
                  <button
                    onClick={() => setActiveTab('exams')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                  >
                    Xem tất cả ({examAttempts}) →
                  </button>
                )}
              </div>

              {studentExams.length > 0 ? (
                <div className="divide-y divide-slate-700/50">
                  {studentExams.slice(0, 3).map((exam, idx) => (
                    <div
                      key={exam.id}
                      onClick={() => setSelectedExamDetail(exam)}
                      className="py-3 flex items-center justify-between gap-4 hover:bg-slate-700/20 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black font-mono text-sm ${
                            exam.score >= 80
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : exam.score >= 50
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {exam.score}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            Lần thi #{studentExams.length - idx} • {exam.score} / 100 điểm
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Đúng {exam.correct_count}/40 câu • Sai {exam.wrong_count} • Bỏ {exam.blank_count}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-slate-300 font-mono">
                          {formatDuration(exam.duration_seconds)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatDate(exam.submitted_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Chưa có lượt kiểm tra
                </div>
              )}
            </div>
          </div>

          {/* Right 1 Col: Hoạt động gần nhất */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>HOẠT ĐỘNG GẦN NHẤT</span>
            </h3>

            {recentActivities.length > 0 ? (
              <div className="space-y-3.5 overflow-y-auto max-h-[480px] pr-1">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">{act.timeStr}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                          act.type === 'quiz'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : act.type === 'submission'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : act.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {act.type === 'quiz'
                          ? 'Trắc nghiệm'
                          : act.type === 'submission'
                          ? 'Judge Nộp bài'
                          : act.status === 'completed'
                          ? 'Hoàn thành'
                          : 'Đang làm'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-100">
                      {act.title}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {act.detail}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs flex-1 flex flex-col items-center justify-center">
                <Info className="w-6 h-6 mb-2 text-slate-600" />
                <span>Chưa ghi nhận hoạt động nào</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LỊCH SỬ QUIZ */}
      {/* ========================================================= */}
      {activeTab === 'exams' && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-400" />
                <span>Lịch Sử Bài Thi Trắc Nghiệm</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Toàn bộ các lần thi đã nộp, sắp xếp mới nhất trước. Click vào dòng để xem chi tiết 10 chủ đề.
              </p>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Tổng số: <strong className="text-white">{studentExams.length}</strong> lần thi
            </div>
          </div>

          {studentExams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700/60">
                  <tr>
                    <th className="py-3.5 px-4 text-center">Lần thi</th>
                    <th className="py-3.5 px-4 text-center">Điểm số</th>
                    <th className="py-3.5 px-3 text-center">Đúng</th>
                    <th className="py-3.5 px-3 text-center">Sai</th>
                    <th className="py-3.5 px-3 text-center">Bỏ trống</th>
                    <th className="py-3.5 px-4 text-center">Thời gian</th>
                    <th className="py-3.5 px-4 text-right">Ngày nộp</th>
                    <th className="py-3.5 px-3 text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {studentExams.map((exam, idx) => {
                    const attemptNumber = studentExams.length - idx;
                    return (
                      <tr
                        key={exam.id}
                        onClick={() => setSelectedExamDetail(exam)}
                        className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 text-center font-bold text-slate-400 font-mono">
                          #{attemptNumber}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-black font-mono text-xs px-2.5 py-1 rounded-full ${
                              exam.score >= 80
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : exam.score >= 50
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {exam.score} / 100
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                          {exam.correct_count}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-rose-400">
                          {exam.wrong_count}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">
                          {exam.blank_count}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-300">
                          {formatDuration(exam.duration_seconds)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                          {formatDate(exam.submitted_at)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExamDetail(exam);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-700"
                          >
                            10 chủ đề
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Chưa có lượt kiểm tra
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TIẾN ĐỘ CODING */}
      {/* ========================================================= */}
      {activeTab === 'coding' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-200">Lọc bài toán:</span>

              <select
                value={codingTrackFilter}
                onChange={(e) => setCodingTrackFilter(e.target.value as 'all' | 'basic' | 'september')}
                className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Cả 2 nhóm bài</option>
                <option value="basic">Chỉ Cơ bản & Trung bình</option>
                <option value="september">Chỉ Luyện thi tháng 9</option>
              </select>

              <select
                value={codingStatusFilter}
                onChange={(e) => setCodingStatusFilter(e.target.value as 'all' | 'completed' | 'in_progress' | 'not_started')}
                className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Đã hoàn thành (✓)</option>
                <option value="in_progress">Đang làm (◐)</option>
                <option value="not_started">Chưa làm (○)</option>
              </select>
            </div>

            {/* Legend indicator */}
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Đã hoàn thành</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Đang làm</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                <span>Chưa làm</span>
              </span>
            </div>
          </div>

          {/* Group 1: CƠ BẢN & TRUNG BÌNH */}
          {(codingTrackFilter === 'all' || codingTrackFilter === 'basic') && (
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-700/80">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    <span>CƠ BẢN & TRUNG BÌNH</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    33 bài tập rèn luyện cú pháp Python căn bản (B01 → B33)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {basicCompletedCount} / 33 hoàn thành
                  </span>
                  <div className="w-28 bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${basicPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Problem Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {basicCodingProblems
                  .filter((p) => {
                    if (codingStatusFilter === 'all') return true;
                    const rec = studentCodingMap.get(`basic__${p.code.toUpperCase()}`);
                    const status = rec?.status || 'not_started';
                    return status === codingStatusFilter;
                  })
                  .map((p) => {
                    const pCode = p.code.toUpperCase();
                    const rec = studentCodingMap.get(`basic__${pCode}`);
                    const status: 'completed' | 'in_progress' | 'not_started' =
                      rec?.status || 'not_started';

                    const statusColor =
                      status === 'completed'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : status === 'in_progress'
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border-slate-700/70 bg-slate-900/50 text-slate-400';

                    const statusIcon =
                      status === 'completed'
                        ? '✓ Đã xong'
                        : status === 'in_progress'
                        ? '◐ Đang làm'
                        : '○ Chưa làm';

                    return (
                      <div
                        key={p.code}
                        onClick={() =>
                          setSelectedProblemDetail({
                            problemId: p.code,
                            title: p.title,
                            track: 'basic',
                            trackName: 'Cơ bản & Trung bình',
                            status,
                            startedAt: rec?.started_at,
                            completedAt: rec?.completed_at,
                            updatedAt: rec?.updated_at,
                          })
                        }
                        className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${statusColor}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono font-bold text-xs text-white">
                            {p.code}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700">
                            {statusIcon}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-200 truncate" title={p.title}>
                          {p.title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {p.topic}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Group 2: LUYỆN THI THÁNG 9 */}
          {(codingTrackFilter === 'all' || codingTrackFilter === 'september') && (
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-700/80">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>LUYỆN THI THÁNG 9</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    33 bài ôn luyện tuyển chọn phục vụ kỳ thi chuyên tin (B01 → B33)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {septemberCompletedCount} / 33 hoàn thành
                  </span>
                  <div className="w-28 bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${septemberPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Problem Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {septemberCodingProblems
                  .filter((p) => {
                    if (codingStatusFilter === 'all') return true;
                    const rec = studentCodingMap.get(`september__${p.id.toUpperCase()}`);
                    const status = rec?.status || 'not_started';
                    return status === codingStatusFilter;
                  })
                  .map((p) => {
                    const pId = p.id.toUpperCase();
                    const rec = studentCodingMap.get(`september__${pId}`);
                    const status: 'completed' | 'in_progress' | 'not_started' =
                      rec?.status || 'not_started';

                    const statusColor =
                      status === 'completed'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : status === 'in_progress'
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border-slate-700/70 bg-slate-900/50 text-slate-400';

                    const statusIcon =
                      status === 'completed'
                        ? '✓ Đã xong'
                        : status === 'in_progress'
                        ? '◐ Đang làm'
                        : '○ Chưa làm';

                    return (
                      <div
                        key={p.id}
                        onClick={() =>
                          setSelectedProblemDetail({
                            problemId: p.id,
                            title: p.title,
                            track: 'september',
                            trackName: 'Luyện thi tháng 9',
                            status,
                            startedAt: rec?.started_at,
                            completedAt: rec?.completed_at,
                            updatedAt: rec?.updated_at,
                          })
                        }
                        className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${statusColor}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono font-bold text-xs text-white">
                            {p.id}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700">
                            {statusIcon}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-200 truncate" title={p.title}>
                          {p.title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Luyện thi chuyên tin
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: BÀI NỘP LẬP TRÌNH (Requirement 5, 6, 7, 11) */}
      {/* ========================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Quick stats */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-400" />
                  <span>Lịch Sử Bài Nộp Lập Trình (Judge B01 - B05)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chi tiết từng bài B01-B05 và lịch sử tất cả các lần nộp code của học sinh{' '}
                  <strong className="text-white">{studentName}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300">
                  Tổng số bài nộp: <strong className="text-white">{studentSubmissions.length}</strong>
                </span>
                <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  Accepted: <strong className="text-emerald-400">
                    {studentSubmissions.filter((s) => s.verdict === 'Accepted').length}
                  </strong>
                </span>
              </div>
            </div>

            {/* Requirement 6: Chi tiết bài nộp theo bài (B01 - B05 Cards) */}
            <div className="pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <span>Trạng thái 5 bài đã mở Judge tự động (B01 - B05)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {problemSummaries.map((ps) => {
                  const cardBg = ps.isAccepted
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : ps.totalAttempts > 0
                    ? 'border-blue-500/40 bg-blue-500/5'
                    : 'border-slate-700/60 bg-slate-900/40';

                  return (
                    <div
                      key={ps.id}
                      onClick={() => setSubmissionProblemFilter(ps.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${cardBg}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-sm text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                          {ps.id}
                        </span>
                        {ps.isAccepted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted
                          </span>
                        ) : ps.totalAttempts > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            Đang làm
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                            Chưa nộp
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-slate-200 truncate mb-3" title={ps.title}>
                        {ps.title}
                      </div>

                      <div className="space-y-1.5 text-[11px] border-t border-slate-700/40 pt-2 font-mono">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Số lần nộp:</span>
                          <span className="font-bold text-white">{ps.totalAttempts} lần</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Điểm cao nhất:</span>
                          <span className={`font-bold ${ps.highestScore === 100 ? 'text-emerald-400' : 'text-white'}`}>
                            {ps.highestScore !== null ? `${ps.highestScore} đ` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Gần nhất:</span>
                          <span
                            className={`font-semibold truncate max-w-[110px] ${
                              ps.latestVerdict === 'Accepted'
                                ? 'text-emerald-400'
                                : ps.latestVerdict
                                ? 'text-rose-400'
                                : 'text-slate-500'
                            }`}
                            title={ps.latestVerdict || 'Chưa nộp'}
                          >
                            {ps.latestVerdict ? `${ps.latestVerdict} (${ps.latestScore}đ)` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Trạng thái:</span>
                          <span className="text-slate-200 font-sans text-[10px]">
                            {ps.isAccepted
                              ? 'Đã hoàn thành'
                              : ps.totalAttempts > 0
                              ? 'Đang làm'
                              : 'Chưa làm'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Requirement 7: Lịch sử tất cả lần nộp của học sinh đó */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>Danh Sách Toàn Bộ Lần Nộp Code</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sắp xếp mới nhất trước. Bấm "Xem code" để xem mã nguồn đã nộp.
                </p>
              </div>

              {/* Problem filter dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Lọc bài:</span>
                <select
                  id="select-filter-student-detail-problem"
                  value={submissionProblemFilter}
                  onChange={(e) => setSubmissionProblemFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Tất cả bài ({studentSubmissions.length})</option>
                  {['B01', 'B02', 'B03', 'B04', 'B05'].map((pid) => (
                    <option key={pid} value={pid}>
                      {pid}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submissions Table / Empty State (Requirement 11) */}
            {filteredStudentSubmissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700/60">
                    <tr>
                      <th className="py-3.5 px-4">Bài</th>
                      <th className="py-3.5 px-3">Track</th>
                      <th className="py-3.5 px-3">Ngôn ngữ</th>
                      <th className="py-3.5 px-3 text-center">Điểm</th>
                      <th className="py-3.5 px-3 text-center">Passed / Total</th>
                      <th className="py-3.5 px-3">Verdict</th>
                      <th className="py-3.5 px-3">Thời gian</th>
                      <th className="py-3.5 px-4 text-right">Thời điểm nộp</th>
                      <th className="py-3.5 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {filteredStudentSubmissions.map((sub) => {
                      const prob = septemberCodingProblems.find(
                        (p) => p.id.toUpperCase() === (sub.problem_id || '').toUpperCase()
                      );
                      const probTitle = prob ? prob.title : '';

                      return (
                        <tr
                          key={sub.id}
                          onClick={() => setSelectedSubmission(sub)}
                          className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-baseline gap-2">
                              <span className="font-mono font-bold text-blue-300 text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                                {sub.problem_id}
                              </span>
                              {probTitle && (
                                <span className="text-slate-300 text-xs truncate max-w-[180px]" title={probTitle}>
                                  {probTitle}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-slate-300 text-[11px]">
                              {sub.track === 'september' ? 'Luyện thi T9' : sub.track}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-emerald-400 text-[11px]">
                              {sub.language}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                                sub.score === 100
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : sub.score > 0
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {sub.score}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                            {sub.passed_tests} / {sub.total_tests}
                          </td>
                          <td className="py-3 px-3">
                            {sub.verdict === 'Accepted' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                Accepted
                              </span>
                            )}
                            {sub.verdict === 'Wrong Answer' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                <XCircle className="w-3 h-3" />
                                Wrong Answer
                              </span>
                            )}
                            {sub.verdict === 'Compilation Error' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                Compile Err
                              </span>
                            )}
                            {sub.verdict === 'Runtime Error' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                Runtime Err
                              </span>
                            )}
                            {sub.verdict === 'Time Limit Exceeded' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                <Clock className="w-3 h-3" />
                                TLE
                              </span>
                            )}
                            {!['Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error', 'Time Limit Exceeded'].includes(sub.verdict) && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700 text-slate-300">
                                {sub.verdict}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                            {sub.execution_time_ms !== null && sub.execution_time_ms !== undefined
                              ? `${sub.execution_time_ms} ms`
                              : '—'}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                            {formatDate(sub.submitted_at)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubmission(sub);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Xem code
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                {studentSubmissions.length === 0
                  ? 'Chưa có bài nộp lập trình.'
                  : `Học sinh chưa có bài nộp nào cho bài ${submissionProblemFilter}.`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CHI TIẾT 10 CHỦ ĐỀ QUIZ */}
      {/* ========================================================= */}
      {selectedExamDetail && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 sm:p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-blue-400" />
                  <span>Chi Tiết Lần Thi: {studentName}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Lớp: <strong className="text-white">{className || '—'}</strong> • Nộp lúc:{' '}
                  {formatDate(selectedExamDetail.submitted_at)}
                </p>
              </div>

              <button
                onClick={() => setSelectedExamDetail(null)}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {/* Stat overview */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-slate-400 mb-1">Điểm số</div>
                  <div className="text-2xl font-black text-blue-400 font-mono">
                    {selectedExamDetail.score} / 100
                  </div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-emerald-400 mb-1">Đúng</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {selectedExamDetail.correct_count}
                  </div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-rose-400 mb-1">Sai</div>
                  <div className="text-2xl font-black text-rose-400 font-mono">
                    {selectedExamDetail.wrong_count}
                  </div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-slate-400 mb-1">Thời gian</div>
                  <div className="text-lg font-bold text-slate-200 font-mono pt-1">
                    {formatDuration(selectedExamDetail.duration_seconds)}
                  </div>
                </div>
              </div>

              {/* 10 Topic breakdown with progress bars */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Kết quả theo 10 chủ đề trắc nghiệm
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { name: '1. Biến và kiểu dữ liệu', score: selectedExamDetail.topic_1_score },
                    { name: '2. Toán tử số học', score: selectedExamDetail.topic_2_score },
                    { name: '3. Toán tử so sánh và logic', score: selectedExamDetail.topic_3_score },
                    { name: '4. Nhập/Xuất dữ liệu', score: selectedExamDetail.topic_4_score },
                    { name: '5. if - elif - else', score: selectedExamDetail.topic_5_score },
                    { name: '6. for', score: selectedExamDetail.topic_6_score },
                    { name: '7. while', score: selectedExamDetail.topic_7_score },
                    { name: '8. string', score: selectedExamDetail.topic_8_score },
                    { name: '9. list', score: selectedExamDetail.topic_9_score },
                    { name: '10. function', score: selectedExamDetail.topic_10_score },
                  ].map((topic, i) => {
                    const scoreVal = topic.score ?? 0;
                    const pct = Math.min(100, Math.max(0, (scoreVal / 10) * 100));

                    const barColor =
                      scoreVal >= 8
                        ? 'bg-emerald-500'
                        : scoreVal >= 5
                        ? 'bg-blue-500'
                        : 'bg-rose-500';

                    return (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-200 font-medium truncate mr-2">
                            {topic.name}
                          </span>
                          <span className="font-mono font-bold text-white shrink-0">
                            {topic.score !== undefined ? `${topic.score} / 10` : '—'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border-t border-slate-700 text-right">
              <button
                onClick={() => setSelectedExamDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer toàn hệ thống */}
      <Footer theme="dark" className="mt-8 border-t border-slate-800" />

      {/* ========================================================= */}
      {/* MODAL: CHI TIẾT TRẠNG THÁI BÀI CODING */}
      {/* ========================================================= */}
      {selectedProblemDetail && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {selectedProblemDetail.trackName}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-blue-300">{selectedProblemDetail.problemId}</span>
                  <span>-</span>
                  <span>{selectedProblemDetail.title}</span>
                </h3>
              </div>

              <button
                onClick={() => setSelectedProblemDetail(null)}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Học sinh:</span>
                <span className="font-bold text-white">
                  {studentName} {className && `(${className})`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Trạng thái hiện tại:</span>
                <span
                  className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                    selectedProblemDetail.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : selectedProblemDetail.status === 'in_progress'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                  }`}
                >
                  {selectedProblemDetail.status === 'completed'
                    ? '✓ Đã hoàn thành'
                    : selectedProblemDetail.status === 'in_progress'
                    ? '◐ Đang làm bài'
                    : '○ Chưa bắt đầu'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60">
                  <div className="text-[11px] text-slate-400 mb-1">Thời gian bắt đầu:</div>
                  <div className="font-mono text-slate-200 text-xs">
                    {formatDate(selectedProblemDetail.startedAt)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60">
                  <div className="text-[11px] text-slate-400 mb-1">Thời gian hoàn thành:</div>
                  <div className="font-mono text-slate-200 text-xs">
                    {formatDate(selectedProblemDetail.completedAt)}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Cập nhật lần cuối:</span>
                <span className="font-mono text-slate-300">
                  {formatDate(selectedProblemDetail.updatedAt)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border-t border-slate-700 text-right">
              <button
                onClick={() => setSelectedProblemDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CHI TIẾT BÀI NỘP (Requirement 8) */}
      {/* ========================================================= */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
};
