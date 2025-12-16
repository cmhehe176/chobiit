
require('cross-fetch/polyfill');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
let domain = window.getKintoneDomain();

const LocaleService = require('chobiit-common/src/application/locale-service').default;
const localeService = LocaleService.getInstance("client");

var poolData = {
    UserPoolId :  window._config.cognito.UserPoolId, 
    ClientId :  window._config.cognito.ClientId, 
};		

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const loader = document.getElementById('loader');

let config;

if (localStorage.getItem('config')){
  config = JSON.parse(localStorage.getItem('config'))
  var showName = `<div>${config.showName || ''}</div>`;
  var img = config.logofile? `<img style="max-height: 50px; padding-right:.5rem" src="${config.logofile}">` : '';
  $('#showName').empty().append(img + showName);

}else{
  var url = window._config.api.getShowText + '?domain=' + domain ;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var response = this.response;
      if (typeof response != 'object'){
        response = JSON.parse(response);
      }
      if (response.statusCode === 200) {
        var body = JSON.parse(response.body);
        config = body.data.config;
      
        //document.getElementById("showName").innerHTML = config.showName;
        var showName = `<div>${config.showName || ''}</div>`;
        var img = config.logofile? `<img style="max-height: 50px; padding-right:.5rem" src="${config.logofile}">` : '';
        $('#showName').empty().append(img + showName);
        localStorage.setItem('config',JSON.stringify(config)); 
      }
    }
    if (this.readyState === 4 && this.status !== 200) {
      
      swal(localeService.translate("common", "error-title"),localeService.translate("error", "common-error-message"),'warning')
      console.error('Server error!');
      window.storeErr(this,'server error');
      
    }

    if (this.readyState === 4 && this.status !== 200) {
      console.error('Server error!');
    }
  };
  xhttp.open('GET', url, true);
  xhttp.responseType = 'json';
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send();
}

$('#forgot-btn').click(function(){
    loader.style.display = 'block';
    let name = $('#loginName').val();

    if (!name){
        loader.style.display = 'none';
        swal(localeService.translate("common", "error-title"),localeService.translate("info", "forgot-password-enter-login-name"),'warning');
        return
    }


    var existUserApi = window._config.api.resetPassword + '?login_name=' + name + '&domain=' + domain;


    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            loader.style.display = 'none';
            var response = this.response;
            if (typeof response != 'object'){
                    response = JSON.parse(response);
            }
            if (response.statusCode === 200) {
                var body = JSON.parse(response.body);
                if (!body.check){
                    swal(localeService.translate("common", "error-title"), localeService.translate("info", "forgot-password-not-found-login-name"), 'error');
                }else{
                    // setup cognitoUser first
                    var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
                        Username: name,
                        Pool: userPool
                    });

                    // call forgotPassword on cognitoUser
                    cognitoUser.forgotPassword({
                        onSuccess: function(result) {
                            console.log('call result: ' + result);
                            $('#forgot-password-form').hide();
                            $('#reset-password-form').show();


                            $('#restet-btn').click(function(){
                                let newPassword = $('#new_password').val();
                                let confirmPassword = $('#new_password_confirm').val();
                                let verificationCode = $('#verify_code').val().trim();
                            
                                if (!verificationCode){
                                    swal(localeService.translate("common", "error-title"),localeService.translate("info", "forgot-password-please-enter-verify-code"),'warning');
                                    return;
                                }
                            
                                if (!newPassword){
                                    swal(localeService.translate("common", "error-title"),localeService.translate("info", "forgot-password-please-enter-new-password"),'warning');
                                    return;
                                }

                                if (!isHanEisu(newPassword)){
                                    swal(localeService.translate("common", "error-title"),localeService.translate("info", "forgot-password-please-enter-password-by-hankaku"),"warning");
                                    return;
                                }
                                
                            
                                if (!confirmPassword){
                                    swal(localeService.translate("common", "error-title"),localeService.translate("info", "forgot-password-please-enter-confirm-password"),'warning');
                                    return;
                                }
                            
                            
                                if (newPassword != confirmPassword){
                                    swal(localeService.translate("common", "error-title"),localeService.translate("info", "forgot-password-password-not-match"),'warning');
                                    return;
                                }

                               
                            
                                resetPassword(name, newPassword, verificationCode);
                            })
                        },
                        onFailure: function(err) {
                            console.log(err);
                            swal(localeService.translate("common", "error-title"),window.translateErr(err) || JSON.stringify(err),'error');
                        },
                    });
                }

            }else{
                loader.style.display = 'none';
                swal(localeService.translate("common", "error-title"), response.message || JSON.stringify(response), 'error');
            }
        }

    };

    if (this.readyState === 4 && this.status !== 200) {
        swal(localeService.translate("common", "error-title"),localeService.translate("error", "common-error-message"),'warning')
    }
    xhr.open('GET', existUserApi, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send();
   

})

function resetPassword(name, password, verificationCode) {
    loader.style.display = 'block';
    var url = window._config.api.resetPassword;
    var params = {
        name: name,
        password: CryptoJS.SHA512(password).toString(),
        domain :window.getKintoneDomain(),
        code: verificationCode
    };

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(this.responseText);
            loader.style.display = 'none';
            if (response.statusCode === 200) {
                swal(localeService.translate("common", "success"), localeService.translate("info", "forgot-password-reset-success"), 'success')
                .then(function() {
                    window.location.href = './login.html';
                });
            }else{
                swal(localeService.translate("common", "error-title"),window.translateErr(response) || JSON.stringify(response), 'error');
            }
        }
    };
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(params));
}