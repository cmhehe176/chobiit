const AWS = require('aws-sdk');
const userTable = process.env.userTable;

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('event ====>', event);

    const {domain, login_name} = event.params.querystring

    try {
        const params = {
            TableName: userTable,
            Key: {
                domain: domain,
                loginName: login_name
            }
        };

        const resp = await dynamodb.get(params).promise();

        const check = Object.keys(resp).length ? true : false;


        // TODO implement
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                check: check
            }),
        };

        console.log('response ===>', response)

        return response;
    } catch (err) {
        console.log('err ====>', err);
        const response = {
            statusCode: 400,
            body: err.message || JSON.stringify(err)
        }
        return response;
    }
};
