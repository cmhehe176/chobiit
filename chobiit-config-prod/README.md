# chobiit-config

Chobiit 設定画面を扱うプロジェクトです。

Chobiit 設定画面は、kintone プラグインとして提供していることを念頭に置いてください。

## Build

```
$ npm run build:jp:dev
$ npm run build:us:dev

or

$ npm run build:jp:prod
$ npm run build:us:prod
```

## Deploy

- 注意
    - `config.js`を対象の S3 Bucket にアップロードするだけです。プラグインの zip ファイルをアップロードするといった操作はないです。
    - AWS の認証情報が必要です。

```
$ npm run deploy:jp:dev
$ npm run deploy:us:dev

or

$ npm run deploy:jp:prod
$ npm run deploy:us:prod
```

## Packaging

プラグイン zip ファイルを生成します。

```
$ npm run package:jp:dev
$ npm run package:us:dev

or

$ npm run package:jp:prod
$ npm run package:us:prod
```

# Chobiit 環境一覧

## Development

jp版とus版で同じ環境を使用しています。

- [chobiit-config-dev](https://s3.console.aws.amazon.com/s3/buckets/chobiit-config-dev?region=us-east-1&tab=objects)

## Production

- JP: [chobiit-config-prod](https://s3.console.aws.amazon.com/s3/buckets/chobiit-config-prod?region=us-east-1&tab=objects)
- US: [chobiit-config-us](https://s3.console.aws.amazon.com/s3/buckets/chobiit-config-us?region=us-east-1&tab=objects)