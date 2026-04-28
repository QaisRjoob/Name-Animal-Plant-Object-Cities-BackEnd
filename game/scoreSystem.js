const { CATEGORIES, validateAnswer, detectDuplicates, isDuplicate } = require('./validator');

const POINTS = {
  VALID_UNIQUE: 10,
  VALID_DUPLICATE: 5,
  EMPTY_OR_INVALID: 0,
  VOTE_INCORRECT_PENALTY: -10,
};

/**
 * Calculate scores for all players in a round.
 * Returns array of { playerId, scores: { name, plant, animal, object, cities }, total, pointsDelta }
 */
const calculateRoundScores = (players, currentLetter) => {
  // Build input for duplicate detection
  const allPlayerAnswers = players.map((p) => ({
    playerId: p.id,
    answers: p.answers || {},
  }));

  const duplicateMap = detectDuplicates(allPlayerAnswers);

  const results = players.map((player) => {
    const answers = player.answers || {};
    const catScores = {};
    let roundTotal = 0;

    for (const cat of CATEGORIES) {
      const answer = answers[cat] || '';
      const isValid = validateAnswer(answer, currentLetter);

      if (!isValid) {
        catScores[cat] = { answer, points: POINTS.EMPTY_OR_INVALID, valid: false, duplicate: false };
      } else if (isDuplicate(player.id, cat, answer, duplicateMap)) {
        catScores[cat] = { answer, points: POINTS.VALID_DUPLICATE, valid: true, duplicate: true };
      } else {
        catScores[cat] = { answer, points: POINTS.VALID_UNIQUE, valid: true, duplicate: false };
      }

      roundTotal += catScores[cat].points;
    }

    return {
      playerId: player.id,
      username: player.username,
      catScores,
      pointsDelta: roundTotal,
    };
  });

  return { results, duplicateMap };
};

/**
 * Apply round scores to player objects (mutates in-place)
 */
const applyRoundScores = (players, scoreResults) => {
  for (const result of scoreResults) {
    const player = players.find((p) => p.id === result.playerId);
    if (player) {
      player.score = (player.score || 0) + result.pointsDelta;
    }
  }
};

/**
 * Apply voting result to scores.
 * outcome: 'incorrect' | 'duplicate' | 'valid' | 'no_change'
 * duplicateOriginalId: player ID voted as the original owner (duplicate outcome only)
 */
const applyVotingResult = (players, votingData, outcome, duplicateOriginalId) => {
  const { targetPlayerId } = votingData;

  if (outcome === 'incorrect') {
    const target = players.find((p) => p.id === targetPlayerId);
    if (target) target.score = Math.max(0, (target.score || 0) + POINTS.VOTE_INCORRECT_PENALTY);
    return { adjustment: POINTS.VOTE_INCORRECT_PENALTY, targetPlayerId };
  }

  if (outcome === 'duplicate') {
    // Tie in who the original is — no points change
    if (!duplicateOriginalId) return {};

    const originalPlayer = players.find((p) => p.id === duplicateOriginalId);
    const targetPlayer   = players.find((p) => p.id === targetPlayerId);

    // +5 to the original owner (only if they are a different player)
    if (originalPlayer && originalPlayer.id !== targetPlayerId) {
      originalPlayer.score = (originalPlayer.score || 0) + 5;
    }
    // +5 to the target (whose answer was voted duplicate)
    if (targetPlayer) {
      targetPlayer.score = (targetPlayer.score || 0) + 5;
    }

    return {
      adjustment: 5,
      affectedIds: [duplicateOriginalId, targetPlayerId].filter(Boolean),
    };
  }

  return {};
};

/**
 * Get final leaderboard sorted by score
 */
const getFinalLeaderboard = (players) => {
  return [...players]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((p, i) => ({ rank: i + 1, playerId: p.id, username: p.username, score: p.score || 0 }));
};

module.exports = {
  POINTS,
  calculateRoundScores,
  applyRoundScores,
  applyVotingResult,
  getFinalLeaderboard,
};
