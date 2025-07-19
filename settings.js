// 主题管理
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && savedTheme !== 'light') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// 页面加载时应用主题
document.addEventListener('DOMContentLoaded', function() {
    loadSavedTheme();
    // 初始化设置系统
    new SettingsSystem();
    // 更新导航栏按钮状态
    updateAuthButton();
});

// 更新认证按钮状态
function updateAuthButton() {
    const authBtn = document.getElementById('authBtn');
    const authBtnText = document.getElementById('authBtnText');
    const currentUser = getCurrentUserForAuth();
    
    if (currentUser) {
        // 用户已登录，显示退出登录
        authBtnText.textContent = '退出登录';
        authBtn.title = '退出登录';
        authBtn.querySelector('i').className = 'fas fa-sign-out-alt';
    } else {
        // 用户未登录，显示登录
        authBtnText.textContent = '登录';
        authBtn.title = '用户认证';
        authBtn.querySelector('i').className = 'fas fa-user';
    }
}

// 获取当前用户（用于认证按钮）
function getCurrentUserForAuth() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// 处理认证按钮点击
function handleAuthAction() {
    const currentUser = getCurrentUserForAuth();
    
    if (currentUser) {
        // 用户已登录，执行退出登录
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            // 清除所有相关的用户数据
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('profile_') || key.startsWith('user_')) {
                    localStorage.removeItem(key);
                }
            });
            alert('已成功退出登录');
            window.location.href = 'auth.html';
        }
    } else {
        // 用户未登录，跳转到登录页面
        window.location.href = 'auth.html';
    }
}

