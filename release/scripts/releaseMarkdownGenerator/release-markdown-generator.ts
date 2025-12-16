import fs from 'fs';
import path from 'path';

interface ReleaseConfig {
	frontendFileNames: string[],
	backendFileNames: string[],
	configFileNames: string[]
	version: string;
}

class ReleaseMarkdownGenerator {
	private config: ReleaseConfig;

	constructor(config: ReleaseConfig) {
		this.config = config;
	}

	generateReleaseMarkdown(): string {
		return this.releaseFileListMd() +
			   this.preReleasePreparationMd() +
			   this.releaseMd("us") +
			   this.releaseMd("jp") +
			   this.postReleaseTasksMd() +
			   this.rollbackMd();
	}

	/**
	 * generate release md
	 */

	private releaseFileListMd(): string {
		return `
Chobiit ${this.config.version}のリリース手順

# リリース対象のファイル一覧

## (フロントエンド)

${this.config.frontendFileNames.map(filename => filename)}

## (バックエンド)

${this.config.backendFileNames.map(filename => filename)}

## (コンフィグ)

${this.config.configFileNames.map(filename => filename)}

`;
	}

	private preReleasePreparationMd(): string {
		return `
# ◾️リリースの準備

## 1.リリース後テスト用環境の構築
リリース後, 速やかに[ 日本版・US版 ]本番環境でのテストを開始出来るよう, 環境構築をしておく.

## 2.リリース前セットアップ
リリース用のブランチを切っておく

### A. マージ時の衝突を防ぐためにdevelop (開発用)ブランチを最新化しておく

\`\`\`
git switch develop 
git fetch
git rebase origin/develop
\`\`\`

### B. リリースのバージョンを名前に含めたブランチを作成する

\`\`\`
git switch -c release/${this.config.version}
\`\`\`

### C. 差分に問題がないか確認する（プルリクを作って　差分表示機能で確認する）

※ プルリクの対象をmaster(本番環境)にセットするのを忘れずに

\`\`\`
// pushしたコードをmasterと比較し, 意図しない差分がないかをチェックする
git push
\`\`\`

### D. 以上, 問題なければプルリクを作成する

`;
	}

	private releaseMd(locale: string): string {
		const title = locale === "jp" ? "🇯🇵日本版" : "🇺🇸US版"
		return `
# ${title}リリース手順` +
			this.frontendMd(locale) +
			this.backendMd(locale) +
			this.configMd(locale);
	}

	private postReleaseTasksMd(): string {
		return `
# ◾️🌆全てのリリースの完了後作業

## 1.masterブランチへreleaseブランチをマージ
※ もし, fix-releaseブランチを作成していた場合は, developerブランチへも同じようにマージする必要があります

## 2.タグの作成
以下Githubにて操作を行う
1. リリースノートの作成ページを開く https://github.com/NovelWorksInc/chobiit-prod/releases/new
2. Choose a tagボタンをクリックする
3. 入力欄にv${this.config.version}と入力 (例: v1.0.0)
4. +Create new tag: v${this.config.version} on publishをクリック
5. Targetにはmasterを指定
6. Release titleにv${this.config.version}と入力
7. 本文欄にはJiraのリリースページのURLを入力(例: https://novelworks.atlassian.net/projects/CFK/versions/10002/tab/release-report-all-issues)
8. Publish releaseボタンをクリック
9. 7のリンク先(Jira)のステータスを「リリース」（＝リリース済み）に変更する

## 3.ターミナルのコマンドのヒストリーを消す

\`\`\`
# historyを消す　mac (zshの場合)
rm ~/.zsh_history

# zshを初期化
ターミナルを再起動する
\`\`\`
`;
	}

