import { db } from '@/db';
import { userOrganizations, organizations, users } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/service/response';

// 获取用户组织信息
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getCurrentUser(request);
    const { id: idStr } = await params;
    const userId = parseInt(idStr);

    // 检查权限
    if (currentUser?.id !== userId && !currentUser?.isSuperAdmin && currentUser?.roleId !== 1) {
      return errorResponse('无权限查看此用户组织信息');
    }

    // 检查用户是否存在
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userExists.length) {
      return notFoundResponse('用户不存在');
    }

    const userOrgs = await db
      .select({
        id: userOrganizations.id,
        userId: userOrganizations.userId,
        organizationId: userOrganizations.organizationId,
        position: userOrganizations.position,
        isMain: userOrganizations.isMain,
        joinedAt: userOrganizations.joinedAt,
        organization: {
          id: organizations.id,
          name: organizations.name,
          code: organizations.code,
          parentId: organizations.parentId,
          path: organizations.path
        }
      })
      .from(userOrganizations)
      .leftJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, userId))
      .orderBy(userOrganizations.joinedAt);

    // 按主要组织和加入时间排序
    const sortedOrgs = userOrgs.sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return (a.joinedAt ? new Date(a.joinedAt).getTime() : 0) - (b.joinedAt ? new Date(b.joinedAt).getTime() : 0);
    });

    return successResponse(sortedOrgs);
  } catch (error) {
    console.error('获取用户组织信息失败:', error);
    return errorResponse('获取用户组织信息失败');
  }
}

// 设置用户组织
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getCurrentUser(request);
    const logger = new Logger('用户组织管理', currentUser?.id);

    const { id: idStr } = await params;
    const userId = parseInt(idStr);

    // 检查权限
    if (!currentUser?.isSuperAdmin && currentUser?.roleId !== 1) {
      return errorResponse('无权限修改用户组织信息');
    }

    // 检查用户是否存在
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userExists.length) {
      return notFoundResponse('用户不存在');
    }

    const body = await request.json();
    const { organizationIds = [], mainOrganizationId } = body;

    if (!Array.isArray(organizationIds)) {
      return errorResponse('组织ID列表格式错误');
    }

    // 验证组织是否存在
    if (organizationIds.length > 0) {
      const orgExists = await db
        .select()
        .from(organizations)
        .where(inArray(organizations.id, organizationIds.map(id => BigInt(id))))
        .limit(organizationIds.length);

      if (orgExists.length !== organizationIds.length) {
        return errorResponse('部分组织不存在');
      }

      // 如果指定了主组织，验证它是否在组织列表中
      if (mainOrganizationId && !organizationIds.includes(mainOrganizationId)) {
        return errorResponse('主组织必须在组织列表中');
      }
    }

    // 使用事务更新用户组织关联
    const result = await db.transaction(async (tx) => {
      // 先删除现有组织关联
      await tx.delete(userOrganizations).where(eq(userOrganizations.userId, userId));

      // 添加新的组织关联
      const newOrgRelations = organizationIds.map((orgId: number, index: number) => ({
        userId,
        organizationId: orgId,
        position: '',
        isMain: orgId === (mainOrganizationId || organizationIds[0]) // 指定的主组织或第一个
      }));

      if (newOrgRelations.length > 0) {
        await tx.insert(userOrganizations).values(newOrgRelations);
      }

      return {
        previousCount: organizationIds.length,
        newCount: newOrgRelations.length
      };
    });

    await logger.info('设置用户组织', '用户组织设置成功', {
      targetUserId: userId,
      organizationIds,
      mainOrganizationId,
      result,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return successResponse({
      message: '用户组织设置成功',
      organizationCount: organizationIds.length
    });
  } catch (error) {
    console.error('设置用户组织失败:', error);
    return errorResponse('设置用户组织失败');
  }
}