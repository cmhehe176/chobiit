
Chobiit 1.0.8のリリース手順

# リリース対象のファイル一覧

## (フロントエンド)



## (バックエンド)

chobiitGetConfigUsers

## (コンフィグ)

config


# ◾️リリースの準備

## 1.リリース後テスト用環境の構築
リリース後, 速やかに[ 日本版・US版 ]本番環境でのテストを開始出来るよう, 環境構築をしておく.

## 2.リリース前セットアップ
リリース用のブランチを切っておく

### A. マージ時の衝突を防ぐためにdevelop (開発用)ブランチを最新化しておく

```
git switch develop 
git fetch
git rebase origin/develop
```

### B. リリースのバージョンを名前に含めたブランチを作成する

```
git switch -c release/1.0.8
```

### C. 差分に問題がないか確認する（プルリクを作って　差分表示機能で確認する）

※ プルリクの対象をmaster(本番環境)にセットするのを忘れずに

```
// pushしたコードをmasterと比較し, 意図しない差分がないかをチェックする
git push
```

### D. 以上, 問題なければプルリクを作成する


# 🇺🇸US版リリース手順
## (バックエンド)

### 1.リリースブランチに切り替え

```
git switch release/1.0.8
```

### 2.ライブラリを最新の状態にして、現在ビルドしているバックエンドのファイルを削除する

```
cd chobiit-backend
npm ci
rm -R build
```

### 3.対象のバックエンドのファイルをビルドする
```
// us版 jp版 共通
npm run build:prod chobiitGetConfigUsers
```

### 4.必要な環境変数がなければ、追加する
```
// us版
npm run set-common-envs:us:prod chobiitGetConfigUsers
```

### 5.対象のバックエンドのファイルのデプロイ
```
// us版
npm run deploy:us:prod chobiitGetConfigUsers
```

### 6.リリース後確認テストを実施
 - デプロイが適切に行えているかを確認するため, リリース後確認テストを行う

			
## (コンフィグ)

### 1. リリースブランチに切り替え

```
git switch release/1.0.8
```

### 2.ライブラリを最新の状態にして、現在ビルドしているコンフィグのファイルを削除する

```
cd chobiit-config-prod 
npm ci
rm -R build
```

### 3.対象のコンフィグのファイルをビルドする
```
// us版
npm run build:us:prod
```

### 4.対象のバックエンドのファイルのデプロイ
```
// us版
npm run deploy:us:prod
```

### 5. リリース後確認テストを実施
 - デプロイが適切に行えているかを確認するため, リリース後確認テストを行う
			
# 🇯🇵日本版リリース手順
## (バックエンド)

### 1.リリースブランチに切り替え

```
git switch release/1.0.8
```

### 2.ライブラリを最新の状態にして、現在ビルドしているバックエンドのファイルを削除する

```
cd chobiit-backend
npm ci
rm -R build
```

### 3.対象のバックエンドのファイルをビルドする
```
// us版 jp版 共通
npm run build:prod chobiitGetConfigUsers
```

### 4.必要な環境変数がなければ、追加する
```
// jp版
npm run set-common-envs:jp:prod chobiitGetConfigUsers
```

### 5.対象のバックエンドのファイルのデプロイ
```
// jp版
npm run deploy:jp:prod chobiitGetConfigUsers
```

### 6.リリース後確認テストを実施
 - デプロイが適切に行えているかを確認するため, リリース後確認テストを行う

			
## (コンフィグ)

### 1. リリースブランチに切り替え

```
git switch release/1.0.8
```

### 2.ライブラリを最新の状態にして、現在ビルドしているコンフィグのファイルを削除する

```
cd chobiit-config-prod 
npm ci
rm -R build
```

### 3.対象のコンフィグのファイルをビルドする
```
// jp版
npm run build:jp:prod
```

### 4.対象のバックエンドのファイルのデプロイ
```
// jp版
npm run deploy:jp:prod
```

### 5. リリース後確認テストを実施
 - デプロイが適切に行えているかを確認するため, リリース後確認テストを行う
			
# ◾️🌆全てのリリースの完了後作業

## 1.masterブランチへreleaseブランチをマージ
※ もし, fix-releaseブランチを作成していた場合は, developerブランチへも同じようにマージする必要があります

## 2.タグの作成
以下Githubにて操作を行う
1. リリースノートの作成ページを開く https://github.com/NovelWorksInc/chobiit-prod/releases/new
2. Choose a tagボタンをクリックする
3. 入力欄にv1.0.8と入力 (例: v1.0.0)
4. +Create new tag: v1.0.8 on publishをクリック
5. Targetにはmasterを指定
6. Release titleにv1.0.8と入力
7. 本文欄にはJiraのリリースページのURLを入力(例: https://novelworks.atlassian.net/projects/CFK/versions/10002/tab/release-report-all-issues)
8. Publish releaseボタンをクリック
9. 7のリンク先(Jira)のステータスを「リリース」（＝リリース済み）に変更する

## 3.ターミナルのコマンドのヒストリーを消す

```
# historyを消す　mac (zshの場合)
rm ~/.zsh_history

# zshを初期化
ターミナルを再起動する
```

# ロールバック手順
## 1.ブランチを切るためにマスターブランチへ移動

## 2.タグの確認
詳しい操作については, 以下を参照のこと
[chobiit_開発手引 - ソースコードのロールバック手順](https://docs.google.com/document/d/1yUnCHcSQkNbU1mmicnvhjJwKfxfhyWA9Ng574mqejVw/edit#heading=h.sqravg754yz7)
