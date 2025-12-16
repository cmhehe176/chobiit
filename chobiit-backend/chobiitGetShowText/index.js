const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();
const configTableName = 'chobiitConfig';


var url = require('url');
  
exports.handler = (event, context, callback) => {
    // handleSuccess({},callback);
    console.log('Starting get config ', JSON.stringify(event, null, 2));
    let origin = event.params.header.origin;
    if (!origin){
         let response = {
            code: 400,
            message: 'access denied',
           
        };   
        console.log(response)
        callback(null, response);
    }
    
    const domain = url.parse(origin, true).host.replace('.s.','.').replace('chobiit.me','cybozu.com')  
    console.log('domain: ',domain)

    let getConfigTable = new Promise((resolve, reject) => {
        const queries = {
            TableName: configTableName,
            Key: {
                'domain': domain, 
            }
        };
        
       
        docClient.get(queries, function (err, data) {
            if (err) {
                console.error('Unable to get config info from DynamoDB. Error:', JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log('Get config info from DynamoDB succeed.', JSON.stringify(data));
                    if (data.Item){
                       resolve(data.Item);
                    }else{
                        resolve(null)
                    }
            }   
        });
      
    });
    
    
    
   getConfigTable
    .then(config => {
        
        let data = {
            config : {
                 showName : config.showName,
                logofile : config.logofile,
                logoPattern: config.logoPattern,
                jsCustomAll : config.jsCustomAll,
                cssCustomAll : config.cssCustomAll,
                userAuth : config.userAuth
            }
        }
        
        handleSuccess(data, callback)
    })
    .catch(err => {
        handleError(err, callback)
    })

};

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));
    let responseBody = {
        code: 200,
        data: data
    };


  

  
    let response = {
         statusCode: 200,
         body: JSON.stringify(responseBody),
         
       
    };
     callback(null, response);
}

function handleError(error, callback) {
    console.log('Handle error:', JSON.stringify(error, null, 2));
    let responseBody = {
        code: 400,
        message: error || 'Get config failed',
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody),
    };

    callback(null, response);
}

