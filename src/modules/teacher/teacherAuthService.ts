import { supabase } from '../../lib/supabase';
import { TeacherUser } from './types';

export async function getCurrentTeacher(): Promise<TeacherUser | null> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return null;
    }

    const { data: teacher, error: teacherError } = await supabase
      .from('teacher_accounts')
      .select('user_id, display_name')
      .eq('user_id', session.user.id)
      .single();

    if (teacherError || !teacher) {
      // Authenticated with Supabase, but not authorized as a teacher
      await supabase.auth.signOut();
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      displayName: teacher.display_name || session.user.email || 'Giáo viên',
    };
  } catch {
    return null;
  }
}

export async function signInTeacher(email: string, password: string): Promise<TeacherUser> {
  const cleanEmail = email.trim();
  const cleanPassword = password;

  if (!cleanEmail || !cleanPassword) {
    throw new Error('Vui lòng nhập đầy đủ email và mật khẩu.');
  }

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword,
  });

  if (authError || !data.user) {
    // Friendly error handling
    if (authError?.message?.includes('Invalid login credentials')) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    } else if (authError?.message?.includes('Email not confirmed')) {
      throw new Error('Email chưa được xác thực.');
    } else {
      throw new Error(authError?.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
    }
  }

  // Check teacher_accounts table
  const { data: teacher, error: teacherError } = await supabase
    .from('teacher_accounts')
    .select('user_id, display_name')
    .eq('user_id', data.user.id)
    .single();

  if (teacherError || !teacher) {
    // User is logged in to Supabase, but NOT a registered teacher
    await supabase.auth.signOut();
    throw new Error('Tài khoản này không có quyền giáo viên.');
  }

  return {
    id: data.user.id,
    email: data.user.email,
    displayName: teacher.display_name || data.user.email || 'Giáo viên',
  };
}

export async function signOutTeacher(): Promise<void> {
  await supabase.auth.signOut();
}
