/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-unused-lets */
const LocaleService = require('chobiit-common/src/application/locale-service').default;
const localeService = LocaleService.getInstance("client");

/**
 * Initialize
 */
 (function () {
    setPageTitle();
    generateBreadcrumbs();
    insertAppName('need-app-name');
    insertUserName('need-username');
    insertLogo('.logo');
    insertClassName('text-add');
    insertClassName('text-list');

    //add custom all

    addCustomAll('css');
    if (location.href != `https://${location.host}/list_app.html`){
        addCustomAll('js')
    }
    
    

    // attach events

    let listRecordLinks = Array.from(document.getElementsByClassName('list-record-link'));
    listRecordLinks.forEach(link => {
        link.addEventListener('click', () => {
            let appId = getQueryStringByName('appId');
            window.location.href = ['./list_record.html?appId=', appId].join('');
        });
    });

    let publicListRecordLinks = Array.from(document.getElementsByClassName('public-list-record-link'));
    publicListRecordLinks.forEach(link => {
        link.addEventListener('click', () => {
            let appId = getQueryStringByName('appId');
            window.location.href = ['./p_list_record.html?appId=', appId].join('');
        });
    });

    /**
     * 今後windowオブジェクトではなくmodule化の対応を取る。
     * backlog: https://noveldev.backlog.com/view/CHOBIIT-264
     */
    window.getQueryStringByName = getQueryStringByName;
    window.toggleClass = toggleClass;
    window.removeElement = removeElement;
    window.findAncestor = findAncestor;
    window.updateAppsInSidebar = updateAppsInSidebar;
    window.setActiveTabMenu = setActiveTabMenu;
    window.insertAppName = insertAppName;
    window.insertUserName = insertUserName
    window.attachEvent = attachEvent;
    window.escapeStringRegexp = escapeStringRegexp;
    window.getBase64 = getBase64;
    window.getKintoneDomain = getKintoneDomain;
    window.getFormUrl = getFormUrl;
    window.countRequest = countRequest;
    window.changeTextLink = changeTextLink;
    window.sendMailAlert = sendMailAlert;
    window.showError = showError;
    window.storeErr = storeErr;
    window.formatStr = formatStr;
    window.getAppSetting = getAppSetting;
    window.changeColor = changeColor;
    window.strlimit = strlimit;
    window.loadAllApps = loadAllApps;
    window.addCustomFile = addCustomFile;
    window.sendMail = sendMail;
    window.formatSubmitData = formatSubmitData;
    window.getUniqueStr = getUniqueStr;
    window.escapeOutput = escapeOutput;
    window.iterate = iterate;
    window.parseData = parseData;
    window.translateErr = translateErr;
    window.isHanEisu = isHanEisu;
    window.isHanSymbol = isHanSymbol;
    window.addCustomAll = addCustomAll;
    window.setPageTitle = setPageTitle;
    window.generateBreadcrumbs = generateBreadcrumbs;
})();


/**
 * Get query string by name from url
 * 
 * @param {string} name 
 * @param {string} url 
 */
function getQueryStringByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Toggle specific class of HTML element
 * 
 * @param {*} element 
 * @param {string} className 
 */
function toggleClass(element, className) {
    element.classList.toggle(className);
}

/**
 * Remove existing HTML element
 * 
 * @param {*} element 
 */
function removeElement(element) {
    element.parentNode.removeChild(element);
    return false;
}

/**
 * Find ancestor of element by specific class
 * 
 * @param {*} elem
 * @param {*} selector
 */
function findAncestor(elem, selector) {
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
                                    Element.prototype.webkitMatchesSelector;
        }
    while ((elem = elem.parentElement) && !((elem.matches || elem.matchesSelector).call(elem, selector)));
    return elem;
}


/**
 * Update apps list in sidebar
 * 
 * @param {array} newApps
 * @argument {function} callback
 */
