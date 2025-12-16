import { getSystemEnv, getChobiitLang } from "chobiit-common/src/deployment-utilities";

/**
 * # 目的
 * 同じ Lambda 関数のはずなのに、日本版とUS版、開発環境のそれぞれで微妙に名前が異なる関数があった。
 * 応急処置として、ビルド・デプロイスクリプトの中で適当に関数名を置換することにする。
 */
export const correct = (passedFunctionName: string): string => {
    switch (passedFunctionName) {
        case "chobiitGetConfigUsers": {
            if (getSystemEnv() === "prod" && getChobiitLang() === "ja") {
                console.warn("[注意] 日本版のこの関数名は`chobiitGetConifgUsers`です。US版・開発環境と異なるので気をつけてください。");
                return "chobiitGetConifgUsers";
            } else {
                return passedFunctionName;
            }           
        }
        case "chobiitUpdateUser": {
            /**
             * # 注意
             * 日本版の本番環境だけ`chobitoneUpdateUser`になっている。なぜか。
             */
            if (getSystemEnv() === "prod" && getChobiitLang() === "ja") {
                console.warn("[注意] 日本版のこの関数名は`chobitoneUpdateUser`です。US版・開発環境と異なるので気をつけてください。");
                return "chobitoneUpdateUser";
            } else {
                return passedFunctionName;
            }
        }
        case "chobiitListApps": {
            if (getSystemEnv() === "prod" && getChobiitLang() === "ja") {
                console.warn("[注意] 日本版のこの関数名は`chobiitListApp`です。(最後にsがない) US版・開発環境と異なるので気をつけてください。");
                return "chobiitListApp";
            } else {
                return passedFunctionName;
            }
        }
        case "chobiitGetRelateRecords": {
            if (getSystemEnv() === "prod" && getChobiitLang() === "ja") {
                console.warn("[注意] 日本版のこの関数名は`chobititGetRelateRecords`です。 US版・開発環境と異なるので気をつけてください。");
                return "chobititGetRelateRecords";
            } else {
                return passedFunctionName;
            }
            
        }
        default: return passedFunctionName;
    }
};