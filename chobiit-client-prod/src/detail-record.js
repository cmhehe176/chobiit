

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/* eslint-disable no-useless-escape */
const saveRecordUtility = require('./save-record-utility');
const templateColor = require('./change-color-utiliy.js');
const setMaxHeightIframe = require('./style-adjustments/customize-iframe.js');
const LocaleService = require('chobiit-common/src/application/locale-service').default;
const localeService = LocaleService.getInstance("client");
require('cross-fetch/polyfill');

var loader = document.getElementById('loader');
var iframe = document.getElementById('iframe');
var addRecordBtn = document.getElementById('addRecordBtn');
var editRecordBtn = document.getElementById('editRecordBtn');
var duplicateRecordBtn = document.getElementById('duplicateRecordBtn');
var editMenu = document.getElementById('editMenu');
var appMenu = document.getElementById('appMenu');
var cancelEditBtn = document.getElementById('cancelEditBtn');
var submitEditBtn = document.getElementById('submitEditBtn');
var commentBtn = document.getElementById('commentBtn');
var commentContent = document.getElementById('commentContent');
var commentContanier = document.getElementById('commentContanier');
var appId = window.getQueryStringByName('appId');
var recordId = window.getQueryStringByName('id');
var idToken = JSON.parse(localStorage.getItem('idToken'));
var record;
let fileSpace = [];
var recordRight;
var actionApp;
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
var domain = window.getKintoneDomain();
var loginName = userInfo.loginName;
var modal = document.getElementById('myModal'); // Get the image and insert it inside the modal - use its "alt" text as a caption

var img = document.getElementById('myImg');
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
var imgClose = document.getElementsByClassName("img-close")[0];
var imgDown = document.getElementsByClassName("img-down")[0];

loader.style.display = 'block';
$('.se-pre-con').css('background','white')

window.onload = function () {
    //loader.style.display = 'block';
    
    if (idToken && appId && recordId) {
        
        Promise.all([
            loadAppListData(idToken),
            window.getAppSetting(appId)
        ])
        .then(([load, appSetting]) => {
            showActionButton();
            window.changeColor(appSetting.templateColor);

            if (appSetting.showComment){
                $('#mainContent').parent().next().show();
                $('#mainContent').parent().removeClass('col-md-12').addClass('col-md-8');
                loadComment();
            }

            //保存ボタンの名称
            if (appSetting.saveButtonName){
                $('#submitEditBtn').text(appSetting.saveButtonName)
            } 

            //cssCustom
            if (appSetting.cssCustom && appSetting.cssCustom.length){
                window.addCustomFile(appSetting.cssCustom, 'css');
            }

            loadAppForm(appSetting)

        })
        .catch(err => {
            loader.style.display = 'none';
            swal(
                localeService.translate("common", "error-title"),
                localeService.translate("error", "cannot-get-app-config"),
                'error');
            console.error('get app setting fail');
            console.error(err);
            window.storeErr(err,'Detail page');
        })
    }
};

$('iframe').on('load', function () {
    //change height iframe
    // console.log($(this.contentWindow.document.getElementsByClassName("container-fluid")).height());
    // var containerHeight = $(this.contentWindow.document.getElementsByClassName("container-fluid")).height();
    // var lastHeight = parseInt(containerHeight) + 100;
    // this.style.height = lastHeight + 'px';

    setMaxHeightIframe();
    let iframeElement = this;

    const ro = new ResizeObserver((entries, observer) => {
      
        iframeElement.style.height = Math.floor(entries[0].contentRect.height) + 50 + 'px';
        
    });
    
    ro.observe(document.getElementById('iframe').contentWindow.document.querySelector('.container-fluid'));

    // const resizeObserver = new ResizeObserver(entries => {
    //     console.log('Body height changed:', entries[0].target.clientHeight)
    //     iframeElement.style.height = entries[0].target.clientHeight + 50 + 'px';
    //     }
    // )
      
    // // start observing a DOM node
    // resizeObserver.observe(document.getElementById('iframe').contentWindow.document.querySelector('.container-fluid'))

    $("#iframe").contents().find('table').each(function () {
        if($(this).attr('data-type') != 'REFERENCE_TABLE' && $(this).find('td').length == 1){
            $(this).hide();
        }
    }); 

    //file handle
    $("iframe").contents().on("change", 'input:file', function () { 
        let files = Array.from(this.files);

        files.forEach(file=> {
            let fileId = window.getUniqueStr();

            fileSpace.push({
                fileId : fileId,
                file: file,
            });

            let label = `<div name=${file.name} file-id="${fileId}" class="label label-info"><i class="delete-file fas fa-times"></i> ${file.name}</div>`;
            $(this).parent().parent().append(label);
        });
  
        $(this).val('')
    });
    
    $("iframe").contents().on("click", ".delete-file", function () { 
        let fileId = $(this).parent().attr('file-id');
        fileSpace = fileSpace.filter(file => file.fileId != fileId);
        $(this).parent().remove();
    });

    //count request if download size > 3MB
    $("iframe").contents().on("click", ".file-download", function () {
        if ($(this).children().hasClass('delete-file')) return;
        let file = {
            name : $(this).attr('name'),
            fileKey :$(this).attr('key'),
            type : $(this).attr('type'),
        }
        loader.style.display = 'block';
        saveRecordUtility.downloadFile(file, window._config.api.downloadFile, idToken)
        .then((url) => {

            loader.style.display = 'none';


            if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
                fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    window.navigator.msSaveOrOpenBlob(blob, file.name);
                })
                
            } else { // for Non-IE (chrome, firefox etc.)
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                
                a.href =  url;
                a.download = file.name;
                a.click();
                URL.revokeObjectURL(a.href)
                a.remove();
            }

             //do something
            var size = $(this).attr('size');
            if (size > 1048576) {
                var times =  Math.ceil(size / 1048576)
                window.countRequest(domain, appId, loginName, times);
            } else {
                window.countRequest(domain, appId, loginName);
            }
        })
        .catch(err => {
            swal(localeService.translate("common", "error-title"),err.message || JSON.stringify(err), 'error');
            loader.style.display = 'none';
            console.log(err);
        })

    });

    $("iframe").contents().on("click", ".image-frame", function () {
        //show modal
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt; //download image buttone

        var blobUrl = $(this).attr('src');
        var name = $(this).attr('alt');
        var size = $(this).attr('size');
        imgDown.href = blobUrl;
        imgDown.download = name;

        $(imgDown).attr('size', size);
        $(imgDown).attr('name', name);
    });

    imgClose.onclick = function () {
        modal.style.display = "none";
    };

    imgDown.onclick = function () {
        var size = $(this).attr('size');

        let url = $(this).attr('href');
        let name = $(this).attr('name');

        if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
            fetch(url)
            .then(res => res.blob())
            .then(blob => {
                window.navigator.msSaveOrOpenBlob(blob, name);
            })
        }
        if (size > 1048576) {
            var times =  Math.ceil(size / 1048576)
            window.countRequest(domain, appId, loginName, times);
        } else {
            window.countRequest(domain, appId, loginName);
        }
    }; //hide create time, edit time field

}); //add comment

