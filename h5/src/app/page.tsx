'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const authManager = AuthManager.getInstance();
  const [authState, setAuthState] = useState(authManager.getAuthState());

  useEffect(() => {
    // 检查是否已登录
    if (!authManager.requireAuth()) {
      return;
    }

    setAuthState(authManager.getAuthState());
  }, [router]);

  const handleLogout = () => {
    authManager.clearAuthState();
    router.push('/login');
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在验证身份...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">N-Admin H5</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            欢迎来到N-Admin移动端
          </h2>
          <p className="text-gray-600 mb-2">
            欢迎回来，{authState.user?.email}
          </p>
          <p className="text-sm text-gray-500">
            用户ID: {authState.user?.id}
          </p>
        </div>

        {/* 功能区域 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-medium text-gray-900 mb-1">数据统计</h3>
            <p className="text-sm text-gray-500">查看详细数据</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-medium text-gray-900 mb-1">用户管理</h3>
            <p className="text-sm text-gray-500">管理系统用户</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">🏢</div>
            <h3 className="font-medium text-gray-900 mb-1">租户管理</h3>
            <p className="text-sm text-gray-500">管理租户信息</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-medium text-gray-900 mb-1">系统设置</h3>
            <p className="text-sm text-gray-500">配置系统参数</p>
          </div>
        </div>

        {/* 快捷链接 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-medium text-gray-900 mb-4">快捷链接</h3>
          <div className="space-y-3">
            <Link href="/profile" className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
              <span className="text-gray-700">个人资料</span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link href="/help" className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
              <span className="text-gray-700">帮助中心</span>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}