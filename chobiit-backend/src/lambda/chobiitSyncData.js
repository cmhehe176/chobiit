
//DynamoDB
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({
  
});
const chobiitAppTable = 'chobitoneApp';
const request = require('request');

exports.handler = async (event, context, callback) => {
   console.log(JSON.stringify(event, null, 2))
 
    const body = event['body-json'];
    
    if (body.type != 'ADD_RECORD' && body.type != 'UPDATE_RECORD'){
        return {
            statusCode: 200,
            body: JSON.stringify('not support'),
        }
    }
   
    const domain = extractHostname(body.url)
    const chobitoneApps = await getAllAppConfigs(domain);

    const appFromId = body.app.id;
    const record = body.record;
    const targetChobitoneApps = chobitoneApps.filter(isTargetChobitoneApp(appFromId));
    
    if (targetChobitoneApps.length > 0) {

        let getRecordProccess = targetChobitoneApps.flatMap((chobitoneApp) => {
            
            const webhookSync = getWebhookSyncSetting(chobitoneApp, appFromId);
            
            return !!webhookSync ? [getSyncRecord(domain, record, chobitoneApp.app, webhookSync)] : [];
        });

        // update data
        await Promise.all(getRecordProccess).then(async (appData) => {
            let updateProcess = appData.filter(filterData => filterData.data && filterData.data.records.length > 0).map(async (appItem) => {
                let recordIdList = appItem.data.records.map(itemRecord => itemRecord['$id']['value']);
                let fields  = await getFormFields(domain,  appItem.appId, appItem.syncInfo)
                let updateBody = formatDataForUpdate(recordIdList, appItem.appId, appItem.syncInfo, record, fields);
                await updateData(domain, appItem.syncInfo.apiToken, updateBody);
            });
            
            await Promise.all(updateProcess).then((response) => {
                callback(null, 'SyncDataSuccess');
            }).catch(err =>{
                console.error('ErrorUpdateData',  JSON.stringify(err, null, 2))
                callback(null, 'ErrorUpdateData');
            });
        
        }).catch(error => {
            console.error('ErrorGetData', error.message)
            callback(null, 'ErrorGetData');
        });
    } else {
        callback(null);
    }
};

function formatDataForUpdate (recordIdList, appId, syncInfo, fromRecord, fields) {
    let data = {};
    data['app'] = appId;
    let records = recordIdList.map(recordId => {
        let valueUpdate = {};
        
        syncInfo.updateFields.forEach(item => {
            if (fromRecord[item.updateFrom] && fromRecord[item.updateFrom].value){
                let fromValue  =fromRecord[item.updateFrom].value;
               
                switch (item.updateToType) {
                    case 'RADIO_BUTTON':
                    case 'DROP_DOWN' : 
                        
                        let radioOpt = Object.keys(fields[item.updateTo].options);
                        if (radioOpt.includes(fromValue)){
                            valueUpdate[item.updateTo] = {
                                value : fromValue
                            }
                        }
                        break;
                    
                    case 'CHECK_BOX': 
                    case 'MULTI_SELECT': 
                        let cBoxOpt =  Object.keys(fields[item.updateTo].options);
                        if (fromValue.every(it => cBoxOpt.includes(it))){
                            valueUpdate[item.updateTo] = {
                                value : fromValue
                            }
                        }
                        break;
                    case 'USER_SELECT' :
                        if (item.updateFromType == 'CREATOR' || item.updateFromType == 'MODIFIER'){
                            valueUpdate[item.updateTo] = {
                                value : [fromValue]
                            }
                            
                        }else{
                            valueUpdate[item.updateTo] = {
                                value : fromValue
                            }    
                        }
                        break;
                    default:
                        valueUpdate[item.updateTo] = {
                            value : fromValue
                        }
                }
           
            }
        });
        return {
            'id' : recordId,
            'record' : valueUpdate   
        }
    });
    
    data['records'] = records;
    return data;
}

