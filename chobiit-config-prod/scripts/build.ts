import esbuild, { BuildOptions } from "esbuild";
import { getSystemEnv, getChobiitLang } from "chobiit-common/src/deployment-utilities";

const buildDefine = (): BuildOptions["define"] => {
	const result: BuildOptions["define"] = {};

	for (const key in process.env) {
		result[`process.env.${key}`] = JSON.stringify(process.env[key]);
	}

	return result;
};

esbuild.build({
    define: buildDefine(),
    bundle: true,
    entryPoints: ['js/config.js'],
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