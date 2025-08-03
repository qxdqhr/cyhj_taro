# 🐳 葱韵环京项目 Docker 部署指南

## 📋 项目概述

本项目包含：
- **NextJS 后端**: 提供 API 服务，位于父级目录
- **微信小程序前端**: 使用 Taro 框架开发，位于当前目录
- **Docker 容器化**: 支持一键部署到生产环境

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    生产环境服务器                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Nginx     │────│ NextJS API  │────│ PostgreSQL  │     │
│  │ (80/443)    │    │ (3000)      │    │ Database    │     │
│  │ 反向代理     │    │ 后端服务     │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│           │                                                  │
│           │                                                  │
│  ┌─────────────┐                                            │
│  │ WeApp       │                                            │
│  │ Builder     │                                            │
│  │ 小程序构建   │                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 1. 环境准备

#### 本地开发环境
```bash
# 检查 Docker 环境
docker --version
docker-compose --version

# 确保端口可用
# - 3000: NextJS 后端
# - 80: HTTP (可选)
# - 443: HTTPS (可选)
```

#### 生产环境要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 最少 2GB，推荐 4GB+
- **存储**: 最少 10GB 可用空间
- **网络**: 公网 IP 和域名

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.template ../.env.production

# 编辑生产环境配置
nano ../.env.production
```

**重要配置项**：
- `DATABASE_URL`: 数据库连接字符串
- `OSS_ACCESS_KEY_ID`: 阿里云 OSS 访问密钥
- `OSS_ACCESS_KEY_SECRET`: 阿里云 OSS 访问密钥
- `JWT_SECRET`: JWT 签名密钥
- `API_BASE_URL`: 生产环境 API 地址

### 3. 本地测试部署

```bash
# 执行本地部署脚本
./deploy-local.sh
```

### 4. 生产环境部署

```bash
# 执行生产部署脚本
./deploy.sh
```

## 📁 文件结构

```
cyhj-taro/
├── docker-compose.yml          # Docker Compose 配置
├── Dockerfile.weapp            # 微信小程序构建 Dockerfile
├── nginx.conf                  # Nginx 配置
├── deploy.sh                   # 生产环境部署脚本
├── deploy-local.sh             # 本地测试部署脚本
├── env.template                # 环境变量模板
├── .dockerignore               # Docker 忽略文件
├── production-config.md        # 生产环境配置说明
└── DOCKER_DEPLOYMENT_GUIDE.md  # 本文件
```

## 🔧 服务配置

### Docker Compose 服务

#### 1. NextJS 后端服务 (`nextjs-backend`)
- **镜像**: 基于父级目录的 Dockerfile 构建
- **端口**: 3000 (内部)
- **健康检查**: `/api/health`
- **环境变量**: 从 `../.env.production` 加载

#### 2. 微信小程序构建服务 (`weapp-builder`)
- **镜像**: 基于 `Dockerfile.weapp` 构建
- **功能**: 构建微信小程序代码包
- **输出**: `./dist/` 目录
- **依赖**: NextJS 后端服务

#### 3. Nginx 反向代理 (`nginx`)
- **镜像**: `nginx:alpine`
- **端口**: 80 (HTTP), 443 (HTTPS)
- **功能**: 反向代理、静态文件服务、SSL 终止

### 网络配置

- **cyhj-network**: Docker 内部网络
- **服务间通信**: 通过服务名访问
- **外部访问**: 通过 Nginx 代理

## 🛠️ 部署流程

### 本地测试流程

1. **环境检查**
   ```bash
   ./deploy-local.sh
   ```

2. **验证服务**
   ```bash
   # 检查 NextJS 后端
   curl http://localhost:3000/api/health
   
   # 检查微信小程序构建结果
   ls -la dist/
   ```

3. **查看日志**
   ```bash
   docker-compose logs -f
   ```

### 生产环境流程

1. **服务器准备**
   ```bash
   # 安装 Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # 安装 Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **项目部署**
   ```bash
   # 克隆项目
   git clone <repository-url>
   cd cyhj-taro
   
   # 配置环境变量
   cp env.template ../.env.production
   # 编辑 ../.env.production
   
   # 执行部署
   ./deploy.sh
   ```

