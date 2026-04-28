require('dotenv').config();

const mongoose = require('mongoose');
const WordBank = require('./models/WordBank');
const { staticDataset } = require('./utils/dataset');

const CATEGORY_MAP = {
  names: 'names',
  animals: 'animals',
  plants: 'plants',
  objects: 'objects',
  cities: 'cities',
};

const inferDifficultyFromIndex = (index) => {
  if (index < 3) return 'easy';
  if (index < 6) return 'medium';
  return 'hard';
};

const buildSeedRows = (language = 'english') => {
  const rows = [];

  for (const [runtimeCategory, lettersMap] of Object.entries(staticDataset)) {
    const category = CATEGORY_MAP[runtimeCategory];
    if (!category) continue;

    for (const [letter, words] of Object.entries(lettersMap)) {
      for (let i = 0; i < words.length; i++) {
        rows.push({
          word: words[i],
          category,
          letter,
          language,
          difficulty: inferDifficultyFromIndex(i),
        });
      }
    }
  }

  return rows;
};

const seedWords = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to run seedWords.js');
  }

  const language = String(process.env.WORDS_LANGUAGE || 'english').trim().toLowerCase();
  const rows = buildSeedRows(language);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  });

  const operations = rows.map((row) => ({
    updateOne: {
      filter: {
        category: row.category,
        letter: row.letter,
        word: row.word,
        language: row.language,
      },
      update: {
        $set: {
          difficulty: row.difficulty,
        },
      },
      upsert: true,
    },
  }));

  const result = await WordBank.bulkWrite(operations, { ordered: false });

  console.log('✅ word_bank seeding complete');
  console.log(`   Language: ${language}`);
  console.log(`   Seed rows: ${rows.length}`);
  console.log(`   Inserted: ${result.upsertedCount || 0}`);
  console.log(`   Updated: ${result.modifiedCount || 0}`);
  console.log(`   Matched: ${result.matchedCount || 0}`);
};

seedWords()
  .catch((err) => {
    console.error('❌ word_bank seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
