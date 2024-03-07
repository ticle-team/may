import dotenv from 'dotenv';
import * as fs from "node:fs";

const {parsed: parsedConfig, error} = dotenv.config({
  path: [
    fs.existsSync(`app.env.${process.env.APP_ENV}`) ? `app.env.${process.env.APP_ENV}` : '',
    fs.existsSync('app.env') ? 'app.env' : '',
  ].filter(t => t !== ''),
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
};

export default nextConfig;
