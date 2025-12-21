import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';

export async function GET(request: Request) {
  try {
    const currentUser = getCurrentUser(request);
    const { searchParams } = new URL(request.url);

    const email = searchParams.get('email')?.trim();
    const excludeId = searchParams.get('excludeId');

    if (!email) {
      return errorResponse('邮箱不能为空');
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('邮箱格式不正确');
    }

    // 构建查询条件
    const conditions = [
      eq(users.email, email),
      eq(users.isDeleted, false)
    ];

    // 租户隔离
    const queryTenantId = currentUser?.tenantId || 1;
    if (!currentUser?.isSuperAdmin) {
      conditions.push(eq(users.tenantId, BigInt(queryTenantId)));
    }

    // 排除特定用户ID（用于编辑时检查）
    if (excludeId) {
      conditions.push(sql`${users.id} != ${parseInt(excludeId)}`);
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .limit(1);

    const isAvailable = existingUser.length === 0;

    return successResponse({
      email,
      isAvailable,
      message: isAvailable ? '邮箱可用' : '邮箱已被使用'
    });
  } catch (error) {
    console.error('检查邮箱可用性失败:', error);
    return errorResponse('检查邮箱可用性失败');
  }
}