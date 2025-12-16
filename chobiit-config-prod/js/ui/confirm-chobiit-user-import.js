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



/**
 * chobiitのユーザーデータのインポート処理の確認画面を表示する。
 * 
 * @param {*} isSendInvitationEmail 
 * @returns 
 */
export async function confirmChobiitUserImport(isSendInvitationEmail) {
    const $ = jQuery
    return new Promise((resolve) => {
        $.confirm({
            animateFromElement: false,

            columnClass: 'col-md-8',
            title: translateInfo("user-setting.import-users.modal-title-final-confirmation"),
            content: `
                <p style="font-size: 18px; font-weight: bold; margin: 30px 0px;">${translateInfo("user-setting.import-users.confirmation-of-invitation-email-sent")}: <span style="color: red; font-weight: bold;">${isSendInvitationEmail === "yes" ? translateInfo("user-setting.import-users.send-message") : translateInfo("user-setting.import-users.do-not-send-message")}</span></p>
                <p style="font-size: 18px; font-weight: bold; margin: 30px 0px;">${translateInfo("user-setting.import-users.confirmation-message")}</p>
                <p style="font-size: 12px;" >※${translateInfo("user-setting.import-users.automatic-sending-of-invitation-emails-message")}</p>
                <p style="font-size: 12px;" >※${translateInfo("user-setting.import-users.incomplete-file-message")}</p>
                    `,
            buttons: {
                formSubmit: {
                    text: translateCommon("import"),
                    btnClass: 'btn-info chobiit-user-import',
                    action: function () {
                        resolve(true);
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                        resolve(false);
                    }
                },
            }
        })
    })
}
