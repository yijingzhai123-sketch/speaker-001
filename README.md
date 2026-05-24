# 🦉 KidsTalk — 少儿英语口语学习小程序

基于 **DeepSeek V4** 大模型的少儿英语口语练习微信小程序。AI 对话伙伴可以根据孩子的年龄自动匹配难度，支持自定义身份和语气风格，主动提出话题引导对话。

---

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🎯 **年龄适配** | 3-12岁分4个难度等级(Lv.1~Lv.4)，自动匹配词汇量和句型复杂度 |
| 👤 **角色扮演** | 3种AI对话伙伴：英语老师/同龄伙伴/卡通角色 |
| 🎭 **语气风格** | 4种风格：温暖亲切/幽默风趣/严谨认真/温柔耐心 |
| 💡 **话题推荐** | AI 主动推荐适合的对话话题，引导孩子开口 |
| 🎤 **语音输入** | 支持按住说话（需配置语音识别服务） |
| 🔊 **语音播放** | AI 回复自动朗读（需配置 TTS 服务） |
| 📝 **文字输入** | 支持打字输入，兼容所有场景 |
| 💾 **历史记录** | 自动保存对话记录到本地 |

---

## 📁 项目结构

```
kids-talk/
├── miniprogram/           # 微信小程序前端
│   ├── app.js             # 应用入口 + 全局状态
│   ├── app.json           # 小程序配置 + TabBar
│   ├── app.wxss           # 全局样式
│   ├── pages/
│   │   ├── index/         # 首页（引导设置 + AI话题推荐）
│   │   ├── chat/          # 对话界面（核心聊天页）
│   │   └── settings/      # 设置页（修改配置）
│   ├── utils/
│   │   ├── api.js         # API 请求封装
│   │   └── voice.js       # 语音功能工具
│   └── images/            # TabBar 图标
├── server/                # Node.js 后端服务
│   ├── index.js           # Express 服务入口
│   ├── config/index.js    # 配置管理
│   ├── services/
│   │   └── deepseek.js    # DeepSeek V4 对话引擎（核心）
│   ├── routes/
│   │   ├── auth.js        # 微信登录
│   │   └── chat.js        # 对话接口
│   ├── middleware/
│   │   └── auth.js        # 认证中间件
│   ├── .env.example       # 环境变量模板
│   └── package.json
└── project.config.json    # 微信开发者工具配置
```

---

## 🚀 快速开始

### 1. 配置后端

```bash
cd server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key
```

`.env` 文件配置：

```env
# 必填：DeepSeek API Key（从 https://platform.deepseek.com/api_keys 获取）
DEEPSEEK_API_KEY=sk-your-api-key-here

# 可选：微信 AppID（用于正式环境登录）
WECHAT_APPID=your-wechat-appid
WECHAT_SECRET=your-wechat-secret
```

### 2. 启动后端

```bash
npm run dev
# 服务启动在 http://localhost:3000
```

### 3. 配置小程序

1. 打开 `project.config.json`，替换 `appid` 为你的微信小程序 AppID
2. 打开 `miniprogram/utils/api.js`，修改 `baseUrl` 为后端地址
3. 微信开发者工具中勾选「不校验合法域名」（开发阶段）

---

## 🔧 难度等级说明

| 等级 | 年龄 | 词汇量 | 句型特点 |
|------|------|--------|----------|
| Lv.1 | 3-5岁 | 基础词汇 | 3-6词短句 |
| Lv.2 | 6-8岁 | 初级词汇 | 5-10词简单句 |
| Lv.3 | 9-10岁 | 中级词汇 | 8-15词复合句 |
| Lv.4 | 11-12岁 | 中高级词汇 | 自由对话 |

---

## 📄 License

MIT
