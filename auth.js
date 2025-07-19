// 主题管理
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && savedTheme !== 'light') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// 页面加载时应用主题 - 已合并到下方的初始化函数中

// 邮箱发送配置
const EMAIL_CONFIG = {
    serviceId: 'service_cs2ng9c', // 需要替换为您的EmailJS服务ID
    templateId: 'template_aw1c566', // 需要替换为您的EmailJS模板ID
    publicKey: '4QLRk9ldORMx6JJvT' // 需要替换为您的EmailJS公钥
};

// 用户认证系统
class AuthSystem {
    constructor() {
        this.currentCaptcha = '';
        this.currentEmail = '';
        this.currentVerificationCode = '';
        this.countdownTimer = null;
        this.init();
    }

    init() {
        this.initEmailJS();
        this.bindEvents();
        this.generateCaptcha();
        this.loadUserSession();
    }

    // 初始化EmailJS
    initEmailJS() {
        // 检查EmailJS是否可用
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAIL_CONFIG.publicKey);
            console.log('EmailJS 初始化成功');
        } else {
            console.warn('EmailJS 未加载，将使用模拟发送模式');
        }
    }

    // 绑定事件监听器
    bindEvents() {
        try {
            // 表单提交事件
            const loginForm = document.getElementById('loginFormElement');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }

            const registerForm = document.getElementById('registerFormElement');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRegister();
                });
            }

            // 验证码输入事件
            const codeInputs = document.querySelectorAll('.code-digit');
            codeInputs.forEach((input, index) => {
                input.addEventListener('input', (e) => this.handleCodeInput(e, index));
                input.addEventListener('keydown', (e) => this.handleCodeKeydown(e, index));
                input.addEventListener('paste', (e) => this.handleCodePaste(e));
            });

            // 验证按钮事件
            const verifyCodeBtn = document.getElementById('verifyCode');
            if (verifyCodeBtn) {
                verifyCodeBtn.addEventListener('click', () => {
                    this.verifyRegistrationCode();
                });
            }

            const resendCodeBtn = document.getElementById('resendCode');
            if (resendCodeBtn) {
                resendCodeBtn.addEventListener('click', () => {
                    this.resendVerificationCode();
                });
            }

            // 密码设置事件
            const newPasswordInput = document.getElementById('newPassword');
            if (newPasswordInput) {
                newPasswordInput.addEventListener('input', () => {
                    this.checkPasswordStrength();
                    this.validatePasswordRequirements();
                });
            }

            const confirmPasswordInput = document.getElementById('confirmPassword');
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', () => {
                    this.validatePasswordMatch();
                });
            }

            const completeRegBtn = document.getElementById('completeRegistration');
            if (completeRegBtn) {
                completeRegBtn.addEventListener('click', () => {
                    this.completeRegistration();
                });
            }

            const backToVerifyBtn = document.getElementById('backToVerification');
            if (backToVerifyBtn) {
                backToVerifyBtn.addEventListener('click', () => {
                    this.backToVerification();
                });
            }

            // 密码显示/隐藏切换
            document.querySelectorAll('.password-toggle').forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    this.togglePasswordVisibility(e.target);
                });
            });

            // 找回密码相关事件
            const forgotPasswordForm = document.getElementById('forgotPasswordFormElement');
            if (forgotPasswordForm) {
                forgotPasswordForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleForgotPassword();
                });
            }

            // 重置验证码输入事件
            const resetCodeInputs = document.querySelectorAll('.reset-code-digit');
            resetCodeInputs.forEach((input, index) => {
                input.addEventListener('input', (e) => this.handleResetCodeInput(e, index));
                input.addEventListener('keydown', (e) => this.handleResetCodeKeydown(e, index));
                input.addEventListener('paste', (e) => this.handleResetCodePaste(e));
            });

            // 重置验证按钮事件
            const verifyResetCodeBtn = document.getElementById('verifyResetCode');
            if (verifyResetCodeBtn) {
                verifyResetCodeBtn.addEventListener('click', () => {
                    this.verifyResetCode();
                });
            }

            const resendResetCodeBtn = document.getElementById('resendResetCode');
            if (resendResetCodeBtn) {
                resendResetCodeBtn.addEventListener('click', () => {
                    this.resendResetCode();
                });
            }

            // 重置密码设置事件
            const resetNewPasswordInput = document.getElementById('resetNewPassword');
            if (resetNewPasswordInput) {
                resetNewPasswordInput.addEventListener('input', () => {
                    this.checkResetPasswordStrength();
                    this.validateResetPasswordRequirements();
                });
            }

            const resetConfirmPasswordInput = document.getElementById('resetConfirmPassword');
            if (resetConfirmPasswordInput) {
                resetConfirmPasswordInput.addEventListener('input', () => {
                    this.validateResetPasswordMatch();
                });
            }

            const completeResetBtn = document.getElementById('completePasswordReset');
            if (completeResetBtn) {
                completeResetBtn.addEventListener('click', () => {
                    this.completePasswordReset();
                });
            }

            console.log('事件绑定完成');
        } catch (error) {
            console.error('绑定事件时发生错误:', error);
        }
    }

    // 生成图形验证码
    generateCaptcha() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let captcha = '';
        for (let i = 0; i < 4; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.currentCaptcha = captcha;
        
        const captchaDisplay = document.getElementById('captchaDisplay');
        const captchaText = document.getElementById('captchaText');
        
        // 添加视觉干扰
        captchaText.textContent = captcha;
        captchaDisplay.style.background = this.generateCaptchaBackground();
        captchaDisplay.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
        
        console.log('生成的验证码:', captcha); // 开发时显示，生产环境应移除
    }

    generateCaptchaBackground() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        return `linear-gradient(${Math.random() * 360}deg, ${color1}20, ${color2}20)`;
    }

    // 处理登录
    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!this.validateEmail(email)) {
            this.showError('loginEmail', '请输入有效的邮箱地址');
            return;
        }

        if (!password) {
            this.showError('loginPassword', '请输入密码');
            return;
        }

        this.showLoading();

        try {
            // 模拟网络延迟
            await this.delay(1000);

            const users = this.getStoredUsers();
            const user = users.find(u => u.email === email);

            if (!user) {
                this.hideLoading();
                this.showError('loginEmail', '账号不存在');
                return;
            }

            if (user.password !== password) {
                this.hideLoading();
                this.showError('loginPassword', '密码错误');
                return;
            }

            // 登录成功
            this.hideLoading();
            this.setUserSession(user);
            this.showSuccessModal('登录成功！', () => {
                window.location.href = 'index.html';
            });

        } catch (error) {
            this.hideLoading();
            this.showNotification('登录失败，请稍后重试', 'error');
        }
    }

    // 处理注册
    async handleRegister() {
        const email = document.getElementById('registerEmail').value.trim();
        const captcha = document.getElementById('captcha').value.trim();

        if (!this.validateEmail(email)) {
            this.showError('registerEmail', '请输入有效的邮箱地址');
            return;
        }

        if (!captcha) {
            this.showError('captcha', '请输入图形验证码');
            return;
        }

        if (captcha.toUpperCase() !== this.currentCaptcha) {
            this.showError('captcha', '图形验证码错误');
            this.generateCaptcha();
            return;
        }

        // 检查邮箱是否已注册
        const users = this.getStoredUsers();
        if (users.find(u => u.email === email)) {
            this.showError('registerEmail', '该邮箱已注册');
            return;
        }

        this.showLoading();

        try {
            this.currentEmail = email;
            this.currentVerificationCode = this.generateVerificationCode();
            
            // 尝试发送真实邮件
            const emailSent = await this.sendVerificationEmail(email, this.currentVerificationCode);
            
            this.hideLoading();
            this.showVerificationStage();
            this.startCountdown();
            
            if (emailSent) {
                this.showNotification(`验证码已发送至 ${email}，请查收邮件`, 'success');
            } else {
                this.showNotification(`验证码已生成，开发模式下请查看控制台: ${this.currentVerificationCode}`, 'warning');
                console.log('验证码:', this.currentVerificationCode);
            }

        } catch (error) {
            this.hideLoading();
            this.showNotification('发送验证码失败，请稍后重试', 'error');
            console.error('发送邮件错误:', error);
        }
    }

    // 发送验证码邮件
    async sendVerificationEmail(email, code) {
        // 检查EmailJS是否可用且配置是否完整
        if (typeof emailjs === 'undefined' || 
            EMAIL_CONFIG.serviceId === 'service_your_service_id' ||
            EMAIL_CONFIG.templateId === 'template_your_template_id' ||
            EMAIL_CONFIG.publicKey === 'your_public_key') {
            
            console.warn('EmailJS 未配置或不可用，使用模拟模式');
            return false;
        }

        try {
            const templateParams = {
                to_email: email,
                verification_code: code,
                user_email: email,
                platform_name: '智能交互平台',
                expiry_time: '5分钟'
            };

            const response = await emailjs.send(
                EMAIL_CONFIG.serviceId,
                EMAIL_CONFIG.templateId,
                templateParams
            );

            console.log('邮件发送成功:', response);
            return true;

        } catch (error) {
            console.error('邮件发送失败:', error);
            return false;
        }
    }

    // 生成6位数字验证码
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // 显示验证码输入阶段
    showVerificationStage() {
        document.getElementById('registerFormElement').style.display = 'none';
        document.getElementById('verificationStage').classList.remove('hidden');
        document.getElementById('emailDisplay').textContent = this.currentEmail;
        
        // 清空验证码输入框
        document.querySelectorAll('.code-digit').forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
        
        // 聚焦第一个输入框
        document.querySelector('.code-digit').focus();
    }

    // 处理验证码输入
    handleCodeInput(event, index) {
        const input = event.target;
        const value = input.value;

        // 只允许数字
        if (!/^\d$/.test(value)) {
            input.value = '';
            return;
        }

        input.classList.add('filled');

        // 自动跳转到下一个输入框
        if (value && index < 5) {
            const nextInput = document.querySelector(`[data-index="${index + 1}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }

        // 检查是否所有输入框都已填写
        this.checkCodeComplete();
    }

    // 处理验证码输入框键盘事件
    handleCodeKeydown(event, index) {
        const input = event.target;

        if (event.key === 'Backspace') {
            if (!input.value && index > 0) {
                // 如果当前输入框为空，跳转到前一个输入框
                const prevInput = document.querySelector(`[data-index="${index - 1}"]`);
                if (prevInput) {
                    prevInput.focus();
                    prevInput.value = '';
                    prevInput.classList.remove('filled');
                }
            } else {
                input.classList.remove('filled');
            }
        } else if (event.key === 'ArrowLeft' && index > 0) {
            const prevInput = document.querySelector(`[data-index="${index - 1}"]`);
            if (prevInput) prevInput.focus();
        } else if (event.key === 'ArrowRight' && index < 5) {
            const nextInput = document.querySelector(`[data-index="${index + 1}"]`);
            if (nextInput) nextInput.focus();
        }
    }

    // 处理验证码粘贴
    handleCodePaste(event) {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text');
        const digits = pasteData.replace(/\D/g, '').slice(0, 6);

        if (digits.length === 6) {
            const inputs = document.querySelectorAll('.code-digit');
            digits.split('').forEach((digit, index) => {
                inputs[index].value = digit;
                inputs[index].classList.add('filled');
            });
            this.checkCodeComplete();
        }
    }

    // 检查验证码是否完整
    checkCodeComplete() {
        const inputs = document.querySelectorAll('.code-digit');
        const code = Array.from(inputs).map(input => input.value).join('');
        
        const verifyButton = document.getElementById('verifyCode');
        if (code.length === 6) {
            verifyButton.disabled = false;
            verifyButton.classList.add('pulse');
            setTimeout(() => verifyButton.classList.remove('pulse'), 300);
        } else {
            verifyButton.disabled = true;
        }
    }

    // 验证注册验证码
    async verifyRegistrationCode() {
        const inputs = document.querySelectorAll('.code-digit');
        const enteredCode = Array.from(inputs).map(input => input.value).join('');

        if (enteredCode.length !== 6) {
            this.showNotification('请输入完整的6位验证码', 'warning');
            return;
        }

        this.showLoading();

        try {
            // 模拟验证延迟
            await this.delay(1000);

            if (enteredCode !== this.currentVerificationCode) {
                this.hideLoading();
                this.showNotification('验证码错误，请重新输入', 'error');
                
                // 清空输入框并添加震动效果
                inputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('filled');
                    input.classList.add('shake');
                    setTimeout(() => input.classList.remove('shake'), 500);
                });
                
                inputs[0].focus();
                return;
            }

            // 验证成功，显示密码设置阶段
            this.hideLoading();
            this.showPasswordStage();

        } catch (error) {
            this.hideLoading();
            this.showNotification('验证失败，请稍后重试', 'error');
        }
    }

    // 重新发送验证码
    async resendVerificationCode() {
        this.showLoading();

        try {
            this.currentVerificationCode = this.generateVerificationCode();
            
            // 尝试发送真实邮件
            const emailSent = await this.sendVerificationEmail(this.currentEmail, this.currentVerificationCode);
            
            this.hideLoading();
            this.startCountdown();
            
            if (emailSent) {
                this.showNotification('验证码已重新发送至您的邮箱', 'success');
            } else {
                this.showNotification(`验证码已重新生成，开发模式下请查看控制台: ${this.currentVerificationCode}`, 'warning');
                console.log('重新发送的验证码:', this.currentVerificationCode);
            }

        } catch (error) {
            this.hideLoading();
            this.showNotification('发送失败，请稍后重试', 'error');
        }
    }

    // 开始倒计时
    startCountdown() {
        let timeLeft = 300; // 5分钟
        const countdownElement = document.getElementById('countdown');
        const resendButton = document.getElementById('resendCode');
        
        resendButton.disabled = true;
        
        this.countdownTimer = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(this.countdownTimer);
                resendButton.disabled = false;
                countdownElement.textContent = '已过期';
                this.showNotification('验证码已过期，请重新发送', 'warning');
            }
        }, 1000);
    }

    // 表单切换
    switchToLogin() {
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('forgotPasswordForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
        this.clearErrors();
    }

    switchToRegister() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('forgotPasswordForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('registerFormElement').style.display = 'block';
        document.getElementById('verificationStage').classList.add('hidden');
        this.clearErrors();
        this.generateCaptcha();
    }

    switchToForgotPassword() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('forgotPasswordForm').classList.remove('hidden');
        document.getElementById('forgotPasswordFormElement').style.display = 'block';
        document.getElementById('resetVerificationStage').classList.add('hidden');
        document.getElementById('resetPasswordStage').classList.add('hidden');
        this.clearErrors();
        this.generateForgotCaptcha();
    }

    // 用户数据管理
    getStoredUsers() {
        const users = localStorage.getItem('registeredUsers');
        return users ? JSON.parse(users) : [];
    }

    saveUser(user) {
        const users = this.getStoredUsers();
        users.push(user);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
    }

    setUserSession(user) {
        localStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            loginTime: new Date().toISOString()
        }));
    }

    loadUserSession() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            // 如果已登录，可以直接跳转到主页
            // window.location.href = 'index.html';
        }
    }

    // 工具方法
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        const wrapper = input.closest('.input-wrapper');
        
        wrapper.classList.add('error');
        
        // 移除已存在的错误消息
        const existingError = wrapper.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // 添加新的错误消息
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        wrapper.parentNode.appendChild(errorDiv);
        
        // 添加震动效果
        wrapper.classList.add('shake');
        setTimeout(() => wrapper.classList.remove('shake'), 500);
        
        // 聚焦输入框
        input.focus();
    }

    clearErrors() {
        document.querySelectorAll('.input-wrapper').forEach(wrapper => {
            wrapper.classList.remove('error', 'success');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
    }

    showLoading() {
        const authWrapper = document.querySelector('.auth-wrapper');
        if (!authWrapper.querySelector('.loading-overlay')) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-overlay';
            loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
            authWrapper.appendChild(loadingDiv);
        }
    }

    hideLoading() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    showSuccessModal(message, callback) {
        const modal = document.getElementById('successModal');
        const messageElement = document.getElementById('successMessage');
        
        messageElement.textContent = message;
        modal.classList.remove('hidden');
        
        // 设置回调
        this.successCallback = callback;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 显示密码设置阶段
    showPasswordStage() {
        document.getElementById('verificationStage').classList.add('hidden');
        document.getElementById('passwordStage').classList.remove('hidden');
        
        // 清空密码输入框
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        // 重置密码强度和要求
        this.resetPasswordValidation();
        
        // 聚焦新密码输入框
        document.getElementById('newPassword').focus();
    }

    // 返回验证码阶段
    backToVerification() {
        document.getElementById('passwordStage').classList.add('hidden');
        document.getElementById('verificationStage').classList.remove('hidden');
    }

    // 检查密码强度
    checkPasswordStrength() {
        const password = document.getElementById('newPassword').value;
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        let score = 0;
        let feedback = '';
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        // 移除之前的强度类
        strengthBar.className = 'strength-fill';
        strengthText.className = 'strength-text';
        
        if (score <= 2) {
            strengthBar.classList.add('weak');
            strengthText.classList.add('weak');
            feedback = '弱';
        } else if (score <= 3) {
            strengthBar.classList.add('fair');
            strengthText.classList.add('fair');
            feedback = '一般';
        } else if (score <= 4) {
            strengthBar.classList.add('good');
            strengthText.classList.add('good');
            feedback = '良好';
        } else {
            strengthBar.classList.add('strong');
            strengthText.classList.add('strong');
            feedback = '强';
        }
        
        strengthText.textContent = `密码强度：${feedback}`;
    }

    // 验证密码要求
    validatePasswordRequirements() {
        const password = document.getElementById('newPassword').value;
        const requirements = [
            { id: 'length', test: password.length >= 8 && password.length <= 20 },
            { id: 'lowercase', test: /[a-z]/.test(password) },
            { id: 'uppercase', test: /[A-Z]/.test(password) },
            { id: 'number', test: /[0-9]/.test(password) },
            { id: 'special', test: /[^A-Za-z0-9]/.test(password) }
        ];
        
        requirements.forEach(req => {
            const element = document.getElementById(`req-${req.id}`);
            if (element) {
                element.className = req.test ? 'valid' : 'invalid';
                const icon = element.querySelector('i');
                if (icon) {
                    icon.className = req.test ? 'fas fa-check' : 'fas fa-times';
                }
            }
        });
        
        // 检查是否所有要求都满足
        const allValid = requirements.every(req => req.test);
        
        // 更新完成注册按钮状态
        this.updateCompleteButton();
        
        return allValid;
    }

    // 验证密码匹配
    validatePasswordMatch() {
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmWrapper = document.getElementById('confirmPassword').closest('.input-wrapper');
        
        if (confirmPassword && password !== confirmPassword) {
            confirmWrapper.classList.add('error');
            confirmWrapper.classList.remove('success');
        } else if (confirmPassword) {
            confirmWrapper.classList.remove('error');
            confirmWrapper.classList.add('success');
        } else {
            confirmWrapper.classList.remove('error', 'success');
        }
        
        this.updateCompleteButton();
    }

    // 更新完成注册按钮状态
    updateCompleteButton() {
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const completeButton = document.getElementById('completeRegistration');
        
        // 直接检查密码要求，避免循环调用
        const requirements = [
            { test: password.length >= 8 && password.length <= 20 },
            { test: /[a-z]/.test(password) },
            { test: /[A-Z]/.test(password) },
            { test: /[0-9]/.test(password) },
            { test: /[^A-Za-z0-9]/.test(password) }
        ];
        const passwordValid = requirements.every(req => req.test);
        const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
        
        completeButton.disabled = !(passwordValid && passwordsMatch);
    }

    // 重置密码验证
    resetPasswordValidation() {
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        strengthBar.className = 'strength-fill';
        strengthText.className = 'strength-text';
        strengthText.textContent = '密码强度：无';
        
        // 重置所有要求为无效状态
        ['length', 'lowercase', 'uppercase', 'number', 'special'].forEach(id => {
            const element = document.getElementById(`req-${id}`);
            if (element) {
                element.className = 'invalid';
                const icon = element.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-times';
                }
            }
        });
        
        // 重置输入框状态
        document.querySelectorAll('.password-stage .input-wrapper').forEach(wrapper => {
            wrapper.classList.remove('error', 'success');
        });
        
        // 禁用完成按钮
        document.getElementById('completeRegistration').disabled = true;
    }

    // 切换密码可见性
    togglePasswordVisibility(toggleButton) {
        const input = toggleButton.previousElementSibling;
        const icon = toggleButton.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    // 完成注册
    async completeRegistration() {
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 直接检查密码要求，避免循环调用
        const requirements = [
            { test: password.length >= 8 && password.length <= 20 },
            { test: /[a-z]/.test(password) },
            { test: /[A-Z]/.test(password) },
            { test: /[0-9]/.test(password) },
            { test: /[^A-Za-z0-9]/.test(password) }
        ];
        const passwordValid = requirements.every(req => req.test);
        
        if (!passwordValid) {
            this.showNotification('密码不符合要求，请检查密码强度', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('两次输入的密码不一致', 'error');
            return;
        }
        
        this.showLoading();
        
        try {
            // 模拟保存延迟
            await this.delay(1000);
            
            // 保存用户信息
            const newUser = {
                email: this.currentEmail,
                password: password,
                verificationCode: this.currentVerificationCode,
                registeredAt: new Date().toISOString(),
                id: Date.now().toString()
            };
            
            this.saveUser(newUser);
            this.hideLoading();
            
            this.showSuccessModal('注册成功！您现在可以使用邮箱和密码登录了。', () => {
                this.switchToLogin();
                document.getElementById('loginEmail').value = this.currentEmail;
            });
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('注册失败，请稍后重试', 'error');
        }
    }

    // ==================== 找回密码功能 ====================

    // 生成找回密码的图形验证码
    generateForgotCaptcha() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let captcha = '';
        for (let i = 0; i < 4; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.currentForgotCaptcha = captcha;
        
        const captchaDisplay = document.getElementById('forgotCaptchaDisplay');
        const captchaText = document.getElementById('forgotCaptchaText');
        
        // 添加视觉干扰
        captchaText.textContent = captcha;
        captchaDisplay.style.background = this.generateCaptchaBackground();
        captchaDisplay.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
        
        console.log('找回密码验证码:', captcha); // 开发时显示，生产环境应移除
    }

    // 处理找回密码请求
    async handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value.trim();
        const captcha = document.getElementById('forgotCaptcha').value.trim();

        if (!this.validateEmail(email)) {
            this.showError('forgotEmail', '请输入有效的邮箱地址');
            return;
        }

        if (!captcha) {
            this.showError('forgotCaptcha', '请输入图形验证码');
            return;
        }

        if (captcha.toUpperCase() !== this.currentForgotCaptcha) {
            this.showError('forgotCaptcha', '图形验证码错误');
            this.generateForgotCaptcha();
            return;
        }

        // 检查邮箱是否已注册
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === email);
        if (!user) {
            this.showError('forgotEmail', '该邮箱未注册');
            return;
        }

        this.showLoading();

        try {
            this.currentResetEmail = email;
            this.currentResetCode = this.generateVerificationCode();
            
            // 尝试发送重置密码邮件
            const emailSent = await this.sendResetPasswordEmail(email, this.currentResetCode);
            
            this.hideLoading();
            this.showResetVerificationStage();
            this.startResetCountdown();
            
            if (emailSent) {
                this.showNotification(`重置验证码已发送至 ${email}，请查收邮件`, 'success');
            } else {
                this.showNotification(`重置验证码已生成，开发模式下请查看控制台: ${this.currentResetCode}`, 'warning');
                console.log('重置验证码:', this.currentResetCode);
            }

        } catch (error) {
            this.hideLoading();
            this.showNotification('发送重置验证码失败，请稍后重试', 'error');
            console.error('发送重置邮件错误:', error);
        }
    }

    // 发送重置密码邮件
    async sendResetPasswordEmail(email, code) {
        // 检查EmailJS是否可用且配置是否完整
        if (typeof emailjs === 'undefined' || 
            EMAIL_CONFIG.serviceId === 'service_your_service_id' ||
            EMAIL_CONFIG.templateId === 'template_your_template_id' ||
            EMAIL_CONFIG.publicKey === 'your_public_key') {
            
            console.warn('EmailJS 未配置或不可用，使用模拟模式');
            return false;
        }

        try {
            const templateParams = {
                to_email: email,
                verification_code: code,
                user_email: email,
                message: `您的密码重置验证码是: ${code}，有效期5分钟。如果这不是您的操作，请忽略此邮件。`
            };

            const response = await emailjs.send(
                EMAIL_CONFIG.serviceId,
                EMAIL_CONFIG.templateId,
                templateParams,
                EMAIL_CONFIG.publicKey
            );

            console.log('重置密码邮件发送成功:', response);
            return true;
        } catch (error) {
            console.error('重置密码邮件发送失败:', error);
            return false;
        }
    }

    // 显示重置验证码输入阶段
    showResetVerificationStage() {
        document.getElementById('forgotPasswordFormElement').style.display = 'none';
        document.getElementById('resetVerificationStage').classList.remove('hidden');
        document.getElementById('resetEmailDisplay').textContent = this.currentResetEmail;
        
        // 清空验证码输入框
        document.querySelectorAll('.reset-code-digit').forEach(input => {
            input.value = '';
        });
        
        // 聚焦第一个输入框
        document.querySelector('.reset-code-digit').focus();
    }

    // 处理重置验证码输入
    handleResetCodeInput(event, index) {
        const input = event.target;
        const value = input.value;
        
        // 只允许数字
        if (!/^\d$/.test(value)) {
            input.value = '';
            return;
        }
        
        // 自动跳转到下一个输入框
        if (value && index < 5) {
            const nextInput = document.querySelector(`.reset-code-digit[data-index="${index + 1}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }
        
        this.checkResetCodeComplete();
    }

    // 处理重置验证码键盘事件
    handleResetCodeKeydown(event, index) {
        const input = event.target;
        
        // 退格键处理
        if (event.key === 'Backspace' && !input.value && index > 0) {
            const prevInput = document.querySelector(`.reset-code-digit[data-index="${index - 1}"]`);
            if (prevInput) {
                prevInput.focus();
                prevInput.value = '';
            }
        }
        
        // 回车键验证
        if (event.key === 'Enter') {
            this.verifyResetCode();
        }
    }

    // 处理重置验证码粘贴
    handleResetCodePaste(event) {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text');
        const digits = pasteData.replace(/\D/g, '').slice(0, 6);
        
        document.querySelectorAll('.reset-code-digit').forEach((input, index) => {
            input.value = digits[index] || '';
        });
        
        this.checkResetCodeComplete();
    }

    // 检查重置验证码是否完整
    checkResetCodeComplete() {
        const inputs = document.querySelectorAll('.reset-code-digit');
        const code = Array.from(inputs).map(input => input.value).join('');
        const verifyButton = document.getElementById('verifyResetCode');
        
        verifyButton.disabled = code.length !== 6;
        
        if (code.length === 6) {
            // 自动验证
            setTimeout(() => this.verifyResetCode(), 500);
        }
    }

    // 验证重置验证码
    async verifyResetCode() {
        const inputs = document.querySelectorAll('.reset-code-digit');
        const enteredCode = Array.from(inputs).map(input => input.value).join('');
        
        if (enteredCode.length !== 6) {
            this.showNotification('请输入完整的6位验证码', 'error');
            return;
        }
        
        this.showLoading();
        
        try {
            await this.delay(1000);
            
            if (enteredCode === this.currentResetCode) {
                this.hideLoading();
                this.showResetPasswordStage();
                this.showNotification('验证码验证成功！', 'success');
            } else {
                this.hideLoading();
                this.showNotification('验证码错误，请重新输入', 'error');
                
                // 清空输入框并聚焦第一个
                inputs.forEach(input => input.value = '');
                inputs[0].focus();
            }
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('验证失败，请稍后重试', 'error');
        }
    }

    // 重新发送重置验证码
    async resendResetCode() {
        this.showLoading();

        try {
            this.currentResetCode = this.generateVerificationCode();
            
            // 尝试发送真实邮件
            const emailSent = await this.sendResetPasswordEmail(this.currentResetEmail, this.currentResetCode);
            
            this.hideLoading();
            this.startResetCountdown();
            
            if (emailSent) {
                this.showNotification('重置验证码已重新发送至您的邮箱', 'success');
            } else {
                this.showNotification(`重置验证码已重新生成，开发模式下请查看控制台: ${this.currentResetCode}`, 'warning');
                console.log('重新发送的重置验证码:', this.currentResetCode);
            }

        } catch (error) {
            this.hideLoading();
            this.showNotification('发送失败，请稍后重试', 'error');
        }
    }

    // 开始重置验证码倒计时
    startResetCountdown() {
        let timeLeft = 300; // 5分钟
        const countdownElement = document.getElementById('resetCountdown');
        const resendButton = document.getElementById('resendResetCode');
        
        resendButton.disabled = true;
        
        this.resetCountdownTimer = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(this.resetCountdownTimer);
                resendButton.disabled = false;
                countdownElement.textContent = '已过期';
                this.showNotification('重置验证码已过期，请重新发送', 'warning');
            }
        }, 1000);
    }

    // 显示重置密码阶段
    showResetPasswordStage() {
        document.getElementById('resetVerificationStage').classList.add('hidden');
        document.getElementById('resetPasswordStage').classList.remove('hidden');
        
        // 清空密码输入框
        document.getElementById('resetNewPassword').value = '';
        document.getElementById('resetConfirmPassword').value = '';
        
        // 重置密码验证状态
        this.resetResetPasswordValidation();
        
        // 聚焦新密码输入框
        document.getElementById('resetNewPassword').focus();
    }

    // 返回重置验证阶段
    backToResetVerification() {
        document.getElementById('resetPasswordStage').classList.add('hidden');
        document.getElementById('resetVerificationStage').classList.remove('hidden');
    }

    // 检查重置密码强度
    checkResetPasswordStrength() {
        const password = document.getElementById('resetNewPassword').value;
        const strengthBar = document.getElementById('resetStrengthFill');
        const strengthText = document.getElementById('resetStrengthText');
        
        // 清除之前的样式
        strengthBar.className = 'strength-fill';
        strengthText.className = 'strength-text';
        
        if (!password) {
            strengthText.textContent = '密码强度：无';
            this.updateResetCompleteButton();
            return;
        }
        
        let score = 0;
        let feedback = '';
        
        // 长度检查
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // 字符类型检查
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score <= 2) {
            strengthBar.classList.add('weak');
            strengthText.classList.add('weak');
            feedback = '弱';
        } else if (score <= 3) {
            strengthBar.classList.add('fair');
            strengthText.classList.add('fair');
            feedback = '一般';
        } else if (score <= 4) {
            strengthBar.classList.add('good');
            strengthText.classList.add('good');
            feedback = '良好';
        } else {
            strengthBar.classList.add('strong');
            strengthText.classList.add('strong');
            feedback = '强';
        }
        
        strengthText.textContent = `密码强度：${feedback}`;
        this.updateResetCompleteButton();
    }

    // 验证重置密码要求
    validateResetPasswordRequirements() {
        const password = document.getElementById('resetNewPassword').value;
        const requirements = [
            { id: 'reset-req-length', test: password.length >= 8 && password.length <= 20 },
            { id: 'reset-req-lowercase', test: /[a-z]/.test(password) },
            { id: 'reset-req-uppercase', test: /[A-Z]/.test(password) },
            { id: 'reset-req-number', test: /[0-9]/.test(password) },
            { id: 'reset-req-special', test: /[^A-Za-z0-9]/.test(password) }
        ];
        
        requirements.forEach(req => {
            const element = document.getElementById(req.id);
            if (element) {
                element.className = req.test ? 'valid' : 'invalid';
                const icon = element.querySelector('i');
                if (icon) {
                    icon.className = req.test ? 'fas fa-check' : 'fas fa-times';
                }
            }
        });
        
        // 检查是否所有要求都满足
        const allValid = requirements.every(req => req.test);
        
        return allValid;
    }

    // 验证重置密码匹配
    validateResetPasswordMatch() {
        const password = document.getElementById('resetNewPassword').value;
        const confirmPassword = document.getElementById('resetConfirmPassword').value;
        const confirmWrapper = document.getElementById('resetConfirmPassword').closest('.input-wrapper');
        
        if (confirmPassword && password !== confirmPassword) {
            confirmWrapper.classList.add('error');
            confirmWrapper.classList.remove('success');
        } else if (confirmPassword) {
            confirmWrapper.classList.remove('error');
            confirmWrapper.classList.add('success');
        } else {
            confirmWrapper.classList.remove('error', 'success');
        }
        
        this.updateResetCompleteButton();
    }

    // 更新重置密码完成按钮状态
    updateResetCompleteButton() {
        const password = document.getElementById('resetNewPassword').value;
        const confirmPassword = document.getElementById('resetConfirmPassword').value;
        const completeButton = document.getElementById('completePasswordReset');
        
        const passwordValid = this.validateResetPasswordRequirements();
        const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
        
        completeButton.disabled = !(passwordValid && passwordsMatch);
    }

    // 重置重置密码验证状态
    resetResetPasswordValidation() {
        const strengthBar = document.getElementById('resetStrengthFill');
        const strengthText = document.getElementById('resetStrengthText');
        
        strengthBar.className = 'strength-fill';
        strengthText.className = 'strength-text';
        strengthText.textContent = '密码强度：无';
        
        // 重置所有要求为无效状态
        ['reset-req-length', 'reset-req-lowercase', 'reset-req-uppercase', 'reset-req-number', 'reset-req-special'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.className = 'invalid';
                const icon = element.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-times';
                }
            }
        });
        
        // 重置输入框状态
        document.querySelectorAll('#resetPasswordStage .input-wrapper').forEach(wrapper => {
            wrapper.classList.remove('error', 'success');
        });
        
        // 禁用完成按钮
        document.getElementById('completePasswordReset').disabled = true;
    }

    // 完成密码重置
    async completePasswordReset() {
        const password = document.getElementById('resetNewPassword').value;
        const confirmPassword = document.getElementById('resetConfirmPassword').value;
        
        if (!this.validateResetPasswordRequirements()) {
            this.showNotification('密码不符合要求，请检查密码强度', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('两次输入的密码不一致', 'error');
            return;
        }
        
        this.showLoading();
        
        try {
            // 模拟保存延迟
            await this.delay(1000);
            
            // 更新用户密码
            const users = this.getStoredUsers();
            const userIndex = users.findIndex(u => u.email === this.currentResetEmail);
            
            if (userIndex !== -1) {
                users[userIndex].password = password;
                users[userIndex].lastPasswordReset = new Date().toISOString();
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
                this.hideLoading();
                
                this.showSuccessModal('密码重置成功！您现在可以使用新密码登录了。', () => {
                    this.switchToLogin();
                    document.getElementById('loginEmail').value = this.currentResetEmail;
                });
            } else {
                this.hideLoading();
                this.showNotification('用户不存在，重置失败', 'error');
            }
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('密码重置失败，请稍后重试', 'error');
        }
    }
}

// 全局函数
function switchToLogin() {
    authSystem.switchToLogin();
}

function switchToRegister() {
    authSystem.switchToRegister();
}

function generateCaptcha() {
    authSystem.generateCaptcha();
}

function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('hidden');
    
    if (authSystem.successCallback) {
        authSystem.successCallback();
        authSystem.successCallback = null;
    }
}

function switchToForgotPassword() {
    authSystem.switchToForgotPassword();
}

function generateForgotCaptcha() {
    authSystem.generateForgotCaptcha();
}

function backToResetVerification() {
    authSystem.backToResetVerification();
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggleButton = input.nextElementSibling;
    const icon = toggleButton.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// 初始化认证系统
let authSystem;
document.addEventListener('DOMContentLoaded', function() {
    loadSavedTheme(); // 加载保存的主题
    authSystem = new AuthSystem();
});