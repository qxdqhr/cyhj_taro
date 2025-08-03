#!/bin/bash

# 葱韵环京项目本地 Docker 部署脚本
# 用于本地测试 NextJS 后端和微信小程序

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 环境
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    log_success "Docker 环境检查通过"
}

# 停止现有服务
stop_services() {
    log_info "停止现有服务..."
    docker-compose down 2>/dev/null || true
    log_success "服务已停止"
}

# 构建镜像
build_images() {
    log_info "构建 Docker 镜像..."
    
    # 构建 NextJS 后端
    log_info "构建 NextJS 后端..."
    docker-compose build nextjs-backend
    
    # 构建微信小程序构建器
    log_info "构建微信小程序构建器..."
    docker-compose build weapp-builder
    
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 启动 NextJS 后端
    docker-compose up -d nextjs-backend
    
    log_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务就绪..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/api/health &> /dev/null; then
            log_success "NextJS 后端服务就绪"
            break
        fi
        
        log_info "等待服务就绪... (尝试 $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "服务启动超时"
        exit 1
    fi
}

# 构建微信小程序
build_weapp() {
    log_info "构建微信小程序..."
    
    # 运行微信小程序构建容器
    docker-compose run --rm weapp-builder
    
    log_success "微信小程序构建完成"
}

# 显示服务信息
show_info() {
    log_success "本地部署完成！"
    echo ""
    echo "=== 服务信息 ==="
    echo "NextJS 后端: http://localhost:3000"
    echo "健康检查: http://localhost:3000/api/health"
    echo ""
    echo "=== 微信小程序 ==="
    echo "构建结果: ./dist/"
    echo ""
    echo "=== 常用命令 ==="
    echo "查看日志: docker-compose logs -f"
    echo "停止服务: docker-compose down"
    echo "重启服务: docker-compose restart"
}

# 主函数
main() {
    log_info "开始本地部署..."
    
    check_docker
    stop_services
    build_images
    start_services
    wait_for_services
    build_weapp
    show_info
}

# 执行主函数
main "$@" 