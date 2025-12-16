# chobiit-client のデプロイについて

## 前提知識

- エンドユーザーが web ブラウザで`https://*****.chobiit.me/`にアクセスする時の画面を chobiit-client で実装しています。
- static な HTML/CSS/Javascript の各種ファイルを S3 に配置し、CloudFront 経由で配信しています。
    - [こちら](https://noveldev.backlog.com/alias/wiki/2805469)も参照。


- S3:
    - 開発用 S3：[chobiit-client-dev](https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-dev?region=us-east-1&tab=objects)
    - 日本版本番用 S3：[chobiit-client-prod](https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-prod?region=us-east-1&tab=objects)
    - US版本番用 S3：[chobiit-client-us](https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-us?region=us-east-1&tab=objects)
- CloudFront:
    - https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-west-1#/distributions
    - Description に書いてある値で区別されます：
        - 開発：`chobiit-dev`
        - 日本版本番：`chobiit-prod`
        - US版本番：`chobiit-us`


- なお、ドメイン（`https://*****.chobiit.me/`の`*****`の部分。誤用。）ごとに、S3 内でディレクトリが分かれています。中のファイルは同じです。
- それらのディレクトリをオリジンとして CloudFront Distribution をドメインと同じ数だけ構築しています。（※改善チケット CHOBIIT-227）


- CloudFront で配信をしている都合上、エッジサーバーのキャッシュを削除する手順を実施することがある。詳細は後述する。


## 手順概要

上記の構成を念頭に置くと、以下の手順であることが予想できる：

1. ソースコードをビルドする。
2. S3 にアップロードする。（各ドメインのディレクトリにコピーする操作も必要）
3. CloudFront Distribution のキャッシュを無効化する。


以下、詳細に見ていく。


## 手順詳細

### 1. ソースコードをビルドする。

chobiit-client の最新の[README.md](https://github.com/NovelWorksInc/chobiit-prod/blob/develop/chobiit-client-prod/README.md)を参照してください。

`npm run build:jp:prod`とか打ってたら出てくるはずです。


### 2. S3 にアップロードする。（各ドメインのディレクトリにコピーする操作も必要）

- chobiit-client の最新の[README.md](https://github.com/NovelWorksInc/chobiit-prod/blob/develop/chobiit-client-prod/README.md)を参照してください。

- 開発環境は`npm run deploy:jp:dev`などでデプロイできます。詳細はスクリプトを読めば理解できると思いますが、概要を書くと、
    - [開発用 S3](https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-dev?region=us-east-1&tab=objects)の`/public/chobiit-common/`にビルドした JS, HTML ファイルをアップロードする。
    - [chobiitInvalidating](https://us-west-1.console.aws.amazon.com/lambda/home?region=us-west-1#/functions/chobiitInvalidating?tab=code)という Lambda 関数を呼び出す。
        - この関数内でやっていることも、コードを読めば理解できると思いますが、概要を書くと、
        - `/public/chobiit-common/`内にあるコードを、各ドメインのディレクトリにコピーし、
        - CloudFront Distribution のキャッシュ無効化を1つずつ実施していく
        - ということをやっています。


- 本番環境の deploy は、2023/10/5現在、上記の手順を手動で行います。（改善チケット： CHOBIIT-224 ）
- つまり、以下のような手順で行います：
    - アップロードする先の S3 のディレクトリを開きます。開発環境と同様に、`/public/chobiit-common/`になります。
         - 日本版（ノベルのみ適用される）：[chobiit-client-prod/public/xf64e/](https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-prod?region=us-east-1&prefix=public/xf64e/&showversions=false)
        - US 版（ノベルのみ適用される）：[chobiit-client-us/public/novelworks/](https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-us?region=us-east-1&prefix=public/novelworks/&showversions=false)
        - 日本版：[chobiit-client-prod/public/chobiit-common/](https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-prod?region=us-east-1&prefix=public/chobiit-common/&showversions=false)
        - US 版：[chobiit-client-us/public/chobiit-common/](https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-us?region=us-east-1&prefix=public/chobiit-common/&showversions=false)
    - Javascript のファイルは`/public/chobiit-common/js/`にアップロードしてください。HTML は基本的には`/public/chobiit-common/`にアップロードしますが、`p_`が先頭についているファイルは`/public/chobiit-common/public/`にアップロードしてください。きちんとアップロードされたか、ファイルの最終更新日時を確認してみましょう。
    - `/public/chobiit-common/`へのファイルのアップロードが完了したら、`chobiitInvalidating`を実行します。
        - 呼び出す`chobiitInvalidating`は以下です：
            - 日本版本番環境：[chobiitInvalidating ECS Fargate Task Defintion](https://us-west-1.console.aws.amazon.com/ecs/v2/task-definitions/chobiitInvalidating-task?status=ACTIVE&region=us-west-1)
            - US版本番環境：[chobiitInvalidating Lambda function](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/chobiitInvalidating?tab=code)
        - 呼び出し方は以下で詳細に書いているので参照してください。


※日本版は、CloudFront Distribution の数が多く、Lambda がタイムアウトしてしまうため、Fargate で実行しています。実施している処理は同じです。コードは[chobiit-prod/release/chobiitInvalidating/](https://github.com/NovelWorksInc/chobiit-prod/tree/develop/release/chobiitInvalidating)を参照してください。

#### 補足：`chobiitInvalidating`の手動実行の方法について

Lambda 関数の場合は、Test を実行してください。event は使わないので中身はなんでも問題ないです。

![image][スクリーンショット 2023-10-05 14.42.54.png]

---

Fargateの場合は大体以下の手順です（UI は変わる可能性があるのであまり書きたくないですが丁寧に書きます）（ECS の用語の解説はしません）（以下のキャプチャは、筆者が English で表示しているため英語表記です）：

まず最新の Task Definition を選択します（補足：リビジョン番号が整数として最も大きいものが最新の Task Definition です）

![image][スクリーンショット 2023-10-05 14.43.56.png]

タスクの実行を`Deploy > Run task`から行います。

![image][スクリーンショット 2023-10-05 14.44.52.png]

`Environment > Existing cluster`では`chobiit-prod-invalidating`を選択します。

![image][スクリーンショット 2023-10-05 14.46.09.png]

おそらくデフォルトでそうなっているはずですが、Networking の Public IP が ON になっていることを確認してください。

![image][スクリーンショット 2023-10-05 14.47.05.png]

最後に`Create`を実行して、タスクを作成し、処理を開始してください。

![image][スクリーンショット 2023-10-05 14.48.14.png]


### 3. CloudFront Distribution のキャッシュを無効化する。

実は`chobiitInvalidating`が使える場合は手順2 で完了しています。

もし手動で数個の CloudFront Distribution のキャッシュを無効化する必要がある場合は以下のような手順になります：

キャッシュを無効化したい CloudFront Distribution をクリックし画面を開きます。

![image][スクリーンショット 2023-10-05 14.53.50.png]

`Invalidations`を開き、`Create Distribution`をクリックします。

![image][スクリーンショット 2023-10-05 14.54.27.png]

`Object paths`にキャッシュを無効化したいファイルのパスを記載します。特に指定がないなら`/*`とワイルドカードを使うことができます。
最後に`Create invalidation`をクリックし、キャッシュ無効化処理を実行します。

![image][スクリーンショット 2023-10-05 14.55.51.png]

## Tips: Novelworks 所有の kintone/chobiit にだけデプロイしたい場合

もし client だけのデプロイなのであれば、カナリアリリース的なことを行うことができます。バックエンドのデプロイは無理です。

### 手順概要

1. ソースコードをビルドする。
2. S3 の、ノベルワークスが持っているドメインのディレクトリにだけアップロードする。
3. CloudFront Distribution のキャッシュを無効化する。

### 手順詳細
#### 1. ソースコードをビルドする。
これは同じ。
chobiit-client の最新の[README.md](https://github.com/NovelWorksInc/chobiit-prod/blob/develop/chobiit-client-prod/README.md)を参照してください。

#### 2. S3 の、ノベルワークスが持っているドメインのディレクトリにだけアップロードする。
`chobiit-prod/public/chobiit-common/`ではなく、ノベルワークスが所有しているドメインにだけアップロードします。

- 日本版本番：
    - [chobiit-prod/public/xf64e/](https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-prod?region=us-east-1&prefix=public/xf64e/&showversions=false)
- US 版本番：
    - [chobiit-us/public/novelworks/](https://s3.console.aws.amazon.com/s3/buckets/chobiit-client-us?region=us-east-1&prefix=public/novelworks/&showversions=false)


#### 3. CloudFront Distribution のキャッシュを無効化する。

S3 にアップロードした時に選んだドメインの CloudFront Distribution のキャッシュを無効化します。

- [CloudFront Distribution of xf64e.chobiit.me](https://us-east-1.console.aws.amazon.com/cloudfront/v4/home?region=us-west-1#/distributions/E25N89Z2T26X3Y)
- [CloudFront Distribution of novelworks.chobiit.us](https://us-east-1.console.aws.amazon.com/cloudfront/v4/home?region=us-west-1#/distributions/EZ6NOAYAT3ZT7)

