

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var loader = document.getElementById('loader');
var tableHeader = document.getElementById('tableHeader');
var tableBody = document.getElementById('tableBody');
var filterAdd = document.getElementById('filterAdd');
var filterList = document.getElementById('filterList');
var searchBtn = document.getElementById('searchBtn');
var resetBtn = document.getElementById('resetBtn');
var addRecordBtn = document.getElementById('addRecordBtn');
var filterTypeMatchAll = document.getElementById('filterTypeMatchAll');
var searchSelection = document.getElementById('search-selection');
var inputFilterFields = Array.prototype.slice.call(document.getElementsByClassName('input-filter-field'));

const FilterRecordsService = require('./service/filter-records-service').default;
const CalendarViewService = require('./service/calendar-view-service').default;
const CountRecordService = require('./service/count-record-service').default;
const PaginationController = require('./service/pagination-controller').default;
const LocaleService = require('chobiit-common/src/application/locale-service').default;
const saveRecordUtility = require('./save-record-utility');
require('cross-fetch/polyfill');
const { ChobiitFilterConditionList } = require('./domain/chobiit-filter-condition-list');
const { TimeFilterCondition } = require('./domain/time-filter-condition');
const { DateFilterCondition } = require('./domain/date-filter-condition');
const { DateTimeFilterCondition } = require('./domain/datetime-filter-condition');
const { SingleStringFilterCondition } = require('./domain/single-string-filter-condition');
const { MultipleStringFilterCondition } = require('./domain/multiple-string-filter-condition');
const { InputFilterRowWrapper } = require('./infrastructure/input-filter-row-wrapper');
const { JqueryDateTimePicker } = require('./ui/jquery-date-time-picker');
const { ListViewSelector } = require('./ui/list-view-selector');
const { UrlQueryParameterWrapper } = require('./infrastructure/url-query-parameter-wrapper');
const { ClientViewErrorMessageService } = require('./service/client-view-error-message-service');
const { ListViewService } = require('chobiit-common/src/application/list-view-service');
const { createFullCalendar } = require('./ui/calendar-ui-service')
const { insertHeader,
        isKintoneQueryOffsetLimit,
        setupStickyHeaderTable,
        attemptFilterCalendar,
        setFilterableFields,
        addNewFilterRow,
        shouldShowDeleteButton } = require('./service/list-record-page-service')

const localeService = LocaleService.getInstance("client");
var appId = window.getQueryStringByName('appId');
var domain = window.getKintoneDomain();
var idToken = JSON.parse(localStorage.getItem('idToken'));
var showFields = {};
var orderOfField;
var recordTable;
var calendar;
var records;
var totalCount;
var calendarView;
let currentPage = 0;
let currentMonth = 0;
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
var loginName = userInfo.loginName;
var appRights = JSON.parse(sessionStorage.getItem('appRights'));
/**
 * loadListRecords内でグローバル変数として定義されていたので、上に移動しました。
 */
var appInfo;

var modal = document.getElementById('myModal');
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
var imgClose = document.getElementsByClassName("img-close")[0];
var imgDown = document.getElementsByClassName("img-down")[0];

if (appRights) {
    appRights = appRights.filter(function (x) {
        return x.appId == appId;
    });

    if (appRights[0].appRight.recordAddable == false) {
        $(addRecordBtn).hide();
    }else{
        $('#calendar').on("mouseenter", ".fc-day-top", function () {
            if (!$(this).hasClass('fc-other-month')) {
                $(this).prepend("<i class=\"add-event fas fa-plus-circle\"></i>");
            }
        });
    }
}

/*
|--------------------------------------------------------------------------------------------
|   Event listener
|--------------------------------------------------------------------------------------------
*/

imgClose.onclick = function () {
    modal.style.display = "none";
};

imgDown.onclick = function () {
    let url = $(this).attr('href');
    let name = $(this).attr('name');

    if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
        fetch(url)
        .then(res => res.blob())
        .then(blob => {
            window.navigator.msSaveOrOpenBlob(blob, name);
        })
    }


    var size = $(this).attr('size');

    if (size > 1048576) {
        var times =  Math.ceil(size / 1048576)
        window.countRequest(domain, appId, loginName, times);
    } else {
        window.countRequest(domain, appId, loginName);
    }
};

$('#recordTable').on("click", ".image-frame", function () {
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

$('#recordTable').on("click", ".file-download", function () {
    if ($(this).children().hasClass('delete-file')) return;
    let file = {
        name: $(this).attr('name'),
        fileKey: $(this).attr('key'),
        type: $(this).attr('type'),
    };
    loader.style.display = 'block';
    saveRecordUtility.downloadFile(file, window._config.api.downloadFile, idToken)
    .then((url) => {
        console.log('blob url: ',url)
        loader.style.display = 'none';
        if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
            fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    window.navigator.msSaveOrOpenBlob(blob, file.name);
                });
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
        loader.style.display = 'none';
        swal(
            localeService.translate('common', 'error-title'),
            err.message || JSON.stringify(err),
            'error'
        );
        console.log(err);
    });
});

window.onload = function (_event) {
    loader.style.display = 'block';
    if (idToken && appId) {
        Promise.all([
            loadAppListData(idToken),
            window.getAppSetting(appId)
        ])
        .then(([_load, appSetting]) => {
            window.changeColor(appSetting.templateColor);
            $(`.text-list-${appId}`).text(appSetting.showText.list);
            //custom
            if (appSetting.cssCustom && appSetting.cssCustom.length){
                window.addCustomFile(appSetting.cssCustom, 'css');
            }
            if (appSetting.jsCustom && appSetting.jsCustom.length){
                window.addCustomFile(appSetting.jsCustom, 'js');
            }

            ListViewSelector.render("mainContent")
            loadListRecords(0, 0, "", true, UrlQueryParameterWrapper.getViewId());
        })
        .catch(async err => {
            loader.style.display = 'none';
            const isConfirm = await swal(
                localeService.translate('common', 'error-title'),
                ClientViewErrorMessageService.getErrorMessage(err),
                "error",
            );
            if (isConfirm) {
                if(err.message === 'target-list-view-not-found'){
                    location.href = `${location.origin}${location.pathname}?appId=${appId}`
                }
            }
            console.error('get app setting fail');
            console.error(err);
            window.storeErr(err,'Add record  page');
        });
    } else {
        loader.style.display = 'none';
    }
};

searchSelection.addEventListener('click', function(){
    if($('#filter').is(":hidden")){
        $( "#filter" ).slideDown();
        $('#updown-icon').addClass('fa-chevron-up').removeClass('fa-chevron-down');
    }else{
        $( "#filter" ).slideUp();
        $('#updown-icon').addClass('fa-chevron-down').removeClass('fa-chevron-up');
    }
})
filterAdd.addEventListener('click', function () {
    addNewFilterRow(handleChangeFilterField);
    shouldShowDeleteButton();
    changeHideFilterAddButton();
});
filterList.addEventListener('click', function (event) {
    if (event.target.title === localeService.translate('common', 'action-delete')) {
        var deleteBtn = event.target;
        var conditionRow = findAncestor(deleteBtn, '.filter-row');
        removeElement(conditionRow);
        shouldShowDeleteButton();
        changeHideFilterAddButton();
    }
});
filterList.addEventListener('keyup', function (event) {
    if (event.target.className.includes('input-filter-value') && event.keyCode === 13) {
        searchBtn.click();
    }
});
inputFilterFields.forEach(function (inputFilterField) {
    attachEvent('change', inputFilterField, handleChangeFilterField);
});
searchBtn.addEventListener('click', function (event) {
    loader.style.display = 'block'

    $.fn.DataTable.isDataTable('#recordTable') && recordTable.destroy();

    /**
    * 検索条件を変更した時、1ページ目に戻るので、currentPageを0にする
    */
    currentPage = 0

    loadRecordsWithFilterTerms(currentPage,currentMonth)
});

const loadRecordsWithFilterTerms = (currentPage, currentMonth, hasNextPage) => {
    const filterContents = Array.prototype.slice.call(document.getElementsByClassName('filter-content'));
    const isMatchAll = filterTypeMatchAll.checked;

    if ($('#recordTable').is(":hidden")) {
        attemptFilterCalendar(filterContents, isMatchAll, calendar, records, calendarView, appId, false);
        loader.style.display = 'none';
        return;
    }

    const chobiitFilterConditionList = new ChobiitFilterConditionList(createChobiitFilterConditions(filterContents),isMatchAll)
    const query = chobiitFilterConditionList.toKintoneQuery()
    loadListRecords(currentPage, currentMonth, query, hasNextPage, UrlQueryParameterWrapper.getViewId());
}   

const createChobiitFilterConditions = (filterContents) => {
    const removedEmptyFilterContents = removeEmptyFilterContents(filterContents)
    return removedEmptyFilterContents.map(content => {
        const filterField = content.querySelector('.input-filter-field').value;
        const filterType = content.querySelector('.input-filter-type').value;
        const filterValue =  $(content).find('.input-filter-value').val();

        const [dataType, operatorKeyword] = filterType.split('_');

        switch(dataType) {
            case 't' :
                return new TimeFilterCondition(filterField,filterType,filterValue)
            case 'd' :
                return new DateFilterCondition(filterField,filterType,filterValue)
            case 'dt' :
                return new DateTimeFilterCondition(filterField,filterType,filterValue)
            case 's' :
                if(operatorKeyword === "include" || operatorKeyword === "notInclude" || operatorKeyword === "mutilInclude" || operatorKeyword === "notMutilInclude"){
                    return new MultipleStringFilterCondition(filterField,filterType,filterValue)
                }else{
                    return new SingleStringFilterCondition(filterField,filterType,filterValue)
                }
            default :
                throw new Error("No data type matched");
        }
    })
}

/**
 * TODO: 本来はバリデーションをかけて未入力エラーである旨をユーザーに伝えるべき。
 */
const removeEmptyFilterContents = (filterContents) => {

    return filterContents.filter(content => {
        const filterField = content.querySelector('.input-filter-field').value;
        const filterType = content.querySelector('.input-filter-type').value;
        const filterValue =  $(content).find('.input-filter-value').val();
        const baseComparison = filterField !== '' && filterType !== ''
        
        if (FilterRecordsService.emptiableValueOperators.includes(filterType)) return baseComparison;

        switch(typeof filterValue){
            case 'string' :
                return baseComparison && filterValue !== ''
            case 'object' :
                return baseComparison && filterValue.length !== 0
            default : 
                throw new Error('filterValue is not string or object')
        }
    })
}

const changeHideFilterAddButton = () => {
    const filterRow = $('#filterList').children('.filter-row');
    if(filterRow.length < 10) filterAdd.hidden = false;
    if(filterRow.length === 10) filterAdd.hidden = true;
}

resetBtn.addEventListener('click', function (event) {
    try {
        loader.style.display = 'block'
        InputFilterRowWrapper.resetFilterRow();
        shouldShowDeleteButton();
        $.fn.DataTable.isDataTable('#recordTable') && recordTable.destroy();
        event.preventDefault();

        if ($('#recordTable').is(":hidden")) {
            var eventSourceOld = calendar.getEventSources();
            eventSourceOld.forEach(function (eventSource) {
                eventSource.remove();
            });
            var eventSourceNew = CalendarViewService.getEventSource(records, calendarView, appId, false);
            calendar.addEventSource(eventSourceNew);
            loader.style.display = 'none'
        } else {
            /**
             * 検索条件をリセットした時、最初のページに戻るので、currentPageを0にする
             */
            currentPage = 0;
            loadListRecords(currentPage, currentMonth, "", true, UrlQueryParameterWrapper.getViewId());
        }
    }catch(error){
        console.error(error.message)
    }
});

addRecordBtn.addEventListener('click', function (event) {
    event.preventDefault();
    window.location.href = ['./add_record.html?appId=', appId].join('');
}); //calendar handle

// $('#calendar').on("mouseenter", ".fc-day-top", function () {
//     if (!$(this).hasClass('fc-other-month')) {
//         $(this).prepend("<i class=\"add-event fas fa-plus-circle\"></i>");
//     }
// });
$('#calendar').on("mouseleave", ".fc-day-top", function () {
    $(this).find('.add-event').remove();
});
$('#calendar').on("click", ".add-event", function () {
    window.location.href = "./add_record.html?appId=".concat(appId);
});


$('.fc-next-button').click(function(){
    /**
     * ページの初期値が 0 から始まっているので、-1 をしています
     */
    const maxPageNum = Math.ceil(totalCount / 100) - 1;
    if (currentPage < maxPageNum) {
        currentPage++;
        loader.style.display = 'block';
        recordTable.destroy();
        const hasNextPage = true;
        loadRecordsWithFilterTerms(currentPage,currentMonth,hasNextPage);
    }
})

$('.fc-prev-button').click(function(){
    if (currentPage > 0) {
        currentPage--;
        loader.style.display = 'block';
        recordTable.destroy();
        const hasNextPage = false;
        loadRecordsWithFilterTerms(currentPage,currentMonth,hasNextPage);
    }

});

//sticky header table
$(document).ready(function() {
    setupStickyHeaderTable()
});

$('#calendar').on('click', '.fc-next-button',function(){
        currentMonth++;
        loader.style.display = 'block';
        loadListRecords(0, currentMonth, "", true, UrlQueryParameterWrapper.getViewId());
});

$('#calendar').on('click', '.fc-prev-button',function(){
        currentMonth--;
        loader.style.display = 'block';
        loadListRecords(0, currentMonth, "", true, UrlQueryParameterWrapper.getViewId());
});

$('#calendar').on('click', '.fc-today-button ',function(){
    currentMonth = 0;
    loader.style.display = 'block';
    loadListRecords(0, currentMonth, "", true, UrlQueryParameterWrapper.getViewId());
});

/*
|--------------------------------------------------------------------------------------------
|   Function
|--------------------------------------------------------------------------------------------
*/
function loadListRecords(currentPage = 0, currentMonth = 0, filterTerms = "", hasNextPage = true, viewId = "") {
    $('#tableHeader').empty();
    $('#tableBody').empty();
    $('#calendar').empty();

    console.log('starting get list record...');
    const startDate = moment().add(parseInt(currentMonth), "months").startOf("month").toISOString();
    const endDate = moment().add(parseInt(currentMonth), "months").endOf("month").toISOString();
    const baseUrl = window._config.api.getRecords.replace(/{appId}/, appId) + `/?page=${currentPage}&startDate=${startDate}&endDate=${endDate}`
    const urlWithFilterTerms = filterTerms !== "" ? baseUrl + `&filterTerms=${filterTerms}` : baseUrl;
    const url = viewId !== "" ? urlWithFilterTerms + `&viewId=${viewId}` : urlWithFilterTerms;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var response = this.response;
            if (typeof response != 'object'){
                response = JSON.parse(response);
            }
            
            if (response.code === 200) {
                try{
                    console.log('load list record success');
                    var body = typeof response === 'string' ? JSON.parse(response) : response;
                    records = body.records;
                    totalCount = body.totalCount;
                    window.countRequest(domain, appId, loginName);
                    appInfo = body.appInfo;
                    const groupView = appInfo.groupView;
                    const currentViewId = UrlQueryParameterWrapper.getViewId();
                    const currentListView  = ListViewService.getCurrentListView(appInfo, currentViewId);
                    var view = currentListView.recordCond1
                    calendarView = currentListView.calendarView;

                    const hasFilterTerms = body.hasFilterTerms;

                    if(isKintoneQueryOffsetLimit(hasFilterTerms,totalCount)) {
                        loader.style.display = 'none';
                        swal(
                            localeService.translate("common", "warning-title"),
                            localeService.translate("error", "filter-result-is-over-limit"),
                            'warning'
                        );
                        return;
                    }

                   showFields = body.showFields;
                   orderOfField = insertHeader(showFields, tableHeader, false);

                   const isCalendarView = calendarView !== undefined && calendarView !== false

                    if (isCalendarView) {
                        $('#recordTable').parent().hide();
                        const firstDateOfDisplayingMonth = moment().add(parseInt(currentMonth), 'months').startOf('month');
                        calendar = createFullCalendar(false, firstDateOfDisplayingMonth, calendarView, appId, appInfo, records, body)
                        calendar.render();
                        $('.fc-center').html(`<h2>${CalendarViewService.getCalendarMonth(firstDateOfDisplayingMonth)}</h2>`);
                    } else {
                        const recordsCount = records.length
                        $('.table-info').empty();
                        const displayRecordTotals = CountRecordService.countRecords(currentPage, totalCount, recordsCount, groupView, hasNextPage);
                        $('.table-info').text(displayRecordTotals);

                        //format record
                        records.forEach(function (record) {
                            for (const key in record) {
                                if (record[key].value) {
                                    if (['NUMBER', 'RECORD_NUMBER'].includes(record[key].type)) {
                                        record[key].value = Number(record[key].value);
                                    }
                                }
                            }
                        });
                        const rights = body.rights;

                        if (view) {
                            if (view.type == 'CUSTOM') {
                                const html = view.html;
                                $('#recordTable').append(html);
                            } else if (view.type == 'LIST') {
                                const fieldsViewable = view.fields;
                                let tempFields = {};
                                fieldsViewable.forEach(function (field) {
                                    if (!showFields[field]) return;
                                    const obj = _defineProperty({}, field, showFields[field]);
                                    tempFields = Object.assign(tempFields, obj);
                                });
                                showFields = tempFields;
                                $(tableHeader).empty();
                                orderOfField = insertHeader(showFields, tableHeader, false);
                                const orderField = {};
                                orderOfField.forEach(function (item, index) {
                                    if (item.code) {
                                        const obj = _defineProperty({}, item.code, index);
                                        Object.assign(orderField, obj);
                                    }
                                });
                            }
                        }
                        records.forEach(function (record) {
                            const recordRight = rights.find(function (right) {
                                return +right.id === +record['$id']['value'];
                            });
                            insertRecord(record, orderOfField, recordRight);
                        }); // initialize datatables
                    

                        var columnDefs = orderOfField.map(function (field, index) {
                            var definition = {
                                'targets': [index],
                                'name': field.code,
                                'width': 'max-content'
                            };

                            if (index === 0) {
                                definition['name'] = null;
                                definition['searchable'] = false;
                                definition['orderable'] = false;
                            }

                            return definition;
                        });

                        if (!$.fn.DataTable.isDataTable('#recordTable')) {
                            recordTable = $('#recordTable').DataTable({
                                'language': {
                                    'zeroRecords': localeService.translate("info", "no-records-found"),
                                },
                                'deferRender': true,
                                'dom': 'lrtip',
                                'columnDefs': columnDefs,
                                'autoWidth': false ,
                                'lengthChange' : false,
                                "pageLength": 100,
                                "info": false,
                                "paging" : false
                            });
                        }

                        /**
                         * グループのみ表示設定の場合、遷移先にレコードが存在しない可能があるため
                         * 表示レコードがない場合は、次のページへ遷移する対処を行なっています。
                         */
                        if(groupView && recordsCount === 0 && hasNextPage){
                            PaginationController.moveToNextPage()
                        }else if(groupView && recordsCount === 0 && !(hasNextPage)){
                            PaginationController.moveToPrevPage()
                        }
                    }
                    // set filter-able fields
                    if (orderOfField){
                        setFilterableFields(orderOfField, showFields);
                    }

                    $('[data-toggle="tooltip"]').tooltip();

                }catch(err){
                    console.error('load records fail');
                    console.error(err);
                    loader.style.display = 'none'
                    window.storeErr(err, 'list record page');
                    swal(
                        localeService.translate('common', 'error-title'),
                        ClientViewErrorMessageService.getErrorMessage(err),
                        'error'
                    );
                }
            } else {
                console.error('load records fail');
                console.error(response);
                loader.style.display = 'none';
                window.storeErr(response, 'list record page');
                swal(
                    localeService.translate('common', 'error-title'),
                    window.showError(response),
                    'error'
                );
            }
            loader.style.display = 'none';
        }

        if (this.readyState === 4 && this.status !== 200) {
            loader.style.display = 'none';
            swal(
                localeService.translate('common', 'error-title'),
                localeService.translate('error', 'common-error-message'),
                'warning'
            );
            console.error('Server error!');
            window.storeErr(this,'server error');
        }
    };

    xhr.open('GET', encodeURI(url), true);
    xhr.setRequestHeader('Authorization', idToken.jwtToken)
    xhr.responseType = 'json';
    xhr.send();
}


function removeRecord(recordId, tr) {
    var url = window._config.api.removeRecord.replace(/{appId}/, appId).replace(/{id}/, recordId);
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let response = this.response;
            if (typeof response != 'object'){
                response = JSON.parse(response);
            }

            if (response.code === 200) {
                tr.style.display = 'none';
                window.countRequest(domain, appId, loginName); //count request
            } else {
                swal(
                    localeService.translate('error', 'failed-in-deleting'),
                    localeService.translate('error', 'please-retry'),
                    'error'
                );
                console.error('delete record fail: ' + response.message);
                window.storeErr(response.message,'list record page');
                loader.style.display = 'none';
            }
        }
        if (this.readyState === 4 && this.status !== 200) {
            swal(
                localeService.translate('common', 'error-title'),
                localeService.translate('error', 'common-error-message'),
                'warning'
            );
            console.error('Server error!');
            window.storeErr(this,'server error');
        }
    };

    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', idToken.jwtToken)
    xhr.responseType = 'json';
    xhr.send();
}


function insertRecord(record, orderOfField, recordRight) {
    var tr = document.createElement('TR');
    tr.addEventListener('click', function (event) {
        handleRedirectToDetailRecord(event, recordRight, 1);
    }); // insert record field follow the order of field

    orderOfField.forEach(function (field, index) {
        if (index === 0) {
            if (!recordRight.record.viewable) {
                var _recordDetailCol = document.createElement('TD');

                tr.appendChild(_recordDetailCol);
                return;
            }

            var recordDetailCol = document.createElement('TD');
            var recordDetailLink = document.createElement('A');
            recordDetailLink.setAttribute('href', ['./detail_record.html?appId=', appId, '&id=', record['$id']['value']].join(''));
            recordDetailLink.setAttribute('target', '_self');
            recordDetailLink.title = localeService.translate('info', 'view-record-detail');
            recordDetailLink.dataset.record = record['$id']['value'];
            recordDetailLink.addEventListener('click', function (event) {
                handleRedirectToDetailRecord(event, recordRight, 0);
            });
            recordDetailLink.classList.add('detail-link');
            var span = document.createElement('SPAN');
            span.classList.add('record-detail-icon');
            span.classList.add('btn');
            span.classList.add('far');
            span.classList.add('fa-file-alt');
            recordDetailLink.appendChild(span);
            recordDetailCol.appendChild(recordDetailLink);
            tr.appendChild(recordDetailCol);
        } else if (index < orderOfField.length - 1) {
            const td = document.createElement('TD');
            let innerHTML = '';

            // chobiitのクライアントでフィールドタイプが NUMBER と RECORD_NUMBER の場合、
            // フィールドの値を数値へキャストする処理をしているので、ここでは数値の 0 で厳密等価演算を行なっている
            if (record[field.code] && record[field.code].type === 'NUMBER' && record[field.code].value === 0){
                td.innerHTML = 0;
            }
            
            if (record[field.code] && record[field.code].value) {
                const fieldValue = record[field.code];
                switch(fieldValue.type){
                    case 'MULTI_LINE_TEXT' :
                        td.innerHTML =  `<a style="color:black" href="#" data-toggle="tooltip" data-placement="right" title="${fieldValue.value}">${window.strlimit(fieldValue.value, 10)}</a>`
                        break;
                    case 'CREATOR':
                    case 'MODIFIER':
                        innerHTML = fieldValue.value.name;
                        td.innerHTML = innerHTML;
                        break;
                    case 'CREATED_TIME':
                    case 'UPDATED_TIME':
                    case 'DATETIME':
                        innerHTML = moment(fieldValue.value).isValid() ? moment(fieldValue.value).format(`YYYY-MM-DD ${LocaleService.getTimeFormat()}`) : fieldValue.value;
                        td.innerHTML = innerHTML;
                        break
                    case 'DATE':
                        innerHTML = fieldValue.value;
                        td.innerHTML = innerHTML;
                        break;
                    case 'TIME': {
                        if (process.env.CHOBIIT_LANG === 'ja') {
                            innerHTML = fieldValue.value;
                        }
                        
                        if (process.env.CHOBIIT_LANG === 'en') {
                            innerHTML = moment(fieldValue.value,"HH:mm").isValid() ? moment(fieldValue.value,"HH:mm").format('hh:mm A') : fieldValue.value;
                        }

                        td.innerHTML = innerHTML;
                        break;
                    }
                    case 'LINK':
                        if (fieldValue.value){
                            
                            let link = fieldValue.value;
                            if (showFields[field.code] && showFields[field.code].protocol == "WEB"){
                                link =  `<a href="${fieldValue.value}" target="_blank" >${fieldValue.value}</a>`
                            }

                            if (showFields[field.code] && showFields[field.code].protocol == "MAIL"){
                                link = `<a href="mailto:${fieldValue.value}">${fieldValue.value}</a>`
                            }

                            if (showFields[field.code] && showFields[field.code].protocol == "CALL"){
                                if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                                    link =  `<a href="tel://${fieldValue.value}">${fieldValue.value}</a>`
                                }else{
                                    link =  `<a href="callto://${fieldValue.value}">${fieldValue.value}</a>`
                                }
                            }
                            $(td).append(link);
                        }
                        break;

                    case 'FILE':
                        fieldValue.value.forEach(async file => {
                            const fileType = file.contentType.split('/')[0];
                            if (fileType == 'image'){
                                const fileUrl = await saveRecordUtility.downloadFile(file, window._config.api.downloadFile, idToken)
                                const img = "<img src=\"".concat(fileUrl, "\" alt=\"").concat(file.name, "\" class=\"image-frame img-frame\" id=\"image-").concat(field.code, "\" size=\"").concat(file.size, "\">");
                                $(td).append(img);
                            }else{
                                const a = document.createElement("a");
                                a.href = '#';
                                a.innerHTML = file.name;
                                $(a).attr('size', file.size);
                                $(a).attr('key', file.fileKey);
                                $(a).attr('name', file.name);
                                $(a).attr('type', file.contentType);
                                $(a).attr('class', 'file-download');
                                $(a).css('display', 'block');
                                td.appendChild(a);
                            }
                        });
                        break;
                    case 'NUMBER' :
                        innerHTML= fieldValue.unit ? (fieldValue.unitPosition == "AFTER" ? fieldValue.value + " " + fieldValue.unit : fieldValue.unit + " " + fieldValue.value) : fieldValue.value;
                        td.innerHTML = innerHTML;
                        break;
                    default :
                        innerHTML = fieldValue.value;
                        td.innerHTML = innerHTML;
                }
            }
            tr.appendChild(td);
        } else {
            // add button remove record
            if (!recordRight.record.deletable) {
                removeRecordCol = document.createElement('TD');
                tr.appendChild(removeRecordCol);
                return;
            }

            var removeRecordCol = document.createElement('TD');
            var removeRecordLink = document.createElement('A');
            removeRecordLink.setAttribute('target', '_self');
            removeRecordLink.title = localeService.translate('common', 'action-delete');
            removeRecordLink.dataset.record = record['$id']['value'];
            removeRecordLink.addEventListener('click', function (event) {
                var $link = $(this);
                swal({
                    text: localeService.translate('info', 'is-it-ok-to-delete'),
                    icon: "warning",
                    buttons: [
                        localeService.translate('common', 'cancel-title'),
                        localeService.translate('common', 'action-delete'),
                    ],
                    closeOnClickOutside: false,
                    dangerMode: true
                }).then(function (willDelete) {
                    if (willDelete) {
                        $link.replaceWith('<div class="spinner-border spinner-border-sm text-info" style="width: 1.3rem;height: 1.3rem;margin-top: .7rem;margin-left: .7rem;"></div>');
                        removeRecord(record['$id']['value'], tr);
                    }
                });
            });
            var span = document.createElement('SPAN');
            span.classList.add('remove-record-icon');
            span.classList.add('btn');
            span.classList.add('far');
            span.classList.add('fa-trash-alt');
            removeRecordLink.appendChild(span);
            removeRecordCol.appendChild(removeRecordLink);
            tr.appendChild(removeRecordCol);
        }
    });
    tableBody.appendChild(tr);
}

