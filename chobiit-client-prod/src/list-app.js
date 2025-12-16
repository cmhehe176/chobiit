
let userSession = localStorage.getItem('us')
var appsList = document.getElementById('appsList');
//var loader = document.getElementById('loader');


window.onload = function (event) {
    //loader.style.display = 'block';
    var idToken = JSON.parse( localStorage.getItem('idToken'))
    if (idToken) {
        
        loadListApps(idToken);
    } else {
        //loader.style.display = 'none';
    }
};

function loadListApps(idToken) {
    console.log('starting load list app ...');
    var url = window._config.api.getApps;
    var xhr = new XMLHttpRequest();
   

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
                var response = this.response;
                if (typeof response != 'object'){
                    response = JSON.parse(response);
                }
               
                console.log('get list app respone: ');

                    if(response.code == 400){
                        swal('エラー',response.message,'error')
                        //loader.style.display = 'none';
                        return;
                    }
                    var body = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                    if ( body && body.apps && body.apps.length > 0){
                        // store app Right
                        var appRights = body.appRights;
                        sessionStorage.setItem('appRights', JSON.stringify(appRights));

                        // create app list
                        var apps = body.apps.map(function (appDetail) {
                            // create div wrap
                            var card = document.createElement('DIV');
                            card.classList.add('card');
                            card.classList.add('app');
                            card.classList.add('col-sm-12');
                            card.classList.add('col-md-3');

                            // create app header
                            var cardHeader = document.createElement('H4');
                            cardHeader.classList.add('card-header');

                            var link = document.createElement('A');
                            //link.href = './list_record.html?appId=' + appDetail.appId;
                            //link.title = '一覧画面';
                            link.innerHTML = appDetail.name;
                            cardHeader.appendChild(link);

                            // create card body
                            var cardBody = document.createElement('Div');
                            cardBody.classList.add('card-body');
                        


                            // create app text
                            var cardText = document.createElement('H5');
                            cardText.classList.add('card-text');


                            //check app right
                            var right = appRights.filter(x => x.appId == appDetail.appId)
                            if (right[0].appRight.recordViewable == true){
                                $(cardText).append(`<a href="./list_record.html?appId=${appDetail.appId}" title="一覧画面" class="link-al text-list-${appDetail.appId}"><span>${appDetail.showText ? appDetail.showText.list : '一覧画面'}</span></a>`)

                            }
                            
                            if (right[0].appRight.recordAddable == true){
                                $(cardText).append(`<a href="./add_record.html?appId=${appDetail.appId}" title="新規作成" class="link-al text-add-${appDetail.appId}"><span>${appDetail.showText ? appDetail.showText.add : '新規作成'}</span></a>`);
                            }
                            
                            card.appendChild(cardHeader);
                            cardBody.appendChild(cardText);
                            card.appendChild(cardBody);
                            appsList.appendChild(card);

                            return appDetail;
                        });

                        // set expired time for apps in session storage
                        var expiredTime = new Date();
                        var minutesToAdjust = 2 * 60;
                        expiredTime.setMinutes(expiredTime.getMinutes() + minutesToAdjust);
                        //sessionStorage.setItem('apps', JSON.stringify({apps: apps, expiredTime: expiredTime.getTime()}));

                        sessionStorage.setItem('apps', JSON.stringify({apps: apps}));
                        
                        window.updateAppsInSidebar(apps);



                        //change text
                        //window.changeTextLink().then(function(){
                            //loader.style.display = 'none';
                        //})
                    } else {
                        $(appsList).append(`<div class="no-app">
                        <i class="far fa-frown" style="padding-bottom: 2rem;font-size: 9rem;padding-left: 7rem;"></i>
                        <h2>該当アプリがありません。</h2>
                        </div>`);
                        //loader.style.display = 'none';

                    }

                    window.addCustomAll('js')
                   
            //loader.style.display = 'none';
        }
        if (this.readyState === 4 && this.status !== 200) {
            swal('エラー','通信が混み合っています。\nもう一度試してください','warning')
            console.error('Server error!');
            window.storeErr(this,'server error');
            
        }
    };
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Authorization', idToken.jwtToken)
    xhr.responseType = 'json';
    xhr.send();
}
