App({
  globalData: {
    userInfo: {
      nickname: '',
      age: 6,
      avatarUrl: ''
    },
    aiPartner: {
      identity: 'teacher',
      identityName: '英语老师',
      tone: 'warm',
      toneName: '温暖亲切',
      avatar: '🦉'
    },
    sessionId: '',
    chatHistory: [],
    baseUrl: 'https://your-server-domain.com/api',
    isSetup: false
  },

  onLaunch() {
    const setup = wx.getStorageSync('kidsTalk_setup');
    if (setup) {
      this.globalData.isSetup = setup.isSetup || false;
      this.globalData.userInfo = setup.userInfo || this.globalData.userInfo;
      this.globalData.aiPartner = setup.aiPartner || this.globalData.aiPartner;
      this.globalData.chatHistory = setup.chatHistory || [];
    }
    this.checkLogin();
  },

  checkLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: this.globalData.baseUrl + '/auth/login',
            method: 'POST',
            data: { code: res.code },
            success: (loginRes) => {
              if (loginRes.data && loginRes.data.sessionId) {
                this.globalData.sessionId = loginRes.data.sessionId;
                wx.setStorageSync('kidsTalk_sessionId', loginRes.data.sessionId);
              }
            },
            fail: () => {
              console.log('后端未连接，使用离线模式');
            }
          });
        }
      }
    });
  },

  saveSetup() {
    const setup = {
      isSetup: this.globalData.isSetup,
      userInfo: this.globalData.userInfo,
      aiPartner: this.globalData.aiPartner,
      chatHistory: this.globalData.chatHistory
    };
    wx.setStorageSync('kidsTalk_setup', setup);
  }
});