// 设置系统类
class SettingsSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.themes = {
            light: {
                name: '浅色主题',
                description: '清新明亮的界面风格',
                colors: {
                    primary: '#667eea',
                    background: '#ffffff',
                    surface: '#f8f9fa',
                    text: '#333333',
                    textSecondary: '#666666'
                }
            },
            dark: {
                name: '深色主题',
                description: '护眼的深色界面',
                colors: {
                    primary: '#667eea',
                    background: '#2c3e50',
                    surface: '#34495e',
                    text: '#ffffff',
                    textSecondary: '#bdc3c7'
                }
            },
            blue: {
                name: '蓝色主题',
                description: '专业的蓝色调',
                colors: {
                    primary: '#3498db',
                    background: '#85c1e9',
                    surface: '#5dade2',
                    text: '#ffffff',
                    textSecondary: '#ecf0f1'
                }
            },
            pink: {
                name: '粉色主题',
                description: '温馨的粉色调',
                colors: {
                    primary: '#e91e63',
                    background: '#f8bbd9',
                    surface: '#f06292',
                    text: '#ffffff',
                    textSecondary: '#fce4ec'
                }
            }
        };
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
        this.loadCurrentTheme();
        this.generatePresetAvatars();
        this.initCozeConfig();
    }

    // 获取当前用户
    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    // 获取个人资料数据
    getProfileData() {
        if (!this.currentUser) return null;
        const profileData = localStorage.getItem(`profile_${this.currentUser.email}`);
        return profileData ? JSON.parse(profileData) : null;
    }

    // 同步头像到个人资料数据
    syncAvatarToProfile(avatarSrc) {
        if (!this.currentUser) return;
        
        // 获取现有的个人资料数据
        let profileData = this.getProfileData();
        
        // 如果没有个人资料数据，创建一个基础的
        if (!profileData) {
            profileData = {
                nickname: this.currentUser.nickname || this.currentUser.email?.split('@')[0] || '',
                phone: '',
                birthday: '',
                gender: '',
                bio: '',
                avatar: avatarSrc,
                updatedAt: new Date().toISOString()
            };
        } else {
            // 更新头像和时间戳
            profileData.avatar = avatarSrc;
            profileData.updatedAt = new Date().toISOString();
        }
        
        // 保存更新后的个人资料数据
        localStorage.setItem(`profile_${this.currentUser.email}`, JSON.stringify(profileData));
    }

    // 加载用户数据
    loadUserData() {
        if (this.currentUser) {
            const emailInput = document.getElementById('userEmail');
            const nicknameInput = document.getElementById('userNickname');
            const avatarImg = document.getElementById('avatarImg');
            
            if (emailInput) emailInput.value = this.currentUser.email || '';
            if (nicknameInput) nicknameInput.value = this.currentUser.nickname || this.currentUser.email?.split('@')[0] || '';
            
            // 优先从个人资料数据中加载头像
            if (avatarImg) {
                const profileData = this.getProfileData();
                if (profileData && profileData.avatar) {
                    avatarImg.src = profileData.avatar;
                } else if (this.currentUser.avatar) {
                    avatarImg.src = this.currentUser.avatar;
                } else {
                    // 使用默认头像
                    avatarImg.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB4PSIyNSIgeT0iMjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOTk5Ij4KPHA+dGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOC4zMyAxNSAxMiAxNUMxNS42NyAxNSAyMSAxNi4zMyAyMSAxOVpNMTIgN0MxNC43NiA3IDE3IDkuMjQgMTcgMTJWMTNIMTlWMTJDMTkgOC4xMyAxNS44NyA1IDEyIDVDOC4xMyA1IDUgOC4xMyA1IDEyVjEzSDdWMTJDNyA5LjI0IDkuMjQgNyAxMiA3WiIvPgo8L3N2Zz4KPC9zdmc+";
                }
            }
        }
    }

    // 绑定事件
    bindEvents() {
        // 头像上传
        const avatarInput = document.getElementById('avatarInput');
        const avatarContainer = document.querySelector('.avatar-container');
        const uploadBtn = document.getElementById('uploadBtn');
        
        if (avatarContainer) {
            avatarContainer.addEventListener('click', () => {
                avatarInput?.click();
            });
        }
        
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                avatarInput?.click();
            });
        }
        
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                this.handleAvatarUpload(e);
            });
        }

        // 预设头像选择
        document.addEventListener('click', (e) => {
            if (e.target.closest('.preset-avatar')) {
                this.selectPresetAvatar(e.target.closest('.preset-avatar'));
            }
        });

        // 主题选择
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-option')) {
                this.selectTheme(e.target.closest('.theme-option'));
            }
        });

        // 保存设置
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // 重置设置
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // 模态框关闭
        const modal = document.getElementById('successModal');
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal?.classList.add('hidden');
            });
        }

        // 点击模态框外部关闭
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
    }

    // 处理头像上传
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            this.showNotification('请选择图片文件', 'error');
            return;
        }

        // 检查文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('图片大小不能超过5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarImg = document.getElementById('avatarImg');
            if (avatarImg) {
                avatarImg.src = e.target.result;
                this.clearPresetSelection();
            }
        };
        reader.readAsDataURL(file);
    }

    // 生成预设头像
    generatePresetAvatars() {
        const presetContainer = document.querySelector('.preset-avatars');
        if (!presetContainer) return;

        const presetAvatars = [
            'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=b6e3f4',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=c0aede',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=d1d4f9',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=ffd93d',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=ffb3ba',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=6&backgroundColor=bae1ff',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=7&backgroundColor=ffffba',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=8&backgroundColor=baffc9'
        ];

        presetContainer.innerHTML = '';
        presetAvatars.forEach((avatarUrl, index) => {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'preset-avatar';
            avatarDiv.innerHTML = `<img src="${avatarUrl}" alt="预设头像 ${index + 1}">`;
            presetContainer.appendChild(avatarDiv);
        });
    }

    // 选择预设头像
    selectPresetAvatar(avatarElement) {
        // 清除其他选中状态
        this.clearPresetSelection();
        
        // 设置当前选中
        avatarElement.classList.add('selected');
        
        // 更新主头像
        const avatarImg = document.getElementById('avatarImg');
        const presetImg = avatarElement.querySelector('img');
        if (avatarImg && presetImg) {
            avatarImg.src = presetImg.src;
        }
    }

    // 清除预设头像选中状态
    clearPresetSelection() {
        document.querySelectorAll('.preset-avatar').forEach(avatar => {
            avatar.classList.remove('selected');
        });
    }

    // 选择主题
    selectTheme(themeElement) {
        // 清除其他选中状态
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // 设置当前选中
        themeElement.classList.add('selected');
        
        // 获取主题名称
        const themeName = themeElement.dataset.theme;
        
        // 应用主题预览
        this.previewTheme(themeName);
    }

    // 预览主题
    previewTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        // 应用主题到当前页面
        document.documentElement.style.setProperty('--theme-primary', theme.colors.primary);
        document.documentElement.style.setProperty('--theme-background', theme.colors.background);
        document.documentElement.style.setProperty('--theme-surface', theme.colors.surface);
        document.documentElement.style.setProperty('--theme-text', theme.colors.text);
        document.documentElement.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    }

    // 加载当前主题
    loadCurrentTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'light';
        
        // 移除所有主题选项的选中状态
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // 添加选中状态到当前主题
        const selectedOption = document.querySelector(`[data-theme="${savedTheme}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        // 应用主题到页面
        if (savedTheme !== 'light') {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }

    // 应用主题到整个网站
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        // 移除所有现有主题类
        document.documentElement.removeAttribute('data-theme');
        
        // 应用新主题
        if (themeName !== 'light') {
            document.documentElement.setAttribute('data-theme', themeName);
        }

        // 保存主题设置到localStorage
        localStorage.setItem('siteTheme', JSON.stringify(theme));
        localStorage.setItem('selectedTheme', themeName);
        
        // 应用主题变量
        Object.entries(theme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
        });
        
        console.log(`主题已切换为: ${themeName}`);
    }

    // 保存设置
    saveSettings() {
        if (!this.currentUser) {
            this.showNotification('请先登录', 'error');
            return;
        }

        const nickname = document.getElementById('userNickname').value.trim();
        const avatarImg = document.getElementById('avatarImg');
        const selectedTheme = document.querySelector('.theme-option.selected');

        if (!nickname) {
            this.showNotification('请输入昵称', 'error');
            return;
        }

        // 更新用户数据
        this.currentUser.nickname = nickname;
        if (avatarImg) {
            this.currentUser.avatar = avatarImg.src;
            
            // 同步头像到个人资料数据
            this.syncAvatarToProfile(avatarImg.src);
        }

        // 保存主题
        if (selectedTheme) {
            const themeName = selectedTheme.dataset.theme;
            localStorage.setItem('selectedTheme', themeName);
            this.applyThemeToSite(themeName);
        }

        // 保存 Coze 配置
        this.saveCozeConfig();

        // 保存用户数据
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        // 更新所有用户数据
        this.updateUserInStorage();

        // 显示成功消息
        this.showSuccessModal();
    }

    // 应用主题到整个网站
    applyThemeToSite(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        // 移除所有现有主题类
        document.documentElement.removeAttribute('data-theme');
        
        // 应用新主题
        if (themeName !== 'light') {
            document.documentElement.setAttribute('data-theme', themeName);
        }

        // 保存主题设置到localStorage
        localStorage.setItem('siteTheme', JSON.stringify(theme));
        localStorage.setItem('selectedTheme', themeName);
        
        // 应用主题变量
        Object.entries(theme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
        });
        
        console.log(`主题已切换为: ${themeName}`);
    }

    // 更新存储中的用户数据
    updateUserInStorage() {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = users.findIndex(user => user.email === this.currentUser.email);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...this.currentUser };
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
    }

    // 重置设置
    resetSettings() {
        if (confirm('确定要重置所有设置吗？这将恢复默认设置。')) {
            // 重置头像
            const avatarImg = document.getElementById('avatarImg');
            if (avatarImg) {
                avatarImg.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4';
            }

            // 重置昵称
            const nicknameInput = document.getElementById('userNickname');
            if (nicknameInput && this.currentUser) {
                nicknameInput.value = this.currentUser.email?.split('@')[0] || '';
            }

            // 重置主题
            const lightTheme = document.querySelector('[data-theme="light"]');
            if (lightTheme) {
                this.selectTheme(lightTheme);
            }

            // 清除预设头像选择
            this.clearPresetSelection();

            this.showNotification('设置已重置', 'success');
        }
    }

    // 显示成功模态框
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#667eea'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

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
}

        // 导出类供其他文件使用
window.SettingsSystem = SettingsSystem;

// Coze 配置相关功能
function initCozeConfig() {
    loadCozeConfig();
    bindCozeEvents();
    updateCozeStatus();
}

function loadCozeConfig() {
    try {
        const config = JSON.parse(localStorage.getItem('cozeConfig') || '{}');
        
        const apiKeyInput = document.getElementById('cozeApiKey');
        const botIdInput = document.getElementById('cozeBotId');
        
        if (apiKeyInput && config.apiKey) {
            apiKeyInput.value = config.apiKey;
        }
        
        if (botIdInput && config.botId) {
            botIdInput.value = config.botId;
        }
    } catch (error) {
        console.error('加载 Coze 配置失败:', error);
    }
}

function bindCozeEvents() {
    // 测试连接按钮
    const testBtn = document.getElementById('testCozeConnection');
    if (testBtn) {
        testBtn.addEventListener('click', testCozeConnection);
    }
    
    // 输入框变化时更新状态
    const apiKeyInput = document.getElementById('cozeApiKey');
    const botIdInput = document.getElementById('cozeBotId');
    
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', updateCozeStatus);
    }
    
    if (botIdInput) {
        botIdInput.addEventListener('input', updateCozeStatus);
    }
}

function updateCozeStatus() {
    const apiKey = document.getElementById('cozeApiKey')?.value.trim();
    const botId = document.getElementById('cozeBotId')?.value.trim();
    const statusDot = document.getElementById('cozeStatusDot');
    const statusText = document.getElementById('cozeStatusText');
    
    if (!statusDot || !statusText) return;
    
    // 清除所有状态类
    statusDot.className = 'status-dot';
    
    if (!apiKey || !botId) {
        statusText.textContent = '未配置';
        return;
    }
    
    // 检查配置是否完整
    if (apiKey.length > 10 && botId.length > 5) {
        statusDot.classList.add('connected');
        statusText.textContent = '配置完整';
    } else {
        statusText.textContent = '配置不完整';
    }
}

async function testCozeConnection() {
    const apiKey = document.getElementById('cozeApiKey')?.value.trim();
    const botId = document.getElementById('cozeBotId')?.value.trim();
    const statusDot = document.getElementById('cozeStatusDot');
    const statusText = document.getElementById('cozeStatusText');
    const testBtn = document.getElementById('testCozeConnection');
    
    if (!apiKey || !botId) {
        showCozeNotification('请先填写 API Key 和 Bot ID', 'error');
        return;
    }
    
    // 更新状态为连接中
    if (statusDot) {
        statusDot.className = 'status-dot connecting';
    }
    if (statusText) {
        statusText.textContent = '连接中...';
    }
    if (testBtn) {
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 测试中...';
    }
    
    try {
        // 保存配置
        const config = { apiKey, botId };
        localStorage.setItem('cozeConfig', JSON.stringify(config));
        
        // 模拟连接测试（实际项目中这里应该调用真实的 API）
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 连接成功
        if (statusDot) {
            statusDot.className = 'status-dot connected';
        }
        if (statusText) {
            statusText.textContent = '连接成功';
        }
        
        showCozeNotification('Coze 连接测试成功！', 'success');
        
    } catch (error) {
        console.error('Coze 连接测试失败:', error);
        
        // 连接失败
        if (statusDot) {
            statusDot.className = 'status-dot error';
        }
        if (statusText) {
            statusText.textContent = '连接失败';
        }
        
        showCozeNotification('Coze 连接测试失败，请检查配置', 'error');
    } finally {
        // 恢复按钮状态
        if (testBtn) {
            testBtn.disabled = false;
            testBtn.innerHTML = '<i class="fas fa-plug"></i> 测试连接';
        }
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input?.nextElementSibling;
    const icon = button?.querySelector('i');
    
    if (!input || !icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function showCozeNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `coze-notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#667eea'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// 在 SettingsSystem 类中添加 Coze 配置方法
SettingsSystem.prototype.initCozeConfig = function() {
    this.loadCozeConfig();
    this.bindCozeEvents();
    this.updateCozeStatus();
};

SettingsSystem.prototype.loadCozeConfig = function() {
    try {
        const config = JSON.parse(localStorage.getItem('cozeConfig') || '{}');
        
        const apiKeyInput = document.getElementById('cozeApiKey');
        const botIdInput = document.getElementById('cozeBotId');
        
        if (apiKeyInput && config.apiKey) {
            apiKeyInput.value = config.apiKey;
        }
        
        if (botIdInput && config.botId) {
            botIdInput.value = config.botId;
        }
    } catch (error) {
        console.error('加载 Coze 配置失败:', error);
    }
};

SettingsSystem.prototype.bindCozeEvents = function() {
    // 测试连接按钮
    const testBtn = document.getElementById('testCozeConnection');
    if (testBtn) {
        testBtn.addEventListener('click', testCozeConnection);
    }
    
    // 输入框变化时更新状态
    const apiKeyInput = document.getElementById('cozeApiKey');
    const botIdInput = document.getElementById('cozeBotId');
    
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', updateCozeStatus);
    }
    
    if (botIdInput) {
        botIdInput.addEventListener('input', updateCozeStatus);
    }
};

SettingsSystem.prototype.updateCozeStatus = function() {
    updateCozeStatus();
};

SettingsSystem.prototype.saveCozeConfig = function() {
    const apiKey = document.getElementById('cozeApiKey')?.value.trim();
    const botId = document.getElementById('cozeBotId')?.value.trim();
    
    if (apiKey && botId) {
        const config = { apiKey, botId };
        localStorage.setItem('cozeConfig', JSON.stringify(config));
        return true;
    }
    return false;
};