commentBtn.addEventListener('click', function () {
    console.log('starting add comment ..')
    var $commentBtn = $(this);
    $commentBtn.prop('disabled', true);
    $commentBtn.prepend('<span class="spinner-grow spinner-grow-sm"></span>');
    var content = escapeOutput($(commentContent).val());
    var date = new Date().toLocaleString();
    var username = '';
    var name = '';

    if (userInfo) {
        username = userInfo.name;
        name = userInfo.kintoneUsername;
    }
    content = localeService.translate("error", "posted-message",{username, content})
    var contentShow = content.split('\n').join('<br>');
    var addCommentPromise = new Promise(function (resolve, reject) {
        var url = window._config.api.addComment.replace(/{appId}/, appId).replace(/{id}/, recordId);
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var response = this.response;
                if (typeof response != 'object'){
                    response = JSON.parse(response);
                }
                if (response) {
                    if (response.code === 200) {
                        var result = response.result;
                        console.log('add comment success');

                        resolve(result);
                    } else {
                        console.error('add comment fail');
                        console.error(response.message);
                        
                        reject(response.message);
                    } //loader.style.display = 'none';
                }
                else {
                    reject('Server error!');
                }

            }
            if (this.readyState === 4 && this.status !== 200) {
               
                reject(new Error(localeService.translate("error", "common-error-message")));
                
            }
        };
        xhr.open('POST', url, true);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Authorization', idToken.jwtToken)
        xhr.send(content);
    });
    addCommentPromise.then(function (result) {
        $commentBtn.prop('disabled', false);
        $commentBtn.find('.spinner-grow').remove();
        var div = "<div class=\"media\" commentid=\"".concat(result.id, "\">\n                    <img alt=\"32x32\" class=\"mr-2 rounded\" src=\"./images/user.png\" ;=\"\" style=\"width: 32px; height: 32px; margin-top: 5px;\">\n                    <div class=\"media-body pb-3 mb-0  lh-125\">\n                        <p class=\"comment-content\">\n                            <strong class=\"d-block text-gray-dark\">").concat(result.id, ": ").concat(name, "</strong>\n                            ").concat(contentShow, "\n                         </p>\n                        <small class=\"text-muted\" style=\"padding-left: 10px; font-size: 11px;\">").concat(date, "</small>\n                    </div>\n                    <i class=\"btn fas fa-eraser delete-comment\"></i>\n                </div>");
        $(commentContanier).prepend(div);
        $(commentContent).val("");
    })
    .catch(err => {
        console.log(err);
        swal(localeService.translate("common", "error-title"),err.message || JSON.stringify(err), 'error');
        
        window.storeErr(err,'detail record page');
        $commentBtn.prop('disabled', false);
        $commentBtn.find('.spinner-grow').remove();
    })
}); //remove comment

$("body").delegate(".delete-comment", "click", function () {
    swal({
        text: localeService.translate("info", "is-it-ok-to-delete"),
        icon: "warning",
        buttons: [localeService.translate("common", "cancel-title"),localeService.translate("common", "action-delete")],
        closeOnClickOutside: false,
        dangerMode: true
    }).then(function (willDelete) {
        if (willDelete) {
            deleteComment();
        }
    });
    var $comment = $(this).parent();
    var commentId = $comment.attr('commentid');

    function deleteComment() {
        console.log('starting delete comment...')
        $comment.remove();
        // $comment.find('.delete-comment').remove();
        // $comment.append('<div class=" spinner-border  text-info" style="width: 1.5rem;height: 1.5rem;margin-left: .7rem;"></div>');
        var deleteCommentPromise = new Promise(function (resolve, reject) {
            var url = window._config.api.deleteComment.replace(/{appId}/, appId).replace(/{id}/, recordId).replace(/{commentId}/, commentId);
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var response = this.response;
                    if (typeof response != 'object'){
                        response = JSON.parse(response);
                    }
                    if (response) {
                        if (response.code === 200) {
                            var result = response.result;
                            console.log('delete comment success');

                            resolve(result);
                        } else {
                            console.error('delete comment fail');
                            console.error(response.message);
                            window.storeErr(response.message,'detail record  page')
                            reject(response.message);
                        }
                    }
                    else {
                        reject('Server error!');
                    }
                }
                if (this.readyState === 4 && this.status !== 200) {
                    loader.style.display = 'none';
                    swal(
                        localeService.translate("common", "error-title"),
                        localeService.translate("error", "common-error-message"),
                        'warning');
                    console.error('Server error!');
                    window.storeErr(this.status,'server error');
                    
                }
            };
            xhr.open('POST', url);
            xhr.responseType = 'json';
            xhr.setRequestHeader('Authorization', idToken.jwtToken)
            xhr.send();
        });
        // deleteCommentPromise.then(function () {
        //     $comment.remove();
        // });
    }
});
addRecordBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = './add_record.html?appId=' + appId;
});
editRecordBtn.addEventListener('click', displayEditingInterface);


$(submitEditBtn).click(submitHandler);

cancelEditBtn.addEventListener('click', function () {
    loader.style.display = 'block';
    generateBreadcrumbs(localeService.translate("info", "record-detail"));
    setPageTitle("detail_record");

    if (actionApp) {
        $('#action-button').show();
        setMaxHeightIframe();
    } // re-display app menu


    appMenu.style.visibility = 'visible';
    editMenu.style.visibility = 'hidden';
    displayRecordData();
});
duplicateRecordBtn.addEventListener('click', handleClickDuplicateRecordBtn);
/*
|--------------------------------------------------------------------------------------------
|   Function
|--------------------------------------------------------------------------------------------
*/
window.submitHanlder = submitHandler;
function submitHandler(){
    console.log('starting submit data....');
    loader.style.display = 'block';
    const appSetting = JSON.parse(sessionStorage.getItem('appSetting'));
    if (appSetting.editor) {
        const editor = appSetting.editor;
        $('#iframe').contents().find('#'+editor).val(userInfo.loginName)
    }

    const iframeDocument = iframe.contentWindow.document;
    const alerts = iframeDocument.getElementsByClassName('alert alert-danger');
    while (alerts.length > 0) {
        alerts[0].parentNode.removeChild(alerts[0]);
    }

    const recordFields = Array.from(iframeDocument.getElementsByClassName('kintone-data'));
    let submitData = {};
    let fileContainer = [];
    let errorBag = [];
    let tableIds = new Map();
    const isValid = recordFields.map(function (fieldDom) {
        if (!fieldDom.hasAttribute('disabled') &&  !fieldDom.hasAttribute('custom-edit')) {
            if (!saveRecordUtility.validateField(fieldDom)) {
                const fieldCode = fieldDom.dataset.code;
                const thisFieldRight = recordRight.fields[fieldCode];
                if (thisFieldRight && thisFieldRight.function && !thisFieldRight.function.includes('edit')) {
                    const fieldLabel = fieldDom.dataset.label;
                    errorBag.push("Field \"".concat(fieldCode, "\" with label \"").concat(fieldLabel, "\" is required but does not have right to write. Please contact administrator"));
                }
                return false;
            }
            saveRecordUtility.storeFieldValue(fieldDom, submitData, fileContainer, fileSpace, tableIds);
        }
        return true;
    });

    if (!isValid.includes(false)) {
        if (fileContainer.length) {
            const uploadFileAPIUrl = "".concat(window._config.api.uploadFile);
            saveRecordUtility.uploadFileToKintone(fileContainer, uploadFileAPIUrl, idToken).then(function (uploadFileResponse) {
                uploadFileResponse.forEach(function (field) {
                    Object.assign(submitData, field);
                });
                submitEditRecord(submitData);
            }).catch(function (e) {
                console.log(e);
                swal(
                    localeService.translate("common", "error-title"),
                    localeService.translate("error", "common-error-message"),
                    'error');
                loader.style.display = 'none';
            });
        } else {
            submitEditRecord(submitData);
        }
    } else {
        errorBag.unshift(localeService.translate("common", "error-title"));
        swal(errorBag.join('\n'), '', 'error');
        loader.style.display = 'none';
    }

    if (actionApp) {
        $('#action-button').show();
        setMaxHeightIframe();
    }
}

