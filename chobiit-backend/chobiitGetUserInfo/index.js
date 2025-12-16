const AWS = require('aws-sdk');


const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';
const configTableName = 'chobiitConfig';

const chobiitPluginID = process.env.chobiitPluginID;

exports.handler = (event, context, callback) => {
    console.log('Starting update chobitone user info:', JSON.stringify(event, null, 2));
   

    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];
    
    checkAuth(domain, chobiitPluginID)
     .then(check => {  
        if (check){
            const queries = {
                TableName: userTableName,
                Key: {
                    'domain' : domain,
                    'loginName': loginName
                }
            };
            
             docClient.get(queries, function (err, data) {
                if (err) {
                    console.error('Unable to get user info. Error:', JSON.stringify(err, null, 2));
                   handleError(err, callback)
                } else {
                    //add 20220425
                    if (!Object.keys(data).length) {
                        handleError({message: "登録情報を取得できませんした。システム管理者お問い合わせください。"}, callback)
                    }
                    console.log('Get user info succeed:', JSON.stringify(data, null, 2));
                    handleSuccess(data.Item, callback)
        
                }
            });
        }else{
             handleError(new Error('利用終了です。'), callback);
        }
     })
    .catch(err => {
        
        handleError(err, callback)
    })

};

function handleSuccess(userInfo, callback) {
    let responseBody = {
        code: 200,
        userInfo: {
            name: userInfo.name,
            mailAddress: userInfo.mailAddress,
            password: userInfo.password,
            loginName : userInfo.loginName,
            kintoneLoginName : userInfo.kintoneLoginName,
            kintoneUsername: userInfo.kintoneUsername,
            kintoneGroups : userInfo.kintoneGroups,
            kintoneOrganizations : userInfo.kintoneOrganizations
        }
    };

    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback) {
    let responseBody = {
        code: 400, 
        message: error.message,
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
        "Access-Control-Allow-Origin" : '*',
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

async function checkAuth(domain, pluginID){
    let check = true;
    const lambda = new AWS.Lambda({
        region: 'us-east-1'   
    });
    
    
    const params1 = {
      InvocationType: "RequestResponse",
      Payload: JSON.stringify({domain: domain, pluginID: pluginID}),
      FunctionName : 'getPluginAuthState'
    };
        
    const resp1 = await lambda.invoke(params1).promise();
    console.log('resp1: ',JSON.stringify(resp1));
    
    let body = JSON.parse(resp1.Payload);
    
    if (!body.data){
        let sDomain = domain.split('.')[0]+'.s.cybozu.com';
        const params2 = {
          InvocationType: "RequestResponse",
          Payload: JSON.stringify({domain: sDomain, pluginID: pluginID}),
          FunctionName : 'getPluginAuthState'
        };
            
        const resp2 = await lambda.invoke(params2).promise();
        console.log('resp2: ',JSON.stringify(resp2));
        body = JSON.parse(resp2.Payload)
    }
    
    console.log('body: ',JSON.stringify(body, null, 2));
    
    if(body.data.authState == 'trialStart'){
        let today = new Date();
        let endDate = new Date(body.data.endDate);
        if (today > endDate){
            check = false;
        }
    }
    
    if (body.data.authState == 'trialEnd' || body.data.authState == 'NotActive'){
        check = false;
    }
                
    return check;
}

