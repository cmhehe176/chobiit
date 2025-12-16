//DynamoDB
const AWS = require('aws-sdk');

const clientId = process.env.ClientId;


exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    const eventBody = event['body-json'];
    try {
        if (!eventBody.name) {
            let response = {
                statusCode: 400,
                message: "ログイン名を入力してください"
            }
            
            return response;
        }
       
        var paramsResend = {
            Username: eventBody.name,
            ClientId: clientId
        };
        
        await resendConfirmCode(paramsResend);
        
        let response = {
            statusCode: 200,
            message: '認証コードを送信しました。メールをご確認ください。',
        };
        
        return response;
    
    }catch (err){
        console.log(err);
        const response = {
            statusCode: 400,
            message: err.message || JSON.stringify(err),
            code: err.code || 3
        };
        return response;
    }
    
};

function resendConfirmCode(paramsResend) {
    let client = new AWS.CognitoIdentityServiceProvider();
       
    return new Promise((resolve, reject) => { 
        client.resendConfirmationCode(paramsResend, function(err, data) {
            if (err) {
                console.log('errorResendConfirmCode:', err)
                reject(err);
            } else {
                console.log('successResendConfirmCode', data)
                resolve(data);
            }  
        })
    })
}