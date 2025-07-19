# Supabase 免费数据库设置指南

## 概述
本指南将帮助您设置 Supabase 免费数据库，替代当前的 localStorage 存储方案，实现真正的多用户支持。

## 免费方案优势
✅ **完全免费** - 无需信用卡  
✅ **真实数据库** - PostgreSQL 数据库  
✅ **用户认证** - 内置身份验证系统  
✅ **实时功能** - 支持实时数据同步  
✅ **API 自动生成** - 自动生成 RESTful API  
✅ **全球 CDN** - 快速访问速度  

## 免费计划限制
- 数据库存储：500MB
- 文件存储：50MB  
- 月活跃用户：50,000
- 带宽：2GB/月
- 项目数量：2个

> 💡 对于个人项目和小型应用，这些限制完全足够使用！

## 第一步：创建 Supabase 项目

### 1. 注册账户
1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub 账户登录（推荐）或邮箱注册
4. 验证邮箱地址

### 2. 创建新项目
1. 点击 "New Project"
2. 选择组织（个人账户）
3. 填写项目信息：
   - **Name**: `智能交互平台` 或 `smart-interaction-platform`
   - **Database Password**: 设置一个强密码（请记住此密码）
   - **Region**: 选择 `Southeast Asia (Singapore)` 或 `Northeast Asia (Tokyo)`
4. 点击 "Create new project"
5. 等待 2-3 分钟项目初始化完成

## 第二步：创建数据库表

### 1. 进入 SQL 编辑器
1. 在项目面板左侧点击 "SQL Editor"
2. 点击 "New query"

### 2. 创建用户资料表
```sql
-- 创建用户资料表
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nickname TEXT,
    phone TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. 创建验证码表
```sql
-- 创建验证码表
CREATE TABLE verification_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('register', 'reset_password')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX idx_verification_codes_email ON verification_codes(email);
CREATE INDEX idx_verification_codes_expires_at ON verification_codes(expires_at);
```

### 4. 创建用户设置表
```sql
-- 创建用户设置表
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'zh-CN',
    notifications JSONB DEFAULT '{"email": true, "push": true}',
    privacy JSONB DEFAULT '{"profile_public": false, "show_online": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 创建更新时间触发器
CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. 执行 SQL
1. 将上述 SQL 代码复制到编辑器中
2. 点击 "Run" 执行
3. 确认所有表都创建成功

## 第三步：配置行级安全（RLS）

### 1. 启用 RLS
```sql
-- 启用行级安全
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

### 2. 创建安全策略
```sql
-- 用户资料表策略
CREATE POLICY "用户只能查看自己的资料" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户只能更新自己的资料" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的资料" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 验证码表策略（允许匿名访问用于注册）
CREATE POLICY "允许插入验证码" ON verification_codes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "允许查询验证码" ON verification_codes
    FOR SELECT USING (true);

CREATE POLICY "允许更新验证码状态" ON verification_codes
    FOR UPDATE USING (true);

-- 用户设置表策略
CREATE POLICY "用户只能查看自己的设置" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的设置" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的设置" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 第四步：获取项目配置

### 1. 获取项目 URL 和密钥
1. 在项目面板点击 "Settings"
2. 点击 "API"
3. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` (很长的字符串)

### 2. 配置项目
1. 打开项目中的 `supabase-config.js` 文件
2. 替换配置信息：
```javascript
const SUPABASE_CONFIG = {
    // 替换为您的项目 URL
    url: 'https://your-project-id.supabase.co',
    
    // 替换为您的 anon key
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
};
```

## 第五步：配置认证

### 1. 启用 Email 提供商
1. 在项目面板点击 "Authentication"
2. 点击 "Providers"
3. 确保 "Email" 提供商已启用
4. 配置以下设置：
   - **Enable email confirmations**: 关闭（简化注册流程）
   - **Enable email change confirmations**: 开启
   - **Enable secure password change**: 开启

### 2. 设置邮件模板
1. 点击 "Email Templates"
2. 自定义邮件模板（可选）：
   - 确认邮件
   - 重置密码邮件
   - 邮箱变更确认

### 3. 配置站点 URL
1. 在左侧菜单点击 **"Authentication"**
2. 点击 **"URL Configuration"** 标签页
3. 在 **"Site URL"** 字段中输入：
   - 开发环境: `http://localhost:8000`
   - 生产环境: `https://your-domain.vercel.app`
4. 在 **"Redirect URLs"** 部分点击 **"Add URL"** 按钮，添加以下 URL：
   - `http://localhost:8000/auth.html`
   - `http://localhost:8000/settings.html`
   - `https://your-domain.vercel.app/auth.html`
   - `https://your-domain.vercel.app/settings.html`

> 💡 **注意**: 如果您看不到 "URL Configuration" 标签，请确保您在 Authentication 页面，然后查找 "Settings" 或 "Configuration" 相关的标签页。

## 第六步：测试连接

### 1. 本地测试
1. 启动本地服务器：`python -m http.server 8000`
2. 打开浏览器访问 `http://localhost:8000/auth.html`
3. 打开浏览器控制台，查看是否有 "Supabase 客户端初始化成功" 消息
4. 尝试注册新用户测试功能

### 2. 验证数据库
1. 在 Supabase 控制台点击 "Table Editor"
2. 查看 `user_profiles` 表是否有新注册的用户数据
3. 检查 `auth.users` 表中的认证信息

## 下一步计划

### ✅ 已完成
- [x] Supabase 项目设置
- [x] 数据库表创建
- [x] 安全策略配置
- [x] 客户端集成

### 🔄 进行中
- [ ] 重构认证系统使用 Supabase
- [ ] 数据迁移工具
- [ ] 用户界面更新

### 📋 待完成
- [ ] 部署到 Vercel
- [ ] 生产环境配置
- [ ] 性能优化
- [ ] 用户文档更新

## 故障排除

### 常见问题

**Q: 初始化失败，显示 "Invalid API key"**  
A: 检查 `supabase-config.js` 中的 URL 和 anon key 是否正确复制

**Q: 注册用户后在数据库中看不到数据**  
A: 检查 RLS 策略是否正确配置，确保用户有插入权限

**Q: 本地开发时认证不工作**  
A: 确保在 Supabase 认证设置中添加了 `http://localhost:8000` 作为站点 URL

**Q: 超出免费计划限制怎么办？**  
A: 可以升级到 Pro 计划（$25/月）或优化数据使用

### 获取帮助
- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase Discord 社区](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## 成本预估

### 免费计划（推荐开始）
- **成本**: $0/月
- **适用于**: 个人项目、原型开发、小型应用
- **限制**: 500MB 存储、50K 用户、2GB 带宽

### Pro 计划（扩展选项）
- **成本**: $25/月
- **适用于**: 生产应用、商业项目
- **包含**: 8GB 存储、100K 用户、50GB 带宽

> 💡 **建议**: 先使用免费计划开发和测试，需要时再升级到 Pro 计划。