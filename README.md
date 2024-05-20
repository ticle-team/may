# MAY

## Contributing

### Formatting
- Use prettier to format your code
  - e.g. do formatting prettier on save code in webstorm by 'prettier settings'

### Unit Test & Integration Test
1. `yarn local:setup`: Run the test setup script. this script contains `kind` configuration with stoacloud. And, this command setups stoacloud dev and test.
2. `yarn test`: Run all tests
3. `yarn local:teardown`: Remove `kind` cluster. Be careful, this will remove all databases in the cluster.

### Commit
- Use conventional commits for commit messages.
- Before commit your code, run `yarn format` to format your code.
- And, must be passed all tests before pushing your code.

### Database migration
- Use 'src/migrate.ts' to migrate your database schema.
- When you write a new migration file, you should not edit the old migration file which is written by others.