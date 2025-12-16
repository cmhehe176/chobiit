const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();
const configTableName = 'chobiitConfig';
var url = require('url');


exports.handler = (event, context, callback) => {
    console.log('Starting put count', JSON.stringify(event, null, 2));
    
    let origin = event.headers.origin || event.headers.Origin;
    
    const domain = url.parse(origin, true).host.replace('.s.','.').replace('chobiit.me','cybozu.com')  
    
    // const domain = event["body-json"].domain
    
    let eventBody = JSON.parse(event.body);
    const appId = eventBody.appId;
    const times = +eventBody.times;
    
    
    
    let loginName = eventBody.loginName;
    
  
    
    if (times < 0) {
        handleError(new Error('access denied'), callback);
    }

   (async function (){
        let getParams = {
            TableName: configTableName,
            Key:{
                domain : domain
            }
        };
        
        let data = await docClient.get(getParams).promise();
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      
        let count = {};
              
        if (data.Item.count){
            count = data.Item.count;
                 
            //setting count by app   
            let appIds = count.byApp.map(x => x.appId);
            if (appIds.includes(appId)){
                count.byApp.forEach(ct => {
                    if (ct.appId == appId){
                        ct.total = ct.total + times;
                    }
                });
            }else {
                let obj = {
                    appId : appId,
                    total : 1
                }
                count.byApp.push(obj);
            }
            
            //setting count by user
            if (loginName){
                if (!count.byUser){
                    count.byUser = []
                }
                let loginNames = count.byUser.map(x => x.loginName);
                if (loginNames.includes(loginName)){
                    count.byUser.forEach(ct => {
                        if (ct.loginName == loginName){
                            ct.total = ct.total + times;
                        }
                    })
                } else {
                    let obj = {
                        loginName :loginName,
                        total : 1
                    }
                     count.byUser.push(obj);
                }
            }
            
            
        }else {
            count.byApp = [
                {
                    appId : appId,
                    total : 1
                }
            ]
            
            if (loginName){
                count.byUser = [
                    {
                        loginName : loginName,
                        total : 1
                    }
                ]
            }
        }
        
        let updateParams = {
            TableName: configTableName,
            Key:{
                domain : domain
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
                
        console.log("Updating the count...");
        let updateRes = await  docClient.update(updateParams).promise();
        console.log("Update count succeeded:", JSON.stringify(data, null, 2));
        handleSuccess(data, callback);
    })()
    .catch(error => handleError(error, callback));
};


function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));
    let responseBody = {
        code: 200,
        count: data
    };

    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };
    callback(null, response);
            
}

function handleError(error, callback) {
    console.log('Handle error:', JSON.stringify(error, null, 2));
    let responseBody = {
        code: 400,
        message: 'Put count failed',
        messageDev: error.message
    };

    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
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