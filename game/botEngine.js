const { getBotWord, getBotArabicWord } = require('../utils/dataset');
const { CATEGORIES } = require('./validator');

const DIFFICULTY_DELAYS = {
  easy: { min: 3000, max: 5000 },
  medium: { min: 1000, max: 3000 },
  hard: { min: 500, max: 1500 },
};

let botCounter = 0;

/**
 * Create a bot player object
 */
const createBot = (difficulty = 'medium') => {
  botCounter++;
  return {
    id: `bot_${botCounter}_${Date.now()}`,
    username: generateBotName(difficulty),
    isBot: true,
    difficulty,
    score: 0,
    answers: {},
    disconnected: false,
    ready: false,
  };
};

const BOT_NAME_PREFIXES = {
  easy: ['Newbie', 'Rookie', 'Junior', 'Cadet'],
  medium: ['Player', 'Rival', 'Contender', 'Challenger'],
  hard: ['Master', 'Pro', 'Expert', 'Ace'],
};

const generateBotName = (difficulty) => {
  const prefixes = BOT_NAME_PREFIXES[difficulty] || BOT_NAME_PREFIXES.medium;
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}${num}`;
};

const randomDelay = (difficulty) => {
  const { min, max } = DIFFICULTY_DELAYS[difficulty] || DIFFICULTY_DELAYS.medium;
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Generate a single answer for a bot based on alphabet.
 */
const getBotAnswer = (category, letter, alphabet, difficulty, usedWords) => {
  if (alphabet === 'ar') {
    const word = getBotArabicWord(category, letter, difficulty, usedWords);
    console.log(`[getBotAnswer] Arabic | Category: "${category}" | Letter: "${letter}" | Word: "${word || '(empty)'}" | Difficulty: ${difficulty}`);
    return word || ''; // No placeholder fallback - return empty string
  } else {
    const word = getBotWord(category, letter, difficulty, usedWords, 'en');
    return word || '';
  }
};

/**
 * Schedule bot answers for a round.
 * Calls onAnswerReady(botId, answers) when the bot has "thought" of its answers.
 * Calls onTypingUpdate(botId, partialAnswers) to simulate typing indicators.
 */
const scheduleBotAnswers = (bot, currentLetter, io, roomId, alphabet, roundOrOnAnswerReady, maybeOnAnswerReady) => {
  const round = typeof roundOrOnAnswerReady === 'number' ? roundOrOnAnswerReady : null;
  const onAnswerReady = typeof roundOrOnAnswerReady === 'function' ? roundOrOnAnswerReady : maybeOnAnswerReady;
  const delay = randomDelay(bot.difficulty);
  const usedWords = [];

  const answers = {};

  console.log(`[scheduleBotAnswers] Starting | Room: ${roomId} | Round: ${round ?? '?'} | Bot: ${bot.id} | Difficulty: ${bot.difficulty} | Letter: "${currentLetter}" | Alphabet: ${alphabet}`);

  // Generate answers for all categories
  for (const cat of CATEGORIES) {
    const word = getBotAnswer(cat, currentLetter, alphabet, bot.difficulty, usedWords);
    if (word && word !== currentLetter && word.length > 0) usedWords.push(word.toLowerCase());
    answers[cat] = word;
    console.log(`[scheduleBotAnswers] ✓ ${cat}: "${word || '(empty)'}"`);
  }

  const finalAnswers = { ...answers };
  console.log(`[scheduleBotAnswers] Answers ready: ${JSON.stringify(finalAnswers)} | Delay: ${delay}ms`);

  // Simulate typing update halfway through
  const typingDelay = Math.floor(delay * 0.5);
  const typingTimer = setTimeout(() => {
    const partialAnswers = {};
    for (const cat of CATEGORIES) {
      const full = finalAnswers[cat] || '';
      partialAnswers[cat] = full.slice(0, Math.ceil(full.length / 2));
    }
    io.to(roomId).emit('update-inputs', { userId: bot.id, answers: partialAnswers });
  }, typingDelay);

  const answerTimer = setTimeout(() => {
    io.to(roomId).emit('update-inputs', { userId: bot.id, answers: finalAnswers });
    onAnswerReady(bot.id, finalAnswers);
  }, delay);

  return { typingTimer, answerTimer };
};

/**
 * Cancel all bot timers (e.g., when round ends early)
 */
const cancelBotTimers = (timers = []) => {
  for (const { typingTimer, answerTimer } of timers) {
    if (typingTimer) clearTimeout(typingTimer);
    if (answerTimer) clearTimeout(answerTimer);
  }
};

module.exports = {
  createBot,
  scheduleBotAnswers,
  cancelBotTimers,
};