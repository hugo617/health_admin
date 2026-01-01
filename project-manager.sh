#!/bin/bash

# N-Admin 项目管理脚本

show_help() {
    echo "🚀 N-Admin 项目管理脚本"
    echo "============================="
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  start       启动所有项目 (主项目 + H5项目)"
    echo "  stop        停止所有项目"
    echo "  restart     重启所有项目"
    echo "  status      查看项目运行状态"
    echo "  help        显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start    # 启动所有项目"
    echo "  $0 stop     # 停止所有项目"
    echo "  $0 restart  # 重启所有项目"
    echo "  $0 status   # 查看运行状态"
}

show_status() {
    echo "📊 N-Admin 项目运行状态"
    echo "============================="

    # 检查端口3003
    if lsof -ti:3003 >/dev/null 2>&1; then
        echo "✅ 主项目 (端口 3003): 运行中"
        echo "   🌐 访问地址: http://localhost:3003"
    else
        echo "❌ 主项目 (端口 3003): 未运行"
    fi

    # 检查端口3005
    if lsof -ti:3005 >/dev/null 2>&1; then
        echo "✅ H5项目 (端口 3005): 运行中"
        echo "   🌐 访问地址: http://localhost:3005/login"
    else
        echo "❌ H5项目 (端口 3005): 未运行"
    fi

    # 检查相关进程
    echo ""
    echo "🔍 进程信息:"
    if pgrep -f "pnpm run dev" >/dev/null; then
        echo "✅ pnpm run dev 进程: 运行中"
    else
        echo "❌ pnpm run dev 进程: 未运行"
    fi

    if pgrep -f "next dev" >/dev/null; then
        echo "✅ Next.js 开发服务器: 运行中"
    else
        echo "❌ Next.js 开发服务器: 未运行"
    fi
}

# 主逻辑
case "${1:-}" in
    "start")
        echo "🚀 启动 N-Admin 项目..."
        bash /Users/star/hugo/project/n-admin/start-all.sh
        ;;
    "stop")
        echo "🛑 停止 N-Admin 项目..."
        bash /Users/star/hugo/project/n-admin/stop-all.sh
        ;;
    "restart")
        echo "🔄 重启 N-Admin 项目..."
        bash /Users/star/hugo/project/n-admin/stop-all.sh
        sleep 2
        bash /Users/star/hugo/project/n-admin/start-all.sh
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo "❌ 未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac