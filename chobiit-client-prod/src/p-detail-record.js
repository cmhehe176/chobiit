

const saveRecordUtility = require('./save-record-utility');
const templateColor = require('./change-color-utiliy.js');
const setMaxHeightIframe = require('./style-adjustments/customize-iframe.js');
const LocaleService = require('chobiit-common/src/application/locale-service').default;
const localeService = LocaleService.getInstance("client");
require('cross-fetch/polyfill');

var loader = document.getElementById('loader');
var iframe = document.getElementById('iframe');
var addRecordBtn = document.getElementById('addRecordBtn');
var duplicateRecordBtn = document.getElementById('duplicateRecordBtn');


var appId = window.getQueryStringByName('appId');
var recordId = window.getQueryStringByName('id');
var domain = window.getKintoneDomain();
var record;
var appInfo; // Get the image and insert it inside the modal - use its "alt" text as a caption

var img = document.getElementById('myImg');
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
var imgClose = document.getElementsByClassName("img-close")[0];
var imgDown = document.getElementsByClassName("img-down")[0];
var modal = document.getElementById('myModal');

loader.style.display = 'block';
$('.se-pre-con').css('background','white')

window.onload = function () {
  //loader.style.display = 'block';

  if (appId && recordId) {
    window.getAppSetting(appId)
      .then(appSetting => {
        window.changeColor(appSetting.templateColor)
        loadAppForm(appSetting, appId)
          .then(showActionButton)

        //保存ボタンの名称
        if (appSetting.saveButtonName){
          $('#submitEditBtn').text(appSetting.saveButtonName)
        } 

         //cssCustom
         if (appSetting.cssCustom && appSetting.cssCustom.length){
             window.addCustomFile(appSetting.cssCustom, 'css');
         }

      })
      .catch(err => {
        loader.style.display = 'none';
        swal(
          localeService.translate("common", "error-title"),
          localeService.translate("error", "cannot-get-app-config"),
          'error');
        console.error('get app setting fail');
        console.error(err);
        window.storeErr(err, 'Public Detail page');
      })
  } else {
    loader.style.display = 'none';
  }
};

$('iframe').on('load', function () {
  //change height iframe
  setMaxHeightIframe();
  let iframeElement = this;
  const ro = new ResizeObserver((entries, observer) => {
      iframeElement.style.height = Math.floor(entries[0].contentRect.height) + 50 + 'px';
      
  });
  ro.observe(document.getElementById('iframe').contentWindow.document.querySelector('.container-fluid'));


  $("iframe").contents().find('table').each(function () {
    if ($(this).attr('data-type') != 'REFERENCE_TABLE' && $(this).find('td').length == 1) {
      $(this).hide();
    }
  }); //count request if download size > 3MB

  $("iframe").contents().on("click", ".file-download", function () {
    if ($(this).children().hasClass('delete-file')) return;
    //do something
    let file = {
      name : $(this).attr('name'),
      fileKey :$(this).attr('key'),
      type : $(this).attr('type'),
    }
    loader.style.display = 'block';
    saveRecordUtility.downloadFile(file, window._config.api.publicDownloadFile.replace(/{appId}/, appId) + '?domain=' + domain)
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
            window.countRequest(domain, appId, null, times);
        } else {
            window.countRequest(domain, appId);
        }
    })
    .catch(err => {
      loader.style.display = 'none';
      swal(localeService.translate("common", "error-title"),err.message || JSON.stringify(err), 'error');
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
    modal.style.display = "none"
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
  };
});
addRecordBtn.addEventListener('click', function (e) {
  return handleAddRecord(e);
});
duplicateRecordBtn.addEventListener('click', function (e) {
  return handleDuplicateRecord(e);
});
/*
|--------------------------------------------------------------------------------------------
|   Function
|--------------------------------------------------------------------------------------------
*/

function loadAppForm(appSetting, appId) {
  return new Promise(function (resolve, reject) {
    iframe.src = `${appSetting.formUrl}?appId=${appId}`;
    iframe.addEventListener("load", loadRecordData);
    resolve();
  });
}

function loadRecordData() {
  console.log('starting get record data....');
  window.countRequest(domain, appId); //count request

  const url = window._config.api.publicGetRecord.replace(/{appId}/, appId).replace(/{id}/, recordId) + '?domain=' + domain;
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let response = this.response;
      if (typeof response != 'object') {
        response = JSON.parse(response);
      }
      const body = JSON.parse(response.body);

      if (body.code === 200) {
        record = body.record;
        console.log('get record data successs');
        appInfo = body.appInfo;
        displayRecordData();
      } else {
        console.error('get record fail');
        console.error(body.message);
        window.storeErr(body.message, 'public detail page');
        swal(localeService.translate("common", "error-title"), body.message, 'error');
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
      window.storeErr(this,'server error');
    }
  };

  xhr.open('GET', url);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';
  xhr.send();
}

