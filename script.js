// 主题管理
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && savedTheme !== 'light') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// DOM 元素
const videoElement = document.getElementById('videoElement');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');
const startCameraBtn = document.getElementById('startCamera');
const stopCameraBtn = document.getElementById('stopCamera');
const capturePhotoBtn = document.getElementById('capturePhoto');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const chatMessages = document.getElementById('chatMessages');
const clearChatBtn = document.getElementById('clearChat');
const attachFileBtn = document.getElementById('attachFile');
const voiceInputBtn = document.getElementById('voiceInput');

// 全局变量
let mediaStream = null;
let isRecording = false;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSavedTheme(); // 加载保存的主题
    initializeEventListeners();
    updateSendButtonState();
    checkUserLoginStatus();
});

// 检查用户登录状态
function checkUserLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        updateNavbarForLoggedInUser(user);
    }
}

// 更新导航栏显示已登录用户
function updateNavbarForLoggedInUser(user) {
    // 获取用户资料信息
    const profileData = localStorage.getItem(`profile_${user.email}`);
    const profile = profileData ? JSON.parse(profileData) : { nickname: '用户', avatar: null };
    
    const navButtons = document.querySelector('.nav-buttons');
    navButtons.innerHTML = `
        <button class="nav-btn settings-btn" title="个性化设置" onclick="window.location.href='settings.html'">
            <i class="fas fa-cog"></i>
        </button>
        <button class="user-profile-btn" onclick="window.location.href='profile.html'" title="个人信息">
            <div class="user-avatar">
                <img src="${profile.avatar || getDefaultAvatar()}" alt="用户头像" />
            </div>
            <span class="user-nickname">${profile.nickname}</span>
        </button>
        <button class="nav-btn logout-btn" onclick="handleLogout()" title="退出登录">
            <i class="fas fa-sign-out-alt"></i>
            <span>退出</span>
        </button>
    `;
    
    // 添加用户信息样式
    const style = document.createElement('style');
    style.textContent = `
        .user-profile-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 1rem;
            background: rgba(102, 126, 234, 0.1);
            border: 2px solid rgba(102, 126, 234, 0.3);
            border-radius: 25px;
            color: #667eea;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        .user-profile-btn:hover {
            background: rgba(102, 126, 234, 0.2);
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid rgba(102, 126, 234, 0.3);
            transition: border-color 0.3s ease;
        }
        .user-profile-btn:hover .user-avatar {
            border-color: #667eea;
        }
        .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .user-nickname {
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .logout-btn {
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
            border: 2px solid #dc3545;
        }
        .logout-btn:hover {
            background: #dc3545;
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// 获取默认头像
function getDefaultAvatar() {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB4PSIyNSIgeT0iMjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOTk5Ij4KPHA+dGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOC4zMyAxNSAxMiAxNUMxNS42NyAxNSAyMSAxNi4zMyAyMSAxOVpNMTIgN0MxNC43NiA3IDE3IDkuMjQgMTcgMTJWMTNIMTlWMTJDMTkgOC4xMyAxNS44NyA1IDEyIDVDOC4xMyA1IDUgOC4xMyA1IDEyVjEzSDdWMTJDNyA5LjI0IDkuMjQgNyAxMiA3WiIvPgo8L3N2Zz4KPC9zdmc+";
}

// 处理退出登录
function handleLogout() {
    localStorage.removeItem('currentUser');
    showNotification('已退出登录', 'info');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// 事件监听器初始化
function initializeEventListeners() {
    // 摄像头控制
    startCameraBtn.addEventListener('click', startCamera);
    stopCameraBtn.addEventListener('click', stopCamera);
    capturePhotoBtn.addEventListener('click', capturePhoto);
    
    // 聊天功能
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', handleKeyPress);
    messageInput.addEventListener('input', updateSendButtonState);
    clearChatBtn.addEventListener('click', clearChat);
    
    // 其他功能按钮
    attachFileBtn.addEventListener('click', handleAttachFile);
    voiceInputBtn.addEventListener('click', handleVoiceInput);
    
    // 导航栏按钮
    document.querySelector('.login-btn').addEventListener('click', handleLogin);
    document.querySelector('.register-btn').addEventListener('click', handleRegister);
    document.querySelector('.settings-btn').addEventListener('click', handleSettings);
    
    // 搜索功能
    document.querySelector('.search-input').addEventListener('keypress', handleSearch);
}

// 摄像头功能
async function startCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: false 
        });
        
        videoElement.srcObject = mediaStream;
        videoElement.style.display = 'block';
        cameraPlaceholder.style.display = 'none';
        
        // 更新按钮状态
        startCameraBtn.style.opacity = '0.5';
        startCameraBtn.disabled = true;
        stopCameraBtn.style.opacity = '1';
        stopCameraBtn.disabled = false;
        capturePhotoBtn.style.opacity = '1';
        capturePhotoBtn.disabled = false;
        
        showNotification('摄像头已开启', 'success');
    } catch (error) {
        console.error('无法访问摄像头:', error);
        showNotification('无法访问摄像头，请检查权限设置', 'error');
    }
}

function stopCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    videoElement.style.display = 'none';
    cameraPlaceholder.style.display = 'flex';
    
    // 更新按钮状态
    startCameraBtn.style.opacity = '1';
    startCameraBtn.disabled = false;
    stopCameraBtn.style.opacity = '0.5';
    stopCameraBtn.disabled = true;
    capturePhotoBtn.style.opacity = '0.5';
    capturePhotoBtn.disabled = true;
    
    showNotification('摄像头已关闭', 'info');
}

function capturePhoto() {
    if (!mediaStream) {
        showNotification('请先开启摄像头', 'warning');
        return;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    context.drawImage(videoElement, 0, 0);
    
    // 创建下载链接
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `photo_${new Date().getTime()}.png`;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    showNotification('照片已保存', 'success');
}

// 聊天功能
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // 添加用户消息
    addMessage(message, 'user');
    
    // 清空输入框
    messageInput.value = '';
    updateSendButtonState();
    
    // 模拟机器人回复
    setTimeout(() => {
        const responses = [
            '我收到了您的消息，正在处理中...',
            '这是一个很有趣的问题！',
            '感谢您的输入，我会认真考虑的。',
            '您说得很对，让我想想如何回应。',
            '这个话题很有意思，我们可以深入讨论。'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'bot');
    }, 1000);
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    
    // 添加时间戳
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();
    timestamp.style.fontSize = '0.8rem';
    timestamp.style.opacity = '0.7';
    timestamp.style.marginTop = '0.5rem';
    
    messageDiv.appendChild(timestamp);
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function updateSendButtonState() {
    const hasText = messageInput.value.trim().length > 0;
    sendMessageBtn.disabled = !hasText;
    sendMessageBtn.style.opacity = hasText ? '1' : '0.5';
}

function clearChat() {
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-robot"></i>
            <p>对话已清空，您可以重新开始对话。</p>
        </div>
    `;
    showNotification('对话已清空', 'info');
}

