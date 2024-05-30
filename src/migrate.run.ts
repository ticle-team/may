import { migrate } from './migrate';

migrate({})
  .then(() => {
    console.info('Migration complete');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
