import { apiRequest, buildSearchParams } from './base';

// 用户相关 API
export class UserAPI {
  // 获取用户列表（增强版）
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    username?: string;
    email?: string;
    phone?: string;
    roleId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    tenantId?: number;
    organizationId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(`/users${searchParams ? `?${searchParams}` : ''}`);
  }

  // 获取用户详情（包含完整信息）
  static async getUser(id: number, include?: ('roles' | 'permissions' | 'organizations' | 'sessions')[]) {
    const searchParams = include ? buildSearchParams({ include: include.join(',') }) : '';
    return apiRequest(`/users/${id}${searchParams ? `?${searchParams}` : ''}`);
  }

  // 创建用户（增强版）
  static async createUser(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    realName?: string;
    roleId: number;
    tenantId?: number;
    organizationIds?: number[];
    status?: 'active' | 'inactive' | 'locked';
    metadata?: Record<string, any>;
    sendWelcomeEmail?: boolean;
  }) {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // 更新用户（增强版）
  static async updateUser(id: number, userData: {
    username?: string;
    email?: string;
    phone?: string;
    realName?: string;
    roleId?: number;
    status?: 'active' | 'inactive' | 'locked';
    metadata?: Record<string, any>;
    organizationIds?: number[];
  }) {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // 删除用户（软删除）
  static async deleteUser(id: number, reason?: string) {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
  }

  // 批量操作用户
  static async batchOperateUsers(operation: 'activate' | 'deactivate' | 'delete' | 'assignRole' | 'removeRole', userIds: number[], data?: any) {
    return apiRequest('/users/batch', {
      method: 'POST',
      body: JSON.stringify({ operation, userIds, data })
    });
  }

  // 重置用户密码
  static async resetPassword(id: number, newPassword: string, sendEmail?: boolean) {
    return apiRequest(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword, sendEmail })
    });
  }

  // 修改用户状态
  static async changeUserStatus(id: number, status: 'active' | 'inactive' | 'locked', reason?: string) {
    return apiRequest(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason })
    });
  }

  // 获取用户权限
  static async getUserPermissions(id: number) {
    return apiRequest(`/users/${id}/permissions`);
  }

  // 获取用户组织信息
  static async getUserOrganizations(id: number) {
    return apiRequest(`/users/${id}/organizations`);
  }

  // 设置用户组织
  static async setUserOrganizations(id: number, organizationIds: number[], mainOrganizationId?: number) {
    return apiRequest(`/users/${id}/organizations`, {
      method: 'PUT',
      body: JSON.stringify({ organizationIds, mainOrganizationId })
    });
  }

  // 获取用户活动日志
  static async getUserActivityLogs(id: number, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
  }) {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(`/users/${id}/activity-logs${searchParams ? `?${searchParams}` : ''}`);
  }

  // 获取用户会话
  static async getUserSessions(id: number) {
    return apiRequest(`/users/${id}/sessions`);
  }

  // 终止用户会话
  static async terminateUserSession(userId: number, sessionId: string) {
    return apiRequest(`/users/${userId}/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  }

  // 终止用户所有会话
  static async terminateAllUserSessions(id: number, excludeCurrent?: boolean) {
    return apiRequest(`/users/${id}/sessions`, {
      method: 'DELETE',
      body: JSON.stringify({ excludeCurrent })
    });
  }

  // 导出用户数据
  static async exportUsers(params?: {
    format?: 'csv' | 'excel' | 'json';
    filters?: any;
    fields?: string[];
  }) {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(`/users/export${searchParams ? `?${searchParams}` : ''}`);
  }

  // 导入用户数据
  static async importUsers(file: File, options?: {
    skipDuplicates?: boolean;
    sendWelcomeEmail?: boolean;
    defaultRoleId?: number;
    defaultStatus?: string;
  }) {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return apiRequest('/users/import', {
      method: 'POST',
      body: formData,
      headers: {} // 让浏览器自动设置 Content-Type
    });
  }

  // 检查用户名可用性
  static async checkUsernameAvailability(username: string, excludeId?: number) {
    const searchParams = buildSearchParams({ username, excludeId });
    return apiRequest(`/users/check-username${searchParams ? `?${searchParams}` : ''}`);
  }

  // 检查邮箱可用性
  static async checkEmailAvailability(email: string, excludeId?: number) {
    const searchParams = buildSearchParams({ email, excludeId });
    return apiRequest(`/users/check-email${searchParams ? `?${searchParams}` : ''}`);
  }

  // 获取用户统计信息
  static async getUserStatistics(tenantId?: number) {
    const searchParams = tenantId ? buildSearchParams({ tenantId }) : '';
    return apiRequest(`/users/statistics${searchParams ? `?${searchParams}` : ''}`);
  }

  // 影子账号 - 模拟用户
  static async impersonateUser(targetUserId: number) {
    return apiRequest('/users/impersonate', {
      method: 'POST',
      body: JSON.stringify({ targetUserId })
    });
  }

  // 停止影子账号模拟
  static async stopImpersonation() {
    return apiRequest('/users/stop-impersonation', {
      method: 'POST'
    });
  }

  // 搜索用户（用于分配等场景）
  static async searchUsers(query: string, limit?: number, tenantId?: number) {
    const searchParams = buildSearchParams({ query, limit, tenantId });
    return apiRequest(`/users/search${searchParams ? `?${searchParams}` : ''}`);
  }
}