function displayRecordData() {
  var iframeDocument = iframe.contentWindow.document;
  var fieldRight = appInfo.fieldCond0;
  var appRights = appInfo.funcCond0;
  window.insertAppName('need-app-name', appInfo['appName']);
  shouldDisplayAppMenu(appRights); // update sidebar

  //file input button handle
  $('#iframe').contents().find('.file-upload-button').hide();

  //lookup handle
  $("iframe").contents().find('.lookup-group').each(function () {
    $(this).siblings().removeClass('col-md-6 col-6')
    $(this).parent().removeClass('row');
    $(this).hide()  
  });

  // templateColor.changeColor(appId);
  // window.changeTextLink();
  var addRowTableBtns = Array.from(iframeDocument.querySelectorAll('.table-add-row')); //insert row to table

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
  }); // hide button add row in table

  addRowTableBtns = Array.from(iframeDocument.querySelectorAll('.table-add-row'));
  addRowTableBtns.forEach(function (btn) {
    btn.style.display = 'none';
  }); // hide fields which user have not right to view

  if (fieldRight && fieldRight.length > 0) {
    fieldRight.forEach(function (right) {
      // ラベルフィールドを処理する場合、特殊記号が含まれている場合があるため、エスケープ処理を入れている
      if (right.function.includes('view') && iframeDocument.querySelector(`.field-${CSS.escape(right.field)}`)) {
        iframeDocument.querySelector(`.field-${CSS.escape(right.field)}`).parentElement.style.display = 'none';
      }
    });
  } // get all input fields match with kintone fields


  var iframeInputs = Array.from(iframeDocument.getElementsByClassName('kintone-data'));
  iframeInputs = iframeInputs.map(function (input) {
    input.setAttribute('disabled', true);
    return {
      domElem: input,
      code: input.dataset.code
    };
  }); // set value for inputs have class `kintone-data`

  var apiUrl = window._config.api.publicDownloadFile.replace(/{appId}/, appId) + '?domain=' + domain;
  Object.keys(record).forEach(function (fieldCode) {
    var field = record[fieldCode];

    if (field.type === 'SUBTABLE') {
      var subTableBody = iframeDocument.getElementById(fieldCode + '-body');
      var sampleRow = subTableBody.querySelector('tr');
      field.value.map(function (row, index) {
        var rowValue = row.value;
        var rowField = $(subTableBody).children().eq(index);
        var columns = Array.from(rowField.find('.kintone-data'));
        columns.forEach(function (column) {
          var columnCode = $(column).attr('data-code');
          saveRecordUtility.setValueForField(rowValue[columnCode], column, apiUrl);
        });
      });
    } else {
      var domMatches = iframeInputs.filter(function (input) {
        return input.code === fieldCode;
      }).map(function (input) {
        return input.domElem;
      });
      domMatches.forEach(function (dom) {
        
        saveRecordUtility.setValueForField(field, dom, apiUrl);
      });
    }
  });

  let appSetting = JSON.parse(sessionStorage.getItem('appSetting'));
  let relateFieldsInfo = appSetting.relateFieldsInfo;


  //hide lookup and relate
  Object.values(appSetting.fields).forEach(field => {
    if (field.type == 'REFERENCE_TABLE' &&  relateFieldsInfo[field.code] && relateFieldsInfo[field.code].relateApiToken == false){
      $('#iframe').contents().find('.field-'+field.code).closest('.kintone-field-style').remove();
    }

    // if (field.lookup){
    //   $('#iframe').contents().find('.field-'+field.code).closest('.kintone-field-style').remove();
    //   // $('#iframe').contents().find('.field-'+field.code).closest('.td-chobitone').remove();
    // }

    // if (field.type == 'SUBTABLE'){
    //   for (let key in field.fields){
    //     if (field.fields[key].lookup){
    //       $('#iframe').contents().find('.field-'+key).closest('.td-chobitone').remove();
    //     }
    //   }
    // }
  })

  let relateFields = Object.values(appSetting.fields).filter(x => x.type == 'REFERENCE_TABLE');
  relateFields = relateFields.filter(x => record[x.referenceTable.condition.field] && record[x.referenceTable.condition.field].value && relateFieldsInfo[x.code].relateApiToken != false);


  if (relateFields.length) {
    let relateDataPomise = relateFields.map(async rl => {
      let fieldValue = record[rl.referenceTable.condition.field].value;
      if (record[rl.referenceTable.condition.field].type == 'RECORD_NUMBER' && typeof fieldValue === 'string') {
        fieldValue = fieldValue.replace(/\D/g, '');
      }
      let referenceInfo = rl.referenceTable;
      let relateRecords = await getRelateRecords(rl.code, fieldValue, referenceInfo);
      let obj = {
        field: rl.code,
        displayFields: referenceInfo.displayFields,
        relateRecords: relateRecords,
        relateAppId: referenceInfo.relatedApp.app,
        size : referenceInfo.size
      }
      return obj;
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
                    let detail = `<a target="_blank" href="${window.location.origin}/public/p_detail_record.html?appId=${data.relateAppId}&amp;id=${record.$id.value}"  title="${localeService.translate("info", "view-record-detail")}" class="detail-link"><span style="display: inline-block;margin-top: 7px;color: #009688db;font-size: 1.3rem;"class="btn far fa-file-alt"></span></a>`;
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
                              let fileUrl = await saveRecordUtility.downloadFile(file[j],window._config.api.publicDownloadFile.replace(/{appId}/, appId) + '?domain=' + domain)
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
    
  } else {
    loader.style.display = 'none';
  }

  //not show lookup
  // $(iframeDocument).find('.field-Lookup').closest('.kintone-field-style').remove();


   //jsCustom
   if (appSetting.jsCustom && appSetting.jsCustom.length){
       window.addCustomFile(appSetting.jsCustom, 'js');
   }
   
 


  //hide loader
  $('.se-pre-con').css('background','rgba(255, 255, 255, 0.4)')
  loader.style.display = 'none';
}

function getRelateRecords(fieldCode, fieldValue, referenceInfo) {
  let data = {
    fieldCode: fieldCode,
    fieldValue: fieldValue,
    referenceInfo: referenceInfo
  }
  return new Promise((resolve, reject) => {
    var url = window._config.api.publicGetRelateRecords.replace(/{appId}/, appId).replace(/{id}/, recordId) + '?domain=' + domain;;
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        var response = this.response;
        if (typeof response != 'object') {
          response = JSON.parse(response);
        }
        if (response.body) {
          var body = JSON.parse(response.body);
          if (body.code === 200) {
            resolve(body.records);
          } else {
            reject(body.message);
          }
        } else {
          reject(response.errorMessage);
        }
      }
      if (this.readyState === 4 && this.status !== 200) {
        reject(new Error(localeService.translate("error", "common-error-message")));
        console.error('Server error!');
        window.storeErr(this,'server error');
        
    }
    };
    xhr.open('POST', url, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  })
}

