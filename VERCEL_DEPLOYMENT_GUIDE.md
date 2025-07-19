# Vercel 部署指南

## 概述
本指南将帮助您将智能交互平台部署到 Vercel，实现免费的静态网站托管。

## 前置条件
1. GitHub 账户
2. Vercel 账户（可使用 GitHub 登录）
3. 已配置的 Supabase 项目

## 部署步骤

### 1. 准备代码仓库
```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit"

# 添加远程仓库（替换为您的 GitHub 仓库地址）
git remote add origin https://github.com/yourusername/your-repo-name.git

# 推送到 GitHub
git push -u origin main
```

### 2. 连接 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账户登录
3. 点击 "New Project"
4. 选择您的 GitHub 仓库
5. 点击 "Import"

### 3. 配置项目设置
在 Vercel 项目设置中：

#### 构建设置
- **Framework Preset**: Other
- **Build Command**: 留空（静态网站无需构建）
- **Output Directory**: 留空（使用根目录）
- **Install Command**: 留空

#### 环境变量
在 Vercel 项目设置的 "Environment Variables" 中添加：

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 创建 vercel.json 配置文件
在项目根目录创建 `vercel.json`：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 5. 更新 Supabase 配置
修改 `supabase-config.js`，使其能够从环境变量读取配置：

```javascript
const SUPABASE_CONFIG = {
    // 从环境变量读取，如果没有则使用默认值
    url: window.location.hostname === 'localhost' 
        ? 'YOUR_SUPABASE_URL' 
        : 'https://your-project-id.supabase.co',
    
    anonKey: window.location.hostname === 'localhost'
        ? 'YOUR_SUPABASE_ANON_KEY'
        : 'your_production_anon_key',
    
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
};
```

### 6. 部署
1. 推送代码到 GitHub：
```bash
git add .
git commit -m "Add Vercel configuration"
git push
```

2. Vercel 将自动检测到更改并开始部署
3. 部署完成后，您将获得一个 `.vercel.app` 域名

### 7. 配置自定义域名（可选）
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 按照提示配置 DNS 记录

### 8. 更新 Supabase 设置
在 Supabase 控制台中：
1. 进入 Authentication > Settings
2. 在 "Site URL" 中添加您的 Vercel 域名
3. 在 "Redirect URLs" 中添加：
   - `https://your-app.vercel.app/auth.html`
   - `https://your-app.vercel.app/settings.html`

## 环境配置

### 开发环境
- 使用 `localhost:8000`
- 配置本地 Supabase 设置

### 生产环境
- 使用 Vercel 域名
- 使用生产环境 Supabase 配置

## 常见问题

### Q: 部署后页面显示空白
A: 检查浏览器控制台是否有 JavaScript 错误，通常是 Supabase 配置问题。

### Q: 认证功能不工作
A: 确保在 Supabase 中正确配置了 Site URL 和 Redirect URLs。

### Q: 如何查看部署日志
A: 在 Vercel 项目面板中点击 "Functions" 或 "Deployments" 查看详细日志。

## 成本说明

### Vercel 免费计划包含：
- 100GB 带宽/月
- 无限静态网站
- 自动 HTTPS
- 全球 CDN
- 自定义域名

### Supabase 免费计划包含：
- 500MB 数据库存储
- 50MB 文件存储
- 50,000 月活跃用户
- 2GB 带宽

## 监控和维护
1. 定期检查 Vercel 和 Supabase 的使用量
2. 监控网站性能和错误日志
3. 定期备份 Supabase 数据
4. 保持依赖项更新

## 扩展建议
1. 配置自定义域名和 SSL
2. 设置监控和告警
3. 实现 CI/CD 自动化部署
4. 添加网站分析工具