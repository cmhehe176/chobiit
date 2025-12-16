const AWS = require('aws-sdk');


const docClient = new AWS.DynamoDB.DocumentClient();

const errTableName = 'chobiitError';

const KINTONE_API_ERROR = 1;
const PERMISSION_ERROR = 2;
const INTERNAL_ERROR = 3;

exports.handler = (event, context, callback) => {
    console.log('Starting store error.', JSON.stringify(event, null, 2));
    let domain = event.domain;
    let functionName = event.functionName;
    let error = event.error;
     let today = new Date();
    let dateTime = today.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})
    let unixtime = + new Date(today.setMonth(today.getMonth()+3));
    
    var params = {
        TableName:errTableName,
        Item:{
            domain: domain,
            error: error,
            dateTime: dateTime,
            functionName: functionName,
             unixtime :  Math.round(unixtime/1000)
        }
    };
    
    console.log("Adding a new error item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add error item. Error JSON:", JSON.stringify(err, null, 2));
            callback(null,'err');
        } else {
            console.log("Added error item:", JSON.stringify(data, null, 2));
            callback(null, 'success');
        }
    });
};