function loadAppForm(appSetting) {
    return new Promise(function (resolve, reject) {
        iframe.setAttribute('src', appSetting.formUrl);
        iframe.src = appSetting.formUrl;
        iframe.addEventListener("load", loadRecordData);
        resolve();   
    });
}

function loadComment() {
    console.log('starting load comment...');
    //return new Promise(function (resolve, reject) {
        var url = window._config.api.getComment.replace(/{appId}/, appId).replace(/{id}/, recordId);
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let response = this.response;
                if (typeof response != 'object'){
                    response = JSON.parse(response);
                }

                if (response) {
                    if (response.code === 200) {
                        console.log('load comment success: ')
                        displayComment(response.data.comments);
                        //resolve();
                    } else {
                        console.error('load comment fail');
                        console.log(response);
                        window.storeErr(response,'detail record page');
                        swal(
                            localeService.translate("common", "error-title"),
                            localeService.translate("error", "unable-to-retrieve-comments"),
                            'error');
                        //reject(body.message);
                    }
                }
                else {
                    reject('Server error!');
                }
            }
            if (this.readyState === 4 && this.status !== 200) {
                swal(
                    localeService.translate("common", "error-title"),
                    localeService.translate("error", "common-error-message"),
                    'warning');
                console.error('Server error!');
                window.storeErr(this.status,'server error');
                
            }
        };

        xhr.open('GET', url);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Authorization', idToken.jwtToken)
        xhr.send();
    //});
}

function displayComment(comments) {
    var kintoneLoginName;

    if (userInfo) {
        kintoneLoginName = userInfo.kintoneLoginName;
    }

    comments.map(function (comment) {
        var id = comment.id;
        var name = comment.creator.name;
        var code = comment.creator.code;
        var date = new Date(comment.createdAt).toLocaleString();
        ;
        var content = comment.text;
        var contentShow = content.split('\n').join('<br>');
        var div = "<div class=\"media\" commentid=\"".concat(id, "\">\n                        <img alt=\"32x32\" class=\"mr-2 rounded\" src=\"./images/user.png\" ;=\"\" style=\"width: 32px; height: 32px; margin-top: 5px;\">\n                        <div class=\"media-body pb-3 mb-0  lh-125\">\n                            <p class=\"comment-content\">\n                                <strong class=\"d-block text-gray-dark\">").concat(id, ": ").concat(name, "</strong>\n                                ").concat(contentShow, "\n                            </p>\n                            <small class=\"text-muted\" style=\"padding-left: 10px; font-size: 11px;\">").concat(date, "</small>\n                        </div>\n                        <i class=\" btn fas fa-eraser delete-comment\"></i>\n                    </div>");

        if (code != kintoneLoginName) {
            div = "<div class=\"media\" commentid=\"".concat(id, "\">\n                        <img alt=\"32x32\" class=\"mr-2 rounded\" src=\"./images/user.png\" ;=\"\" style=\"width: 32px; height: 32px; margin-top: 5px;\">\n                        <div class=\"media-body pb-3 mb-0  lh-125\">\n                            <p class=\"comment-content\">\n                                 <strong class=\"d-block text-gray-dark\">").concat(id, ": ").concat(name, "</strong>\n                                ").concat(contentShow, "\n                            </p>\n                            <small class=\"text-muted\" style=\"padding-left: 10px; font-size: 11px;\">").concat(date, "</small>\n                        </div>\n                    </div>");
        }

        $(commentContanier).append(div);
    });
}

function showActionButton() {
    var action_old = JSON.parse(sessionStorage.getItem('appSetting')).action;
    var actions = JSON.parse(sessionStorage.getItem('appSetting')).actions;
    let apps = JSON.parse(sessionStorage.getItem('apps'));

    if(actions && actions.length){
        actions.forEach((action, act_i) => {
            if (action && apps.apps.map(x => x.appId).includes(action.actionApp)) {
                actionApp = action.actionApp;
                let btnelem = $(`<button class="btn shadow action-btn" id="act-${act_i}"></button>`)
                $(btnelem).html("<i class=\"fas fa-location-arrow\"></i> ".concat(action.actionName))
                $('#action-button').append($(btnelem));
                $('#action-button').show();
                setMaxHeightIframe();
                //act_i = 0~9
                $("#act-" + act_i).click(function () {
                    const conf_index = $(this).attr("id").slice(-1)
                    actions[conf_index].copyFields.forEach(function (x) {
                        x.copyFromValue =  record[x.copyFrom] ? record[x.copyFrom].value : undefined;
                    });
                    sessionStorage.setItem('actionInfo', JSON.stringify(action.copyFields));
                    window.location.href = "./add_record.html?appId=".concat(actions[conf_index].actionApp, "&type=action");
                });
            }
        })
    } else if (action_old){
        if (apps.apps.map(x => x.appId).includes(action_old.actionApp)) {
          actionApp = action_old.actionApp;
          let btnelem = $(`<button class="btn shadow action-btn" id="act"></button>`)
          $(btnelem).html("<i class=\"fas fa-location-arrow\"></i> ".concat(action_old.actionName))
          $('#action-button').append($(btnelem));
          $('#action-button').show();
          setMaxHeightIframe();
          $('#act').click(function () {
            action_old.copyFields.forEach(function (x) {
                  x.copyFromValue =  record[x.copyFrom] ? record[x.copyFrom].value : undefined;
              });
              sessionStorage.setItem('actionInfo', JSON.stringify(action_old.copyFields));
              window.location.href = "./add_record.html?appId=".concat(actionApp, "&type=action");
          });
        }
      }
}

function loadRecordData() {
    console.log('starting load record data...')
    window.countRequest(domain, appId, loginName); // count request

    const url = window._config.api.getRecord.replace(/{appId}/, appId).replace(/{id}/, recordId);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let response = this.response;
            if (typeof response != 'object'){
                response = JSON.parse(response);
            }

            if (response.code === 200) {
                record = response.record;
                console.log('get record data success');
                recordRight = response.recordRight;
                displayRecordData();
            } else {
                console.error(response.message || 'Get record failed');
                swal(
                    localeService.translate("common", "error-title"),
                    response.message || localeService.translate("error", "unable-retrieve-record"),
                    'error');
                loader.style.display = 'none';
            }
        }
        if (this.readyState === 4 && this.status !== 200) {
            loader.style.display = 'none';
            swal(
                localeService.translate("common", "error-title"),
                localeService.translate("error", "common-error-message"),
                'warning');
            console.error('Server error!');
            window.storeErr(this.status,'server error');
            
        }
    };

    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Authorization', idToken.jwtToken)
    xhr.send(); 
}

