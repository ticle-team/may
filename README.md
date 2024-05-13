# MAY

## Contributing

### Formatting
- Use prettier to format your code
  - e.g. do formatting prettier on save code in webstorm by 'prettier settings'

### Unit Test & Integration Test
1. `yarn test:setup`: Run the test setup script. this script contains `kind` configuration with stoacloud
2. `yarn test`: Run all tests
3. `yarn test:teardown`: Remove `kind` cluster. Be careful, this will remove all databases in the cluster.

### Commit
- Use conventional commits for commit messages.
- Before commit your code, run `yarn format` to format your code.
- And, must be passed all tests before pushing your code.