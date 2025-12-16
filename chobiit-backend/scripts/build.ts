import esbuild from "esbuild";
import { getSystemEnv } from "chobiit-common/src/deployment-utilities";
import DEPLOY_AUTOMATED_LAMBDA_FUNCTION_LIST from "./deploy-automated-lambda-functions";

const [, , lambdaFunctionName] = process.argv;

if (!DEPLOY_AUTOMATED_LAMBDA_FUNCTION_LIST.includes(lambdaFunctionName)) {
    throw new Error(`Invalid lambda function name: ${lambdaFunctionName}`);
}

(async () => {
    console.log(`Building ${lambdaFunctionName}...`);
    await esbuild.build({
        bundle: true,
        entryPoints: [{
            in: `src/lambda/${lambdaFunctionName}.js`,
            out: `index`,
        }],
        outdir: `./build/${lambdaFunctionName}/${getSystemEnv()}/`,
        sourcemap: getSystemEnv() !== "prod" ? "inline" : false,
        platform: "node",
        target: ["node14", "node16", "node18"],
        treeShaking: true,
        minify: getSystemEnv() === "prod",
        /**
         * # ATTENTION
         * AWS SDK v2 はパッケージサイズが大きい＆Lambda(Node.js)では標準で提供されているので、バンドルには含めないことにする。
         */
        external: ["aws-sdk"],
        logLevel: "info",
        logLimit: 0,
        color: true,
    });
    console.log(`Successfully built ${lambdaFunctionName}!!!`);
})();