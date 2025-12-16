const AWS = require('aws-sdk');
const request = require('request');


const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';
const appTableName = 'chobitoneApp';
const groupTable = 'chobitoneGroup';

exports.handler = async (event) => {
    console.log('Starting get comment.', JSON.stringify(event, null, 2));
    
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];
    
    const appId = event.pathParameters.id;
    const recordId = event.pathParameters.recordId;
   
    
 
    const queries = {
        TableName: userTableName,
        Key: {
            'domain': domain,
            'loginName': loginName
        }
    };
    
    try {
       let data = await docClient.get(queries).promise();
       
       if (!data.Item) throw new Error('Invalid token');
       
       const userInfo = data.Item;
       
       const appSetting = await getAppSetting(domain, appId);
       const record = await getRecord(appId, recordId,userInfo, domain);
       let {userGroups, allGroups} = await getUserGroups(userInfo.domain, userInfo.loginName)
       
       if (appSetting.groupView && appSetting.ownerView){
        
             let checkGroupView = ( userGroups.length &&  record[appSetting.groupView] && record[appSetting.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group)))
            || (!userGroups.length  &&  record[appSetting.groupView] && record[appSetting.groupView].value.replace(/\n/g, "").split(',').every(group => !allGroups.includes(group)))
    
    
            let checkOwerView = record[appSetting.creator]?.value == userInfo.loginName;
                
            
            if (!checkGroupView && !checkOwerView){
                throw new Error('権限がありません。')
            }
             
        }else if(appSetting.groupView && !appSetting.ownerView){
             let checkGroupView = ( userGroups.length &&  record[appSetting.groupView] && record[appSetting.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group)))
            || (!userGroups.length  &&  record[appSetting.groupView] && record[appSetting.groupView].value.replace(/\n/g, "").split(',').every(group => !allGroups.includes(group)))
            
            if (!checkGroupView){
                 throw new Error('権限がありません。')
            }
        }else if (!appSetting.groupView && appSetting.ownerView){
            let checkOwerView = record[appSetting.creator]?.value == userInfo.loginName;  
            if (!checkOwerView){
                throw new Error('権限がありません。')
            }
        }
        
        
        const allComment = await  getComment(appId, recordId, userInfo);
        
        return handleSuccess({
            comments : allComment
        });
       
    } catch (err) {
        return handleError(err);
    }
   
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



function getRecord( appId, recordId, userInfo, domain) {
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
    
    return new Promise((resolve, reject) => {  
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
    
}
    

   

async function getComment(appId, recordId, userInfo) {
    let kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
    let authorizedToken = userInfo.cybozuToken;
    let allComment = [];
    let offset = 0;
    let length = 0;
    do{
        let requestOptions = {
            method: 'GET',
            uri: `${kintoneDomain}/k/v1/record/comments.json`,
            headers: {
                'X-Cybozu-Authorization': authorizedToken,
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                app: appId,
                record: recordId,
                order: "desc",
                offset: offset
            },
        };
    
        console.log('Call kintone API get record with body: ', JSON.stringify(requestOptions.body, null, 2));
        
        let comments = await new Promise((resolve, reject) => {
            request(requestOptions, function (err, response, body) {
                if (err) {
                    console.log('Call KintoneAPI get comment failed.', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    console.log('KintoneAPI response.', JSON.stringify(body, null, 2));
                    if (body.comments){
                         resolve(body.comments)     
                    }else{
                        reject(body)
                    }
                   
                }
            });
        });
        
        allComment = allComment.concat(comments);
        offset  = offset + comments.length;
        length = comments.length;
    }while(length == 10); 
    return allComment;   
}


function handleSuccess(data) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        data: data,
    };

    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    return response;
}

function handleError(error) {
    console.log('Handle error:', JSON.stringify(error, null, 2));
    
     let responseBody = {
        code: 400,
        message: '権限がありません。',
        messageDev: error
    };
    
    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

   return response
}



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