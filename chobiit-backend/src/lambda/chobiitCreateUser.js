//DynamoDB
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient(); 

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const UserPoolId = process.env.UserPoolId;
const ClientId = process.env.ClientId;

const TABLE_NAME = 'chobitoneUser';
const MSG_SUCCESS = "SUCCESS";
const MSG_ERROR = "Error DynamoDBへ更新失敗";

exports.handler = async (event) => {
    console.log('starting create chobiit user: '+JSON.stringify(event, null, 2))
    
    const apiKey = event.params.header["x-api-key"] || event.params.header["X-Api-Key"]; 
    let eventBody = event['body-json'];
    
    try {
        
        let domain = await authenticate(apiKey);
        if (!domain){
            return handleError('Access Denied')
        }
         
        let data  = await addToCoginto(eventBody);
        console.log('Create user resp: ',JSON.stringify(data, null, 2));
        
        
        await activeUser(eventBody)
        await addToDynamo(eventBody)
        return handleSuccess({})
        
    }catch(err){
        console.log(err)
        return handleError(err)
    }
 
 
};

async function activeUser({loginName, password}){ 
   
 
    
    let params = { 
       AuthFlow: 'ADMIN_NO_SRP_AUTH', 
       ClientId: ClientId, 
       UserPoolId: UserPoolId, 
        AuthParameters: 
         { USERNAME: loginName, PASSWORD: password} 
    }
    
    console.log('activeUser params: ',JSON.stringify(params, null, 2))
    
    let {Session} = await cognitoidentityserviceprovider.adminInitiateAuth(params).promise() 
    
    let updateParams = {
      ChallengeName: 'NEW_PASSWORD_REQUIRED', 
      ClientId: ClientId, 
      ChallengeResponses: {
      USERNAME: loginName,
      NEW_PASSWORD: password,
      'userAttributes.nickname': loginName,
    },
    Session: Session
    };
    
    console.log('updateParams: ',JSON.stringify(updateParams, null, 2))
    
    await cognitoidentityserviceprovider.respondToAuthChallenge(updateParams).promise()
    // console.log(session)
}

async function addToCoginto({loginName, name, password, mailAddress, domain}){
    console.log('UserPoolId: ',UserPoolId)
    var params = {
      UserPoolId: UserPoolId, /* required */
      Username: loginName, /* required */
        MessageAction: 'SUPPRESS', 
      TemporaryPassword: password,
      UserAttributes: [
        {
          Name: 'email', /* required */
          Value: mailAddress 
        },
        {
          Name: 'name', /* required */
          Value: name 
        },
         {
          Name: 'custom:domain', /* required */
          Value: domain
        },
        {
            Name: 'email_verified',
            Value: 'true'
        }
      ],
    };
    
    console.log('Add user params: ',JSON.stringify(params, null, 2))
    return await cognitoidentityserviceprovider.adminCreateUser(params).promise()
     
}



async function addToDynamo(eventBody){
      const params = {
        TableName: TABLE_NAME,
        Item:{
            domain               : eventBody.domain,
            name                 : eventBody.name,
            loginName            : eventBody.loginName,
            password             : eventBody.password,
            apps                 : JSON.stringify(eventBody.apps),
            mailAddress          : eventBody.mailAddress,
            kintoneLoginName     : eventBody.kintoneLoginName,
            kintoneUsername      : eventBody.kintoneUsername ,
            cybozuToken          : eventBody.cybozuToken,
            kintoneOrganizations : JSON.stringify(eventBody.kintoneOrganizations),
            kintoneGroups        : JSON.stringify(eventBody.kintoneGroups),
            isAdmin              : eventBody.isAdmin,
            /**
             * # 注意
             * US版だけ`userAuth`を`false`固定で返していた。差異の解消をすること。
             */
            ...(process.env.CHOBIIT_LANG === "en" ? {userAuth: false} : {}),
        }
    };
    
    console.log('dynamo-get-params:'+ JSON.stringify(params));
    console.log("TABLE_NAME=" + TABLE_NAME);
    
    return await dynamo.put(params).promise();
    
}
function handleSuccess(data) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'Get record succeed',
        data: data
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };

    return response;
}

function handleError(error) {
    console.log('Handle error:', JSON.stringify(error, null, 2));

    let response = {
        statusCode: 200,
        body: JSON.stringify({
            code: 400,
            message: error.message,
            messageDev: error
        })
    };

   return response;
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