3. **SSL 证书配置**（可选）
   ```bash
   # 安装 Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # 获取证书
   sudo certbot --nginx -d your-domain.com
   ```

## 📊 监控和维护

### 服务管理

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service-name]

# 重启服务
docker-compose restart [service-name]

# 停止所有服务
docker-compose down

# 更新服务
docker-compose pull
docker-compose up -d
```

### 健康检查

```bash
# 检查 NextJS 后端
curl http://localhost:3000/api/health

# 检查 Nginx
curl http://localhost/health

# 检查 API 服务
curl http://localhost/api/masterpieces/collections
```

### 备份策略

```bash
# 备份数据库
docker-compose exec nextjs-backend pg_dump -U username database > backup.sql

# 备份微信小程序构建结果
cp -r dist/ backup/weapp-$(date +%Y%m%d)/

# 备份 Docker 镜像
docker save -o backup/images-$(date +%Y%m%d).tar $(docker images | grep cyhj | awk '{print $1":"$2}')
```

## 🔒 安全配置

### 防火墙设置

```bash
# 只开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 安全头配置

Nginx 配置中已包含以下安全头：
- `X-Frame-Options`: 防止点击劫持
- `X-XSS-Protection`: XSS 保护
- `X-Content-Type-Options`: 防止 MIME 类型嗅探
- `Content-Security-Policy`: 内容安全策略

### 环境变量安全

- 不要在代码中硬编码敏感信息
- 使用环境变量文件管理配置
- 定期轮换密钥和密码
- 限制环境变量文件权限

## 🚨 故障排除

### 常见问题

#### 1. 服务启动失败
```bash
# 检查日志
docker-compose logs

# 检查端口占用
sudo netstat -tlnp | grep :3000

# 检查磁盘空间
df -h
```

#### 2. API 连接失败
```bash
# 检查网络连接
docker-compose exec nextjs-backend curl http://localhost:3000/api/health

# 检查环境变量
docker-compose exec nextjs-backend env | grep DATABASE

# 检查数据库连接
docker-compose exec nextjs-backend npx drizzle-kit studio
```

#### 3. 微信小程序构建失败
```bash
# 检查构建日志
docker-compose logs weapp-builder

# 重新构建
docker-compose run --rm weapp-builder

# 检查依赖
docker-compose exec weapp-builder pnpm list
```

#### 4. Nginx 配置问题
```bash
# 检查 Nginx 配置
docker-compose exec nginx nginx -t

# 重新加载配置
docker-compose exec nginx nginx -s reload

# 查看 Nginx 日志
docker-compose logs nginx
```

### 性能优化

1. **启用 Gzip 压缩**（已配置）
2. **配置缓存策略**（已配置）
3. **使用 CDN**（可选）
4. **数据库连接池优化**
5. **镜像大小优化**

## 📞 技术支持

### 日志位置
- **Docker 日志**: `docker-compose logs`
- **应用日志**: 容器内部 `/app/logs/`
- **Nginx 日志**: 容器内部 `/var/log/nginx/`

### 调试命令
```bash
# 进入容器调试
docker-compose exec nextjs-backend sh
docker-compose exec nginx sh

# 查看资源使用
docker stats

# 查看网络配置
docker network ls
docker network inspect cyhj-taro_cyhj-network
```

### 联系信息
如遇到问题，请检查：
1. 服务器资源使用情况
2. Docker 容器状态
3. 网络连接
4. 日志文件
5. 环境变量配置

---

**最后更新**: 2024年12月19日  
**版本**: 1.0.0  
**状态**: 部署配置完成，准备测试 