# Chobiit Client

Chobiit のフロントエンドを扱うプロジェクトです。

## Build

```
$ npm run build:jp:dev
$ npm run build:us:dev

or

$ npm run build:jp:prod
$ npm run build:us:prod
```

- 注意点：
    - `.env.jp.dev`, `.env.jp.prod`など、該当する環境の`.env`ファイルの中を確認すること。
    - US 版と日本版でまだソースコードを統合できていないものがある。詳しくは`chobiit-client-prod/scripts/build.ts`を参照。


## Deploy

```
$ npm run deploy:jp:dev <TARGET_FILE_NAME>
$ npm run deploy:us:dev <TARGET_FILE_NAME>

# TODO: deploy to prod
```

- 注意点：
    - `js`ファイルの拡張子なしのファイル名を指定するようにしてください。
    - 対応する HTML ファイルもデプロイします。
    - 例：
        - `npm run deploy:jp:dev list-record`: `list-record.js`と`list_record.html`をデプロイします。


# Chobiit 環境一覧

## Development
### JP&US
jp版とus版で同じ環境を使用しています。
- Develop（rvmbe3wumbb0）

    kintone : `https://rvmbe3wumbb0.cybozu.com/k/admin/app/108/plugin/`

    S3 : `https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-dev?region=us-east-1&prefix=public/rvmbe3wumbb0/&showversions=false`

## Prod
### JP
- 本番（ノベルワークスxf64eのみ）

    kintone : `https://xf64e.cybozu.com/k/admin/app/605/plugin/`

    S3 : `https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-prod?region=us-east-1&prefix=public/xf64e/&showversions=false`

- 本番

    S3 : `https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-prod?region=us-east-1&prefix=public/chobiit-common/&showversions=false`

### US 
- 本番（ノベルワークスnovelworksのみ）

    kintone : `https://novelworks.kintone.com/k/admin/app/9/plugin/`

    S3 : `https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-us?region=us-east-1&prefix=public/novelworks/&showversions=false`

- 本番

    S3 : `https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-us?prefix=public/chobiit-common/&region=us-east-1`