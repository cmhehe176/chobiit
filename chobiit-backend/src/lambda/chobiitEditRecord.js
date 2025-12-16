const AWS = require('aws-sdk');
const request = require('request');
const dayjs = require('dayjs');
const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const localeService = LocaleService.getInstance("backend");
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    console.log('Starting add record.', JSON.stringify(event, null, 2));
    
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];
    
    const appId = event.pathParameters.id;
    const recordId = event.pathParameters.recordId;
    let recordData = JSON.parse(event['body']);
    
    if (!recordData) {
        return handleError(new Error(localeService.translate("error", "missing-record-data")), callback);
    }
    const userTableName = 'chobitoneUser';
    const queries = {
        TableName: userTableName,
        Key: {
            'domain' : domain,
            'loginName': loginName
        }
    };

    docClient.get(queries, function (err, data) {
        if (err) {
            return handleError(err, callback);
        } else {
            if (data.Item) {
                return submitRecordToKintone(recordData, recordId, appId, data.Item, callback);
            }
            return handleError(new Error(localeService.translate("error", "missing-record-data")), callback);
        }
    });
};

function submitRecordToKintone(recordData, recordId, appId, userInfo, callback) {
    const kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
    const authorizedToken = userInfo.cybozuToken
    const requestFieldRightOption = {
        method: 'GET',
        uri: `${kintoneDomain}/k/v1/records/acl/evaluate.json`,
        headers: {
            'X-Cybozu-Authorization': authorizedToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            app: appId,
            ids: [recordId]
        },
    };

    const getFieldRightPromise = new Promise((resolve, reject) => {  
        request(requestFieldRightOption, function (err, response, body) {
            if (err) {
                console.log('Call KintoneAPI get permision failed.', JSON.stringify(err, null, 2));
                reject(err);
            } 
            else {
                console.log('KintoneAPI get permision response.', JSON.stringify(body, null, 2));
                if (body.rights && body.rights.length > 0) {
                    resolve(body.rights[0]);
                } else {
                    reject(new Error(localeService.translate("error", "not-permitted")));
                }
            }
        });
    });

    getFieldRightPromise
        .then(async (right) => {
            if (right.record && right.record.editable === true) {
                let fieldRights = right.fields;
                // delete field data which have not right to edit
                Object.keys(fieldRights).forEach(fieldCode => {
                    if (fieldRights[fieldCode].editable === false) {
                        Object.keys(recordData).forEach(label => {
                            if (recordData[label].code === fieldCode) {
                                delete recordData[label];
                            }
                        });
                    }
                });
                console.log('After filter data', JSON.stringify(recordData, null, 2));

                const appSetting = await getChobiitSetting(userInfo.domain, appId);
                const formattedRecordData = await formatData(recordData, appSetting);
                console.log('After format data', JSON.stringify(formattedRecordData, null, 2));

                const requestOptions = {
                    method: 'PUT',
                    uri: `${kintoneDomain}/k/v1/record.json`,
                    headers: {
                        'X-Cybozu-Authorization': authorizedToken,
                        'Content-Type': 'application/json'
                    },
                    json: true,
                    body: {
                        app: +appId,
                        id: +recordId,
                        revision: null,
                        record: formattedRecordData
                    },
                };
                console.log('Call kintone API with body: ', JSON.stringify(requestOptions.body, null, 2));
                request(requestOptions, function (err, response, body) {
                    if (err) {
                        handleError(err, callback);
                    } else {
                        if (body.errors || (body.code && body.code !== 200)) {
                            handleError(body, callback);
                        } else {
                            handleSuccess(body, callback);
                        }
                    }
                });
            } else {
                throw new Error(localeService.translate("error", "not-permitted"));
            }
        })
        .catch(e => {
            return handleError(e, callback);
        });
}

async function formatData(recordData, appSetting) {
    let formattedRecordData = {};
    let subTables = {};
    const chobiitSettingTimes = appSetting.timeCond

    Object.keys(recordData).forEach(fieldId => {
        const fieldCode = recordData[fieldId].code;
        let fieldValue = recordData[fieldId].value;
        const reference = recordData[fieldId].reference;

        if(fieldCode === chobiitSettingTimes.editTime){
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
    
    // kintoneAPI に レコードの更新リクエストを送れる形式にサブテーブルフィールドのデータを整形する
    if (Object.entries(subTables).length > 0) {
        let formattedSubTables = {};
        Object.keys(subTables).forEach(subTableCode => {
            
            // 同一のサブテーブルに含まれるフィールドの情報を抜き出す
            let tableFields = subTables[subTableCode];

            // サブテーブル1行に含まれる、フィールドのフィールドコードを取得
            const column = Array.from(new Set(tableFields.map( x => x.code)));
            
            let tableValue = [];
            // テーブルの行数を取得
            const row = tableFields.length/column.length;

            // サブテーブルの行数分のデータを取得
            for (let j = 0; j < row; j++){
                let obj = {
                    value : {}
                }
                let tableRowId = null
                // サブテーブルの1行分のデータを取得
                column.forEach(function(item){
                    for (let i = 0; i < tableFields.length; i++){
                        let tableField = tableFields[i];
                        if (tableField.code == item){
                            let obj2 = {
                                [item] : {
                                    "value" :tableField.value,
                                }
                            }
                            Object.assign(obj.value, obj2);
                            // サブテーブル1行分のデータ取得時に、サブテーブルのIDを取得したい
                            // サブテーブルのIDは、ここで取得すると、サブテーブル1行に含まれるフィールドの数だけ代入処処理が発生してしまうが、
                            // ここしか取得するしか無かったので、このような実装になっている
                            tableRowId = tableFields[i].reference.kintoneSubTableRowId
                            // サブテーブルの1行に含まれるフィールドのデータから、取得したものは削除する
                            tableFields.splice(i,1);
                            break;
                        }
                    }
                });
                // 新規で追加したサブテーブルの行には、行IDが存在しないため、tableRowIdに null が代入されるケースと
                // chobiit-177の改修以前は、サブテーブルの行には行IDが存在しないため、tableRowIdに undefined が代入されるケースがある
                if(tableRowId !== null && tableRowId !== undefined){
                    obj.id = tableRowId;
                }
                // サブテーブルを1行ずつ追加
                tableValue.push(obj);
            }
            // サブテーブル毎に、データを追加
            formattedSubTables[subTableCode] = {
              value: tableValue
            };
        });
        // 最後にサブテーブルのデータを、Kintone api へ渡すデータに追加
        Object.assign(formattedRecordData, formattedSubTables);
    }
    return formattedRecordData;
}


function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));
    const responseBody = {
        code: 200,
        message: 'Edit record succeed',
        result: data
    };
    const response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };
    callback(null, response);
}

function handleError(error, callback){
    console.log('Handle error:', JSON.stringify(error.message || error, null, 2));
    let responseBody = {
       code: 400,
        message: error.message,
        messageDev: error
    };
    const response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
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
        'Expires' : '-1',
        'Pragma' : 'no-cache',
    }
    return headers;
}

function currentTime(){
    const currentTime = dayjs();
    return currentTime.toISOString();
}

async function getChobiitSetting(domain, appId){
    const chobiitAppTableName = 'chobitoneApp';
    const queries = {
        TableName: chobiitAppTableName,
        Key: {
            'domain': domain,
            'app': appId
        }
    };
    const resp = await docClient.get(queries).promise();
    return resp.Item;
}
