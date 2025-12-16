//DynamoDB
const AWS = require('aws-sdk');
const request = require('request');

const dynamoDB = new AWS.DynamoDB.DocumentClient();


const clientId = process.env.ClientId;
const chobiitPluginId = process.env.chobiitPluginId;

const CONFIG_TABLE = 'chobiitConfig';
const USER_TABLE= 'chobitoneUser';
const KINTONE_TABLE = process.env.KINTONE_TABLE;

exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    const eventBody = event['body-json'];
    let result = false;
    
    try {
        //verify
        await verifyCodeSignup(eventBody);
        
        //get config
        const configQuery = {
            TableName: CONFIG_TABLE,
            Key: {
                domain: eventBody.domain,
            }
        }
        
        const  config = await dynamoDB.get(configQuery).promise();
        
        //get kintone user
        const kintnoneUserQuery = {
            TableName: KINTONE_TABLE,
            FilterExpression: "#dm = :dd ",
            ExpressionAttributeNames:{
                "#dm": "domain",
            },
            ExpressionAttributeValues: {
                ":dd": eventBody.domain,
              
            }
        };
        
        const kintoneUsers = await scanTable(kintnoneUserQuery, dynamoDB)
       
    
        const limit = await getLimit(eventBody.domain, chobiitPluginId);
    
        const maxUser = limit || config.Item.maxUser;    
        console.log('maxUser: ',maxUser);
       
        const userAuthKintones = config.Item.userAuthKintones;
      
        
        let userQuery = {
            TableName: USER_TABLE,
            FilterExpression: "#dm = :dd",
            ExpressionAttributeNames:{
                "#dm": "domain",
            },
            ExpressionAttributeValues: {
                ":dd": eventBody.domain,
            }
        }
   
        let allUsers =  await scanTable(userQuery, dynamoDB);
        let formatUsers = groupBy(allUsers,'kintoneLoginName');
        
        if (!userAuthKintones) throw new Error('Access denied');
        
        for (let i = 0; i < userAuthKintones.length; i++){
                let kintoneUser = kintoneUsers.find(x => x.kintoneLoginName == userAuthKintones[i]);
                
                console.log('kintoneUser:', kintoneUser)
                
                if (!kintoneUser){
                    throw new Error('Kintnone user not found');
                }
                
                
               
                
                let userByKintoneKey = formatUsers[kintoneUser.kintoneLoginName]
                
                 let userByKintoneKeyLength = userByKintoneKey ? userByKintoneKey.length : 0;
               
                console.log('userByKintoneKeyLength: ',userByKintoneKeyLength) 
                
                if (userByKintoneKeyLength < maxUser) {
                    let kintoneUserInfo = await getKintoneUserInfo(kintoneUser)
                    //add to dynamo
                    const params = {
                        TableName: USER_TABLE,
                        Item:{
                            domain               : eventBody.domain,
                            name                 : eventBody.name,
                            loginName            : eventBody.name,
                            password             : eventBody.password,
                            apps                 : config.Item.userAuthApps,
                            mailAddress          : eventBody.email,
                            kintoneLoginName     : kintoneUser.kintoneLoginName,
                            kintoneUsername      : kintoneUserInfo.kintoneUsername,
                            cybozuToken          : kintoneUser.cybozuToken,
                            kintoneOrganizations : JSON.stringify(kintoneUserInfo.kintoneOrganizations),
                            kintoneGroups        : JSON.stringify(kintoneUserInfo.kintoneGroups),
                            isAdmin              : false,
                            userAuth             : true,
                         
                        }
                    };
                        
                    console.log('Add user params: ',JSON.stringify(params, null, 2));
                    
                    
                    await dynamoDB.put(params).promise();
                    await sendMail(config, eventBody);
                    
                    console.log('send mail done')
                    
                    result = true;
                    break;
                }
                
            }
        
        
    }catch (err){
        console.log(err);
        const response = {
            statusCode: 400,
            message: err.message || JSON.stringify(err),
            code: err.code || 3
        };
        return response;
    }
    
    if (result){
        console.log('update success');
        
        const response = {
            statusCode: 200,
            message: 'success',
        };
        
        return response;
    }else{
        console.log('update fail')
        
        const response = {
            statusCode: 400,
            message: 'user limit',
        };
        return response;
    }
    
};