function updateAppsInSidebar(newApps) {
    let apps = [];

    if (newApps) {
        apps = newApps;
    } else if (sessionStorage.getItem('apps')) {
        let appsInStorage = JSON.parse(sessionStorage.getItem('apps'));

        let expiredTime = appsInStorage.expiredTime;
        let now = new Date().getTime();
        if (expiredTime < now) {
            // TODO: call api to refresh list apps
            return;
        }
        apps = appsInStorage.apps;
    }

    let mainMenu = document.getElementById('mainMenu');
    apps.forEach(app => {
        // create main item
        let mainItem = document.createElement('a');
        mainItem.id = `mainItem${app.appId}`;
        mainItem.href = `#submenu${app.appId}`;
        mainItem.classList.add('nav-link', 'd-flex', 'justify-content-between', 'main-item');
        mainItem.setAttribute('data-toggle', 'collapse');
        mainItem.setAttribute('role', 'button');
        mainItem.setAttribute('aria-expanded', 'false');
        mainItem.setAttribute('aria-controls', `submenu${app.appId}`);

        // create title for main item
        let titleSpan = document.createElement('span');
        titleSpan.classList.add('nav-link-title');
        let titleIcon = document.createElement('i');
        titleIcon.classList.add('fas', 'fa-folder');
        titleSpan.innerHTML = `${titleIcon.outerHTML} ${app.name}`;

        // create angle-right icon for main item
        // let iconSpan = document.createElement('span');
        // iconSpan.classList.add('align-self-center');
        // let icon = document.createElement('i');
        // icon.classList.add('fas', 'fa-angle-right');
        // iconSpan.appendChild(icon);

        mainItem.appendChild(titleSpan);
        //mainItem.appendChild(iconSpan);

        // create sub menu
        let subMenu = document.createElement('div');
        subMenu.classList.add('submenu', 'collapse');
        subMenu.id = `submenu${app.appId}`;

        // create sub item 1: list record
        let listRecord = document.createElement('a');
        listRecord.classList.add('nav-link', 'item');
        listRecord.id = `listRecordMenu${app.appId}`;
        listRecord.title = localeService.translate("info", "list-record-title");
        let listRecordIcon = document.createElement('i');
        listRecordIcon.classList.add('fas', 'fa-angle-right');
        let listRecordTitle = document.createElement('span');
        listRecordTitle.innerText = `${app.showText ? app.showText.list : localeService.translate("info", "list-record-title")}`;
        listRecordTitle.className = `text-list-${app.appId}`
        listRecord.innerHTML = `${listRecordIcon.outerHTML} ${listRecordTitle.outerHTML}`;

        // create sub item 2: add record
        let addRecord = document.createElement('a');
        addRecord.classList.add('nav-link', 'item');
        addRecord.id = `addRecordMenu${app.appId}`;
        addRecord.title = localeService.translate("info", "add-record-title");
        let addRecordIcon = document.createElement('i');
        addRecordIcon.classList.add('fas', 'fa-angle-right');
        let addRecordTitle = document.createElement('span');
        addRecordTitle.innerText = `${app.showText ? app.showText.add : localeService.translate("info", "add-record-title")}`;
        addRecordTitle.className = `text-add-${app.appId}`;
        addRecord.innerHTML = `${addRecordIcon.outerHTML} ${addRecordTitle.outerHTML}`;

        if (app.hasOwnProperty('auth') && app.auth === false) {
            const appRights = app.appRights;
            if (appRights.includes('view')) {
                listRecord.href = `./p_list_record.html?appId=${app.appId}`;
                subMenu.appendChild(listRecord);
            }
            if (appRights.includes('add')) {
                addRecord.href = `./p_add_record.html?appId=${app.appId}`;
                subMenu.appendChild(addRecord);
            }
        } else {
            //check app right
            const appRights = JSON.parse(sessionStorage.getItem('appRights'));
            let rights = appRights.filter(x => x.appId == app.appId);
            if (rights[0].appRight.recordViewable == true){
                listRecord.href = `./list_record.html?appId=${app.appId}`;
                subMenu.appendChild(listRecord);
            }
            if (rights[0].appRight.recordAddable == true){
                addRecord.href = `./add_record.html?appId=${app.appId}`;
                subMenu.appendChild(addRecord);
            }
        }
        
        mainMenu.appendChild(mainItem);
        mainMenu.appendChild(subMenu);
    });

    // set active tab related to selected app
    setActiveTabMenu();

    // run callback if has
    let callback = arguments[1];
    callback instanceof Function ? callback() : '';
}

