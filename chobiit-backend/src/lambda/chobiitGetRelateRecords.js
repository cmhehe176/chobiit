const AWS = require('aws-sdk');
const request = require('request');
const groupTable = 'chobitoneGroup'

const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';
const appTableName = 'chobitoneApp';


exports.handler = (event, context, callback) => {
  
    console.log('Starting get relate records...', JSON.stringify(event, null, 2));
    
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];
    
    const relateInfo = JSON.parse(event["body"]);
    const srcAppId = event.pathParameters.id;
    const srcRecordId = event.pathParameters.recordId;


 
    const queries = {
        TableName: userTableName,
        Key: {
            'domain': domain,
            'loginName': loginName
        }
    };

    docClient.get(queries, function (err, data) {
        if (err) {
            console.error('Unable to get user info. Error:', JSON.stringify(err, null, 2));
            return handleError(err, callback);
        } else {
            if (data.Item ) {
                return getRelateRecords(data.Item, relateInfo, srcAppId, srcRecordId,  callback);
            }

            return handleError(new Error('Invalid token'), callback);
        }
    });
          
    

};

function getRelateRecords(userInfo, relateInfo, srcAppId, srcRecordId, callback) {
    let kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
    let authorizedToken = userInfo.cybozuToken;
    
    let fieldValue = relateInfo.fieldValue
    let appId = relateInfo.referenceInfo.relatedApp.app;
    let relatedField = relateInfo.referenceInfo.condition.relatedField;
    let size = relateInfo.referenceInfo.size;
    let filterCond = relateInfo.referenceInfo.filterCond;
    let sort = relateInfo.referenceInfo.sort;
    //let displayFields = relateInfo.referenceInfo.displayFields;
    
    let query = `${relatedField} = "${fieldValue}" `
    //let query = ``;
    if (filterCond != " "){
        query = query + ' and ' + filterCond;
    }
   query = query + ` order by ${sort}`; 
    
    const requestOptions = {
        method: 'GET',
        uri: `${kintoneDomain}/k/v1/records.json`,
        headers: {
            'X-Cybozu-Authorization': authorizedToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            app: +appId,
            query: query,
            //fields : displayFields
        },
    };

    console.log('Call kintone API get record with body: ', JSON.stringify(requestOptions.body, null, 2));
    
    let getRecordPromise = new Promise((resolve, reject) => {  
        request(requestOptions, function (err, response, body) {
            if (err) {
                console.log('KintoneAPI get records error', JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log('KintoneAPI get records response:', JSON.stringify(body, null, 2));
                
                let records = body.records;
                if (srcAppId == appId){
                    records = records.filter(record => record.$id.value != srcRecordId);
                    //records = records.filter(record => record[relatedField].value == fieldValue);
                    resolve(records);
                }else {
                    resolve(records);
                }
            }
        });
    });
    
    getRecordPromise
    .then(async(records) => {
        
        const extractedRecords = await extractRecordsByOwnerAndGroup(records, appId, userInfo)
        handleSuccess(extractedRecords, callback)     
    })
    .catch(err => {
        handleError(err, callback);
    })
    
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

            

function handleSuccess(records, callback) {
    console.log('Handle success:');
    console.log(records);

    let responseBody = {
        code: 200,
        message: 'Get relate records succeed',
        records: records
    };

    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback) {
    console.error(error)
    let responseBody = {
        code: 400,
        message: error.message,
        messageDev : error
    };
    
    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };
    
    callback(null, response);
}



function getHeader(origin) {

    
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

async function extractRecordsByOwnerAndGroup(records, appId, userInfo) {
    console.debug(userInfo, appId)
    const appInfo = await getAppSetting(userInfo.domain, appId)  
    console.debug('App info:', appInfo)
    if (appInfo){

        let {userGroups, allGroups} = await getUserGroups(userInfo.domain, userInfo.loginName)
        if (appInfo.groupView && appInfo.ownerView){
            console.debug('Group view and owner view')
            return records.filter(record => {
 
                let checkGroupView = 
                ( userGroups.length &&  record[appInfo.groupView] && record[appInfo.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group))) 

                let checkOwerView = record[appInfo.creator]?.value == userInfo.loginName;
                
                return checkGroupView || checkOwerView
            })
        }else if(appInfo.groupView && !appInfo.ownerView){
            console.debug('Group view only')
            return records.filter(record => {

                let checkGroupView = ( userGroups.length &&  record[appInfo.groupView] && record[appInfo.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group)))
                
                return checkGroupView;
            })
        }else if (!appInfo.groupView && appInfo.ownerView){
            console.debug('Owner view only')
            return records.filter(record => {
                let checkOwerView = record[appInfo.creator]?.value == userInfo.loginName;
                
                return  checkOwerView
            })

        } else {
            console.debug('No group view and owner view')
            return records;
        }
    }
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
