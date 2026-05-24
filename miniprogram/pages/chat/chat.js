const app = getApp();
const api = require('../../utils/api.js');
const voiceUtil = require('../../utils/voice.js');

Page({
  data: {
    userInfo: {},
    aiPartner: { emoji: '🦉', identityName: '伙伴', toneName: '温暖亲切' },
    difficultyLevel: 1,
    messages: [],
    inputText: '',
    isTyping: false,
    scrollToView: '',
    isVoiceMode: false,
    isRecording: false,
    suggestedTopics: [],
    conversationHistory: []
  },

  onLoad(options) {
    if (options.topic) {
      this.setData({ inputText: decodeURIComponent(options.topic) });
    }
  },

  onShow() { this.initChatContext(); },
  onHide() { if (this.data.isRecording) voiceUtil.stopRecord(); voiceUtil.stopPlay(); },
  onUnload() { voiceUtil.destroyAudio(); },

  initChatContext() {
    const { userInfo, aiPartner, chatHistory } = app.globalData;
    if (!app.globalData.isSetup) {
      wx.showModal({ title: '提示', content: '请先在首页完成设置', showCancel: false, success: () => wx.switchTab({ url: '/pages/index/index' }) });
      return;
    }
    const diffLevel = this.calcDifficulty(userInfo.age);
    this.setData({ userInfo, aiPartner, difficultyLevel: diffLevel, messages: chatHistory || [], suggestedTopics: this.getSuggestedTopics(userInfo.age) });
    if (chatHistory && chatHistory.length > 0) this.scrollToBottom();
  },

  calcDifficulty(age) { if (age <= 5) return 1; if (age <= 8) return 2; if (age <= 10) return 3; return 4; },

  getSuggestedTopics(age) {
    const topics = {
      1: ['你最喜欢的颜色', '你养宠物吗？', '你早餐吃了什么？'],
      2: ['你最喜欢的运动', '你的好朋友是谁？', '周末喜欢做什么？'],
      3: ['你最喜欢的科目', '去过最有趣的地方', '如果你有超能力…'],
      4: ['你未来的梦想', '最难忘的旅行', '如果能改变一件事…']
    };
    return topics[this.calcDifficulty(age)] || topics[2];
  },

  async onSendText() {
    const text = this.data.inputText.trim();
    if (!text) return;
    const userMsg = { id: 'user-' + Date.now(), role: 'user', content: text, timestamp: Date.now() };
    const messages = [...this.data.messages, userMsg];
    this.setData({ messages, inputText: '', isTyping: true });
    this.scrollToBottom();
    const history = this.buildHistory(messages);
    try {
      const response = await api.sendMessage(text, { age: this.data.userInfo.age, identity: this.data.aiPartner.identity, tone: this.data.aiPartner.tone, history });
      const aiMsg = { id: 'ai-' + Date.now(), role: 'assistant', content: response.reply || 'Sorry, I didn\'t catch that.', timestamp: Date.now(), followUp: response.followUp || null };
      const newMessages = [...this.data.messages, aiMsg];
      this.setData({ messages: newMessages, isTyping: false });
      this.scrollToBottom();
      this.saveChatHistory(newMessages);
    } catch (err) {
      const offlineReply = this.getOfflineReply(text);
      const aiMsg = { id: 'ai-' + Date.now(), role: 'assistant', content: offlineReply, timestamp: Date.now() };
      const newMessages = [...this.data.messages, aiMsg];
      this.setData({ messages: newMessages, isTyping: false });
      this.scrollToBottom();
      this.saveChatHistory(newMessages);
    }
  },

  buildHistory(messages) { return messages.slice(-20).map(msg => ({ role: msg.role, content: msg.content })); },

  getOfflineReply(text) {
    const replies = ["That's interesting! Tell me more.", "I see! What do you like most about that?", "Great! Can you describe it in English?", "Wow, cool! When did you start liking that?", "Nice! Would you like to tell me more?", "That sounds fun! Who do you do that with?"];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    return /[\u4e00-\u9fa5]/.test(text) ? "Great try! " + randomReply + " Don't worry about mistakes!" : randomReply;
  },

  onTopicChipTap(e) { this.setData({ inputText: e.currentTarget.dataset.topic }); this.onSendText(); },
  onInputChange(e) { this.setData({ inputText: e.detail.value }); },
  onSwitchToVoice() { this.setData({ isVoiceMode: true }); },
  onSwitchToText() { this.setData({ isVoiceMode: false }); },
  onVoiceStart() { this.setData({ isRecording: true }); voiceUtil.startRecord().catch(() => { this.setData({ isRecording: false }); }); },
  onVoiceEnd() { if (!this.data.isRecording) return; voiceUtil.stopRecord(); this.setData({ isRecording: false }); wx.showToast({ title: '语音功能需配置语音识别服务', icon: 'none' }); },
  onVoiceCancel() { voiceUtil.stopRecord(); this.setData({ isRecording: false }); },
  onPlayTTS(e) { voiceUtil.playTTS(e.currentTarget.dataset.text); },
  onCopyText(e) { wx.setClipboardData({ data: e.currentTarget.dataset.text, success: () => wx.showToast({ title: '已复制', icon: 'success' }) }); },

  onClearChat() {
    wx.showModal({ title: '确认清空', content: '确定要清空所有对话记录吗？', success: (res) => {
      if (res.confirm) { this.setData({ messages: [], conversationHistory: [] }); app.globalData.chatHistory = []; app.saveSetup(); }
    }});
  },

  scrollToBottom() { const messages = this.data.messages; if (messages.length > 0) { this.setData({ scrollToView: 'msg-' + messages[messages.length-1].id }); } },
  saveChatHistory(messages) { app.globalData.chatHistory = messages.slice(-50); app.saveSetup(); }
});
