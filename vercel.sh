#!/bin/bash

if [[ $VERCEL_GIT_COMMIT_REF == "main" ]]; then
  echo "Deploying on 'main' branch"
  cp .env.example .env
  pnpm test
  pnpm build
else
  echo "Invalid branch. Cancelling build."
  exit 0
fi
