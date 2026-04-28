const ENGLISH_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// Basic Arabic letters set used for gameplay (isolated characters)
const ARABIC_LETTERS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');

/**
 * Resolve a letters array for a named alphabet identifier
 */
const getLettersForAlphabet = (alphabet = 'en') => {
  if (!alphabet) return ENGLISH_LETTERS;
  const key = String(alphabet).trim().toLowerCase();
  if (key === 'ar' || key === 'arabic') return ARABIC_LETTERS;
  return ENGLISH_LETTERS;
};

/**
 * Get a random unused letter
 */
const getRandomUnusedLetter = (usedLetters = [], availableLetters = null) => {
  const letters = Array.isArray(availableLetters) && availableLetters.length ? availableLetters : ENGLISH_LETTERS;
  const pool = letters.filter((l) => !usedLetters.includes(l));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

/**
 * Check if a letter is valid (unused) within an alphabet
 */
const isLetterValid = (letter, usedLetters = [], availableLetters = null) => {
  if (!letter || String(letter).length !== 1) return false;
  const letters = Array.isArray(availableLetters) && availableLetters.length ? availableLetters : ENGLISH_LETTERS;
  // Compare raw characters — do not force ASCII uppercase for non-Latin scripts
  return letters.includes(letter) && !usedLetters.includes(letter);
};

/**
 * Get available letters (not yet used) for provided alphabet
 */
const getAvailableLetters = (usedLetters = [], availableLetters = null) => {
  const letters = Array.isArray(availableLetters) && availableLetters.length ? availableLetters : ENGLISH_LETTERS;
  return letters.filter((l) => !usedLetters.includes(l));
};

/**
 * Get next selector index in circular order, skipping disconnected players
 */
const getNextSelectorIndex = (players, currentSelectorId) => {
  const realPlayers = players.filter((p) => !p.isBot && !p.disconnected);
  if (!realPlayers.length) return null;

  const currentIndex = realPlayers.findIndex((p) => p.id === currentSelectorId);
  const nextIndex = (currentIndex + 1) % realPlayers.length;
  return realPlayers[nextIndex].id;
};

module.exports = {
  ENGLISH_LETTERS,
  ARABIC_LETTERS,
  getLettersForAlphabet,
  getRandomUnusedLetter,
  isLetterValid,
  getAvailableLetters,
  getNextSelectorIndex,
};
