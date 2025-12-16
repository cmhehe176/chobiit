const AWS = require('aws-sdk');
const request = require('request');


const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';
const appTableName = 'chobitoneApp';
const groupTable = 'chobitoneGroup'



exports.handler = (event, context, callback) => {
  
    console.log('Starting get record.', JSON.stringify(event, null, 2));
    
    
    
    const appId = event.pathParameters.id;
    const recordId = event.pathParameters.recordId;
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];


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
             handleError(err, callback);
        } else {
            if (data.Item) {
                getAppSetting(domain, appId)
                .then(appSetting =>{
                    console.log('appSetting: ',JSON.stringify(appSetting, null, 2))
                    getRecord(appId, recordId, data.Item, appSetting)
                    .then(recordInfo => {
                        handleSuccess(recordInfo, callback)
                    })
                    .catch(err => {
                        handleError(err, callback)
                    })
                    
                })
                .catch(err => {
                    handleError(err, callback)
                })
               
            }else{
                 handleError(new Error('Invalid token'), callback);    
            }

            
        }
    });
   
};

async function getAppSetting(domain, appId){
    const queries = {
        TableName: appTableName,
        Key: {
            'domain': domain,
            'app': appId
        }
    };

    let resp = await docClient.get(queries).promise();
    return resp.Item;
}


async function getRecord( appId, recordId, userInfo, appSetting) {
    let kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
    let authorizedToken = userInfo.cybozuToken;
    const requestOptions = {
        method: 'GET',
        uri: `${kintoneDomain}/k/v1/record.json`,
        headers: {
            'X-Cybozu-Authorization': authorizedToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            app: +appId,
            id: +recordId
        },
    };
    

    console.log('Call kintone API get record with body: ', JSON.stringify(requestOptions.body, null, 2));
    
    let record =  await new Promise((resolve, reject) => {  
        request(requestOptions, function (err, response, body) {
            if (err) {
                console.log('Call KintoneAPI get record failed.', JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log('KintoneAPI response.', JSON.stringify(body, null, 2));
                if (body.record) {
                 
                    resolve(body.record);   
                } else {
                    reject(body);
                }
            }
        });
    });
    
    let {userGroups, allGroups} = await getUserGroups(userInfo.domain, userInfo.loginName)
    if (appSetting.groupView && appSetting.ownerView){
        
        let checkGroupView = ( userGroups.length &&  record[appSetting.groupView] && record[appSetting.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group)))

        let checkOwerView = record[appSetting.creator]?.value == userInfo.loginName;
            
        if (!checkGroupView && !checkOwerView){
            throw new Error('権限がありません。')
        }
         
    }else if(appSetting.groupView && !appSetting.ownerView){
        let checkGroupView = ( userGroups.length &&  record[appSetting.groupView] && record[appSetting.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group)))
        
        if (!checkGroupView){
             throw new Error('権限がありません。')
        }
    }else if (!appSetting.groupView && appSetting.ownerView){
        let checkOwerView = record[appSetting.creator]?.value == userInfo.loginName;  
        if (!checkOwerView){
            throw new Error('権限がありません。')
        }
    }
    
    
  
    
    
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
    
    let recordRight = await new Promise((resolve, reject) => {  
        request(requestFieldRightOption, function (err, response, body) {
            if (err) {
                console.log('Call KintoneAPI get permision failed.', JSON.stringify(err, null, 2));
                reject(err);
            } 
            else {
                console.log('KintoneAPI get permision response.', JSON.stringify(body, null, 2));
                if (body.rights) {
                    resolve(body.rights[0]);
                } else {
                    reject(body);
                }
            }
        });
    });
    
    return {
        record: record,
        recordRight: recordRight
    }
    
   
}

            

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'Get record succeed',
        record: data.record,
        recordRight: data.recordRight
    };

    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback) {
    console.log('Handle error:', error.message);
    let responseBody = {
       code: 400,
        message: '権限がありません。',
        messageDev: error.message
    };
    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };
    callback(null, response);
}

async function getUserGroups(domain, loginName){
    
    
    let allGroupsResp = await scanTable({
        TableName: groupTable,
        Key: {
            'domain': domain,
            
        }
    },docClient)
    
    let userGroups = allGroupsResp.reduce((acc,group) => group.users.includes(loginName) ? [...acc, group.name] : acc,[])
    let allGroups = allGroupsResp.map(group => group.name)
    
    return {
        userGroups: userGroups,
        allGroups :allGroups
    };
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



function getHeader() {
    let headers = {
        "Access-Control-Allow-Credentials" : "true",
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control" : 'no-cache, must-revalidate',
        "Strict-Transport-Security" : 'max-age=63072000; includeSubDomains; preload',
        "X-Content-Type-Options" : 'nosniff',
        "Referrer-Policy" : 'same-origin',
        'Expires' : 	'-1',
        'Pragma' : 'no-cache',
    }
    
    return headers;
}