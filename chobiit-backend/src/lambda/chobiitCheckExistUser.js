
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'ChobiitDeletedUsers';
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const UserPoolId = process.env.UserPoolId;
exports.handler = async (event) => {
    let loginName = event.params.querystring.loginName;
    let domain = event.params.querystring.domain;
    let check = await checkCognitoUser(loginName);
    if(!check) {
        const queries = {
            TableName: TABLE_NAME,
            Key: {
                'domain' : domain,
                'loginName': loginName
            }
        };
        const getResp = await docClient.get(queries).promise();
        if (getResp.Item){
            check = true
        }
    }
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            check : check
        }),
    };
    return response;
};
async function checkCognitoUser(loginName){
    let result = false;
    try {
        var params = {
            UserPoolId: UserPoolId, /* required */
            Username: loginName/* required */
        };
        await cognitoidentityserviceprovider.adminGetUser(params).promise()
        result = true
    }
    catch(err){
        result = false;
    }
    return result;
}
 