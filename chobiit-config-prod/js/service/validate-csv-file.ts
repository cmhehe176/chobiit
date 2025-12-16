import { getDuplicate } from './get-duplicate';
import { getAllIndexes } from './get-all-indexes';
import { isAlphanumeric } from './is-alphanumeric';
import { isHalfWidthSymbol } from './is-half-width-symbol';
import { AllConfigData } from 'chobiit-common/src/types/chobiit';

const LocaleService = require('chobiit-common/src/application/locale-service').default;
const localeService = LocaleService.getInstance("config");

const $ = jQuery;

const translateCommon = (key: string, option?: Record<string, any>): string => localeService.translate("common", key, option);
const translateError = (key: string, option?: Record<string, any>): string => localeService.translate("error", key, option);

type ErrorInfo = {
    title: string;
    icon: string;
    content: string;
    type: string;
    animateFromElement: boolean;
}

type ValidationCsvResult = {
    passed: boolean;
    errorInfo?: ErrorInfo;
}

export function validateCsvFile(
    formattedCsvArray: string[][],
    allConfigData: AllConfigData,
    loginNameRegex: RegExp,
    maxNumberOfUsers: number
): ValidationCsvResult {    
    const loginNameArr: string[] = formattedCsvArray.map(x => x[0]); // check duplicate
    const duplicateLoginNames: string[] = getDuplicate(loginNameArr);

    const registeredLoginNameList: string[] = allConfigData.data.users.map((user: any) => user.loginName);

    const removedDuplicationLoginNameList = formattedCsvArray.filter(data => {
        const inputLoginName = data[0];
        return !registeredLoginNameList.includes(inputLoginName);
    });

    // check max user
    const kintoneLoginNameArr: string[] = removedDuplicationLoginNameList.map(x => x[1])
        .concat(allConfigData.data.users.map((x: any) => x.kintoneLoginName));

    for (let i = 0; i < kintoneLoginNameArr.length; i++) {
        if (getAllIndexes(kintoneLoginNameArr, kintoneLoginNameArr[i]) > maxNumberOfUsers) {
            return {
                passed: false,
                errorInfo: {
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("the-number-of-chobiit-users-has-exceeded", { kintoneLoginName: kintoneLoginNameArr[i] }),
                    type: 'red',
                    animateFromElement: false,
                }
            };
        }
    }

    const allConfigKintoneLoginName: string[] = allConfigData.data.kintoneUsers.map((x: any) => x.kintoneLoginName);

    for (let i = 0; i < formattedCsvArray.length; i++) {
        const loginName = formattedCsvArray[i][0];
        const kintoneLoginName = formattedCsvArray[i][1];
        const name = formattedCsvArray[i][2];
        const mailAddress = formattedCsvArray[i][3];
        const apps = formattedCsvArray[i][4];
        const isAdmin: string | number = formattedCsvArray[i][5] || "";
        const password = formattedCsvArray[i][6];

        if (!loginName || !kintoneLoginName || !name || !mailAddress || !apps) {
            return {
                passed: false,
                errorInfo: {
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("there-are-some-empty-attributes-in-a-line", { lineNumber: i + 1 }),
                    type: 'red',
                    animateFromElement: false,
                }
            };
        }

        if (!loginNameRegex.test(loginName)) {
            return {
                passed: false,
                errorInfo: {
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("login-name-cannot-have-spaces-in-a-line", { lineNumber: i + 1 }),
                    type: 'red',
                    animateFromElement: false,
                }
            };;
        }

        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(String(mailAddress).toLowerCase())) {
            return {
                passed: false,
                errorInfo: {
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("email-address-is-invalid-in-a-line", { lineNumber: i + 1 }),
                    type: 'red',
                    animateFromElement: false,
                }
            };
        }

        /**
         * # 注意
         * `loginName`のバリデーションで、日本版とUS版で差異がある。
         */
        if (process.env.CHOBIIT_LANG === "ja") {
            if (loginName.length > 128) {
                return {
                    passed: false,
                    errorInfo: {
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("chobiit-user-login-name-too-long-in-a-line", { lineNumber: i + 1 }),
                        type: 'red',
                        animateFromElement: false,
                    }
                };;
            }
        }
        if (process.env.CHOBIIT_LANG === "en") {
            if (!isHalfWidthSymbol(loginName) || loginName.length < 3 || loginName.length > 64) {
                return {
                    passed: false,
                    errorInfo: {
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("chobiit-user-login-name-too-long-in-a-line", { lineNumber: i + 1 }),
                        type: 'red',
                        animateFromElement: false,
                    }
                };;
            }
        }

        // isAdminはstring型とnumber型の二つの型を取り得る
        // 出来れば一つの型で済むように改善した
        if (typeof isAdmin === 'number') {
            if (isAdmin !== 1) {
                return {
                    passed: false,
                    errorInfo: {
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("administrator-is-invalid-in-a-line", { lineNumber: i + 1 }),
                        type: 'red',
                        animateFromElement: false,
                    }
                };
            }
        } else if (typeof isAdmin === 'string') {
            if (isAdmin !== "") {
                return {
                    passed: false,
                    errorInfo: {
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("administrator-is-invalid-in-a-line", { lineNumber: i + 1 }),
                        type: 'red',
                        animateFromElement: false,
                    }
                };
            }
        }


        const arrApps = apps.split(',');
        const appCheck = arrApps.every(element => element && !isNaN(Number(element)));
        if (!appCheck) {
            return {
                passed: false,
                errorInfo: {
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("app-id-is-invalid-in-a-line", { lineNumber: i + 1 }),
                    type: 'red',
                    animateFromElement: false,
                }
            };;
        }

        if (duplicateLoginNames.includes(loginName)) {
            return {
                passed: false,
                errorInfo: {
                    title: translateCommon("input-duplication-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("chobiit-login-name-is-duplicated-in-a-line", { lineNumber: i + 1 }),
                    type: 'red',
                    animateFromElement: false,
                }
            };;
        }

        /**
         * # 注意
         * `password`のバリデーションで、日本版とUS版で差異がある。
         */
        if (process.env.CHOBIIT_LANG === "ja") {
            if (!isAlphanumeric(password) || password.length > 50) {
                return {
                    passed: false,
                    errorInfo: {
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("chobiit-user-password-is-invalid-format", { lineNumber: i + 1 }),
                        type: 'red',
                        animateFromElement: false,
                    }
                };;
            }
        }
        if (process.env.CHOBIIT_LANG === "en") {
            if (password.length > 50) {
                return {
                    passed: false,
                    errorInfo: {
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("chobiit-user-password-is-invalid-format", { lineNumber: i + 1 }),
                        type: 'red',
                        animateFromElement: false,
                    }
                };;
            }
        }

        if (!allConfigKintoneLoginName.includes(kintoneLoginName)) {
            return {
                passed: false,
                errorInfo: {
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("this-kintone-account-does-not-exist-in-a-line", { lineNumber: i + 1 }),
                    type: 'red',
                    animateFromElement: false,
                }
            };;
        }

        let listAppConfigAuth: string[] = [];
        allConfigData.data.apps.forEach((x: any) => {
            if (x.auth) {
                listAppConfigAuth.push(x.app);
            }
        });

        for (let j = 0; j < arrApps.length; j++) {
            if (!listAppConfigAuth.includes(arrApps[j])) {
                return {
                    passed: false,
                    errorInfo: {
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("this-app-id-does-not-exist-in-a-line", { lineNumber: i + 1 }),
                        type: 'red',
                        animateFromElement: false,
                    }
                };;
            }
        }
    }

    return {
        passed: true,
    }
}
