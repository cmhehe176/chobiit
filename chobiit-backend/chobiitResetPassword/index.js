const userTableName = 'chobitoneUser';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();


const clientId = process.env.ClientId;
const UserPoolId = process.env.UserPoolId;

exports.handler = async (event) => {
    console.log('starting reset pass word', JSON.stringify(event, null, 2));
    
    const {name, password, domain} = event['body-json'];
    
  
    
    
    const queries = {
        TableName: userTableName,
        Key: {
            'domain' : domain,
            'loginName': name
        }
    };
    
    try {
        //verify
        await verifyCode(event['body-json']);
        
        const getResp = await docClient.get(queries).promise();
        console.log('get userInfo resp: ',JSON.stringify(getResp, null, 2));
        
        if (getResp.Item){
           
            //update dynamo
            let UpdateExpression = 'SET #PASSWORD = :password'
            let ExpressionAttributeNames = {
                '#PASSWORD': 'password'
               
            };
            let ExpressionAttributeValues = {
                ':password': password,
               
            };
        
            
            let params = {
                TableName: userTableName,
                Key: {
                    'domain': domain,
                    'loginName': name,
                },
                UpdateExpression: UpdateExpression,
                ExpressionAttributeNames: ExpressionAttributeNames,
                ExpressionAttributeValues: ExpressionAttributeValues,
                ReturnValues:'UPDATED_NEW'
            };
        
            await docClient.update(params).promise();
            
            console.log('update dynamo done');
            
            //update cognito
            await updatePasswordToCognito(name, password)
            
            console.log('update cognito done')
            const response = {
                statusCode: 200,
                message: 'パスワード更新されました。',
            };
            
            return response;
            
        }else{
            console.log('get userInfo fail')
            const response = {
                statusCode: 400,
                message: 'ユーザー情報が見つかりません。',
            };
            
            return response;
        }
    }catch(err){
       
        console.log(err)
        const response = {
            statusCode: 400,
            message: err.message || JSON.stringify(err),
            code : err.code || 3
        };
        
        return response;
    }
  
};


function verifyCode(data){
    
    var paramsVerify = {
        ClientId: clientId,
        Username: data.name,
        Password: data.password,
        ConfirmationCode: data.code,
    };
      
    let client = new AWS.CognitoIdentityServiceProvider();
         
    return new Promise((resolve, reject) => { 
        client.confirmForgotPassword(paramsVerify, function(err, data) {
            if (err) {
                console.log("confirmForgotPasswrod:Error", err);
                reject(err);
            } else {
                console.log("confirmForgotPasswrod:Verify Success");
                resolve(data);
            }  
        })
    })
}

function updatePasswordToCognito(name, password){
    
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    return new Promise((resolve, reject) => {
        var params = {
          Password: password, 
          UserPoolId: UserPoolId,
          Username: name, /* required */
          Permanent: true 
        };
        
        cognitoidentityserviceprovider.adminSetUserPassword(params, function(err, data) {
          if (err) reject(err)// an error occurred
          else  resolve(data);           // successful response
        });
    })
}
