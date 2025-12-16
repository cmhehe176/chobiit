//DynamoDB
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({});
const chobiitAppTable = 'chobitoneApp';

exports.handler = async (event, context, callback) => {

    const appQuery = {
        TableName: chobiitAppTable,
        FilterExpression: "#ts = :ts",
        ExpressionAttributeNames: {
            "#ts": "trustedSites",
        },
        ExpressionAttributeValues: {
            ":ts": false,
        }
    }
    let allApps = await scanTable(appQuery);
    for (let i = 0; i < allApps.length; i++) {
        let updateParams = {
            TableName: chobiitAppTable,
            Key: {
                'domain': allApps[i].domain,
                'app': allApps[i].app
            },
            UpdateExpression: "set trustedSites = :ts",
            ExpressionAttributeValues: {
                ":ts": [],
            }
        };
        console.log("Updating ...", JSON.stringify(updateParams));
        let updateRes = await docClient.update(updateParams).promise();
        console.log("Update succeeded:", JSON.stringify(updateRes, null, 2));
    }
};

const scanTable = async (params) => {
    let scanResults = [];
    let items;
    do {
        items = await docClient.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");
    return scanResults;
};