/**
 * Set selected app in sidebar
 */
function setActiveTabMenu() {
    let selectedAppId = getQueryStringByName('appId');
    if (selectedAppId) {
        // remove old active
        let menuItems = document.getElementsByClassName('main-item');
        menuItems = Array.from(menuItems);
        menuItems.forEach(item => {
            item.classList.remove('active');
        });

        // set new active tab
        let selectedItem = document.getElementById(`mainItem${selectedAppId}`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        if (jQuery) {
            $(`#submenu${selectedAppId}`).collapse('show');
        }
    }
}

/**
 * Insert app name for elements has specific class
 * 
 * @param {string} className 
 * @param {string|null} appName
 */
function insertAppName(className, appName = null) {
    if (!appName) {
        let appStorage = JSON.parse(sessionStorage.getItem('apps'));
        if (appStorage) {
            let apps = appStorage.apps;
            let selectedAppId = getQueryStringByName('appId');
            let selectedApp = apps.find(app => {
                return app.appId === selectedAppId;
            });
            appName = selectedApp ? selectedApp.name : '';
        }
    }

    let needles = document.getElementsByClassName(className);
    needles = Array.from(needles);
    needles.forEach(needle => {
        needle.innerHTML = appName;
    });
}

/**
 * Insert user name for elements has specific class
 * 
 * @param {string} className 
 * @param {string|null} username
 */
function insertUserName(className, username = null) {
    if (!username) {
        let userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            username = userInfo.name;
        }
    }

    let needles = Array.from(document.getElementsByClassName(className));
    needles.forEach(needle => {
        needle.innerHTML = username;
    });
}

/**
 * Attach event for HTML Element
 * 
 * @param {string} event 
 * @param {HTML Element} element 
 * @param {function} handleEvent 
 */
function attachEvent(event, element, handleEvent) {
    element.addEventListener(event, handleEvent);
}

/**
 * Escape RegExp special characters
 * 
 * @param {string} str 
 */
function escapeStringRegexp(str) {
    let matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
    if (typeof str !== 'string') {
        throw new TypeError('Expected a string');
    }

    return str.replace(matchOperatorsRe, '\\$&');
}

/**
 * Get content of file as base64
 * 
 * @param {file} file 
 */

function formatStr(str){
    if (str == null) return "";
    if (typeof str === 'string'){
        if (moment(str,'YYYY-MM-DDTHH:mm:ssZ',true).isValid()){
            return moment(str).format(`YYYY-MM-DD ${LocaleService.getTimeFormat()}`)
        }else if (moment(str,'HH:mm',true).isValid()){
            return moment(str,'HH:mm').format(LocaleService.getTimeFormat())
        }
        else {
            return str.replace(/(\r\n|\n|\r)/gm, "<br>");
        }
    }else if(Array.isArray(str)){
        let show ='';
        str.forEach(x=>{
            if(x.name){
                show = show + x.name + "<br>";
            }else{
                show = show + x + "<br/>";
            }
        })
        return show;
    }else if (typeof str === 'object'){
        return str.name;
    }
    return str;
}

function strlimit(text, count){
    return text.slice(0, count) + (text.length > count ? "..." : "");
}
 
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function insertLogo(logoClass){
    let config = JSON.parse(localStorage.getItem('config'));
    if (config){
        let showName = config.showName;
        let logoPattern = config.logoPattern;
        if (logoPattern == 1){
            $(logoClass).after(`<span>${showName}</span>`);
        }
        if (logoPattern == 0){
            $(logoClass).attr('src',config.logofile);
        }
        if (logoPattern == 2){
            $(logoClass).attr('src',config.logofile);
            $(logoClass).after(`<span style="padding-left: 5px;">${showName}</span>`);
        }
    }
}

