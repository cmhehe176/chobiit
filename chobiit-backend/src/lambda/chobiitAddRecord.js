const AWS = require('aws-sdk');
const request = require('request');
const docClient = new AWS.DynamoDB.DocumentClient();
const dayjs = require('dayjs');
const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const localeService = LocaleService.getInstance("backend");
const KINTONE_API_ERROR = 1;
const PERMISSION_ERROR = 2;
const INTERNAL_ERROR = 3;

exports.handler = (event, context, callback) => {
    console.log('Starting add record.', JSON.stringify(event, null, 2));
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];
    const appId = event.pathParameters.id;
    const recordData = JSON.parse(event['body']);
    
    if (!recordData) {
        return handleError(new Error(localeService.translate("error", "missing-record-data")), PERMISSION_ERROR, callback);
    }

    const userTableName = 'chobitoneUser';
    const queries = {
        TableName: userTableName,
        Key: {
            'domain': domain,
            'loginName': loginName
        }
    };

    docClient.get(queries, function (err, data) {
        if (err) {
            console.error('Unable to get user info. Error:', JSON.stringify(err, null, 2));
            return handleError(err, INTERNAL_ERROR, callback);
        } else {
            if (!JSON.parse(data.Item.apps).includes(appId))
                return handleError(new Error(localeService.translate("error", "not-permitted")), PERMISSION_ERROR, callback, domain);
            if (data.Item) {
                return addRecordToKintone(recordData, appId, data.Item, callback, domain);
            }
            return handleError(new Error(localeService.translate("error", "invalid-token")), PERMISSION_ERROR, callback);
        }
    });
   

};

async function addRecordToKintone(recordData, appId, userInfo, callback, domain) {
    const kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
    const authorizedToken = userInfo.cybozuToken
    const appSetting = await getAppSetting(domain, appId);
    const chobiitSettingTimes = appSetting.timeCond

    let formattedRecordData = {};
    let subTables = {};
    Object.keys(recordData).forEach(fieldId => {
        const fieldCode = recordData[fieldId].code;
        let fieldValue = recordData[fieldId].value;
        const fieldType = recordData[fieldId].type;
        const reference = recordData[fieldId].reference;

        if(fieldCode === chobiitSettingTimes.createTime || fieldCode === chobiitSettingTimes.editTime){
            fieldValue = currentTime();
        }

        if (reference !== undefined) {
            subTables[reference.code] = subTables[reference.code] || [];
            subTables[reference.code].push(recordData[fieldId]);
        } else {
            formattedRecordData[fieldCode] = {
                type: fieldType,
                value: fieldValue
            };
        }
    });

    // format the SUB_TABLE field if it exists
    if (Object.entries(subTables).length > 0) {
        let formattedSubTables = {};
        console.log('Subtabel: ' +JSON.stringify(subTables,null, 2))
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
        
        Promise.all([
            getAppSetting(userInfo.domain, appId),
            getUserGroups(userInfo.domain, userInfo.loginName)
        ])
        .then(([appSetting, userGroups]) => {
            console.log('appSetting.groupView: ',appSetting.groupView);
             if (appSetting.groupView){
                 formattedRecordData[appSetting.groupView] = {
                     value :  userGroups.join(',')
                 }
             }
             const requestOptions = {
                method: 'POST',
                uri: `${kintoneDomain}/k/v1/record.json`,
                headers: {
                    'X-Cybozu-Authorization': authorizedToken,
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
                    handleError(err,'', callback);
                } else {
                    console.log('KintoneAPI response.', JSON.stringify(response, null, 2));
                    if (body.revision) {
                        handleSuccess(body, callback);
                    } else {
                        handleError(body,'', callback)
                    }
                }
            });    
        })
        .catch(err => handleError(err, callback));
}

function currentTime(){
    const currentTime = dayjs();
    return currentTime.toISOString();
}

async function getAppSetting(domain, appId){
    const appTableName = 'chobitoneApp';
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

async function getUserGroups(domain, loginName){
    const groupTable = 'chobitoneGroup'
    const allGroups = await scanTable({
        TableName: groupTable,
        Key: {
            'domain': domain,
            
        }
    },docClient)

    const userGroups = allGroups.reduce((acc,group) => group.users.includes(loginName) ? [...acc, group.name] : acc,[])
    return userGroups;
}

const scanTable = async (params, dyanmo) => {
    let scanResults = [];
    let items;
    do{
        items =  await dyanmo.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey  = items.LastEvaluatedKey;
    } while(typeof items.LastEvaluatedKey != "undefined");
    return scanResults;
};

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));
    const responseBody = {
        code: 200,
        message: 'Add record succeed',
        result: data
    };

    const response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(err, type, callback) {
    console.log('Handle error:', JSON.stringify(err.message || err, null, 2));
    const body = {
        code: 400,
        message: err.message,
        messageDev: err
    };

    const response = {
        headers: getHeader(),
        body: JSON.stringify(body)
    };
    callback(null, response);
}



function getHeader() {
    const headers = {
        "Access-Control-Allow-Credentials" : "true",
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Cache-Control" : 'no-cache, must-revalidate',
        "Strict-Transport-Security" : 'max-age=63072000; includeSubDomains; preload',
        "X-Content-Type-Options" : 'nosniff',
        "Referrer-Policy" : 'same-origin',
        'Expires' : 	'-1',
        'Pragma' : 'no-cache',
    }
    return headers;
}