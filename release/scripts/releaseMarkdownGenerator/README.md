# 使い方

.envファイルに, (拡張子を含めない)ファイル名とバージョンを設定し, 以下のコマンドを実行

e.g.)

```
// .envファイル
FRONTEND_FILE_NAMES=front1,front2
BACKEND_FILE_NAMES=back1,back2
CONFIG_FILE_NAMES=config
RELEASE_VERSION=1.0.8
```


```
// ターミナルにて実行
dotenv -e .env ts-node release-markdown-generator.ts 
```