/**
 * 画面描画時に呼び出される
 */
function displayRecordData() {


    var iframeDocument = iframe.contentWindow.document;
    var appRights = JSON.parse(sessionStorage.getItem('appRights'));
    var addRowTableBtns = Array.from(iframeDocument.querySelectorAll('.table-add-row')); //insert row to table

    //hide input file button
    $('#iframe').contents().find('.file-upload-button').hide();

     //lookup handle
     $("iframe").contents().find('.lookup-group').each(function () {
        $(this).siblings().removeClass('col-md-6 col-6')
        $(this).parent().removeClass('row');
        $(this).hide()  
    });
    $("iframe").contents().find('.alert').each(function () {
        $(this).remove(); 
    });

    //set group right
    setGroupRight();

    addRowTableBtns.forEach(function (btn) {
        var addBtn = $(btn).children().first();
        var rmBtn = $(btn).children().eq(1);
        var className = addBtn.attr('class').split(" ");
        var fieldCode = className[2].substring(8, className[2].length);

        var rowNumber = record[fieldCode].value.length;

        for (var i = 0; i < rowNumber - 1; i++) {
            rmBtn.trigger('click');
        }

        for (var _i = 0; _i < rowNumber - 1; _i++) {
            addBtn.trigger('click');
        }
    }); 
    // hide button add row in table

    addRowTableBtns = Array.from(iframeDocument.querySelectorAll('.table-add-row'));
    addRowTableBtns.forEach(function (btn) {
        btn.style.display = 'none';
    });
    
    // check rights
    if (recordRight) {
        // hide fields which user have not right to view
        var fieldRight = recordRight.fields;

        for (var key in fieldRight) {
            if (fieldRight[key] && fieldRight[key].viewable == false) {
                if ( iframeDocument.querySelector('.field-' + key)){
                iframeDocument.querySelector('.field-' + key).parentElement.style.display = 'none';
                }
            }
        }
        //hide group if not have view right
        // $(iframeDocument).find('.kintone-group').each(function(){
        //     let flag = true;
        //     let $kintoneGroup = $(this);
        //     $kintoneGroup.find('.kintone-field-style').each(function(){
        //         if (!$(this).is(":hidden")) flag = false;
        //     });
        //     if (flag) $kintoneGroup.parent().hide();
        // })
        
        // hide edit button if user dose have not right to edit
        var thisRecordRight = recordRight.record;
        if (thisRecordRight.editable === false) {
            editRecordBtn.style.display = 'none';
            editRecordBtn.removeEventListener('click', displayEditingInterface);
        }
    }
    if (appRights) {
        var thisAppRight = appRights.find(function (right) {
            return right.appId == appId;
        });
        if (thisAppRight && thisAppRight.appRight.recordAddable == false) {
            addRecordBtn.style.display = 'none';
            duplicateRecordBtn.style.display = 'none';
            duplicateRecordBtn.removeEventListener('click', handleClickDuplicateRecordBtn);
        } 

    } // get all input fields match with kintone fields

    var iframeInputs = Array.from(iframeDocument.getElementsByClassName('kintone-data'));
    iframeInputs = iframeInputs.map(function (input) {
        input.setAttribute('disabled', true);
        return {
            domElem: input,
            code: input.dataset.code
        };
    }); // set value for inputs have class `kintone-data`

    let setValuePromises = [];
    var apiUrl = window._config.api.downloadFile;
    Object.keys(record).forEach(function (fieldCode) {
        var field = record[fieldCode];

        if (field.type === 'SUBTABLE') {
            var subTableBody = iframeDocument.getElementById(fieldCode + '-body');
            if (!subTableBody) return;
            var sampleRow = subTableBody.querySelector('tr');
            field.value.map(function (row, index) {
                const rowValue = row.value;
                const rowField = subTableBody.children[index];
                const columns = Array.from(rowField.getElementsByClassName('kintone-data'));
                columns.forEach(function (column) {
                    column.setAttribute('kintone-subtable-row-id', row.id);
                    var columnCode = column.getAttribute('data-code');
                    setValuePromises.push(saveRecordUtility.setValueForField(rowValue[columnCode], column, apiUrl, idToken))
                });
            });
        } else {
            var domMatches = iframeInputs.filter(function (input) {
                return input.code === fieldCode;
            }).map(function (input) {
                return input.domElem;
            });
            domMatches.forEach(function (dom) {
                setValuePromises.push(saveRecordUtility.setValueForField(field, dom, apiUrl, idToken))
            });
        }
    }); 

    $('#editRecordBtn').hide(); //display file
    Promise.all(setValuePromises)
    .then(() => {
        $('#editRecordBtn').show();
    })
    .catch(err => {
        $('#editRecordBtn').show(); //display file
    })
   
    
    let appSetting = JSON.parse(sessionStorage.getItem('appSetting'));

    if (appSetting.time) {
        const createTime = appSetting.time.createTime;
        const editTime = appSetting.time.editTime;
        $("iframe").contents().find('.field-' + createTime).parent().hide();
        $("iframe").contents().find('.field-' + editTime).parent().hide();
    }

    if (appSetting.creator) {
        var creator = appSetting.creator;
        $("iframe").contents().find('.field-' + creator).parent().hide();
    }

    if (appSetting.editor) {
        var editor = appSetting.editor;
        $("iframe").contents().find('.field-' + editor).parent().hide();
    }

    if (appSetting.groupView){
        $("iframe").contents().find('.field-'+appSetting.groupView).parent().remove();
    }
    
    let relateFields = Object.values(appSetting.fields).filter(x => x.type == 'REFERENCE_TABLE');
    
    let fRights = appSetting.fieldRights;
    if(fRights){
        fRights.forEach(fRight => {
            if (relateFields.map(x => x.code).includes(fRight.code)){
                let entities = fRight.entities;
                let ac;
                for (let j = 0; j < entities.length; j++) {
                    let item = entities[j];
                    if (item.entity.type == 'USER' && userInfo.kintoneLoginName == item.entity.code) {
                        ac = item.accessibility;
                        break;
                    } else if (item.entity.type == 'GROUP' && userInfo.kintoneGroups.includes(item.entity.code)) {
                        ac = item.accessibility;
                        break;
                    } else if (item.entity.type == 'ORGANIZATION' && userInfo.kintoneOrganizations.includes(item.entity.code)) {
                        ac = item.accessibility;
                        break;
                    }
                }
                if (ac == 'NONE'){
                    //2022 /01/ 12 fixed
                    relateFields = relateFields.filter(field => field.code != fRight.code)
                    $('#iframe').contents().find('.field-' + fRight.code).parent().remove();
                }
            }
        })
    }

    relateFields = relateFields.filter(x => record[x.referenceTable.condition.field] && record[x.referenceTable.condition.field].value);
    
    if(relateFields.length){
        let relateDataPomise = relateFields.map(async rl => {
            let fieldValue = record[rl.referenceTable.condition.field].value;
             if(record[rl.referenceTable.condition.field].type=='RECORD_NUMBER' && typeof fieldValue === 'string'){
                fieldValue = fieldValue.replace(/\D/g,'');
            }
            let referenceInfo = rl.referenceTable;
            let relateRecords =  await getRelateRecords(rl.code, fieldValue, referenceInfo);
            return {
                field : rl.code,
                displayFields : referenceInfo.displayFields,
                relateRecords : relateRecords,
                relateAppId : referenceInfo.relatedApp.app,
                size : referenceInfo.size
            }
        });
        Promise.all(relateDataPomise)
        .then(datas => {
            console.log('Relate records:...');

            datas.forEach(async data => {
                let $relateTable =  $('iframe').contents().find('#'+data.field);
                let titles = [];
                $relateTable.find('th').each(function(){
                    let text = $(this).text();
                    if (text) {
                        titles.push({title: text})
                    }
                })
                if ($.fn.DataTable.isDataTable($relateTable) ) {
                    $relateTable.DataTable().clear().destroy();
                }
                $relateTable.empty();
                if( data.relateRecords  && data.relateRecords.length){
                    titles.unshift({title:''})
                    let dataSet = await Promise.all(data.relateRecords.map(async record => {
                        let row = [];
                        let detail = '';
                        let apps = sessionStorage.getItem('apps');
                        if (apps && JSON.parse(apps).apps.find(x => x.appId == data.relateAppId)){
                            detail = `<a target="_blank" href="${window.location.origin}/detail_record.html?appId=${data.relateAppId}&amp;id=${record.$id.value}"  title="${localeService.translate("info", "view-record-detail")}" class="detail-link"><span style="display: inline-block;margin-top: 7px;color: #009688db;font-size: 1.3rem;"class="btn far fa-file-alt"></span></a>`;
                        }
                        row.push(detail);
                        let fields = data.displayFields
                        for (let i = 0; i < fields.length; i++) {
                            let promise = new Promise(async function (resolve, reject) {
                                let fileType = record[fields[i]].type
                                if (fileType == "FILE") {
                                    let file = record[fields[i]].value
                                    let files = ""
                                    for (let j = 0; j < file.length; j++) {
                                        let fileType = file[j].contentType.split('/')[0];
                                        if (fileType == 'image') {
                                            let fileUrl = await saveRecordUtility.downloadFile(file[j], window._config.api.downloadFile, idToken)
                                            files += `<img src="${fileUrl}" alt="${file[j].name}" class="image-frame" id="image-${fields[i]}" size="${file[j].size}">`;
                                        } else {
                                            files += `<a href="#" key="${file[j].fileKey}" name="${file[j].name}" size="${file[j].size}" type="${file[j].contentType}" class="file-download" display="block">${file[j].name}</a> <br>`
                                        }
                                    }
                                    row.push(files)
                                } else {
                                    let value = `${record[fields[i]] && record[fields[i]].value ? window.formatStr(record[fields[i]].value) : ''}`;
                                    row.push(value);
                                }
                                resolve()
                            })
                            await promise.then(() => { })
                        }
                        return row;
                    }))
                    $relateTable.DataTable( {
                        autoWidth: false,
                        language: {
                            "lengthMenu": "表示する件数 _MENU_ ",
                            "zeroRecords": "該当するレコードがありません。",
                            "info": " _START_ - _END_ 件表示  (_TOTAL_件中)",
                            "infoEmpty": "0 - 0 件表示　(_TOTAL_件中)",
                            "infoFiltered": "",
                            "paginate": {
                                "previous": "<",
                                "next": ">"
                            },
                            "search": localeService.translate("common", "search")
                        },
                        data: dataSet,
                        columns: titles,
                        pageLength : +data.size,
                        pagingType: "simple",
                        lengthChange: false,
                        bFilter: false,
                        ordering: false,
                        bInfo: false , 
                    });
                }else{
                    let tableHtml='<thead><tr>';
                    titles.forEach(item => {
                        if(item.title){
                            tableHtml = tableHtml + `<th>${item.title}</th>`;
                        }
                    })
                    tableHtml = tableHtml + `</tr></thead><tbody><tr><td colspan="${data.displayFields.length}">${localeService.translate("info", "data-not-exist")}</td></tr> </tbody>`
                    $relateTable.append(tableHtml);
                }
            });
            loader.style.display = 'none';
        })
        .catch(err => {
            loader.style.display = 'none';
            swal(
                localeService.translate("common", "error-title"),
                localeService.translate("error", "unable-to-retrieve-related-records"),
                'error');
            console.error('Get relate record fail');
            console.error(err);
            window.storeErr(err, 'detail record page');
        })
    }else {
        loader.style.display = 'none';
    }
    

    //jsCustom
    if (appSetting.jsCustom && appSetting.jsCustom.length){
        window.addCustomFile(appSetting.jsCustom, 'js');
    }

    //change height iframe
    // var containerHeight = $(iframeDocument).find(".container-fluid").height();
    // var lastHeight = parseInt(containerHeight) +20;
    // $('#iframe').css('height', lastHeight + 'px')

    //hide loader
    $('.se-pre-con').css('background','rgba(255, 255, 255, 0.4)')
    loader.style.display = 'none';

}
function getRelateRecords(fieldCode, fieldValue, referenceInfo){
    let data = {
        fieldCode : fieldCode,
        fieldValue : fieldValue,
        referenceInfo : referenceInfo
    }
    return new Promise((resolve, reject) => {
        var url = window._config.api.getRelateRecords.replace(/{appId}/, appId).replace(/{id}/, recordId);
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log('this', this);
                var response = this.response;
                if (typeof response != 'object'){
                    response = JSON.parse(response);
                }

                if (response){
                    if (response.code === 200) {
                        resolve(response.records);
                    }else {
                        reject(response.message);
                    }
                }else{
                    reject('Server Error!');
                }
            }
            if (this.readyState === 4 && this.status !== 200) {
               
                reject(new Error(localeService.translate("error", "common-error-message")))
                console.error('Server error!');
                window.storeErr(this.status,'server error');
                
            }
        };
        xhr.open('POST', url, true);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Authorization', idToken.jwtToken)
        xhr.send(JSON.stringify(data));
    })
}
function handleClickDuplicateRecordBtn() {
    //loader.style.display = 'block';
    sessionStorage.setItem('duplicateRecord', JSON.stringify(record));
    window.location.href = ['./add_record.html?appId=', appId, '&duplicateId=', recordId, '&type=duplicate'].join('');
}