function insertClassName(className){
    let appId = getQueryStringByName('appId');
    $('.'+ className).addClass(`${className}-${appId}`);
}

function getKintoneDomain(){
    var url = window.location.host
    var dm = url.substr(0, url.indexOf('.'))
    const chobiitDevDomain = process.env.CHOBIIT_DEV_DOMAIN_NAME
    /**
   　 * 開発環境の設定情報はJP版のため、USの確認の際に日本版のdomainで情報を取得するため、domainを変更する。
    　* 日本版domain: .cybozu.com
    　* US版domain: .kintone.com
    　*/
    if(dm === chobiitDevDomain){
        return `${chobiitDevDomain}.cybozu.com`;
    }
    return dm + localeService.translate("info", "kintone-domain");
}

function getFormUrl(domain, appId){
    return new Promise((resolve, reject) => {
        let url = window._config.api.getFormUrl.replace(/{appId}/, appId) + '?domain=' + domain ;
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let response = JSON.parse(this.responseText);
                let body = JSON.parse(response.body);
                if (body){
                    sessionStorage.setItem('chobiitInfo',JSON.stringify(body.data));
                    resolve(body.data.formUrl)     
                }else reject('errors'); 
            }
            if (this.readyState === 4 && this.status !== 200) {
               
                reject(localeService.translate("error", "common-error-message"));
                console.error('Server error!');
                window.storeErr(this,'server error');
                
            }
        };
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
    })
}

function getAppSetting(appId){
    let domain = getKintoneDomain();
    return new Promise((resolve, reject) => {
        let url = window._config.api.getAppSetting.replace(/{appId}/, appId) + '?domain=' + domain ;
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let response = JSON.parse(this.response);
                if (typeof response != 'object'){
                    response = JSON.parse(response);
                }
                let body = JSON.parse(response.body);
                if (body.code == 200){
                    sessionStorage.setItem('appSetting',JSON.stringify(body.data));
                    resolve(body.data)     
                }else reject(body.error); 
            }
            if (this.readyState === 4 && this.status !== 200) {
                
                reject(localeService.translate("error", "common-error-message"));
                console.error('Server error!');
                window.storeErr(this,'server error');
                
            }
        };
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
    })
}

function changeColor(templateColor){
    if (templateColor){
        $('.sidebar').css("background-color", templateColor.backgroundColor.bcolor1);
        $('.sidebar .submenu').css("background-color", lightenDarkenColor(templateColor.backgroundColor.bcolor1, -20));

        $('.sidebar .nav .nav-link.active').css("background-color", templateColor.backgroundColor.bcolor2);
        $('.header').css("background-color", templateColor.backgroundColor.bcolor3);

        $('.btn-green').css("background-color", templateColor.backgroundColor.bcolor2);
        $('.btn-green').hover(
          function (){
            $(this).css('background-color', lightenDarkenColor(templateColor.backgroundColor.bcolor2, -30))
          },
          function (){
            $(this).css('background-color', lightenDarkenColor(templateColor.backgroundColor.bcolor2, 20))
          }
        )

        $('.sidebar .brand-title').css("color", templateColor.fontColor.fcolor1);

        $('.sidebar .submenu .item').css("color", templateColor.fontColor.fcolor2);
        

        $('#dropdownMenuButton').css("color", templateColor.fontColor.fcolor3);


    }
}

function countRequest(domain, appId, loginName, times = 1){
    let data = {
        domain : domain,
        appId : appId,
        loginName : loginName,
        times : times
    }
    return new Promise((resolve, reject) => {
        var url = window._config.api.putCount ;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var response = this.response;
                resolve(response)
                // if (response.statusCode === 200) {
                //     console.log('config response: '+JSON.stringify(response, null, 2));
                //     var body = JSON.parse(response.body);
                // }
            }

            if (this.readyState === 4 && this.status !== 200) {
    -           reject(new Error('Server error!'))
                console.error('Server error!');
            }
        };
        xhttp.open('POST', url, true);
        xhttp.responseType = 'json';
        xhttp.send(JSON.stringify(data));
    })
}

