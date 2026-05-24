const app = getApp();

Page({
  data: {
    userInfo: {},
    aiPartner: { emoji: '🦉', identity: 'teacher', identityName: '英语老师', tone: 'warm', toneName: '温暖亲切' },
    difficultyLevel: 1,
    autoPlay: false,
    showNicknameModal: false, showAgeModal: false, showPartnerModal: false, showToneModal: false,
    editNickname: '',
    ageOptions: [3,4,5,6,7,8,9,10,11,12],
    partnerOptions: [
      { id: 'teacher', name: '英语老师', emoji: '🦉', desc: '耐心引导发音和语法' },
      { id: 'friend', name: '同龄伙伴', emoji: '🐱', desc: '像朋友一样轻松聊天' },
      { id: 'cartoon', name: '卡通角色', emoji: '🦊', desc: '充满童趣的角色扮演' }
    ],
    toneOptions: [
      { id: 'warm', name: '温暖亲切', emoji: '☀️', desc: '充满鼓励和肯定' },
      { id: 'funny', name: '幽默风趣', emoji: '😄', desc: '用笑话和趣味方式引导' },
      { id: 'strict', name: '严谨认真', emoji: '📚', desc: '注重发音和语法准确性' },
      { id: 'gentle', name: '温柔耐心', emoji: '🌸', desc: '特别适合害羞或初学者' }
    ]
  },
  onShow() { this.loadSettings(); },
  loadSettings() {
    const { userInfo, aiPartner } = app.globalData;
    const diffLevel = this.calcDifficulty(userInfo.age || 6);
    this.setData({ userInfo: {...userInfo}, aiPartner: {...aiPartner}, difficultyLevel: diffLevel, autoPlay: wx.getStorageSync('kidsTalk_autoPlay') || false });
  },
  calcDifficulty(age) { if (age <= 5) return 1; if (age <= 8) return 2; if (age <= 10) return 3; return 4; },
  onEditProfile() { this.setData({ showNicknameModal: true, editNickname: this.data.userInfo.nickname || '' }); },
  onEditNickname(e) { this.setData({ editNickname: e.detail.value }); },
  onSaveNickname() {
    const nickname = this.data.editNickname.trim();
    if (!nickname) { wx.showToast({ title: '昵称不能为空', icon: 'none' }); return; }
    app.globalData.userInfo.nickname = nickname; app.saveSetup();
    this.setData({ showNicknameModal: false }); this.loadSettings(); wx.showToast({ title: '昵称已更新', icon: 'success' });
  },
  onChangeAge() { this.setData({ showAgeModal: true }); },
  onSelectAge(e) { this.setData({ 'userInfo.age': e.currentTarget.dataset.age }); },
  onSaveAge() { app.globalData.userInfo.age = this.data.userInfo.age; app.saveSetup(); this.setData({ showAgeModal: false }); this.loadSettings(); wx.showToast({ title: '年龄已更新', icon: 'success' }); },
  onChangePartner() { this.setData({ showPartnerModal: true }); },
  onSelectPartner(e) { const { id, name, emoji } = e.currentTarget.dataset; this.setData({ 'aiPartner.identity': id, 'aiPartner.identityName': name, 'aiPartner.emoji': emoji }); },
  onSavePartner() { app.globalData.aiPartner = {...this.data.aiPartner}; app.saveSetup(); this.setData({ showPartnerModal: false }); this.loadSettings(); wx.showToast({ title: '对话伙伴已更新', icon: 'success' }); },
  onChangeTone() { this.setData({ showToneModal: true }); },
  onSelectTone(e) { const { id, name } = e.currentTarget.dataset; const toneMap = { warm:'温暖亲切', funny:'幽默风趣', strict:'严谨认真', gentle:'温柔耐心' }; this.setData({ 'aiPartner.tone': id, 'aiPartner.toneName': toneMap[id] || name }); },
  onSaveTone() { app.globalData.aiPartner = {...this.data.aiPartner}; app.saveSetup(); this.setData({ showToneModal: false }); this.loadSettings(); wx.showToast({ title: '语气风格已更新', icon: 'success' }); },
  onAutoPlayChange(e) { this.setData({ autoPlay: e.detail.value }); wx.setStorageSync('kidsTalk_autoPlay', e.detail.value); },
  onClearHistory() { wx.showModal({ title: '确认清空', content: '确定要清空所有对话记录吗？', confirmColor: '#FF4757', success: (res) => { if (res.confirm) { app.globalData.chatHistory = []; app.saveSetup(); wx.showToast({ title: '已清空', icon: 'success' }); } } }); },
  onResetAll() {
    wx.showModal({ title: '确认重置', content: '将清除所有设置和对话记录。确定继续吗？', confirmColor: '#FF4757', success: (res) => {
      if (res.confirm) {
        app.globalData.isSetup = false;
        app.globalData.userInfo = { nickname:'', age:6, avatarUrl:'' };
        app.globalData.aiPartner = { identity:'teacher', identityName:'英语老师', tone:'warm', toneName:'温暖亲切', emoji:'🦉' };
        app.globalData.chatHistory = [];
        wx.removeStorageSync('kidsTalk_setup'); wx.removeStorageSync('kidsTalk_autoPlay');
        this.loadSettings(); wx.showToast({ title: '已重置', icon: 'success' });
        setTimeout(() => wx.switchTab({ url:'/pages/index/index' }), 800);
      }
    }});
  },
  onCloseModal() { this.setData({ showNicknameModal:false, showAgeModal:false, showPartnerModal:false, showToneModal:false }); }
});
