/**
 * 组织详情页面
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  ChevronRight,
  Edit,
  Trash2,
  ArrowLeft,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageContainer from '@/components/layout/page-container';
import { toast } from 'sonner';
import { OrganizationAPI } from '@/service/api/organization';
import type {
  Organization,
  UserOrganization
} from '@/app/dashboard/account/organization/types';
import { STATUS_MAP } from '@/app/dashboard/account/organization/constants';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<UserOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchOrganizationDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await OrganizationAPI.getOrganization(id);
      if (res.code === 0 && res.data) {
        setOrganization(res.data);
      } else {
        toast.error(res.message || '获取组织详情失败');
        router.push('/dashboard/account/organization');
      }
    } catch (error) {
      console.error('获取组织详情失败:', error);
      toast.error('获取组织详情失败');
      router.push('/dashboard/account/organization');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const fetchOrganizationUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await OrganizationAPI.getOrganizationUsers(id, {
        page: 1,
        limit: 100
      });
      if (res.code === 0 && res.data) {
        setUsers(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('获取组织用户失败:', error);
    } finally {
      setUsersLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrganizationDetail();
      fetchOrganizationUsers();
    }
  }, [id, fetchOrganizationDetail, fetchOrganizationUsers]);

  const handleEdit = () => {
    // TODO: 打开编辑对话框
    toast.info('编辑功能待实现');
  };

  const handleDelete = () => {
    // TODO: 打开删除确认
    toast.info('删除功能待实现');
  };

  const handleAddUser = () => {
    // TODO: 打开添加用户对话框
    toast.info('添加用户功能待实现');
  };

  if (loading) {
    return (
      <PageContainer scrollable={true}>
        <div className='flex h-[400px] items-center justify-center'>
          <div className='text-muted-foreground'>加载中...</div>
        </div>
      </PageContainer>
    );
  }

  if (!organization) {
    return (
      <PageContainer scrollable={true}>
        <div className='flex h-[400px] items-center justify-center'>
          <div className='text-muted-foreground'>组织不存在</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <div className='flex w-full flex-col space-y-4 p-4'>
        {/* 面包屑导航 */}
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <Button
            variant='ghost'
            size='sm'
            className='h-6 px-0'
            onClick={() => router.push('/dashboard/account/organization')}
          >
            组织架构
          </Button>
          <ChevronRight className='h-4 w-4' />
          <span className='text-foreground font-medium'>
            {organization.name}
          </span>
        </div>

        {/* 页面头部 */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Building2 className='text-muted-foreground h-8 w-8' />
            <div>
              <h1 className='text-2xl font-bold'>{organization.name}</h1>
              {organization.code && (
                <p className='text-muted-foreground text-sm'>
                  编码: {organization.code}
                </p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push('/dashboard/account/organization')}
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              返回
            </Button>
            <Button variant='outline' size='sm' onClick={handleEdit}>
              <Edit className='mr-2 h-4 w-4' />
              编辑
            </Button>
            <Button variant='outline' size='sm' onClick={handleAddUser}>
              <UserPlus className='mr-2 h-4 w-4' />
              添加成员
            </Button>
            <Button variant='destructive' size='sm' onClick={handleDelete}>
              <Trash2 className='mr-2 h-4 w-4' />
              删除
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                成员数量
              </CardTitle>
              <Users className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{organization.userCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                子组织数
              </CardTitle>
              <Building2 className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {organization.childCount || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={STATUS_MAP[organization.status].color}>
                {STATUS_MAP[organization.status].label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                排序值
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{organization.sortOrder}</div>
            </CardContent>
          </Card>
        </div>

        {/* 详情选项卡 */}
        <Tabs defaultValue='members' className='flex-1'>
          <TabsList>
            <TabsTrigger value='members'>成员列表</TabsTrigger>
            <TabsTrigger value='details'>详细信息</TabsTrigger>
          </TabsList>

          <TabsContent value='members' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>组织成员</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className='text-muted-foreground py-8 text-center'>
                    加载中...
                  </div>
                ) : users.length === 0 ? (
                  <div className='text-muted-foreground py-8 text-center'>
                    暂无成员
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className='flex items-center justify-between rounded-md border p-3'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className='font-medium'>
                              {user.realName || user.username}
                            </div>
                            <div className='text-muted-foreground text-sm'>
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          {user.position && (
                            <Badge variant='outline'>{user.position}</Badge>
                          )}
                          {user.isMain && (
                            <Badge className='bg-primary/10 text-primary'>
                              主组织
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='details' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>组织信息</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      组织名称
                    </div>
                    <div className='font-medium'>{organization.name}</div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      组织编码
                    </div>
                    <div className='font-medium'>
                      {organization.code || '-'}
                    </div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>组织 ID</div>
                    <div className='font-medium'>{organization.id}</div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      父组织 ID
                    </div>
                    <div className='font-medium'>
                      {organization.parentId || '-'}
                    </div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      负责人 ID
                    </div>
                    <div className='font-medium'>
                      {organization.leaderId || '-'}
                    </div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>排序值</div>
                    <div className='font-medium'>{organization.sortOrder}</div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      创建时间
                    </div>
                    <div className='font-medium'>
                      {new Date(organization.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      更新时间
                    </div>
                    <div className='font-medium'>
                      {new Date(organization.updatedAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
