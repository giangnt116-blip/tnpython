import React, { useState, useEffect } from 'react';
import { TeacherUser } from './types';
import { getCurrentTeacher } from './teacherAuthService';
import { TeacherLogin } from './TeacherLogin';
import { TeacherDashboard } from './TeacherDashboard';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface TeacherModuleProps {
  onBackToHome: () => void;
}

export const TeacherModule: React.FC<TeacherModuleProps> = ({ onBackToHome }) => {
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [currentTeacher, setCurrentTeacher] = useState<TeacherUser | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check Supabase session & teacher_accounts on mount
  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      setAuthChecking(true);
      try {
        const teacher = await getCurrentTeacher();
        if (isMounted) {
          setCurrentTeacher(teacher);
        }
      } catch {
        if (isMounted) {
          setCurrentTeacher(null);
        }
      } finally {
        if (isMounted) {
          setAuthChecking(false);
        }
      }
    }

    verifyAuth();

    // Listen to Supabase auth events (e.g. sign in, sign out)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setCurrentTeacher(null);
          setAuthChecking(false);
        }
      } else if (event === 'SIGNED_IN') {
        const teacher = await getCurrentTeacher();
        if (isMounted) {
          setCurrentTeacher(teacher);
          setAuthChecking(false);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Đang kiểm tra quyền giáo viên...</span>
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated or not authorized, render TeacherLogin
  if (!currentTeacher) {
    return (
      <TeacherLogin
        onLoginSuccess={(teacher) => {
          setCurrentTeacher(teacher);
          setLoginError(null);
        }}
        onBackToHome={onBackToHome}
        initialError={loginError}
      />
    );
  }

  // If authenticated as a verified teacher, render TeacherDashboard
  return (
    <TeacherDashboard
      teacher={currentTeacher}
      onSignOut={() => {
        setCurrentTeacher(null);
      }}
      onBackToHome={onBackToHome}
    />
  );
};
