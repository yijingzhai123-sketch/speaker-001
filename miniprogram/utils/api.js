const app = getApp();

const request = (url, options = {}) => {
  const baseUrl = app.globalData.baseUrl;
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (app.globalData.sessionId || ''),
        ...(options.header || {})
      },
      timeout: options.timeout || 30000,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject({ code: res.statusCode, message: res.data.message || '请求失败' });
        }
      },
      fail: (err) => {
        reject({ code: -1, message: '网络错误，请检查网络连接', error: err });
      }
    });
  });
};

const sendMessage = (message, context) => {
  return request('/chat/send', {
    method: 'POST',
    data: {
      message,
      age: context.age,
      identity: context.identity,
      tone: context.tone,
      history: context.history || []
    }
  });
};

const getTopics = (context) => {
  return request('/chat/topics', {
    method: 'POST',
    data: {
      age: context.age,
      identity: context.identity,
      tone: context.tone
    }
  });
};

const uploadVoice = (filePath) => {
  return new Promise((resolve, reject) => {
    const baseUrl = app.globalData.baseUrl;
    wx.uploadFile({
      url: baseUrl + '/chat/voice',
      filePath: filePath,
      name: 'voice',
      header: {
        'Authorization': 'Bearer ' + (app.globalData.sessionId || '')
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          resolve(data);
        } catch (e) {
          reject({ code: -1, message: '语音识别失败' });
        }
      },
      fail: (err) => {
        reject({ code: -1, message: '上传失败', error: err });
      }
    });
  });
};

const getTTS = (text) => {
  return request('/chat/tts', {
    method: 'POST',
    data: { text }
  });
};

module.exports = {
  request,
  sendMessage,
  getTopics,
  uploadVoice,
  getTTS
};
