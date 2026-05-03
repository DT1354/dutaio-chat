-- 关掉注册邮箱验证
UPDATE auth.config SET value = false WHERE key = 'enable_signup_confirm';
