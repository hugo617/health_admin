#!/bin/bash

echo "🚀 启动 N-Admin 全套项目..."
echo "================================"

# 检查并停止现有的服务
echo "🛑 停止现有的服务..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# 等待进程完全停止
sleep 2

# 检查端口是否释放
echo "🔍 检查端口状态..."
if lsof -ti:3003 >/dev/null 2>&1; then
    echo "强制释放端口3003..."
    lsof -ti:3003 | xargs kill -9 2>/dev/null || true
fi

if lsof -ti:3005 >/dev/null 2>&1; then
    echo "强制释放端口3005..."
    lsof -ti:3005 | xargs kill -9 2>/dev/null || true
fi

sleep 1

echo "✅ 端口已释放"
echo "================================"

# 启动主项目 (端口3003)
echo "🎯 启动主项目 (端口 3003)..."
cd "$(dirname "$0")"
npm run dev &
MAIN_PID=$!

# 等待主项目启动
sleep 5

# 启动H5项目 (端口3005)
echo "📱 启动H5移动端项目 (端口 3005)..."
cd h5
npm run dev &
H5_PID=$!

# 等待H5项目启动
sleep 5

echo ""
echo "🎉 所有项目启动完成！"
echo "================================"
echo "📊 主项目 (管理端): http://localhost:3003"
echo "📱 H5移动端项目:   http://localhost:3005/login"
echo "================================"
echo ""
echo "💡 提示:"
echo "  - 按 Ctrl+C 停止所有服务"
echo "  - 查看日志请使用: tail -f .next/trace 或查看控制台输出"
echo ""

# 等待用户中断
wait $MAIN_PID $H5_PID