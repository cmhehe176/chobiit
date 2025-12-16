const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();
const appTableName = 'chobitoneApp';

exports.handler = (event, context, callback) => {
    console.log('Starting get form url', JSON.stringify(event, null, 2));
    const appId = event.params.path.id;
    const domain = event.params.querystring.domain;

    const queries = {
        TableName: appTableName,
        Key: {
            'domain': domain,
            'app': appId
        }
    };
    
    docClient.get(queries, function (err, data) {
        if (err) {
            console.error('Unable to get app info from DynamoDB. Error:', JSON.stringify(err, null, 2));
            handleError(err, callback);
        } else {
            console.log('Get app info from DynamoDB succeed.', JSON.stringify(data));
            
                let dataInfo = {
                    formUrl : data.Item.formUrl,
                    creator : data.Item.creator,
                    editor : data.Item.editor,
                    location : data.Item.locateCond,
                    time : data.Item.timeCond,
                    action : data.Item.actionCond,
                    actions: data.Item.actionCondList,
                    ownerView : data.Item.ownerView,
                    fields : data.Item.fields,
                    relateFieldsInfo : data.Item.relateFieldsInfo,
                    lookupRelateInfo : data.Item.lookupRelateInfo,
                    thanksPage : data.Item.thanksPage,
                    templateColor : data.Item.templateColor,
                    showText : data.Item.showText,
                    showComment : data.Item.showComment,
                    fieldRights : data.Item.fieldRights,
                    funcCond0 : data.Item.funcCond0,
                    saveButtonName: data.Item.saveButtonName,
                    appLinkTo : data.Item.appLinkTo,
                    robotoCheck: data.Item.robotoCheck,
                    jsCustom: data.Item.jsCustom,
                    cssCustom: data.Item.cssCustom,
                    autoSendMail : data.Item.autoSendMail,
                    responseControl: data.Item.responseControl,
                    tempSaving : data.Item.tempSaving,
                    groupView : data.Item.groupView,
                    statusInfo : data.Item.statusInfo
                }

                /**
                 * プラグイン設定画面で設定されていない時、viewsはundefinedになる
                 */
                const isExistItemViews = data.Item.views !== undefined 
                if (isExistItemViews) {
                    dataInfo.views = data.Item.views;
                }
                
                handleSuccess(dataInfo, callback);
        }
    });

};

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));
    let responseBody = {
        code: 200,
        data: data
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };
    callback(null, response);
            
}

function handleError(error, callback) {
    console.log('Handle error:', JSON.stringify(error, null, 2));
    let responseBody = {
        code: 400,
        error : error
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}