const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/index');

const sessionStore = new Map();

router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: '缺少登录凭证' });
    if (config.wechat.appId && config.wechat.appSecret) {
      const wxResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: { appid: config.wechat.appId, secret: config.wechat.appSecret, js_code: code, grant_type: 'authorization_code' }
      });
      if (wxResponse.data.errcode) return res.status(400).json({ error: '微信登录失败', detail: wxResponse.data.errmsg });
      const { openid, session_key } = wxResponse.data;
      const sessionId = uuidv4();
      sessionStore.set(sessionId, { openid, sessionKey: session_key, createdAt: Date.now() });
      return res.json({ success: true, sessionId, openid });
    }
    const sessionId = uuidv4();
    sessionStore.set(sessionId, { openid: 'dev_' + uuidv4().slice(0, 8), createdAt: Date.now() });
    res.json({ success: true, sessionId, devMode: true });
  } catch (error) {
    const sessionId = uuidv4();
    res.json({ success: true, sessionId, devMode: true, note: '开发模式登录' });
  }
});

function getSession(sessionId) { return sessionStore.get(sessionId) || null; }
function cleanExpiredSessions(maxAge = 30 * 60 * 1000) {
  const now = Date.now();
  for (const [id, session] of sessionStore) { if (now - session.createdAt > maxAge) sessionStore.delete(id); }
}

module.exports = { router, getSession, cleanExpiredSessions };