/*--------------------------------------
 * script for edit
 *--------------------------------------*/
function displayEditingInterface() {
    loader.style.display = 'block';
    generateBreadcrumbs(localeService.translate("info", "record-edit"));
    setPageTitle("edit_record");

    $('#action-button').hide();
    setMaxHeightIframe();
    var iframeDocument = iframe.contentWindow.document; // show button add row in table


    var addRowTableBtns = Array.from(iframeDocument.querySelectorAll('.table-add-row'));
    addRowTableBtns.forEach(function (btn) {
        btn.style.display = 'block';
    }); 
    //show file upload button
    $('#iframe').contents().find('.file-upload-button').show();

    //restore lookup
    $("#iframe").contents().find('.lookup-group').each(function () {
        $(this).siblings().addClass('col-md-6 col-6')
        $(this).parent().addClass('row');
        $(this).show() ; 
    });

    // make input fields editable
    var iframeInputs = Array.from(iframeDocument.getElementsByClassName('kintone-data'));
    iframeInputs.map(function (input) {

        let fieldType = input.dataset.type;
        if (fieldType != 'CALC'){
            input.removeAttribute('disabled');
        }

        if (fieldType == 'LINK'){
            input.style.display = 'block';
            $(input).next().remove();
        }
    }); // disable fields which user have not right to edit

    if (recordRight) {
        var fieldRight = recordRight.fields;

        for (var key in fieldRight) {
            if (fieldRight[key] && fieldRight[key].editable == false) {
                var elems = Array.from(iframeDocument.querySelectorAll("[data-code=\"".concat(key, "\"")));
                elems.forEach(function (elem) {
                    elem.setAttribute('disabled', true);
                });
                if ($('#iframe').contents().find(`[data-code='${key}']`).parent().next().hasClass('lookup-group')){
                    $('#iframe').contents().find(`[data-code='${key}']`).parent().next().hide();
                }

                if ($('#iframe').contents().find(`[data-code='${key}']`).parent().hasClass('file-upload-button')){
                    $('#iframe').contents().find(`[data-code='${key}']`).parent().hide();
                }
            }
        }

    } 

    // display edit menu
    appMenu.style.visibility = 'hidden';
    editMenu.style.visibility = 'visible'; 

    //display file field
    $(iframeDocument).find('.file-space-chobitone').find('a').removeAttr('href');
    $(iframeDocument).find('.file-space-chobitone').find('a').prepend(`<i class="delete-file fas fa-times"></i> `);
    var $imageFrame = $(iframeDocument).find('.img-frame');
    $imageFrame.each(function () {
        // var fieldCode = $(this).parent().attr('class').split(' ')[0].substr(6);
        var name = $(this).attr('alt');
        var key = $(this).attr('key');
        $(this).replaceWith(`<div class="img-frame" key="${key}" name="${name}"><i class="delete-file fas fa-times"></i> ${name}</div>`);
        //$(this).replaceWith("<div class=\"img-frame\"> ".concat(name, "</div>"));
    });

    //get location
    var appSetting = JSON.parse(sessionStorage.getItem('appSetting'));

    if (appSetting.location) {
        var location = appSetting.location;
        var latitude = location.latitude;
        var longitude = location.longitude;
        $("iframe").contents().find('#' + latitude).prop('disabled', true);
        $("iframe").contents().find('#' + longitude).prop('disabled', true);
    }

    handleLookup(appSetting);

    loader.style.display = 'none';
}

