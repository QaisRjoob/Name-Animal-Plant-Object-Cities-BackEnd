const CATEGORIES = ['name', 'plant', 'animal', 'object', 'cities'];

/**
 * Validate a single answer against the current letter
 */
const validateAnswer = (answer, letter) => {
  if (!answer || typeof answer !== 'string') return false;
  const trimmed = answer.trim();
  if (!trimmed) return false;
  return trimmed[0].toUpperCase() === letter.toUpperCase();
};

/**
 * Validate all answers for a player
 * Returns { name: bool, plant: bool, animal: bool, object: bool, cities: bool }
 */
const validatePlayerAnswers = (answers, letter) => {
  const result = {};
  for (const cat of CATEGORIES) {
    result[cat] = validateAnswer(answers[cat], letter);
  }
  return result;
};

/**
 * Detect duplicates across all players for each category.
 * Returns a map: { category: { normalizedAnswer: [playerId, ...] } }
 */
const detectDuplicates = (allPlayerAnswers) => {
  // allPlayerAnswers: [{ playerId, answers: { name, plant, animal, object, cities } }]
  const duplicateMap = {};

  for (const cat of CATEGORIES) {
    duplicateMap[cat] = {};
    for (const { playerId, answers } of allPlayerAnswers) {
      const raw = answers[cat];
      if (!raw || !raw.trim()) continue;
      const key = raw.trim().toLowerCase();
      if (!duplicateMap[cat][key]) duplicateMap[cat][key] = [];
      duplicateMap[cat][key].push(playerId);
    }
    // Only keep entries where more than 1 player gave the same answer
    for (const key of Object.keys(duplicateMap[cat])) {
      if (duplicateMap[cat][key].length < 2) delete duplicateMap[cat][key];
    }
  }

  return duplicateMap;
};

/**
 * Check if an answer is a duplicate given the duplicate map
 */
const isDuplicate = (playerId, category, answer, duplicateMap) => {
  if (!answer || !answer.trim()) return false;
  const key = answer.trim().toLowerCase();
  const ids = duplicateMap[category]?.[key];
  return ids && ids.length > 1 && ids.includes(playerId);
};

module.exports = {
  CATEGORIES,
  validateAnswer,
  validatePlayerAnswers,
  detectDuplicates,
  isDuplicate,
};
