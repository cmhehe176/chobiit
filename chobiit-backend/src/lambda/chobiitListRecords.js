const AWS = require('aws-sdk');
const request = require('request');
const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const {default: ListRecordsService} = require("./../application/list-records-service");
const { ListViewService } = require('chobiit-common/src/application/list-view-service');

const localeService = LocaleService.getInstance("backend");
const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';
const appTableName = 'chobitoneApp';
const groupTable = 'chobitoneGroup';


const KINTONE_EVALUATE_RECORDS_RIGHT_IDS_LIMIT = 100;

const CHOBIIT_USAGE_SITUATION = "private";

exports.handler = (event, context, callback) => {
                
    console.log('Starting handle list records.', JSON.stringify(event, null, 2));
    
    const appId = event.pathParameters.id;
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];
    
    let pageNumber = event.queryStringParameters.page ? event.queryStringParameters.page : 0;
    const startDate = event.queryStringParameters.startDate;
    const endDate = event.queryStringParameters.endDate;
    const filterTerms = event.queryStringParameters.filterTerms;
    const viewId = event.queryStringParameters.viewId;

    const queries = {
        TableName: userTableName,
        Key: {
            'domain' : domain,
            'loginName': loginName
        }
    };

    // compare token from request with token from database
    docClient.get(queries, function (err, data) {
        if (err) {
            console.error('Unable to get user info from DynamoDB. Error:', JSON.stringify(err, null, 2));
            return handleError(err, callback);
        } else {
            console.log('Get user info from dynamoDB succeed', JSON.stringify(data, null, 2));
            if (data.Item && data.Item.apps.includes(appId)) {
                data.Item.appId = appId;
                if (validateDateTimes(startDate) && validateDateTimes(endDate)) {
                    return getRecords(data.Item, pageNumber, callback, startDate, endDate, filterTerms, viewId);
                }
                return handleError(new Error(localeService.translate("validation", "invalid-start-end-date-format")), callback);
            }

            return handleError(new Error(localeService.translate("error", "not-permitted")), callback);
        }
    });
   
};

