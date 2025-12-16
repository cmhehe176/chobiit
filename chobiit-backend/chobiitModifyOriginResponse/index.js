const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-west-1'
})
const dynamo = new AWS.DynamoDB.DocumentClient();

const appTableName = 'chobitoneApp';

const isFormHTMLRequested = (requestUri) => {
  return requestUri.includes('.html') && requestUri.includes('/form/')
}

const isPublicHTMLRequested = (requestUri) => {
  const publicHTMLFiles = [
    'p_add_record.html',
    'p_detail_record.html',
    'p_list_record.html',
    'p_thanks.html',
  ];
  return publicHTMLFiles.some(target => requestUri.includes(target))
}

const isEmbedForbiddenRequest = (requestUri, queryParams) => {
    return (!isPublicHTMLRequested(requestUri) && !isFormHTMLRequested(requestUri)) || ((isFormHTMLRequested(requestUri)) && !queryParams.has('appId'))
}

const getAppData = async (subdomain, appId) => {
    const params = {
        TableName: appTableName,
        Key: {
            'domain' : `${subdomain}.cybozu.com`,
            'app': appId
        }
    };
    const data = await dynamo.get(params).promise();

    if (!data.Item) {
        throw Error(`Not found app. subdomain=${subdomain}. appId=${appId}`)
    }

    return data.Item;
}

exports.handler = async (event) => {
    const request = event.Records[0].cf.request
    const response = event.Records[0].cf.response
    const headers = response.headers;
    const subdomain = request.origin.s3.path.split('/public/')[1]

    headers["X-Content-Type-Options"] = [{"key": "X-Content-Type-Options", "value": "nosniff"}];
    headers["Expires"] = [{"key": "Expires", "value": "-1"}];
    headers["Pragma"] = [{"key": "Pragma", "value": "no-cache"}];
    headers["Cache-Control"] = [{"key": "Cache-Control", "value": "no-cache, must-revalidate"}];
    headers["Strict-Transport-Security"] = [{"key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload"}];

    const queryParams = new URLSearchParams(request.querystring);

    if (isEmbedForbiddenRequest(request.uri, queryParams)) {
        headers["Content-Security-Policy"] = [{"key": "Content-Security-Policy", "value": `frame-ancestors 'self'`}];
        return response;
    }

    if (!queryParams.has('appId')) return response;
    
    const appId = queryParams.get('appId');

    try {
        const app = await getAppData(subdomain, appId)

        if (app.trustedSites?.length) {
            const sites = app.trustedSites.join(' ');
            headers["Content-Security-Policy"] = [{"key": "Content-Security-Policy", "value": `frame-ancestors 'self' ${sites}`}];
        }

        return response;
    } catch (err) {
        console.log('error', err)
    }
};
