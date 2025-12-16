#!/usr/bin/env bash

set -e
cd "$(dirname "$0")"

echo "Docker Image をビルドします・・・"
docker build --tag "831344450728.dkr.ecr.us-west-1.amazonaws.com/chobiit-prod:1.0.0" .
echo "Docker Image をビルドしました！"

exit 0