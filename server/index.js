const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config/index');
const authMiddleware = require('./middleware/auth');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 60000, max: 60, message: { success: false, error: '请求过于频繁' } });
const chatLimiter = rateLimit({ windowMs: 60000, max: 20, message: { success: false, error: '对话请求过于频繁' } });

app.use('/api/', limiter);
app.use('/api/', authMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'KidsTalk API', version: '1.0.0', timestamp: Date.now(), model: config.deepseek.model, apiConfigured: !!config.deepseek.apiKey });
});

app.use('/api/auth', authRoutes.router);
app.use('/api/chat', chatLimiter, chatRoutes);

app.use((req, res) => { res.status(404).json({ error: '接口不存在' }); });
app.use((err, req, res, next) => { console.error('服务器错误:', err); res.status(500).json({ success: false, error: config.nodeEnv === 'development' ? err.message : '服务器内部错误' }); });

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🦉 KidsTalk Server running on http://localhost:${PORT}`);
  console.log(`AI Model: ${config.deepseek.model} | API: ${config.deepseek.apiKey ? '✅' : '❌'}`);
});

module.exports = app;