function submitEditRecord(allSubmitData) {
    console.log('submit data: ');

    // allSubmitData = iterate(allSubmitData);
    
    //set value for editor , edit itme
    var appSetting = JSON.parse(sessionStorage.getItem('appSetting'));

    // if (appSetting.editor) {
    //     var editor = appSetting.editor;
    //     allSubmitData[editor] = {value:""}
    //     allSubmitData[editor].value = userInfo.loginName;
    // }

   
    var url = window._config.api.editRecord.replace(/{appId}/, appId).replace(/{id}/, recordId);
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var response = this.response;
            if (typeof response != 'object'){
                response = JSON.parse(response);
            }

            if (response.code === 200) {
                var result = response.result; // remove old data from storage then load new data

                // re-display view with new data
                appMenu.style.visibility = 'visible';
                editMenu.style.visibility = 'hidden';
                console.log('edit record suscces');

                window.countRequest(domain, appId, loginName) // count request
                .then(() => {
                    if (appSetting.thanksPage) {
                        window.location.href = "./thanks.html?appId=".concat(appId, "&id=").concat(recordId);
                    } else {
                        /**
                         * 添付ファイルのimageが重複するバグをリロードで回避する暫定対処を行っている
                         * おそらく`loadRecordData`関数に根本的な問題があり、いずれ本格対処が必要
                         * backlog: https://noveldev.backlog.com/view/CHOBIIT-185
                         */
                        window.location.reload();
                    }
                }).catch(err =>{
                    console.log(err);
                })
                
            } else {
                swal(localeService.translate("common", "error-title"), window.showError(response), 'error');
                console.error('edit record fail: ' + JSON.stringify(response));
                window.storeErr(response,'detail record page');
                var data = {
                    domain: domain,
                    subject: localeService.translate("error", "rest-api-error"),
                    content: "Domain: ".concat(domain.substr(0, domain.indexOf('.')) + '.chobiit.me', " \nAppId: ").concat(appId, " \nError: ").concat(window.showError(response))
                };
                window.sendMailAlert(data);
                
            }
            loader.style.display = 'none';
        }
        if (this.readyState === 4 && this.status !== 200) {
            loader.style.display = 'none';
            swal(
                localeService.translate("common", "error-title"),
                localeService.translate("error", "common-error-message"),
                'warning');
            console.error('Server error!');
            window.storeErr(this.status,'server error');
            
        }
    };
    xhr.open('POST', url, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Authorization', idToken.jwtToken)
    xhr.send(JSON.stringify(allSubmitData));
}
function handleLookup(appSetting){
    if (appSetting.lookupRelateInfo){
        //disable copy field
        appSetting.lookupRelateInfo.forEach(info =>{
            if (Array.isArray(info.fieldMappings)){
                info.fieldMappings.forEach(item => {
                    const lookupFieldElements = [
                        "input",
                        "textarea",
                        "select",
                        "div",
                        "table",
                        "a"
                    ]
                    const selector = lookupFieldElements.map(element => `${element}[data-code='${item.field}']`).join(', ');
                    $("#iframe").contents().find(selector).each(function() {
                        $(this).prop('disabled', true);
                    });
                }) 
            }
        })

        //lookup field handle
        $("iframe").contents().off('click','.lk-lookup')  
        $("iframe").contents().on('click','.lk-lookup',async function (e) {
            e.preventDefault();
            let $lk = $(this);
            $lk.html(`<i class="fas fa-spinner fa-spin"></i>`);
            let $input =  $(this).parent().parent().find('input');
            let fieldCode = $input.attr('data-code');
            let fieldLabel = $input.attr('data-label');
            let fieldValue = $input.val();
            let fieldType = $input.attr('data-type');
            let lookup;
            let lkRelate = appSetting.lookupRelateInfo.find(x => x.fieldCode == fieldCode);
            if(appSetting.fields.hasOwnProperty(fieldCode)){
                lookup = appSetting.fields[fieldCode].lookup
            }else{
                let tableCode = $input.attr('data-reference');
                lookup = appSetting.fields[tableCode].fields[fieldCode].lookup
            }
            
            //get lookup record
            let lookupInfo = {
                fieldCode : fieldCode,
                fieldValue : fieldValue,
                fieldType : fieldType,
                lookup : lookup
            }
            try{
                let lookupRecords = await getLookupRecords(lookupInfo);
                $lk.html(localeService.translate("common", "get-lookup-field"));

                if(lookupRecords.length >1 || (!fieldValue && lookupRecords.length == 1)){
                    const recordCount = lookupRecords.length
                    let info = `<div class="float-right">${localeService.translate("common", "record-count",{recordCount})}</div>`
                    let table = `<table class="table table-striped table-bordered"><thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col">${lkRelate.rlFieldInfo[lookup.relatedKeyField]}</th>`
                                    lookup.lookupPickerFields  = lookup.lookupPickerFields.filter(x => x != lookup.relatedKeyField && lookupRecords[0].hasOwnProperty(x));
                    lookup.lookupPickerFields.forEach(field => {
                        table += `<th scope="col">${lkRelate.rlFieldInfo[field]}</th>`
                    })
                    table += `</tr></thead><tbody>`;
                    lookupRecords.forEach(record => {
                        let tr = `<tr>
                                        <td><button type="button" class="btn btn-outline-info" record-id ="${record.$id.value}">${localeService.translate("common", "set")}</button></td>
                                        <td>${window.formatStr(record[lookup.relatedKeyField].value)}</td>`;
                        lookup.lookupPickerFields.forEach(field => {
                            tr += `<td>${window.formatStr(record[field].value)}</td>`
                        })
                        tr += '</tr>';
                        table += tr;
                    })
                    table += `</tbody></table>`
                    $.alert({
                        columnClass: 'col-md-10',
                        title: lkRelate.relateAppName,
                        content: info+table,
                        animateFromElement: false,
                        buttons: {
                            cancel: {
                                text: localeService.translate("common", "cancel-title"),
                                action: function () {
                                }
                            },
                        },
                        onContentReady: function (){
                            let jc = this;
                            this.$content.find('button').click(function(){
                                let recordId = $(this).attr('record-id');
                                let setRecord = lookupRecords.find(x => x.$id.value == recordId);
                                setLookupMapingField($input, setRecord, appSetting, lookup);
                                
                                $input.parent().parent().parent().find('.alert').remove();
                                $input.parent().parent().after(`<div class="alert alert-success" style="padding: .25rem .5rem; margin-top: .5rem; ">${localeService.translate("info", "get-referenced-data")}</div>`)
                                jc.close();
                            })
                        }
                    });
                }else if (fieldValue && lookupRecords.length == 1){
                    let setRecord = lookupRecords[0];
                    setLookupMapingField($input, setRecord, appSetting, lookup);
                    
                    $input.parent().parent().parent().find('.alert').remove();
                    $input.parent().parent().after(`<div class="alert alert-success" style="padding: .25rem .5rem; margin-top: .5rem; ">${localeService.translate("info", "get-referenced-data")}</div>`)
                }else{
                    $input.parent().parent().parent().find('.alert').remove();
                    $input.parent().parent().after(`<div class="alert alert-danger" style="padding: .25rem .5rem; margin-top: .5rem; ">${localeService.translate("info", "no-data")}</div>`)
                }
                
            }catch(err){
                $lk.html(localeService.translate("common", "lookup-acquisition-button"));
                // swal('エラー','関連付けるアプリの権限がありません。','error');
                swal(localeService.translate("common", "error-title"),err.message || JSON.stringify(err),'error');
                console.error(err);
                window.storeErr(err, 'get lookup record')
            }
        })

        //clear handle
        $("iframe").contents().on('click','.lk-clear',async function () {
            let $input =  $(this).parent().parent().find('input');
            let fieldCode = $input.attr('data-code');
            let lookup;
            if(appSetting.fields.hasOwnProperty(fieldCode)){
                lookup = appSetting.fields[fieldCode].lookup
            }else{
                let tableCode = $input.attr('data-reference');
                lookup = appSetting.fields[tableCode].fields[fieldCode].lookup
            }

            clearLookupField($input, appSetting, lookup);
        })
    }
}
    

