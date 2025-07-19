// 个人信息管理系统
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
        this.checkLoginStatus();
    }

    // 检查登录状态
    checkLoginStatus() {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            this.showNotification('请先登录', 'error');
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 2000);
            return;
        }
        this.currentUser = JSON.parse(userData);
        this.loadUserProfile();
    }

    // 加载用户资料
    loadUserProfile() {
        const profileData = localStorage.getItem(`profile_${this.currentUser.email}`);
        const profile = profileData ? JSON.parse(profileData) : this.getDefaultProfile();

        // 填充表单数据
        document.getElementById('email').value = this.currentUser.email;
        document.getElementById('nickname').value = profile.nickname || '用户';
        document.getElementById('phone').value = profile.phone || '';
        document.getElementById('birthday').value = profile.birthday || '';
        document.getElementById('gender').value = profile.gender || '';
        document.getElementById('bio').value = profile.bio || '';

        // 加载头像
        if (profile.avatar) {
            document.getElementById('avatarPreview').src = profile.avatar;
        }
    }

    // 获取默认资料
    getDefaultProfile() {
        return {
            nickname: '用户',
            phone: '',
            birthday: '',
            gender: '',
            bio: '',
            avatar: null
        };
    }

    // 绑定事件
    bindEvents() {
        // 头像上传
        const avatarInput = document.getElementById('avatarInput');
        const avatarPreview = document.getElementById('avatarPreview');
        
        avatarInput.addEventListener('change', (e) => {
            this.handleAvatarUpload(e);
        });

        avatarPreview.addEventListener('click', () => {
            avatarInput.click();
        });

        // 保存按钮
        document.getElementById('saveProfile').addEventListener('click', () => {
            this.saveProfile();
        });

        // 表单验证
        document.getElementById('nickname').addEventListener('input', (e) => {
            this.validateNickname(e.target.value);
        });

        document.getElementById('phone').addEventListener('input', (e) => {
            this.validatePhone(e.target.value);
        });
    }

    // 处理头像上传
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showNotification('请选择图片文件', 'error');
            return;
        }

        // 验证文件大小 (2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showNotification('图片大小不能超过2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('avatarPreview').src = e.target.result;
            this.showNotification('头像预览已更新，请保存更改', 'success');
        };
        reader.readAsDataURL(file);
    }

    // 重置头像
    resetAvatar() {
        const defaultAvatar = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB4PSIyNSIgeT0iMjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOTk5Ij4KPHA+dGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOC4zMyAxNSAxMiAxNUMxNS42NyAxNSAyMSAxNi4zMyAyMSAxOVpNMTIgN0MxNC43NiA3IDE3IDkuMjQgMTcgMTJWMTNIMTlWMTJDMTkgOC4xMyAxNS44NyA1IDEyIDVDOC4xMyA1IDUgOC4xMyA1IDEyVjEzSDdWMTJDNyA5LjI0IDkuMjQgNyAxMiA3WiIvPgo8L3N2Zz4KPC9zdmc+";
        document.getElementById('avatarPreview').src = defaultAvatar;
        this.showNotification('头像已重置为默认头像', 'info');
    }

    // 验证昵称
    validateNickname(nickname) {
        const wrapper = document.getElementById('nickname').closest('.input-wrapper');
        
        if (nickname.length < 1) {
            wrapper.style.borderColor = '#dc3545';
            return false;
        } else if (nickname.length > 20) {
            wrapper.style.borderColor = '#dc3545';
            this.showNotification('昵称不能超过20个字符', 'error');
            return false;
        } else {
            wrapper.style.borderColor = '#28a745';
            return true;
        }
    }

    // 验证手机号
    validatePhone(phone) {
        const wrapper = document.getElementById('phone').closest('.input-wrapper');
        
        if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
            wrapper.style.borderColor = '#dc3545';
            return false;
        } else {
            wrapper.style.borderColor = phone ? '#28a745' : '#e9ecef';
            return true;
        }
    }

    // 保存资料
    async saveProfile() {
        const nickname = document.getElementById('nickname').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const birthday = document.getElementById('birthday').value;
        const gender = document.getElementById('gender').value;
        const bio = document.getElementById('bio').value.trim();
        const avatar = document.getElementById('avatarPreview').src;

        // 验证必填字段
        if (!nickname) {
            this.showNotification('请输入昵称', 'error');
            return;
        }

        if (!this.validateNickname(nickname)) {
            this.showNotification('昵称格式不正确', 'error');
            return;
        }

        if (phone && !this.validatePhone(phone)) {
            this.showNotification('手机号格式不正确', 'error');
            return;
        }

        // 显示加载状态
        const saveBtn = document.getElementById('saveProfile');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
        saveBtn.disabled = true;

        try {
            // 模拟保存延迟
            await this.delay(1000);

            const profileData = {
                nickname,
                phone,
                birthday,
                gender,
                bio,
                avatar: avatar.startsWith('data:') ? avatar : null,
                updatedAt: new Date().toISOString()
            };

            // 保存到localStorage
            localStorage.setItem(`profile_${this.currentUser.email}`, JSON.stringify(profileData));

            // 更新当前用户信息中的昵称
            this.currentUser.nickname = nickname;
            // 同步头像到当前用户数据
            if (avatar.startsWith('data:')) {
                this.currentUser.avatar = avatar;
            }
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            // 恢复按钮状态
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;

            // 显示成功消息
            this.showSuccessModal('个人信息保存成功！');

        } catch (error) {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            this.showNotification('保存失败，请稍后重试', 'error');
        }
    }

    // 修改密码
    changePassword() {
        // 显示密码修改模态框
        document.getElementById('changePasswordModal').classList.remove('hidden');
        
        // 清空所有输入框
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        
        // 重置密码强度和要求
        this.resetPasswordValidation();
        
        // 绑定事件监听器
        this.bindPasswordEvents();
        
        // 聚焦当前密码输入框
        setTimeout(() => {
            document.getElementById('currentPassword').focus();
        }, 100);
    }

    // 绑定密码修改相关事件
    bindPasswordEvents() {
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmNewPassword');
        
        // 移除之前的事件监听器（避免重复绑定）
        newPasswordInput.removeEventListener('input', this.handleNewPasswordInput);
        confirmPasswordInput.removeEventListener('input', this.handleConfirmPasswordInput);
        
        // 绑定新的事件监听器
        this.handleNewPasswordInput = () => {
            this.checkPasswordStrength();
            this.validatePasswordRequirements();
            this.updateChangePasswordButton();
        };
        
        this.handleConfirmPasswordInput = () => {
            this.validatePasswordMatch();
            this.updateChangePasswordButton();
        };
        
        newPasswordInput.addEventListener('input', this.handleNewPasswordInput);
        confirmPasswordInput.addEventListener('input', this.handleConfirmPasswordInput);
    }

    // 检查密码强度
    checkPasswordStrength() {
        const password = document.getElementById('newPassword').value;
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!password) {
            strengthFill.className = 'strength-fill';
            strengthText.textContent = '密码强度：无';
            return;
        }
        
        let score = 0;
        let feedback = '';
        
        // 计算密码强度分数
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        // 根据分数设置强度等级
        if (score <= 2) {
            strengthFill.className = 'strength-fill strength-weak';
            feedback = '弱';
        } else if (score <= 3) {
            strengthFill.className = 'strength-fill strength-fair';
            feedback = '一般';
        } else if (score <= 4) {
            strengthFill.className = 'strength-fill strength-good';
            feedback = '良好';
        } else {
            strengthFill.className = 'strength-fill strength-strong';
            feedback = '强';
        }
        
        strengthText.textContent = `密码强度：${feedback}`;
    }

    // 验证密码要求
    validatePasswordRequirements() {
        const password = document.getElementById('newPassword').value;
        const requirements = [
            { id: 'req-length', test: password.length >= 8 && password.length <= 20 },
            { id: 'req-lowercase', test: /[a-z]/.test(password) },
            { id: 'req-uppercase', test: /[A-Z]/.test(password) },
            { id: 'req-number', test: /[0-9]/.test(password) },
            { id: 'req-special', test: /[^A-Za-z0-9]/.test(password) }
        ];
        
        requirements.forEach(req => {
            const element = document.getElementById(req.id);
            const icon = element.querySelector('i');
            
            if (req.test) {
                element.classList.remove('invalid');
                element.classList.add('valid');
                icon.className = 'fas fa-check';
            } else {
                element.classList.remove('valid');
                element.classList.add('invalid');
                icon.className = 'fas fa-times';
            }
        });
        
        return requirements.every(req => req.test);
    }

    // 验证密码匹配
    validatePasswordMatch() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
        const confirmWrapper = document.getElementById('confirmNewPassword').closest('.input-wrapper');
        
        if (confirmPassword && newPassword !== confirmPassword) {
            confirmWrapper.style.borderColor = '#dc3545';
            return false;
        } else if (confirmPassword) {
            confirmWrapper.style.borderColor = '#28a745';
            return true;
        } else {
            confirmWrapper.style.borderColor = '#e9ecef';
            return false;
        }
    }

    // 更新修改密码按钮状态
    updateChangePasswordButton() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
        const button = document.getElementById('confirmChangePassword');
        
        const passwordValid = this.validatePasswordRequirements();
        const passwordsMatch = this.validatePasswordMatch();
        const hasCurrentPassword = currentPassword.length > 0;
        
        button.disabled = !(passwordValid && passwordsMatch && hasCurrentPassword);
    }

    // 重置密码验证状态
    resetPasswordValidation() {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        strengthFill.className = 'strength-fill';
        strengthText.textContent = '密码强度：无';
        
        // 重置密码要求状态
        const requirements = ['req-length', 'req-lowercase', 'req-uppercase', 'req-number', 'req-special'];
        requirements.forEach(reqId => {
            const element = document.getElementById(reqId);
            const icon = element.querySelector('i');
            element.classList.remove('valid', 'invalid');
            icon.className = 'fas fa-times';
        });
        
        // 重置输入框边框
        document.querySelectorAll('#changePasswordModal .input-wrapper').forEach(wrapper => {
            wrapper.style.borderColor = '#e9ecef';
        });
        
        // 禁用确认按钮
        document.getElementById('confirmChangePassword').disabled = true;
    }

    // 确认修改密码
    async confirmChangePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
        
        // 验证当前密码
        if (this.currentUser.password !== currentPassword) {
            this.showNotification('当前密码不正确', 'error');
            return;
        }
        
        // 验证新密码
        if (!this.validatePasswordRequirements()) {
            this.showNotification('新密码不符合要求', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showNotification('两次输入的密码不一致', 'error');
            return;
        }
        
        if (newPassword === currentPassword) {
            this.showNotification('新密码不能与当前密码相同', 'error');
            return;
        }
        
        // 显示加载状态
        const button = document.getElementById('confirmChangePassword');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 修改中...';
        button.disabled = true;
        
        try {
            // 模拟修改延迟
            await this.delay(1500);
            
            // 更新用户密码
            this.currentUser.password = newPassword;
            this.currentUser.lastPasswordChange = new Date().toISOString();
            
            // 保存到localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            // 更新用户数据库中的密码（模拟）
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === this.currentUser.email);
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                users[userIndex].lastPasswordChange = new Date().toISOString();
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // 关闭模态框
            this.closePasswordModal();
            
            // 显示成功消息
            this.showSuccessModal('密码修改成功！请妥善保管您的新密码。');
            
        } catch (error) {
            button.innerHTML = originalText;
            button.disabled = false;
            this.showNotification('密码修改失败，请稍后重试', 'error');
        }
    }

    // 关闭密码修改模态框
    closePasswordModal() {
        document.getElementById('changePasswordModal').classList.add('hidden');
        
        // 清理事件监听器
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmNewPassword');
        
        if (this.handleNewPasswordInput) {
            newPasswordInput.removeEventListener('input', this.handleNewPasswordInput);
        }
        if (this.handleConfirmPasswordInput) {
            confirmPasswordInput.removeEventListener('input', this.handleConfirmPasswordInput);
        }
    }

    // 切换密码可见性
    togglePasswordVisibility(inputId) {
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

    // 查看登录记录
    viewLoginHistory() {
        this.showNotification('登录记录功能开发中...', 'info');
        // 这里可以显示登录历史记录
    }

    // 显示成功模态框
    showSuccessModal(message) {
        document.getElementById('successMessage').textContent = message;
        document.getElementById('successModal').classList.remove('hidden');
    }

    // 关闭模态框
    closeModal() {
        document.getElementById('successModal').classList.add('hidden');
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 加载用户数据
    loadUserData() {
        // 这里可以从服务器加载用户数据
        console.log('加载用户数据...');
    }
}

// 全局函数
function resetAvatar() {
    profileManager.resetAvatar();
}

function changePassword() {
    profileManager.changePassword();
}

function viewLoginHistory() {
    profileManager.viewLoginHistory();
}

function closeModal() {
    profileManager.closeModal();
}

function closePasswordModal() {
    profileManager.closePasswordModal();
}

function confirmChangePassword() {
    profileManager.confirmChangePassword();
}

function togglePasswordVisibility(inputId) {
    profileManager.togglePasswordVisibility(inputId);
}

// 初始化
let profileManager;
document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
    
    // 为当前密码输入框添加事件监听器
    const currentPasswordInput = document.getElementById('currentPassword');
    if (currentPasswordInput) {
        currentPasswordInput.addEventListener('input', () => {
            profileManager.updateChangePasswordButton();
        });
    }
});