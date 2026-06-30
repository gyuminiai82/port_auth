'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('인증 필요');
      const data = await res.json();
      setUser(data.user);
      setEditName(data.user.name || '');
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) throw new Error('수정 실패');
      setUser(prev => prev ? { ...prev, name: editName } : null);
      setIsEditing(false);
      showToast('✅ 프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      showToast('❌ 업데이트 중 오류가 발생했습니다.');
    }
  };

  const executeLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      showToast('❌ 로그아웃 실패');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-[#0f0c29] to-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 p-8">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            내 프로필
          </h1>
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm underline-offset-4 hover:underline">
            ← 메인으로
          </Link>
        </div>

        {user && (
          <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-sm text-gray-400 mb-1">이메일 (변경 불가)</p>
              <p className="text-lg font-medium text-white">{user.email}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-400">이름</p>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-xs text-purple-400 hover:text-purple-300">
                    수정하기
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleUpdate} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm transition-colors shadow-lg shadow-purple-500/30">
                    저장
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                    취소
                  </button>
                </form>
              ) : (
                <p className="text-lg font-medium text-white">{user.name}</p>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 mt-8">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-200 rounded-xl font-semibold transition-all active:scale-95"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            {toastMessage}
          </div>
        </div>
      )}

      {/* 로그아웃 확인 모달 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center transform animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">로그아웃</h3>
            <p className="text-gray-300 mb-6">정말 로그아웃 하시겠습니까?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-all active:scale-95"
              >
                취소
              </button>
              <button
                onClick={executeLogout}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-red-500/30"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
