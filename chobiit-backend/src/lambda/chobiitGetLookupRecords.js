const AWS = require('aws-sdk');

const kintone = require('@kintone/kintone-js-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';
const appTableName ='chobitoneApp'
const groupTable = 'chobitoneGroup'
 
const lambdaMax = 6291456;

const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const localeService = LocaleService.getInstance("backend");

const { extractFieldFromLookupRecords } = require("../application/extract-field-from-lookup-records")
/**
``` event.body type
type ChobiitGetLookupRecordsFunctionParams = {
  fieldCode: string;
  fieldValue: string;
  fieldType: "SINGLE_LINE_TEXT" | "NUMBER";
  lookup: LookupInfo
}
```
 */

exports.handler = (event, context, callback) => {
    console.log('Starting get lookup records...', JSON.stringify(event, null, 2));
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
     const loginName  =  event.requestContext.authorizer.claims['nickname']; 
    
    const lookupInfo = JSON.parse(event["body"]);
    
    const fromAppId = event.pathParameters.id;

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
            if (data.Item) {
                getLookupRecords(data.Item, lookupInfo, fromAppId,  callback)
                .then(records => {
                    
                    const recordsSize  = Buffer.byteLength(JSON.stringify(records));
                    console.log('recordsSize: ',recordsSize);
                    
                    if (recordsSize > lambdaMax){
                        let errMsg = localeService.translate('error', 'too-many-lookup-results')
                        handleError(new Error(errMsg), callback);     
                    }else{
                        console.log('all records: ',JSON.stringify(records, null, 2));
                        handleSuccess(records, callback)       
                    }
                        
                })
                .catch(err => handleError(err, callback));
            }else{
                    return handleError(new Error('Invalid token'), callback);     
            }                   
        }
    });
};

async function getLookupRecords(userInfo, lookupInfo, fromAppId, callback) {
    
    console.log('userInfo: ',JSON.stringify(userInfo, null, 2))
    let authorizedToken = userInfo.cybozuToken;
    
    let buff = new Buffer.from(authorizedToken, 'base64');
    let decoded = buff.toString('utf8');
    //console.log('decoded : ', decoded)
    let pass = decoded.substr(decoded.indexOf(':')+1);
  
    let passwordAuthParam = {
        username: userInfo.kintoneLoginName,
        password: pass
    };
    
    console.log('passwordAuthParam: ',JSON.stringify(passwordAuthParam, null, 2))
    let kintoneAuth = new kintone.Auth();
    kintoneAuth.setPasswordAuth(passwordAuthParam);

    let paramsConnection = {
        domain: userInfo.domain,
        auth: kintoneAuth
    };
    let connection = new kintone.Connection(paramsConnection);
    let kintoneRecord = new kintone.Record({connection})
    
    //let showFields = lookupInfo.lookup.lookupPickerFields.unshift(lookupInfo.lookup.relatedKeyField);
    let query = lookupInfo.lookup.filterCond;
    
    let fromAppConfig = await docClient.get({
        TableName: appTableName,
        Key: {
            'domain': userInfo.domain,
            'app': fromAppId
        }
    }).promise();
    
    let isLkCompleteMatch = fromAppConfig.Item.lkCompleteMatch && fromAppConfig.Item.lkCompleteMatch.includes(lookupInfo.fieldCode);
    
    console.log('isLkCompleteMatch: ',isLkCompleteMatch)
    
    if (isLkCompleteMatch){
        if(lookupInfo.fieldValue){
             if (query == ' '){
                    query = `${lookupInfo.lookup.relatedKeyField} = "${lookupInfo.fieldValue}"`;
            }else{
                query += ` and ${lookupInfo.lookup.relatedKeyField} = "${lookupInfo.fieldValue}"`;      
            }
        }else{
            return [];
        }
    }else{
        if(lookupInfo.fieldValue){
            if(lookupInfo.fieldType == 'SINGLE_LINE_TEXT'){
                if (query == ' '){
                    query = `${lookupInfo.lookup.relatedKeyField} like "${lookupInfo.fieldValue}"`;
                }else{
                    query += ` and ${lookupInfo.lookup.relatedKeyField} like "${lookupInfo.fieldValue}"`;      
                }
            } 
             if(lookupInfo.fieldType == 'NUMBER'){
                if (query == ' '){
                    query = `${lookupInfo.lookup.relatedKeyField} = "${lookupInfo.fieldValue}"`;
                }else{
                    query += ` and ${lookupInfo.lookup.relatedKeyField} = "${lookupInfo.fieldValue}"`;      
                }
             }
        }
    }
    
    query += ` order by ${lookupInfo.lookup.sort}`
    let rcOption = {
        app: lookupInfo.lookup.relatedApp.app,
        //fields: showFields,
        query: query
    };
    
    console.log('query :', query);
    
    let resp = await  kintoneRecord.getAllRecordsByCursor(rcOption).catch(err => {
        throw err.error.errorResponse
    })
    
    let records = resp.records;
    
    const getParam = {
        TableName: appTableName,
        Key: {
            'domain': userInfo.domain,
            'app': lookupInfo.lookup.relatedApp.app
        }
    };
    
    let relatedAppConfig = await docClient.get(getParam).promise();
    
    if (relatedAppConfig && relatedAppConfig.Item  && !isLkCompleteMatch){
        let appInfo =  relatedAppConfig.Item;
        
        console.log('app relate info: ', JSON.stringify(appInfo, null, 2))
        
        let {userGroups, allGroups} = await getUserGroups(userInfo.domain, userInfo.loginName)
        if (appInfo.groupView && appInfo.ownerView){
            
            records = records.filter(record => {
                // let checkGroupView = record[appInfo.groupView] && record[appInfo.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group))
                
                let checkGroupView = 
                ( userGroups.length &&  record[appInfo.groupView] && record[appInfo.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group)))
    
                let checkOwerView = record[appInfo.creator]?.value == userInfo.loginName;
                
               
                return checkGroupView || checkOwerView
            })
        }else if(appInfo.groupView && !appInfo.ownerView){
            records = records.filter(record => {
                // let checkGroupView = record[appInfo.groupView] && record[appInfo.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group))
                
                let checkGroupView = ( userGroups.length &&  record[appInfo.groupView] && record[appInfo.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group)))
                
                return checkGroupView;
            })
        }else if (!appInfo.groupView && appInfo.ownerView){
            records = records.filter(record => {
                let checkOwerView = record[appInfo.creator]?.value == userInfo.loginName;
                
                return  checkOwerView
            })   
        }
    }

    const extractedRecords = extractFieldFromLookupRecords({
        records: records,
        lookupInfo: lookupInfo.lookup,
        lkCompleteMatch: fromAppConfig.Item.lkCompleteMatch 
    });
    
    return extractedRecords;
}          
    
function handleSuccess(records, callback) {
    console.log('Handle success:');
    console.log(records);

    let responseBody = {
        code: 200,
        message: 'Get lookup records succeed',
        records: records
    };

    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback) {
    console.log('Handle error:', error.message || JSON.stringify(error, null, 2));
    
    let responseBody = {
        code: 400,
        messageDev : error,
        message: error.message
    };
    
    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };
    callback(null, response);
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
