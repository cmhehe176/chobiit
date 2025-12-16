const AWS = require('aws-sdk');
const request = require('request');
const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const {default: ListRecordsService} = require("./../application/list-records-service");
const { ListViewService } = require('chobiit-common/src/application/list-view-service');

const localeService = LocaleService.getInstance("backend");
const docClient = new AWS.DynamoDB.DocumentClient();
const appTableName = 'chobitoneApp';
const KINTONE_API_ERROR = 1;
const PERMISSION_ERROR = 2;
const INTERNAL_ERROR = 3;
const AUTH_ERROR = 4;

const CHOBIIT_USAGE_SITUATION = "public";

exports.handler = (event, context, callback) => {
    console.log('Starting handle publicListRecords.', JSON.stringify(event, null, 2));
    const appId = event.params.path.id;
    const domain = event.params.querystring.domain;
    
    let pageNumber = event.params.querystring.page ? event.params.querystring.page : 0;
    const startDateOfMonth = event.params.querystring.startDate;
    const endDateOfMonth = event.params.querystring.endDate;
    const filterTerms = event.params.querystring.filterTerms;
    const viewId = event.params.querystring.viewId;
    
    //check auth
    let requestOptions = {
        method: 'GET',
        uri: `https://v8jxi69oy4.execute-api.us-east-1.amazonaws.com/dev/status?domain=${domain}`,
        json: true,
    };
    request(requestOptions, (err, response) => {
        if(err){
           return handleError(err, INTERNAL_ERROR, callback, domain)
        }else{
            let status = response.body.status;
            if(status == 'trialStart'){
                let today = new Date();
                let endDate = new Date(response.body.endDate);
                if (today > endDate){
                     return handleError(new Error(localeService.translate("validation", "free-trial-expired")), AUTH_ERROR, callback);
                }
            }
             if (status == 'trialEnd' || status == 'NotActive'){
                 return handleError(new Error(localeService.translate("validation", "free-trial-expired")), AUTH_ERROR, callback, domain);
            }else {
                const queries = {
                    TableName: appTableName,
                    Key: {
                        'domain' : domain,
                        'app': appId
                    }
                };
            
                docClient.get(queries, (err, data) => {
                    if (err) {
                        console.error('Unable to get app info from DynamoDB. Error:', JSON.stringify(err, null, 2));
                        handleError(err, INTERNAL_ERROR, callback, domain);
                    } else {
                        console.log('Get app info from DynamoDB succeed.', JSON.stringify(data, null, 2));
                        if (data.Item && (data.Item.auth === false ||  data.Item.auth === 1) && data.Item.funcCond0.includes('view')) {
                            if (validateDateTimes(startDateOfMonth) && validateDateTimes(endDateOfMonth)) {
                                return listRecords(data.Item, pageNumber, startDateOfMonth, endDateOfMonth, callback, filterTerms, viewId);
                            }
                            return handleError(new Error(localeService.translate("validation", "invalid-start-end-date-format")), callback);
                        }
                        return handleError(new Error(localeService.translate("error", "not-permitted")), PERMISSION_ERROR, callback, domain);
                    }
                })
            }
        }
    });    
};

function getFormLayout(appInfo){
    return new Promise((resolve, reject) =>{
        let requestOptions = {
            method: 'GET',
            uri: `https://${appInfo.domain}/k/v1/app/form/layout.json`,
            headers: {
                'X-Cybozu-API-Token': appInfo.apiToken0,
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                app: appInfo.app,
                
            }
        };
    
        console.log('Call kintone API with.', JSON.stringify(requestOptions, null, 2));
        request(requestOptions, (err, response, body) => {
            if (err) {
                console.log('Call KintoneAPI get records failed.', JSON.stringify(err, null, 2));
                reject(err)
            } else {
                console.log('KintoneAPI get records response.', JSON.stringify(body, null, 2));
                if (body.code && body.code !== 200) {
                    reject(body)
                }else{
                    resolve(body.layout)
                }
            }
        })
    })
}

