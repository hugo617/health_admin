import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function addOrganizationPermissions() {
  console.log('开始添加组织架构权限...');

  // 检查组织架构权限是否已存在
  const existing = await db.execute(sql`
    SELECT id FROM permissions WHERE code = 'account.organization'
  `);

  if (existing.rows.length > 0) {
    console.log('组织架构权限已存在，无需添加');
    process.exit(0);
    return;
  }

  try {
    // 获取超级管理员角色
    const superAdminRole = await db.execute(sql`
      SELECT id FROM roles WHERE "is_super" = true LIMIT 1
    `);

    if (superAdminRole.rows.length === 0) {
      console.log('未找到超级管理员角色');
      process.exit(1);
      return;
    }

    const roleId = (superAdminRole.rows[0] as any).id;

    // 插入组织架构权限
    await db.execute(sql`
      INSERT INTO permissions (id, name, code, "tenant_id", type, description, "parent_id", "sort_order", "is_system")
      VALUES (14, '组织架构', 'account.organization', 1, 'api', '组织架构管理权限', 1, 140, true)
      ON CONFLICT DO NOTHING
    `);

    // 插入子权限
    const perms = [
      [141, '查看组织', 'account.organization.read', 141],
      [142, '新增组织', 'account.organization.create', 142],
      [143, '编辑组织', 'account.organization.update', 143],
      [144, '删除组织', 'account.organization.delete', 144],
    ];

    for (const [id, name, code, sortOrder] of perms) {
      await db.execute(sql`
        INSERT INTO permissions (id, name, code, "tenant_id", type, description, "parent_id", "sort_order", "is_system")
        VALUES (${id}, ${name}, ${code}, 1, 'api', ${name}, 14, ${sortOrder}, true)
        ON CONFLICT DO NOTHING
      `);
    }

    // 关联权限到超级管理员角色
    const permissionIds = [14, 141, 142, 143, 144];
    for (const permId of permissionIds) {
      await db.execute(sql`
        INSERT INTO "role_permissions" ("role_id", "permission_id")
        VALUES (${roleId}, ${permId})
        ON CONFLICT DO NOTHING
      `);
    }

    console.log('组织架构权限添加完成！');
    console.log('已添加权限:');
    console.log('  - 组织架构 (account.organization)');
    console.log('  - 查看组织 (account.organization.read)');
    console.log('  - 新增组织 (account.organization.create)');
    console.log('  - 编辑组织 (account.organization.update)');
    console.log('  - 删除组织 (account.organization.delete)');
    process.exit(0);
  } catch (error) {
    console.error('添加权限失败:', error);
    process.exit(1);
  }
}

addOrganizationPermissions();
