const AWS = require('aws-sdk');

const cloudfront = new AWS.CloudFront();
const docClient = new AWS.DynamoDB.DocumentClient();
const appTableName = 'chobitoneApp';
const configTableName = 'chobiitConfig';
const KINTONE_API_ERROR = 1;
const PERMISSION_ERROR = 2;
const INTERNAL_ERROR = 3;

const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const localeService = LocaleService.getInstance("backend");

exports.handler = async (event, context, callback) => {
    console.log('Starting invalidate cache.', JSON.stringify(event, null, 2));
    const appId = event.params.querystring.appId;
    const kintoneDomain = event.params.querystring.domain;
    let domain = kintoneDomain.substring(0, kintoneDomain.indexOf('.'))

    let getChobiitConfigResp = await getChobiitConfig(kintoneDomain)
    let getChobiitAppResp = await getChobiitApp(kintoneDomain, appId)

    if (getChobiitConfigResp.Item && getChobiitConfigResp.Item.cloudfrontDistributionId && getChobiitAppResp.Item && getChobiitAppResp.Item.formUrl) {
        let formUrl = getChobiitAppResp.Item.formUrl
        let formUrlArr = formUrl.split("/");
        let formFileName = formUrlArr[formUrlArr.length - 1];
        const params = {
            DistributionId: getChobiitConfigResp.Item.cloudfrontDistributionId,
            InvalidationBatch: {
                CallerReference: `${new Date().getTime()}`, Paths: {
                    Quantity: 5,
                    Items: [
                        `/public/${domain}/public/p_add_record.html?appId=${appId}`,
                        `/public/${domain}/public/p_detail_record.html?appId=${appId}`,
                        `/public/${domain}/public/p_list_record.html?appId=${appId}`,
                        `/public/${domain}/public/p_thanks.html?appId=${appId}`,
                        `/public/${domain}/form/${formFileName}?appId=${appId}`
                    ]
                }
            }
        };
        console.log("params", params)
        cloudfront.createInvalidation(params).promise();
        return handleSuccess(callback)
    }

    return handleError(new Error('You do not have permission to access this app.'), PERMISSION_ERROR, callback);
}

function handleError(err, type, callback) {
    console.log('Handle error:', JSON.stringify(err.message || err, null, 2));
    let message;
    switch (type) {
        case KINTONE_API_ERROR:
            message = err.message || localeService.translate("error", "has-no-privilege");
            break;
        case PERMISSION_ERROR:
            message = localeService.translate("error", "has-no-privilege");
            break;
        case INTERNAL_ERROR:
        default:
            message = 'Get record failed.';
            break;
    }

    let body = {
        code: 400, message: message, messageDev: err.message
    };

    let response = {
        statusCode: 200, body: JSON.stringify(body)
    };

    callback(null, response);
}

function handleSuccess(callback) {

    let responseBody = {
        code: 200, message: 'Successful cache invalidation',
    };

    let response = {
        statusCode: 200, body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

async function getChobiitConfig(domain) {
    let queries = {
        TableName: configTableName, Key: {
            'domain': domain,
        }
    };
    return await docClient.get(queries).promise();
}

async function getChobiitApp(kintoneDomain, appId) {
    let queries = {
        TableName: appTableName, Key: {
            'domain': kintoneDomain, 'app': appId
        }
    };
    return await docClient.get(queries).promise();
}

 
