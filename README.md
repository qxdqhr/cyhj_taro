# 葱韵环京微信小程序 (cyhj-taro)

基于 Taro 框架开发的微信小程序，展示艺术画集和商品。

## 项目概述

本项目是将 showmasterpiece 模块的用户端前端部分迁移到微信小程序的实现。使用 Taro 3.x 框架进行跨平台开发，保持代码的可维护性和复用性。

## 技术栈

- **框架**: Taro 3.x (React)
- **语言**: TypeScript
- **样式**: Taro UI + 自定义样式
- **状态管理**: React Context + Custom Hooks
- **构建工具**: Vite
- **包管理**: pnpm

## 功能特性

### 已实现功能 ✅
- 画集列表展示
- 画集详情浏览
- 缩略图侧边栏
- 购物车功能
- 分类筛选功能
- 响应式设计适配

### 待实现功能 ⏳
- 用户认证和权限控制
- 订单管理功能
- 历史记录页面
- 文件上传功能

## 项目结构

```
cyhj-taro/
├── src/
│   ├── components/          # 组件目录
│   ├── contexts/           # React Context
│   ├── hooks/              # 自定义 Hooks
│   ├── pages/              # 页面组件
│   │   ├── index/          # 主页面
│   │   ├── collection/     # 画集详情页
│   │   └── cart/           # 购物车页面
│   ├── services/           # API 服务层
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── app.ts              # 应用入口
│   ├── app.config.ts       # 应用配置
│   └── app.css             # 全局样式
├── config/                 # Taro 配置
├── types/                  # 全局类型定义
└── docs/                   # 文档
```

## 开发环境

### 环境要求
- Node.js >= 16
- pnpm >= 7
- 微信开发者工具

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
# 微信小程序开发
pnpm dev:weapp

# H5 开发
pnpm dev:h5
```

### 构建
```bash
# 构建微信小程序
pnpm build:weapp

# 构建 H5
pnpm build:h5
```

## 配置说明

### API 配置
在 `src/services/` 目录下的服务文件中，需要配置正确的 API 地址：

```typescript
const API_BASE_URL = 'https://your-api-domain.com'; // 替换为实际的API地址
```

### 微信小程序配置
在 `project.config.json` 中配置小程序的基本信息：

```json
{
  "appid": "your-app-id",
  "projectname": "cyhj-taro"
}
```

## 核心组件

### 1. 画集卡片组件 (CollectionCard)
- 展示画集封面和基本信息
- 支持懒加载和错误处理
- 适配不同商品类型

### 2. 作品查看器 (ArtworkViewer)
- 展示单个作品的详细内容
- 支持翻页操作
- 图片加载状态处理

### 3. 缩略图侧边栏 (ThumbnailSidebar)
- 展示作品集的缩略图导航
- 支持懒加载
- 当前页面高亮显示

### 4. 购物车组件
- 购物车按钮 (CartButton)
- 添加到购物车按钮 (AddToCartButton)
- 购物车弹窗 (CartModal)

## 状态管理

### 购物车状态管理
使用 `CartContext` 和 `useCart` Hook 管理购物车状态：

```typescript
import { CartProvider, useCartContext } from './contexts/CartContext';
import { useCart } from './hooks/useCart';

// 在组件中使用
const { cart, loading, error } = useCartContext();
const { addItemToCart, updateItemQuantity } = useCart(userId);
```

### 画集数据管理
使用 `useMasterpieces` Hook 管理画集数据：

```typescript
import { useMasterpieces } from './hooks/useMasterpieces';

const {
  collections,
  selectedCollection,
  currentPage,
  selectCollection,
  nextPage,
  prevPage
} = useMasterpieces();
```

## API 接口

### 画集相关接口
- `GET /api/masterpieces/collections` - 获取所有画集
- `GET /api/masterpieces/collections/:id` - 获取指定画集
- `GET /api/masterpieces/collections/search` - 搜索画集
- `GET /api/masterpieces/config` - 获取系统配置

### 购物车相关接口
- `GET /api/cart/:userId` - 获取用户购物车
- `POST /api/cart/:userId/add` - 添加到购物车
- `PUT /api/cart/:userId/update` - 更新购物车项
- `DELETE /api/cart/:userId/remove` - 从购物车移除
- `DELETE /api/cart/:userId/clear` - 清空购物车
- `POST /api/cart/:userId/booking` - 批量预订

## 样式系统

### 响应式设计
- 使用 Taro 的响应式单位
- 适配不同屏幕尺寸
- 移动端优先的设计

### 主题适配
- 支持浅色/深色主题
- 适配微信小程序主题
- 保持品牌一致性

## 性能优化

### 图片优化
- 使用小程序图片压缩
- 实现图片懒加载
- 优化图片缓存策略

### 组件优化
- 使用 React.memo 优化渲染
- 实现虚拟滚动
- 减少不必要的重渲染

### 数据优化
- 实现数据分页加载
- 优化缓存策略
- 减少网络请求

## 开发规范

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 组件规范
- 使用函数式组件
- 使用 Hooks 管理状态
- 保持组件的单一职责

### 命名规范
- 组件使用 PascalCase
- 文件使用 kebab-case
- 变量使用 camelCase

## 部署说明

### 微信小程序部署
1. 构建项目：`pnpm build:weapp`
2. 在微信开发者工具中导入项目
3. 上传代码到微信小程序后台
4. 提交审核并发布

### H5 部署
1. 构建项目：`pnpm build:h5`
2. 将 `dist` 目录部署到 Web 服务器

## 常见问题

### 1. 网络请求失败
- 检查 API 地址配置
- 确认网络连接正常
- 检查微信小程序的域名白名单配置

### 2. 图片加载失败
- 检查图片地址是否正确
- 确认图片格式支持
- 检查网络连接

### 3. 购物车数据不同步
- 检查用户 ID 是否正确
- 确认购物车上下文是否正确配置
- 检查网络请求是否成功

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：
- 邮箱：your-email@example.com
- 微信：your-wechat-id 