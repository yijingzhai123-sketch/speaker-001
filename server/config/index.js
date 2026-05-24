require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    maxTokens: 1024,
    temperature: 0.7,
  },
  wechat: {
    appId: process.env.WECHAT_APPID || '',
    appSecret: process.env.WECHAT_SECRET || '',
  },
  session: {
    maxHistoryLength: 20,
    maxContextAge: 30 * 60 * 1000,
  },
  difficulty: {
    1: { minAge: 3, maxAge: 5, label: '入门', maxSentenceWords: 6, vocabularyLevel: 'basic' },
    2: { minAge: 6, maxAge: 8, label: '基础', maxSentenceWords: 12, vocabularyLevel: 'elementary' },
    3: { minAge: 9, maxAge: 10, label: '中等', maxSentenceWords: 18, vocabularyLevel: 'intermediate' },
    4: { minAge: 11, maxAge: 12, label: '进阶', maxSentenceWords: 25, vocabularyLevel: 'upper-intermediate' },
  },
};
