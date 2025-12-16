import axios, { AxiosRequestConfig } from "axios";
import request, {Options} from "request";
import type { ChobitoneApp, ChobiitUsageSituation } from "chobiit-common/src/types/chobiit";
import type { KintoneRESTAPI } from "chobiit-common/src/types/kintone";

/**
 * Kintone にアクセスするための認証情報
 */
type AuthenticationParams = {
    
    /**
     * Chobiit の利用シーン。ログイン認証ありと外部公開を区別する。
     * Kintone REST API の認証方法が異なるため。
     * 
     * - ログイン認証あり: OAuth 認証のアクセストークン
     * - 外部公開: API トークン
     */
    chobiitUsageSituation: ChobiitUsageSituation;
    
    /**
     * OAuth access token または API token
     */
    token: string;
};

/**
 * Kintone REST API で複数のレコードを取得するためのパラメータ
 * 
 * 参照：https://cybozu.dev/ja/kintone/docs/rest-api/records/get-records/
 */
type GetRecordsParams = {
    app: string | number;
    query: string;
};

type GetRecordsResponse = {
    records: Record<KintoneRESTAPI.KintoneFieldCode, KintoneRESTAPI.KintoneFieldValue>[];
    totalCount: string;
};

/**
 * Kintone REST API で単一のレコードを取得するためのパラメータ
 * 
 * 参照：https://cybozu.dev/ja/kintone/docs/rest-api/records/get-record/
 */
type GetRecordParams = {
    app: string | number;
    id: string | number;
};

type GetRecordResponse = {
    record: Record<KintoneRESTAPI.KintoneFieldCode, KintoneRESTAPI.KintoneFieldValue>;
};


/**
 * Kintone レコードを REST API 経由で操作するためのリポジトリ
 * 業務ロジックはここでは実施せず、単純なデータの出し入れを行う。
 * 
 * # TODO
 * 本クラスが持つすべてのメソッドに対する包括的なエラーハンドリングを実装したい（カスタムエラークラスの定義と同時に行う）
 */
export default class KintoneRecordRepository {
    /**
     * Kintone から単一レコードを取得する。 
     * 
     * ## 注意
     * バックエンドから、エラーがあっても status code は 200 が返ってくる。
     * レスポンスボディの`code`プロパティが 400 になっていたりする。この挙動は今後修正したい。
     * 
     * @param domain https://example.cybozu.com
     * @param authParams 
     * @param params 
     * @returns 
     */
    static async get(domain: string, authParams: AuthenticationParams, params: GetRecordParams): Promise<GetRecordResponse> {
        const uri = `${domain}/k/v1/record.json`;

        const requestOption: AxiosRequestConfig = {
            headers: this.buildAuthHeaders(authParams),
            params: {
               app: params.app,
               id: params.id,
            },
        };

        const { data } = await axios.get(uri, requestOption);
        return data;
    }
    
    /**
     * Kintone から複数レコードを取得する。 
     * 
     * ## 注意
     * バックエンドから、エラーがあっても status code は 200 が返ってくる。
     * レスポンスボディの`code`プロパティが 400 になっていたりする。この挙動は今後修正したい。
     * 
     * @param domain 
     * @param authParams 
     * @param params 
     * @param chobitoneApp 
     * @returns 
     */
    static getAll(domain: string, authParams: AuthenticationParams, params: GetRecordsParams, {fields}: ChobitoneApp): Promise<GetRecordsResponse> {
        const requestOption: Options = {
            method: "GET",
            uri: `${domain}/k/v1/records.json`,
            headers: this.buildAuthHeaders(authParams),
            json: true,
            body: {
               app: params.app,
               query: params.query,
               totalCount: true,
            }
        };
        
        // FIXME: async/await で書くように統一したい。エラーハンドリングのケア・確認が必要。
        return new Promise((resolve, reject) => {
            console.log('Call Kintone API get records with', JSON.stringify(requestOption, null, 2));
            request(requestOption, (error, _response, body) => {
                if (error) {
                    console.log('KintoneAPI get records error', JSON.stringify(error, null, 2));
                    reject(error);
                } else {
                    if(body.message){
                        reject(body);
                        return;
                    }
                    Object.values(fields).map(data => {
                        if(data.type === "NUMBER" && data.unit !== " " && data.unitPosition !== " ") {
                            body.records.forEach(record => { 
                                if (record[data.code]) {
                                    record[data.code].unit = data.unit
                                    record[data.code].unitPosition = data.unitPosition
                                }
                            })
                        }
                    })
                    console.log('KintoneAPI get records response:', JSON.stringify(body, null, 2));
                    resolve(body);
                }
            });
        });
    }
    
    private static buildAuthHeaders({chobiitUsageSituation, token}: AuthenticationParams): Record<string, string> {
        switch (chobiitUsageSituation) {
            case "private": 
                return { "X-Cybozu-Authorization": token };
            case "public":
                return { "X-Cybozu-API-Token": token };
        }
    }
}
