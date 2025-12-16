const appId = window.getQueryStringByName('appId');
const templateColor = require('./change-color-utiliy.js');
const recordId = window.getQueryStringByName('id');
let idToken = JSON.parse(localStorage.getItem('idToken'))

window.onload = function () {
    if (appId) {
        Promise.all([
            loadAppListData(),
            window.getAppSetting(appId)
        ])
        .then(([load, appSetting]) =>{
            window.changeColor(appSetting.templateColor)
        
            $('.detail-back a').attr('href',`./detail_record.html?appId=${appId}&id=${recordId}`)
            var thanksContent = appSetting.thanksPage;
            if (thanksContent){
                $('#thanks_content').append(thanksContent);
            }

            //Custom
            if (appSetting.cssCustom && appSetting.cssCustom.length){
                window.addCustomFile(appSetting.cssCustom, 'css');
            }
            if (appSetting.jsCustom && appSetting.jsCustom.length){
                window.addCustomFile(appSetting.jsCustom, 'js');
            }

        })
        .catch(err => {
            swal('エラー','アプリ設定情報が取得できません。','error');
            console.error('get app setting fail');
            console.error(err);
            window.storeErr(err,'Add record  page');
        })
        
       
    } 
};

async function loadAppListData() {
  
    var appsInStorage = JSON.parse(sessionStorage.getItem('apps'));
    if (!appsInStorage) {
        await loadAllApps(idToken);
    }

    window.insertAppName('need-app-name');

    window.updateAppsInSidebar(null, function () {
        // document.getElementById('addRecordMenu' + appId).classList.add('sub-active');
    });

    return 1;
    
}