// Coze智能体客户端
class CozeClient {
    constructor() {
        this.config = window.cozeConfig;
        this.isConnected = false;
        this.messageQueue = [];
        this.currentRequest = null;
    }
    
    // 初始化连接
    async initialize() {
        if (!this.config.isConfigured()) {
            const status = this.config.getConfigStatus();
            throw new Error(status.message);
        }
        
        try {
            // 测试连接
            await this.testConnection();
            this.isConnected = true;
            console.log('Coze智能体连接成功');
            return true;
        } catch (error) {
            console.error('Coze智能体连接失败:', error);
            this.isConnected = false;
            throw error;
        }
    }
    
    // 测试连接
    async testConnection() {
        const testMessage = {
            conversation_id: this.config.conversationId,
            bot_id: this.config.botId,
            user: this.config.userId,
            query: "你好",
            stream: false
        };
        
        const response = await fetch(this.config.apiBaseUrl, {
            method: 'POST',
            headers: this.config.requestConfig.headers,
            body: JSON.stringify(testMessage)
        });
        
        if (!response.ok) {
            throw new Error(`连接测试失败: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    // 发送消息到Coze智能体
    async sendMessage(message, options = {}) {
        if (!this.isConnected) {
            throw new Error('Coze智能体未连接，请先初始化');
        }
        
        // 取消之前的请求
        if (this.currentRequest) {
            this.currentRequest.abort();
        }
        
        const controller = new AbortController();
        this.currentRequest = controller;
        
        try {
            const requestBody = {
                conversation_id: this.config.conversationId,
                bot_id: this.config.botId,
                user: this.config.userId,
                query: message,
                stream: options.stream || false,
                ...options.additionalParams
            };
            
            const response = await fetch(this.config.apiBaseUrl, {
                method: 'POST',
                headers: this.config.requestConfig.headers,
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            this.currentRequest = null;
            
            return this.processResponse(result);
            
        } catch (error) {
            this.currentRequest = null;
            if (error.name === 'AbortError') {
                throw new Error('请求已取消');
            }
            throw error;
        }
    }
    
    // 处理Coze响应
    processResponse(response) {
        try {
            // 根据Coze API响应格式处理
            if (response.code === 0 && response.data) {
                const messages = response.data.messages || [];
                const botMessages = messages.filter(msg => msg.role === 'assistant');
                
                if (botMessages.length > 0) {
                    // 获取最后一条机器人消息
                    const lastMessage = botMessages[botMessages.length - 1];
                    return {
                        success: true,
                        message: lastMessage.content,
                        messageId: response.data.id,
                        conversationId: response.data.conversation_id
                    };
                }
            }
            
            // 如果没有找到有效消息，返回默认响应
            return {
                success: false,
                message: '抱歉，我暂时无法理解您的问题，请稍后再试。',
                error: '无效的API响应格式'
            };
            
        } catch (error) {
            console.error('处理Coze响应时出错:', error);
            return {
                success: false,
                message: '处理响应时出现错误，请稍后再试。',
                error: error.message
            };
        }
    }
    
    // 流式响应处理（如果需要）
    async sendMessageStream(message, onChunk, options = {}) {
        if (!this.isConnected) {
            throw new Error('Coze智能体未连接，请先初始化');
        }
        
        const requestBody = {
            conversation_id: this.config.conversationId,
            bot_id: this.config.botId,
            user: this.config.userId,
            query: message,
            stream: true,
            ...options.additionalParams
        };
        
        try {
            const response = await fetch(this.config.apiBaseUrl, {
                method: 'POST',
                headers: this.config.requestConfig.headers,
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (onChunk) {
                                onChunk(data);
                            }
                        } catch (e) {
                            console.warn('解析流数据失败:', e);
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('流式请求失败:', error);
            throw error;
        }
    }
    
    // 重置对话
    resetConversation() {
        this.config.conversationId = this.config.generateConversationId();
        console.log('对话已重置，新的对话ID:', this.config.conversationId);
    }
    
    // 获取连接状态
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            configured: this.config.isConfigured(),
            conversationId: this.config.conversationId,
            userId: this.config.userId
        };
    }
    
    // 断开连接
    disconnect() {
        if (this.currentRequest) {
            this.currentRequest.abort();
            this.currentRequest = null;
        }
        this.isConnected = false;
        console.log('Coze智能体已断开连接');
    }
}

// 导出客户端实例
window.cozeClient = new CozeClient();