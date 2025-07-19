// Supabase 客户端封装类
class SupabaseClient {
    constructor() {
        this.supabase = null;
        this.isInitialized = false;
        this.fallbackMode = false;
        this.init();
    }

    // 初始化 Supabase 客户端
    async init() {
        try {
            // 检查配置是否存在
            if (!window.SUPABASE_CONFIG || 
                !window.SUPABASE_CONFIG.url || 
                !window.SUPABASE_CONFIG.anonKey ||
                window.SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' ||
                window.SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
                
                console.warn('Supabase 配置未设置，将使用 localStorage 模式');
                this.fallbackMode = true;
                this.isInitialized = true;
                return;
            }

            // 检查 Supabase 库是否加载
            if (typeof window.supabase === 'undefined') {
                console.warn('Supabase 库未加载，将使用 localStorage 模式');
                this.fallbackMode = true;
                this.isInitialized = true;
                return;
            }

            // 初始化 Supabase 客户端
            this.supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey,
                window.SUPABASE_CONFIG.options || {}
            );

            // 测试连接
            const { data, error } = await this.supabase.auth.getSession();
            if (error && error.message.includes('Invalid API key')) {
                throw new Error('无效的 API 密钥');
            }

            this.isInitialized = true;
            console.log('Supabase 客户端初始化成功');
            
        } catch (error) {
            console.error('Supabase 初始化失败:', error);
            console.warn('降级到 localStorage 模式');
            this.fallbackMode = true;
            this.isInitialized = true;
        }
    }

    // 等待初始化完成
    async waitForInit() {
        while (!this.isInitialized) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // 用户认证相关方法
    async signUp(email, password, userData = {}) {
        await this.waitForInit();
        
        if (this.fallbackMode) {
            return this.fallbackSignUp(email, password, userData);
        }

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nickname: userData.nickname || email.split('@')[0],
                        phone: userData.phone || '',
                        avatar_url: userData.avatar || ''
                    }
                }
            });

            if (error) throw error;

            // 同时在 users 表中创建记录
            if (data.user) {
                await this.createUserProfile(data.user.id, {
                    email,
                    nickname: userData.nickname || email.split('@')[0],
                    phone: userData.phone || '',
                    avatar_url: userData.avatar || ''
                });
            }

            return { success: true, user: data.user };
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        await this.waitForInit();
        
        if (this.fallbackMode) {
            return this.fallbackSignIn(email, password);
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            return { success: true, user: data.user };
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        await this.waitForInit();
        
        if (this.fallbackMode) {
            return this.fallbackSignOut();
        }

        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('登出失败:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        await this.waitForInit();
        
        if (this.fallbackMode) {
            return this.fallbackGetCurrentUser();
        }

        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('获取当前用户失败:', error);
            return null;
        }
    }

    // 用户资料相关方法
    async createUserProfile(userId, profileData) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .insert([{
                    id: userId,
                    email: profileData.email,
                    nickname: profileData.nickname,
                    phone: profileData.phone,
                    avatar_url: profileData.avatar_url
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('创建用户资料失败:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserProfile(userId) {
        await this.waitForInit();
        
        if (this.fallbackMode) {
            return this.fallbackGetUserProfile(userId);
        }

        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取用户资料失败:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserProfile(userId, updates) {
        await this.waitForInit();
        
        if (this.fallbackMode) {
            return this.fallbackUpdateUserProfile(userId, updates);
        }

        try {
            const { data, error } = await this.supabase
                .from('users')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('更新用户资料失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 验证码相关方法
    async createVerificationCode(email, code, type = 'register') {
        await this.waitForInit();
        
        if (this.fallbackMode) {
            return this.fallbackCreateVerificationCode(email, code, type);
        }

        try {
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5分钟后过期

            const { data, error } = await this.supabase
                .from('verification_codes')
                .insert([{
                    email,
                    code,
                    type,
                    expires_at: expiresAt.toISOString()
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('创建验证码失败:', error);
            return { success: false, error: error.message };
        }
    }

    async verifyCode(email, code, type = 'register') {
        await this.waitForInit();
        
        if (this.fallbackMode) {
            return this.fallbackVerifyCode(email, code, type);
        }

        try {
            const { data, error } = await this.supabase
                .from('verification_codes')
                .select('*')
                .eq('email', email)
                .eq('code', code)
                .eq('type', type)
                .eq('used', false)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                // 标记验证码为已使用
                await this.supabase
                    .from('verification_codes')
                    .update({ used: true })
                    .eq('id', data[0].id);

                return { success: true, valid: true };
            } else {
                return { success: true, valid: false };
            }
        } catch (error) {
            console.error('验证码验证失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 用户设置相关方法
    async getUserSettings(userId) {
        await this.waitForInit();
        
        if (this.fallbackMode) {
            return this.fallbackGetUserSettings(userId);
        }

        try {
            const { data, error } = await this.supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = 没有找到记录

            return { success: true, data: data || {} };
        } catch (error) {
            console.error('获取用户设置失败:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserSettings(userId, settings) {
        await this.waitForInit();
        
        if (this.fallbackMode) {
            return this.fallbackUpdateUserSettings(userId, settings);
        }

        try {
            const { data, error } = await this.supabase
                .from('user_settings')
                .upsert({
                    user_id: userId,
                    ...settings,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('更新用户设置失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 降级到 localStorage 的方法
    fallbackSignUp(email, password, userData) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const existingUser = users.find(user => user.email === email);
            
            if (existingUser) {
                return { success: false, error: '邮箱已被注册' };
            }

            const newUser = {
                id: Date.now().toString(),
                email,
                password, // 注意：实际应用中不应明文存储密码
                nickname: userData.nickname || email.split('@')[0],
                phone: userData.phone || '',
                avatar: userData.avatar || '',
                registeredAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            return { success: true, user: newUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    fallbackSignIn(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                return { success: true, user };
            } else {
                return { success: false, error: '邮箱或密码错误' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    fallbackSignOut() {
        localStorage.removeItem('currentUser');
        return { success: true };
    }

    fallbackGetCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }

    fallbackGetUserProfile(userId) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = users.find(u => u.id === userId);
            return { success: true, data: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    fallbackUpdateUserProfile(userId, updates) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updates };
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
                // 更新当前用户信息
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                if (currentUser.id === userId) {
                    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
                }
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    fallbackCreateVerificationCode(email, code, type) {
        // localStorage 版本的验证码存储
        const codes = JSON.parse(localStorage.getItem('verificationCodes') || '[]');
        const newCode = {
            id: Date.now().toString(),
            email,
            code,
            type,
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5分钟后过期
            used: false,
            created_at: new Date().toISOString()
        };
        
        codes.push(newCode);
        localStorage.setItem('verificationCodes', JSON.stringify(codes));
        
        return { success: true, data: newCode };
    }

    fallbackVerifyCode(email, code, type) {
        const codes = JSON.parse(localStorage.getItem('verificationCodes') || '[]');
        const validCode = codes.find(c => 
            c.email === email && 
            c.code === code && 
            c.type === type && 
            !c.used && 
            new Date(c.expires_at) > new Date()
        );
        
        if (validCode) {
            // 标记为已使用
            validCode.used = true;
            localStorage.setItem('verificationCodes', JSON.stringify(codes));
            return { success: true, valid: true };
        } else {
            return { success: true, valid: false };
        }
    }

    fallbackGetUserSettings(userId) {
        const settings = JSON.parse(localStorage.getItem(`userSettings_${userId}`) || '{}');
        return { success: true, data: settings };
    }

    fallbackUpdateUserSettings(userId, settings) {
        localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settings));
        return { success: true };
    }
}

// 创建全局 Supabase 客户端实例
const supabaseClient = new SupabaseClient();

// 导出供其他文件使用
window.supabaseClient = supabaseClient;