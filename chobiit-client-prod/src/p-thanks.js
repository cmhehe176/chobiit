const appId = window.getQueryStringByName('appId');
const templateColor = require('./change-color-utiliy.js');
const recordId = window.getQueryStringByName('id');
const viewable =  window.getQueryStringByName('viewable'); 


window.onload = function () {

    window.getAppSetting(appId)
    .then(appSetting =>{
        window.changeColor(appSetting.templateColor)
       
    
        if (viewable == 'true'){
            $('.detail-back a').attr('href',`./p_detail_record.html?appId=${appId}&id=${recordId}`)     
        }else{
            $('.detail-back').hide();
        }
        let thanksContent = appSetting.thanksPage;
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
};
