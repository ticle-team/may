import pg from 'pg';
import { readdir, readFile } from 'fs/promises';
import { loadEnvConfig } from '@next/env';

export async function migrate() {
  const appEnv = {
    ...process.env,
    ...loadEnvConfig(process.cwd(), true).combinedEnv,
  };
  const pool = new pg.Pool({
    connectionString: appEnv.DATABASE_URL ?? '',
  });
  try {
    const migrationDirs = await readdir('./prisma/migrations');
    for (const migrationDir of migrationDirs) {
      const migrationFile = await readFile(
        `./prisma/migrations/${migrationDir}/migration.sql`,
        {
          encoding: 'utf-8',
        },
      );

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(migrationFile);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }
  } finally {
    await pool.end();
  }
}