// 其他功能
function handleAttachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            showNotification(`已选择文件: ${file.name}`, 'info');
            // 这里可以添加文件上传逻辑
        }
    };
    input.click();
}

function handleVoiceInput() {
    if (!isRecording) {
        startVoiceRecording();
    } else {
        stopVoiceRecording();
    }
}

function startVoiceRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotification('您的浏览器不支持语音录制', 'error');
        return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            isRecording = true;
            voiceInputBtn.innerHTML = '<i class="fas fa-stop"></i>';
            voiceInputBtn.style.background = '#dc3545';
            showNotification('开始录音...', 'info');
            
            // 这里可以添加实际的语音识别逻辑
            // 目前只是模拟
        })
        .catch(error => {
            console.error('无法访问麦克风:', error);
            showNotification('无法访问麦克风，请检查权限设置', 'error');
        });
}

function stopVoiceRecording() {
    isRecording = false;
    voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceInputBtn.style.background = '';
    showNotification('录音结束', 'info');
    
    // 模拟语音识别结果
    setTimeout(() => {
        messageInput.value = '这是通过语音输入的文字（模拟）';
        updateSendButtonState();
    }, 1000);
}

// 导航栏功能
function handleLogin() {
    window.location.href = 'auth.html';
}

function handleRegister() {
    window.location.href = 'auth.html';
}

function handleSettings() {
    showNotification('设置功能开发中...', 'info');
    // 这里可以添加设置面板逻辑
}

function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
            showNotification(`搜索: ${query}`, 'info');
            // 这里可以添加搜索逻辑
        }
    }
}

// 通知系统
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // 根据类型设置背景色
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.background = colors[type] || colors.info;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 工具函数
function formatTime(date) {
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden && mediaStream) {
        // 页面隐藏时暂停摄像头（可选）
        console.log('页面隐藏，摄像头继续运行');
    }
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
});