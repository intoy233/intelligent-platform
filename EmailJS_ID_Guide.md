# EmailJS Service ID 和 Template ID 查看指南

## 📍 快速定位您的ID

### 🔧 Service ID 查看步骤

1. **登录EmailJS控制台**
   - 访问：https://dashboard.emailjs.com/
   - 使用您的账户登录

2. **进入服务管理页面**
   - 在左侧导航栏点击 **"Email Services"**
   - 您会看到已创建的所有邮件服务

3. **查看Service ID**
   ```
   在服务列表中，每个服务都会显示：
   ┌─────────────────────────────────────┐
   │ 📧 Gmail Service                    │
   │ Service ID: service_abc123def       │ ← 这就是您的Service ID
   │ Status: ✅ Connected                │
   └─────────────────────────────────────┘
   ```

4. **复制Service ID**
   - 点击Service ID右侧的复制按钮
   - 或者直接选中文本复制

### 📧 Template ID 查看步骤

1. **进入模板管理页面**
   - 在左侧导航栏点击 **"Email Templates"**
   - 您会看到已创建的所有邮件模板

2. **查看Template ID**
   ```
   在模板列表中，每个模板都会显示：
   ┌─────────────────────────────────────┐
   │ 📝 验证码邮件模板                    │
   │ Template ID: template_xyz789abc     │ ← 这就是您的Template ID
   │ Last Modified: 2024-12-23          │
   └─────────────────────────────────────┘
   ```

3. **复制Template ID**
   - 点击Template ID右侧的复制按钮
   - 或者直接选中文本复制

### 🔑 Public Key 查看步骤

1. **进入账户设置**
   - 在左侧导航栏点击 **"Account"**
   - 或者点击右上角的用户头像选择"Account"

2. **查看Public Key**
   ```
   在账户页面中找到：
   ┌─────────────────────────────────────┐
   │ 🔐 API Keys                         │
   │ Public Key: user_abc123xyz789       │ ← 这就是您的Public Key
   │ [Copy] [Regenerate]                 │
   └─────────────────────────────────────┘
   ```

3. **复制Public Key**
   - 点击"Copy"按钮复制

## 🛠️ 配置到项目中

获取到这三个ID后，在 `auth.js` 文件中替换：

```javascript
// 当前的配置（需要替换）
const EMAIL_CONFIG = {
    serviceId: 'service_your_service_id',     // ❌ 替换这里
    templateId: 'template_your_template_id',  // ❌ 替换这里
    publicKey: 'your_public_key'              // ❌ 替换这里
};

// 替换后的配置（示例）
const EMAIL_CONFIG = {
    serviceId: 'service_abc123def',           // ✅ 您的Service ID
    templateId: 'template_xyz789abc',         // ✅ 您的Template ID
    publicKey: 'user_abc123xyz789'            // ✅ 您的Public Key
};
```

## 🔍 常见问题

### ❓ 找不到Service ID？
- 确保您已经创建了邮件服务
- 检查是否在正确的EmailJS账户中
- 服务状态必须是"Connected"

### ❓ 找不到Template ID？
- 确保您已经创建了邮件模板
- 模板必须保存成功
- 检查模板名称是否正确

### ❓ Public Key在哪里？
- 在Account页面的"API Keys"部分
- 每个账户只有一个Public Key
- 如果看不到，尝试刷新页面

## 🎯 验证配置

配置完成后，您可以通过以下方式验证：

1. **浏览器控制台检查**
   ```javascript
   // 打开浏览器开发者工具，在控制台输入：
   console.log(EMAIL_CONFIG);
   // 应该显示您的真实ID，而不是占位符
   ```

2. **测试发送**
   - 在注册页面输入邮箱
   - 点击"发送验证码"
   - 检查是否收到邮件

3. **错误排查**
   - 如果发送失败，检查浏览器控制台的错误信息
   - 确认所有ID都已正确替换
   - 验证邮件服务状态是否正常

## 📱 移动端查看

如果您使用手机访问EmailJS：

1. **Service ID**：在服务列表中向右滑动可以看到完整ID
2. **Template ID**：在模板详情页面可以找到
3. **Public Key**：在账户设置的API部分

## 🔄 ID更新

如果您需要更新ID：

1. **重新生成Public Key**：在Account页面点击"Regenerate"
2. **创建新服务**：如果当前服务有问题
3. **修改模板**：更新模板内容后ID保持不变

记住：每次更改ID后都需要在代码中更新对应的配置！