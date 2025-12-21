import { db } from '@/db';
import { users, userOrganizations } from '@/db/schema';
import { eq, inArray, and, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import {
  preventSuperAdminModification,
  preventSuperAdminDisable
} from '@/lib/super-admin';
import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';

export async function POST(request: Request) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('用户批量操作', currentUser?.id);

  try {
    const body = await request.json();
    const { operation, userIds, data } = body;

    if (!operation || !Array.isArray(userIds) || userIds.length === 0) {
      return errorResponse('操作参数无效');
    }

    // 记录操作开始
    await logger.info('批量操作', `开始执行${operation}操作`, {
      operation,
      userIds,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    let result;

    switch (operation) {
      case 'activate':
        result = await batchUpdateStatus(userIds, 'active', currentUser?.id, logger);
        break;

      case 'deactivate':
        result = await batchUpdateStatus(userIds, 'inactive', currentUser?.id, logger);
        break;

      case 'delete':
        result = await batchDeleteUsers(userIds, currentUser?.id, logger);
        break;

      case 'assignRole':
        if (!data?.roleId) {
          return errorResponse('缺少角色ID');
        }
        result = await batchAssignRole(userIds, data.roleId, currentUser?.id, logger);
        break;

      case 'removeRole':
        result = await batchRemoveRole(userIds, currentUser?.id, logger);
        break;

      default:
        return errorResponse('不支持的操作类型');
    }

    return successResponse({
      message: `${operation}操作完成`,
      result
    });
  } catch (error) {
    await logger.error('批量操作', '批量操作失败', {
      error: error instanceof Error ? error.message : String(error),
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    console.error('批量操作失败:', error);
    return errorResponse('批量操作失败');
  }
}

// 批量更新用户状态
async function batchUpdateStatus(
  userIds: number[],
  status: string,
  operatorId?: number,
  logger?: Logger
) {
  // 对于禁用操作，需要检查超级管理员保护
  if (status === 'inactive' || status === 'locked') {
    for (const userId of userIds) {
      await preventSuperAdminDisable(userId, status);
    }
  }

  const result = await db
    .update(users)
    .set({
      status,
      updatedBy: operatorId
    })
    .where(inArray(users.id, userIds))
    .returning({ id: users.id });

  await logger?.info('批量更新状态', `成功更新${result.length}个用户状态`, {
    status,
    updatedUserIds: result.map(u => u.id),
    operatorId
  });

  return {
    updated: result.length,
    failed: userIds.length - result.length
  };
}

// 批量删除用户（软删除）
async function batchDeleteUsers(
  userIds: number[],
  operatorId?: number,
  logger?: Logger
) {
  // 检查超级管理员保护
  for (const userId of userIds) {
    await preventSuperAdminModification(userId);
  }

  const result = await db
    .update(users)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      updatedBy: operatorId
    })
    .where(inArray(users.id, userIds))
    .returning({ id: users.id });

  await logger?.warn('批量删除用户', `成功删除${result.length}个用户`, {
    deletedUserIds: result.map(u => u.id),
    operatorId
  });

  return {
    deleted: result.length,
    failed: userIds.length - result.length
  };
}

// 批量分配角色
async function batchAssignRole(
  userIds: number[],
  roleId: number,
  operatorId?: number,
  logger?: Logger
) {
  const result = await db
    .update(users)
    .set({
      roleId,
      updatedBy: operatorId
    })
    .where(inArray(users.id, userIds))
    .returning({ id: users.id });

  await logger?.info('批量分配角色', `成功为${result.length}个用户分配角色`, {
    roleId,
    updatedUserIds: result.map(u => u.id),
    operatorId
  });

  return {
    updated: result.length,
    failed: userIds.length - result.length
  };
}

// 批量移除角色
async function batchRemoveRole(
  userIds: number[],
  operatorId?: number,
  logger?: Logger
) {
  // 这里假设有一个默认角色ID
  const defaultRoleId = 2; // 或者从系统设置中获取

  const result = await db
    .update(users)
    .set({
      roleId: defaultRoleId,
      updatedBy: operatorId
    })
    .where(inArray(users.id, userIds))
    .returning({ id: users.id });

  await logger?.info('批量移除角色', `成功为${result.length}个用户移除角色`, {
    updatedUserIds: result.map(u => u.id),
    operatorId
  });

  return {
    updated: result.length,
    failed: userIds.length - result.length
  };
}