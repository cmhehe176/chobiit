/**
 * # 前提
 * - client, config と異なり、Lambda 関数についてはビルド時に環境変数を入れ込むのではなく、Lambda関数に提供されている環境変数の機能を使う。
 * - 全ての Lambda 関数で共通して適用する環境変数をいくつか指定する。
 * - いくつかの Lambda 関数で、その関数固有もしくは一部の関数たちで共通に設定されている既存の環境変数が存在する。 
 *
 * # このスクリプトの目的
 * - 上述の『全ての Lambda 関数で共通して適用する環境変数』を設定する。
 */
 
import {
    LambdaClient,
    UpdateFunctionConfigurationCommand,
    GetFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import prompts from "prompts";
import { diffString } from "json-diff";
import {
    getAwsRegion,
    getSystemEnv,
    getChobiitLang,
    getChobiitDomainName,
} from "chobiit-common/src/deployment-utilities";
import DEPLOY_AUTOMATED_LAMBDA_FUNCTION_LIST from "./deploy-automated-lambda-functions";
import { correct } from "./correct-function-name";

type EnvironmentVariables = Record<string, string>;

const [, , lambdaFunctionName] = process.argv;

if (!DEPLOY_AUTOMATED_LAMBDA_FUNCTION_LIST.includes(lambdaFunctionName)) {
    throw new Error(`Invalid lambda function name: ${lambdaFunctionName}`);
}

/**
 * 現在の環境変数の情報を取得
 * @param functionName 
 * @returns 
 */
const getFunctionEnvironments = async (functionName: string): Promise<EnvironmentVariables> => {
    const client = new LambdaClient({region: getAwsRegion()});
    const command = new GetFunctionConfigurationCommand({FunctionName: correct(functionName)});
    const response = await client.send(command);
    
    /**
     * 何も環境変数が設定されていない場合
     */
    if (response.Environment?.Variables === undefined) {
        return {};
    }
    
    return response.Environment.Variables;
};

/**
 * Chobiit 全体で共通の環境変数を適切な値で追加する。
 * `.env.jp.prod`, `.env.us.prod`を参照。
 * # 注意
 * 既存の環境変数を保っておかないと、更新した時にその環境変数が削除されてしまいます。
 * @param currentEnvironments 
 * @returns 
 */
const buildNewEnvironments = (currentEnvironments: EnvironmentVariables): EnvironmentVariables => {
    return {
        ...currentEnvironments,
        SYSTEM_ENV: getSystemEnv(),
        CHOBIIT_LANG: getChobiitLang(),
        CHOBIIT_DOMAIN_NAME: getChobiitDomainName(),
    };
};

/**
 * 環境変数を更新する。
 * @param functionName 
 * @param newEnvironments 
 * @returns 
 */
const updateFunctionEnvironments = async (functionName: string, newEnvironments: EnvironmentVariables): Promise<EnvironmentVariables> => {
    const client = new LambdaClient({region: getAwsRegion()});
    const command = new UpdateFunctionConfigurationCommand({
        FunctionName: correct(functionName),
        Environment: {
            Variables: newEnvironments
        }
    });
    const result = await client.send(command);
    
    if (result.Environment?.Variables === undefined) {
        throw new Error("更新後の環境変数が空になっています。異常の発生の可能性があるので確認してください。");
    }

    return result.Environment?.Variables;
};

(async () => {
    console.log(`[${lambdaFunctionName}] Getting the current environment variables...`);
    const currentEnvs = await getFunctionEnvironments(lambdaFunctionName);
    const newEnvs = buildNewEnvironments(currentEnvs);
    const diff = diffString(currentEnvs, newEnvs);

    console.log(`[${lambdaFunctionName}] -------------------------`);
    console.log(`[${lambdaFunctionName}] Current Environments:`);
    console.log(JSON.stringify(currentEnvs, null, 2));
    console.log(`[${lambdaFunctionName}] -------------------------`);
    console.log(`[${lambdaFunctionName}] New Environments:`);
    console.log(JSON.stringify(newEnvs, null, 2));
    console.log(`[${lambdaFunctionName}] -------------------------`);
    console.log(`[${lambdaFunctionName}] Differences:`);
    console.log(diff);
    
    if (diff === "") {
        console.log(`[${lambdaFunctionName}] 既に適切に環境変数が設定されています。`);
        return;
    }

    const { isConfirmed } = await prompts({
        type: "toggle",
        name: "isConfirmed",
        message: `上記の内容で ${lambdaFunctionName} (SYSTEM_ENV: ${getSystemEnv()}, AWS_REGION: ${getAwsRegion()})の環境変数を更新します。よろしいですか？`,
        active: "Yes",
        inactive: "No",
    });
    
    if (!!isConfirmed) {
        console.log(`[${lambdaFunctionName}] Start updating environment variables...`);
        const updatedEnvs = await updateFunctionEnvironments(lambdaFunctionName, newEnvs);
        console.log(`[${lambdaFunctionName}] Succeeded updating environment variables!!! The current environment variables are below:`);
        console.log(JSON.stringify(updatedEnvs, null, 2));
        return;
    } else {
        console.log(`[${lambdaFunctionName}] Canceled.`);
        return;
    }
})();