	private rollbackMd(): string {
		return `
# ロールバック手順
## 1.ブランチを切るためにマスターブランチへ移動

## 2.タグの確認
詳しい操作については, 以下を参照のこと
[chobiit_開発手引 - ソースコードのロールバック手順](https://docs.google.com/document/d/1yUnCHcSQkNbU1mmicnvhjJwKfxfhyWA9Ng574mqejVw/edit#heading=h.sqravg754yz7)
`;
	}

	/**
	 * generate front/back/config md
	 */

	private frontendMd(locale: string): string {
		if (!this.config.frontendFileNames || this.config.frontendFileNames.length === 0) {
			return ""
		} else {
			return `
## (フロントエンド)
### 1.リリースブランチに切り替え

\`\`\`
git switch release/${this.config.version}
\`\`\`

### 2.フロントエンドのディレクトリへ移動する. 現在ビルドしているフロントエンドのファイルを削除する

\`\`\`
cd chobiit-client-prod
npm ci
rm -R build
\`\`\`

### 3. 対象のフロントエンドのファイルをビルドする
\`\`\`
// ${locale}版
npm run build:${locale}:prod
\`\`\`

### 4. レコード一覧画面のフロントのファイルを本番"検証"環境へデプロイ

 - レコード一覧画面のフロントのファイルを本番"検証"環境へデプロイ
 - **検証環境にて, リリース後確認テストを実施する**

\`\`\`
// ${locale}版
${this.frontendTestDeployCommandMd(locale)} 
\`\`\`

### 5. 問題無ければ, 本番環境へデプロイする

S3の本番用ディレクトリ(chobiit-common)に反映する

\`\`\`
// ${locale}版
${this.frontendChobiitCommonDeployCommandMd(locale)} 
\`\`\`

${this.frontendDeployCommandMd(locale)}

### 6. 再度リリース後確認テスト

 - chobiitCommonから適切にデプロイを行えているかを得ているかを確認するため, 再度リリース後確認テストを行う
			`;
		}

	}

	private backendMd(locale: string): string {
		if (!this.config.backendFileNames || this.config.backendFileNames.length === 0) {
			return ""
		} else {
			return `
## (バックエンド)

### 1.リリースブランチに切り替え

\`\`\`
git switch release/${this.config.version}
\`\`\`

### 2.ライブラリを最新の状態にして、現在ビルドしているバックエンドのファイルを削除する

\`\`\`
cd chobiit-backend
npm ci
rm -R build
\`\`\`

### 3.対象のバックエンドのファイルをビルドする
\`\`\`
// us版 jp版 共通
${this.backendBuildCommandMd()}
\`\`\`

### 4.必要な環境変数がなければ、追加する
\`\`\`
// ${locale}版
${this.backendEnvCommandMd(locale)}
\`\`\`

### 5.対象のバックエンドのファイルのデプロイ
\`\`\`
// ${locale}版
${this.backendDeployCommandMd(locale)}
\`\`\`

### 6.リリース後確認テストを実施
 - デプロイが適切に行えているかを確認するため, リリース後確認テストを行う

			`;
		}

	}

	private configMd(locale: string): string {
		if (!this.config.configFileNames || this.config.configFileNames.length === 0) {
			return ""
		} else {
			return `
## (コンフィグ)

### 1. リリースブランチに切り替え

\`\`\`
git switch release/${this.config.version}
\`\`\`

### 2.ライブラリを最新の状態にして、現在ビルドしているコンフィグのファイルを削除する

\`\`\`
cd chobiit-config-prod 
npm ci
rm -R build
\`\`\`

### 3.対象のコンフィグのファイルをビルドする
\`\`\`
// ${locale}版
npm run build:${locale}:prod
\`\`\`

### 4.対象のバックエンドのファイルのデプロイ
\`\`\`
// ${locale}版
npm run deploy:${locale}:prod
\`\`\`

### 5. リリース後確認テストを実施
 - デプロイが適切に行えているかを確認するため, リリース後確認テストを行う
			`;
		}

	}