function setLookupMapingField($input, setRecord, appSetting, lookup){
    let keyValue = setRecord[lookup.relatedKeyField].value;
    if (setRecord[lookup.relatedKeyField].type == "RECORD_NUMBER" && isNaN(keyValue)){
        keyValue = keyValue.split('-')[1];
    } 

    $input.val(keyValue);
    lookup.fieldMappings.forEach(item => {
        if (!setRecord.hasOwnProperty(item.relatedField)) return;
        if (recordRight.fields[item.field].editable == false) return;

        if (appSetting.fields.hasOwnProperty(item.field)){
			/**
			 * ここはKintoneのルックアップのフィールドに対する処理です。
			 */
            switch (appSetting.fields[item.field].type){
                case 'DROP_DOWN':
                    let $dropdown_options = $('#iframe').contents().find(`#${item.field} option`);
                    $dropdown_options.each(function(){
                        if ($(this).val() == setRecord[item.relatedField].value){
                            $(this).prop('selected', true)
                        }
                    })
                    break;
                case 'MULTI_SELECT':
                    let $mtil_options = $('#iframe').contents().find(`#${item.field} option`);
                    $mtil_options.each(function(){
                        if (setRecord[item.relatedField].value.includes($(this).val())){
                            $(this).prop('selected', true)
                        }
                    })
                    break;
                case 'RADIO_BUTTON':
                case 'CHECK_BOX':
                    $("#iframe").contents().find(`input[name='${item.field}']`).each(function() {
                        if (setRecord[item.relatedField].value.includes(this.value)){
                            this.checked = true;
                        }
                    });
                    break;
                case 'DATETIME':
                    if(setRecord[item.relatedField].value){
                        $("#iframe").contents().find('#'+item.field).val(moment(setRecord[item.relatedField].value).format(`YYYY-MM-DD ${LocaleService.getTimeFormat()}`));
                    }else{
                        $("#iframe").contents().find('#'+item.field).val(setRecord[item.relatedField].value);
                    }
                    break;
                case 'DATE':
                        if(setRecord[item.relatedField].value){
                            $("#iframe").contents().find('#'+item.field).val(moment(setRecord[item.relatedField].value).format('YYYY-MM-DD'));
                        }else{
                            $("#iframe").contents().find('#'+item.field).val(setRecord[item.relatedField].value);
                        }
                    break;
                case 'TIME':
				/**
				 * `TIME`はUS版のみ実行されるため、条件分岐で各処理を記載しています。
				 * 今後、明快な実装（改修）を行います。
				 */
                    if (process.env.CHOBIIT_LANG === "en") {
                        if(setRecord[item.relatedField].value){
                            $("#iframe").contents().find('#'+item.field).val(moment(setRecord[item.relatedField].value, 'HH:mm').format(LocaleService.getTimeFormat()));
                        }else{
                            $("#iframe").contents().find('#'+item.field).val(setRecord[item.relatedField].value);
                        }
                        break;
                    } else {
                        $("#iframe").contents().find('#'+item.field).val(setRecord[item.relatedField].value);
                        break;
                    }
                default:
                    $("#iframe").contents().find('#'+item.field).val(setRecord[item.relatedField].value);
                    break;
            }

        }else{
			/**
			 * ここはKintoneのルックアップ機能をテーブル内で使用するフィールドに対する処理です。
			 */
            let tableCode = $input.attr('data-reference');
            switch (appSetting.fields[tableCode].fields[item.field].type) {
                case "MULTI_LINE_TEXT":
					$input
						.parents("tr")
						.find(`textarea[data-code='${item.field}']`)
						.val(setRecord[item.relatedField].value);
					break;
                case 'DROP_DOWN':
                    let $dropdown_options = $input.parents('tr').find(`select[data-code='${item.field}'] option`);
                    $dropdown_options.each(function(){
                        if ($(this).val() == setRecord[item.relatedField].value){
                            $(this).prop('selected', true)
                        }
                    })
                    break;
                case 'MULTI_SELECT':
                    let $mtil_options = $input.parents('tr').find(`select[data-code='${item.field}'] option`);
                    $mtil_options.each(function(){
                        if (setRecord[item.relatedField].value.includes($(this).val())){
                            $(this).prop('selected', true)
                        }
                    })
                    break;
                case 'RADIO_BUTTON':
                case 'CHECK_BOX':
                    $input.parents('tr').find(`input[data-code='${item.field}']`).each(function() {
                        if (setRecord[item.relatedField].value.includes(this.value)){
                            this.checked = true;
                        }
                    });
                    break;
                case 'DATETIME':
                    if(setRecord[item.relatedField].value){
                        $input.parents('tr').find(`input[data-code='${item.field}']`).val(moment(setRecord[item.relatedField].value).format(`YYYY-MM-DD ${LocaleService.getTimeFormat()}`));
                    }else{
                        $input.parents('tr').find(`input[data-code='${item.field}']`).val(setRecord[item.relatedField].value);
                    }
                    break;
                case 'DATE':
                        if(setRecord[item.relatedField].value){
                            $input.parents('tr').find(`input[data-code='${item.field}']`).val(moment(setRecord[item.relatedField].value).format('YYYY-MM-DD'));
                        }else{
                            $input.parents('tr').find(`input[data-code='${item.field}']`).val(setRecord[item.relatedField].value);
                        }
                    break;
                case 'TIME':
				/**
				 * `TIME`はUS版のみ実行されるため、条件分岐で各処理を記載しています。
				 * 今後、明快な実装（改修）を行います。
				 */
                    
                    if (process.env.CHOBIIT_LANG === "en") {
                        if(setRecord[item.relatedField].value){
                            $input.parents('tr').find(`input[data-code='${item.field}']`).val(moment(setRecord[item.relatedField].value, 'HH:mm').format(LocaleService.getTimeFormat()));
                        }else{
                            $input.parents('tr').find(`input[data-code='${item.field}']`).val(setRecord[item.relatedField].value);
                        }
                        break;
                    } else {
                        $input.parents('tr').find(`input[data-code='${item.field}']`).val(setRecord[item.relatedField].value);
                        break;
                    }
                default:
                    $input.parents('tr').find(`input[data-code='${item.field}']`).val(setRecord[item.relatedField].value);
                    break;
            }
        }
    })  
}

