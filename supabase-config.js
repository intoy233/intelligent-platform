// Supabase 配置文件
// 请在 Supabase 控制台获取您的项目 URL 和 API 密钥

const SUPABASE_CONFIG = {
    // 您的 Supabase 项目 URL
    // 格式: https://your-project-id.supabase.co
    url: 'https://aluqboswnqlnhhxxsxum.supabase.co',
    
    // 您的 Supabase 匿名密钥 (anon key)
    // 这是公开的密钥，可以安全地在前端使用
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdXFib3N3bnFsbmhoeHhzeHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDIwMzcsImV4cCI6MjA2ODQxODAzN30.8njrqfnjHCyeEi0MOlMsV6gcc2TNmFgtwNuaEROsgZE',
    
    // 可选配置
    options: {
        auth: {
            // 自动刷新令牌
            autoRefreshToken: true,
            // 持久化会话
            persistSession: true,
            // 检测会话变化
            detectSessionInUrl: true
        }
    }
};

// 导出配置
window.SUPABASE_CONFIG = SUPABASE_CONFIG;