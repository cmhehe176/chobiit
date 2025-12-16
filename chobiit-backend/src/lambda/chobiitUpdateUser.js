//DynamoDB
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({
});

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const UserPoolId = process.env.UserPoolId;

const TABLE_NAME = 'chobitoneUser';
const INDEX_NAME = 'kintoneLoginName-index';
const MSG_SUCCESS = "SUCCESS";
const MSG_ERROR = "Error DynamoDBへ更新失敗";




exports.handler = (event, context, callback) => {

    console.log('starting update chobiit user: '+JSON.stringify(event, null, 2))
    
     const apiKey = event.params.header["x-api-key"] || event.params.header["X-Api-Key"]; 
    authenticate(apiKey)
    .then(domain => {  
        if(domain){
            let eventBody = event['body-json'];
       
            let name                 = eventBody.name;
            let loginName            = eventBody.loginName;
            let apps                 = eventBody.apps;
            let mailAddress          = eventBody.mailAddress;
            let kintoneLoginName     = eventBody.kintoneLoginName;
            let kintoneUsername      = eventBody.kintoneUsername;
            let cybozuToken          = eventBody.cybozuToken ;
            let kintoneOrganizations = eventBody.kintoneOrganizations;
            let kintoneGroups        = eventBody.kintoneGroups;
            let isAdmin              = eventBody.isAdmin;
            let password             = eventBody.password;
           
           
            
            if (password){
                let params = {
                    TableName: TABLE_NAME,
                    Key: {
                            "domain" : domain,
                            "loginName": loginName
                    },
                    UpdateExpression: "SET #NAME = :n, #APP = :app,  #MAIL = :m, #KLOGINNAME = :kl, #KUSERNAME = :ku, #CTOKEN = :ct, #KORG = :ko, #KGR = :kg, #IA = :isad, #PS = :pas" ,
                    ExpressionAttributeNames: {
                        "#NAME"       : "name",
                        "#APP"        : "apps",
                        "#MAIL"       : "mailAddress",
                        "#KLOGINNAME" : "kintoneLoginName",
                        "#KUSERNAME"  : "kintoneUsername",
                        "#CTOKEN"     : "cybozuToken",
                        "#KORG"       : "kintoneOrganizations",
                        "#KGR"        : "kintoneGroups",
                        "#IA"         : "isAdmin",
                        "#PS"         : "password",
                    },
                    ExpressionAttributeValues: {
                        ":n" : name,
                        ":app" : JSON.stringify(apps),
                        ":m" :  mailAddress,
                        ":kl" : kintoneLoginName,
                        ":ku" : kintoneUsername,
                        ":ct" : cybozuToken,
                        ":ko" : JSON.stringify(kintoneOrganizations),
                        ":kg" : JSON.stringify(kintoneGroups),
                        ":isad": isAdmin,
                        ":pas" : password,
                    },
                    ReturnValues: "ALL_NEW"
                };
                
                 dynamo.update(params, function(error, tableData){
                    if(error){
                        console.error("[Error] DynamoDBからの更新失敗 error:", JSON.stringify(error));
                         callback(null, MSG_ERROR);
                        return;
                    }
                    console.log("DynamoDBからの更新成功！");
                    console.log("DynamoへのPost成功 data:", JSON.stringify(tableData));
                    
                    Promise.all([
                        updateEmailToCognito({email : mailAddress, loginName: loginName}),
                        updatePasswordToCognito({password : password, loginName: loginName}),
                    ])
                    // updatePasswordToCognito({password : password, loginName: loginName})
                    .then(() => {
                        callback(null, MSG_SUCCESS);    
                    })
                    .catch(err => {
                        console.log(err) 
                         callback(null, MSG_ERROR);
                    })
                    
                }); 
                
            }else{
                let params = {
                    TableName: TABLE_NAME,
                    Key: {
                            "domain" : domain,
                            "loginName": loginName
                    },
                    UpdateExpression: "SET #NAME = :n, #APP = :app,  #MAIL = :m, #KLOGINNAME = :kl, #KUSERNAME = :ku, #CTOKEN = :ct, #KORG = :ko, #KGR = :kg, #IA = :isad" ,
                    ExpressionAttributeNames: {
                        "#NAME"       : "name",
                        "#APP"        : "apps",
                        "#MAIL"       : "mailAddress",
                        "#KLOGINNAME" : "kintoneLoginName",
                        "#KUSERNAME"  : "kintoneUsername",
                        "#CTOKEN"     : "cybozuToken",
                        "#KORG"       : "kintoneOrganizations",
                        "#KGR"        : "kintoneGroups",
                        "#IA"         : "isAdmin",
                    },
                    ExpressionAttributeValues: {
                        ":n" : name,
                        ":app" : JSON.stringify(apps),
                        ":m" :  mailAddress,
                        ":kl" : kintoneLoginName,
                        ":ku" : kintoneUsername,
                        ":ct" : cybozuToken,
                        ":ko" : JSON.stringify(kintoneOrganizations),
                        ":kg" : JSON.stringify(kintoneGroups),
                        ":isad": isAdmin,
                    },
                    ReturnValues: "ALL_NEW"
            
                }
                
                 dynamo.update(params, function(error, tableData){
                    if(error){
                        console.error("[Error] DynamoDBからの更新失敗 error:", JSON.stringify(error));
                         callback(null, MSG_ERROR);
                        return;
                    }
                    console.log("DynamoDBからの更新成功！");
                    console.log("DynamoへのPost成功 data:", JSON.stringify(tableData));
                     updateEmailToCognito({email : mailAddress, loginName: loginName})
                    .then(() => {
                        callback(null, MSG_SUCCESS);    
                    })
                    .catch(err => {
                        console.log(err)
                         callback(null, MSG_ERROR);
                    })
                });
               
               
            }
        }else{
            callback(null, 'Access Denied')
        }
    })
    .catch(err => {
       callback(null, err.message);
    })
    
    
};

function updatePasswordToCognito({password, loginName}){
    return new Promise((resolve, reject) => {
        var params = {
          Password: password, 
          UserPoolId: UserPoolId,
          Username: loginName, /* required */
          Permanent: true 
        };
        
        cognitoidentityserviceprovider.adminSetUserPassword(params, function(err, data) {
          if (err) reject(err)// an error occurred
          else  resolve(data);           // successful response
        });
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
 