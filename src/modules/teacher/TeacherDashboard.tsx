import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TeacherUser, DbExamResult, DbCodingProgress, LatestCodingProgress } from './types';
import {
  fetchExamResults,
  fetchCodingProgress,
  deduplicateCodingProgress,
  buildStudentOverview,
} from './teacherDataService';
import { signOutTeacher, getCurrentTeacher } from './teacherAuthService';
import { basicCodingProblems } from '../../data/basicCodingProblems';
import { septemberCodingProblems } from '../../data/septemberCodingProblems';
import { TeacherStudentDetail } from './TeacherStudentDetail';
import {
  LayoutDashboard,
  FileCheck2,
  Code2,
  LogOut,
  RefreshCw,
  Search,
  Users,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowUpDown,
  Filter,
  Layers,
  ChevronDown,
  Info,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface TeacherDashboardProps {
  teacher: TeacherUser;
  onSignOut: () => void;
  onBackToHome: () => void;
}

type DashboardTab = 'overview' | 'exams' | 'coding';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  onSignOut,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Raw data from Supabase
  const [examResults, setExamResults] = useState<DbExamResult[]>([]);
  const [rawCodingProgress, setRawCodingProgress] = useState<DbCodingProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Selected exam row for detail modal
  const [selectedExamDetail, setSelectedExamDetail] = useState<DbExamResult | null>(null);

  // Filters for Exam Results
  const [examSearch, setExamSearch] = useState<string>('');
  const [examClassFilter, setExamClassFilter] = useState<string>('all');
  const [examSortBy, setExamSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'>('date_desc');

  // Filters for Coding Progress
  const [codingSearch, setCodingSearch] = useState<string>('');
  const [codingClassFilter, setCodingClassFilter] = useState<string>('all');
  const [codingTrackFilter, setCodingTrackFilter] = useState<'all' | 'basic' | 'september'>('all');
  const [codingStatusFilter, setCodingStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
  const [onlyLatestCoding, setOnlyLatestCoding] = useState<boolean>(true);

  // Filters for Overview Student List
  const [overviewSearch, setOverviewSearch] = useState<string>('');
  const [overviewClassFilter, setOverviewClassFilter] = useState<string>('all');

  // Selected student for Student Detail View
  const [selectedStudent, setSelectedStudent] = useState<{
    studentName: string;
    className: string;
  } | null>(null);

  // Scroll to top when selecting a student
  useEffect(() => {
    if (selectedStudent) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedStudent]);

  // Lookup map for problem titles
  const problemTitles = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of basicCodingProblems) {
      map.set(`basic__${p.code}`, p.title);
    }
    for (const p of septemberCodingProblems) {
      map.set(`september__${p.id}`, p.title);
    }
    return map;
  }, []);

  // Fetch data
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setDataError(null);

    try {
      // Re-verify teacher account before loading data
      const verified = await getCurrentTeacher();
      if (!verified) {
        onSignOut();
        return;
      }

      const [exams, codings] = await Promise.all([
        fetchExamResults(),
        fetchCodingProgress(),
      ]);

      setExamResults(exams);
      setRawCodingProgress(codings);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu từ máy chủ.';
      setDataError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onSignOut]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOutTeacher();
    } finally {
      onSignOut();
    }
  };

  // Deduplicated Coding Progress (Requirement 8)
  const latestCodingProgress = useMemo(() => {
    return deduplicateCodingProgress(rawCodingProgress);
  }, [rawCodingProgress]);

  // Aggregate student overview data (Requirement 9)
  const overviewData = useMemo(() => {
    return buildStudentOverview(examResults, latestCodingProgress);
  }, [examResults, latestCodingProgress]);

  // Classes list for dropdowns
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    for (const e of examResults) {
      if (e.class_name?.trim()) classSet.add(e.class_name.trim());
    }
    for (const c of rawCodingProgress) {
      if (c.class_name?.trim()) classSet.add(c.class_name.trim());
    }
    return Array.from(classSet).sort();
  }, [examResults, rawCodingProgress]);

  // Filtered Exam Results
  const filteredExamResults = useMemo(() => {
    let list = [...examResults];

    if (examSearch.trim()) {
      const q = examSearch.trim().toLowerCase();
      list = list.filter((e) => e.student_name.toLowerCase().includes(q));
    }

    if (examClassFilter !== 'all') {
      list = list.filter((e) => (e.class_name || '').trim() === examClassFilter);
    }

    list.sort((a, b) => {
      if (examSortBy === 'date_desc') {
        return new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime();
      }
      if (examSortBy === 'date_asc') {
        return new Date(a.submitted_at || 0).getTime() - new Date(b.submitted_at || 0).getTime();
      }
      if (examSortBy === 'score_desc') {
        return (b.score || 0) - (a.score || 0);
      }
      if (examSortBy === 'score_asc') {
        return (a.score || 0) - (b.score || 0);
      }
      return 0;
    });

    return list;
  }, [examResults, examSearch, examClassFilter, examSortBy]);

  // Filtered Coding Progress
  const filteredCodingList = useMemo(() => {
    const source = onlyLatestCoding ? latestCodingProgress : rawCodingProgress;
    let list = [...source];

    if (codingSearch.trim()) {
      const q = codingSearch.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.student_name.toLowerCase().includes(q) ||
          c.problem_id.toLowerCase().includes(q)
      );
    }

    if (codingClassFilter !== 'all') {
      list = list.filter((c) => (c.class_name || '').trim() === codingClassFilter);
    }

    if (codingTrackFilter !== 'all') {
      list = list.filter((c) => c.track === codingTrackFilter);
    }

    if (codingStatusFilter !== 'all') {
      list = list.filter((c) => c.status === codingStatusFilter);
    }

    // Default sort by updated_at descending
    list.sort((a, b) => {
      const tA = new Date(a.updated_at || a.created_at || 0).getTime();
      const tB = new Date(b.updated_at || b.created_at || 0).getTime();
      return tB - tA;
    });

    return list;
  }, [
    onlyLatestCoding,
    latestCodingProgress,
    rawCodingProgress,
    codingSearch,
    codingClassFilter,
    codingTrackFilter,
    codingStatusFilter,
  ]);

  // Filtered Overview Students
  const filteredOverviewStudents = useMemo(() => {
    let list = overviewData.students;

    if (overviewSearch.trim()) {
      const q = overviewSearch.trim().toLowerCase();
      list = list.filter((s) => s.studentName.toLowerCase().includes(q));
    }

    if (overviewClassFilter !== 'all') {
      list = list.filter((s) => s.className === overviewClassFilter);
    }

    return list;
  }, [overviewData.students, overviewSearch, overviewClassFilter]);

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  BẢNG ĐIỀU KHIỂN GIÁO VIÊN
                </h1>
                {selectedStudent && (
                  <>
                    <span className="text-slate-500">/</span>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Học sinh: {selectedStudent.studentName} {selectedStudent.className && `(${selectedStudent.className})`}
                    </span>
                  </>
                )}
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  TEACHER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Xin chào, <span className="text-white font-medium">{teacher.displayName}</span>
                {teacher.email && <span className="text-slate-500 text-[11px] ml-1">({teacher.email})</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-teacher-refresh"
              onClick={() => loadDashboardData(true)}
              disabled={loading || refreshing}
              title="Làm mới dữ liệu từ máy chủ"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              id="btn-teacher-view-home"
              onClick={onBackToHome}
              title="Xem trang làm bài của học sinh"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trang học sinh</span>
            </button>

            <button
              id="btn-teacher-logout"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 hover:border-transparent transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ĐĂNG XUẤT</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 border-t border-slate-800/60 overflow-x-auto scrollbar-none">
          <button
            id="tab-teacher-overview"
            onClick={() => {
              setSelectedStudent(null);
              setActiveTab('overview');
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview' && !selectedStudent
                ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>TỔNG QUAN</span>
          </button>

          <button
            id="tab-teacher-exams"
            onClick={() => {
              setSelectedStudent(null);
              setActiveTab('exams');
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'exams' && !selectedStudent
                ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>KẾT QUẢ TRẮC NGHIỆM</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {examResults.length}
            </span>
          </button>

          <button
            id="tab-teacher-coding"
            onClick={() => {
              setSelectedStudent(null);
              setActiveTab('coding');
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'coding' && !selectedStudent
                ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>TIẾN ĐỘ LẬP TRÌNH</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {onlyLatestCoding ? latestCodingProgress.length : rawCodingProgress.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {dataError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
            <span>{dataError}</span>
            <button
              onClick={() => loadDashboardData()}
              className="px-3 py-1 rounded bg-rose-600 text-white font-semibold hover:bg-rose-500 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-sm text-slate-300 font-medium">Đang đồng bộ dữ liệu giáo viên từ Supabase...</p>
            <p className="text-xs text-slate-500 mt-1">Vui lòng chờ trong giây lát</p>
          </div>
        ) : selectedStudent ? (
          <TeacherStudentDetail
            studentName={selectedStudent.studentName}
            className={selectedStudent.className}
            examResults={examResults}
            rawCodingProgress={rawCodingProgress}
            onBack={() => setSelectedStudent(null)}
          />
        ) : (
          <>
            {/* ========================================================= */}
            {/* TAB 1: TỔNG QUAN (Requirement 9) */}
            {/* ========================================================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 4 Primary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {/* Card 1: Tổng số học sinh */}
                  <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        TỔNG SỐ HỌC SINH
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {overviewData.totalUniqueStudents}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Đã tham gia thi trắc nghiệm hoặc bài tập lập trình
                    </p>
                  </div>

                  {/* Card 2: Tổng lượt kiểm tra */}
                  <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        TỔNG LƯỢT KIỂM TRA
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {overviewData.totalExamAttempts}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Bài thi Python 100 đã hoàn tất nộp điểm
                    </p>
                  </div>

                  {/* Card 3: Điểm trung bình */}
                  <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        ĐIỂM TRUNG BÌNH
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 tracking-tight">
                      {overviewData.averageExamScore}{' '}
                      <span className="text-sm font-normal text-slate-400">/ 100</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tính trên toàn bộ các lượt nộp bài thi trắc nghiệm
                    </p>
                  </div>

                  {/* Card 4: Tổng bài coding hoàn thành */}
                  <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        BÀI CODING ĐÃ XONG
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Code2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-amber-400 tracking-tight">
                      {overviewData.totalCodingCompleted}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tổng số bài lập trình đã được đánh dấu hoàn thành
                    </p>
                  </div>
                </div>

                {/* Detailed Student Progress Roster */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>Tiến Độ Tổng Hợp Từng Học Sinh</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Theo dõi kết quả trắc nghiệm và tiến độ 2 nhóm bài tập lập trình (Cơ bản & Luyện thi tháng 9)
                      </p>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={overviewSearch}
                          onChange={(e) => setOverviewSearch(e.target.value)}
                          placeholder="Tìm theo tên học sinh..."
                          className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <select
                        value={overviewClassFilter}
                        onChange={(e) => setOverviewClassFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="all">Tất cả lớp ({availableClasses.length})</option>
                        {availableClasses.map((cls) => (
                          <option key={cls} value={cls}>
                            Lớp {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Student Matrix Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700/60">
                        <tr>
                          <th className="py-3.5 px-4">Học sinh</th>
                          <th className="py-3.5 px-3">Lớp</th>
                          <th className="py-3.5 px-3 text-center">Trắc nghiệm</th>
                          <th className="py-3.5 px-4">Cơ bản & Trung bình (33 bài)</th>
                          <th className="py-3.5 px-4">Luyện thi tháng 9 (33 bài)</th>
                          <th className="py-3.5 px-4 text-center">Tổng coding</th>
                          <th className="py-3.5 px-4 text-right">Hoạt động cuối</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/40">
                        {filteredOverviewStudents.length > 0 ? (
                          filteredOverviewStudents.map((s, idx) => {
                            const basicPct = Math.round((s.basicCompletedCount / 33) * 100);
                            const septPct = Math.round((s.septemberCompletedCount / 33) * 100);
                            const totalPct = Math.round((s.totalCodingCompleted / 66) * 100);

                            return (
                              <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => setSelectedStudent({ studentName: s.studentName, className: s.className })}
                                    className="font-semibold text-white hover:text-blue-400 text-left flex items-center gap-1.5 group cursor-pointer transition-colors"
                                    title={`Xem hồ sơ chi tiết học sinh ${s.studentName}`}
                                  >
                                    <span className="underline decoration-slate-600 underline-offset-2 group-hover:decoration-blue-400">
                                      {s.studentName}
                                    </span>
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity shrink-0" />
                                  </button>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                                    {s.className || '—'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {s.highestExamScore !== null ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span
                                        className={`font-black text-xs px-2 py-0.5 rounded-full ${
                                          s.highestExamScore >= 80
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : s.highestExamScore >= 50
                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        }`}
                                      >
                                        {s.highestExamScore} đ
                                      </span>
                                      <span className="text-[10px] text-slate-500 mt-0.5">
                                        ({s.examAttempts} lần thi)
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 text-[11px]">Chưa thi</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 bg-slate-700 h-2 rounded-full overflow-hidden shrink-0">
                                      <div
                                        className="h-full bg-blue-500 rounded-full transition-all"
                                        style={{ width: `${basicPct}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-[11px] font-bold text-slate-200">
                                      {s.basicCompletedCount} / 33
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 bg-slate-700 h-2 rounded-full overflow-hidden shrink-0">
                                      <div
                                        className="h-full bg-amber-500 rounded-full transition-all"
                                        style={{ width: `${septPct}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-[11px] font-bold text-slate-200">
                                      {s.septemberCompletedCount} / 33
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="inline-flex items-center gap-1 font-bold text-emerald-400 font-mono">
                                    {s.totalCodingCompleted} / 66
                                    <span className="text-[10px] text-slate-500 font-normal">
                                      ({totalPct}%)
                                    </span>
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                                  {formatDate(s.lastActiveAt)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500">
                              Chưa có dữ liệu học sinh phù hợp với bộ lọc tìm kiếm.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: KẾT QUẢ TRẮC NGHIỆM (Requirement 6) */}
            {/* ========================================================= */}
            {activeTab === 'exams' && (
              <div className="space-y-4">
                {/* Filter Toolbar */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        id="input-search-exam"
                        type="text"
                        value={examSearch}
                        onChange={(e) => setExamSearch(e.target.value)}
                        placeholder="Tìm theo họ tên học sinh..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Class Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">Lớp:</span>
                      <select
                        id="select-filter-exam-class"
                        value={examClassFilter}
                        onChange={(e) => setExamClassFilter(e.target.value)}
                        className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="all">Tất cả các lớp</option>
                        {availableClasses.map((cls) => (
                          <option key={cls} value={cls}>
                            Lớp {cls}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sắp xếp:</span>
                      <select
                        id="select-sort-exam"
                        value={examSortBy}
                        onChange={(e) => setExamSortBy(e.target.value as any)}
                        className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="date_desc">Ngày nộp: Mới nhất</option>
                        <option value="date_asc">Ngày nộp: Cũ nhất</option>
                        <option value="score_desc">Điểm số: Cao xuống thấp</option>
                        <option value="score_asc">Điểm số: Thấp lên cao</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-medium self-end md:self-auto">
                    Hiển thị: <strong className="text-white">{filteredExamResults.length}</strong> / {examResults.length} lượt thi
                  </div>
                </div>

                {/* Exam Results Table */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700/60">
                        <tr>
                          <th className="py-3.5 px-4">Họ tên</th>
                          <th className="py-3.5 px-3">Lớp</th>
                          <th className="py-3.5 px-3 text-center">Điểm</th>
                          <th className="py-3.5 px-3 text-center text-emerald-400">Số đúng</th>
                          <th className="py-3.5 px-3 text-center text-rose-400">Số sai</th>
                          <th className="py-3.5 px-3 text-center text-slate-400">Bỏ trống</th>
                          <th className="py-3.5 px-3 text-center">Thời gian làm bài</th>
                          <th className="py-3.5 px-4 text-right">Ngày nộp</th>
                          <th className="py-3.5 px-3 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/40">
                        {filteredExamResults.length > 0 ? (
                          filteredExamResults.map((exam, idx) => (
                            <tr key={exam.id || idx} className="hover:bg-slate-700/30 transition-colors">
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => setSelectedStudent({ studentName: exam.student_name, className: exam.class_name || '' })}
                                  className="font-semibold text-white hover:text-blue-400 text-left flex items-center gap-1.5 group cursor-pointer transition-colors"
                                  title={`Xem hồ sơ chi tiết học sinh ${exam.student_name}`}
                                >
                                  <span className="underline decoration-slate-600 underline-offset-2 group-hover:decoration-blue-400">
                                    {exam.student_name}
                                  </span>
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity shrink-0" />
                                </button>
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                                  {exam.class_name || '—'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`inline-block font-black text-xs px-2.5 py-1 rounded-full font-mono ${
                                    exam.score >= 80
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : exam.score >= 50
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {exam.score}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-emerald-400 font-mono">
                                {exam.correct_count}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-rose-400 font-mono">
                                {exam.wrong_count}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-400 font-mono">
                                {exam.blank_count}
                              </td>
                              <td className="py-3 px-3 text-center text-slate-300 font-mono">
                                {formatDuration(exam.duration_seconds)}
                              </td>
                              <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                                {formatDate(exam.submitted_at)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => setSelectedExamDetail(exam)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-700 text-slate-200 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-500">
                              Không tìm thấy kết quả bài thi phù hợp.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: TIẾN ĐỘ LẬP TRÌNH (Requirement 7 & 8) */}
            {/* ========================================================= */}
            {activeTab === 'coding' && (
              <div className="space-y-4">
                {/* Filter Toolbar */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md flex flex-col lg:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-56">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        id="input-search-coding"
                        type="text"
                        value={codingSearch}
                        onChange={(e) => setCodingSearch(e.target.value)}
                        placeholder="Tìm học sinh, mã bài..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Class Filter */}
                    <select
                      id="select-filter-coding-class"
                      value={codingClassFilter}
                      onChange={(e) => setCodingClassFilter(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="all">Tất cả lớp</option>
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          Lớp {cls}
                        </option>
                      ))}
                    </select>

                    {/* Track Filter */}
                    <select
                      id="select-filter-coding-track"
                      value={codingTrackFilter}
                      onChange={(e) => setCodingTrackFilter(e.target.value as any)}
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="all">Tất cả nhóm bài</option>
                      <option value="basic">Cơ bản & Trung bình (basic)</option>
                      <option value="september">Luyện thi tháng 9 (september)</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      id="select-filter-coding-status"
                      value={codingStatusFilter}
                      onChange={(e) => setCodingStatusFilter(e.target.value as any)}
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="completed">Đã hoàn thành</option>
                      <option value="in_progress">Đang làm</option>
                      <option value="not_started">Chưa làm</option>
                    </select>
                  </div>

                  {/* Requirement 8: Latest Only Toggle */}
                  <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={onlyLatestCoding}
                        onChange={(e) => setOnlyLatestCoding(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="font-semibold text-blue-300">
                        Chỉ lấy trạng thái mới nhất
                      </span>
                    </label>

                    <span className="text-xs text-slate-400 font-medium">
                      <strong className="text-white">{filteredCodingList.length}</strong> bản ghi
                    </span>
                  </div>
                </div>

                {/* Coding Progress Table */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700/60">
                        <tr>
                          <th className="py-3.5 px-4">Họ tên</th>
                          <th className="py-3.5 px-3">Lớp</th>
                          <th className="py-3.5 px-3">Track</th>
                          <th className="py-3.5 px-4">Bài toán (Problem ID)</th>
                          <th className="py-3.5 px-3 text-center">Trạng thái (Status)</th>
                          <th className="py-3.5 px-3">Started At</th>
                          <th className="py-3.5 px-3">Completed At</th>
                          <th className="py-3.5 px-4 text-right">Updated At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/40">
                        {filteredCodingList.length > 0 ? (
                          filteredCodingList.map((item, idx) => {
                            const title = problemTitles.get(`${item.track}__${item.problem_id}`) || '';

                            return (
                              <tr key={item.id || (item as any).dedupKey || idx} className="hover:bg-slate-700/30 transition-colors">
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => setSelectedStudent({ studentName: item.student_name, className: item.class_name || '' })}
                                    className="font-semibold text-white hover:text-blue-400 text-left flex items-center gap-1.5 group cursor-pointer transition-colors"
                                    title={`Xem hồ sơ chi tiết học sinh ${item.student_name}`}
                                  >
                                    <span className="underline decoration-slate-600 underline-offset-2 group-hover:decoration-blue-400">
                                      {item.student_name}
                                    </span>
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity shrink-0" />
                                  </button>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                                    {item.class_name || '—'}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  {item.track === 'basic' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                      <BookOpen className="w-3 h-3" />
                                      Cơ bản & Trung bình
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                      <Sparkles className="w-3 h-3" />
                                      Luyện thi tháng 9
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-mono font-bold text-white text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                                      {item.problem_id}
                                    </span>
                                    {title && (
                                      <span className="text-slate-300 text-xs truncate max-w-xs" title={title}>
                                        {title}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {item.status === 'completed' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Đã hoàn thành
                                    </span>
                                  )}
                                  {item.status === 'in_progress' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      <Clock className="w-3 h-3" />
                                      Đang làm
                                    </span>
                                  )}
                                  {item.status === 'not_started' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700 text-slate-300">
                                      Chưa làm
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                                  {formatDate(item.started_at)}
                                </td>
                                <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                                  {formatDate(item.completed_at)}
                                </td>
                                <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                                  {formatDate(item.updated_at || item.created_at)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-500">
                              Không tìm thấy tiến độ lập trình phù hợp.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Exam Detail Modal (Breakdown by 10 topics) */}
      {selectedExamDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-blue-400" />
                  <span>Chi Tiết Bài Thi: {selectedExamDetail.student_name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Lớp: <strong className="text-white">{selectedExamDetail.class_name || '—'}</strong> • Nộp lúc:{' '}
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

            <div className="p-6 space-y-6">
              {/* Stat overview */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-slate-400 mb-1">Điểm số</div>
                  <div className="text-2xl font-black text-blue-400 font-mono">
                    {selectedExamDetail.score}
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

              {/* 10 Topic breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Kết quả theo 10 chuyên đề câu hỏi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'CĐ 1: Biến và kiểu dữ liệu', score: selectedExamDetail.topic_1_score },
                    { label: 'CĐ 2: Toán tử số học', score: selectedExamDetail.topic_2_score },
                    { label: 'CĐ 3: So sánh và logic', score: selectedExamDetail.topic_3_score },
                    { label: 'CĐ 4: Nhập/Xuất input/print', score: selectedExamDetail.topic_4_score },
                    { label: 'CĐ 5: Rẽ nhánh if-elif-else', score: selectedExamDetail.topic_5_score },
                    { label: 'CĐ 6: Vòng lặp for', score: selectedExamDetail.topic_6_score },
                    { label: 'CĐ 7: Vòng lặp while', score: selectedExamDetail.topic_7_score },
                    { label: 'CĐ 8: Chuỗi (string)', score: selectedExamDetail.topic_8_score },
                    { label: 'CĐ 9: List cơ bản', score: selectedExamDetail.topic_9_score },
                    { label: 'CĐ 10: Hàm (function)', score: selectedExamDetail.topic_10_score },
                  ].map((topic, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50 flex items-center justify-between"
                    >
                      <span className="text-slate-300 font-medium truncate mr-2">{topic.label}</span>
                      <span className="font-mono font-bold text-white shrink-0">
                        {topic.score !== undefined ? `${topic.score} / 10` : '—'}
                      </span>
                    </div>
                  ))}
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
    </div>
  );
};
