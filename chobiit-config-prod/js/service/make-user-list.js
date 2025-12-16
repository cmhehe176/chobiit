import { checkUserOperateType } from "./check-user-operate-type"
import { ProgressMeterPopup } from "../ui/progress-meter-popup"

const LocaleService = require('chobiit-common/src/application/locale-service').default;
const localeService = LocaleService.getInstance("config");

/**
 * 
 * @param {string} key 
 * @param {Record<string, any> | undefined} option 
 * @returns {string}
 */
const translateInfo = (key, option) => localeService.translate("info", key, option);

/**
 * 
 * @param {string} key 
 * @param {Record<string, any> | undefined} option 
 * @returns {string}
 */
const translateCommon = (key, option) => localeService.translate("common", key, option);

/**
 * 
 * @param {string} key 
 * @param {Record<string, any> | undefined} option 
 * @returns {string}
 */
const translateError = (key, option) => localeService.translate("error", key, option);

const $ = jQuery


export async function makeUserList(datas, domain,configApi){
    try {
        const csvImportCheckProgressMeterPopup = new ProgressMeterPopup("CSV_IMPORT_PROCESSING", datas.length)
        await csvImportCheckProgressMeterPopup.initialize()
        
        const updateUserList = []
        const createUserList = []

        for (let i = 0; i < datas.length; i ++){
            let loginName = datas[i][0];
            let password = datas[i][6];

            const checkedUserOperateType = await checkUserOperateType(loginName,domain, configApi)
            switch(checkedUserOperateType){
                case 'update':
                    updateUserList.push(datas[i])
                    break;
                case 'create':
                    if(!password){
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("there-are-empty-password-in-a-line", {lineNumber: i+1}),
                            type: 'red',
                            animateFromElement: false,
                        });
                        csvImportCheckProgressMeterPopup.close()
                        return false
                    }
                    createUserList.push(datas[i])
                    break;
                case 'none':
                    $.alert({
                        title: translateCommon("input-duplication-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("chobiit-login-name-has-already-been-used", {lineNumber: i+1}),
                        type: 'red',
                        animateFromElement: false,
                    });
                    csvImportCheckProgressMeterPopup.close()
                    return false
                default:
                    console.error('invalid user operate type')
                    csvImportCheckProgressMeterPopup.close()
                    return false
            }

            const completedNum = i+1
            csvImportCheckProgressMeterPopup.setProgressPercentage(completedNum)
        }

        csvImportCheckProgressMeterPopup.close()
        return {updateUserList:updateUserList, createUserList:createUserList}

    } catch (error) {
        console.log(error);
    }
}
