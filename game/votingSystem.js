const VOTING_DURATION_MS = 15000;

/**
 * Create a new voting session
 */
const createVotingSession = (answerDetails, initiatorId) => ({
  initiatorId,
  targetPlayerId: answerDetails.targetPlayerId,
  category: answerDetails.category,
  answer: answerDetails.answer,
  votes: {},               // { voterId: 'correct' | 'incorrect' | 'duplicate' }
  duplicateTargetVotes: {}, // { voterId: playerId } — who each voter picks as the original
  startedAt: Date.now(),
  finished: false,
  outcome: null,
});

/**
 * Record a vote.
 * duplicateTargetId — the player ID the voter selected as the original owner (duplicate votes only).
 */
const recordVote = (session, voterId, voteChoice, duplicateTargetId) => {
  if (session.finished) return session;
  const validChoices = ['correct', 'incorrect', 'duplicate'];
  if (!validChoices.includes(voteChoice)) return session;
  session.votes[voterId] = voteChoice;
  if (voteChoice === 'duplicate' && duplicateTargetId) {
    session.duplicateTargetVotes[voterId] = duplicateTargetId;
  }
  return session;
};

/**
 * Tally votes using only eligible voter IDs (real players excluding the answer owner).
 * Returns the updated session when finished, or null if still waiting.
 */
const tallyVotes = (session, eligibleVoterIds) => {
  if (!eligibleVoterIds || eligibleVoterIds.length === 0) {
    session.outcome = 'no_change';
    session.finished = true;
    return session;
  }

  const totalEligible = eligibleVoterIds.length;
  const eligibleVoteEntries = Object.entries(session.votes)
    .filter(([id]) => eligibleVoterIds.includes(id));
  const totalVoted = eligibleVoteEntries.length;
  const eligibleVotes = eligibleVoteEntries.map(([, choice]) => choice);

  const counts = { correct: 0, incorrect: 0, duplicate: 0 };
  for (const v of eligibleVotes) counts[v] = (counts[v] || 0) + 1;

  const majority = Math.floor(totalEligible / 2) + 1;

  if (counts.incorrect >= majority) { session.outcome = 'incorrect';  session.finished = true; return session; }
  if (counts.duplicate >= majority) { session.outcome = 'duplicate';  session.finished = true; return session; }
  if (counts.correct  >= majority) { session.outcome = 'valid';       session.finished = true; return session; }
  if (totalVoted >= totalEligible) { session.outcome = 'no_change';   session.finished = true; return session; }

  return null; // still waiting
};

/**
 * Determine which player was most-voted as the original owner in a duplicate vote.
 * Returns their player ID, or null if there is a tie.
 */
const tallyDuplicateTarget = (session) => {
  const votes = Object.values(session.duplicateTargetVotes);
  if (!votes.length) return null;

  const counts = {};
  for (const id of votes) counts[id] = (counts[id] || 0) + 1;

  const maxCount = Math.max(...Object.values(counts));
  const winners = Object.keys(counts).filter((id) => counts[id] === maxCount);

  return winners.length === 1 ? winners[0] : null; // null = tie
};

/**
 * Check if voting timer has expired
 */
const isVotingExpired = (session) => {
  return Date.now() - session.startedAt >= VOTING_DURATION_MS;
};

module.exports = {
  VOTING_DURATION_MS,
  createVotingSession,
  recordVote,
  tallyVotes,
  tallyDuplicateTarget,
  isVotingExpired,
};
