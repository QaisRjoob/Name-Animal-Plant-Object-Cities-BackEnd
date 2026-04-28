const requiredInAllEnvs = ['JWT_SECRET'];
const requiredInProduction = ['MONGODB_URI', 'CLIENT_URL'];

const validateEnv = () => {
  const required = new Set(requiredInAllEnvs);
  if (process.env.NODE_ENV === 'production') {
    for (const key of requiredInProduction) required.add(key);
  }

  const missing = Array.from(required).filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = { validateEnv };
