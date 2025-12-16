import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3'
import { LambdaClient, InvokeCommand, InvokeCommandOutput } from '@aws-sdk/client-lambda';
import prompts from "prompts";
import { getSystemEnv, getAwsRegion, getChobiitLang } from 'chobiit-common/src/deployment-utilities';

const targetFileName = process.argv[2];

if (targetFileName === undefined) {
    throw new Error("You must specify the target file name."); 
}

const BASE_BUILD_DIR = `./build/${getChobiitLang()}/${getSystemEnv()}/`;

/**
 * 注意: Chobiit でクライアントのファイルを置いている S3 バケットは、
 *      どの環境も全て us-east-1 にある。
 */
const S3_BUCKET_REGION = "us-east-1";

const getBucketName = (): string => {
    const chobiitLang = getChobiitLang();
    const systemEnv = getSystemEnv();
    
    if (systemEnv === "dev") {
        return "chobiit-client-dev";
    } else {
        return chobiitLang === "ja" ? "chobiit-client-prod" : "chobiit-client-us";
    }
};

/**
 * JS ファイルを S3 にアップロードする。
 * @param targetJsFileName - デプロイ対象の JS ファイル名
 * @returns 
 */
const uploadJsFile = async (targetJsFileName: string): Promise<PutObjectCommandOutput> => {
    const s3Client = new S3Client({ region: S3_BUCKET_REGION });
    const jsFileContent = fs.readFileSync(path.join(BASE_BUILD_DIR, targetJsFileName));
    const uploadJsCommand = new PutObjectCommand({
        Bucket: getBucketName(),
        Body: jsFileContent,
        Key: `public/chobiit-common/js/${targetJsFileName}`,
        ContentType: "text/javascript",
    });
    
    return s3Client.send(uploadJsCommand);
};

/**
 * HTML ファイルを S3 にアップロードする。
 * 
 * - **注意**
 *   - 外部公開ページの HTML ファイルは、ファイル名の先頭が`p_`である。
 *   - このファイルたちについては、`public/chobiit-common/public/`に配置する。
 *
 * @param targetHtmlFileName - デプロイ対象の HTML ファイル名
 * @returns 
 */
const uploadHtmlFile = async (targetHtmlFileName: string): Promise<PutObjectCommandOutput> => {
    const s3Client = new S3Client({ region: S3_BUCKET_REGION });
    const additionalDirLayer = targetHtmlFileName.startsWith("p_") ? "public" : "";
    const originFilePath = path.join(BASE_BUILD_DIR, additionalDirLayer, targetHtmlFileName);
    const htmlFileContent = fs.readFileSync(originFilePath);
    const uploadHtmlCommand = new PutObjectCommand({
        Bucket: getBucketName(),
        Body: htmlFileContent,
        Key: path.join("public", "chobiit-common", additionalDirLayer, targetHtmlFileName),
        ContentType: "text/html",
    });
    
    return s3Client.send(uploadHtmlCommand);
};

/**
 * 指定された js/html ファイルを S3 にアップロードする。
 */
const uploadHtmlJavascriptFiles = async (targetFileName: string): Promise<[PutObjectCommandOutput, PutObjectCommandOutput]> => {
    const jsFileName = `${targetFileName}.js`;
    const htmlFileName = `${targetFileName.replace(/-/g, "_")}.html`;
    return Promise.all([
        uploadJsFile(jsFileName),
        uploadHtmlFile(htmlFileName),
    ]);
};

/**
 * 指定された jsファイルのみを S3 にアップロードする。
 * 
 ** main.js等はhtmlファイルがないため、jsファイルのみをアップロードする関数uploadJavascriptFilesを作成しました。
 ** main.jsのmodule化が完了したら、uploadHtmlJavascriptFiles / excludedHtmlFileNamesは削除してください。
 ** backlog: https://noveldev.backlog.com/view/CHOBIIT-264
 */
const uploadJavascriptFiles = async (targetFileName: string): Promise<[PutObjectCommandOutput]> => {
    const jsFileName = `${targetFileName}.js`;
    return Promise.all([
        uploadJsFile(jsFileName)
    ]);
};

/**
 * `chobiitInvalidating`という名前の Lambda 関数を呼び出す。
 * 
 * 詳細は`chobiitInvalidating`を参照してほしいが、主に以下の2つを実行している：
 * 
 * - `public/chobiit-common/`内のファイルたちを、各ドメインのフォルダにコピーする
 * - 全てのドメインの CloudFront Distribution に対して create invalidation を実行する。
 */
const invokeChobiitInvalidating = async (): Promise<InvokeCommandOutput | undefined> => {
    
    /**
     * ATTENTION: 日本版 chobiit は、CloudFront Distribution が多いため、Lambda がタイムアウトする。
     * ATTENTION: どうしてもリリース時にキャッシュを削除する必要がある場合は、Fargate に構築している chobiitInvalidating を直接呼び出す。
     * ATTENTION: もしキャッシュの削除が不要な形で互換性を保ちながらリリースができるなら、それが望ましい。
     */
    if (getSystemEnv() === "prod" && getChobiitLang() === "ja") {
        console.warn("日本版の本番デプロイでは、Fargate を呼ぶようにしてください。");
        return;
    }
    
    const client = new LambdaClient({region: getAwsRegion()});
    const command = new InvokeCommand({
        FunctionName: "chobiitInvalidating",
    });
    return client.send(command);
};

/**
 * jsファイルのみのアップロードを行うファイル名のリスト。
 */
const excludedHtmlFileNames: string[] = [
    "main"
];

(async () => {
    const {isConfirmed}: {isConfirmed: boolean} = await prompts({
        type: "toggle",
        name: "isConfirmed",
        message: `${targetFileName} (SYSTEM_ENV: ${getSystemEnv()}, CHOBIIT_LANG: ${getChobiitLang()}) を更新します。よろしいですか？`,
        active: "Yes",
        inactive: "No",
    });
    
    if (!isConfirmed) {
        console.log("Canceled.");
       return; 
    }

    const isExcludedFileName = excludedHtmlFileNames.includes(targetFileName);

    console.log(`Uploading ${targetFileName}...`);
    if(isExcludedFileName){
        await uploadJavascriptFiles(targetFileName);
    }else{
        await uploadHtmlJavascriptFiles(targetFileName);
    }
    console.log(`Successfully uploaded ${targetFileName}!!!`);
    
    console.log(`Calling chobiitInvalidating...`);
    await invokeChobiitInvalidating();
    console.log(`Successfully called chobiitInvalidating!!!`);
})();

