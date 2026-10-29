#!/usr/bin/env bash
set -e

# Use the committed lockfile; dependency upgrades are an explicit maintenance task.
export BUNDLE_FROZEN=true
bundle check || bundle install
node scripts/generation/generate-data.js

if [[ $1 = "docker" ]]; then
    docker-compose up
elif [[ $1 = "watch" ]]; then
    bundle exec jekyll server --watch
elif [[ $1 = "inc" ]]; then
    bundle exec jekyll server --incremental --trace
fi