async function listRecords(appInfo, pageNumber, startDateOfMonth, endDateOfMonth, callback, filterTerms, viewId) {
    let kintoneDomain = appInfo.domain.indexOf('https') < 0 ? `https://${appInfo.domain}` : appInfo.domain;
    try {
        let kintoneAPIToken = appInfo.apiToken0;
        let fieldRight = appInfo.fieldCond0;
        let query = '';
        let offset = pageNumber * 100;
        let {recordCond1, calendarView} = ListViewService.getCurrentListView(appInfo,viewId)

        if(recordCond1 && recordCond1.type == 'LIST'){
            query = recordCond1.filterCond;
        }
        
        if (calendarView){
            const calendarQuery = `( ${calendarView.event_start} >=  "${startDateOfMonth}" and ${calendarView.event_start} <=  "${endDateOfMonth}" ) or ( ${calendarView.event_start} <=  "${startDateOfMonth}" and ${calendarView.event_end} >=  "${startDateOfMonth}" )`; 
            if (query == "" || query == " "){
                query = calendarQuery
            }else{ 
                query = query + ' and ' + calendarQuery
            }
            console.log('query calendarView: '+query);      
        }    
        
        query = createKintoneQuery(query, filterTerms);
        if (recordCond1 && recordCond1.sort != ' '){
            query = query + ` order by ${recordCond1.sort}`;
        }
        const queryByContext = !!calendarView ? query : `${query} offset ${offset}`;

        const getKintonRecordsByContext = !!calendarView ? ListRecordsService.listCalendarRecords(CHOBIIT_USAGE_SITUATION) : ListRecordsService.listRecords(CHOBIIT_USAGE_SITUATION);
        const getRecordsParams = {app: appInfo.app, query: queryByContext};
        const { totalCount, records } = await getKintonRecordsByContext(kintoneDomain, kintoneAPIToken, getRecordsParams, appInfo);
        console.log("KintoneAPI get records response.", JSON.stringify(records, null, 2));
        // remove fields which user does not have right to view
        let needRemoveFields = [];
        if (fieldRight) {
            needRemoveFields = fieldRight
                .filter(right => {
                    return right.function.includes("view");
                })
                .map(field => field.field);
        }

        console.log("Before filter records: ", JSON.stringify(records, null, 2));
        records.forEach(record => {
            needRemoveFields.forEach(field => {
                delete record[field];
            });
        });
        console.log("After filter records: ", JSON.stringify(records, null, 2));

        // fields will be shown in table
        const fieldTypeViewAble = ["SINGLE_LINE_TEXT", "MULTI_LINE_TEXT", "NUMBER", "RADIO_BUTTON",
            "CHECK_BOX", "MULTI_SELECT", "DROP_DOWN", "DATETIME", "TIME", "DATE", "LINK", "FILE", "CALC", "STATUS"
        ];

        const showFields = {}
        Object.keys(appInfo.fields).forEach(fieldCode => {
            const fieldData = appInfo.fields[fieldCode];
            // 表示可能なフィールドであるかどうか
            const isAbleToDisplayField = fieldTypeViewAble.includes(fieldData.type)
            // 表示設定におけるフィールドの表示設定で、非表示に設定しているフィールドであるかどうか
            const isNotDisplaySettingsField = needRemoveFields.includes(fieldCode)
            if (isAbleToDisplayField && !isNotDisplaySettingsField){
                if(fieldData.type === "STATUS" && !appInfo.statusInfo) {
                    console.log("Setting of status field is invalid.")
                    return   
                }
                Object.assign(showFields, {         
                    [fieldCode]: fieldData
                })
            }
        })

        //fileter by view
        if (recordCond1) {
            for (let key in showFields) {
                if (!recordCond1.fields.includes(key)) delete showFields[key];
            }
        }

        getFormLayout(appInfo)
            .then(formLayout => {
                //delete field in gorup
                needRemoveFields.forEach(field => {
                    const found = formLayout.find(x => x.type == "GROUP" && x.code == field);
                    if (found) {
                        const deleteFields = found.layout.map(x => x.fields).flat().map(x => x.code)

                        console.log("need delete fields in group: ");
                        console.log(deleteFields)
                        deleteFields.forEach(item => {
                            delete showFields[item];
                        })
                    }
                })

                // remove api token from app info before response to client
                delete appInfo["apiToken0"];
                const responseBody = {
                    code: 200,
                    appInfo: appInfo,
                    showFields: showFields,
                    records: records,
                    totalCount: totalCount,
                    hasFilterTerms: typeof filterTerms !== "undefined",
                };
                handleSuccess(responseBody, callback);
            })
            .catch(err => {
                handleError(err, KINTONE_API_ERROR, callback)
            })
    }catch(err) {
        if(err.code && isKintoneApiError(err.code)) {
            handleError(err, KINTONE_API_ERROR, callback);
            console.error('Kintone API error:', `error code ${err.code}, error message ${err.message}`);
        }else{
            handleError(err, INTERNAL_ERROR, callback);
            console.error("Internal error:", err.message || err);
        }
    }
}

const isKintoneApiError = (errCode) => {
    const errCodeHead = errCode.split('_')[0];
    return errCodeHead === 'GAIA' || errCodeHead === 'BC'
}

const createKintoneQuery = (essentialTerms, filterTerms) => {
    if(typeof filterTerms === "undefined") return essentialTerms;

    if(essentialTerms.trim() === "") return filterTerms;
    
    return `(${essentialTerms}) and (${filterTerms})`;
}

function handleError(err, type, callback, domain) {
    console.log('Handle error:', JSON.stringify(err.message || err, null, 2));
    let message;
    switch (type) {
        case AUTH_ERROR :
            message = err.message;
            break;
        case KINTONE_API_ERROR:
            message = err.message || localeService.translate('error', 'not-permitted');
            break;
        case PERMISSION_ERROR:
            message = localeService.translate('error', 'not-permitted');
            break;
        case INTERNAL_ERROR:
        default:
            message = 'Get list of records failed.';
            break;
    }

    let body = {
        code: 400,
        message: message,
        messageDev: err.message
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };
    
    callback(null, response);
}

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));
    let response = {
        statusCode: 200,
        body: JSON.stringify(data)
    };

    callback(null, response);
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
