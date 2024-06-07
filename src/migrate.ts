import pg from 'pg';
import { readdir, readFile } from 'fs/promises';

export async function resetSchema() {
  if (process.env.NODE_ENV == 'production') {
    throw new Error('resetSchema is not allowed in production');
  }
  await dropAllTables();
  await migrate({});
}

export async function migrate({ migrationHome = './prisma/migrations' }) {
  if (migrationHome === '') {
    throw new Error('migrationHome cannot be empty');
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL ?? '',
  });

  try {
    await pool.query('CREATE SCHEMA IF NOT EXISTS may');
    await pool.query(`CREATE TABLE IF NOT EXISTS may.schema_migrations
                      (
                          version BIGINT PRIMARY KEY,
                          name    VARCHAR(128)
                      )`);
    const res = await pool.query<{ version: number }>(`SELECT *
                                                       FROM may.schema_migrations
                                                       ORDER BY version DESC
                                                       LIMIT 1`);
    const lastVersion = res.rows.length > 0 ? res.rows[0].version : 0;
    const migrationDirs = await readdir(migrationHome);
    const migrations = migrationDirs
      .map((migrationDir) => {
        const [version, name] = migrationDir.split('_');
        if (!version || !name) {
          throw new Error(`Invalid migration directory name: ${migrationDir}`);
        }
        return {
          filepath: `./prisma/migrations/${migrationDir}/migration.sql`,
          version: parseInt(version),
          name,
        };
      })
      .filter((migration) => migration.version > (lastVersion ?? 0))
      .sort((a, b) => a.version - b.version);

    for (const { filepath, version, name } of migrations) {
      const client = await pool.connect();

      try {
        const migrationFile = await readFile(filepath, {
          encoding: 'utf-8',
        });
        await client.query('BEGIN');
        await client.query(migrationFile);
        await client.query(
          `INSERT INTO may.schema_migrations (version, name)
           VALUES ($1, $2)`,
          [version, name],
        );
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

export async function dropAllTables() {
  if (process.env.NODE_ENV == 'production') {
    throw new Error('dropAllTables is not allowed in production');
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL ?? '',
  });

  try {
    await pool.query('DROP SCHEMA IF EXISTS may CASCADE');
    await pool.query('CREATE SCHEMA IF NOT EXISTS may');
  } finally {
    await pool.end();
  }
}