function changeTextLink(){
    let domain = getKintoneDomain()
    var url = `${window._config.api.showText}?domain=${domain}`;
    var xhttp = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var response = this.response;
                if (typeof response != 'object'){
                    response = JSON.parse(response);
                }
                //console.log(JSON.stringify(response, null, 2))
                let body = response.body;
                let items = JSON.parse(body).item;
                items.map(item => {
                    let appId = item.app;
                    let text = item.showText;

                    $('.text-add-'+appId).html(`<span>${text.add}</span>`);
                    $('.text-list-'+appId).html(`<span>${text.list}</span>`);
                });
               resolve();
            }

            if (this.readyState === 4 && this.status !== 200) {
                console.error('Server error!');
                reject();
            }
        };
        xhttp.open('GET', url, true);
        xhttp.responseType = 'json';
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send();
    });
}

function sendMailAlert(data){
    var url = window._config.api.sendMailAlert ;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var response = this.response;
            
        }
        if (this.readyState === 4 && this.status !== 200) {

            console.error('Server error!');
        }
    };
    xhttp.open('POST', url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

function sendMail(data){
    data.domain = getKintoneDomain();
    return new Promise((resolve, reject) => {
        var url = window._config.api.sendMail ;				 
        $.ajax({
            type: 'POST',
            url: url,
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                console.log('send mail sucesss!!!');
                resolve()
            },
            error: function (err) {
                console.log('send mail fail !!!!' +JSON.stringify(err));
                reject()
            }
        })
    })
}

function isHanEisu(str){
    str = (str==null)?"":str;
    if(str.match(/^[A-Za-z0-9]*$/)){
      return true;
    }else{
      return false;
    }
  }

  function isHanSymbol(str){
    str = (str==null)?"":str;
    if(str.match(/^[A-Za-z0-9._@-]*$/) && ['.','-','_','@'].indexOf(str[0]) == -1){
      return true;
    }else{
      return false;
    }
  }

function showError(error){
    if ( typeof error === 'object'){
        if (error.messageDev.code == 'CB_VA01'){
            let errs = error.messageDev.errors;
            let msg = error.message;
            for (let key in errs){
                let field = key.substring(key.indexOf('.')+1,key.lastIndexOf('.'));
                let err = errs[key].messages
                msg =  msg + `\n${field}: ${err}`;
            }
            return msg
        }else if(error.messageDev.code == 'GAIA_LO04' || error.messageDev.code == 'GAIA_LO03'){
            return error.message;
        }else  if (error.code == 400 || error.statusCode == 400){
            return error.message;
        }else{
            return JSON.stringify(error.messageDev);
        }
    }else return error;
}

