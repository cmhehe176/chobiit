const AWS = require('aws-sdk');
const request = require('request');


const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';
const appTableName = 'chobitoneApp';
const groupTable = 'chobitoneGroup';
const commentTable = 'chobiitComment'

const KINTONE_API_ERROR = 1;
const PERMISSION_ERROR = 2;
const INTERNAL_ERROR = 3;

exports.handler = async (event) => {
    console.log('Starting add comment.', JSON.stringify(event, null, 2));
     const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];
    
    const appId = event.pathParameters.id;
    const recordId = event.pathParameters.recordId;
    let commentContent = event['body'];
    
    if (!commentContent) {
        return handleError(new Error('Missing comment content'), PERMISSION_ERROR);
    }
    
    console.log('Comment content: '+commentContent);
    

    const queries = {
        TableName: userTableName,
        Key: {
            'domain' : domain,
            'loginName': loginName
        }
    };
    
    try {
        let data = await docClient.get(queries).promise();
        
        if (!data.Item) throw new Error('Invalid token');
        
        const userInfo = data.Item;
        
        const appSetting = await getAppSetting(domain, appId);
        const record = await getRecord(appId, recordId,userInfo, domain);
        const userGroups = await getUserGroups(domain, loginName);
       
        if (appSetting.groupView && appSetting.ownerView){
        
            let checkGroupView = record[appSetting.groupView] && record[appSetting.groupView].value.split(',').some(group => userGroups.includes(group))
    
    
            let checkOwerView = record[appSetting.creator]?.value == userInfo.loginName;
                
            
            if (!checkGroupView && !checkOwerView){
                throw new Error('権限がありません。')
            }
             
        }else if(appSetting.groupView && !appSetting.ownerView){
            let checkGroupView = record[appSetting.groupView] && record[appSetting.groupView].value.split(',').some(group => userGroups.includes(group))
            
            if (!checkGroupView){
                 throw new Error('権限がありません。')
            }
        }else if (!appSetting.groupView && appSetting.ownerView){
            let checkOwerView = record[appSetting.creator]?.value == userInfo.loginName;  
            if (!checkOwerView){
                throw new Error('権限がありません。')
            }
        }
        
        const resp = await addCommentToKintone(commentContent, appId, recordId, userInfo)
        console.log('resp ===>' ,resp)
        
        await addCommentToDynamo(appId, recordId, resp.id, userInfo)
        
        return handleSuccess(resp)
        
    } catch (err) {
        return handleError(err);
    }

   

};

function addCommentToKintone(commentContent, appId, recordId, userInfo) {
    let kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
    let authorizedToken = userInfo.cybozuToken;
        const requestOptions = {
            method: 'POST',
            uri: `${kintoneDomain}/k/v1/record/comment.json`,
            headers: {
                'X-Cybozu-Authorization': authorizedToken,
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                app: appId,
                record: recordId,
                comment: {
                    text: commentContent,
                    mentions: [
                    ]
                }
            },
        };
    
        return new Promise((resolve, reject) => {
            
            console.log('Call kintone API with body: ', JSON.stringify(requestOptions.body, null, 2));
            request(requestOptions, function (err, response, body) {
                if (err) {
                    console.log('Call KintoneAPI failed.', JSON.stringify(err, null, 2));
                   reject(err)
                } else {
                    console.log('KintoneAPI response.', JSON.stringify(body, null, 2));
                    if (body.code) {
                         reject(body)
                        
                       
                    } else {
                       resolve(body);
                    }
                }
            });
        })
}

async function addCommentToDynamo(appId, recordId, commentId, userInfo){
    const id = createUUID();
    const today = new Date();
    const ttl = today.setDate(today.getDate() + 7)
    
    const params = {
      TableName: commentTable,
      Item: {
        id : id,
        domain : userInfo.domain,
        appId : appId,
        recordId : recordId,
        commentId: commentId,
        chobiitUserId : userInfo.loginName,
        createdTime : new Date().toISOString(),
        ttl : Math.round(ttl/1000)
      }
    };
    
    
    await docClient.put(params).promise();    
}


function createUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

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
    
    
    let allGroups = await scanTable({
        TableName: groupTable,
        Key: {
            'domain': domain,
            
        }
    },docClient)
    
    let userGroups = allGroups.reduce((acc,group) => group.users.includes(loginName) ? [...acc, group.name] : acc,[])
    
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
    


function handleSuccess(data) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'Add comment succeed',
        result: data
    };

    let response = {
         headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    return response;
}

function handleError(err, type) {
    console.log('Handle error:', JSON.stringify(err.message || err, null, 2));
    let message;
    switch (type) {
        case KINTONE_API_ERROR:
            message = err.message || '権限がありません。';
            break;
        case PERMISSION_ERROR:
            message = '権限がありません。';
            break;
        case INTERNAL_ERROR:
        default:
            message = 'Add comment failed.';
            break;
    }

    let body = {
        code: 400,
        message: message,
        messageDev: err.message
    };

    let response = {
        headers: getHeader(),
        body: JSON.stringify(body)
    };

    return response;
}


function getHeader() {
      
    
    let headers = {
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