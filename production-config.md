# 生产环境配置指南

## 📋 部署前准备

### 1. 服务器环境要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 最少 2GB，推荐 4GB+
- **存储**: 最少 10GB 可用空间
- **网络**: 公网 IP 和域名

### 2. 域名和 SSL 证书
- 申请域名并解析到服务器 IP
- 配置 SSL 证书（推荐使用 Let's Encrypt）
- 在微信小程序后台配置服务器域名白名单

### 3. 环境变量配置

#### NextJS 后端环境变量 (../.env.production)
```bash
# 数据库配置
DATABASE_URL=postgresql://username:password@host:port/database

# OSS 配置（阿里云）
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
OSS_REGION=oss-cn-hangzhou
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com

# 七牛云配置（可选）
QINIU_ACCESS_KEY=your_qiniu_access_key
QINIU_SECRET_KEY=your_qiniu_secret_key
QINIU_BUCKET=your_qiniu_bucket
QINIU_DOMAIN=your_qiniu_domain

# JWT 密钥
JWT_SECRET=your_jwt_secret_key

# 其他配置
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
```

#### 微信小程序配置
- 更新 `src/services/*.ts` 中的 API 基础地址
- 配置微信小程序服务器域名白名单

## 🚀 部署步骤

### 1. 服务器环境准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER
```

### 2. 项目部署
```bash
# 克隆项目到服务器
git clone <your-repository-url>
cd cyhj-taro

# 配置环境变量
cp ../.env.example ../.env.production
# 编辑 ../.env.production 文件，填入生产环境配置

# 执行部署脚本
./deploy.sh
```

### 3. SSL 证书配置（可选）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 更新 Nginx 配置
# 取消注释 nginx.conf 中的 SSL 配置部分
```

## 🔧 配置说明

### Docker Compose 服务架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80/443)│────│ NextJS Backend  │────│   Database      │
│   (反向代理)     │    │   (API 服务)    │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         │
┌─────────────────┐
│ WeApp Builder   │
│ (小程序构建)     │
└─────────────────┘
```

### 端口配置
- **80**: HTTP 端口（重定向到 HTTPS）
- **443**: HTTPS 端口
- **3000**: NextJS 后端服务端口（内部）
- **8080**: 微信小程序静态文件服务端口（可选）

### 网络配置
- **cyhj-network**: Docker 内部网络
- **外部访问**: 通过 Nginx 反向代理

## 📊 监控和维护

### 1. 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f nextjs-backend
docker-compose logs -f nginx
```

### 2. 服务管理
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新服务
docker-compose pull
docker-compose up -d
```

### 3. 备份策略
```bash
# 备份数据库
docker-compose exec nextjs-backend pg_dump -U username database > backup.sql

# 备份微信小程序构建结果
cp -r dist/ backup/weapp-$(date +%Y%m%d)/

# 备份 Docker 镜像
docker save -o backup/images-$(date +%Y%m%d).tar $(docker images | grep cyhj | awk '{print $1":"$2}')
```

### 4. 健康检查
```bash
# 检查服务状态
curl http://localhost/health

# 检查 API 服务
curl http://localhost/api/masterpieces/collections

# 检查微信小程序静态文件
curl http://localhost/weapp/
```

## 🔒 安全配置

### 1. 防火墙配置
```bash
# 只开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. 安全头配置
- 已在 Nginx 配置中设置了安全头
- 包括 X-Frame-Options、X-XSS-Protection 等

### 3. 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用环境变量文件管理配置
- 定期轮换密钥和密码

## 🚨 故障排除

### 常见问题

1. **服务启动失败**
   ```bash
   # 检查日志
   docker-compose logs
   
   # 检查端口占用
   sudo netstat -tlnp | grep :3000
   ```

2. **API 连接失败**
   ```bash
   # 检查网络连接
   docker-compose exec nextjs-backend curl http://localhost:3000/health
   
   # 检查环境变量
   docker-compose exec nextjs-backend env | grep DATABASE
   ```

3. **微信小程序构建失败**
   ```bash
   # 检查构建日志
   docker-compose logs weapp-builder
   
   # 重新构建
   docker-compose run --rm weapp-builder
   ```

### 性能优化

1. **启用 Gzip 压缩**（已配置）
2. **配置缓存策略**（已配置）
3. **使用 CDN**（可选）
4. **数据库连接池优化**
5. **镜像大小优化**

## 📞 技术支持

如遇到问题，请检查：
1. 服务器资源使用情况
2. Docker 容器状态
3. 网络连接
4. 日志文件
5. 环境变量配置 