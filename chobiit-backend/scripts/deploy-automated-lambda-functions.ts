/**
 * # ATTENTION
 *
 * よく手を付ける Lambda 関数から順次ビルド・デプロイを自動化するように対応していく。
 */
const DEPLOY_AUTOMATED_LAMBDA_FUNCTION_LIST = [
  "chobiitAddRecord",
  "chobiitCheckExistUser",
  "chobiitConfigDynamo",
  "chobiitCreateDistribution",
  "chobiitCreateForm",
  "chobiitCreateGroup",
  "chobiitCreateUser",
  "chobiitDeleteApp",
  "chobiitDeleteGroup",
  "chobiitDeleteGroups",
  "chobiitDeleteKintoneUser",
  "chobiitDeleteUser",
  "chobiitDeleteUsers",
  "chobiitEditRecord",
  "chobiitGetAppSetting",
  "chobiitGetConfig",
  "chobiitGetConfigUsers",
  "chobiitGetDistributionState",
  "chobiitInvalidateCache",
  "chobiitListRecords",
  "chobiitManageApp",
  "chobiitPublicAddRecord",
  "chobiitPublicListRecords",
  "chobiitSendMail",
  "chobiitStoreError",
  "chobiitSyncData",
  "chobiitUpdateGroup",
  "chobiitUpdateUser",
  "chobiitUploadCustomFile",
  "chobiitUserPut",
  "chobiitSendMailNotice",
  "chobiitListApps",
  "chobiitCheckUserOperateType",
  "chobiitGetAppRights",
  "chobiitPublicGetRecord",
  "chobiitGetRelateRecords",
  "chobiitGetLookupRecords"
];

export default DEPLOY_AUTOMATED_LAMBDA_FUNCTION_LIST;
