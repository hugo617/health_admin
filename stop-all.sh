#!/bin/bash

echo "🛑 正在停止 N-Admin 项目..."
echo "================================"

# 停止所有 pnpm run dev 进程
echo "🔄 停止 pnpm run dev 进程..."
pkill -f "pnpm run dev" 2>/dev/null || true

# 停止所有 next dev 进程
echo "🔄 停止 Next.js 开发服务器..."
pkill -f "next dev" 2>/dev/null || true

# 停止所有 tsx 进程
echo "🔄 停止 tsx 进程..."
pkill -f "tsx" 2>/dev/null || true

# 释放端口3003和3005
echo "🔄 释放端口 3003 和 3005..."
if lsof -ti:3003 >/dev/null 2>&1; then
    echo "  - 释放端口 3003..."
    lsof -ti:3003 | xargs kill -9 2>/dev/null || true
fi

if lsof -ti:3005 >/dev/null 2>&1; then
    echo "  - 释放端口 3005..."
    lsof -ti:3005 | xargs kill -9 2>/dev/null || true
fi

# 等待进程完全停止
sleep 2

# 验证端口是否已释放
echo "🔍 验证端口状态..."
if lsof -ti:3003 >/dev/null 2>&1; then
    echo "  ⚠️  端口 3003 仍在使用"
else
    echo "  ✅ 端口 3003 已释放"
fi

if lsof -ti:3005 >/dev/null 2>&1; then
    echo "  ⚠️  端口 3005 仍在使用"
else
    echo "  ✅ 端口 3005 已释放"
fi

# 检查是否还有相关进程在运行
echo ""
echo "🔍 检查剩余进程..."
if pgrep -f "pnpm run dev" >/dev/null; then
    echo "  ⚠️  仍有 pnpm run dev 进程在运行"
else
    echo "  ✅ pnpm run dev 进程已全部停止"
fi

if pgrep -f "next dev" >/dev/null; then
    echo "  ⚠️  仍有 Next.js 开发服务器在运行"
else
    echo "  ✅ Next.js 开发服务器已全部停止"
fi

echo ""
echo "🎉 停止完成！"
echo "================================"
echo "💡 提示:"
echo "  - 如果端口仍被占用，可以手动运行: lsof -ti:3003,3005 | xargs kill -9"
echo "  - 要重新启动项目，请运行: ./start-all.sh"