async function getRecords(data, pageNumber, callback, startDate, endDate, filterTerms, viewId) {
    const kintoneDomain = data.domain.indexOf('https') < 0 ? `https://${data.domain}` : data.domain;
    const authorizedToken = data.cybozuToken;
    
    try {
        const appInfo = await getAppInfo(data.domain, data.appId);
        let query = '';
        let offset = pageNumber * 100;
        let {recordCond1, calendarView} = ListViewService.getCurrentListView(appInfo,viewId)
        
        if(recordCond1 && recordCond1.type == 'LIST'){
            query = recordCond1.filterCond;
        }
        
        if (calendarView){
            const calendarQuery = `( ( ${calendarView.event_start} >=  "${startDate}" and ${calendarView.event_start} <=  "${endDate}" ) or ( ${calendarView.event_start} <=  "${startDate}" and ${calendarView.event_end} >=  "${startDate}" ) )`
            if (query == "" || query == " "){
                 query = calendarQuery
            }else{ 
                 query = query + ' and ' + calendarQuery
            }
            console.log('query calendarView: '+query);
        }     
        console.log('query: ',query)
          
        let {userGroups, allGroups} = await getUserGroups(data.domain, data.loginName)
        if (appInfo.groupView && appInfo.ownerView){
            let groupQuery = "";
            if (userGroups.length){
                 userGroups.forEach((group, index) =>{
                    groupQuery += `${appInfo.groupView} like "${group}"`;
                    if (index != userGroups.length -1){
                        groupQuery += " or ";
                    }
                })     
            }

            if (query == "" || query == " "){
                 if (groupQuery){
                    query = `(  ${appInfo.creator} = "${data.loginName}" )   or  ( ${groupQuery} )`    
                 }else{
                    query = `(  ${appInfo.creator} = "${data.loginName}" ) `       
                 }
            }else{
                if (groupQuery){
                    query = `( ${query} )   and ( (  ${appInfo.creator} = "${data.loginName}" )   or  ( ${groupQuery} ) )`    
                }else{
                    query = `( ${query} )   and (  ${appInfo.creator} = "${data.loginName}" )   `  
                }
            }
        }else if(appInfo.groupView && !appInfo.ownerView){
            let groupQuery = "";
            if (userGroups.length){
                 userGroups.forEach((group, index) =>{
                    groupQuery += `${appInfo.groupView} like "${group}"`;
                    if (index != userGroups.length -1){
                        groupQuery += " or ";
                    }
                })     
            }
            
            if (query == "" || query == " "){
                 if (groupQuery){
                    query = `${groupQuery}`    
                 }
            }else{
                if (groupQuery){
                    query = `( ${query} )   and ( ${groupQuery} )`    
                }else{
                    query = `( ${query} )`    
                }
            }
        }else if (!appInfo.groupView && appInfo.ownerView){
            if (query == "" || query == " "){
                 query += `${appInfo.creator} = "${data.loginName}"`
            }else{
                 query = `( ${query} )   and ( ${appInfo.creator} = "${data.loginName}" )` 
            }
        }
        
        query = createKintoneQuery(query, filterTerms);
        if (recordCond1 && recordCond1.sort != ' '){
             query = query + ` order by ${recordCond1.sort}`;
        }
        const queryByContext = !!calendarView ? query : `${query} offset ${offset}`;
        const getKintonRecordsByContext = !!calendarView ? ListRecordsService.listCalendarRecords(CHOBIIT_USAGE_SITUATION) : ListRecordsService.listRecords(CHOBIIT_USAGE_SITUATION);
        const getRecordsParams = {app: appInfo.app, query: queryByContext};
    	const {totalCount, records} = await getKintonRecordsByContext(kintoneDomain, authorizedToken, getRecordsParams, appInfo);
        const recordsIds = records.map(({"$id": {value}}) => value )
        const idSlices = chunkArray(recordsIds, KINTONE_EVALUATE_RECORDS_RIGHT_IDS_LIMIT);
        let rights;
        let mergeEvaluateRecords = [];   
        if (recordsIds.length) {
            for ( let idSlice of idSlices ) {
                const evaluateRecords = await getRecordsRight(kintoneDomain, authorizedToken, data.appId, idSlice)
                mergeEvaluateRecords = mergeEvaluateRecords.concat(evaluateRecords)
            }   
        }

        if (mergeEvaluateRecords.length) {
            rights = mergeEvaluateRecords
        } 
                  
        const fieldTypeViewAble = ['SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT', 'NUMBER', 'RADIO_BUTTON',
                                   'CHECK_BOX', 'MULTI_SELECT', 'DROP_DOWN', 'DATETIME', 'TIME', 'DATE', 'LINK', 'FILE',  'CALC', 'STATUS'];

        const showFields = {}
        Object.keys(appInfo.fields).forEach(fieldCode => {
            const fieldData = appInfo.fields[fieldCode];
            // 表示可能なフィールドであるかどうか
            const isAbleToDisplayField = fieldTypeViewAble.includes(fieldData.type)
            // フィールドの表示設定または、フィールド設定で使用しているフィールドであるかどうか
            const isUsedChobiitSettingField = [appInfo.groupView, appInfo.creator, appInfo.editor, appInfo.timeCond.createTime, appInfo.timeCond.editTime].includes(fieldCode)
            if (isAbleToDisplayField && !isUsedChobiitSettingField){
                if(fieldData.type === "STATUS" && !appInfo.statusInfo) {
                    console.log("Setting of status field is invalid.")
                    return   
                }
                Object.assign(showFields, {         
                    [fieldCode]: fieldData
                })
            }
        })

        if (rights) {
            let fields = Object.keys(rights[0].fields);
            for (let j = 0; j < fields.length; j++) {
                let field = fields[j];
                if (rights[0].fields[field].viewable == false && showFields.hasOwnProperty(field)) {
                    delete showFields[field];
                }
            }
        }
       
        if (recordCond1){  
            for (let key in showFields){
                if (!recordCond1.fields.includes(key)) delete showFields[key]; 
            }
        } 
                                
        const extractedRecords = extractRecordsByOwnerAndGroup(records, data, userGroups, appInfo)
        const viewableRecords = selectViewableRecords(extractedRecords, rights)

        handleSuccess({
            code: 200,
            appInfo: appInfo,
            showFields: showFields,
            records: viewableRecords,
            totalCount: totalCount,
            rights: rights,
            hasFilterTerms: typeof filterTerms !== "undefined",
        }, callback);

    }catch(err){
        handleError(err, callback)
    }
}

