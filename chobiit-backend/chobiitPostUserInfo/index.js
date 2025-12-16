const AWS = require('aws-sdk');

const SHA512 = require('crypto-js/sha512');

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const UserPoolId = process.env.UserPoolId;

const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';





exports.handler = (event, context, callback) => {
    console.log('Starting update chobitone user info:', JSON.stringify(event, null, 2));
    
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];
   
   
  
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
                    return handleError(err, callback);
                } else {
                    console.log('Get user info succeed:', JSON.stringify(data, null, 2));
                    if (data.Item) {
                        let userInfo = data.Item;
                        const kintoneLoginName = userInfo.kintoneLoginName;
                        const kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
                        const authorizedToken = userInfo.cybozuToken;
                        userInfo['kintoneDomain'] = kintoneDomain;
                        userInfo['authorizedToken'] = authorizedToken;
                        
                        return updateUser(userInfo, JSON.parse(event['body']), callback);
                    }

                    return handleError(new Error('Invalid token'), callback);
                }
            });
 

}; 

function updateUser(userInfo, postData, callback) {
     updateInDynamo(userInfo, postData)
     .then(dynamoResponse => {
        
        updateEmailToCognito({loginName : userInfo.loginName , email : postData.mailAddress})
        .then(() => {
            if (postData.password){
                updatePasswordToCognito(userInfo, postData)
                .then(() => {
                    handleSuccess({
                        dynamo: dynamoResponse
                    }, callback);
                })
                .catch(err => {
                     handleError(err, callback);
                })
            }else{
                 handleSuccess({
                    dynamo: dynamoResponse
                }, callback);
            }  
        })
        .catch(err => {
            handleError(err, callback);
        })
       
     })
     .catch(err => {
          handleError(err, callback);
     })
}

function updateEmailToCognito({email, loginName}){
    return new Promise((resolve, reject) => {
        var params = {
          UserAttributes: [ /* required */
            {
              Name: 'email', /* required */
              Value: email
            },
            {
                Name: 'email_verified',
                Value: 'true'
            }
            /* more items */
          ],
          UserPoolId: UserPoolId, /* required */
          Username: loginName, /* required */
          
        };
        
        cognitoidentityserviceprovider.adminUpdateUserAttributes(params, function(err, data) {
          if (err) reject(err)// an error occurred
          else  resolve(data);           // successful response
        });
    })
}

function updatePasswordToCognito(userInfo, postData){
    return new Promise((resolve, reject) => {
        var params = {
          Password: postData.password, 
          UserPoolId: UserPoolId,
          Username: userInfo.loginName, /* required */
          Permanent: true 
        };
        
        cognitoidentityserviceprovider.adminSetUserPassword(params, function(err, data) {
          if (err) reject(err)// an error occurred
          else  resolve(data);           // successful response
        });
    })
}


function updateInDynamo(userInfo, postData) {
 
    return new Promise((resolve, reject) => {
     
    
        let UpdateExpression = 'SET #NAME = :name, #MAIL_ADDRESS = :mailAddress';
        let ExpressionAttributeNames = {
            '#NAME': 'name',
            '#MAIL_ADDRESS': 'mailAddress',
           
        };
        
        let ExpressionAttributeValues = {
            ':name': postData.name,
            ':mailAddress': postData['mailAddress'], 
           
        };
    
        if (postData.password) {

            UpdateExpression = 'SET #NAME = :name, #MAIL_ADDRESS = :mailAddress, #PASSWORD = :password';
            ExpressionAttributeNames['#PASSWORD'] = 'password';
            ExpressionAttributeValues[':password'] = postData.password;
        }
    
        let params = {
            TableName: userTableName,
            Key: {
                'domain': userInfo.domain,
                'loginName': userInfo.loginName,
            },
            UpdateExpression: UpdateExpression,
            ExpressionAttributeNames: ExpressionAttributeNames,
            ExpressionAttributeValues: ExpressionAttributeValues,
            ReturnValues:'UPDATED_NEW'
        };
    
        docClient.update(params, function (err, data) {
            if (err) {
                console.error('Unable to update user info. Error JSON:', JSON.stringify(err, null, 2));
                return reject(err);
            } else {
                console.log('Update user info succeed:', JSON.stringify(data, null, 2));
                return resolve(data.Attributes);
            }
        });
    });
}



function handleSuccess(data, callback, origin) {
    let responseBody = {
        code: 200,
        message: 'Update user info succeed',
        result: data
    };
    
    let response = {
        headers: getHeader(origin, true, data.dynamo.token),
        body: JSON.stringify(responseBody)
    };
    
    callback(null, response);
}

function handleError(error, callback, origin) {
    let responseBody = {
        code: 400,
        message: 'Update user info failed',
        messageDev: error.message
    };

    let response = {
        headers: getHeader(origin, false),
        body: JSON.stringify(responseBody)
    };
    
    callback(null, response);
}


function getHeader() {
    
    let headers = {
        "Access-Control-Allow-Credentials" : "true",
        "Access-Control-Allow-Origin" : "*" ,
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
