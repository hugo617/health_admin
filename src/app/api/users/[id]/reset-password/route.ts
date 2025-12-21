import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import {
  preventSuperAdminModification
} from '@/lib/super-admin';
import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  notFoundResponse
} from '@/service/response';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('密码重置', currentUser?.id);

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // 获取要重置密码的用户信息
    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!targetUser.length) {
      await logger.warn('重置密码', '重置密码失败：用户不存在', {
        targetUserId: id,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return notFoundResponse('用户不存在');
    }

    const body = await request.json();
    const { newPassword, sendEmail = false } = body;

    if (!newPassword || newPassword.length < 6) {
      return errorResponse('新密码长度至少为6位');
    }

    // 检查是否尝试修改超级管理员
    await preventSuperAdminModification(id);

    // 加密新密码
    const saltRounds = Number(process.env.SALT_ROUNDS || 12);
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码并清除活跃会话
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
          updatedBy: currentUser?.id
        })
        .where(eq(users.id, id));

      // TODO: 清除该用户的所有活跃会话
      // await tx
      //   .update(userSessions)
      //   .set({ isActive: false })
      //   .where(and(
      //     eq(userSessions.userId, id),
      //     eq(userSessions.isActive, true)
      //   ));
    });

    // TODO: 发送密码重置邮件
    if (sendEmail) {
      // await sendPasswordResetEmail({
      //   email: targetUser[0].email,
      //   username: targetUser[0].username,
      //   tempPassword: newPassword
      // });
    }

    // 记录成功日志
    await logger.info('重置密码', '密码重置成功', {
      targetUserId: id,
      targetUsername: targetUser[0].username,
      targetEmail: targetUser[0].email,
      sendEmail,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse({
      message: '密码重置成功',
      userId: id
    });
  } catch (error) {
    await logger.error('重置密码', '重置密码失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return errorResponse((error as Error)?.message || '重置密码失败');
  }
}