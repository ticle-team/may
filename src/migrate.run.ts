import { migrate } from './migrate';

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
