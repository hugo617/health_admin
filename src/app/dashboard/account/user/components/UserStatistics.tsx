'use client';

import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserStatistics as UserStatisticsType } from '../types';

interface UserStatisticsProps {
  statistics?: UserStatisticsType;
  loading?: boolean;
}

/**
 * 用户统计信息组件
 * 展示用户总数、状态分布、活跃度、增长趋势等统计数据
 */
export function UserStatistics({ statistics, loading = false }: UserStatisticsProps) {
  if (loading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>加载中...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-8 w-16 bg-gray-200 animate-pulse rounded'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!statistics) {
    // 显示加载状态
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                加载中...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-8 w-16 bg-gray-200 animate-pulse rounded'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { overview, engagement, growth } = statistics;

  return (
    <div className='space-y-6'>
      {/* 总览统计 */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* 总用户数 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              总用户数
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{overview.total.toLocaleString()}</div>
            <div className='text-xs text-muted-foreground'>
              活跃率 {overview.activeRate}%
            </div>
          </CardContent>
        </Card>

        {/* 活跃用户 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              活跃用户
            </CardTitle>
            <UserCheck className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {overview.active.toLocaleString()}
            </div>
            <div className='text-xs text-muted-foreground'>
              占比 {overview.total > 0 ? Math.round((overview.active / overview.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        {/* 禁用用户 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              禁用用户
            </CardTitle>
            <UserX className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {overview.inactive.toLocaleString()}
            </div>
            <div className='text-xs text-muted-foreground'>
              占比 {overview.total > 0 ? Math.round((overview.inactive / overview.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        {/* 锁定用户 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              锁定用户
            </CardTitle>
            <Shield className='h-4 w-4 text-orange-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {overview.locked.toLocaleString()}
            </div>
            <div className='text-xs text-muted-foreground'>
              占比 {overview.total > 0 ? Math.round((overview.locked / overview.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 活跃度和增长趋势 */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* 用户活跃度 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              用户活跃度
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>近30天登录用户</span>
              <Badge variant='secondary' className='text-green-700'>
                {engagement.recentLogins.toLocaleString()}
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>活跃率</span>
              <Badge
                variant={engagement.recentLoginRate >= 80 ? 'default' : 'secondary'}
                className={engagement.recentLoginRate >= 80 ? 'bg-green-100 text-green-800' : ''}
              >
                {engagement.recentLoginRate}%
              </Badge>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-green-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${engagement.recentLoginRate}%` }}
              />
            </div>
            <div className='text-xs text-muted-foreground'>
              近30天内有登录的用户占总用户的比例
            </div>
          </CardContent>
        </Card>

        {/* 用户增长趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              用户增长趋势
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>本月新增</span>
              <Badge variant='secondary' className='text-blue-700'>
                +{growth.thisMonth.toLocaleString()}
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>上月新增</span>
              <span className='text-sm'>{growth.lastMonth.toLocaleString()}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>增长率</span>
              <div className='flex items-center gap-2'>
                <TrendingUp className={`h-4 w-4 ${growth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`font-medium ${growth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth.growthRate >= 0 ? '+' : ''}{growth.growthRate}%
                </span>
              </div>
            </div>
            <div className='text-xs text-muted-foreground'>
              <Calendar className='inline h-3 w-3 mr-1' />
              对比上月的用户增长率
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 状态分布 */}
      <Card>
        <CardHeader>
          <CardTitle>用户状态分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-green-700'>正常用户</span>
                <Badge variant='default' className='bg-green-100 text-green-800'>
                  {overview.active.toLocaleString()}
                </Badge>
              </div>
              <div className='w-full bg-green-100 rounded-full h-3'>
                <div
                  className='bg-green-600 h-3 rounded-full transition-all duration-300'
                  style={{ width: `${overview.total > 0 ? (overview.active / overview.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-red-700'>禁用用户</span>
                <Badge variant='destructive' className='bg-red-100 text-red-800 hover:bg-red-100'>
                  {overview.inactive.toLocaleString()}
                </Badge>
              </div>
              <div className='w-full bg-red-100 rounded-full h-3'>
                <div
                  className='bg-red-600 h-3 rounded-full transition-all duration-300'
                  style={{ width: `${overview.total > 0 ? (overview.inactive / overview.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-orange-700'>锁定用户</span>
                <Badge variant='secondary' className='bg-orange-100 text-orange-800'>
                  {overview.locked.toLocaleString()}
                </Badge>
              </div>
              <div className='w-full bg-orange-100 rounded-full h-3'>
                <div
                  className='bg-orange-600 h-3 rounded-full transition-all duration-300'
                  style={{ width: `${overview.total > 0 ? (overview.locked / overview.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}