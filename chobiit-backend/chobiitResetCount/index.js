const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient(); 
const configTableName = process.env.configTableName;

const BUCKET_NAME = process.env.BUCKET_NAME;
const chobiitPluginId = process.env.chobiitPluginId;
const novelworksAppToken = process.env.novelworksAppToken;
const novelworksAppId = process.env.novelworksAppId;

const pluginAppToken = process.env.pluginAppToken;
const pluginAppId =  process.env.pluginAppId;
const contractField = process.env.contractField;
const startTimeField = process.env.startTimeField;


const startContractField = process.env.startContractField;

const request = require('request'); 
const moment = require('moment');
let today =  moment().add(-1,'hour').format('YYYY-MM-DD');


exports.handler =  async (event) => {
    console.log('Starting reset count', JSON.stringify(event, null, 2));
    let scanParams = {
        TableName: configTableName,
    };  
    
    try {
         
         
         let datas = await scanTable(scanParams, docClient)
         if(datas.length){
            
            console.log(datas.length);
            
            const chunkDatas = sliceIntoChunks(datas, 90);
           
            
            for (const  chunkData of chunkDatas){
                 console.log('chunkData ===>', chunkData);
                 
                const results = await Promise.allSettled(chunkData.map(async item =>{
                    if (item.count){
                        let resp = await getStatus(item.domain, chobiitPluginId);
                        let pluginAppRecord = await getPluginAppRecord(item.domain);
                        
                        
                        let status = resp.status;
                        
                        if (status == 'trialStart'){
                            await putToNovelWorkslApp(item);
                            
                            let tday = new Date();
                            let endDate = new Date(resp.endDate);
                            
                            if (endDate < tday){
                                await resetCount(item, pluginAppRecord);
                                await putStatusToPluginApp(item.domain, pluginAppRecord.$id.value);
                            }
                        }
                        else if (status == 'trialEnd'){
                            await putToNovelWorkslApp(item);
                            await resetCount(item, pluginAppRecord);
                        }else {
                            await putToNovelWorkslApp(item);
                            if (item.appSettingToken){
                                await putToClientApp(item);
                            }
                            await resetCount(item, pluginAppRecord);
                        }
                    }
                }))
            
            results.forEach(result => console.log(result))    
            
                
            }
        }
        
        return handleSuccess('done')
    }catch(err){
        return handleError(err);
    }
   
   
    
};

function getStatus(domain, pluginId){
    // console.log('pluginId: ',pluginId)
    return new Promise((resolve, reject) => {
        let requestOptions = {
            method: 'GET',
            uri: `https://v8jxi69oy4.execute-api.us-east-1.amazonaws.com/dev/status?domain=${domain}`,
            json: true,
        };
    
        request(requestOptions, (err, response) => {
            if(err){
               reject(err)
            }else{
                resolve(response.body)
            }
        })
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

function putStatusToPluginApp(clientDomain, recordId){
    console.log('starting put to plugin app with domain: ',clientDomain);
    
    return new Promise((resolve, reject) => {

        const putParams = {
            method: 'PUT',
            uri: 'https://novelworks.cybozu.com/k/v1/record.json',
            headers: {
                'X-Cybozu-API-Token': pluginAppToken,
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                app: pluginAppId,
                id: recordId,
                record: {
                    authState : {
                        value : "trialEnd"
                    }
                }
            },
        };
    
        request(putParams, function (err, response, body) {
            if (err) {
                console.log('put to plugin app fail')
                reject(err)
            } else {
                console.log('put to plugin app success', JSON.stringify(response, null, 2))
                resolve();
            }
        });
      
       
    })
}


function putToNovelWorkslApp(item){
    console.log('starting put to novelworks mangage app: '+JSON.stringify(item, null, 2))
    let countByApp = item.count.byApp;
    let totalCount = 0;
    countByApp.forEach(item => {
        totalCount = totalCount + item.total;
    })
    let recordData = {}
    recordData['useMonth'] = {
        value : today
    }
    recordData['totalRequest'] = {
        value : totalCount
    }
    recordData['domainName'] = {
        value : item.domain
    }
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: 'POST',
            uri: 'https://novelworks.cybozu.com/k/v1/record.json',
            headers: {
                'X-Cybozu-API-Token': novelworksAppToken,
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                app: novelworksAppId,
                record: recordData
            },
        };
    
      
        request(requestOptions, function (err, response, body) {
            if (err) {
               reject(err)
            } else {
                console.log('put to novelworks app success')
                resolve();
            }
        });
    });
}

