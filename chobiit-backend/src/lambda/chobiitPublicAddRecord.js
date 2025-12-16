const AWS = require('aws-sdk');
const request = require('request');
const dayjs = require('dayjs');
const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const localeService = LocaleService.getInstance("backend");
const docClient = new AWS.DynamoDB.DocumentClient();
const appTableName = 'chobitoneApp';
const KINTONE_API_ERROR = 1;
const PERMISSION_ERROR = 2;
const INTERNAL_ERROR = 3;
const AUTH_ERROR = 4;

exports.handler = (event, context, callback) => {
    console.log('Starting add record.', JSON.stringify(event, null, 2));
    const appId = event.params.path.id;
    const domain = event.params.querystring.domain;
    let recordData = event['body-json'];

    let requestOptions = {
        method: 'GET',
        uri: `https://v8jxi69oy4.execute-api.us-east-1.amazonaws.com/dev/status?domain=${domain}`,
        json: true,
    };
    request(requestOptions, (err, response) => {
        if(err){
            return handleError(err, INTERNAL_ERROR, callback)
        }else{
            let status = response.body.status;
            if(status == 'trialStart'){
                let today = new Date();
                let endDate = new Date(response.body.endDate);
                if (today > endDate){
                    return handleError(new Error(localeService.translate("validation", "free-trial-expired")), AUTH_ERROR, callback);
                }
            }
            if (status == 'trialEnd' || status == 'NotActive'){
                return handleError(new Error(localeService.translate("validation", "free-trial-expired")), AUTH_ERROR, callback, domain);
            }else {
                if (!recordData) {
                    return handleError(new Error(localeService.translate("error", "missing-record-data")), KINTONE_API_ERROR, callback);
                }

                const queries = {
                    TableName: appTableName,
                    Key: {
                        'domain' : domain,
                        'app': appId
                    }
                };

                docClient.get(queries, async function (err, data) {
                    if (err) {
                        return handleError(err, INTERNAL_ERROR, callback);
                    } else {
                        console.log('Get app info from DynamoDB succeed.', JSON.stringify(data, null, 2));
                        if (data.Item && (data.Item.auth === false || data.Item.auth === 1) && data.Item.funcCond0.includes('add')) {
                            return await addRecordToKintone(recordData, appId, data.Item, callback);
                        }
                        return handleError(new Error(localeService.translate("error", "not-permitted")), PERMISSION_ERROR, callback, domain);
                    }
                });
            }
        }
    });
};

async function addRecordToKintone(recordData, appId, appInfo, callback) {
    const kintoneDomain = appInfo.domain.indexOf('https') < 0 ? `https://${appInfo.domain}` : appInfo.domain;
    let kintoneAPIToken = appInfo.apiToken0;
    
    if (appInfo.lookupRelateInfo){
        let listApiToken =  [...new Set(appInfo.lookupRelateInfo.map(x => x.relateAppApiToken).filter(x=>x != false))];
        if (listApiToken.length){
             kintoneAPIToken = kintoneAPIToken + ',' + listApiToken.join(',')   
        }
    }
    const appSetting = await getAppSetting(appInfo.domain, appId);
    const chobiitSettingTimes = appSetting.timeCond

    let formattedRecordData = {};
    let subTables = {};
    Object.keys(recordData).forEach(fieldId => {
        const fieldCode = recordData[fieldId].code;
        let fieldValue = recordData[fieldId].value;
        const reference = recordData[fieldId].reference;

        if(fieldCode === chobiitSettingTimes.createTime || fieldCode === chobiitSettingTimes.editTime){
            fieldValue = currentTime();
        }

        if (reference !== undefined) {
            subTables[reference.code] = subTables[reference.code] || [];
            subTables[reference.code].push(recordData[fieldId]);
        } else {
            formattedRecordData[fieldCode] = {
                value: fieldValue
            };
        }
    });

    // format the SUB_TABLE field if it exists
     if (Object.entries(subTables).length > 0) {
        let formattedSubTables = {};
        Object.keys(subTables).forEach(subTableCode => {
            let tableFields = subTables[subTableCode];
            const column =  Array.from(new Set(tableFields.map( x => x.code)));
            let tableValue = [];
            const row = tableFields.length/column.length;
            for (let j = 0; j < row; j++){
                let obj = {
                    value : {}
                }
                column.forEach(function(item){
                    for (let i = 0; i < tableFields.length; i++){
                        let tableField = tableFields[i];
                        if (tableField.code == item){
                            let obj2 = {
                                [item] : {
                                    "value" :tableField.value,
                                    "type" :tableField.type
                                }
                            }
                            Object.assign(obj.value, obj2);
                            tableFields.splice(i,1);
                            break;
                        }
                    }
                });
                tableValue.push(obj);
            }
            formattedSubTables[subTableCode] = {
              value: tableValue
            };
        });
        Object.assign(formattedRecordData, formattedSubTables);
    }

    const requestOptions = {
        method: 'POST',
        uri: `${kintoneDomain}/k/v1/record.json`,
        headers: {
            'X-Cybozu-API-Token': kintoneAPIToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            app: +appId,
            record: formattedRecordData
        },
    };

    console.log('Call kintone API with body: ', JSON.stringify(requestOptions.body, null, 2));
    request(requestOptions, function (err, response, body) {
        if (err) {
            console.log('Call KintoneAPI failed.', JSON.stringify(err, null, 2));
            handleError(err, INTERNAL_ERROR, callback);
        } else {
            console.log('KintoneAPI response.', JSON.stringify(body, null, 2));
            if ((body.code && body.code !== 200) || body.errors) {
                if (body.code == 'GAIA_TO04'){
                    body.message = localeService.translate("error", "server-access-is-full");
                }
                handleError(body, KINTONE_API_ERROR, callback);
            } else {
                handleSuccess(body, callback);
            }
        }
    });
}

function currentTime(){
    const currentTime = dayjs();
    return currentTime.toISOString();
}

async function getAppSetting(domain, appId){
    const queries = {
        TableName: appTableName,
        Key: {
            'domain': domain,
            'app': appId
        }
    };
    const resp = await docClient.get(queries).promise();
    return resp.Item;
}

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));
    const responseBody = {
        code: 200,
        result: data
    };
    const response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };
    callback(null, response);
}

function handleError(err, type, callback) {
    console.log('Handle error:', JSON.stringify(err.message || err, null, 2));
    const body = {
        code: 400,
        message: err.message || err,
        messageDev : err
    };
    const response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };
    callback(null, response);
}

