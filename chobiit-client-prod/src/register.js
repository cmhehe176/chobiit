require('cross-fetch/polyfill');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const LocaleService = require('chobiit-common/src/application/locale-service').default;
const localeService = LocaleService.getInstance("client");

var domain = window.getKintoneDomain()
//load show text
var url = window._config.api.getConfig + '?domain=' + domain ;
var registerBtn = document.getElementById('register-btn');
var usernameAlert = document.getElementById('usernameAlert');
var passwordAlert = document.getElementById('passwordAlert');


let config;

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




registerBtn.addEventListener('click', async function () {
	$("#register-btn").html('<div class="spinner-border text-info" role="status"></div>');
	
	
	if (!config.userAuth) {
		swal(localeService.translate("common", "error-title"),localeService.translate("error", "cannot-use-register"),'error');
		$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
		return false;
	}

	var	loginName = document.getElementById("loginName").value;
	var	email = document.getElementById("email").value;
	var password =  document.getElementById("password").value;	
	var rePassword =  document.getElementById("re-password").value;	




	if (!loginName) {
		swal(localeService.translate("common", "error-title"),localeService.translate("error", "please-enter-login-name"),"warning");
		$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
		return false;
	}

	const loginNameRegex =  /^\S{1,}$/;


	if (!loginNameRegex.test(loginName)){
		swal(localeService.translate("common", "error-title"),localeService.translate("error", "not-include-space-in-login-name"),"warning");
		$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
		return false;
	}

	if (process.env.CHOBIIT_LANG === "en") {
		if (!window.isHanSymbol(loginName) || loginName.length < 3 || loginName.length > 64){
			swal('Error.',"Login name: Use 3 - 64 characters with a mix of letters and/or numbers, \nand symbol . - _ @ (other symbols are not supported) \nstarting from either a letter or number","warning");
			$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
			return false;	
		}
	} else if (process.env.CHOBIIT_LANG === "ja") {
		if (loginName.length > 128) {
			swal(localeService.translate("common", "error-title"),"ログイン名の最大文字数は128文字です","warning");
			$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
			return false;
		}
	}

	if (!email) {
		swal(localeService.translate("common", "error-title"),localeService.translate("error", "please-enter-email"),"warning");
		$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
		return false;
	}

	const regexMail = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;
	if (!regexMail.test(email)) {
		swal(localeService.translate("common", "error-title"),localeService.translate("error", "enter-valid-email-address"),"warning");
		$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
		return false;
	}

	if (!password) {
		swal(localeService.translate("common", "error-title"), localeService.translate("error", "please-enter-password"),"warning");
		$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
		return false;
	}

	if (!isHanEisu(password)){
		swal(localeService.translate("common", "error-title"),localeService.translate("error", "please-enter-password-by-hankaku"),"warning");
		$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
		return false;
	}

	if (process.env.CHOBIIT_LANG === "ja") {
		if (password.length > 50) {
			swal(localeService.translate("common", "error-title"),"パスワードは半角英数字で最大文字数は５０文字です","warning");
			$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
			return false;
		}
	}

	
	if (rePassword != password) {
		swal(localeService.translate("common", "error-title"),localeService.translate("error", "password-not-match"),"warning");
		$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`);
		return false;
	}
		
	password = CryptoJS.SHA512(password).toString();

	try {
		let checkDuplicate = await checkDuplicateUser(loginName, domain);
		if (checkDuplicate){
			swal(localeService.translate("common", "error-title"),localeService.translate("error", "login-name-already-exists"), 'error');
			$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`)
			return;
		}

		let checkSlot =  await checkExistSlot(domain);
		if (!checkSlot){
			swal(localeService.translate("common", "error-title"),localeService.translate("error", "exceed-user-limit"), 'error');
			$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`)
			return;
		}


		

		var attributeList = [];

		var dataName = {
			Name : 'nickname', 
			Value : loginName,
		};

		var dataEmail = {
			Name : 'email', 
			Value : email,
		};

		var dataDomain = {
			Name : 'custom:domain',
			Value : domain
		};

		var poolData = {
			UserPoolId :  window._config.cognito.UserPoolId, 
			ClientId :  window._config.cognito.ClientId, 
		};
		let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

		var attributeName = new AmazonCognitoIdentity.CognitoUserAttribute(dataName);
		var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
		var attributeDomain = new AmazonCognitoIdentity.CognitoUserAttribute(dataDomain);

		attributeList.push(attributeName)
		attributeList.push(attributeEmail);
		attributeList.push(attributeDomain);

		let result = await new Promise((resolve, reject) => {		
			userPool.signUp(loginName, password, attributeList, null, function(err, result){
				if (err) {
					console.log(err);
					reject(new Error(window.translateErr(err)))
				}else{
					resolve(result);
				}
			});
		})

		console.log(result);

		window.localStorage.setItem('current_register_name', loginName);
		window.localStorage.setItem('current_register_email', email);
		window.localStorage.setItem('current_register_password', password);	
		window.location.href = './verify.html';
						

	}catch(err){
		$("#register-btn").html(`<span>${localeService.translate("info", "register")}</span>`)
		console.log(err);
		swal(localeService.translate("common", "error-title"),err.message || JSON.stringify(err), 'error');
		window.storeErr(err.message || err.stack,'ユーザー作成');
	}
	

});

function checkDuplicateUser(loginName, domain){
	return new Promise((resolve, reject) => {
		var existUserApi = window._config.api.existUser + '?loginName=' + loginName + '&domain=' + domain;

		var xhttp = new XMLHttpRequest();

		xhttp.onreadystatechange = function () {
			if (this.readyState === 4 && this.status === 200) {
				var response = this.response;
				if (typeof response != 'object'){
						response = JSON.parse(response);
				}
				if (response.statusCode === 200 ) {
					var body = JSON.parse(response.body);
					resolve(body.check);
				}else{
					reject(response)
				}
			}

			if (this.readyState === 4 && this.status !== 200) {
				reject(new Error(localeService.translate("error", "common-error-message")))
			}
		};
		xhttp.open('GET', existUserApi, true);
		xhttp.responseType = 'json';
		xhttp.setRequestHeader('Content-type', 'application/json');
		xhttp.send();
	})
}

function checkExistSlot(domain){
	return new Promise((resolve, reject) => {
		var existSlotApi = window._config.api.existSlot + '?domain=' + domain;

		var xhttp = new XMLHttpRequest();

		xhttp.onreadystatechange = function () {
			if (this.readyState === 4 && this.status === 200) {
				var response = this.response;
				if (typeof response != 'object'){
						response = JSON.parse(response);
				}
				if (response.statusCode === 200 ) {
					var body = JSON.parse(response.body);
					resolve(body.check);
				}else{
					reject(response)
				}
			}

			if (this.readyState === 4 && this.status !== 200) {
				reject(new Error(localeService.translate("error", "common-error-message")))
			}
		};
		xhttp.open('GET', existSlotApi, true);
		xhttp.responseType = 'json';
		xhttp.setRequestHeader('Content-type', 'application/json');
		xhttp.send();
	})
}
