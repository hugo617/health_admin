import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 简单的测试登录逻辑
    if (email === 'admin@example.com' && password === 'Admin@123456') {
      const token = sign(
        {
          id: 1,
          email: 'admin@example.com',
          username: 'Administrator',
          roleId: 1,
          tenantId: 1,
          avatar: '/avatars/admin.jpg',
          isSuperAdmin: true
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );

      const response = NextResponse.json({
        success: true,
        data: {
          message: '登录成功',
          user: {
            id: 1,
            email: 'admin@example.com',
            username: 'Administrator'
          },
          token
        }
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24
      });

      return response;
    } else if (email === 'test@example.com' && password === 'Test@123456') {
      const token = sign(
        {
          id: 2,
          email: 'test@example.com',
          username: 'TestUser',
          roleId: 1,
          tenantId: 1,
          avatar: '/avatars/test.jpg',
          isSuperAdmin: false
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );

      const response = NextResponse.json({
        success: true,
        data: {
          message: '登录成功',
          user: {
            id: 2,
            email: 'test@example.com',
            username: 'TestUser'
          },
          token
        }
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: '邮箱或密码错误' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}