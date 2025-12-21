import { db } from '@/db';
import { userSessions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/service/response';

// 获取用户会话列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getCurrentUser(request);
    const { id: idStr } = await params;
    const userId = parseInt(idStr);

    // 检查权限：用户只能查看自己的会话，管理员可以查看所有用户的会话
    if (currentUser?.id !== userId && !currentUser?.isSuperAdmin && currentUser?.roleId !== 1) {
      return errorResponse('无权限查看此用户会话');
    }

    const sessions = await db
      .select({
        id: userSessions.id,
        sessionId: userSessions.sessionId,
        deviceId: userSessions.deviceId,
        deviceType: userSessions.deviceType,
        deviceName: userSessions.deviceName,
        platform: userSessions.platform,
        ipAddress: userSessions.ipAddress,
        userAgent: userSessions.userAgent,
        isActive: userSessions.isActive,
        createdAt: userSessions.createdAt,
        lastAccessedAt: userSessions.lastAccessedAt,
        expiresAt: userSessions.expiresAt,
        impersonatorId: userSessions.impersonatorId
      })
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(sql`${userSessions.lastAccessedAt} DESC`);

    const formattedSessions = sessions.map(session => ({
      ...session,
      isExpired: new Date(session.expiresAt) < new Date(),
      duration: session.lastAccessedAt
        ? Math.floor((new Date().getTime() - new Date(session.lastAccessedAt).getTime()) / 1000 / 60) // 分钟
        : 0
    }));

    return successResponse(formattedSessions);
  } catch (error) {
    console.error('获取用户会话失败:', error);
    return errorResponse('获取用户会话失败');
  }
}

// 终止用户所有会话
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getCurrentUser(request);
    const logger = new Logger('会话管理', currentUser?.id);

    const { id: idStr } = await params;
    const userId = parseInt(idStr);

    // 检查权限
    if (currentUser?.id !== userId && !currentUser?.isSuperAdmin && currentUser?.roleId !== 1) {
      return errorResponse('无权限操作此用户会话');
    }

    const body = await request.json();
    const { excludeCurrent = false } = body;

    let condition = eq(userSessions.userId, userId);

    // 如果排除当前会话，需要获取当前会话ID
    if (excludeCurrent && currentUser) {
      const currentSessionId = await getCurrentSessionId(currentUser.id);
      if (currentSessionId) {
        condition = and(
          eq(userSessions.userId, userId),
          sql`${userSessions.sessionId} != ${currentSessionId}`
        ) as any; // Type assertion to handle SQL type complexity
      }
    }

    const result = await db
      .update(userSessions)
      .set({ isActive: false })
      .where(and(
        condition,
        eq(userSessions.isActive, true)
      ))
      .returning({ sessionId: userSessions.sessionId });

    await logger.info('终止会话', `成功终止${result.length}个会话`, {
      targetUserId: userId,
      terminatedSessions: result.map(r => r.sessionId),
      excludeCurrent,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return successResponse({
      message: '会话终止成功',
      terminatedCount: result.length
    });
  } catch (error) {
    console.error('终止用户会话失败:', error);
    return errorResponse('终止用户会话失败');
  }
}

// 获取用户当前活跃会话ID的辅助函数
async function getCurrentSessionId(userId: number): Promise<string | null> {
  const sessions = await db
    .select({ sessionId: userSessions.sessionId })
    .from(userSessions)
    .where(and(
      eq(userSessions.userId, userId),
      eq(userSessions.isActive, true),
      sql`${userSessions.expiresAt} > NOW()`
    ))
    .orderBy(sql`${userSessions.lastAccessedAt} DESC`)
    .limit(1);

  return sessions.length > 0 ? sessions[0].sessionId : null;
}