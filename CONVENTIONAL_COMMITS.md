# Conventional Commits for HC-Lisp

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to standardize commit messages and automate versioning.

## How to make commits

Use manual commits following the standard format:

```bash
git commit -m "type: brief description"
```

### Commit types:

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Changes that do not affect the code's meaning (spaces, formatting, etc.)
- **refactor**: Code change that does not fix a bug nor add functionality
- **perf**: Code change that improves performance
- **test**: Addition or correction of tests
- **chore**: Changes to build tools, configurations, etc.

### Automatic versioning:

- `feat`: Increments **minor** version (1.0.0 → 1.1.0)
- `fix`: Increments **patch** version (1.0.0 → 1.0.1)
- `feat!` or `BREAKING CHANGE`: Increments **major** version (1.0.0 → 2.0.0)

## Release Workflow

1. Make commits following the conventional format
2. Merge to the `master` branch
3. GitHub Actions automatically:
   - Analyzes commits
   - Determines the new version
   - Generates changelog
   - Creates release on GitHub
   - Publishes to npm

No manual intervention is required for versioning or publishing!
