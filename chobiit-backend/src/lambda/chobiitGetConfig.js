const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();
const configTableName = 'chobiitConfig';
const appTableName = 'chobitoneApp';
const userTableNAme = 'chobitoneUser';
const kintoneUserTableName = process.env.kintoneUserTableName
const groupUserTableName = 'chobitoneGroup'
const request = require('request');

const pluginAppToken = process.env.pluginAppToken;
const pluginAppId =  process.env.pluginAppId;
const chobiitPluginId = process.env.chobiitPluginId;
const contractField = process.env.contractField;
const chobiitBuyRequestField = process.env.chobiitBuyRequestField;

/**
 * # 注意
 * 日本版だけ設定されている環境変数。ここも差異が発生している。
 */
const startContractField = process.env.startContractField;

exports.handler = (event, context, callback) => {
    // handleSuccess({},callback);
    console.log('Starting get config ', JSON.stringify(event, null, 2));
    
    const apiKey = event.params.header["x-api-key"] || event.params.header["X-Api-Key"]; 
    authenticate(apiKey)
    .then(domain => { 
        if(domain){
            
            let getConfigTable = new Promise((resolve, reject) => {
                const queries = {
                    TableName: configTableName,
                    Key: {
                        'domain': domain, 
                    }
                };
                
               
                docClient.get(queries, function (err, data) {
                    if (err) {
                        console.error('Unable to get config info from DynamoDB. Error:', JSON.stringify(err, null, 2));
                        reject(err);
                    } else {
                        console.log('Get config info from DynamoDB succeed.', JSON.stringify(data));
                            if (data.Item){
                               resolve(data.Item);
                            }else{
                                resolve(null)
                            }
                    }   
                });
              
            });
            
            
            
            const appQuery = {
                TableName: appTableName,
                KeyConditionExpression: "#dm = :dd ",
                ExpressionAttributeNames:{
                    "#dm": "domain",
                },
                ExpressionAttributeValues: {
                    ":dd": domain,
                  
                }
            }
            
    
            
            
            const kintoneUserQuery = {
                TableName: kintoneUserTableName,
                KeyConditionExpression: "#dm = :dd ",
                ExpressionAttributeNames:{
                    "#dm": "domain",
                },
                ExpressionAttributeValues: {
                    ":dd": domain,
                  
                }
            }
            
            const groupQuery = {
                TableName: groupUserTableName,
                KeyConditionExpression: "#dm = :dd ",
                ExpressionAttributeNames:{
                    "#dm": "domain",
                },
                ExpressionAttributeValues: {
                    ":dd": domain,
                  
                }
            }
          
           
            
            Promise.all([getConfigTable,
                        queryTable(appQuery, docClient),
                       
                        queryTable(kintoneUserQuery, docClient),
                        queryTable(groupQuery, docClient),
                        getPluginAppRecord(domain)
                       ])
            .then(resp => {
                let [config, apps, kintoneUsers, groups, pluginAppRecord] = resp;
                
                let buyRequest = false;
                let startContract = false;
                if (pluginAppRecord[contractField] && pluginAppRecord[contractField].value == 'リクエスト単位購入' &&  pluginAppRecord[chobiitBuyRequestField] && pluginAppRecord[chobiitBuyRequestField].value){
                    buyRequest = pluginAppRecord[chobiitBuyRequestField].value;
                    /**
                     * # 注意
                     * 日本版でだけ以下実装されている。
                     * 差分が発生している理由を解明して解消すること。
                     */
                    if (process.env.CHOBIIT_LANG === "ja") {
                        if ( pluginAppRecord[startContractField] && pluginAppRecord[startContractField].value){
                            startContract =  pluginAppRecord[startContractField].value
                        }
                    }
                }
                let data = {
                    config,
                    apps,
                    users: [],
                    kintoneUsers,
                    groups,
                    buyRequest,
                    /**
                     * # 注意
                     * 日本版でだけ以下実装されている。
                     * 差分が発生している理由を解明して解消すること。
                     */
                    ...(process.env.CHOBIIT_LANG === "ja" ? {startContract} : {}),
                }
                handleSuccess(data, callback)
            })
            .catch(err => {
                console.log(err);
                handleError(err, callback)
            })
    
        }else{
            handleError('Access Denied', callback)  
        }
    })
    .catch(err => {
        handleError(err, callback)
    })

  

};

function handleSuccess(data, callback) {
    console.log('Handle success:');
    let responseBody = {
        code: 200,
        data: data
    };


  

  
    let response = {
         statusCode: 200,
         body: JSON.stringify(responseBody),
         
       
    };
     callback(null, response);
}

function handleError(error, callback) {
    console.log('Handle error:', JSON.stringify(error, null, 2));
    let responseBody = {
        code: 400,
        message: error || 'Get config failed',
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody),
    };

    callback(null, response);
}


function authenticate(apiKey){
    const request = require('request');
    const [apiToken,domain,settingAppId] = apiKey.split(':')
    return new Promise((resolve, reject) =>{
         const requestOptions = {
            method: 'GET',
            uri: `https://${domain}/k/v1/app.json`,
            headers: {
              
                'Content-Type': 'application/json',
                'X-Cybozu-API-Token': apiToken,
            },
            json: true,
             body: {
                id: +settingAppId
            },
           
        };
    
        console.log('Call kintone API with body: ', JSON.stringify(requestOptions.body, null, 2));
        request(requestOptions, function (err, response, body) {
            if (err) {
                console.log('Call KintoneAPI failed.', JSON.stringify(err, null, 2));
               reject(err)
            } else {
                console.log('KintoneAPI response.', JSON.stringify(response, null, 2));
                if (body.appId) {
                   resolve(domain)
                } else {
                   resolve(false)
                }
            }
        });
    })    
}

function getPluginAppRecord(clientDomain){
    return new Promise((resolve, reject) =>{
        const getParams = {
            method: 'GET',
            uri: `https://novelworks.cybozu.com/k/v1/records.json`,
            headers: {
                'X-Cybozu-API-Token': pluginAppToken,
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                app: pluginAppId,
                query: `domain = "${clientDomain}" and pluginID = "${chobiitPluginId}"`,
                totalCount: true
            }
        }
        
        request(getParams, (err, response, body) => {
            if (err) {
                console.log('get records plugin app fail', JSON.stringify(err, null, 2));
                reject(err);
            } else {
                if(body.message){
                     console.log('get records plugin app fail', JSON.stringify(body, null, 2));
                    reject(body)
                }else{
                    console.log('KintoneAPI get records response:', JSON.stringify(body, null, 2));    
                    if (body.records.length){
                        resolve(body.records[0])
                    }else{
                        reject(new Error('no record data'))
                    }
                }
                
            }
        })
    })
}

const queryTable = async (params, dyanmo) => {
    let queryResults = [];
    let items;
    do{
        items =  await dyanmo.query(params).promise(); 
        items.Items.forEach((item) => queryResults.push(item));
        params.ExclusiveStartKey  = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey != "undefined");

    return queryResults;
 
};