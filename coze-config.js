// Coze智能体配置文件
class CozeConfig {
    constructor() {
        // 从localStorage加载配置
        this.loadFromStorage();
        
        // Coze API配置
        this.apiBaseUrl = 'https://api.coze.cn/open_api/v2/chat';
        
        // 对话配置
        this.conversationId = this.generateConversationId();
        this.userId = this.getUserId();
        
        // 请求配置
        this.updateRequestConfig();
    }
    
    // 从localStorage加载配置
    loadFromStorage() {
        try {
            const savedConfig = localStorage.getItem('cozeConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.apiKey = config.apiKey || '';
                this.botId = config.botId || '';
            } else {
                this.apiKey = '';
                this.botId = '';
            }
        } catch (error) {
            console.error('加载Coze配置失败:', error);
            this.apiKey = '';
            this.botId = '';
        }
    }
    
    // 更新请求配置
    updateRequestConfig() {
        this.requestConfig = {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Host': 'api.coze.cn',
                'Connection': 'keep-alive'
            },
            timeout: 30000 // 30秒超时
        };
    }
    
    // 生成对话ID
    generateConversationId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // 获取用户ID
    getUserId() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            return user.email.replace('@', '_').replace('.', '_');
        }
        return 'guest_' + Date.now();
    }
    
    // 验证配置
    isConfigured() {
        return this.apiKey && this.botId;
    }
    
    // 获取配置状态
    getConfigStatus() {
        if (!this.apiKey) {
            return { valid: false, message: '请配置Coze API Key' };
        }
        if (!this.botId) {
            return { valid: false, message: '请配置Bot ID' };
        }
        return { valid: true, message: '配置完成' };
    }
}

// 导出配置实例
window.cozeConfig = new CozeConfig();