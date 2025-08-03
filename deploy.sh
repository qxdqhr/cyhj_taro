#!/bin/bash

# 葱韵环京项目 Docker 部署脚本
# 用于部署 NextJS 后端和微信小程序到生产环境

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_success "Docker 环境检查通过"
}

# 检查环境变量文件
check_env_files() {
    if [ ! -f "../.env.production" ]; then
        log_warning "生产环境变量文件 ../.env.production 不存在"
        log_info "请创建生产环境变量文件"
        exit 1
    fi
    
    log_success "环境变量文件检查通过"
}

# 备份现有数据
backup_data() {
    log_info "开始备份现有数据..."
    
    if [ -d "./backup" ]; then
        rm -rf ./backup
    fi
    
    mkdir -p ./backup
    
    # 备份微信小程序构建结果
    if [ -d "./dist" ]; then
        cp -r ./dist ./backup/
        log_success "微信小程序构建结果已备份"
    fi
    
    # 备份 Docker 镜像
    if docker images | grep -q "cyhj"; then
        docker save -o ./backup/cyhj-images.tar $(docker images | grep "cyhj" | awk '{print $1":"$2}')
        log_success "Docker 镜像已备份"
    fi
}

# 停止现有服务
stop_services() {
    log_info "停止现有服务..."
    
    if docker-compose ps | grep -q "Up"; then
        docker-compose down
        log_success "现有服务已停止"
    else
        log_info "没有运行中的服务"
    fi
}

# 清理旧镜像
cleanup_images() {
    log_info "清理旧镜像..."
    
    # 删除未使用的镜像
    docker image prune -f
    
    # 删除旧的 cyhj 镜像
    docker images | grep "cyhj" | awk '{print $3}' | xargs -r docker rmi -f
    
    log_success "旧镜像清理完成"
}

# 构建镜像
build_images() {
    log_info "开始构建 Docker 镜像..."
    
    # 构建所有服务
    docker-compose build --no-cache
    
    log_success "Docker 镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 启动服务
    docker-compose up -d
    
    log_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务就绪..."
    
    # 等待 NextJS 后端就绪
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            log_success "NextJS 后端服务就绪"
            break
        fi
        
        log_info "等待 NextJS 后端服务就绪... (尝试 $attempt/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "NextJS 后端服务启动超时"
        exit 1
    fi
    
    # 等待 Nginx 就绪
    sleep 5
    if curl -f http://localhost/health &> /dev/null; then
        log_success "Nginx 服务就绪"
    else
        log_warning "Nginx 服务可能未完全就绪"
    fi
}

# 构建微信小程序
build_weapp() {
    log_info "构建微信小程序..."
    
    # 运行微信小程序构建容器
    docker-compose run --rm weapp-builder
    
    log_success "微信小程序构建完成"
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    echo ""
    echo "=== 服务状态 ==="
    docker-compose ps
    
    echo ""
    echo "=== 容器日志 ==="
    docker-compose logs --tail=20
    
    echo ""
    echo "=== 健康检查 ==="
    
    # 检查 NextJS 后端
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "NextJS 后端健康检查通过"
    else
        log_error "NextJS 后端健康检查失败"
    fi
    
    # 检查 Nginx
    if curl -f http://localhost/health &> /dev/null; then
        log_success "Nginx 健康检查通过"
    else
        log_error "Nginx 健康检查失败"
    fi
}

# 显示部署信息
show_deployment_info() {
    log_success "部署完成！"
    echo ""
    echo "=== 部署信息 ==="
    echo "NextJS 后端: http://localhost:3000"
    echo "Nginx 代理: http://localhost"
    echo "健康检查: http://localhost/health"
    echo ""
    echo "=== 微信小程序 ==="
    echo "构建结果位于: ./dist/"
    echo "静态文件服务: http://localhost/weapp/"
    echo ""
    echo "=== 常用命令 ==="
    echo "查看日志: docker-compose logs -f"
    echo "停止服务: docker-compose down"
    echo "重启服务: docker-compose restart"
    echo "更新部署: ./deploy.sh"
}

# 主函数
main() {
    log_info "开始部署葱韵环京项目..."
    
    # 检查环境
    check_docker
    check_env_files
    
    # 备份数据
    backup_data
    
    # 停止现有服务
    stop_services
    
    # 清理旧镜像
    cleanup_images
    
    # 构建镜像
    build_images
    
    # 启动服务
    start_services
    
    # 等待服务就绪
    wait_for_services
    
    # 构建微信小程序
    build_weapp
    
    # 检查服务状态
    check_services
    
    # 显示部署信息
    show_deployment_info
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 执行主函数
main "$@" 