function updateData (domain, apiToken, updateBody) {
    console.log('updateBody', JSON.stringify(updateBody, null, 2));
    let kintoneDomain = domain.indexOf('https') < 0 ? `https://${domain}` : domain;
     
    let requestUpdate = 
    {   method: 'PUT',
        uri: `${kintoneDomain}/k/v1/records.json`,
        headers: {
            'X-Cybozu-API-Token': apiToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: updateBody
    };

    return new Promise((resolve, reject) => {  
        request(requestUpdate, function (err, response, body) {
            if (err) {
                console.log('KintoneAPI update records error', JSON.stringify(err, null, 2));
                reject(err);
            } 
            else {
                console.log('KintoneAPI update records ok', JSON.stringify(body, null, 2));
                if (body.errors || (body.code && body.code !== 200)) {
                    reject(body.errors);
                } else {
                    resolve(JSON.stringify(body, null, 2));
                }
            }
        });
    });
}

function getFormFields(domain, appId, webhookSync){
     let kintoneDomain = domain.indexOf('https') < 0 ? `https://${domain}` : domain;
     let apiToken = webhookSync.apiToken;
      let body = {   
        method: 'GET',
        uri: `${kintoneDomain}/k/v1/app/form/fields.json`,
        headers: {
            'X-Cybozu-API-Token': apiToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            app: appId
           
        }
    };
    console.log('body', body);
    console.log('webhookSync', webhookSync);
    
    return new Promise((resolve, reject) => {
        request(body, function (err, response, body) {
            if (err) {
                console.log('Error', JSON.stringify(err, null, 2));
                reject(err);
            } 
            else {
                console.log('Success', JSON.stringify(body, null, 2));
                resolve(body.properties);
            }
        });
    });
}

function getSyncRecord (domain, record, appId, webhookSync) {
    let kintoneDomain = domain.indexOf('https') < 0 ? `https://${domain}` : domain;
    // let apiId = +webhookSync.appId;
    let apiToken = webhookSync.apiToken;
    
    let query = "";
    if (webhookSync.toKeyType == "NUMBER" || webhookSync.toKeyType == "RECORD_NUMBER") {
        query = webhookSync.toKey + "=" + record[webhookSync.fromKey].value;
    }
    else {
        query = webhookSync.toKey +'="' + record[webhookSync.fromKey].value + '"';
        
    }
    
    
    
  
    let body = {   
        method: 'GET',
        uri: `${kintoneDomain}/k/v1/records.json`,
        headers: {
            'X-Cybozu-API-Token': apiToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            app: appId,
            query: query
        }
    };
    console.log('body', body);
    console.log('webhookSync', webhookSync);
    
    return new Promise((resolve, reject) => {
        
        if (record[webhookSync.fromKey].value == ''){
            console.log('not data')
            resolve({
                syncInfo: webhookSync,
                data: {
                    records : []
                },
                appId: appId
            });
        }else{
            request(body, function (err, response, body) {
                if (err) {
                    console.log('Error', JSON.stringify(err, null, 2));
                    reject(err);
                } 
                else {
                    console.log('Success', JSON.stringify(body, null, 2));
                    resolve({
                        syncInfo: webhookSync,
                        data: body,
                        appId: appId
                    });
                }
            });
        }
    });
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

/**
 * 対象ドメインの全てのアプリ設定を取得する。
 * @param {string} domain 
 */
async function getAllAppConfigs(domain) {
    const f = async (domain, acc = [], exclusiveStartKey = null) => {
        console.log(`Getting now... counts=${acc.length}`);
        const params = {
            TableName: chobiitAppTable, 
            KeyConditionExpression: "#domain = :domain",
            ExpressionAttributeNames: {
                "#domain" : "domain",
            },
            ExpressionAttributeValues: {
                ":domain": domain
            },
            ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
        };
        
        const result = await docClient.query(params).promise();
        
        const nextAcc = acc.concat(result.Items);
        
        if (result.LastEvaluatedKey) {
            return f(domain, nextAcc, result.LastEvaluatedKey);        
        } else {
            return nextAcc;
        }
    };
    
    return f(domain);
}

function isTargetChobitoneApp(webhookSentAppId) {
    return (chobitoneApp) => {
        if (chobitoneApp.actionCond) {
            return !!chobitoneApp.actionCond && !!chobitoneApp.webhookSync && chobitoneApp.actionCond.actionApp === webhookSentAppId;
        }
        
        if (chobitoneApp.actionCondList && Array.isArray(chobitoneApp.actionCondList)) {
            return !!chobitoneApp.actionCondList.find((action) => action.webhookSync && action.actionApp === webhookSentAppId);
        }
        

        return false
    };
}

/**
 * # 注意
 * 
 * 当初、アクションはアプリ1つにつき1つだけ設定できていた。
 * しかし、US 版だけ何故か複数のアクションが統合できるようになっていたため、日本版を合わせるために複数のアクションに対応した。
 * 
 * ユーザーがアプリ設定を更新したタイミングで順次データ構造を更新していく対応とするため、古いデータの場合を考慮する必要がある。
 * `actionCond` がある場合は、古いデータであり、`actionCondList` がある場合は新しいデータである。
 *
 * @param {*} chobitoneApp 
 * @param {*} webhookSentAppId 
 * @returns 
 */
function getWebhookSyncSetting(chobitoneApp, webhookSentAppId) {
    if (chobitoneApp.actionCond && chobitoneApp.webhookSync && chobitoneApp.actionCond.actionApp === webhookSentAppId) {
        return chobitoneApp.webhookSync;
    }
    
    if (chobitoneApp.actionCondList && Array.isArray(chobitoneApp.actionCondList)) {
        const actionCond = chobitoneApp.actionCondList.find((action) => action.webhookSync && action.actionApp === webhookSentAppId);
        return actionCond.webhookSync ? actionCond.webhookSync : null;
    }
    
    return null;
}