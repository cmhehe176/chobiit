 
const AWS = require('aws-sdk');
AWS.config.apiVersions = {
  cloudfront: '2019-03-26',
  // other service API versions
};
var cloudfront = new AWS.CloudFront();


exports.handler = async (event, context, callback) => {
  
    console.log('Starting get  distribution info', JSON.stringify(event, null, 2));
    const distributionId = event.params.querystring.id;
    if (!distributionId){
        try {
            let distributions =  await listDistributions({}, cloudfront);
            console.log('list distributions: '+ JSON.stringify(distributions))
             console.log('distributions length: ', distributions.length);
            
            let responseBody = {
                code: 200,
                message: 'get list distribution info success',
                distributionsInfo : distributions
            };
        
            let response = {
                statusCode: 200,
                body: JSON.stringify(responseBody)
            };
            callback(null, response);
            
        } catch (e) {
            handleError(e, callback);
        }
    }else {
        var params = {
          Id: distributionId /* required */
        };
        try {
            let distributionInfo = await cloudfront.getDistribution(params).promise();
            console.log('get distributionInfo resp' + JSON.stringify(distributionInfo));
            
            handleSuccess(distributionInfo.Distribution.Status, callback)
        }catch(error){
            handleError(error, callback)
        }    
    }
};

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'get distribution info success',
        distributionState : data,
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
            message: error.message
        })
    };
    callback(null, response);
}

const listDistributions = async (params, cloudfront) => {
    let scanResults = [];
    let items;
    do{
        items =  await cloudfront.listDistributions(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.Marker  = items.NextMarker;
    } while(typeof items.NextMarker != "undefined");
    return scanResults;
};
