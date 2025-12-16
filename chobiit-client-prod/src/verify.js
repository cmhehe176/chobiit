require('cross-fetch/polyfill');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');

var currentUserName = localStorage.getItem('current_register_name');
var currentUserMail = localStorage.getItem('current_register_email');

var currentUserPassword = localStorage.getItem('current_register_password');

var domain = window.getKintoneDomain();
var verifyBtn = document.getElementById('verify-btn');


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
      
      swal('エラー','通信が混み合っています。\nもう一度試してください','warning')
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

if (!currentUserMail) {
  window.location.href = "./register.html";
}

document.getElementById("mail-text").innerHTML = currentUserMail;


verifyBtn.addEventListener('click', function () {
  $('#verify-btn').html(`<div class="spinner-border text-info" style="width: 1.4rem; height:1.4rem" role="status"></div>`)
  var verifyCode = document.getElementById("verify_code").value.trim();
  verifySuccess(verifyCode);
});


function verifySuccess(verifyCode) {
  // Call Api update chobiit account
  var dataChobiitone = {
    domain : domain,
    name : currentUserName,
    email: currentUserMail,
    password: currentUserPassword,
    code: verifyCode,
  };

  var registerApi = window._config.api.register;

  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var response = this.response;
      if (typeof response != 'object'){
          response = JSON.parse(response);
      }
      if (response.statusCode === 200) {
        window.localStorage.removeItem('current_register_name');
        window.localStorage.removeItem('current_register_email');
        window.localStorage.removeItem('current_register_password');
        window.location.href = "./login.html";
      }else{
        swal('エラー',window.translateErr(response) || JSON.stringify(response), 'error');
        $("#verify-btn").html('<span>認証する</span>');
      }
    }
  };

  xhttp.open('POST', registerApi, true);  
  xhttp.responseType = 'json';
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send(JSON.stringify(dataChobiitone));
}

$(document).ready(function () {
  var timeout = null;
  const time = 30;

  function start(second) 
  {

    if (second == 0) {
      $("#resend-code").prop('disabled', false);
      $("#resend-code").removeClass('not-allowed');
      clearTimeout(timeout);
      $(".time-out").text('');
      return false;
    }

    $(".time-out").text('(' + second.toString() + ')');
    timeout = setTimeout(function(){
      second--;
      start(second);
    }, 1000);
  }

  start(time);

  $("#resend-code").click(function () {
    $("#resend-code").addClass('not-allowed');
    $("#resend-code").prop('disabled', true);
    start(time);

    var dataResend = {
      name : currentUserName
    }

    var resendCodeApi = window._config.api.resendConfirmationCode;

    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        var response = this.response;
        if (typeof response != 'object'){
            response = JSON.parse(response);
        }
        if (response.statusCode && response.statusCode === 200) {
          swal('Success', response.message, 'success');
        }else{
          swal('エラー',window.translateErr(response) || JSON.stringify(response), 'error');
        }
      }
    };

    xhttp.open('POST', resendCodeApi, true);  
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(dataResend));
  })
})
 
