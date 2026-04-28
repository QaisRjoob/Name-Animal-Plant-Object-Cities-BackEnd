const mongoose = require('mongoose');
const WordBank = require('../models/WordBank');
const { staticDataset, setRuntimeDataset, getDataset } = require('../utils/dataset');

const WORD_SOURCES = {
  STATIC: 'static',
  DATABASE: 'database',
};

const DIFFICULTY_RANK = { easy: 0, medium: 1, hard: 2 };

const DB_TO_RUNTIME_CATEGORY = {
  names: 'names',
  animals: 'animals',
  plants: 'plants',
  objects: 'objects',
  groups: 'objects',
  cities: 'cities',
  cities_countries: 'cities',
};

const RUNTIME_TO_DB_CATEGORY = {
  names: 'names',
  animals: 'animals',
  plants: 'plants',
  objects: 'objects',
  groups: 'groups',
  cities: 'cities',
  cities_countries: 'cities_countries',
};

const RUNTIME_TO_DB_CATEGORY_FALLBACK = {
  objects: ['objects', 'groups'],
  cities: ['cities', 'cities_countries'],
};

const normalizeLetter = (letter) => {
  const value = String(letter || '').trim();
  if (!value) return '';
  return /^[a-z]$/i.test(value) ? value.toUpperCase() : value;
};

const inferDifficultyFromIndex = (index) => {
  if (index < 3) return 'easy';
  if (index < 6) return 'medium';
  return 'hard';
};

let configuredSource = WORD_SOURCES.STATIC;
let effectiveSource = WORD_SOURCES.STATIC;
let activeLanguage = process.env.WORDS_LANGUAGE || 'english';
let lastLoadedAt = null;

const getWordSource = () => {
  const raw = String(process.env.WORDS_SOURCE || WORD_SOURCES.STATIC).toLowerCase().trim();
  return raw === WORD_SOURCES.DATABASE ? WORD_SOURCES.DATABASE : WORD_SOURCES.STATIC;
};

const activateStaticFallback = (message) => {
  setRuntimeDataset(staticDataset);
  effectiveSource = WORD_SOURCES.STATIC;
  lastLoadedAt = new Date().toISOString();
  console.warn(`⚠️ ${message}`);
};

const byDifficultyThenWord = (a, b) => {
  const rankA = DIFFICULTY_RANK[a.difficulty] ?? 99;
  const rankB = DIFFICULTY_RANK[b.difficulty] ?? 99;
  if (rankA !== rankB) return rankA - rankB;
  return String(a.word).localeCompare(String(b.word));
};