function putToClientApp(item){
    console.log('starting put to clinent app '+JSON.stringify(item, null, 2))
    let countByApp = item.count.byApp;
    let totalCount = 0;
    countByApp.forEach(item => {
        totalCount = totalCount + item.total;
    })
    let recordData = {}
    recordData['useMonth'] = {
        value : today
    }
    recordData['totalRequest'] = {
        value : totalCount
    }
    
    let appTableValue = countByApp.map(ct => {
        return {
            value : {
                chobiitAppId: {value: ct.appId},
                appRequest: {value: ct.total}
            }
        }
    })
    recordData['appTable'] = {
        value : appTableValue
    }
    
    let userTableValue = [];
    if(item.count.byUser){
        userTableValue = item.count.byUser.map(ct => {
            return {
                value : {
                    chobiitUser: {value: ct.loginName},
                    userRequest: {value: ct.total}
                }
            }
        })
    }
    recordData['userTable'] = {
        value : userTableValue
    }
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: 'POST',
            uri: `https://${item.domain}/k/v1/record.json`,
            headers: {
                'X-Cybozu-API-Token': item.appSettingToken,
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                app: item.appSettingId,
                record: recordData
            },
        };
    
        request(requestOptions, function (err, response, body) {
            if (err) {
               reject(err)
            } else {
                console.log('put to client app success' +JSON.stringify(response, null, 2));
                resolve();
            }
        });
    })
}


function resetCount(item, pluginAppRecord){
    let contracInfo = pluginAppRecord[contractField].value;
    // let startTime = pluginAppRecord[startTimeField].value;
    const today = new Date();
    const startContract = pluginAppRecord[startContractField].value;
    
    console.log('contracInfo: ', contracInfo);
    console.log('startContract', startContract)
   
    if (contracInfo == "リクエスト単位購入" && startContract &&  moment().format('YYYY-MM-DD') > startContract){
      console.log('not reset')
      return 1;  
    } 
    
    if (contracInfo == '年額（USのみ）'){
       
        let startDate = new Date(startContract);
        
        let diffMonth = monthDiff(startDate, today);
        console.log('diffMonth: ',diffMonth)
        
        if (diffMonth >= 12 && diffMonth % 12 == 0){
            return new Promise((resolve, reject) => {
                let count = {
                    byApp : [],
                    byUser : []
                };
                let updateParams = {
                    TableName: configTableName,
                    Key:{
                        domain : item.domain
                    },
                    UpdateExpression: "set #CT = :c",
                    ExpressionAttributeNames:{
                        "#CT" : "count"
                    },
                    ExpressionAttributeValues:{
                        ":c" : count
                    },
                    ReturnValues:"UPDATED_NEW"
                };
                        
               docClient.update(updateParams, function(err, data) {
                   if (err) {
                       console.log('reset count faail',JSON.stringify(err, null, 2))
                       reject(err);
                   }
                   else {
                       console.log('update count success');
                       resolve();
                   };
                });
            })    
        }else{
            return 1; //not reset
        }
        
    }else {
         console.log("Updating the count...");
        return new Promise((resolve, reject) => {
            let count = {
                byApp : [],
                byUser : []
            };
            let updateParams = {
                TableName: configTableName,
                Key:{
                    domain : item.domain
                },
                UpdateExpression: "set #CT = :c",
                ExpressionAttributeNames:{
                    "#CT" : "count"
                },
                ExpressionAttributeValues:{
                    ":c" : count
                },
                ReturnValues:"UPDATED_NEW"
            };
                    
           docClient.update(updateParams, function(err, data) {
               if (err) {
                   console.log('reset count faail',JSON.stringify(err, null, 2))
                   reject(err);
               }
               else {
                   console.log('update count success');
                   resolve();
               };
            });
        })     
    }
   
}

function handleSuccess(data) {
    console.log('Handle success:', JSON.stringify(data, null, 2));
    let response = {
        statusCode: 200,
        body: data
    };
    return response;
            
}

function handleError(error) {
    console.log('Handle error:', error.message || JSON.stringify(error, null, 2));
    let response = {
        statusCode: 200,
        body:  error.message || JSON.stringify(error)
    };

   return response;
}

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
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


function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}