	/**
	 * generate command md
	 */
	private frontendTestDeployCommandMd(locale: string): string {
		if (locale === "jp") {
			return this.config.frontendFileNames.map(fileName =>
				`aws s3 cp build/ja/prod/${fileName}.js s3://chobiit-client-prod/public/xf64e/js/${fileName}.js`
			).join("\n");
		} else if (locale === "us") {
			return this.config.frontendFileNames.map(fileName =>
				`aws s3 cp build/en/prod/${fileName}.js s3://chobiit-client-us/public/novelworks/js/${fileName}.js`
			).join("\n");
		} else {
			throw new Error('Please set the correct locale ("jp" or "us")');
		}
	}

	private frontendChobiitCommonDeployCommandMd(locale: string): string {
		if (locale === "jp") {
			return this.config.frontendFileNames.map(fileName =>
				`aws s3 cp build/ja/prod/${fileName}.js s3://chobiit-client-prod/public/chobiit-common/js/${fileName}.js`
			).join("\n");
		} else if (locale === "us") {
			return this.config.frontendFileNames.map(fileName =>
				`aws s3 cp build/en/prod/${fileName}.js s3://chobiit-client-us/public/chobiit-common/js/${fileName}.js`
			).join("\n");
		} else {
			throw new Error('Please set the correct locale ("jp" or "us")');
		}
	}

	private frontendDeployCommandMd(locale: string): string {
		if (locale === "jp") {
			return `
 - chobiit-commonの内容を全てのドメインへ適用する.

※ 45分くらいかかる. 途中でCloudFrontのLimit超過によって落ちる可能性があるので, その場合は再実行する.

\`\`\`
cd release/scripts/chobiitInvalidating
npm i
node index.js
\`\`\`

 - [wiki](https://noveldev.backlog.com/alias/wiki/2122069)を参考にクライアントのキャッシュをクリアする

 - デプロイ後の確認テストを実施する(スーパーリロードするのを忘れずに！！)

[確認テスト]()
`;
		} else if (locale === "us") {
			return `
 - chobiit-commonの内容を全てのドメインへ適用する. (※ 数分で終わる)

     - 下記Lambdaをテスト実行する
         - https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/chobiitInvalidating?tab=code

デプロイ後の確認テストを実施する(スーパーリロードするのを忘れずに！！)

[確認テスト]()

`;
		} else {
			throw new Error('Please set the correct locale ("jp" or "us")');
		}
	}

	private backendBuildCommandMd(): string {
		return this.config.backendFileNames.map(fileName =>
			`npm run build:prod ${fileName}`
		).join("\n");
	}

	private backendEnvCommandMd(locale: string): string {
		return this.config.backendFileNames.map(fileName =>
			`npm run set-common-envs:${locale}:prod ${fileName}`
		).join("\n");
	}

	private backendDeployCommandMd(locale: string): string {
		return this.config.backendFileNames.map(fileName =>
			`npm run deploy:${locale}:prod ${fileName}`
		).join("\n");
	}

	saveToFile(filePath: string): void {
		const markdown = this.generateReleaseMarkdown();
		fs.writeFileSync(filePath, markdown, 'utf8');
		console.log(`Created a release procedure manual: ${filePath}`);
	}
}

const config: ReleaseConfig = {
	frontendFileNames: process.env.FRONTEND_FILE_NAMES
		? process.env.FRONTEND_FILE_NAMES.split(',')
		: [],
	backendFileNames: process.env.BACKEND_FILE_NAMES
		? process.env.BACKEND_FILE_NAMES.split(',')
		: [],
	configFileNames: process.env.CONFIG_FILE_NAMES
		? process.env.CONFIG_FILE_NAMES.split(',')
		: [],
	version: process.env.RELEASE_VERSION || '1.0.0'
};

console.log(config);
const generator = new ReleaseMarkdownGenerator(config);
const filePath = path.join(__dirname, `../../note/release-procedure-manual-${config.version}.md`);
generator.saveToFile(filePath);
