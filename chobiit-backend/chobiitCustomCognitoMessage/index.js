const UserPoolId = process.env.UserPoolId;
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();
const configTableName = 'chobiitConfig'

exports.handler = async (event) => {
    console.log('event: ',JSON.stringify(event, null, 2));
    
    //
    if(event.userPoolId === UserPoolId) {
        // Identify why was this function invoked
        if(event.triggerSource === "CustomMessage_ForgotPassword"  || event.triggerSource == 'CustomMessage_SignUp' || event.triggerSource =='CustomMessage_ResendCode') {
            
            // Ensure that your message contains event.request.codeParameter. This is the placeholder for code that will be sent
            
            const domain = event.request.userAttributes['custom:domain'];
            const name = event.request.userAttributes['nickname'];
            const queries = {
                TableName: configTableName,
                Key: {
                    'domain': domain, 
                }
            };
                
            
            const config = await  docClient.get(queries).promise();
            let showName = config.Item.showName || 'Chobiit'
            showName = showName.replace(/\s+/g, " "); 
            
            
            let mailContent = `<p>${name} 様</p><br>`;
            mailContent += "<br>";
            mailContent += `<p>${showName}をご利用頂き誠にありがとうございます。</p>`;
            mailContent += "<p>元の画面に戻り、以下の認証コードを入力して登録を完了させて下さい。</p><br>";  
            mailContent += "<br>";
            mailContent += `<p>認証コード：${event.request.codeParameter}</p><br>`;
            mailContent += "<br>";
            mailContent += "<p>---------------------------------	</p>";
            mailContent += `<p>${showName}</p>`;
            
            event.response.smsMessage = "Your confirmation code is " + event.request.codeParameter;
            event.response.emailSubject = `【${showName}】認証コード`;
            event.response.emailMessage =  mailContent ;
        }
        // Create custom message for other events
    }
    
    console.log(event)
    // Return to Amazon Cognito
    return event;
};