/**
 * https://cybozu.dev/ja/common/docs/user-api/organizations/
 * cybozu.com共通管理の User API の組織情報を操作する API を扱う
 */

import axios, { AxiosRequestConfig } from "axios";
import type { CybozuUserAPI } from "chobiit-common/src/types/cybozu";


type AuthenticationParams = {
    
    /**
     * `id:password`をbase64エンコードしたもの
     */
    token: string;
};

type GetOrganizationsResponse = {
    organizations: CybozuUserAPI.Organization[];
};

export default class CybozuOrganizationRepository {
    /**
     * Cybozu.com共通管理からすべての組織情報を取得する。 

     * @param domain 
     * @param authParams
     * @param got 再帰処理用。外部からは指定しない。
     * @param offset 再帰処理用。外部からは指定しない。
     * @returns 
     */
    static async getAll(domain: string, authParams: AuthenticationParams, got: CybozuUserAPI.Organization[]| [] = [], offset: number = 0): Promise<GetOrganizationsResponse> {
        console.info("CybozuOrganizationRepository.getAll")

        const uri = `${domain}/v1/organizations.json`;
        const requestOption: AxiosRequestConfig = {
            headers: { "X-Cybozu-Authorization": authParams.token },
            params: {
                size: 100,
                offset: offset,
            },
        };

        const { data } = await axios.get(uri, requestOption);
        const concated = got.concat(data.organizations);

        if(data.organizations.length === 100){
            return this.getAll(domain, authParams, concated, offset + data.organizations.length);
        }

        return {organizations: concated};
    }
}
