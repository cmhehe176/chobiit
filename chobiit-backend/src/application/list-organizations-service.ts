import CybozuOrganizationRepository from "../infrastructure/cybozu-organization-repository";
import type { CybozuUserAPI } from "chobiit-common/src/types/cybozu";
import kintoneErrorMessageConverter from "../application/kintone-error-message-converter";

type OrganizationWithChildren = {
    code: string;
    listChild: string[];
}

export default class ListOrganizationsService {

    static async listOrganizations(subdomain: string, cybozuToken: string): Promise<CybozuUserAPI.Organization[]> {

        try {
            const kintoneDomain = subdomain.indexOf('https') < 0 ? `https://${subdomain}` : subdomain;
            const {organizations} = await CybozuOrganizationRepository.getAll(kintoneDomain, {token: cybozuToken});
            console.log('KintoneAPI organizations resp.', JSON.stringify(organizations, null, 2));
    
            return organizations;

        } catch (error) {
            console.error("Error Occurred in getOrganizations: ", error)
            const message = kintoneErrorMessageConverter.toArranged(error);
            throw new Error(message);
        }
    }
      
    /**
     * 各組織の子孫組織のコードを含むオブジェクトの配列を生成する
     */
    static async getOrganizationWithChildren(userInfo): Promise<OrganizationWithChildren[]> {
        console.debug("Start buildOrganizationWithChildren")
        const organizations = await this.listOrganizations(userInfo.domain, userInfo.cybozuToken);
        return this.buildOrganizationWithChildren(organizations)
    }

    static buildOrganizationWithChildren(organizations: CybozuUserAPI.Organization[]): OrganizationWithChildren[] {
        console.debug("Start convertOrganizationWithChildren")
        return organizations.map(x => {
            const chhildrenCodeList = organizations.filter(y => y.parentCode == x.code).map(z => z.code);

            return {
                code: x.code,
                listChild: chhildrenCodeList
            }
        })
    }
}