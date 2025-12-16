const AWS = require('aws-sdk');
const request = require('request');

const { extractFieldPublicRecord } = require("../application/extract-field-from-record")
const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const localeService = LocaleService.getInstance("backend");

const docClient = new AWS.DynamoDB.DocumentClient();

const appTableName = 'chobitoneApp';
const KINTONE_API_ERROR = 1;
const PERMISSION_ERROR = 2;
const INTERNAL_ERROR = 3;

exports.handler = (event, context, callback) => {
    console.log('Starting add record.', JSON.stringify(event, null, 2));
    const appId = event.params.path.id;
    const recordId = event.params.path.recordId;
    const domain = event.params.querystring.domain;
    
    const queries = {
        TableName: appTableName,
        Key: {
            'domain' : domain,
            'app': appId
        }
    };

    docClient.get(queries, function (err, data) {
        if (err) {
            console.error('Unable to get app info. Error:', JSON.stringify(err, null, 2));
            return handleError(err, INTERNAL_ERROR, callback);
        } else {
            if (data.Item && ( data.Item.auth === false ||  data.Item.auth === 1) && data.Item.funcCond0.includes('view')) {
                return getRecord(appId, recordId, data.Item, callback);
            }

            return handleError(new Error('You do not have permission to access this app.'), PERMISSION_ERROR, callback);
        }
    });
};

function getRecord(appId, recordId, appInfo, callback) {
    let kintoneDomain = appInfo.domain.indexOf('https') < 0 ? `https://${appInfo.domain}` : appInfo.domain;
    let kintoneAPIToken = appInfo.apiToken0;
    
    const requestOptions = {
        method: 'GET',
        uri: `${kintoneDomain}/k/v1/record.json`,
        headers: {
            'X-Cybozu-API-Token': kintoneAPIToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            app: +appId,
            id: +recordId
        },
    };

    console.log('Call KintoneAPI with body: ', JSON.stringify(requestOptions.body, null, 2));
    request(requestOptions, function (err, response, body) {
        if (err) {
            console.log('Call KintoneAPI failed.', JSON.stringify(err, null, 2));
            handleError(err, INTERNAL_ERROR, callback);
        } else {
            console.log('KintoneAPI response.', JSON.stringify(body, null, 2));
            if (body.record) {
                let record = body.record;

                // remove api token before response to client
                delete appInfo['apiToken0'];
                handleSuccess({
                    appInfo: appInfo,
                    record: extractFieldPublicRecord(record, appInfo.actionCond0, appInfo.actionCondList, appInfo.fieldCond0 )
                }, callback);
            } else {
                handleError(body, KINTONE_API_ERROR, callback);
            }
        }
    });
}

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));
    let responseBody = {
        code: 200,
        record: data.record,
        appInfo: data.appInfo
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(err, type, callback) {
    console.log('Handle error:', JSON.stringify(err.message || err, null, 2));
    let message;
    switch (type) {
        case KINTONE_API_ERROR:
            message = err.message || localeService.translate("error", "not-permitted")
            break;
        case PERMISSION_ERROR:
            message = localeService.translate("error", "not-permitted")
            break;
        case INTERNAL_ERROR:
        default:
            message = 'Get record failed.';
            break;
    }

    let body = {
        code: 400,
        message: message,
        messageDev: err.message
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };

    callback(null, response);
}