const createKintoneQuery = (essentialTerms, filterTerms) => {
    if(typeof filterTerms === "undefined") return essentialTerms;

    if(essentialTerms.trim() === "") return filterTerms;
    
    return `(${essentialTerms}) and (${filterTerms})`;
}

function getAppInfo(domain, appId) {
        return new Promise((resolve, reject) => {
            let queries = {
                TableName: appTableName,
                Key: {
                    'domain': domain,
                    'app': appId
                }
            };

            docClient.get(queries, function (err, data) {
                if (err) {
                    console.error('Unable to get app info from DynamoDB. Error:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    console.log('Get app info from DynamoDB succeed.', JSON.stringify(data));
                    if (data.Item) {
                        return resolve(data.Item);
                    }

                    reject(new Error('App not found'));
                }
            });
        });
    }

function getRecordsRight(kintoneDomain, authorizedToken,  appId, recordsIds) {
    return new Promise((resolve, reject) => {
        let getCondOptions = {
            method: 'GET',
            uri: `${kintoneDomain}/k/v1/records/acl/evaluate.json`,
            headers: {
                'X-Cybozu-Authorization': authorizedToken,
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                app: appId,
                ids: recordsIds
            }
        };
                        
        request(getCondOptions, (err, response, body) => {
            if (err) {
                console.log('KintoneAPI get rights error.', JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log('KintoneAPI get rights response.', JSON.stringify(body, null, 2));
                if (!body.hasOwnProperty('rights')) {
                    console.log('eeeee');
                    reject('err');
                }else {
                    resolve(body.rights);
                }
            }
        });
    })
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

function handleError(err, callback) {
    console.log('Handle error:', JSON.stringify(err, null, 2)); 
    
    let responseBody = {
        code: 400,
        message: err.message,
        messageDev: err
    };
    
    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleSuccess(responseBody, callback) {
    console.log('Handle success:', JSON.stringify(responseBody, null, 2));
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

/**
   * functions are used to divide array elements into sub-arrays
   * 
   * @param {*array to be divided} array 
   * @param {*number of elements in the subarray} chunkSize 
   * @returns arraySlices
   */
 function chunkArray(array, chunkSize) {
    const arraySlices = [];
    if (array.length) {
        for (let i = 0; i < array.length; i += chunkSize) {
            const cut = array.slice( i, i + chunkSize ) 
            arraySlices.push(cut)
        }
    }
    return arraySlices;
  }


/**
 * function used to validate the date and time format of the first day of the month and the end of the month
 * 
 * @param {*the first day of the month or the end of the month}day
 * @returns true or false
 */
function validateDateTimes(day) {
    const regex = /^([0-9]{4}\-[0-9]{2}\-[0-9]{2})+\T+[0-9]{2}\:[0-9]{2}\:[0-9]{2}\.[0-9]{3}\Z$/;
    return regex.test(day);
}

/**
 * filter record by record-right
 * 
 * @param {*} records 
 * @param {*} rights 
 * @returns 
 */
 function selectViewableRecords(records, rights) {
    if (rights) {
        return records.filter((record) => {
            const recordId = record.$id.value;
            const isViewable = (right) => {
                return right.id == recordId && right.record.viewable == true;
            };
            return rights.some(isViewable);
        })
    };
    return records;
    }

function extractRecordsByOwnerAndGroup(records, userInfo, userGroups, appInfo) {
    
    if (!appInfo){
        return [];
    }

    if (appInfo.groupView && appInfo.ownerView){
        
        return records.filter(record => {

            let checkGroupView = 
            ( userGroups.length &&  record[appInfo.groupView] && record[appInfo.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group))) 

            let checkOwerView = record[appInfo.creator]?.value == userInfo.loginName;
            
            return checkGroupView || checkOwerView
        })
    }else if(appInfo.groupView && !appInfo.ownerView){
        return records.filter(record => {

            let checkGroupView = ( userGroups.length &&  record[appInfo.groupView] && record[appInfo.groupView].value.replace(/\n/g, "").split(',').some(group => userGroups.includes(group)))
            
            return checkGroupView;
        })
    }else if (!appInfo.groupView && appInfo.ownerView){
        return records.filter(record => {
            let checkOwerView = record[appInfo.creator]?.value == userInfo.loginName;
            
            return  checkOwerView
        })   
        
    } else {
        return records;
    }                   
}