function storeErr(err, functionName){
    if (typeof err === 'object' && err !== null){
        err.userAgent = navigator.userAgent;
        // err.loginName = JSON.parse(sessionStorage.getItem('decodedToken')).loginName;
    }
    const URL = window._config.api.storeErr;
    const data = {
        domain : window.getKintoneDomain(),
        functionName : functionName,
        error : err,
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var response = this.response;
            console.log('put err success')
        }
        if (this.readyState === 4 && this.status !== 200) {
            console.error('put err fail');
        }
    };
    xhttp.open('PUT', URL, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

function escapeOutput(toOutput){
    return toOutput.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27')
}

function translateErr(err){
    let errMsg = "";
    if (err.code){
        switch (err.code) {
            case 'LimitExceededException':
                errMsg = localeService.translate("error", "limit-exceeded")
                break;
            case 'CodeMismatchException':
                errMsg = localeService.translate("error", "code-mismatch")
                break;

            case 'UsernameExistsException':
                errMsg = localeService.translate("error", "username-exists")
                break;

            case 'InvalidPasswordException':
                errMsg = localeService.translate("error", "invalid-password")
                break;
            case 'ExpiredCodeException' : 
                errMsg = localeService.translate("error", "expired-code")
                break;
            default:
                errMsg =  err.message
                break;
        }
    }else{
        errMsg =  JSON.stringify(err)
    }
    
    return errMsg;
}

function iterate(obj){
    if (obj){
        Object.keys(obj).forEach(key => {
        if (typeof obj[key] == 'string') obj[key] = escapeOutput(obj[key])
    
        if (typeof obj[key] === 'object') {
                iterate(obj[key])
            }
        })
    }
    

    return obj;
}

function parseData(text, appSetting, recordData, recordId){
    let match = text.match(/\{(.*?)\}/ig);
    if (match){
        match.forEach(tag => {
            let fieldCode = tag.substring(1, tag.length-1);
            let value;
            if (fieldCode == '$id'){
                value = recordId;
            }else if (!recordData[fieldCode]){
                if (appSetting.fields.hasOwnProperty(fieldCode)){
                    value =  ' '
                }else{
                    value =  tag
                }
            }else if (recordData[fieldCode].type == 'CHECK_BOX' || recordData[fieldCode].type == 'MULTI_SELECT'){
                value =  recordData[fieldCode].value.join(',');
            }else if (recordData[fieldCode].type == 'TIME'){
                value = moment(recordData[fieldCode].value,'HH:mm:ss').format('HH:mm')
            }else if (recordData[fieldCode].type == 'DATETIME'){
                value = moment(recordData[fieldCode].value).format('YYYY-MM-DD HH:mm')
            }else{
                value = recordData[fieldCode].value;
            }

            text = text.split(tag).join(value)

        })

    }
    return text;
}
function lightenDarkenColor(color, percent) {
  
    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
  
}

function formatSubmitData(recordData){
    let formattedRecordData = {};
    let subTables = {};
    Object.keys(recordData).forEach(fieldId => {
        let fieldCode = recordData[fieldId].code;
        let fieldValue = recordData[fieldId].value;
        let fieldType = recordData[fieldId].type;
        let reference = recordData[fieldId].reference;
        if (reference !== undefined) {
            subTables[reference.code] = subTables[reference.code] || [];
            subTables[reference.code].push(recordData[fieldId]);
        } else {
            formattedRecordData[fieldCode] = {
                type: fieldType,
                value: fieldValue
            };
        }
    });

    // format the SUB_TABLE field if it exists
    if (Object.entries(subTables).length > 0) {
        let formattedSubTables = {};

        Object.keys(subTables).forEach(subTableCode => {
            
            let tableFields = subTables[subTableCode];
            let column =  Array.from(new Set(tableFields.map( x => x.code)));

            let tableValue = [];
            let row = tableFields.length/column.length;
            for (let j = 0; j < row; j++){
                let obj = {
                    value : {}
                }
                column.forEach(function(item){
                    for (let i = 0; i < tableFields.length; i++){
                        let tableField = tableFields[i];
                        if (tableField.code == item){
                            let obj2 = {
                                [item] : {
                                    "value" :tableField.value,
                                    "type" :tableField.type
                                }
                            }
  
                            Object.assign(obj.value, obj2);
                            tableFields.splice(i,1);
                            break;
                        }
                    }
                       
                });
                    
                tableValue.push(obj);
            }
            
            
            formattedSubTables[subTableCode] = {
                type :'SUBTABLE',
              value: tableValue
            };
        });

        Object.assign(formattedRecordData, formattedSubTables);
    }
    return formattedRecordData;
}

function loadAllApps(idToken) {
    return new Promise(function (resolve, reject) {

        console.log('starting load list app ...');
        var url = window._config.api.getApps;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                    var response = this.response;
                    if (typeof response != 'object'){
                        response = JSON.parse(response);
                    }
                    if(response.code == 400){
                        swal(localeService.translate("common", "error-title"), response.message,'error')
                        //loader.style.display = 'none';
                        reject();
                    }
                    var body = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                    console.log('get list app respone: ');
                    
                    if ( body && body.apps && body.apps.length > 0){
                        // store app Right
                        var appRights = body.appRights;
                        sessionStorage.setItem('appRights', JSON.stringify(appRights));
                        // create app list
                        sessionStorage.setItem('apps', JSON.stringify({apps: body.apps}));
                        // window.updateAppsInSidebar(apps);
                        
                    }
                    resolve();
                
                //loader.style.display = 'none';
            }
            if (this.readyState === 4 && this.status !== 200) {
                loader.style.display = 'none';
                swal(
                    localeService.translate("common", "error-title"),
                    localeService.translate("error", "common-error-message"),
                    'warning');
                reject()
                console.error('Server error!');
                window.storeErr(this,'server error');
                
            }
        };
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Authorization', idToken.jwtToken)
        xhr.responseType = 'json';
        xhr.send();
    })
}

