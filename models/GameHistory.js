const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  name: { type: String, default: '' },
  plant: { type: String, default: '' },
  animal: { type: String, default: '' },
  object: { type: String, default: '' },
  cities: { type: String, default: '' },
  pointsEarned: { type: Number, default: 0 },
  wasDuplicated: { type: Boolean, default: false },
});

const roundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  letter: { type: String, required: true },
  selectorId: { type: String },
  answers: [answerSchema],
  stopInitiatorId: { type: String },
  votingOccurred: { type: Boolean, default: false },
  votingResults: { type: mongoose.Schema.Types.Mixed },
});

const playerResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  username: { type: String, required: true },
  isBot: { type: Boolean, default: false },
  botDifficulty: { type: String, default: null },
  finalScore: { type: Number, default: 0 },
});

const gameHistorySchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    totalRounds: { type: Number, required: true },
    timeLimit: { type: Number, required: true },
    letterMode: { type: String, required: true },
    players: [playerResultSchema],
    rounds: [roundSchema],
    winnerId: { type: String },
    winnerUsername: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes
gameHistorySchema.index({ createdAt: -1 });
gameHistorySchema.index({ 'players.userId': 1 });

module.exports = mongoose.model('GameHistory', gameHistorySchema);
