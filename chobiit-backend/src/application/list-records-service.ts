import KintoneRecordRepository from "../infrastructure/kintone-record-repository";
import { ChobitoneApp, ChobiitUsageSituation } from "chobiit-common/src/types/chobiit";
import { KintoneRESTAPI } from "chobiit-common/src/types/kintone";

type ListRecordsParams = {
    app: string | number;
    query: string;
};

type RecordsGetterFunction = (domain: string, token: string, params: ListRecordsParams, chobitoneApp: ChobitoneApp) => Promise<{records: KintoneRESTAPI.KintoneRecord[], totalCount: string}>;

type RecursiveRecordsGetterFunction = (domain: string, token: string, params: ListRecordsParams, chobitoneApp: ChobitoneApp, offset?: number, acc?: KintoneRESTAPI.KintoneRecord[]) => Promise<{records: KintoneRESTAPI.KintoneRecord[], totalCount: string}>;

export default class ListRecordsService {
    /**
     * Kintone から複数レコードを取得する。
     * 
     * ## 使い方
     * 外部公開・ログイン認証ありで使い分けられるようにカリー化している。
     * 以下のように使う：
     * 
     * ```typescript
     * // 外部公開
     * await ListRecordService.listRecords("public")(domain, token, params, chobitoneApp);
     * 
     * // ログイン認証あり
     * await ListRecordService.listRecords("private")(domain, token, params, chobitoneApp);
     * ```
     *
     * @param chobiitUsageSituation 
     * @returns 
     */
    static listRecords(chobiitUsageSituation: ChobiitUsageSituation): RecordsGetterFunction {
        return (domain, token, params, chobitoneApp) => {
            const authParams = { chobiitUsageSituation, token };
            return KintoneRecordRepository.getAll(domain, authParams, params, chobitoneApp);
        };
    }
    
    /**
     * Kintone から複数レコードを取得する。カレンダービュー用。
     * 
     * ## 使い方
     * 外部公開・ログイン認証ありで使い分けられるようにカリー化している。
     * 以下のように使う：
     * 
     * ```typescript
     * // 外部公開
     * await ListRecordService.listCalendarRecords("public")(domain, token, params, chobitoneApp);
     * 
     * // ログイン認証あり
     * await ListRecordService.listCalendarRecords("private")(domain, token, params, chobitoneApp);
     * ```
     *
     * @param chobiitUsageSituation 
     * @returns 
     */
    static listCalendarRecords(chobiitUsageSituation: ChobiitUsageSituation): RecordsGetterFunction {
        const f: RecordsGetterFunction = async (domain, token, params, chobitoneApp) => {

            const g: RecursiveRecordsGetterFunction = async (domain, token, params, chobitoneApp, offset = 0, acc = []) => {
                const LIMIT = 500 as const;
                const {app, query} = params;
                const restrictedParams = {app, query: `${query} limit ${LIMIT} offset ${offset}`};
                const resp = await this.listRecords(chobiitUsageSituation)(domain, token, restrictedParams, chobitoneApp);
                const nextAcc = acc.concat(resp.records);
                if (resp.records.length === LIMIT) {
                    return g(domain, token, params, chobitoneApp, offset + LIMIT, nextAcc);
                }
                return {
                    records: nextAcc,
                    totalCount: nextAcc.length.toString(),
                };
            };
            
            return g(domain, token, params, chobitoneApp);
        };
        
        return f;
    }
}
