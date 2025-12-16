//DynamoDB
const { appRepository } = require("../infrastructure/aws-dynamodb-repository");

exports.handler = (eventData, context, callback) => {
    console.log('starting manga app' + JSON.stringify(eventData, null, 2));
  
    const apiKey = eventData.params.header["x-api-key"] || eventData.params.header["X-Api-Key"]; 
    authenticate(apiKey)
    .then(async domain => { 
        if(domain){
            let event = eventData['body-json'];
            console.log('funcCond0: '+event.funcCond0);
            
            try{
                const response = await appRepository.get({domain, sortKeyValue: event.app})
                console.log("GetItem succeeded:", JSON.stringify(response, null, 2));
                if(response.Item){
                    await updateApp(event, domain);
                }else{
                    await createApp(event, domain);
                }
            }catch(error){
                console.error("Unable to read item. Error JSON:", JSON.stringify(error, null, 2));
                handleError(error, callback)
            }
           
        }else{
            handleError('Access Denied', callback)  
        }
    })
    .catch(err => {
        console.log(err);
        handleError(err, callback)
    })
    
  

    /**
     * # 注意
     * アクション機能の設定内容は`actionCond`,`webhookSync`に保存していたが、`actionCondList`に段階的に移行する。
     *
     * 以下のパターンを考慮する：
     * - Pattern1: プラグイン設定画面のjs(config.js)が古い場合
     * - Pattern2: プラグイン設定画面のjs(config.js)が新しい場合
     * 
     * ## Pattern1
     * この場合は、リクエストボディに`actionCond`と`webhookSync`が含まれ、`actionCondList`は含まれない。
     * よって、`actionCond`, `webhookSync`をそのまま保存し、`actionCondList`は何もしない。
     *
     * ## Pattern2
     * この場合は、リクエストボディに`actionCondList`が含まれ、`actionCond`, `webhookSync`は含まれない。
     * また、DBのデータがもし古い場合、`actionCond`, `webhookSync`がDB内に含まれている。
     * よって、`actionCondList`をそのまま保存し、`actionCond`, `webhookSync`を削除する。
     * 
     * # 今後
     * リリース後しばらくすれば、プラグイン設定画面の js は新しいものになるので、
     * 上記の Pattern1 は起こらなくなる。したがって、以下のコードにおいて、`hasActionCond` は不要になる。
     *
     * @param {*} event 
     * @param {*} domain 
     */
    async function updateApp (event, domain){
        console.log('doamin0', domain );
        
        const hasActionCond = (event) => event.hasOwnProperty("actionCond");
        const hasActionCondList = (event) => event.hasOwnProperty("actionCondList");

        const actionSettingSaveExpression = (event) => {
            if (hasActionCond(event)) {
                return "actionCond = :acc, webhookSync = :webhookSync"
            }
            
            if (hasActionCondList(event)) {
                return "actionCondList = :acc"
            }
        };
        
        const oldActionSettingRemoveExpression = (event) => {
            if (hasActionCond(event)) {
                return ""
            }
            
            if (hasActionCondList(event)) {
                return "REMOVE actionCond, webhookSync"
            }
        };

        /**
         * 2024/01/12
         * ※ 2024/02/05 calendarView について追記
         * 
         * Dynamo の UpdateExpression に 挿入する REMOVE アクションを作成している。
         * `oldActionSettingRemoveExpression` はこの処理より以前からある処理で、その処理に影響が無いように以下のようにしている。
         * `recordCond1`を削除したい理由は、以下の通り。
         * 一覧ビュー設定情報の保存を`recordCond1`から`views`に変更するため 既存の`recordCond1`を削除する必要がある。
         * 全てのデータで`recordCond1`の項目が削除されたら以下のコードは必要なくなるので、その時は削除する。
         * 
         * `calendarView`を削除したい理由は、以下の通り。
         * カレンダー設定情報の保存を`calendarView`から`views`に変更するため 既存の`calendarView`を削除する必要がある。
         * 全てのデータで`calendarView`の項目が削除されたら以下のコードは必要なくなるので、その時は削除する。
         * 
         * もし、`actionCond`,`webhookSync`が全てのデータから削除されたことがわかり、`actionCond`,`webhookSync`を削除する処理が不要になった場合は
         * 単純に `REMOVE recordCond1, calendarView` と返すようにすれば良い。
         */
        const settingRemoveExpression = (event) => {
            const disUsedAttributes = "recordCond1, calendarView"
            const isOldActionSettingRemoveExpression = oldActionSettingRemoveExpression(event) !== "" && oldActionSettingRemoveExpression(event) !== undefined
            const hasViews = event.hasOwnProperty("views");
            if(isOldActionSettingRemoveExpression && hasViews){
                return `${oldActionSettingRemoveExpression(event)}, ${disUsedAttributes}`
            }else if(isOldActionSettingRemoveExpression && !hasViews){
                return `${oldActionSettingRemoveExpression(event)}`
            }else if(!isOldActionSettingRemoveExpression && hasViews){
                return `REMOVE ${disUsedAttributes}`
            }else{
                return ""
            }
        }

        const viewsSettingSaveExpression = (event) => {
            if (event.hasOwnProperty("views")) {
                return "#VIEWS = :views, "
            }else{
                return ""
            }
        }

        const viewsSettingExpressionValue = (event) => {
            if (event.hasOwnProperty("views")) {
                return {
                    ":views": event.views,
                };
            }
        };

        const viewsSettingSaveExpressionKey = (event) => {
            if (event.hasOwnProperty("views")) {
                return {
                    "#VIEWS": "views"
                }
            }else{
                return ""
            }
        }

        const actionSettingExpressionValue = (event) => {
            if (hasActionCond(event)) {
                return {
                    ":acc": event.actionCond,
                    ":webhookSync": event.webhookSync || false,
                };
            }
            
            if (hasActionCondList(event)) {
                return {
                    ":acc": event.actionCondList,
                };
            }
            
            return {};
        };
        
        /**
         * # 注意 
         * ルックアップの完全一致に関する機能は、今は chobiit-us にだけ実装している。
         * @returns 
         */
        const expressionForChobiitUs = () => {
            if (process.env.CHOBIIT_LANG === "en") {
                return "lkCompleteMatch = :lkCompleteMatch, ";
            } else {
                return "";
            }
        };
        
        /**
         * # 注意 
         * ルックアップの完全一致に関する機能は、今は chobiit-us にだけ実装している。
         * @returns 
         */
        const expressionAttributeValueForChobiitUs = (event) => {
            if (process.env.CHOBIIT_LANG === "en") {
                return {
                    ":lkCompleteMatch": event.lkCompleteMatch || false,
                };
            } else {
                return {};
            }
        };
        
        let params = {            
            Key:{
                domain: domain,
                app: event.app
            },
            UpdateExpression: `SET 
            appRights = :ar,
            recordRights = :rr,
            fieldRights = :fr,
            #FD = :f,
            appName = :an,
            appCreatorCode = :appCreatorCode,
            locateCond = :lc,
            timeCond = :tcond,
            #AU = :au,
            thanksPage = :tp,
            templateColor = :tc,
            funcCond0 = :fun0,
            relateFieldsInfo = :rlf,
            lookupRelateInfo = :lkup,
            apiToken0 = :api,
            recordCond0 = :rc0,
            fieldCond0 = :fc0,
            processCond1 = :pc1,
            showText = :st,
            #CR = :cre,
            #ED = :edi,
            #NF = :nfi,
            ${actionSettingSaveExpression(event)},
            ownerView = :ownv,
            showComment = :shc,
            saveButtonName = :svBtn,
            appLinkTo = :alt,
            jsCustom = :jsCustom,
            cssCustom = :cssCustom,
            robotoCheck = :rbtc,
            autoSendMail = :autoSendMail,
            responseControl = :responseControl,
            tempSaving = :tempSaving,
            ${expressionForChobiitUs()}
            ${viewsSettingSaveExpression(event)}
            groupView = :groupView,
            trustedSites = :trustedSites,
            statusInfo = :statusInfo
            
            ${settingRemoveExpression(event)}
            `,
            ExpressionAttributeNames : {
                "#FD": "fields",
                "#AU" : "auth",
                "#CR" : "creator",
                "#ED" : "editor",
                "#NF" : "notif",
                ...viewsSettingSaveExpressionKey(event)
            },
            ExpressionAttributeValues:{
                ":ar" : event.appRights,
                ":rr" : event.recordRights,
                ":fr" : event.fieldRights,
                ":f" : event.fields,
                ":an" : event.appName,
                ":appCreatorCode": event.appCreatorCode || false,
                ":lc" : event.locateCond,
                ":tcond": event.timeCond,
                ":au" : event.auth,
                ":tp" : event.thanksPage,
                ":tc" : event.templateColor,
                ":fun0" : event.funcCond0,
                ":api" : event.apiToken0,
                ":rc0" : event.recordCond0,
                ":fc0" : event.fieldCond0,
                ":pc1" : event.processCond1,
                ":st"  : event.showText,
                ":cre" : event.creator,
                ":edi" : event.editor,
                ":nfi" :event.notif,
                ":ownv" : event.ownerView,
                ":rlf" :  event.relateFieldsInfo,
                ":lkup": event.lookupRelateInfo,
                ":shc" :event.showComment || false,
                ":svBtn" : event.saveButtonName || '保存',
                 ":alt" : event.appLinkTo || false,
                ":rbtc" : event.robotoCheck || false,
                ":jsCustom": event.jsCustom || [],
                ":cssCustom" : event.cssCustom || [],
                ":autoSendMail" : event.autoSendMail || false,
                ":responseControl" : event.responseControl || false,
                ":tempSaving" : event.tempSaving || false,
                ":groupView" : event.groupView || false,
                ":trustedSites" : event.trustedSites || [],
                ":statusInfo" : event.statusInfo || false,
                ...actionSettingExpressionValue(event),
                ...expressionAttributeValueForChobiitUs(event),
                ...viewsSettingExpressionValue(event)
            },
            ReturnValues:"UPDATED_NEW"
        };
        console.log('autoSendMail: ', event.autoSendMail);
        console.log("Updating the item...");
        try{
            const response = await appRepository.update(params) 
            handleSuccess(response, callback)
        }catch(error){
            handleError(error, callback)
        }
    }
   
    async function createApp (event, domain){
        console.log('doamin0', domain );
        let items = {};
            
        items.domain       = domain;
        items.appRights    = event.appRights;
        items.recordRights = event.recordRights; 
        items.fieldRights  = event.fieldRights;
        items.fields       = event.fields;
        items.app          = event.app;
        items.appName      = event.appName;
        items.locateCond   = event.locateCond;
        items.timeCond     = event.timeCond;
        items.auth         = event.auth;
        items.thanksPage   = event.thanksPage;
        items.templateColor= event.templateColor;
        items.funcCond0    = event.funcCond0;
        items.apiToken0    = event.apiToken0;
        
        /**
         * # NOTE
         * `views`は新しい一覧設定の持ち方
         */
        items.views  = event.views;
        items.recordCond0 = event.recordCond0;
        items.fieldCond0   = event.fieldCond0;
        items.processCond1 = event.processCond1;
        items.showText     = event.showText;
        items.creator      = event.creator;
        items.editor       = event.editor;
        items.notif        = event.notif;
        
        /**
         * # NOTE
         * `actionCond`, `webhookSync`はアクション機能の設定内容の古い持ち方。
         */
        items.actionCond = event.actionCond;
        items.webhookSync = event.webhookSync;

        /**
         * # NOTE
         * `actionCondList`はアクション機能の設定内容の新しい持ち方。
         */
        items.actionCondList   = event.actionCondList;

        items.appLinkTo = event.appLinkTo;
        items.ownerView    = event.ownerView;
        items.relateFieldsInfo = event.relateFieldsInfo;
        items.lookupRelateInfo = event.lookupRelateInfo;
        items.showComment = event.showComment;
        items.saveButtonName = event.saveButtonName;
        items.robotoCheck = event.robotoCheck;
        items.jsCustom = event.jsCustom;
        items.cssCustom = event.cssCustom;
        items.autoSendMail = event.autoSendMail;
        items.responseControl = event.responseControl;
        items.tempSaving = event.tempSaving;
        
        /**
         * # 注意
         * ルックアップの完全一致に関する機能は、今は chobiit-us にだけ実装している。
         */
        if (process.env.CHOBIIT_LANG === "en") {
            items.lkCompleteMatch = event.lkCompleteMatch;
        }

        items.groupView = event.groupView;
        items.trustedSites = event.trustedSites;
        items.statusInfo = event.statusInfo

        const params = {
            'Item': items
        };
            
        try{
            const response = await appRepository.create(params)
            handleSuccess(response, callback)
        }catch(error){
            handleError(error, callback)
        }
    }
};

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        body: JSON.stringify(data)
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
        body: JSON.stringify(error)
    };

    callback(null, response);
}

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