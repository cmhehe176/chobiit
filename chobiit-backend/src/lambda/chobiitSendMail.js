const AWS = require('aws-sdk');



const lambda = new AWS.Lambda({
     region: 'us-east-1'
    
});


const SENDER = process.env.SENDER;


  
exports.handler = async (event) => {
    console.log('Starting send mail ', JSON.stringify(event, null, 2));
 
    
    let data = event['body-json'];
    if (!data.sender) data.sender = SENDER;
    
        
    try {
        const params = {
          InvocationType: "RequestResponse",
          Payload: JSON.stringify(data),
          FunctionName : 'sendMailModule'
        };
    

        await lambda.invoke(params).promise();
        
        console.log('send mail done');
        return {
             code: 200,
            message: 'done'
        }
    }catch(err){
        console.log(err);
        return {
            code : 400,
            message: 'aws err' + err.code
        }
    }
    

};


