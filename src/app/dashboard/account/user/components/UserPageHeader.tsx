import React from 'react';
import { Plus, Download, Upload, RefreshCw, Users } from 'lucide-react';
import { PageHeader } from '@/components/table/page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface UserPageHeaderProps {
  /** 新增用户回调 */
  onCreateUser: () => void;
  /** 选中的用户数量 */
  selectedUsersCount?: number;
  /** 批量操作回调 */
  onBatchActivate?: () => void;
  onBatchDeactivate?: () => void;
  onBatchDelete?: () => void;
  onExportUsers?: () => void;
  onImportUsers?: () => void;
  onRefresh?: () => void;
  /** 统计数据 */
  totalUsers?: number;
  activeUsers?: number;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 用户页面头部组件
 * 负责页面标题、操作按钮和批量操作
 */
export function UserPageHeader({
  onCreateUser,
  selectedUsersCount = 0,
  onBatchActivate,
  onBatchDeactivate,
  onBatchDelete,
  onExportUsers,
  onImportUsers,
  onRefresh,
  totalUsers,
  activeUsers,
  loading = false
}: UserPageHeaderProps) {
  // 有选中用户时显示批量操作
  const renderBatchActions = () => {
    if (selectedUsersCount === 0) return null;

    return (
      <div className='flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
        <span className='text-sm text-blue-700'>
          已选择 <strong>{selectedUsersCount}</strong> 个用户
        </span>

        <div className='flex items-center gap-1'>
          <Button
            size='sm'
            variant='outline'
            onClick={onBatchActivate}
            className='h-8 text-xs'
          >
            批量激活
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={onBatchDeactivate}
            className='h-8 text-xs'
          >
            批量禁用
          </Button>
          <Button
            size='sm'
            variant='destructive'
            onClick={onBatchDelete}
            className='h-8 text-xs'
          >
            批量删除
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-4'>
      {/* 页面头部 */}
      <PageHeader
        title='用户管理'
        description={`管理系统用户账户和权限${totalUsers && totalUsers > 0 ? ` (总数: ${totalUsers.toLocaleString()}${activeUsers && activeUsers > 0 ? `, 活跃: ${activeUsers.toLocaleString()}` : ''})` : ''}`}
      >
        <div className='flex items-center gap-2'>
          {/* 主要操作按钮 */}
          <Button
            onClick={onCreateUser}
            size='sm'
            className='cursor-pointer'
          >
            <Plus className='mr-2 h-4 w-4' />
            新增用户
          </Button>

          {/* 更多操作下拉菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='cursor-pointer'>
                更多操作
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={onImportUsers}>
                <Upload className='mr-2 h-4 w-4' />
                导入用户
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportUsers}>
                <Download className='mr-2 h-4 w-4' />
                导出用户
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRefresh} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                刷新数据
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PageHeader>

      {/* 批量操作栏 */}
      {renderBatchActions()}
    </div>
  );
}
