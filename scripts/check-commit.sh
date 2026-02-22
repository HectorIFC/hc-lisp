#!/bin/bash

# Script to check commit message format
# Usage: ./scripts/check-commit.sh [commit-message]

COMMIT_MSG="$1"

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG=$(git log -1 --pretty=%B)
fi

echo "Checking commit message: $COMMIT_MSG"

# Conventional commits pattern
PATTERN="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}"

if [[ $COMMIT_MSG =~ $PATTERN ]]; then
    echo "✅ Commit message follows conventional commits format"
    exit 0
else
    echo "❌ Commit message must follow conventional commits format"
    echo ""
    echo "Format: <type>[optional scope]: <description>"
    echo ""
    echo "Types:"
    echo "  - feat:     A new feature"
    echo "  - fix:      A bug fix"
    echo "  - docs:     Documentation only changes"
    echo "  - style:    Changes that do not affect the meaning of the code"
    echo "  - refactor: A code change that neither fixes a bug nor adds a feature"
    echo "  - test:     Adding missing tests or correcting existing tests"
    echo "  - chore:    Changes to the build process or auxiliary tools"
    echo "  - perf:     A code change that improves performance"
    echo "  - ci:       Changes to CI configuration files and scripts"
    echo "  - build:    Changes that affect the build system or external dependencies"
    echo "  - revert:   Reverts a previous commit"
    echo ""
    echo "Examples:"
    echo "  - feat: add namespace system for Node.js integration"
    echo "  - fix: resolve import issue in Context.ts"
    echo "  - docs: update README with new testing information"
    echo "  - test: add integration tests for .hclisp files"
    echo "  - refactor: improve error handling in interpreter"
    echo "  - chore: update dependencies to latest versions"
    echo ""
    exit 1
fi
