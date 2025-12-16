const {userRepository, appRepository} = require('../infrastructure/aws-dynamodb-repository');
const {default: ListOrganizationsService} = require('../application/list-organizations-service');
const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const localeService = LocaleService.getInstance("backend");
const {ClientCommonResponse} = require('../utils/lambda-common-response');

exports.handler = async (event, context, callback) => {
    console.log('Starting get list apps.', JSON.stringify(event, null, 2));
    
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];

    console.log('domain: ',domain);
    console.log('loginName: ',loginName)

    try {
        const user = await userRepository.get({domain, sortKeyValue: loginName});
        console.log("user: ", user); 

        if (!user.Item) {
            ClientCommonResponse.handleError(new Error(localeService.translate("error", "not-found-user")), callback);  
        }

        if (JSON.parse(user.Item.apps).length === 0) {
            return ClientCommonResponse.handleSuccess(null, callback);
        }

        const organization = await ListOrganizationsService.getOrganizationWithChildren(user.Item);
        console.log('organizationInfo: ', organization)
        console.log('starting get app....')
        
        const {apps, appRights} = await getApp(user.Item, organization, callback);

        ClientCommonResponse.handleSuccess({code: 200, apps, appRights}, callback);

    } catch (error) {
        return ClientCommonResponse.handleError(error, callback);
    }    
};



async function getApp(userInfo, organizationInfo, callback) {
    let kintoneApps = JSON.parse(userInfo.apps);
    let kintoneLoginName = userInfo.kintoneLoginName;
    let kintoneOrganizations = userInfo.kintoneOrganizations;
    let kintoneGroups = userInfo.kintoneGroups;

    /**
     * FIXME: このparamsもどこか他に切り出したいが、良い案がない
     * repositoryにあるべきだとは思うが、かなり汎用的な作りにしないといけなさそう
     */
    const params = {
        ProjectionExpression: "#ai, appRights, appName, showText, appCreatorCode",
        KeyConditionExpression: "#do = :dm",
        ExpressionAttributeNames: {
            "#do" : "domain",
            "#ai": "app",
        },
        ExpressionAttributeValues: {
             ":dm": userInfo.domain
        }
    };
    
    console.log("Scanning app ..");

    try {
        const apps = await appRepository.query(params);
        console.log('Get app info from DynamoDB succeed.');

        let appRights = [];
        let appInfo = [];
        for (let i = 0; i < apps.length; i++) {
            const item = apps[i]; 

            if (!kintoneApps.includes(item.app)) continue;

            let appRight;
            let rights = item.appRights;

            for (let j = 0; j < rights.length; j++) {
                let right = rights[j];

                if (right.entity.type == 'CREATOR' && item.appCreatorCode == kintoneLoginName) {

                    appRight = right;
                    break;
                
                } else if (right.entity.type == 'USER' && kintoneLoginName == right.entity.code) {
                    appRight = right;
                    break;
                } else if (right.entity.type == 'GROUP' && kintoneGroups.includes(right.entity.code)) {
                    appRight = right;
                    break;
                } else if (right.entity.type == 'ORGANIZATION' && kintoneOrganizations.includes(right.entity.code)) {
                    appRight = right;
                    break;
                } else if (right.entity.type == 'ORGANIZATION' && right.includeSubs) {
                    let found = organizationInfo.find(x =>x.code == right.entity.code);
                    if (found && checkArr(found.listChild, kintoneOrganizations)) {
                        appRight = right;
                        break;
                    }   
                }
            }
            
            appRights.push({
                appId: item.app,
                appRight: appRight
            });
            appInfo.push({
                appId: item.app,  
                name: item.appName,
                showText: item.showText
            });
        }
        const appResp = kintoneApps.map(item => {
            return appInfo.find(x => x.appId == item)
        })

        return {apps: appResp, appRights};

    } catch (error) {
        console.error('Unable to get app info from DynamoDB. Error:', JSON.stringify(error, null, 2));
        ClientCommonResponse.handleError(error, callback);
    }
}

function checkArr(arr1, arr2) {
    console.log('arr1: ', arr1)
    console.log('arr2: ', arr2)
    let check = false;
    JSON.parse(arr2).forEach(x => {
        console.log(x)
        if (arr1.includes(x)) {
          check = true
          return;
        } 
    })
    return check;
}
