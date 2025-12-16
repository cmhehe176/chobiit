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

export function datasFormat(datas){

    if (datas[datas.length -1] == ""){
        datas.pop();
    }
    //delete null row
    datas = datas.filter(data => {
        let check = false;
        data.forEach(item => {
            if (item != ""){
                check = true;
                return;
            }
        })
        return check;
    })
    if (!datas.length){
        $.alert({
            title: translateCommon("input-error-title"),
            icon: 'fas fa-exclamation-triangle',
            content: translateError("csv-headers-are-invalid"),
            type: 'red',
            animateFromElement: false,
        });
        return false
    }
    if (datas.length == 1){
        $.alert({
            title: translateCommon("input-error-title"),
            icon: 'fas fa-exclamation-triangle',
            content: translateError("there-is-no-user-record"),
            type: 'red',
            animateFromElement: false,
        });
        return false
    }

    //remove label
    datas.shift();
    return datas
}