function verifyCodeSignup(data){
    
    var paramsVerify = {
        ClientId: clientId,
        Username: data.name,
        ConfirmationCode: data.code,
    };
      
    let client = new AWS.CognitoIdentityServiceProvider();
         
    return new Promise((resolve, reject) => { 
        client.confirmSignUp(paramsVerify, function(err, data) {
            if (err) {
                console.log("confirmSignUp:Error", err);
                reject(err);
            } else {
                console.log("confirmSignUp:Verify Success");
                resolve(data);
            }  
        })
    })
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


async function getKintoneUserInfo(kintoneUser){
    let kintoneDomain = kintoneUser.domain.indexOf('https') < 0 ? `https://${kintoneUser.domain}` : kintoneUser.domain;
    let authorizedToken = kintoneUser.cybozuToken;
    const requestGroupOptions = {
        method: 'GET',
        uri: `${kintoneDomain}/v1/user/groups.json`,
        headers: {
            'X-Cybozu-Authorization': authorizedToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            code: kintoneUser.kintoneLoginName,
        },
    };

    console.log('Call kintone API with body: ', JSON.stringify(requestGroupOptions.body, null, 2));
    let groups = await  new Promise ((resolve, reject) => {
        request(requestGroupOptions, function (err, response, body) {
            if (err) {
                console.log('Call KintoneAPI failed.', JSON.stringify(err, null, 2));
               reject(err)
            } else {
                console.log('KintoneAPI response.', JSON.stringify(body, null, 2));
                if (body.code) {
                     reject(body)
                    
                   
                } else {
                    resolve(body)
                }
            }
        });
    })
    
    
    const requestOrganizationOptions = {
        method: 'GET',
        uri: `${kintoneDomain}/v1/user/organizations.json`,
        headers: {
            'X-Cybozu-Authorization': authorizedToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            code: kintoneUser.kintoneLoginName,
        },
    };

    console.log('Call kintone API with body: ', JSON.stringify(requestOrganizationOptions.body, null, 2));
    let departments = await  new Promise ((resolve, reject) => {
        request(requestOrganizationOptions, function (err, response, body) {
            if (err) {
                console.log('Call KintoneAPI failed.', JSON.stringify(err, null, 2));
               reject(err)
            } else {
                console.log('KintoneAPI response.', JSON.stringify(body, null, 2));
                if (body.code) {
                     reject(body)
                    
                } else {
                    resolve(body)
                }
            }
        });
    })
    
    
    let organizationArr = [];
    let groupArr = [];

    let departs = departments.organizationTitles;
    let grs = groups.groups;
    for (let i = 0; i < departs.length; i++) {
        let depart = departs[i];
        if (depart.organization){
            organizationArr.push(depart.organization.code);
        }
    }
    for (let i = 0; i < grs.length; i++){
        let gr = grs[i];
        groupArr.push(gr.code);
    }
        
    const requestUserInfoOptions = {
        method: 'GET',
        uri: `${kintoneDomain}/v1/users.json`,
        headers: {
            'X-Cybozu-Authorization': authorizedToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            codes: [kintoneUser.kintoneLoginName],
        },
    };

    console.log('Call kintone API with body: ', JSON.stringify(requestUserInfoOptions.body, null, 2));
    let user = await  new Promise ((resolve, reject) => {
        request(requestUserInfoOptions, function (err, response, body) {
            if (err) {
                console.log('Call KintoneAPI failed.', JSON.stringify(err, null, 2));
               reject(err)
            } else {
                console.log('KintoneAPI response.', JSON.stringify(body, null, 2));
                if (body.code) {
                     reject(body)
                    
                } else {
                    resolve(body.users[0])
                }
            }
        });
    }) 
    
    return {
        kintoneOrganizations : organizationArr,
        kintoneGroups : groupArr,
        kintoneUsername : user.name
    }
}

async function sendMail(config, eventBody){
    const SENDER = process.env.SENDER;
    const lambda = new AWS.Lambda({
     region: 'us-east-1'
    });
    
    const showName = config.Item.showName || 'Chobiit'
    
    let mailContent = `${eventBody.name} 様`;
        mailContent += "\n";
        mailContent += `\n${showName}をご利用頂き誠にありがとうございます。`;
        mailContent += "\n以下のページよりログインしてください。";  
        mailContent += "\n";
         mailContent += `\nログインURL：https://${eventBody.domain.split('.')[0]}.chobiit.me`;
        mailContent += `\nログイン名：${eventBody.name}`;
        mailContent += "\n";
        mailContent += "\n---------------------------------";
        mailContent += `\n${showName}`;
    const data = {
        email : eventBody.email,
        subject : `【${showName}】登録完了`,
        content : mailContent,
        sender : SENDER 
    }
    const params = {
          InvocationType: "RequestResponse",
          Payload: JSON.stringify(data),
          FunctionName : 'sendMailModule'
        };
    

    await lambda.invoke(params).promise();
        
}

function groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    var key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

async function getLimit(domain, pluginID){

    const lambda = new AWS.Lambda({
        region: 'us-east-1'   
    });
    
    
    const params1 = {
      InvocationType: "RequestResponse",
      Payload: JSON.stringify({domain: domain, pluginID: pluginID}),
      FunctionName : 'getPluginAuthState'
    };
        
    const resp = await lambda.invoke(params1).promise();
    console.log('resp1: ',JSON.stringify(resp));
    
    let body = JSON.parse(resp.Payload);
    
    
    console.log('body: ',JSON.stringify(body, null, 2));
    
                
    return body.data.limit;
}
