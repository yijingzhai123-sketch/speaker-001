const api = require('./api.js');

let recorderManager = null;
let innerAudioContext = null;

const getRecorderManager = () => {
  if (!recorderManager) {
    recorderManager = wx.getRecorderManager();
  }
  return recorderManager;
};

const startRecord = () => {
  return new Promise((resolve, reject) => {
    const manager = getRecorderManager();

    manager.onStop((res) => {
      if (res.tempFilePath) {
        resolve(res.tempFilePath);
      } else {
        reject(new Error('录音失败'));
      }
    });

    manager.onError((err) => {
      reject(err);
    });

    manager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    });
  });
};

const stopRecord = () => {
  const manager = getRecorderManager();
  manager.stop();
};

const recognizeVoice = async (filePath) => {
  try {
    const result = await api.uploadVoice(filePath);
    return result.text || '';
  } catch (err) {
    console.error('语音识别失败:', err);
    throw err;
  }
};

const playTTS = async (text) => {
  try {
    const result = await api.getTTS(text);
    if (result.audioUrl) {
      if (!innerAudioContext) {
        innerAudioContext = wx.createInnerAudioContext();
      }
      innerAudioContext.src = result.audioUrl;
      innerAudioContext.play();
    }
  } catch (err) {
    console.error('TTS播放失败:', err);
  }
};

const stopPlay = () => {
  if (innerAudioContext) {
    innerAudioContext.stop();
  }
};

const destroyAudio = () => {
  if (innerAudioContext) {
    innerAudioContext.destroy();
    innerAudioContext = null;
  }
};

module.exports = {
  startRecord,
  stopRecord,
  recognizeVoice,
  playTTS,
  stopPlay,
  destroyAudio,
  getRecorderManager
};
