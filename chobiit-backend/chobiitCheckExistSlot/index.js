
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const chobiitPluginId = process.env.chobiitPluginId;

const USER_TABLE_NAME = 'chobitoneUser';
const CONFIG_TABLE = 'chobiitConfig';

exports.handler = async (event) => {
    console.log(event)
    
    let domain = event.params.querystring.domain;
    
    
    let check = false;
    

    const configQuery = {
        TableName: CONFIG_TABLE,
        Key: {
            domain: domain,
        }
    }
    
    let config = await dynamoDB.get(configQuery).promise();
    const limit = await getLimit(domain, chobiitPluginId);
    
    const maxUser = limit || config.Item.maxUser;
    
    console.log('maxUser: ',maxUser);
    const userAuthKintones = config.Item.userAuthKintones;
    
    let userQuery = {
        TableName: USER_TABLE_NAME,
        FilterExpression: "#dm = :dd",
        ExpressionAttributeNames:{
            "#dm": "domain",
        },
        ExpressionAttributeValues: {
            ":dd": domain,
        }
    }
   
    let allUsers =  await scanTable(userQuery, dynamoDB);
    let formatUsers = groupBy(allUsers,'kintoneLoginName');
        
    if (userAuthKintones){
       
        
       
    
        for (let i = 0; i < userAuthKintones.length; i++){
            let kintoneLoginName = userAuthKintones[i];
            
          
            
            let userByKintoneKey = formatUsers[kintoneLoginName];
            
            let userByKintoneKeyLength = userByKintoneKey ? userByKintoneKey.length : 0;
            
            console.log('userByKintoneKeyLength: ',userByKintoneKeyLength)
            
            if (userByKintoneKeyLength < maxUser) {
                check = true;
                break;
            }
        }
    }
    
    
    console.log('check: ',check);
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            check : check
        }),
    };
    return response;
};

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
