import fs from "fs";
import prompts from "prompts";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSystemEnv, getChobiitLang } from "chobiit-common/src/deployment-utilities";

const getBucketName = (): string => {
    switch (getSystemEnv()) {
        case "dev":
            return "chobiit-config-dev";
        case "prod": {
            switch (getChobiitLang()) {
                case "ja":
                    return "chobiit-config-prod";
                case "en":
                    return "chobiit-config-us";
            }
        }
    }
};

(async () => {
    const client = new S3Client({
        /**
         * # ATTENTION
         * chobiit config S3 Bucket は本番・開発/日本・US版どれも us-east-1 に作成している。
         */
        region: 'us-east-1'
    });

    const command = new PutObjectCommand({
        Bucket: getBucketName(),
        Key: "config.js",
        Body: fs.readFileSync(`./build/${getChobiitLang()}/${getSystemEnv()}/config.js`),
    });

    try {
        const { isConfirmed } = await prompts({
            type: "toggle",
            name: "isConfirmed",
            message: `${getSystemEnv()} (lang: ${getChobiitLang()})にデプロイします。よろしいですか？`,
            active: "Yes",
            inactive: "No",
        });

        if (!!isConfirmed) {
            console.log("Uploading config.js to S3...");
            await client.send(command);
            console.log("Successfully uploaded config.js to S3.")
        } else {
            console.log("Canceled.");
        }
    } catch (err) {
        console.error("Failed to upload config.js to S3.", err);
    }
})();