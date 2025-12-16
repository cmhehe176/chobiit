# chobiit-backend

Chobiit のバックエンドを扱うプロジェクトです。
Chobiit はほとんどを AWS Lambda で構築しています。

# ディレクトリ構成の注意

- US 版との統合が済んでいない Lambda 関数は、`chobiit-backend/`直下に関数名と同じ名前のディレクトリがあり、その中にコードが置いてあります。
- US 版との統合が済んだものは、`chobiit-backend/src/lambda/`直下にコードを置いています。
- まだ Lambda 関数自体のリファクタリングはしっかりできていないです。今後は適切にモジュール分割を行い、それに応じて`chobiit-backend/src/`配下に適切にディレクトリ・ファイルを作成してください。

# Build

- 注意
    - US 版との統合が完了し、ビルド・デプロイを自動化する準備が整った Lambda 関数は`chobiit-backend/scripts/deploy-automated-lambda-functions.ts`に追記していく必要があります。
    - `chobiit-client`, `chobiit-config`と異なり、backend は環境変数をビルド時に埋め込むことはしていません。なので、日本版とUS版で同じコードを生成します。したがって、`npm run build:jp:dev`といったコマンドではありません。

```
$ npm run build:dev FUNCTION_NAME

or

$ npm run build:prod FUNCTION_NAME
```

# Deploy

- 注意：
    - デプロイ前に、Lambda 関数に適切な環境変数が設定されているかチェックをしています。
    - もしチェックが通らなかった場合は、後述の"Set Common Environment Variables"を参考に環境変数をセットしてください。

```terminal
$ npm run deploy:jp:dev FUNCTION_NAME
$ npm run deploy:us:dev FUNCTION_NAME

or

$ npm run deploy:jp:prod FUNCTION_NAME
$ npm run deploy:us:prod FUNCTION_NAME
```

# Set Common Environment Variables

```terminal
$ npm run set-common-envs:jp:dev FUNCTION_NAME
$ npm run set-common-envs:us:dev FUNCTION_NAME

or

$ npm run set-common-envs:jp:prod FUNCTION_NAME
$ npm run set-common-envs:us:prod FUNCTION_NAME
```