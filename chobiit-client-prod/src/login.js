require('cross-fetch/polyfill');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const LocaleService = require('chobiit-common/src/application/locale-service').default;
const localeService = LocaleService.getInstance("client");

var loginBtn = document.getElementById('loginBtn');
var usernameInput = document.getElementById('username');
var passwordInput = document.getElementById('password');
var loader = document.getElementById('loader');
var usernameAlert = document.getElementById('usernameAlert');
var passwordAlert = document.getElementById('passwordAlert');

var domain = window.getKintoneDomain();

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
            var config = body.data.config;
        
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
  
loginBtn.addEventListener('click', function () {
    usernameAlert.style.display = 'none';
    passwordAlert.style.display = 'none';
    var username = escapeOutput(usernameInput.value);
    var password = escapeOutput(passwordInput.value);

    if (username && password) {
        if (process.env.CHOBIIT_LANG === "en") {
            if (!window.isHanSymbol(username) || username.length < 3 || username.length > 64) {
                swal('Error.',"Login name: Use 3 - 64 characters with a mix of letters and/or numbers, \nand symbol . - _ @ (other symbols are not supported) \nstarting from either a letter or number","warning");
                return false;
            }
        }
        postLogin({
            username: username,
            password: password
        });   
    } else {
        username ? '' : usernameAlert.style.display = 'block';
        password ? '' : passwordAlert.style.display = 'block';
    }
});

passwordInput.addEventListener('keyup', function (event) {
    event.keyCode === 13 ? loginBtn.click() : '';
});

function postLogin({username, password}) {
    var authenticationData = {
        Username: username,
        Password: CryptoJS.SHA512(password).toString(),
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
        authenticationData
    );
    var poolData = {
        UserPoolId: window._config.cognito.UserPoolId, // Your user pool id here
        ClientId: window._config.cognito.ClientId, // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username: username,
        Pool: userPool,
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    $('#loginBtn').html(`<div class="spinner-border text-info" role="status"></div>`)
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {
            console.log(result);
            let idToken = result.getIdToken();


            let domainPayload = idToken.payload['custom:domain'];
            if (domainPayload.split('.')[0] == domain.split('.')[0]){
                loadUserInfo(idToken)
                .then(userInfo => {
                    delete userInfo['password'];
    
                    localStorage.setItem("idToken", JSON.stringify(idToken));
                    localStorage.setItem("userInfo", JSON.stringify(userInfo));
                    
                    let index = location.href.indexOf('redirect');
                    if (index != -1){
                        let redirectTo = location.href.substr(index+9);
                        if (redirectTo.indexOf(window.location.origin) == 0){
                            window.location.href = redirectTo;
                        }else{
                            window.location.href = './list_app.html';       
                        }
                        
                    }else{
                        window.location.href = './list_app.html';  
                    }
                })
                .catch(err => {
                    $('#loginBtn').html(`<span>${localeService.translate("info", "login")}</span>`)
                    swal(localeService.translate("common", "error-title"),err.message || JSON.stringify(err),'error')
                })
            }else{
                $('#loginBtn').html(`<span>${localeService.translate("info", "login")}</span>`)
                swal(localeService.translate("common", "error-title"),localeService.translate("error", "wrong-username-password"),'error');
            }
        },
        onFailure: function(err) {
            console.log(err);
            $('#loginBtn').html(`<span>${localeService.translate("info", "login")}</span>`)
            swal(localeService.translate("common", "error-title"),localeService.translate("error", "wrong-username-password"),'error');
        },
    })
}

function loadUserInfo(idToken) {    
    return new Promise((resolve, reject) => {

        var url = window._config.api.userInfo;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                try {
                    var response = JSON.parse(this.responseText);
                    // var body = JSON.parse(response.body);
                    if (response.code === 200 && response.userInfo) {
                        resolve(response.userInfo)
                    } else {
                        reject(response)

                    }
                } catch (e) {
                   reject(err)
                }
            }
            if (this.readyState === 4 && this.status !== 200) {
               
                reject(localeService.translate("error", "common-error-message"))
                console.error('Server error!');
                window.storeErr(this,'server error');
                
            }
        };
        xhr.open('GET', url, true);
        // xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', idToken.jwtToken)
        xhr.send();
    })
}
