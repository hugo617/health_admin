import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  preventSuperAdminDisable
} from '@/lib/super-admin';
import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  notFoundResponse
} from '@/service/response';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('状态修改', currentUser?.id);

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // 获取要修改状态的用户信息
    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!targetUser.length) {
      await logger.warn('修改状态', '修改状态失败：用户不存在', {
        targetUserId: id,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return notFoundResponse('用户不存在');
    }

    const body = await request.json();
    const { status, reason } = body;

    if (!status || !['active', 'inactive', 'locked'].includes(status)) {
      return errorResponse('无效的状态值');
    }

    // 检查是否尝试禁用超级管理员
    await preventSuperAdminDisable(id, status as 'active' | 'inactive' | 'locked');

    // 更新用户状态
    await db
      .update(users)
      .set({
        status: status as 'active' | 'inactive' | 'locked',
        updatedAt: new Date(),
        updatedBy: currentUser?.id
      })
      .where(eq(users.id, id));

    // 记录状态变更日志
    const statusLabels = {
      active: '正常',
      inactive: '禁用',
      locked: '锁定'
    };

    await logger.info('修改状态', '用户状态修改成功', {
      targetUserId: id,
      targetUsername: targetUser[0].username,
      oldStatus: targetUser[0].status,
      newStatus: status,
      oldStatusLabel: statusLabels[targetUser[0].status as keyof typeof statusLabels] || targetUser[0].status,
      newStatusLabel: statusLabels[status as keyof typeof statusLabels],
      reason,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse({
      message: '用户状态修改成功',
      userId: id,
      oldStatus: targetUser[0].status,
      newStatus: status
    });
  } catch (error) {
    await logger.error('修改状态', '修改状态失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return errorResponse((error as Error)?.message || '修改状态失败');
  }
}