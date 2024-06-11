export async function register() {
  await runMigrate();
}

async function runMigrate() {
  if (process.env.RUN_MIGRATION !== 'true') {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { migrate } = await import('./migrate');
    await migrate({});
    console.log('Migration complete');
  }
}
