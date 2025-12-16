import AdmZip from "adm-zip";
import prompts from "prompts";
import {
    LambdaClient,
    UpdateFunctionCodeCommand,
    UpdateFunctionCodeCommandOutput,
    GetFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import {
    getAwsRegion,
    getSystemEnv,
    getChobiitLang,
    getChobiitDomainName,
} from "chobiit-common/src/deployment-utilities";
import DEPLOY_AUTOMATED_LAMBDA_FUNCTION_LIST from "./deploy-automated-lambda-functions";
import { correct } from "./correct-function-name";

const [, , lambdaFunctionName] = process.argv;

if (!DEPLOY_AUTOMATED_LAMBDA_FUNCTION_LIST.includes(lambdaFunctionName)) {
    throw new Error(`Invalid lambda function name: ${lambdaFunctionName}`);
}

/**
 * zip ファイルを生成する。なお、ローカルディスクには書き込まない。
 * @param functionName 
 * @returns Buffer (zip content)
 */
const generateZipContent = (functionName: string): Buffer => {
    const zip = new AdmZip();
    zip.addLocalFile(`./build/${functionName}/${getSystemEnv()}/index.js`);
    return zip.toBuffer();
};

/**
 * 対象 Lambda 関数の環境変数を取得する。
 *
 * @param functionName 
 * @returns - `Record<string, string>`の形の環境変数の一覧
 */
const getFunctionEnvironments = async (functionName: string): Promise<Record<string, string>> => {
    const client = new LambdaClient({region: getAwsRegion()});
    const command = new GetFunctionConfigurationCommand({FunctionName: correct(functionName)});
    const response = await client.send(command);
    
    if (response.Environment?.Variables === undefined) {
        throw new Error("This function does not have any environment variables. You MUST set `CHOBIIT_LANG`.");
    }
    
    return response.Environment.Variables;
};

/**
 * 取得した Lambda 関数の環境変数に、適切に`CHOBIIT_LANG`が設定されているかを検証する。
 * @param environment 
 * @returns 
 */
const isChobiitLangSet = (environment: Record<string, string>): boolean => {
    return environment.CHOBIIT_LANG === getChobiitLang();
};

/**
 * 取得した Lambda 関数の環境変数に、適切に`CHOBIIT_DOMAIN_NAME`が設定されているかを検証する。
 * @param environment 
 */
const isChobiitDomainNameSet = (environment: Record<string, string>): boolean => {
    return environment.CHOBIIT_DOMAIN_NAME === getChobiitDomainName();
};

/**
 * 取得した Lambda 関数の環境変数に、適切に`SYSTEM_ENV`が設定されているかを検証する。
 * @param environment 
 * @returns 
 */
const isSystemEnvSet = (environment: Record<string, string>): boolean => {
    return environment.SYSTEM_ENV === getSystemEnv();
};

/**
 * Lambda 関数のコードを更新する。
 * @param functionName 
 * @param zipContent 
 * @returns 
 */
const updateFunctionCode = async (functionName: string, zipContent: Buffer): Promise<UpdateFunctionCodeCommandOutput> => {
    const client = new LambdaClient({region: getAwsRegion()});
    const command = new UpdateFunctionCodeCommand({
        FunctionName: correct(functionName),
        ZipFile: zipContent,
    });
    return client.send(command);
};

(async () => {
    console.log(`Generating zip file... FunctionName=${lambdaFunctionName}.`);
    const zipContent = generateZipContent(lambdaFunctionName);
    console.log(`Successfully generated zip file!!! FunctionName=${lambdaFunctionName}.`)
    
    const { isConfirmed } = await prompts({
        type: "toggle",
        name: "isConfirmed",
        message: `${lambdaFunctionName} (SYSTEM_ENV: ${getSystemEnv()}, AWS_REGION: ${getAwsRegion()})を更新します。よろしいですか？`,
        active: "Yes",
        inactive: "No",
    });
    
    if (!!isConfirmed) {
        console.log(`Updating function code... FunctionName=${lambdaFunctionName}.`);

        /**
         * 環境変数のバリデーションを行う。
         */
        const functionEnvironment = await getFunctionEnvironments(lambdaFunctionName);
        
        if (!isSystemEnvSet(functionEnvironment)) {
            throw new Error(`Invalid SYSTEM_ENV. SYSTEM_ENV must be "${getSystemEnv()}". Check your function (${lambdaFunctionName}) environment!!!`);
        }

        if (!isChobiitLangSet(functionEnvironment)) {
            throw new Error(`Invalid CHOBIIT_LANG. CHOBIIT_LANG must be "${getChobiitLang()}". Check your function (${lambdaFunctionName}) environment!!!`);
        }
        
        if (!isChobiitDomainNameSet(functionEnvironment)) {
            throw new Error(`Invalid CHOBIIT_DOMAIN_NAME. CHOBIIT_DOMAIN_NAME must be "${getChobiitDomainName()}". Check your function (${lambdaFunctionName}) environment!!!`);
        }
        
        await updateFunctionCode(lambdaFunctionName, zipContent);
        console.log(`Successfully updated function code!!! FunctionName=${lambdaFunctionName}.`)
    } else {
        console.log("Canceled.");
    }
})();