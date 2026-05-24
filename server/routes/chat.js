const express = require('express');
const router = express.Router();
const multer = require('multer');
const deepseekService = require('../services/deepseek');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const sessions = new Map();

router.post('/send', async (req, res) => {
  try {
    const { message, age, identity, tone, history } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: '消息不能为空' });
    const result = await deepseekService.chat(message, { age: age || 6, identity: identity || 'teacher', tone: tone || 'warm', history: history || [] });
    res.json({ success: true, reply: result.reply, followUp: result.followUp, timestamp: Date.now() });
  } catch (error) {
    console.error('对话错误:', error.message);
    res.status(500).json({ success: false, error: error.message || '服务暂时不可用' });
  }
});

router.post('/topics', async (req, res) => {
  try {
    const { age, identity, tone } = req.body;
    const topics = await deepseekService.generateTopics({ age: age || 6, identity: identity || 'teacher', tone: tone || 'warm' });
    res.json({ success: true, topics, timestamp: Date.now() });
  } catch (error) {
    const defaultTopics = ['What color do you like? 你喜欢什么颜色？', 'Do you have a pet? 你有宠物吗？', 'What\'s your favorite food? 你最喜欢什么食物？'];
    res.json({ success: true, topics: defaultTopics });
  }
});

router.post('/voice', upload.single('voice'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '未收到语音文件' });
    const result = await deepseekService.speechToText(req.file.buffer);
    res.json({ success: true, text: result.text });
  } catch (error) {
    res.status(500).json({ success: false, error: '语音识别服务暂未配置' });
  }
});

router.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: '文本不能为空' });
    const result = await deepseekService.textToSpeech(text);
    res.json({ success: true, audioUrl: result.audioUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: '语音合成服务暂未配置' });
  }
});

module.exports = router;
