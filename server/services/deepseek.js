const axios = require('axios');
const config = require('../config/index');

const deepseekClient = axios.create({
  baseURL: config.deepseek.baseUrl,
  headers: { 'Authorization': `Bearer ${config.deepseek.apiKey}`, 'Content-Type': 'application/json' },
  timeout: 60000,
});

function getDifficultyLevel(age) { if (age <= 5) return 1; if (age <= 8) return 2; if (age <= 10) return 3; return 4; }

function getDifficultyConfig(age) {
  const level = getDifficultyLevel(age);
  return config.difficulty[level] || config.difficulty[2];
}

function buildSystemPrompt(ctx) {
  const { age = 6, identity = 'teacher', tone = 'warm' } = ctx;
  const identityPrompts = {
    teacher: `You are a patient and encouraging English teacher for a ${age}-year-old child. Your name is Ms. Owl. You gently correct mistakes and always praise effort.`,
    friend: `You are a friendly ${age}-year-old kid named Kitty who loves chatting. You speak like a real child friend — casual, fun, and supportive.`,
    cartoon: `You are Foxy, a cute and funny cartoon fox character. You love to play pretend, tell jokes, and make English learning feel like an adventure!`
  };
  const tonePrompts = {
    warm: `Be warm and encouraging. Always start with praise. Use lots of "Great job!", "Wonderful!", "You're doing amazing!" Make the child feel safe and confident.`,
    funny: `Be humorous and playful. Use funny voices, make silly jokes, and laugh together. Learning should feel like playtime. Use emojis and sound effects (woohoo! hehe!).`,
    strict: `Be clear and precise. Gently but firmly correct grammar and pronunciation. Focus on accuracy while still being kind. Say things like "Good try! Let's say it this way..."`,
    gentle: `Be extremely patient and soft. Go very slowly. Give lots of time. Perfect for shy beginners. Never rush. Say things like "Take your time, sweetie. No rush at all."`
  };
  const difficultyPrompts = {
    1: `Use VERY simple words only (3-5 letters). Sentences should be 3-6 words max. Speak slowly. Ask yes/no questions mostly. Use lots of praise. Examples: "What color?" "Do you like dogs?" Accept Chinese mixed with English — gently guide to English.`,
    2: `Use simple, everyday vocabulary. Sentences 5-10 words. Ask simple wh-questions. Encourage complete sentence answers. Examples: "What do you like to eat?" If they use Chinese, kindly ask "Can you try in English?"`,
    3: `Use intermediate vocabulary. Sentences can be 8-15 words. Ask open-ended questions. Introduce new words naturally. Gently correct grammar. Encourage longer responses.`,
    4: `Use upper-intermediate vocabulary. Natural conversation flow. Discuss opinions, dreams, and ideas. Correct grammar when needed. Challenge them with follow-up questions.`
  };
  const identityPrompt = identityPrompts[identity] || identityPrompts.teacher;
  const tonePrompt = tonePrompts[tone] || tonePrompts.warm;
  const diffPrompt = difficultyPrompts[getDifficultyLevel(age)] || difficultyPrompts[2];
  return `${identityPrompt}\n\n${tonePrompt}\n\n${diffPrompt}\n\nIMPORTANT RULES:\n1. The child is ${age} years old. Match your language difficulty accordingly.\n2. When the child makes a mistake, gently correct it with encouragement.\n3. After 3-4 exchanges, naturally suggest a new topic.\n4. If the child seems stuck, offer hints or switch to a simpler question.\n5. Mix English with occasional Chinese clarification if needed.\n6. Always end your response with a question to keep the conversation going.\n7. Keep your response to 2-4 sentences.\n8. Be positive and NEVER criticize or show frustration.`;
}

async function chat(message, context = {}) {
  const { age = 6, identity = 'teacher', tone = 'warm', history = [] } = context;
  const systemPrompt = buildSystemPrompt({ age, identity, tone });
  const messages = [{ role: 'system', content: systemPrompt }, ...history.slice(-config.session.maxHistoryLength), { role: 'user', content: message }];
  try {
    const response = await deepseekClient.post('/v1/chat/completions', {
      model: config.deepseek.model, messages, max_tokens: config.deepseek.maxTokens, temperature: config.deepseek.temperature, top_p: 0.9
    });
    const reply = response.data.choices[0]?.message?.content || '';
    const followUp = extractFollowUp(reply, age);
    return { reply, followUp };
  } catch (error) {
    console.error('DeepSeek API 错误:', error.response?.data || error.message);
    throw new Error('AI服务暂时不可用，请稍后重试');
  }
}

async function generateTopics(context = {}) {
  const { age = 6 } = context;
  const diff = getDifficultyConfig(age);
  try {
    const response = await deepseekClient.post('/v1/chat/completions', {
      model: config.deepseek.model,
      messages: [{ role: 'system', content: `You are a creative English teacher for a ${age}-year-old Chinese child. Generate 3 fun, age-appropriate conversation topics mixing English and Chinese. Level: ${diff.label}. Return ONLY 3 topics, one per line.` }, { role: 'user', content: 'Give me 3 conversation topics.' }],
      max_tokens: 200, temperature: 0.9
    });
    const content = response.data.choices[0]?.message?.content || '';
    const topics = content.split('\n').map(l => l.trim()).filter(l => l.length > 3).slice(0, 3);
    return topics.length > 0 ? topics : getDefaultTopics(age);
  } catch (error) {
    return getDefaultTopics(age);
  }
}

function getDefaultTopics(age) {
  if (age <= 5) return ['What color do you like? 你喜欢什么颜色？', 'Do you have a pet? 你有宠物吗？', 'What\'s your favorite fruit? 你最喜欢什么水果？'];
  if (age <= 8) return ['What do you like to do after school? 放学后你喜欢做什么？', 'Who is your best friend? 你最好的朋友是谁？', 'What\'s your favorite food? 你最喜欢的食物是什么？'];
  if (age <= 10) return ['If you could have any superpower... 如果你可以有超能力...', 'What\'s the most interesting place you\'ve been?', 'What do you want to be when you grow up?'];
  return ['What makes a good friend? 什么是好朋友？', 'If you could travel anywhere... 如果你可以去任何地方...', 'What\'s something you\'re proud of?'];
}

function extractFollowUp(reply, age) {
  const sentences = reply.split(/[.?!]/).filter(s => s.trim());
  const lastQuestion = sentences.find(s => s.trim().endsWith('?') || /^(what|where|when|why|how|who|do|does|can|could|would|will|is|are)/i.test(s.trim()));
  return lastQuestion ? lastQuestion.trim() : null;
}

async function speechToText(audioBuffer) { throw new Error('Speech-to-text service not configured'); }
async function textToSpeech(text) { throw new Error('Text-to-speech service not configured'); }

module.exports = { chat, generateTopics, speechToText, textToSpeech, getDifficultyLevel, getDifficultyConfig };
