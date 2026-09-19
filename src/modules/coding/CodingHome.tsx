/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { septemberCodingProblems } from '../../data/septemberCodingProblems';
import { basicCodingProblems } from '../../data/basicCodingProblems';
import { CodingProblem, ProblemStatus } from '../../types';
import { saveCodingProgress } from '../../services/codingProgress';
import { ProblemDetail } from './ProblemDetail';
import { ProblemListView } from './ProblemListView';
import {
  getGroupProblemStatuses,
  setGroupProblemStatus,
  getCodingStudentInfo,
  saveCodingStudentInfo,
  CodingStudentInfo,
  CodingGroupType,
} from '../../utils/codingStorage';
import {
  Code,
  ArrowLeft,
  BookOpen,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Terminal,
  Layers,
  Sparkles,
  User,
} from 'lucide-react';

export type CodingViewMode =
  | 'coding-home'
  | 'basic-list'
  | 'basic-detail'
  | 'september-list'
  | 'september-detail';

interface CodingHomeProps {
  onBackToHome: () => void;
}

export const CodingHome: React.FC<CodingHomeProps> = ({ onBackToHome }) => {
  const [view, setView] = useState<CodingViewMode>('coding-home');
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);

  // Student Info state
  const [studentInfo, setStudentInfo] = useState<CodingStudentInfo | null>(() => {
    return getCodingStudentInfo();
  });
  const [showStudentModal, setShowStudentModal] = useState<boolean>(() => {
    const existing = getCodingStudentInfo();
    return !existing || !existing.fullName.trim();
  });
  const [studentFormName, setStudentFormName] = useState<string>(studentInfo?.fullName || '');
  const [studentFormClass, setStudentFormClass] = useState<string>(studentInfo?.className || '');
  const [studentFormError, setStudentFormError] = useState<string | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    track: CodingGroupType;
    problemId: string;
    newStatus: ProblemStatus;
  } | null>(null);

  // Independent state for each group
  const [basicStatuses, setBasicStatuses] = useState<Record<string, ProblemStatus>>(() => {
    return getGroupProblemStatuses('basic');
  });

  const [septemberStatuses, setSeptemberStatuses] = useState<Record<string, ProblemStatus>>(() => {
    return getGroupProblemStatuses('september');
  });

  // Calculate statistics for Basic group
  const basicTotal = basicCodingProblems.length;
  const basicCompleted = basicCodingProblems.filter(
    (p) => basicStatuses[p.code || p.id] === 'completed'
  ).length;
  const basicInProgress = basicCodingProblems.filter(
    (p) => basicStatuses[p.code || p.id] === 'in_progress'
  ).length;
  const basicPercent = basicTotal > 0 ? Math.round((basicCompleted / basicTotal) * 100) : 0;

  // Calculate statistics for September group
  const septemberTotal = septemberCodingProblems.length;
  const septemberCompleted = septemberCodingProblems.filter(
    (p) => septemberStatuses[p.id] === 'completed'
  ).length;
  const septemberInProgress = septemberCodingProblems.filter(
    (p) => septemberStatuses[p.id] === 'in_progress'
  ).length;
  const septemberPercent =
    septemberTotal > 0 ? Math.round((septemberCompleted / septemberTotal) * 100) : 0;

  // Total combined progress
  const totalProblemsCount = basicTotal + septemberTotal; // 33 + 33 = 66
  const totalCompletedCount = basicCompleted + septemberCompleted;

  // Save student info from modal
  const handleSaveStudentInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormName.trim()) {
      setStudentFormError('Vui lòng nhập họ và tên học sinh.');
      return;
    }
    const newInfo: CodingStudentInfo = {
      fullName: studentFormName.trim(),
      className: studentFormClass.trim(),
    };
    saveCodingStudentInfo(newInfo);
    setStudentInfo(newInfo);
    setShowStudentModal(false);
    setStudentFormError(null);

    // If there was a pending update waiting for student info, run it
    if (pendingStatusUpdate) {
      const pending = pendingStatusUpdate;
      setPendingStatusUpdate(null);
      handleUpdateProblemStatus(pending.track, pending.problemId, pending.newStatus, newInfo);
    }
  };

  // Unified status update handler connected to Supabase
  const handleUpdateProblemStatus = async (
    track: CodingGroupType,
    problemId: string,
    newStatus: ProblemStatus,
    overrideStudentInfo?: CodingStudentInfo
  ) => {
    const activeStudent = overrideStudentInfo || studentInfo;
    if (!activeStudent || !activeStudent.fullName.trim()) {
      setPendingStatusUpdate({ track, problemId, newStatus });
      setShowStudentModal(true);
      return;
    }

    if (isSyncing) return;
    setIsSyncing(true);

    // 1. Immediately update localStorage for instant UX
    const updatedRecord = setGroupProblemStatus(track, problemId, newStatus);
    if (track === 'basic') {
      setBasicStatuses((prev) => ({
        ...prev,
        [problemId]: newStatus,
      }));
    } else {
      setSeptemberStatuses((prev) => ({
        ...prev,
        [problemId]: newStatus,
      }));
    }

    // 2. Prepare timestamps according to requirement 3 and 4:
    // - in_progress: started_at = existing startedAt or now, completed_at = null
    // - completed: started_at = existing startedAt or now, completed_at = existing completedAt or now
    // - not_started: started_at = null, completed_at = null
    let startedAtISO: string | null = null;
    let completedAtISO: string | null = null;

    if (newStatus === 'in_progress') {
      startedAtISO = updatedRecord.startedAt
        ? new Date(updatedRecord.startedAt).toISOString()
        : new Date().toISOString();
      completedAtISO = null;
    } else if (newStatus === 'completed') {
      startedAtISO = updatedRecord.startedAt
        ? new Date(updatedRecord.startedAt).toISOString()
        : new Date().toISOString();
      completedAtISO = updatedRecord.completedAt
        ? new Date(updatedRecord.completedAt).toISOString()
        : new Date().toISOString();
    }

    // 3. Call Supabase saveCodingProgress
    try {
      await saveCodingProgress({
        student_name: activeStudent.fullName.trim(),
        class_name: activeStudent.className?.trim() || null,
        track,
        problem_id: problemId,
        status: newStatus,
        started_at: startedAtISO,
        completed_at: completedAtISO,
      });
    } catch (err) {
      console.warn('Supabase sync error (tiến độ vẫn lưu trên thiết bị):', err);
      // Requirement 7: KHÔNG rollback localStorage, hiển thị thông báo nhẹ
      setSyncNotification('Tiến độ đã được lưu trên thiết bị nhưng chưa đồng bộ lên hệ thống.');
      setTimeout(() => {
        setSyncNotification(null);
      }, 4500);
    } finally {
      setIsSyncing(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW: Basic Detail
  // -------------------------------------------------------------
  if (view === 'basic-detail' && selectedProblem) {
    const code = selectedProblem.code || selectedProblem.id;
    const status = basicStatuses[code] || 'not_started';
    return (
      <ProblemDetail
        problem={selectedProblem}
        status={status}
        track="basic"
        groupBadge="CƠ BẢN / TRUNG BÌNH"
        isSyncing={isSyncing}
        syncNotification={syncNotification}
        studentName={studentInfo?.fullName}
        studentInfo={studentInfo}
        onBack={() => {
          setSelectedProblem(null);
          setView('basic-list');
        }}
        onUpdateStatus={(probCode, newStatus) =>
          handleUpdateProblemStatus('basic', probCode, newStatus)
        }
        onRequestStudentInfo={() => setShowStudentModal(true)}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW: September Detail
  // -------------------------------------------------------------
  if (view === 'september-detail' && selectedProblem) {
    const septemberProblem =
      septemberCodingProblems.find((p) => p.id === selectedProblem.id) || selectedProblem;
    const code = septemberProblem.id;
    const status = septemberStatuses[code] || 'not_started';
    return (
      <ProblemDetail
        problem={septemberProblem}
        status={status}
        track="september"
        groupBadge="LUYỆN THI THÁNG 9"
        isSyncing={isSyncing}
        syncNotification={syncNotification}
        studentName={studentInfo?.fullName}
        studentInfo={studentInfo}
        onBack={() => {
          setSelectedProblem(null);
          setView('september-list');
        }}
        onUpdateStatus={(probCode, newStatus) =>
          handleUpdateProblemStatus('september', probCode, newStatus)
        }
        onRequestStudentInfo={() => setShowStudentModal(true)}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW: Basic List
  // -------------------------------------------------------------
  if (view === 'basic-list') {
    return (
      <ProblemListView
        problems={basicCodingProblems}
        statuses={basicStatuses}
        groupType="basic"
        groupTitle="LUYỆN TẬP CƠ BẢN & TRUNG BÌNH"
        groupBadge="CƠ BẢN / TRUNG BÌNH"
        groupSubtitle="33 bài luyện kỹ năng nền tảng và vận dụng, rèn luyện cấu trúc điều kiện, vòng lặp, xử lý xâu và mảng."
        onSelectProblem={(problem) => {
          setSelectedProblem(problem);
          setView('basic-detail');
        }}
        onBackToSelection={() => setView('coding-home')}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW: September List
  // -------------------------------------------------------------
  if (view === 'september-list') {
    return (
      <ProblemListView
        problems={septemberCodingProblems}
        statuses={septemberStatuses}
        groupType="september"
        groupTitle="LUYỆN THI THÁNG 9"
        groupBadge="LUYỆN THI THÁNG 9"
        groupSubtitle="33 bài luyện tư duy và thuật toán theo định dạng Tin học trẻ (Python / C++, vào ra chuẩn stdin / stdout)."
        onSelectProblem={(problem) => {
          setSelectedProblem(problem);
          setView('september-detail');
        }}
        onBackToSelection={() => setView('coding-home')}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW: Selection Screen ('coding-home')
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            id="btn-coding-home-back"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>QUAY VỀ TRANG CHỦ</span>
          </button>

          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-900 text-sm sm:text-base">
              LUYỆN TẬP LẬP TRÌNH
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Student info indicator */}
            {studentInfo?.fullName ? (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-800">
                  {studentInfo.fullName}
                  {studentInfo.className ? ` (${studentInfo.className})` : ''}
                </span>
                <button
                  id="btn-edit-student-info"
                  onClick={() => {
                    setStudentFormName(studentInfo.fullName);
                    setStudentFormClass(studentInfo.className || '');
                    setShowStudentModal(true);
                  }}
                  title="Đổi thông tin học sinh"
                  className="text-[11px] text-blue-600 hover:text-blue-800 underline cursor-pointer ml-1 font-medium"
                >
                  Đổi
                </button>
              </div>
            ) : (
              <button
                id="btn-open-student-modal"
                onClick={() => setShowStudentModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Nhập tên học sinh</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Tổng hoàn thành:{' '}
                <strong className="text-slate-900 font-bold">
                  {totalCompletedCount} / {totalProblemsCount} bài
                </strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col justify-center">
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <Layers className="w-3.5 h-3.5" />
            PHÂN LOẠI CẤP ĐỘ HỌC TẬP
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Chọn nội dung luyện tập
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Hệ thống cung cấp 2 khu vực luyện tập độc lập với tổng cộng 66 bài toán chất lượng cao, phục vụ từ rèn luyện kỹ năng căn bản đến ôn luyện Tin học trẻ.
          </p>
        </div>

        {/* 2 Big Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CARD 1: LUYỆN TẬP CƠ BẢN & TRUNG BÌNH */}
          <div
            id="card-group-basic"
            className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  <BookOpen className="w-3.5 h-3.5" />
                  CƠ BẢN / TRUNG BÌNH
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">
                  33 bài
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                LUYỆN TẬP CƠ BẢN & TRUNG BÌNH
              </h2>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                33 bài luyện kỹ năng nền tảng và vận dụng.
              </p>

              {/* Feature Badges */}
              <div className="mt-5 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>
                    Số lượng bài: <strong className="font-semibold text-slate-900">33 bài</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>
                    Mức độ:{' '}
                    <strong className="font-semibold text-slate-900">
                      Dễ → Trung bình
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>
                    Nội dung: Nhập xuất, toán tử, rẽ nhánh if/else, vòng lặp for/while, danh sách
                  </span>
                </div>
              </div>

              {/* Progress Bar for Group 1 */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Tiến độ nhóm Cơ bản:</span>
                  <span className="font-bold text-slate-900">
                    {basicCompleted} / {basicTotal} bài ({basicPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${basicPercent}%` }}
                  />
                </div>
                {basicInProgress > 0 && (
                  <div className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{basicInProgress} bài đang làm</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                id="btn-enter-basic"
                onClick={() => setView('basic-list')}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>VÀO LUYỆN TẬP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARD 2: LUYỆN THI THÁNG 9 */}
          <div
            id="card-group-september"
            className="bg-white rounded-2xl border-2 border-amber-300 hover:border-amber-500 p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden ring-1 ring-amber-200"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  LUYỆN THI THÁNG 9
                </span>
                <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                  33 bài
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                LUYỆN THI THÁNG 9
              </h2>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                33 bài luyện tư duy và thuật toán theo định dạng Tin học trẻ.
              </p>

              {/* Feature Badges */}
              <div className="mt-5 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>
                    Số lượng bài: <strong className="font-semibold text-slate-900">33 bài</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>
                    Ngôn ngữ:{' '}
                    <strong className="font-semibold text-slate-900">
                      Python / C++
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>
                    Giao tiếp:{' '}
                    <strong className="font-semibold text-slate-900">
                      stdin / stdout
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>
                    Mức độ: Vận dụng & Vận dụng cao (Số hoàn thiện, RLE, Bản đồ mìn...)
                  </span>
                </div>
              </div>

              {/* Progress Bar for Group 2 */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Tiến độ Luyện thi:</span>
                  <span className="font-bold text-slate-900">
                    {septemberCompleted} / {septemberTotal} bài ({septemberPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${septemberPercent}%` }}
                  />
                </div>
                {septemberInProgress > 0 && (
                  <div className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{septemberInProgress} bài đang làm</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                id="btn-enter-september"
                onClick={() => setView('september-list')}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:scale-[0.99] text-white shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>VÀO LUYỆN THI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Global summary badge at bottom */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs text-slate-600 shadow-xs">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Cơ bản: <strong>{basicCompleted}/33</strong></span>
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Luyện thi: <strong>{septemberCompleted}/33</strong></span>
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tổng cộng: <strong>{totalCompletedCount}/66 bài</strong></span>
            </span>
          </div>
        </div>
      </main>

      {/* Student Info Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Thông tin người học
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập thông tin để hệ thống ghi nhận tiến độ lập trình
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveStudentInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-student-fullname"
                  type="text"
                  value={studentFormName}
                  onChange={(e) => {
                    setStudentFormName(e.target.value);
                    if (studentFormError) setStudentFormError(null);
                  }}
                  placeholder="Ví dụ: Nguyễn Trường Giang"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                  autoFocus
                />
                {studentFormError && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{studentFormError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lớp <span className="text-slate-400 font-normal lowercase">(không bắt buộc)</span>
                </label>
                <input
                  id="input-student-class"
                  type="text"
                  value={studentFormClass}
                  onChange={(e) => setStudentFormClass(e.target.value)}
                  placeholder="Ví dụ: 9A2"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                {studentInfo?.fullName && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowStudentModal(false);
                      setStudentFormError(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                )}
                <button
                  type="submit"
                  id="btn-submit-student-info"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Xác nhận & Bắt đầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync Warning Toast if any */}
      {syncNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{syncNotification}</span>
        </div>
      )}
    </div>
  );
};
