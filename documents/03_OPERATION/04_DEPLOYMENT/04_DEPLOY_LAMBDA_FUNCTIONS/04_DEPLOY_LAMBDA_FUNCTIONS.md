このドキュメントでは、chobiit-backend のデプロイについてまとめます。

# 前提知識

- chobiit ではバックエンドの Web API を API Gateway + Lambda Function (+ DynamoDB) というよくあるサーバーレスの構成をとっています。
- 従って、このドキュメントでの『デプロイ』とは、Lambda Function のコードの更新を指します。


# Lambda Function のデプロイ方法

最新の[chobiit-prod/chobiit-backend/README.md](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-backend/README.md)を参照してください。

## 手順概要

1. ソースコードをビルドする。
2. Lambda関数に反映する。


## 手順詳細

### 1. ソースコードをビルドする。

最新の[chobiit-prod/chobiit-backend/README.md](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-backend/README.md)を参照してください。

`npm run build:prod chobiitAddRecord`とか打てばできます。`chobiitAddRecord`の部分は、ビルドしたい関数の名前にしてくださいね、一応。


補足：chobiit-client, chobiit-config では、ビルド時に jp/us を指定しています。環境変数を入れ込む必要があるからです。Lambda function については、環境変数を Lambda function 自体に設定する機能があるため、ビルド後のコードに環境変数を入れ込むといった処理はしていません。


### 2. Lambda関数に反映する。

最新の[chobiit-prod/chobiit-backend/README.md](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-backend/README.md)を参照してください。

`npm run deploy:prod chobiitAddRecord`とか打てばできます。`chobiitAddRecord`の部分は、デプロイしたい関数の名前にしてくださいね、一応。

注意：deploy コマンドは AWS CLI の認証設定をしておく必要があります。[AWSのドキュメント](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html)を参考に各自設定をしてください。


## その他：共通の環境変数を設定する

デプロイ前に、全ての Lambda 関数に対して共通で設定する環境変数が適切に設定されているかをデプロイスクリプトの処理の中で検証しています（詳細：[chobiit-prod/chobiit-backend/scripts/deploy.ts](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-backend/scripts/deploy.ts)）

まだ設定ができていないものについては、README にある通りコマンドを実行してください。

`npm run set-common-envs:jp:prod chobiitAddRecord`とか打てばできます。`chobiitAddRecord`の部分は、環境変数を設定したい関数の名前にしてくださいね、一応。

