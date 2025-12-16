# Fargate 実行方法

1. [Task Definition のページ](https://us-west-1.console.aws.amazon.com/ecs/v2/task-definitions/chobiitInvalidating-task?status=ACTIVE&region=us-west-1)を開き、最新の task definition を選択します。
2. 「デプロイ > タスクの実行」をクリックします。
3. 以下の実行環境を選択します。

- 起動タイプ : FARGATE  
- クラスター : chobiit-prod-invalidating

## Tips: ログの確認

- 実行中のタスクを選択すると、実行ログを確認することができます。


# Fargate へのデプロイ手順

もし必要あれば、ソースコードを更新したのち、Fargate にデプロイして実行したい場合があると思います。
その手順をまとめます。

## 1. ソースコードを編集する

`release/chobiitInvalidating/index.js`が実行されるファイルになります。

こちらを修正してください。

## 2. Docker イメージをビルドする

```terminal
$ cd release/chobiitInvalidating/
$ ./build-docker-image.sh
```


## 3. ECR にプッシュする

[chobiit-prod](https://us-west-1.console.aws.amazon.com/ecr/repositories/private/831344450728/chobiit-prod?region=us-west-1)という ECR Repository にイメージをプッシュします。


```terminal
$ cd release/chobiitInvalidating/
$ ./push-docker-image.sh
```

- 参照：https://docs.aws.amazon.com/AmazonECR/latest/userguide/getting-started-cli.html
- 注意
    - AWS 認証情報が必要です。[こちら](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html)を参考に適宜付与してください。`AWS_PROFILE=YOUR_PROFILE_NAME ./push-docker-image.sh`とかできます。
    - Docker image の名前、タグは固定にしています。必要あれば更新するなどの管理をしてください。ただしその場合、ECS Fargate Task Defintion で実行対象のイメージの設定変更も必要になります。