function shouldDisplayAppMenu(appRights) {
  if (!appRights.includes('add')) {
    addRecordBtn.style.display = 'none';
    addRecordBtn.removeEventListener('click', handleAddRecord);
    duplicateRecordBtn.style.display = 'none';
    duplicateRecordBtn.removeEventListener('click', handleDuplicateRecord);
  }
}

function handleAddRecord(e) {
  e.preventDefault();
  window.location.href = './p_add_record.html?appId=' + appId;
}

function handleDuplicateRecord(e) {
  e.preventDefault();
  //loader.style.display = 'block';
  sessionStorage.setItem('duplicateRecord', JSON.stringify(record));
  sessionStorage.setItem('appInfo', JSON.stringify(appInfo));
  window.location.href = ['../public/p_add_record.html?appId=', appId, '&duplicateId=', recordId, '&type=duplicate'].join('');
}

function showActionButton() {
  var action_old = JSON.parse(sessionStorage.getItem('appSetting')).action;
  var actions = JSON.parse(sessionStorage.getItem('appSetting')).actions;

  if(actions && actions.length){
    actions.forEach((action, act_i) => {
      if (action) {
        var actionApp = action.actionApp;
        let btnelem = $(`<button class="btn shadow action-btn" id="act-${act_i}"></button>`)
        // $('#action-button').html("<i class=\"fas fa-location-arrow\"></i> ".concat(action.actionName));
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
            window.location.href = "./p_add_record.html?appId=".concat(actions[conf_index].actionApp, "&type=action");
        });
      }
    })
  } else if (action_old){
    var actionApp = action_old.actionApp;
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
      window.location.href = "./p_add_record.html?appId=".concat(actionApp, "&type=action");
    });
  }
}