function clearLookupField($input, appSetting, lookup){
    $input.parent().parent().parent().find('.alert').remove();
    $input.val("");
    lookup.fieldMappings.forEach(item => {
        if (appSetting.fields.hasOwnProperty(item.field)){
            switch (appSetting.fields[item.field].type){
                case 'DROP_DOWN':
                    let $dropdown_options = $('#iframe').contents().find(`#${item.field} option`);
                    $dropdown_options.each(function(index){
                        if (index > 0){
                            $(this).prop('selected', false)
                        }
                    })
                    break;
                case 'MULTI_SELECT':
                    let $mtil_options = $('#iframe').contents().find(`#${item.field} option`);
                    $mtil_options.each(function(){
                        $(this).prop('selected', false)
                    })
                    break;
                case 'RADIO_BUTTON':
                    $("#iframe").contents().find(`input[name='${item.field}']`).each(function(index) {
                        if (index > 0){
                            this.checked = false;
                        }
                    });
                    break
                case 'CHECK_BOX':
                    $("#iframe").contents().find(`input[name='${item.field}']`).each(function() {
                        this.checked = false;
                    });
                    break;
                default:
                    $("#iframe").contents().find('#'+item.field).val("");
                    break;
            }

        }else{ //field in table handle
            let tableCode = $input.attr('data-reference');
            switch (appSetting.fields[tableCode].fields[item.field].type) {
                case "MULTI_LINE_TEXT":
					$input.parents("tr").find(`textarea[data-code='${item.field}']`).val("");
					break;
                case 'DROP_DOWN':
                    let $dropdown_options = $input.parents('tr').find(`select[data-code='${item.field}'] option`);
                    $dropdown_options.each(function(index){
                        if (index > 0){
                            $(this).prop('selected', false)
                        }
                    })
                    break;
                case 'MULTI_SELECT':
                    let $mtil_options = $input.parents('tr').find(`select[data-code='${item.field}'] option`);
                    $mtil_options.each(function(){
                        $(this).prop('selected', false)
                    })
                    break;
                case 'RADIO_BUTTON':
                    $input.parents('tr').find(`input[data-code='${item.field}']`).each(function(index) {
                        if (index > 0){
                            this.checked = false;
                        }
                    });
                    break;
                case 'CHECK_BOX':
                    $input.parents('tr').find(`input[data-code='${item.field}']`).each(function() {
                        this.checked = false;
                        
                    });
                    break;
                default:
                    $input.parents('tr').find(`input[data-code='${item.field}']`).val("");
                    break;
            }
        }
    }) 
}

function getLookupRecords(lookupInfo){
    return new Promise((resolve, reject) => {
        var url = window._config.api.getLookupRecords.replace(/{appId}/, appId);
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var response = this.response;
                if (typeof response != 'object'){
                    response = JSON.parse(response);
                }

                if (response) {
                    if (response.code === 200) {
                        resolve(response.records);
                    }else {
                        reject(response);
                    }
                }
                else {
                    reject('Server error!');
                }
            }
            if (this.readyState === 4 && this.status !== 200) {
               
                if (this.status == 504){
                    let errMsg = localeService.translate("error", "exceed-search-result-limit")
                    reject(new Error(errMsg))
                }else{
                    reject(new Error(localeService.translate("error", "common-error-message")))
                    console.error('Server error!');
                    window.storeErr(this.status,'server error');
                }
                
            }
        };
        xhr.open('POST', url, true);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Authorization', idToken.jwtToken)
        xhr.send(JSON.stringify(lookupInfo));
    })
}


async function loadAppListData(idToken) {
    var appsInStorage = JSON.parse(sessionStorage.getItem('apps'));
    if (!appsInStorage) {
        await loadAllApps(idToken);
    }
    window.insertAppName('need-app-name');

    updateAppsInSidebar(null, function () {
        document.getElementById('listRecordMenu' + appId).classList.add('sub-active');
    });

    return 1;
}

function setGroupRight(){
    let url = window._config.api.getAppRights.replace(/{appId}/, appId)  ;
    let xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let iframeDocument = iframe.contentWindow.document;
            var response = this.response;
            if (typeof response != 'object'){
                response = JSON.parse(response);
            }

            if (response.code === 200 && response.fieldRights) {
                let fieldRights = response.fieldRights;
                for (let i = 0; i < fieldRights.length; i++) {
                    let fRight = fieldRights[i];
                    let fCode = fRight.field;

                    if (fRight.ac == 'NONE' && iframeDocument.querySelector('.field-' + fCode)) {
                        $('#iframe').contents().find('.field-' + fCode).parent().remove();
                    }
                   
                }

            } else {
                response.message ? swal(localeService.translate("common", "error-title"),response.message,'error') : '';
            }
        }
        if (this.readyState === 4 && this.status !== 200) {
            console.error('Server error!');
            window.storeErr(this.status,'server error');
            
        }
    };
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Authorization', idToken.jwtToken)
    xhr.send();
}
