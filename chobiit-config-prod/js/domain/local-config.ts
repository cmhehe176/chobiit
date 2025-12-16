import { ChobitoneApp } from "chobiit-common/src/types/chobiit";

export class LocalConfig {
    /**
     * ローカルのアプリ設定を物理的に削除するためのメソッド
     * 副作用が起こること前提のメソッドになっている
     */
    static deleteOldAppConfig(appConfig: ChobitoneApp) {
        Object.keys(appConfig).forEach(key => {
            switch (key) {
                case "recordCond1":
                case "calendarView":
                    delete appConfig[key]
                    break
            }
        })
    }
}