function handleRedirectToDetailRecord(event, recordRight, type = 0) {
    if ($(event.target).is('a') && !$(event.target).hasClass('detail-link')) return;

    event.preventDefault();
    let detailRecordLink;

    if (event.target.classList.contains('detail-link')) {
        detailRecordLink = event.target;
    } else if (type === 0) {
        detailRecordLink = findAncestor(event.target, 'a.detail-link');
    } else if (type === 1) {
        detailRecordLink = event.target.parentElement.firstChild.firstChild;
    } else if (type === 2) {
        detailRecordLink = event.target; 
    }

    if (recordRight) {
        sessionStorage.setItem('recordRight', JSON.stringify(recordRight));
    }

    if (detailRecordLink) {
        window.location.href = detailRecordLink.getAttribute('href');
    }
}


/*--------------------------------------
 * function for filter
 *--------------------------------------*/

function handleChangeFilterField(event) {
    const elem = this || event.target;
    const selectedField = elem.options[elem.selectedIndex].value;

    if (selectedField) {
        // generate type of filter for the selected field
        const filterFieldDiv = findAncestor(elem, '.filter-field');
        InputFilterRowWrapper.initializeFilterValueElement(filterFieldDiv.parentElement)
        const filterTypeDiv = filterFieldDiv.nextElementSibling;
        const inputFilterType = filterTypeDiv.getElementsByTagName('select')[0];

        const fieldInfo = showFields[selectedField];
        const typeOptions = FilterRecordsService.getFilterTypeOptions(fieldInfo.type);
        inputFilterType.innerHTML = '';

        for (const type in typeOptions) {
            inputFilterType.innerHTML += '<option value="' + type + '">' + typeOptions[type] + '</option>';
        }

        const $inputFilterValue = $(filterFieldDiv).parent().find('.input-filter-value')
        switch(fieldInfo.type){
            case 'RADIO_BUTTON':
            case 'DROP_DOWN':
            case 'CHECK_BOX':
            case 'MULTI_SELECT':
                const options = Object.values(fieldInfo.options).sort((a,b) => +a.index - +b.index);
                $inputFilterValue.replaceWith(`
                    <select multiple class="form-control input-filter-value">
                        <option value="">--</option>
                        ${options.map(item => `<option value="${item.label}">${item.label}</option>`).join('')}
                    </select>
                `)
                break;
            case 'STATUS':
                const appSetting = JSON.parse(sessionStorage.getItem('appSetting'));
                const statusInfo = appSetting.statusInfo;
                if (statusInfo){
                    statusInfo.sort((a,b) => +a.index - +b.index)
                    $inputFilterValue.replaceWith(`
                        <select multiple class="form-control input-filter-value">
                            ${statusInfo.map(item => `<option value="${item.name}">${item.name}</option>`).join('')}
                        </select>
                    `)
                }
                break;
            case 'DATE':
            case 'TIME':
            case 'DATETIME':
                JqueryDateTimePicker.render($inputFilterValue, fieldInfo.type)
                break;
            default:
                $inputFilterValue.replaceWith('<input class="form-control input-filter-value">')
                break;
        }
    }
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
