#!/bin/bash

# 葱韵环京项目部署测试脚本
# 用于验证 Docker 部署是否成功

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

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="$3"
    
    log_info "运行测试: $test_name"
    
    if eval "$test_command" >/dev/null 2>&1; then
        if [ "$expected_status" = "success" ]; then
            log_success "✅ $test_name 通过"
            ((TESTS_PASSED++))
        else
            log_error "❌ $test_name 失败 (期望失败但成功了)"
            ((TESTS_FAILED++))
        fi
    else
        if [ "$expected_status" = "success" ]; then
            log_error "❌ $test_name 失败"
            ((TESTS_FAILED++))
        else
            log_success "✅ $test_name 通过 (期望失败)"
            ((TESTS_PASSED++))
        fi
    fi
}

# 检查 Docker 服务状态
test_docker_services() {
    log_info "=== 测试 Docker 服务状态 ==="
    
    # 检查容器是否运行
    run_test "Docker 容器运行状态" \
        "docker-compose ps | grep -q 'Up'" \
        "success"
    
    # 检查 NextJS 后端容器
    run_test "NextJS 后端容器状态" \
        "docker-compose ps nextjs-backend | grep -q 'Up'" \
        "success"
    
    # 检查网络连接
    run_test "Docker 网络连接" \
        "docker network ls | grep -q 'cyhj-network'" \
        "success"
}

# 测试 API 端点
test_api_endpoints() {
    log_info "=== 测试 API 端点 ==="
    
    # 等待服务启动
    sleep 5
    
    # 测试健康检查端点
    run_test "健康检查 API" \
        "curl -f http://localhost:3000/api/health" \
        "success"
    
    # 测试画集 API
    run_test "画集 API" \
        "curl -f http://localhost:3000/api/masterpieces/collections" \
        "success"
    
    # 测试配置 API
    run_test "配置 API" \
        "curl -f http://localhost:3000/api/masterpieces/config" \
        "success"
    
    # 测试购物车 API
    run_test "购物车 API" \
        "curl -f http://localhost:3000/api/cart/1" \
        "success"
}

# 测试微信小程序构建
test_weapp_build() {
    log_info "=== 测试微信小程序构建 ==="
    
    # 检查构建目录是否存在
    run_test "微信小程序构建目录" \
        "test -d dist" \
        "success"
    
    # 检查关键文件是否存在
    run_test "微信小程序关键文件" \
        "test -f dist/app.js" \
        "success"
    
    # 检查项目配置文件
    run_test "项目配置文件" \
        "test -f dist/project.config.json" \
        "success"
}

# 测试网络连接
test_network_connectivity() {
    log_info "=== 测试网络连接 ==="
    
    # 测试本地端口
    run_test "本地端口 3000" \
        "nc -z localhost 3000" \
        "success"
    
    # 测试容器间通信
    run_test "容器间网络通信" \
        "docker-compose exec nextjs-backend ping -c 1 nginx" \
        "success"
}

# 测试环境变量
test_environment_variables() {
    log_info "=== 测试环境变量 ==="
    
    # 检查必要的环境变量
    run_test "NODE_ENV 环境变量" \
        "docker-compose exec nextjs-backend env | grep -q 'NODE_ENV=production'" \
        "success"
    
    # 检查 API 基础地址
    run_test "API_BASE_URL 环境变量" \
        "docker-compose exec nextjs-backend env | grep -q 'API_BASE_URL'" \
        "success"
}

# 测试日志输出
test_logs() {
    log_info "=== 测试日志输出 ==="
    
    # 检查日志是否正常输出
    run_test "NextJS 后端日志" \
        "docker-compose logs nextjs-backend | grep -q 'ready'" \
        "success"
    
    # 检查错误日志
    run_test "无严重错误日志" \
        "! docker-compose logs nextjs-backend | grep -i 'error\|fatal\|panic'" \
        "success"
}

# 性能测试
test_performance() {
    log_info "=== 测试性能 ==="
    
    # 测试 API 响应时间
    local start_time=$(date +%s.%N)
    curl -f http://localhost:3000/api/health >/dev/null 2>&1
    local end_time=$(date +%s.%N)
    local response_time=$(echo "$end_time - $start_time" | bc)
    
    if (( $(echo "$response_time < 1.0" | bc -l) )); then
        log_success "✅ API 响应时间正常: ${response_time}s"
        ((TESTS_PASSED++))
    else
        log_warning "⚠️ API 响应时间较慢: ${response_time}s"
        ((TESTS_FAILED++))
    fi
    
    # 检查内存使用
    local memory_usage=$(docker stats --no-stream --format "table {{.MemUsage}}" nextjs-backend | tail -n 1 | awk '{print $1}')
    log_info "内存使用: $memory_usage"
}

# 显示测试结果
show_test_results() {
    echo ""
    log_info "=== 测试结果汇总 ==="
    echo "总测试数: $((TESTS_PASSED + TESTS_FAILED))"
    echo "通过: $TESTS_PASSED"
    echo "失败: $TESTS_FAILED"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log_success "🎉 所有测试通过！部署成功！"
        echo ""
        echo "=== 服务访问地址 ==="
        echo "NextJS 后端: http://localhost:3000"
        echo "健康检查: http://localhost:3000/api/health"
        echo "画集 API: http://localhost:3000/api/masterpieces/collections"
        echo ""
        echo "=== 微信小程序 ==="
        echo "构建结果: ./dist/"
        echo "项目配置: ./dist/project.config.json"
    else
        log_error "❌ 有 $TESTS_FAILED 个测试失败，请检查部署"
        exit 1
    fi
}

# 主函数
main() {
    log_info "开始部署测试..."
    
    # 检查 Docker 环境
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    # 运行所有测试
    test_docker_services
    test_api_endpoints
    test_weapp_build
    test_network_connectivity
    test_environment_variables
    test_logs
    test_performance
    
    # 显示结果
    show_test_results
}

# 执行主函数
main "$@" 