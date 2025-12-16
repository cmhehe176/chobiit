このドキュメントでは、chobiit-config のデプロイについてまとめます。

# 前提知識

- chobiit の設定画面を実装しているパッケージが`chobiit-config`です。
- chobiit の設定画面は、kintone プラグイン設定画面として提供しています。（kintone プラグインの作り方は既知とします）
- 主に実装を触る・デプロイすることが多いのは、プラグイン設定画面の javascript [config.js](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-config-prod/js/config.js) かと思います。[chobiit-config-prod/manifest.jp.prod.json](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-config-prod/manifest.jp.prod.json)や[chobiit-config-prod/manifest.us.prod.json](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-config-prod/manifest.us.prod.json)に記載している通り、S3 にアップロードしています。


---


- 基本的に以下では、[config.js](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-config-prod/js/config.js)のデプロイ方法について説明します。その他の点については最後の方でコメントします。


# `config.js`のデプロイ方法

## 手順概要

1. ソースコードをビルドする。
2. S3 にアップロードする。


## 手順詳細

### 1. ソースコードをビルドする。
最新の[chobiit-prod/chobiit-config-prod/README.md](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-config-prod/README.md)を参照してください。

`npm run build:jp:prod`とか打てばできます。

### 2. S3 にアップロードする。

最新の[chobiit-prod/chobiit-config-prod/README.md](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-config-prod/README.md)を参照してください。

`npm run deploy:jp:prod`とか打てばできます。

注意：README にも書いていますが、deploy コマンドは AWS CLI の認証設定をしておく必要があります。[AWSのドキュメント](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html)を参考に各自設定をしてください。

それぞれ以下の S3 Bucket にアップロードされます：

- 開発環境：[chobiit-config-dev](https://s3.console.aws.amazon.com/s3/buckets/chobiit-config-dev?region=us-east-1&tab=objects)
- 日本版本番環境：[chobiit-config-prod](https://s3.console.aws.amazon.com/s3/buckets/chobiit-config-prod?region=us-east-1&tab=objects)
- US版本番環境：[chobiit-config-us](https://s3.console.aws.amazon.com/s3/buckets/chobiit-config-us?region=us-east-1&tab=objects)

`config.js`というファイルがアップロードされていることを確認してください。


# その他：プラグイン zip ファイルの生成手順

あまり頻度は多くないかもしれないですが、プラグイン zip ファイルを新しく公開する必要があるかもしれません。
あるいは、公開はしなくても、後述する「Novelworks 所有の kintone/chobiit にだけ`config.js`をデプロイしたい場合」でプラグイン zip ファイルを生成する必要があります。

chobiit のプラグイン zip ファイルを生成する手順は、最新の[chobiit-prod/chobiit-config-prod/README.md](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-config-prod/README.md)を参照してください。

`npm run package:jp:prod`とか打てばできます。

# Tips: Novelworks 所有の kintone/chobiit にだけ`config.js`をデプロイしたい場合

バックエンドは無理ですが、`config.js`ならば、カナリアリリースができます。

## 手順概要

1. デプロイ対象の manifest.json ファイルを編集し、ローカルのビルドした`config.js`を参照するようにパスを編集する。
2. プラグイン zip を生成し、kintone にアップロードする。

## 手順詳細

### 1. デプロイ対象の manifest.json ファイルを編集し、ローカルのビルドした`config.js`を参照するようにパスを編集する。

例えば、[chobiit-prod/chobiit-config-prod/manifest.jp.prod.json](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-config-prod/manifest.jp.prod.json)では、`$.config.js[]`で以下のようにS3のファイルを参照している：

```
      "https://chobiit-config-prod.s3.amazonaws.com/config.js"
```

こちらを、以下のように修正する。

```
      "build/ja/prod/config.js"
```

これで、ビルドして生成されたファイルを参照することになる。


### 2. プラグイン zip を生成し、kintone にアップロードする。

こちらは特に特殊な手順はなし。
chobiit のプラグイン zip ファイルを生成する手順は、最新の[chobiit-prod/chobiit-config-prod/README.md](https://github.com/NovelWorksInc/chobiit-prod/blob/master/chobiit-config-prod/README.md)を参照してください。
