const buildRuntimeDatasetFromDocs = (docs) => {
  const grouped = new Map();

  for (const row of docs) {
    const runtimeCategory = DB_TO_RUNTIME_CATEGORY[row.category];
    if (!runtimeCategory) continue;

    const normalizedLetter = normalizeLetter(row.letter);
    if (!normalizedLetter) continue;

    const key = `${runtimeCategory}::${normalizedLetter}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }

  const runtimeDataset = {
    names: {},
    animals: {},
    plants: {},
    objects: {},
    cities: {},
  };

  for (const [key, rows] of grouped.entries()) {
    const [runtimeCategory, normalizedLetter] = key.split('::');
    rows.sort(byDifficultyThenWord);
    runtimeDataset[runtimeCategory][normalizedLetter] = rows.map((row) => row.word);
  }

  return runtimeDataset;
};

const queryWordsFromMongo = async ({ category, letter, language, limit }) => {
  const normalizedCategory = category ? String(category).trim().toLowerCase() : '';
  const normalizedLetter = letter ? normalizeLetter(letter) : '';
  const normalizedLanguage = language ? String(language).trim().toLowerCase() : activeLanguage;
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 5000);

  const query = { language: normalizedLanguage };
  if (normalizedCategory) {
    const dbCategory = RUNTIME_TO_DB_CATEGORY[normalizedCategory] || normalizedCategory;
    const fallbackCategories = RUNTIME_TO_DB_CATEGORY_FALLBACK[normalizedCategory] || [dbCategory];
    query.category = fallbackCategories.length > 1 ? { $in: fallbackCategories } : fallbackCategories[0];
  }
  if (normalizedLetter) query.letter = normalizedLetter;

  return WordBank.find(query)
    .select('category letter word language difficulty -_id')
    .sort({ category: 1, letter: 1, difficulty: 1, word: 1 })
    .limit(safeLimit)
    .lean();
};

const getWordsFromStatic = ({ category, letter, language, limit }) => {
  const currentDataset = getDataset() || staticDataset;
  const normalizedCategory = category ? String(category).trim().toLowerCase() : '';
  const normalizedLetter = letter ? normalizeLetter(letter) : '';
  const normalizedLanguage = language ? String(language).trim().toLowerCase() : activeLanguage;
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 5000);

  const categories = normalizedCategory ? [normalizedCategory] : Object.keys(currentDataset);
  const words = [];

  for (const cat of categories) {
    const lettersMap = currentDataset[cat];
    if (!lettersMap) continue;

    const letters = normalizedLetter ? [normalizedLetter] : Object.keys(lettersMap);
    for (const l of letters) {
      const entries = lettersMap[l] || [];
      for (let i = 0; i < entries.length; i++) {
        words.push({
          category: cat,
          letter: l,
          word: entries[i],
          language: normalizedLanguage,
          difficulty: inferDifficultyFromIndex(i),
        });
      }
    }
  }

  return words.slice(0, safeLimit);
};

const initializeWordDataset = async () => {
  configuredSource = getWordSource();
  activeLanguage = process.env.WORDS_LANGUAGE || 'english';

  if (configuredSource === WORD_SOURCES.STATIC) {
    setRuntimeDataset(staticDataset);
    effectiveSource = WORD_SOURCES.STATIC;
    lastLoadedAt = new Date().toISOString();
    console.log('✅ Word dataset source: static file (utils/dataset.js)');
    return;
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      activateStaticFallback('MongoDB unavailable, using static dataset fallback');
      return;
    }

    const docs = await queryWordsFromMongo({
      language: activeLanguage,
      limit: 100000,
    });

    if (!docs.length) {
      activateStaticFallback('MongoDB empty, using static dataset fallback');
      return;
    }

    setRuntimeDataset(buildRuntimeDatasetFromDocs(docs));
    effectiveSource = WORD_SOURCES.DATABASE;
    lastLoadedAt = new Date().toISOString();
    console.log(`✅ Word dataset source: database (${docs.length} rows, language=${activeLanguage})`);
  } catch (err) {
    console.error('❌ Failed loading word_bank from MongoDB:', err.message);
    activateStaticFallback('MongoDB unavailable, using static dataset fallback');
  }
};

const listWords = async ({ category, letter, language, limit = 1000 }) => {
  if (configuredSource === WORD_SOURCES.DATABASE) {
    try {
      const docs = await queryWordsFromMongo({ category, letter, language, limit });
      if (!docs.length) {
        activateStaticFallback('MongoDB empty, using static dataset fallback');
        return getWordsFromStatic({ category, letter, language, limit });
      }

      effectiveSource = WORD_SOURCES.DATABASE;
      return docs;
    } catch (err) {
      console.error('❌ MongoDB word query failed:', err.message);
      activateStaticFallback('MongoDB unavailable, using static dataset fallback');
      return getWordsFromStatic({ category, letter, language, limit });
    }
  }

  return getWordsFromStatic({ category, letter, language, limit });
};

const getWordDatasetMeta = () => ({
  source: effectiveSource,
  configuredSource,
  language: activeLanguage,
  loadedAt: lastLoadedAt,
});

module.exports = {
  initializeWordDataset,
  listWords,
  getWordDatasetMeta,
};
