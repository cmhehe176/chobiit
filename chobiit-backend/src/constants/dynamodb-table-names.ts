/**
 * # TODO
 * chobiit-backend/src/infrastructure/aws-dynamodb-repository.ts に移行したい。
 */

/**
 * # FIXME
 * 可能ならば、テーブル名も統合したい。
 */
export const KINTONE_USER_TABLE_NAME = (() => {
    if (process.env.SYSTEM_ENV === "prod" && process.env.CHOBIIT_LANG === "ja") {
        return "chobiitKintoneUser";
    } else {
        return "chobitoneKintoneUser";
    }
})();

export const APP_TABLE_NAME = "chobitoneApp"
export const USER_TABLE_NAME = "chobitoneUser"
export const COMMENT_TABLE_NAME = "chobiitComment"
export const DELETED_USER_TABLE = "ChobiitDeletedUsers"

export type TableName = typeof KINTONE_USER_TABLE_NAME | typeof APP_TABLE_NAME | typeof USER_TABLE_NAME | typeof COMMENT_TABLE_NAME | typeof DELETED_USER_TABLE;

