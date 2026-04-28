const mongoose = require('mongoose');

const wordBankSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    letter: { type: String, required: true, trim: true },
    word: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true, default: 'english' },
    difficulty: {
      type: String,
      required: true,
      trim: true,
      enum: ['easy', 'medium', 'hard'],
      default: 'hard',
    },
  },
  {
    collection: 'word_bank',
    timestamps: true,
  }
);

wordBankSchema.index({ language: 1, category: 1, letter: 1, word: 1 }, { unique: true });
wordBankSchema.index({ language: 1, category: 1, letter: 1 });

module.exports = mongoose.model('WordBank', wordBankSchema);
