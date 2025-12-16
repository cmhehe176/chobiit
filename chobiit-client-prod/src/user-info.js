
            
var loader = document.getElementById('loader');
var cancelBtn = document.getElementById('cancelBtn');
var saveBtn = document.getElementById('saveBtn');
var userName = document.getElementById('userName');
var password = document.getElementById('password');
var mailAddress = document.getElementById('mailAddress');
var passwordDiv = document.getElementById('passwordDiv');
var params = {};

var originContent = null;

window.onload = function (event) {
    loader.style.display = "block";
    var idToken = JSON.parse(localStorage.getItem('idToken'))

    if (idToken) {
        loadAppListData(idToken);
        loadUserInfo(idToken);

        cancelBtn.addEventListener('click', function (e) {
            window.history.back();
        });

        saveBtn.addEventListener('click', function (e) {
            if (isValueChanged()) {
                updateUserInfo(idToken);
            } else {
                //alert('Nothing changed');
            }
        });
        
    } else {
        window.location.href = './login.html';
    }

};

$(function () {
        $('#change-password').click(function(){
            if ($('.fa-chevron-circle-down').is(":hidden")){
                $('.fa-chevron-circle-down').show();
                $('.fa-chevron-circle-right').hide();
            }else{
                $('.fa-chevron-circle-down').hide();
                $('.fa-chevron-circle-right').show();
            }

            // if($('#password-div').is(":hidden")){
            // 	$('#password-div').show();
            // }else{
            // 	$('#password-div').hide();
            // }
            $('#nowPassword').val('');
            $('#password-div').slideToggle();
        })
 
   });

// changePassword.addEventListener('change', function (event) {
//     if (this.checked) {
//         passwordDiv.style.display = 'flex';
//     } else {
//         passwordDiv.style.display = 'none';
//     }
// });

/*
|--------------------------------------------------------------------------------------------
|   Function
|--------------------------------------------------------------------------------------------
*/
function loadUserInfo(idToken) {
    loader.style.display = 'block';
    var url = window._config.api.userInfo;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            try {
                var response = JSON.parse(this.responseText);
                // var body = JSON.parse(response.body);
                if (response.code === 200 && response.userInfo) {
                    originContent = response.userInfo;
                    userName.value = response.userInfo.name;
                    mailAddress.value = response.userInfo.mailAddress;
                } else {
                    response.message ? alert(response.message) : '';

                }
            } catch (e) {
                console.log(e);
            }

            loader.style.display = 'none';
        }
    };
    xhr.open('GET', url, true);
    // xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', idToken.jwtToken)
    xhr.send();
}

function updateUserInfo(idToken) {
    loader.style.display = 'block';
    var url = window._config.api.userInfo;
    // var params = {
    //     name: userName.value,
    //     mailAddress: mailAddress.value,
    //     password: password.value
    // };
    params.name =   window.escapeOutput(userName.value)
    params.mailAddress =  mailAddress.value;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            try {
                var response = JSON.parse(this.responseText);

                //body.message ? alert(body.message) : '';
                

                if (response.code === 200) {
                 
                    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    userInfo.name = response.result.dynamo.name;
                    userInfo.mailAddress = response.result.dynamo.mailAddress;
                    localStorage.setItem("userInfo", JSON.stringify(userInfo));

                    swal('成功！', 'ユーザ情報を更新しました。', 'success')
                    .then(function() {
                       window.location.reload();
                    });
                    
                    return false;
                }
            } catch (e) {
                console.log(e)
            }

            loader.style.display = 'none';
        }
    };
    xhr.open('POST', url, true);
    // xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', idToken.jwtToken)
    xhr.send(JSON.stringify(params));
}

function isValueChanged() {
    if (userName.value == originContent.name && mailAddress.value == originContent.mailAdress) {
        return false;
    }

    if (!userName.value){
        swal('エラー','ユーザ名を入力してください。','warning');
        return false;
    }

    if (!mailAddress.value){
        swal('エラー','メールアドレスを入力してください。','warning');
        return false
    }

    var re = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;
    if(!re.test(mailAddress.value)){
        swal('エラー','メールアドレスの形式が正しくありません','warning');
        return false
    }

    if(!$('#password-div').is(":hidden")){
        let nowPassword = $('#nowPassword').val();
        let newPassword  = $('#newPassword').val();
        let renewPassword = $('#renewPassword').val();

        if (!nowPassword || !newPassword || !renewPassword){
            swal('エラー','パスワードを入力してください。','warning');
            return false;
        }

        if (CryptoJS.SHA512(nowPassword).toString() != originContent.password){
            swal('エラー','現在のパスワードが違います。','warning');
            return false;
        }
        
        if (newPassword != renewPassword){
            swal('エラー','新しいパスワードと再入力パスワードが異なります。','warning');
            return false;
        }

        params.password = CryptoJS.SHA512(newPassword).toString();
    }
    return true;
}


async function loadAppListData(idToken) {
    var appsInStorage = JSON.parse(sessionStorage.getItem('apps'));
    if (!appsInStorage) {
        await loadAllApps(idToken);
    }
    window.insertAppName('need-app-name');

    updateAppsInSidebar()

    return 1;
}
