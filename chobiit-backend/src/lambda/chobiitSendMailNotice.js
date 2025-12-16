const {userRepository, appRepository, kintoneUserRepository, commentRepository} = require('../infrastructure/aws-dynamodb-repository');
const {invokeSendMailModule} = require('../infrastructure/invoke-send-mail-module');
const {default: kintoneRecordRepository} = require('../infrastructure/kintone-record-repository');

const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const localeService = LocaleService.getInstance("backend");

exports.handler = async function(event) {

    try {
        console.log('Received event:', event);

        const appId = event.app.id;
        const url = event.url;
        const domain = url.substr(8, url.indexOf('.com') - 4);

        const appResponse = await appRepository.get({domain, sortKeyValue: appId});
        console.log("appRepository GetItem succeeded:", JSON.stringify(appResponse, null, 2));

        const appSetting = appResponse.Item;
        if (!appSetting) {
            throw new Error("app not found", domain, appId);
        }

        if (event.type === 'UPDATE_RECORD' && appSetting.notif && appSetting.notif.length > 0) {

            for (const notif of appSetting.notif) {   
                /**
                 * `notif.event`はJP/USどちらも日本語となっている為変換しない
                 */
                if (notif.event === 'レコード編集') {
                    console.log('event update record fire ........');
                    await sendAfterEditRecord(appSetting, notif.text, event.record, domain, appId);
                }
            }
        }

        if (event.type === 'ADD_RECORD_COMMENT' && appSetting.notif && appSetting.notif.length > 0) {
            for (const notif of appSetting.notif) {
                if (notif.event === 'コメント投稿') {
                    console.log('event add comment fire ........');
                    await sendAfterAddComment(appSetting, notif.text, domain, appId, event);
                }
            }
        }
        
        if (event.type === 'UPDATE_STATUS' && appSetting.processCond1) {
            await sendAfterStatusChange(appSetting, domain, event);
        }
        
    } catch (error) {
        /**
         * # TODO
         * なんらかの通知をユーザーまたはシステム管理者に行うべき？
         */
        console.error(`ERROR OCCURRED: ${error.stack}`);
    }
};

async function sendAfterEditRecord(appSetting, annocument, record, domain, appId) {
    await handleBeforeSendMail(domain, appId, appSetting, annocument, record);
}

/**
 * chobiitから投稿されたコメントの場合、コメントの投稿者を返却する
 * kintoneから投稿されたコメントの場合はnullを返却する
 */
async function getCommentedChobiitUser(domain, appId, recordId, commentId) {
    const scanParam =  {
        FilterExpression: "#domain = :domain and #appId = :appId and #recordId = :recordId and #commentId = :commentId",
        ExpressionAttributeNames: {
            "#domain": "domain",
            "#appId": "appId",
            "#recordId": "recordId",
            "#commentId": "commentId"
        },
        ExpressionAttributeValues: {
            ":domain": domain,
            ":appId": appId,
            ":recordId": recordId,
            ":commentId": commentId
          
        }
    };

    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('scanParam ===>', scanParam);
    const foundComments = await commentRepository.scan(scanParam);
    
    console.log('foundComments ===>', foundComments);
    
    return foundComments.length ? foundComments[0].chobiitUserId : null;
}

async function sendAfterAddComment(appSetting, annocument, domain, appId, event) {
    const recordId = event.recordId;
    const kintoneLoginName = event.comment.creator.code;
    
    const kintoneUser = await kintoneUserRepository.get({domain, sortKeyValue: kintoneLoginName});
    console.log('get kintoneUserRepository data: ' + JSON.stringify(kintoneUser, null, 2));

    const kintoneDomain = domain.indexOf('https') < 0 ? `https://${domain}` : domain;
    const cybozuToken =  kintoneUser.Item.cybozuToken;
    
    const commentedRecord = await kintoneRecordRepository.get(
        kintoneDomain,
        {chobiitUsageSituation: "private", token: cybozuToken},
        {app: appId, id: recordId}
    );

    const commentedChobiitUser = await getCommentedChobiitUser(domain, appId, recordId, event.comment.id);

    console.log('commentedRecord: ', commentedRecord);
    
    await handleBeforeSendMail(domain, appId, appSetting, annocument, commentedRecord.record, commentedChobiitUser);
}

 async function sendAfterStatusChange(appSetting, domain, event) {
    const processArr = appSetting.processCond1;
    const record = event.record;
    const appId = event.app.id;
    for (let i = 0; i < processArr.length; i++) {
        const process = processArr[i];
        const state = process.state;
        const annocument = process.annocument;
        
        for (const k in record) {
            if (record[k].type === 'STATUS' && record[k].value === state) {
                await handleBeforeSendMail(domain, appId, appSetting, annocument, record);
            }
        }
    }
}

/**
 * chobiit作成者、更新者に対してメールを送信する
 * コメント投稿の場合、コメント投稿者は除外する
 * @param {*} appSetting 
 * @param {*} record 
 * @param {*} commentedChobiitUser 
 */
function extractSendTargetUsers(appSetting, record, commentedChobiitUser) {
    const creatorFieldCode = appSetting.creator;
    const editorFieldCode = appSetting.editor;

    const targets = [];

    if (creatorFieldCode && record[creatorFieldCode].value && record[creatorFieldCode].value !== commentedChobiitUser) {
        targets.push(record[creatorFieldCode].value);
    }
    if (editorFieldCode && record[editorFieldCode].value && record[editorFieldCode].value !==  commentedChobiitUser) {
        targets.push(record[editorFieldCode].value);
    }

    // 重複除外して返却
    return Array.from(new Set(targets));
}

async function handleBeforeSendMail(domain, appId, appSetting, annocument, record, commentedChobiitUser) {
    console.log('commentedChobiitUser ===>', commentedChobiitUser);
    const sendTargetUsers = extractSendTargetUsers(appSetting, record, commentedChobiitUser);
    
    console.log('Send target chobiit users ==>', sendTargetUsers);
    const recordId = record.$id.value;
    const host = domain.substr(0, domain.indexOf('.'));
    const CHOBIIT_DOMAIN_NAME = process.env.CHOBIIT_DOMAIN_NAME;
    
    for (let j = 0; j < sendTargetUsers.length; j++) {    
        const user = sendTargetUsers[j];

        const chobiitUser = await userRepository.get({domain, sortKeyValue: user});
        console.log('chobiitUser' + JSON.stringify(chobiitUser.Item, null, 2));
        
        const mail = chobiitUser.Item.mailAddress;
        const name = chobiitUser.Item.name;

        const recordUrl = `https://${host}.${CHOBIIT_DOMAIN_NAME}/detail_record.html?appId=${appId}&id=${recordId}`;

        await invokeSendMailModule({
            sender: `support@${CHOBIIT_DOMAIN_NAME}`,
            email: mail, 
            subject: localeService.translate("info", "mail-notice-heading"), 
            content: localeService.translate("info", "mail-notice-body", {
                name,
                annocument,
                recordUrl,
                interpolation: {
                    escapeValue: false
                }
            }),
        });
        console.log('send mail done');
    }
}