function addCustomFile(links ,type){
    if (type == 'css'){
        links.forEach(link => {

            $("<link/>", {
                rel: "stylesheet",
                type: "text/css",
                href: link
            }).appendTo("head");
        })
         
    }
    if (type == 'js'){
        links.forEach(link => {
            $("<script/>", {
                src: link + '?v='+ getUniqueStr()
            }).appendTo("body");
        })
         
    }

}

function addCustomAll(type){
    if (localStorage.getItem('config')){
        let config = JSON.parse(localStorage.getItem('config'));

        let jsCustomAll = config.jsCustomAll;
        let cssCustomAll = config.cssCustomAll;

        if (jsCustomAll && jsCustomAll.length && type == 'js') addCustomFile(jsCustomAll, 'js');
        if (cssCustomAll && cssCustomAll.length  && type == 'css') addCustomFile(cssCustomAll,'css')
    }else{
        var url = window._config.api.getShowText + '?domain=' + getKintoneDomain() ;
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
                
                    let jsCustomAll = config.jsCustomAll;
                    let cssCustomAll = config.cssCustomAll;

                    if (jsCustomAll && jsCustomAll.length && type == 'js') addCustomFile(jsCustomAll, 'js');
                    if (cssCustomAll  && cssCustomAll.length && type == 'css') addCustomFile(cssCustomAll,'css')
                }
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
}

function getUniqueStr(myStrong){
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
   }

function setPageTitle(pageName = null) {
    /**
     * setPageTitleを含めてjp/us統合を行う必要があります
     */
    if (process.env.CHOBIIT_LANG === "en") {
        return;
    }

    const pageTitle = {
        "list_record": "レコードの一覧",
        "detail_record": "レコードの詳細",
        "edit_record": "レコードの編集",
        "add_record": "レコードの追加",
        "forgot_password": "パスワードを忘れた場合",
        "list_app": "ホーム",
        "user_info": "ユーザー情報",
        "verify": "アカウント登録",
        "thanks": "完了",
        "register": "ユーザー登録",
        "login": "ログイン",
        "p_list_record": "レコードの一覧",
        "p_detail_record": "レコードの詳細",
        "p_add_record": "レコードの追加",
        "p_thanks": "完了",
    }
    if (!pageName) {
        var currentPageName = location.pathname.split('/').pop();
        pageName = currentPageName.split(".")[0];
    }

    let appStorage = JSON.parse(sessionStorage.getItem('apps'));
    let appName;
    if (appStorage) {
        let apps = appStorage.apps;
        let selectedAppId = getQueryStringByName('appId');
        let selectedApp = apps.find(app => {
            return app.appId === selectedAppId;
        });
        appName = selectedApp ? selectedApp.name : '';
    }

    document.title = appName ? `${appName} - ${pageTitle[pageName]} | Chobiit` : `${pageTitle[pageName]} | Chobiit`;
}

function generateBreadcrumbs(pageTitle) {
    if(!pageTitle) return;

    const recordDetailElement = document.getElementById('detail-or-edit-screen');
    recordDetailElement.textContent = pageTitle;
}