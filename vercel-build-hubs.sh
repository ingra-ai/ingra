#!/bin/bash

if [[ $VERCEL_GIT_COMMIT_REF == "main" ]]; then
  echo "Deploying on 'main' branch"
  cp apps/hubs/.env.example apps/hubs/.env
  pnpm test -F hubs
  pnpm build -F hubs
else
  echo "Invalid branch. Cancelling build."
  exit 0
fi
