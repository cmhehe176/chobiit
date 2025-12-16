window._config = {
  apiUrl: `${process.env.CHOBIIT_BACKEND_BASE_URL}/chobitone`
};
Object.assign(window._config, {
  api: {
    login:window._config.apiUrl + "/login",
    getShowText:window._config.apiUrl + "/show-text",
    getApps:window._config.apiUrl + "/apps",
    getRecords:window._config.apiUrl + "/app/{appId}/records",
    userInfo:window._config.apiUrl + "/user-info",
    getAppRights:window._config.apiUrl + "/app/{appId}/rights",
    getAppSetting:window._config.apiUrl + "/app/{appId}",
    getLookupRecords:window._config.apiUrl + "/app/{appId}/lookup",
    addRecord:window._config.apiUrl + "/app/{appId}/record",
    getRecord:window._config.apiUrl + "/app/{appId}/record/{id}",
    removeRecord:window._config.apiUrl + "/app/{appId}/record/{id}/delete",
    editRecord:window._config.apiUrl + "/app/{appId}/record/{id}",
    getComment:window._config.apiUrl + "/app/{appId}/record/{id}/comment",
    addComment:window._config.apiUrl + "/app/{appId}/record/{id}/comment",
    getRelateRecords:window._config.apiUrl + "/app/{appId}/record/{id}/relate-records",
    deleteComment:window._config.apiUrl + "/app/{appId}/record/{id}/comment/{commentId}/delete",
    getColor:window._config.apiUrl + "/app/{appId}/color",
    getThanksPage:window._config.apiUrl + "/app/{appId}/thankspage",  
    getFormUrl:window._config.apiUrl + "/app/{appId}/getformurl",
    uploadFile:window._config.apiUrl + "/upload",
    downloadFile:window._config.apiUrl + "/download",
    showText:window._config.apiUrl + "/showtext", //5 update
    publicGetRecords:window._config.apiUrl + "/public/app/{appId}/records",
    publicGetAppRights:window._config.apiUrl + "/public/app/{appId}/rights",
    publicUploadFile:window._config.apiUrl + "/public/app/{appId}/upload",
    publicDownloadFile:window._config.apiUrl + "/public/app/{appId}/download",
    publicGetLookupRecords : window._config.apiUrl + "/public/app/{appId}/lookup",  // 10 update
    publicAddRecord:window._config.apiUrl + "/public/app/{appId}/record",
    publicGetRecord:window._config.apiUrl + "/public/app/{appId}/record/{id}",
    publicGetRelateRecords:window._config.apiUrl + "/public/app/{appId}/record/{id}/relate-records",
    putCount: window._config.apiUrl + '/count',
    sendMailAlert: `${process.env.NOVELWORKS_EMAIL_API_BASE_URL}/mail-alert`,
    storeErr : `${process.env.CHOBIIT_BACKEND_BASE_URL}/error`,
    existUser :  window._config.apiUrl + "/exist-user",//5update
    existSlot : window._config.apiUrl + "/exist-slot",//5update
    register : window._config.apiUrl + "/register",//5update
    resetPassword :window._config.apiUrl + "/reset-password",//5update
    resendConfirmationCode: window._config.apiUrl + "/confirm-code",//5update
    sendMail : `${process.env.CHOBIIT_BACKEND_BASE_URL}/mail`, // 5 update
    stepExecution : window._config.apiUrl +"/step-execution", // 6 update
    publicStepExecution : window._config.apiUrl +"/public/step-execution" // 6 update
  },
  cognito  : { //5 update
    UserPoolId : process.env.COGNITO_USER_POOL_ID,
    ClientId : process.env.COGNITO_CLIENT_ID,
  },
  stateMachineArn : `arn:aws:states:${process.env.CHOBIIT_AWS_REGION}:${process.env.CHOBIIT_AWS_ACCOUNT_ID}:stateMachine:`
});
