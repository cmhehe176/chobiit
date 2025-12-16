const request = require("request")
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const zlib = require("zlib");
const webhookSlack = process.env.WEBHOOK_SLACK

async function decompressFile(fileData) {
    return new Promise((resolve, reject) => {
        let buf = Buffer.from(fileData);
        zlib.gunzip(buf, function (err, buffer) {
            if (err) reject(null);
            resolve(buffer.toString() + '\n');
        });
    });
}

async function filterData(fileName){
    const data = await decompressFile(fileName)
    let messageSlack = "";
    try {
        const logs = data.trim().split(/\n+/)
        for (let i = 0; i < logs.length; i++ ){
            const log = JSON.parse(logs[i])
            let timestamp = new Date(log.timestamp);
            let timeIOS = timestamp.toISOString();
            let httpMethod = log.httpRequest.httpMethod;
            let uri = log.httpRequest.uri;
            if (log.rateBasedRuleList.length == 0 ){
                let limitValue = log.httpRequest.clientIp;
                let message = `${timeIOS} ${limitValue} ${httpMethod} ${uri}`;
                messageSlack += message + "\n"
            }else {
                for (let j = 0; j < log.rateBasedRuleList.length; j++ ){
                    let limitValue = log.rateBasedRuleList[j].limitValue;
                    let message = `${timeIOS} ${limitValue} ${httpMethod} ${uri}`;
                    messageSlack += message + "\n"
                }
            }

        }
    } catch (e) {
        console.log("error ", e)
        messageSlack = '';
    }
    return messageSlack;
}

async function getMessage(domain, logs){
    return  `
Some requests have been blocked by Chobiit WAF.

Domain: ${domain}
Logs: 
${logs}
`
}

async function getDomain(key){
    const keySplit = key.split("/")
    if (keySplit.length == 0){
        return "";
    }
    return keySplit[4];
}

function callWebhookSlack(message){
    const requestOptions = {
        method: 'POST',
        uri: `${webhookSlack}`,
        headers: {
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            text: "```"+message+"```",
        },
    };
    return new Promise((resolve, reject) => {
        console.log("callWebhookSlack: ", requestOptions)
        request(requestOptions, function (err, response, body) {
            if (err) {
                console.log('Call callWebhookSlack failed.');
                reject(err)
            } else {
                console.log('callWebhookSlack response.');
                resolve(body);
            }
        });
    })
}

exports.handler = async (event, context) => {
    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    console.log("key ",key)
    const params = {
        Bucket: bucket,
        Key: key,
    };
    try {
        const { Body } = await s3.getObject(params).promise();
        let logs = await filterData(Body).then(dataLogs => {return dataLogs});
        const domain = await getDomain(key);
        const message = await getMessage(domain, logs);
        await callWebhookSlack(message);
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
