const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');
const isProduction = process.env.NODE_ENV === 'production';

const isLocalDevOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    const isHttp = parsed.protocol === 'http:';
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    return isHttp && isLocalHost;
  } catch {
    return false;
  }
};

const getConfiguredClientOrigins = () => {
  const raw = normalizeOrigin(process.env.CLIENT_URL || '');
  return raw ? [raw] : [];
};

const getAllowedOrigins = () => {
  const configured = getConfiguredClientOrigins();

  if (isProduction) {
    return [...new Set(configured)];
  }

  return [...new Set(['http://localhost:*', 'http://127.0.0.1:*', ...configured])];
};

const createCorsOriginChecker = () => {
  const allowedOrigins = getAllowedOrigins();

  return (origin, cb) => {
    if (!origin) return cb(null, true);
    const normalized = normalizeOrigin(origin);
    if (isProduction) {
      if (allowedOrigins.includes(normalized)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    }

    if (isLocalDevOrigin(normalized) || allowedOrigins.includes(normalized)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  };
};

module.exports = {
  getAllowedOrigins,
  createCorsOriginChecker,
};
