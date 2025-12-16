import fs from 'fs';
import path from 'path';
import esbuild, { BuildOptions } from "esbuild";
import ejs from 'ejs';
import { getSystemEnv, getChobiitLang } from "chobiit-common/src/deployment-utilities";
import clientEn from 'chobiit-common/src/locales/client/en.json';
import clientJa from 'chobiit-common/src/locales/client/ja.json';

const buildDefine = (): BuildOptions["define"] => {
        const result: BuildOptions["define"] = {};

        for (const key in process.env) {
                result[`process.env.${key}`] = JSON.stringify(process.env[key]);
        }

        /**
         * # 補足
         * [こちらのissue](https://github.com/evanw/esbuild/issues/73)に言及されているアプローチをとっている。
         *
         * このスクリプトではブラウザで動作する javascript を生成することを意図しているが、Node.js で使える`global`という
         * オブジェクトに依存したパッケージを利用する場合、エラーが起こる可能性がある。
         * よって、ブラウザ上では`window`オブジェクトを参照する。
         */
        result["global"] = "window";

        return result;
};

const buildJs = async () => {
    /**
     * 注意：日本版は全てビルドOK
     */
    const jpEntryPoints = [
        './src/login.js',
        './src/list-app.js',
        './src/main.js',
        './src/auth.js',
        './src/config.js',
        './src/logout.js',
        './src/thanks.js',
        './src/user-info.js',
        './src/add-record.js',
        './src/list-record.js',
        './src/detail-record.js',
        './src/p-list-record.js',
        './src/p-add-record.js',
        './src/p-detail-record.js',
        './src/p-thanks.js',
        './src/verify.js',
        './src/register.js',
        './src/forgot-password.js',
    ];
    
    /**
     * 注意：US版は、統合が完了したものからビルドできるようにしていく
     */
    const usEntryPoints = [
        './src/forgot-password.js',
        './src/register.js',
        './src/login.js',
        './src/main.js',
        './src/list-record.js',
        './src/add-record.js',
        './src/detail-record.js',
        './src/p-add-record.js',
        './src/p-list-record.js',
        './src/p-detail-record.js',
    ];

    const entryPoints = getChobiitLang() === "ja" ? jpEntryPoints : usEntryPoints;

    return esbuild.build({
        define: buildDefine(),
        bundle: true,
        entryPoints,
        outdir: `./build/${getChobiitLang()}/${getSystemEnv()}/`,
        sourcemap: getSystemEnv() !== "prod" ? "inline" : false,
        platform: "browser",
        target: ["es2020"],
        treeShaking: true,
        minify: getSystemEnv() === "prod",
        logLevel: "info",
        logLimit: 0,
        color: true,
    });
};

const buildStaticFiles = (): Promise<void>[] => {
    /**
     * - 注意：日本版・US 版の統合が完了したものは`.ejs`を作成してこちらに追加していく。
     * - 注意：これまでは`s3-website`ディレクトリに`.html`ファイルが用意されていたが、i18n対応のため、`.ejs`に変更していく。
     */
    const entryFiles = [
        "./src/static/forgot_password.ejs",
        "./src/static/register.ejs",
        "./src/static/login.ejs",
        "./src/static/add_record.ejs",
        "./src/static/public/p_add_record.ejs",
        "./src/static/detail_record.ejs",
        "./src/static/public/p_detail_record.ejs",
        "./src/static/list_record.ejs",
        "./src/static/public/p_list_record.ejs",
    ];
    
    const outPath = (outputFilename: string): string => {
        const baseDir = `./build/${getChobiitLang()}/${getSystemEnv()}/`;
        const additionalDirLayer = outputFilename.startsWith("p_") ? "public" : "";
        
        return path.join(baseDir, additionalDirLayer, outputFilename);
    };

    const build = async (filePath: string): Promise<void> => {
        const basename = path.basename(filePath);
        const outputFileName = basename.replace('.ejs', '.html');
        const file = fs.readFileSync(filePath, 'utf-8');
        const data = getChobiitLang() === "ja"
            ? {message: clientJa, chobiitLang: "ja"}
            : {message: clientEn, chobiitLang: "en"};
        const buildContent = ejs.render(file, data);
        fs.mkdirSync(path.dirname(outPath(outputFileName)), { recursive: true });
        fs.writeFileSync(outPath(outputFileName), buildContent);
    };
    
    return entryFiles.map(build);
};

(async () => {
    await Promise.all([
        buildJs(),
        ...buildStaticFiles(),
    ]);
})();