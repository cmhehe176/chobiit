# はじめに

- これは、デプロイの運用についてまとめたドキュメントです。
- ブランチの運用は、Git flow に則る。
- が、非常にセレブレーションが多く面倒な運用です。もっと品質が安定してくればもっとシンプルな運用に変えたい。


# git, npm の初歩的な仕組みを知らない人は読んでください

- デプロイ作業に入る前には、デプロイすべきブランチをチェックアウトし、リモートブランチとローカルブランチが同じ位置にあることを確認してください。
- デプロイのコマンドを諸々実行する前には[npm ci](https://docs.npmjs.com/cli/v10/commands/npm-ci?v=true)を実行してください。
- デプロイに使っているコマンドの定義は、`package.json`の`scripts`の中を見ると書いてあり、その中で実行されている`.js`, `.ts`ファイルを読めば、何をやっているかは理解することができます。


# 事前準備

- CS 担当（うえむーさん）にユーザー告知の案内をしてもらうためにチケットを作成する。
- チケット種別は「release」にして、必要事項を記入する。（例： CHOBIIT-218）
- チケット担当者をうえむーさんに設定し、ユーザー告知の連絡を依頼する。


# リリース当日の作業

## Step0: Slack にて連絡を行う。

「リリースします」連絡をする。


## Step1: リリースブランチ作成

```
$ cd /path/to/chobiit-prod
$ git fetch
$ git checkout develop
$ git reset --hard origin/develop
$ git checkout -b "release/{version}"
$ git push origin "release/{version}"
```

※ versionはJiraで確認（リリース対象のバグチケットの親Epic名）
※`chobiit-us`で作業をする場合も同様。


## Step2: デプロイ＆テスト

デプロイ方法は、Git Repository 内の README を参照すること。

### もし本番リリースの際に不具合を発見したら

release ブランチから新しくブランチを作成し、その新しいブランチ上で作業をすること。

例

```
$ git checkout -b "release/{version}_fix-a-problem"
```


## Step3: master ブランチへのマージ＆タグ作成

無事にリリース作業が完了したのちに行う。

### Step3-1 master ブランチへのマージ
- release/{version} ブランチから master ブランチへプルリクエストを作成し、マージ。
- master ブランチにタグを作成する：

### Step3-2 タグ作成

以下Githubにて操作を行う

1. リリースノートの作成ページを開く https://github.com/NovelWorksInc/chobiit-prod/releases/new
2. `Choose a tag`ボタンをクリックする
3. 入力欄に`v{version}`と入力 (例: v1.0.0)
4. `+ Create new tag: v{version} on publish`をクリック
5. `Target`には`master`を指定
6. `Release title`に`v{version}`と入力
7. 本文欄にはJiraのリリースページのURLを入力(例: https://novelworks.atlassian.net/projects/CFK/versions/10002/tab/release-report-all-issues)
8. `Publish release`ボタンをクリック
9. 7のリンク先(Jira)のステータスを「リリース」（＝リリース済み）に変更する


## Step4: develop ブランチへの取り込み

注意：このステップは、step2 で release ブランチに対して何か変更を加えた場合のみ行う。

- release/{version} ブランチから develop ブランチへプルリクエストを作成し、マージ。


# 改修時の注意点

メインとなる改修のほか、改善タスクの対応をお願いします。
改善タスクの確認は、CHOBIIT-189の子課題を参照してください。
また改修中に改善タスクを発見した場合は登録をお願いします。

# Reference

https://nvie.com/posts/a-successful-git-branching-model/