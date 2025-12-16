# 用途

複数一覧ビューに対応するリリースのDBロールバック用スクリプト
改修の詳細はチケット参照 https://noveldev.backlog.com/view/CHOBIIT-277

# 処理概要

CHOBIIT-277のリリースにより下記のデータベース設計変更が生じる
なおリリース後にconfigで新たにアプリ設定を追加またはアプリ設定を変更した場合にのみ新たな型となる
リリース後に既存設定を変更しなければ旧データ型のままとなる。（つまり混在する）

IN:

- views

OUT:

- recordCond1
- calendarView

万が一ロールバックが必要な不具合がリリース後に発覚した場合に、新データに変更されている設定を対象に旧データに戻す
（別途ソースコードの切り戻しも行う）

# ロールバック実施の判断基準

本来閲覧できないデータを閲覧できてしまうなどのデータ流出が発生し且つ対処にも時間がかかる場合

# 前提

リリース前に`chobitoneApp`テーブルのオンデマンドバックアップを作成している
ロールバック実施前に`chobitoneApp`テーブルのオンデマンドバックアップを作成している ※ロールバックに問題があった時用&scan用

# 処理詳細

1. ロールバック実施前バックアップよりデータを取得(scan)
2. 新たなプロパティ`views`を持つitemを抽出
3. domain/appIdをキーとして、リリース前バックアップより旧データを取得(get)
4. `views`を削除し、旧データ(`recordCond1`, `calendarView`)を復元し更新(update)

# 使用方法

例

```
REGION=ap-southeast-1 BEFORE_RELEASE_TABLE=chobitoneApp-backup BEFORE_ROLLBACK_TABLE=chobitoneApp-rollback-test PRODUCTION_TABLE=chobitoneApp node chobiit-277-db-rollbacker/index.js
```

※必要に応じて環境変数にAWS_PROFILEを追加