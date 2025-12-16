'use strict';

const TABLE_NAME = 'chobiitConfig';
const maxUser  = process.env.maxUser;

//aws-sdkの宣言
var AWS = require("aws-sdk");

var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event,context,callback) => {
    console.log('event = ' + JSON.stringify(event));
     let eventBody = event['body-json'];
   const apiKey = [eventBody.appSettingToken, eventBody.domain, eventBody.appSettingId].join(':')
    authenticate(apiKey)
    .then(domain => {
        if(domain){



            //if(event.logoPattern === '1' || !event.logofile) {
        	    console.log("dynamoGetReturn");
                getDynamo (eventBody, domain)
                .then(body =>{
                    putDynamo(body)
                    .then(result => {
                        console.log("*** putDynamo[Success] ***");
                        console.log(result);
                        callback(null,"200");
                    })
                    .catch(err => {
                        console.log(err);
                        callback(null,"300");
                    })
                })
                .catch(function(err){
                    console.log("*** putDynamo[Catch Error] ***");
                    console.log(err);
                    callback(null,"300");
                });
        }else{
             callback(null,"Access Denied");
        }
    })
    .catch(err => {
        console.log(err)
        callback(null,"300")
    })




    function getDynamo (event, domain) {
        return new Promise(function(resolve,reject){
            var getParams = {
                TableName : TABLE_NAME,
                Key: {
                    domain: domain
                }
            };
            docClient.get(getParams, function (err, res) {
            //dynamo.putItem(dynamoRequest, function(err,data){
                if(err){
                    console.log("getItem error: " + JSON.stringify(err));
                    reject(err);
                }else{
                    console.log("getItem success: " + JSON.stringify(res));
                    // if (res.Item && res.Item.logofile){
                    //     event.logofile = res.Item.logofile;
                    // }
                    if (res.Item && res.Item.count){
                         event.count = res.Item.count; // get count if exist
                    }
                    if (res.Item && res.Item.cloudfrontDistributionId){
                        event.cloudfrontDistributionId = res.Item.cloudfrontDistributionId; // get count if exist
                    }
                    console.log('event', event);
                    resolve(event);
                }
            });
        });
    }


    //dynamo更新
    function putDynamo(event){
        console.log("dynamoPutStart");
        var Item = {
            "domain": event.domain,
            "showName": event.showName,
            "logoPattern": event.logoPattern,
            "maxUser" : maxUser,
            "appSettingToken": event.appSettingToken,
            "appSettingId" : event.appSettingId,
            "userAuth" : event.userAuth,
            "userAuthApps": JSON.stringify(event.userAuthApps),
             "userAuthKintones": event.userAuthKintones,
             "jsCustomAll" : event.jsCustomAll,
            "cssCustomAll" : event.cssCustomAll,
            /**
             * # 注意
             * `userAuthGroup`は、US版にだけあったので取り込んだ。
             * しかし、プラグイン設定画面の config.js を見る限り、このプロパティはそもそも使っていないかもしれない。
             */
            "userAuthGroup" : event.userAuthGroup,

            "cloudfrontDistributionId" : event.cloudfrontDistributionId,
        };
        var putParams = {
            TableName: TABLE_NAME,
            Item : Item,

        };

        if (event.logoPattern === '0' || event.logoPattern === '2') {
            Item['logofile'] = event.logofile;
        }


        if (event.count) {
            Item['count'] = event.count; // set count if exist
        }

        console.log('params', putParams);

        return new Promise(function(resolve,reject){
            docClient.put(putParams, function (err, res) {
            //dynamo.putItem(dynamoRequest, function(err,data){
                if(err){
                    console.log("putItem error: " + JSON.stringify(err));
                    // event.Message = "dynamoPutError"; // 2018/06/27 DEL
                    reject(err);
                }else{
                    console.log("putItem success: " + JSON.stringify(res));
                    //kintoneに新規レコード登録
                    // event.Message = "Success";// 2018/06/27 DEL

                    resolve(res);
                }
            });
        });
    }

};

function authenticate(apiKey){
    const request = require('request');
    const [apiToken,domain,settingAppId] = apiKey.split(':')
    return new Promise((resolve, reject) =>{
         const requestOptions = {
            method: 'GET',
            uri: `https://${domain}/k/v1/app.json`,
            headers: {

                'Content-Type': 'application/json',
                'X-Cybozu-API-Token': apiToken,
            },
            json: true,
             body: {
                id: +settingAppId
            },

        };

        console.log('Call kintone API with body: ', JSON.stringify(requestOptions.body, null, 2));
        request(requestOptions, function (err, response, body) {
            if (err) {
                console.log('Call KintoneAPI failed.', JSON.stringify(err, null, 2));
               reject(err)
            } else {
                console.log('KintoneAPI response.', JSON.stringify(response, null, 2));
                if (body.appId) {
                   resolve(domain)
                } else {
                   resolve(false)
                }
            }
        });
    })
}
