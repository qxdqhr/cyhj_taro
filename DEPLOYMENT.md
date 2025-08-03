# 微信小程序部署指南

## 概述

本项目使用 GitHub Actions 进行微信小程序的自动化构建和部署。

## 工作流文件

### `weapp-build.yml`
这是主要的构建工作流，包含以下功能：

- ✅ 自动构建微信小程序
- ✅ 代码质量检查（ESLint + Stylelint）
- ✅ 单元测试
- ✅ 构建产物存档
- ✅ 构建状态通知

## 触发条件

工作流会在以下情况下自动触发：

- 推送到 `main` 分支
- 推送到 `develop` 分支  
- 创建 Pull Request 到 `main` 分支
- 手动触发（workflow_dispatch）

## 使用步骤

### 1. 推送代码
```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

### 2. 查看构建状态
1. 前往 GitHub 仓库页面
2. 点击 "Actions" 标签页
3. 查看最新的工作流运行状态

### 3. 下载构建产物
1. 在 Actions 页面找到成功的构建
2. 点击构建记录
3. 在 "Artifacts" 部分下载 `weapp-build-{版本号}`

### 4. 部署到微信
1. 使用微信开发者工具打开下载的构建产物
2. 预览和测试小程序
3. 上传代码到微信开发者平台

## 构建产物

构建完成后，会在 `dist/` 目录生成以下文件：

```
dist/
├── app.js
├── app.json
├── app.wxss
├── pages/
│   ├── index/
│   ├── cart/
│   ├── collection/
│   └── orders/
└── components/
```

## 注意事项

1. **权限要求**：确保 GitHub Actions 有足够的权限访问仓库
2. **依赖管理**：使用 `npm ci` 确保依赖版本一致性
3. **代码质量**：构建前会进行代码质量检查，确保代码规范
4. **测试覆盖**：建议添加足够的单元测试

## 故障排除

### 构建失败
1. 检查代码质量检查是否通过
2. 确认所有依赖都已正确安装
3. 查看 Actions 日志获取详细错误信息

### 构建产物问题
1. 确认 Taro 配置正确
2. 检查 `app.config.ts` 配置
3. 验证页面路径配置

## 自定义配置

如需修改构建配置，可以编辑以下文件：

- `.github/workflows/weapp-build.yml` - 工作流配置
- `config/index.ts` - Taro 构建配置
- `app.config.ts` - 小程序配置

## 联系支持

如有问题，请查看：
- [Taro 官方文档](https://taro.jd.com/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [GitHub Actions 文档](https://docs.github.com/en/actions) 