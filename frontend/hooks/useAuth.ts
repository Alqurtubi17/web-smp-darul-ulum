'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Helper hook yang wrap useSession agar mudah dipakai di komponen
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as any;
  const role = user?.role as string | undefined;

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  return {
    user,
    session,
    role,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    logout,
    isAdmin: ['SUPER_ADMIN', 'ADMIN'].includes(role || ''),
    isGuru: ['SUPER_ADMIN', 'ADMIN', 'GURU'].includes(role || ''),
    isSiswa: role === 'SISWA',
    isOrangTua: role === 'ORANG_TUA',
    student: user?.student,
    teacher: user?.teacher,
    parent: user?.parent,
  };
}
