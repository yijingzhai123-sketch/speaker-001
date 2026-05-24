const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    isSetup: false,
    nickname: '',
    age: 6,
    ageOptions: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    aiPartner: {
      identity: 'teacher',
      identityName: '英语老师',
      emoji: '🦉',
      tone: 'warm',
      toneName: '温暖亲切'
    },
    userInfo: {},
    partnerOptions: [
      { id: 'teacher', name: '英语老师', emoji: '🦉', desc: '耐心引导发音和语法' },
      { id: 'friend', name: '同龄伙伴', emoji: '🐱', desc: '像朋友一样轻松聊天' },
      { id: 'cartoon', name: '卡通角色', emoji: '🦊', desc: '充满童趣的角色扮演' }
    ],
    toneOptions: [
      { id: 'warm', name: '温暖亲切', emoji: '☀️', desc: '充满鼓励和肯定，让孩子自信开口' },
      { id: 'funny', name: '幽默风趣', emoji: '😄', desc: '用笑话和趣味方式引导对话' },
      { id: 'strict', name: '严谨认真', emoji: '📚', desc: '注重发音和语法准确性' },
      { id: 'gentle', name: '温柔耐心', emoji: '🌸', desc: '特别适合害羞或初学者' }
    ],
    topics: [],
    canStart: false
  },

  onLoad() { this.initData(); },
  onShow() { this.initData(); },

  initData() {
    const { isSetup, userInfo, aiPartner, chatHistory } = app.globalData;
    this.setData({ isSetup, userInfo, aiPartner, nickname: userInfo.nickname || '', age: userInfo.age || 6 });
    if (isSetup) this.loadTopics();
    this.checkCanStart();
  },

  onNicknameInput(e) { this.setData({ nickname: e.detail.value }); this.checkCanStart(); },
  onAgeSelect(e) { const age = e.currentTarget.dataset.age; this.setData({ age }); this.checkCanStart(); },
  onPartnerSelect(e) {
    const { id, name, emoji } = e.currentTarget.dataset;
    this.setData({ 'aiPartner.identity': id, 'aiPartner.identityName': name, 'aiPartner.emoji': emoji });
    this.checkCanStart();
  },
  onToneSelect(e) {
    const { id, name } = e.currentTarget.dataset;
    const toneMap = { warm: '温暖亲切', funny: '幽默风趣', strict: '严谨认真', gentle: '温柔耐心' };
    this.setData({ 'aiPartner.tone': id, 'aiPartner.toneName': toneMap[id] || name });
    this.checkCanStart();
  },
  checkCanStart() {
    const { nickname, age, aiPartner } = this.data;
    this.setData({ canStart: nickname.trim().length > 0 && age > 0 && aiPartner.identity });
  },

  onStart() {
    const { nickname, age, aiPartner } = this.data;
    if (!nickname.trim()) { wx.showToast({ title: '请输入昵称', icon: 'none' }); return; }
    app.globalData.isSetup = true;
    app.globalData.userInfo = { nickname: nickname.trim(), age };
    app.globalData.aiPartner = aiPartner;
    app.saveSetup();
    this.setData({ isSetup: true, userInfo: app.globalData.userInfo });
    wx.showToast({ title: '设置完成！', icon: 'success' });
    this.loadTopics();
  },

  async loadTopics() {
    try {
      const result = await api.getTopics({ age: this.data.age, identity: this.data.aiPartner.identity, tone: this.data.aiPartner.tone });
      this.setData({ topics: result.topics || [] });
    } catch (err) {
      this.setData({ topics: this.getDefaultTopics() });
    }
  },

  onRefreshTopics() { this.loadTopics(); },

  getDefaultTopics() {
    const age = this.data.age;
    if (age <= 5) return ['你喜欢什么颜色？What color do you like?', '你最喜欢的动物是什么？What\'s your favorite animal?', '今天天气怎么样？How\'s the weather today?'];
    if (age <= 8) return ['你周末喜欢做什么？What do you like to do on weekends?', '你最好的朋友是谁？Who is your best friend?', '你最喜欢的食物是什么？What\'s your favorite food?'];
    return ['如果你可以飞，你想去哪里？If you could fly, where would you go?', '你最近读了什么有趣的书？What interesting book have you read recently?', '你长大后想做什么？What do you want to be when you grow up?'];
  },

  onTopicTap(e) {
    const topic = e.currentTarget.dataset.topic;
    wx.navigateTo({ url: '/pages/chat/chat?topic=' + encodeURIComponent(topic) });
  },

  onGoChat() { wx.switchTab({ url: '/pages/chat/chat' }); }
});
