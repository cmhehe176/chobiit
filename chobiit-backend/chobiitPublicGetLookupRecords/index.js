const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const kintone = require('@kintone/kintone-js-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';
const appTableName ='chobitoneApp'
const lambdaMax = 6291456;

const JWT_SECRET = process.env.JWT_SECRET;

exports.handler = (event, context, callback) => {
    console.log('Starting get lookup records...', JSON.stringify(event, null, 2));
    const domain = event.params.querystring.domain;
    const lookupInfo = event["body-json"];
    const srcAppId = event.params.path.id;

    if (!lookupInfo.apiToken){
        return handleError(new Error('関連付けるアプリのAPIトークン設定をご確認ください。'), callback);   
   }
   const queries = {
        TableName: appTableName,
        Key: {
            'domain' : domain,
            'app': srcAppId
        }
    };
    
    console.log('queries: ',JSON.stringify(queries, null, 2))

    docClient.get(queries, function (err, data) {
        if (err) {
            console.error('Unable to get app info. Error:', JSON.stringify(err, null, 2));
            return handleError(err, callback);
        } else {
            if (data.Item &&  data.Item.funcCond0.includes('add')) {
                console.log(data.Item);
                getLookupRecords(data.Item, lookupInfo, srcAppId,  callback)
                        .then(records => {
                            console.log('get lookup records: ',records);
                            
                            const recordsSize  = Buffer.byteLength(JSON.stringify(records));
                            console.log('recordsSize: ',recordsSize);
                            
                            if (recordsSize > lambdaMax){
                                let maxRecords = Math.floor(lambdaMax/(recordsSize/recordsSize.length))
                                let errMsg = '候補が多すぎます。キーワードを入力してから取得ボタンクリックをお試しください。それでも解消しない場合は、下記の内容を添えてシステム管理者へお問い合わせください'
                                            +'\n【システム管理者向け】'
                                            +'\nルックアップの候補レコード数の最大件数が'+maxRecords+'件以下となるようルックアップ設定を変更してください。'
                                            
                                 handleError(new Error(errMsg), callback);   
                            }else{
                                 handleSuccess(records, callback)       
                            }
                             
                        })
                .catch(err => {
                    console.log(err)
                    handleError(err.error.errorResponse, callback);
                })
            }else{
                return handleError(new Error('You do not have permission to access this app.'), callback);   
            }
        }
    });

};

async function getLookupRecords(appInfo, lookupInfo, srcAppId, callback) {
    let kintoneAuth = new kintone.Auth();
    kintoneAuth.setApiToken({apiToken: lookupInfo.apiToken});

    let paramsConnection = {
        domain: appInfo.domain,
        auth: kintoneAuth
    };
    let connection = new kintone.Connection(paramsConnection);
    let kintoneRecord = new kintone.Record({connection})
    
    //let showFields = lookupInfo.lookup.lookupPickerFields.unshift(lookupInfo.lookup.relatedKeyField);
    let query = lookupInfo.lookup.filterCond;
    
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
    
  
    
    query += ` order by ${lookupInfo.lookup.sort}`
    let rcOption = {
        app: lookupInfo.lookup.relatedApp.app,
        //fields: showFields,
        query: query
    };
    
    console.log('query :', query);
    
    let resp = await  kintoneRecord.getAllRecordsByCursor(rcOption);
    
    return resp.records;
    
   
        
    // kintoneRecord.getAllRecordsByCursor(rcOption).then((rsp) => {
    //     console.log('all records: ',JSON.stringify(rsp, null, 2));
    //     handleSuccess(rsp.records, callback)
    // }).catch((err) => {
    //     handleError(err.error.errorResponse, callback);
    // });
    
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
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback) {
    console.log('Handle error:', JSON.stringify(error, null, 2));

    let response = {
        statusCode: 200,
        body: JSON.stringify({
            code: 400,
            messageDev : error,
            message: error.message
        })
    };
    callback(null, response);
}