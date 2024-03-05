import dotenv from 'dotenv';

const {parsed: parsedConfig, error} = dotenv.config({
  path: [
    `app.env.${process.env.APP_ENV}`,
    'app.env',
  ],
  override: false,
});

if (error) {
  throw error;
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  distDir: `.next.${process.env.APP_ENV}`,
  env: {
    APP_ENV: process.env.APP_ENV,
    ...parsedConfig,
  },
  experimental: {
    cpus: 10,
  }
};

export default nextConfig;
