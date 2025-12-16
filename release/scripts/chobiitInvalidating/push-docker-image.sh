#!/usr/bin/env bash

set -e
cd "$(dirname "$0")"

read -p "Docker Image をプッシュしますか？ [y/N]: " yn

if [[ $yn = [yY] ]]; then
    echo "Docker Image をプッシュします・・・"
    aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin '831344450728.dkr.ecr.us-west-1.amazonaws.com'
    docker push "831344450728.dkr.ecr.us-west-1.amazonaws.com/chobiit-prod:1.0.0"
    echo "Docker Image をプッシュしました！"
else
    echo "中止しました。"
fi

exit 0