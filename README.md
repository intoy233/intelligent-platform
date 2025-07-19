# 智能交互平台

一个现代化的Web应用程序，集成了用户认证、摄像头功能和实时聊天界面。

## 🌟 主要功能

### 用户认证系统
- **邮箱注册**：使用邮箱地址进行注册
- **图形验证码**：防止恶意注册的图形验证码
- **邮件验证码**：6位数字验证码，支持真实邮箱发送
- **忘记密码**：完整的密码重置流程，包括邮箱验证和密码强度检查
- **本地存储**：用户信息存储在浏览器本地存储中
- **登录验证**：邮箱和验证码登录验证

### 个人信息管理
- **用户头像**：支持自定义头像上传和默认头像显示
- **昵称设置**：个性化昵称，支持中英文和特殊字符
- **手机号绑定**：可选的手机号码绑定功能
- **安全设置**：密码修改和账户安全管理
- **数据同步**：个人信息实时更新到导航栏显示

### 摄像头功能
- **实时视频**：获取用户摄像头实时画面
- **拍照功能**：支持拍照并下载
- **权限管理**：自动请求摄像头权限
- **控制按钮**：开启/关闭/拍照控制

### 聊天界面
- **实时对话**：用户输入文字进行对话
- **消息显示**：区分用户消息和机器人回复
- **多媒体支持**：支持文件附件和语音输入（模拟）
- **聊天记录**：可清空对话历史

## 🎨 设计特点

- **现代化UI**：毛玻璃效果和渐变背景
- **响应式设计**：适配不同屏幕尺寸
- **流畅动画**：丰富的交互动画效果
- **用户体验**：直观的操作界面

## 📁 文件结构

```
UI/
├── index.html          # 主页面
├── auth.html          # 认证页面
├── profile.html       # 个人信息管理页面
├── settings.html      # 设置页面
├── styles.css         # 主样式文件
├── auth.css          # 认证页面样式
├── profile.css       # 个人信息页面样式
├── settings.css      # 设置页面样式
├── script.js         # 主页面脚本
├── auth.js           # 认证系统脚本
├── profile.js        # 个人信息管理脚本
├── settings.js       # 设置页面脚本
├── EmailJS_ID_Guide.md # EmailJS配置指南
└── README.md         # 项目说明
```

## 🚀 使用方法

1. **启动服务器**
   ```bash
   python -m http.server 8000
   ```

2. **访问应用**
   - 打开浏览器访问 `http://localhost:8000`

3. **注册账户**
   - 点击导航栏的"注册"按钮
   - 输入邮箱地址和图形验证码
   - 点击发送验证码，检查邮箱收到的6位数字验证码
   - 输入验证码完成注册

4. **登录账户**
   - 点击导航栏的"登录"按钮
   - 输入注册时的邮箱和验证码
   - 登录成功后返回主页

5. **使用功能**
   - 开启摄像头查看实时画面
   - 在聊天框中输入文字进行对话
   - 点击导航栏头像进入个人信息管理
   - 在个人信息页面设置头像、昵称和手机号
   - 使用忘记密码功能重置密码
   - 尝试各种交互功能

## 🔧 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **样式**：CSS Grid, Flexbox, CSS动画
- **API**：MediaDevices API (摄像头)
- **邮件服务**：EmailJS (验证码发送)
- **存储**：localStorage (用户数据)
- **图标**：Font Awesome 6.0

## 📝 开发说明

### 验证码系统
- 图形验证码：4位字母数字组合，带视觉干扰
- 邮件验证码：6位随机数字，通过EmailJS发送到用户邮箱
- 降级机制：如果EmailJS未配置，验证码会在控制台显示

### 数据存储
- 用户信息存储在 `localStorage` 中
- 数据结构：
  ```javascript
  // 用户认证信息
  {
    email: "user@example.com",
    verificationCode: "123456",
    registeredAt: "2024-01-01T00:00:00.000Z",
    id: "1704067200000"
  }
  
  // 用户个人资料
  {
    nickname: "用户昵称",
    phone: "13800138000",
    avatar: "data:image/jpeg;base64,/9j/4AAQ...", // Base64编码的头像
    updatedAt: "2024-01-01T00:00:00.000Z"
  }
  ```

### 安全考虑
- 邮箱格式验证
- 验证码过期机制（5分钟）
- 输入防抖和验证
- XSS防护

## 📧 EmailJS 邮件配置

为了让验证码真正发送到用户邮箱，您需要配置EmailJS服务：

### 1. 注册EmailJS账户
1. 访问 [EmailJS官网](https://www.emailjs.com/)
2. 点击 "Sign Up" 注册免费账户
3. 验证您的邮箱地址

### 2. 创建邮件服务
1. 登录EmailJS控制台
2. 点击 "Add New Service"
3. 选择您的邮件服务提供商（推荐Gmail）
4. 按照指引连接您的邮箱账户
5. 记录生成的 **Service ID**

### 3. 创建邮件模板
1. 在控制台点击 "Email Templates"
2. 点击 "Create New Template"
3. 使用以下模板内容：

**邮件主题：**
```
{{platform_name}} - 验证码
```

**邮件内容：**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{platform_name}}</h1>
            <p>您的验证码已生成</p>
        </div>
        <div class="content">
            <p>您好，</p>
            <p>您正在注册 <strong>{{platform_name}}</strong> 账户，请使用以下验证码完成注册：</p>
            
            <div class="code-box">
                <div class="code">{{verification_code}}</div>
            </div>
            
            <p><strong>重要提醒：</strong></p>
            <ul>
                <li>验证码有效期为 {{expiry_time}}</li>
                <li>请勿将验证码告诉他人</li>
                <li>如果您没有申请此验证码，请忽略此邮件</li>
            </ul>
            
            <p>感谢您使用我们的服务！</p>
        </div>
        <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
        </div>
    </div>
</body>
</html>
```

4. 保存模板并记录 **Template ID**

### 4. 获取公钥
1. 在控制台点击 "Account"
2. 找到 "Public Key" 并复制

### 5. 配置应用
在 `auth.js` 文件中找到以下配置并替换：

```javascript
const EMAIL_CONFIG = {
    serviceId: 'your_service_id_here',     // 替换为您的Service ID
    templateId: 'your_template_id_here',   // 替换为您的Template ID
    publicKey: 'your_public_key_here'      // 替换为您的Public Key
};
```

### 6. 测试配置
1. 保存文件并刷新页面
2. 尝试注册新账户
3. 检查邮箱是否收到验证码

### 免费额度
EmailJS免费计划包括：
- 每月200封邮件
- 基础邮件模板
- 标准支持

### 故障排除

**邮件未收到：**
- 检查垃圾邮件文件夹
- 确认邮箱地址正确
- 检查EmailJS服务状态

**配置错误：**
- 确认所有ID和密钥正确
- 检查模板变量名称匹配
- 查看浏览器控制台错误信息

**发送失败：**
- 检查网络连接
- 确认EmailJS服务正常
- 验证邮件服务提供商设置

### 安全建议
- 不要在客户端代码中暴露敏感信息
- 定期更换API密钥
- 监控邮件发送量
- 设置合理的发送频率限制

## 🔮 未来扩展

- [ ] 后端API集成
- [ ] 数据库存储
- [ ] 密码加密
- [ ] 多语言支持
- [ ] 主题切换
- [ ] 语音识别
- [ ] 文件上传
- [ ] 实时聊天机器人
- [ ] 用户头像上传

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！