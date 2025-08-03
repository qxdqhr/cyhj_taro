# 日志系统说明

## 🎯 概述

为了便于调试和监控 Taro 小程序的运行状态，我们实现了一套完整的日志记录系统。所有重要的操作、API 请求、状态变更都会记录详细的日志信息。

## 📊 日志分类

### 1. API 请求日志
- **前缀**: `🌐 [API]` / `🛒 [Cart API]`
- **内容**: 请求 URL、方法、参数、响应状态、数据长度
- **示例**:
```
🌐 [API] 发起请求: { url: "http://localhost:3000/api/masterpieces/collections", method: "GET" }
✅ [API] 请求成功: { statusCode: 200, dataLength: 3 }
```

### 2. 服务层日志
- **前缀**: `📚 [Service]` / `⚙️ [Config]`
- **内容**: 服务调用、数据处理、配置加载
- **示例**:
```
📚 [Service] 开始获取所有画集...
✅ [Service] 成功获取画集数据: { 画集数量: 3, 画集列表: [...] }
```

### 3. Hook 状态日志
- **前缀**: `🔄 [Hook]` / `🎯 [Hook]` / `➡️ [Hook]` / `⬅️ [Hook]`
- **内容**: 数据加载、状态变更、用户操作
- **示例**:
```
🔄 [Hook] 开始加载画集数据... { forceRefresh: false }
✅ [Hook] 数据加载成功: { 画集数量: 3, 画集列表: [...] }
🎯 [Hook] 选择画集: { id: 19, title: "aa", category: "画集", 作品数量: 5 }
```

### 4. 购物车日志
- **前缀**: `🛒 [Cart Hook]` / `🔄 [Cart Context]`
- **内容**: 购物车操作、数据刷新、事件触发
- **示例**:
```
🛒 [Cart Hook] 开始添加商品到购物车: { userId: 1, collectionId: 19, quantity: 1 }
✅ [Cart Hook] 添加购物车成功
🔄 [Cart Context] 开始刷新购物车数据: { userId: 1 }
```

### 5. 页面组件日志
- **前缀**: `🚀 [Page]` / `🔍 [Page]`
- **内容**: 页面生命周期、用户交互、数据过滤
- **示例**:
```
🚀 [Page] 页面组件挂载，开始加载配置
⚙️ [Page] 开始加载系统配置...
✅ [Page] 系统配置加载成功: { siteName: "艺术画集展览馆", ... }
🔍 [Page] 画集过滤结果: { 选中分类: "画集", 总画集数: 3, 过滤后数量: 3 }
```

### 6. 上下文日志
- **前缀**: `🚀 [Cart Context]` / `👂 [Cart Context]` / `📢 [Cart Context]`
- **内容**: 上下文初始化、事件监听、状态更新
- **示例**:
```
🚀 [Cart Context] 组件初始化，开始加载购物车数据
👂 [Cart Context] 注册购物车更新事件监听器
📢 [Cart Context] 触发购物车更新事件
```

## 🔧 日志级别

### 信息级别 (Info)
- ✅ 成功操作
- 🔄 开始操作
- 📡 网络请求
- 🎯 用户操作

### 警告级别 (Warning)
- ⚠️ 边界条件
- 📦 使用缓存

### 错误级别 (Error)
- ❌ 操作失败
- 🧹 清理操作

## 📱 在微信开发者工具中查看日志

1. **打开微信开发者工具**
2. **导入项目**: 选择 `cyhj-taro/dist` 目录
3. **打开调试器**: 点击底部的"调试器"标签
4. **查看控制台**: 在调试器中选择"Console"标签
5. **实时监控**: 日志会实时显示在控制台中

## 🎯 日志内容示例

### 页面加载流程
```
🚀 [Page] 页面组件挂载，开始加载配置
⚙️ [Page] 开始加载系统配置...
⚙️ [Config] 开始获取系统配置...
🌐 [API] 发起请求: { url: "http://localhost:3000/api/masterpieces/config", method: "GET" }
✅ [API] 请求成功: { statusCode: 200, dataLength: "N/A" }
✅ [Config] 成功获取系统配置: { siteName: "艺术画集展览馆", ... }
✅ [Page] 系统配置加载成功: { siteName: "艺术画集展览馆", ... }

🚀 [Cart Context] 组件初始化，开始加载购物车数据
🔄 [Cart Context] 开始刷新购物车数据: { userId: 1 }
📡 [Cart Context] 调用购物车服务...
🛒 [Cart API] 发起请求: { url: "http://localhost:3000/api/cart/1", method: "GET" }
✅ [Cart API] 请求成功: { statusCode: 200, dataLength: "N/A" }
✅ [Cart Context] 购物车数据刷新成功: { 商品数量: 0, 总数量: 0, 总价格: 0 }

🔄 [Hook] 开始加载画集数据... { forceRefresh: false }
🌐 [Hook] 从服务器获取数据...
📚 [Service] 开始获取所有画集...
🌐 [API] 发起请求: { url: "http://localhost:3000/api/masterpieces/collections", method: "GET" }
✅ [API] 请求成功: { statusCode: 200, dataLength: 3 }
✅ [Service] 成功获取画集数据: { 画集数量: 3, 画集列表: [...] }
✅ [Hook] 数据加载成功: { 画集数量: 3, 画集列表: [...] }
🔍 [Page] 画集过滤结果: { 选中分类: "画集", 总画集数: 3, 过滤后数量: 3 }
```

### 用户交互流程
```
🎯 [Hook] 选择画集: { id: 19, title: "aa", category: "画集", 作品数量: 5 }
➡️ [Hook] 尝试下一页: { 当前页: 0, 总页数: 5, 画集标题: "aa" }
✅ [Hook] 切换到下一页: { 新页: 1 }

🛒 [Page] 用户点击购物车按钮
🛒 [Cart Hook] 开始添加商品到购物车: { userId: 1, collectionId: 19, quantity: 1, collection: "aa" }
📡 [Cart Hook] 调用添加购物车服务...
🛒 [Cart API] 发起请求: { url: "http://localhost:3000/api/cart/1/add", method: "POST", data: {...} }
✅ [Cart API] 请求成功: { statusCode: 200, dataLength: "N/A" }
✅ [Cart Hook] 添加购物车成功
📢 [Cart Context] 触发购物车更新事件
📢 [Cart Context] 收到购物车更新事件，开始刷新数据
🔄 [Cart Context] 开始刷新购物车数据: { userId: 1 }
```

## 🛠️ 调试技巧

### 1. 过滤特定类型的日志
在控制台中使用搜索功能：
- 搜索 `[API]` 查看所有 API 请求
- 搜索 `[Hook]` 查看状态变更
- 搜索 `[Page]` 查看页面操作
- 搜索 `❌` 查看所有错误

### 2. 监控关键操作
- **页面加载**: 搜索 `🚀 [Page]`
- **数据加载**: 搜索 `🔄 [Hook]`
- **用户交互**: 搜索 `🎯 [Hook]`
- **购物车操作**: 搜索 `🛒 [Cart`

### 3. 错误排查
- 搜索 `❌` 查看所有错误信息
- 查看错误前后的日志了解上下文
- 检查 API 请求状态码和数据

## 📝 注意事项

1. **性能影响**: 日志记录会轻微影响性能，生产环境可考虑关闭
2. **隐私保护**: 日志中不包含敏感信息，但建议在生产环境中谨慎使用
3. **存储限制**: 微信开发者工具的控制台有日志数量限制，长时间运行可能需要清理

---

**最后更新**: 2024年12月19日  
**状态**: 日志系统完整实现，可用于调试和监控 