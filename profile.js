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
        this.showNotification('密码修改功能开发中...', 'info');
        // 这里可以跳转到密码修改页面或显示密码修改模态框
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

// 初始化
let profileManager;
document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
});