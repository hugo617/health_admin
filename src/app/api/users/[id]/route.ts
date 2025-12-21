import { db } from '@/db';
import { users, userOrganizations, organizations } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import {
  preventSuperAdminModification,
  preventSuperAdminDisable
} from '@/lib/super-admin';
import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  notFoundResponse
} from '@/service/response';
import { validateUserUpdate } from '@/lib/validation';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('用户管理', currentUser?.id);

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // 获取原用户信息
    const originalUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!originalUser.length) {
      await logger.warn('更新用户', '更新用户失败：用户不存在', {
        targetUserId: id,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return notFoundResponse('用户不存在');
    }

    const body = await request.json();
    const {
      username,
      email,
      phone,
      realName,
      roleId,
      status,
      metadata,
      organizationIds
    } = body;

    // 验证输入数据
    const validation = validateUserUpdate({
      username,
      email,
      phone,
      realName,
      roleId,
      status
    });

    if (!validation.isValid) {
      const errorMessage = validation.errors.map(err => `${err.field}: ${err.message}`).join('; ');
      await logger.warn('更新用户', '更新用户失败：输入验证失败', {
        targetUserId: id,
        validationErrors: validation.errors,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });

      return errorResponse(errorMessage);
    }

    // 检查是否尝试禁用超级管理员
    if (status !== undefined) {
      await preventSuperAdminDisable(id, status as 'active' | 'inactive' | 'locked');
    }

    // 对于其他修改，仍然保护超级管理员（但状态修改已经单独检查）
    if (
      username !== undefined ||
      email !== undefined ||
      phone !== undefined ||
      realName !== undefined ||
      roleId !== undefined ||
      metadata !== undefined ||
      organizationIds !== undefined
    ) {
      await preventSuperAdminModification(id);
    }

    // 使用事务更新用户信息和组织关联
    await db.transaction(async (tx) => {
      const updateData: any = {
        updatedBy: currentUser?.id
      };

      // 只更新提供的字段
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (realName !== undefined) updateData.realName = realName;
      if (roleId !== undefined) updateData.roleId = parseInt(roleId);
      if (status !== undefined) updateData.status = status as 'active' | 'inactive' | 'locked';
      if (metadata !== undefined) updateData.metadata = metadata;

      await tx.update(users).set(updateData).where(eq(users.id, id));

      // 更新组织关联
      if (organizationIds !== undefined) {
        // 先删除现有组织关联
        await tx.delete(userOrganizations).where(eq(userOrganizations.userId, id));

        // 添加新的组织关联
        if (organizationIds.length > 0) {
          const orgRelations = organizationIds.map((orgId: number, index: number) => ({
            userId: id,
            organizationId: BigInt(orgId),
            position: '',
            isMain: index === 0 // 第一个组织为主组织
          }));

          await tx.insert(userOrganizations).values(orgRelations);
        }
      }
    });

    // 记录更新日志
    await logger.info('更新用户', '用户信息更新成功', {
      targetUserId: id,
      targetUsername: originalUser[0].username,
      changedFields: {
        username:
          username !== undefined && originalUser[0].username !== username
            ? { from: originalUser[0].username, to: username }
            : undefined,
        email:
          email !== undefined && originalUser[0].email !== email
            ? { from: originalUser[0].email, to: email }
            : undefined,
        phone:
          phone !== undefined && originalUser[0].phone !== phone
            ? { from: originalUser[0].phone, to: phone }
            : undefined,
        realName:
          realName !== undefined && originalUser[0].realName !== realName
            ? { from: originalUser[0].realName, to: realName }
            : undefined,
        roleId:
          roleId !== undefined && originalUser[0].roleId !== parseInt(roleId)
            ? { from: originalUser[0].roleId, to: parseInt(roleId) }
            : undefined,
        status:
          status !== undefined && originalUser[0].status !== status
            ? { from: originalUser[0].status, to: status }
            : undefined,
        metadataChanged: metadata !== undefined,
        organizationsChanged: organizationIds !== undefined
      },
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse({ message: '用户更新成功' });
  } catch (error) {
    await logger.error('更新用户', '更新用户失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return errorResponse((error as Error)?.message || '更新用户失败');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('用户管理', currentUser?.id);

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // 获取要删除的用户信息
    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!targetUser.length) {
      await logger.warn('删除用户', '删除用户失败：用户不存在', {
        targetUserId: id,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return notFoundResponse('用户不存在');
    }

    await preventSuperAdminModification(id);
    await db
      .update(users)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: currentUser?.id
      })
      .where(eq(users.id, id));

    // 记录删除日志
    await logger.warn('删除用户', '用户删除成功', {
      deletedUserId: id,
      deletedUsername: targetUser[0].username,
      deletedEmail: targetUser[0].email,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse({ message: '用户删除成功' });
  } catch (error) {
    await logger.error('删除用户', '删除用户失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return errorResponse((error as Error)?.message || '删除用户失败');
  }
}
