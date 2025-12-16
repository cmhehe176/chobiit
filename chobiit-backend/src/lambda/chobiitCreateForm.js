const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({
  
});

const TABLE_NAME = 'chobitoneApp';
const BUCKET_NAME = process.env.BUCKET_NAME;
const CHOBIIT_DOMAIN_NAME = process.env.CHOBIIT_DOMAIN_NAME;

var s3Bucket = new AWS.S3({
    params: { Bucket: BUCKET_NAME }  
});

const {default: LocaleService} = require('chobiit-common/src/application/locale-service');
const localeService = LocaleService.getInstance("backend");

exports.handler = (event, context, callback) => {
    console.log('event: ',JSON.stringify(event, null, 2))
    let app = event.app;    
    let fields = event.fields;
    let relateFieldsInfo = event.relateFieldsInfo;
    let formLayout = event.formLayout;
    let fieldRights = event.fieldRights;
    let fieldCond0 = event.fieldCond0;
    const colorValue = event.templateColor;
    let domain = event.domain;

    // 動的にHTMLの内容を作成
    let html = `
        <html>
          
            <meta http-equiv="Content-Type" content="text/html" charset="utf-8">
            <meta name="robots" content="noindex">
            <head>
                
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">
                <link rel="stylesheet" href="https://chobiit.s3.amazonaws.com/lib/datetimepicker/bootstrap-datetimepicker.min.css">
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous">
                
                <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js"></script>
                <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment-with-locales.js"></script>
                <script src="https://chobiit.s3.amazonaws.com/lib/datetimepicker/bootstrap-datetimepicker.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>
             
              
                <style>
                    body {
                        font-family: HelveticaNeueW02-55Roma,Arial,'Hiragino Kaku Gothic ProN',Meiryo,sans-serif;
                        overflow-y : scroll
                    }
                    
                    .lookup-action {
                        color: #2196F3;
                        cursor: pointer;
                        transition: 0.5s;
                    }
                    
                    .lookup-action:hover {
                        color: #2083d2;
                    }
                    
                    
                    .image-frame {
                        cursor: pointer;
                        box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.07);
                        max-width: 170;
                        height: auto;
                        padding-bottom: .5rem;
                        display : block;
                    }
                    
                    .td-chobitone {
                        border-left: 1px solid #dee2e6;
                        border-bottom: 1px solid #dee2e6;
                        border-right: 1px solid #dee2e6;
                    }
                    .td-chobitone:last-of-type {
                        border: none;
                    }
                    
                    .table {
                        with : max-content !important;
                    
                    }
                    
                    table .td-relate{
                        border: 1px solid #dee2e6;
                    }
                                        
                    table .chobiit-table-th {
                        border: none !important;
                    }
                    
                    .kintone-field-style {
                        padding-left: 15px;
                        padding-top: 15px;
                    }
                    
                    .kintone-custom-error {
                        font-size: .9rem;
                        color: red;
                        padding: 2px;
                    }
                    
                    .file-space-chobitone {
                        background: #f7f7f7;
                        padding: 10px;
                        border-radius: 5px;
                        color: #495057;
                        word-wrap: break-word;
                        word-break: break-all;
                        -ms-word-wrap: break-word;
                        white-space: normal;
                        -ms-word-wrap: break-word;
                    }
                    
                    .file-upload-button {
                        color: #fff;
                        background-color: ${colorValue.backgroundColor.bcolor2}; 
                        border-color :  ${colorValue.backgroundColor.bcolor2};
                        margin-bottom: 15px
                    }
                    
                    .file-upload-button:hover {
                        color: #fff;
                        background-color: ${lightenDarkenColor(colorValue.backgroundColor.bcolor2, -30)}; 
                        border-color :  ${lightenDarkenColor(colorValue.backgroundColor.bcolor2, -30)}; 
                        margin-bottom: 15px
                    }
                    
                    .file-label {
                        background: rgba(0, 123, 255, 0.05);
                        margin-bottom: .5rem;
                        border-radius: 1rem;
                        padding: .3rem .5rem .3rem .5rem;
                        color: #17a2b8;
                    }
                    
                    .delete-file{
                       transition: 0.2s;
                       cursor: pointer;
                    }
                    
                    .delete-file:hover{
                       color: red;
                    }
                    
                     .custom-radio .custom-control-input:disabled:checked~.custom-control-label::before {
                        background-color: rgb(0, 123, 255);
                    }
                    .custom-checkbox .custom-control-input:disabled:checked~.custom-control-label::before {
                        background-color: rgb(0, 123, 255);
                    }
                    .custom-control-input:disabled~.custom-control-label {
                        color: black;
                    }
                     .custom-select:disabled {
                        color: black;
                        background: #f7f7f7;
                        border : none;
                    }
                    .form-control:disabled, .form-control[readonly] {
                        background-color: #f7f7f7;
                        opacity: 1;
                        color: black;
                        border : none
                    }
                    
                    
                </style>
            </head>
            <body>
                <div class="container-fluid">
                    <form>
    `;
    
    for (let i = 0; i < formLayout.length; i++) {
        let layout = formLayout[i];
        if (layout.type == 'ROW') {
            html = html + '<div class="row mb-3">';
            let fieldRow = layout.fields;
            for (let i = 0; i < fieldRow.length; i++) {
                let code = fields[fieldRow[i].code];
                let fieldWidth = 0;
                if (fieldRow[i].hasOwnProperty('size')){
                    fieldWidth = fieldRow[i].size.width;
                }
                //if (fieldRow[i].type == 'DATE'){
                    fieldWidth = parseInt(fieldWidth) + 20;
                //}
                if (fieldRow[i].type == 'REFERENCE_TABLE'){
                    html = html + `<div class="kintone-field-style">`;
                }else {
                    html = html + `<div class="kintone-field-style" style="width: ${fieldWidth}px;">`;
                }
                switch (fieldRow[i].type) {
                    case 'LABEL':
                        let labelField = fieldRow[i].label.replace(/<\s*[^>]*>/gi, '').replace(' ', '');
                        html = html + `<div class="field-${labelField}">`;
                        html = html + fieldRow[i].label;
                        html = html + '</div>';
                        break;

                    case 'SINGLE_LINE_TEXT':
                        
                        // console.log(fieldRow[i]);
                            // if ( (code && !code.hasOwnProperty('lookup') &&  code.expression == ' ') || (code && code.hasOwnProperty('lookup'))){
                                html = addLabel(html, code);
                                html = addSTextField(html, code);
                            // }
                
                        break;
                    case 'CALC':
                        html = addLabel(html, code);
                        html = addCalcField(html, code);
                        break;

                    case 'MULTI_LINE_TEXT':
                        html = addLabel(html, code);
                        html = addMTextField(html, code);
                        break;

                    case 'FILE':
                        html = addLabel(html, code);
                        html = addFileField(html, code);
                        break;

                    case 'DROP_DOWN':
                        html = addLabel(html, code);
                        html = addDropdownFeild(html, code);
                        break;

                    case 'CHECK_BOX':
                        html = addLabel(html, code);
                        html = addCboxField(html, code);
                        break;

                    case 'MULTI_SELECT':
                        html = addLabel(html, code);
                        html = addMSelectField(html, code);
                        break;

                    case 'RADIO_BUTTON':
                        html = addLabel(html, code);
                        html = addRadioField(html, code);
                        break;

                    case 'DATE':
                        html = addLabel(html, code);
                        html = addDateField(html, code);
                        break;

                    case 'TIME':
                        html = addLabel(html, code);
                        html = addTimeField(html, code);
                        break;

                    case 'DATETIME':
                        html = addLabel(html, code);
                        html = addDateTimeField(html, code);
                        break;

                    case 'NUMBER':
                         if ( (code && !code.hasOwnProperty('lookup')) || (code && code.hasOwnProperty('lookup'))){
                            html = addLabel(html, code);
                            html = addNumberField(html, code);
                        }
                        break;

                    case 'LINK':
                        html = addLabel(html, code);
                        html = addLinkField(html, code);
                        break;

                    // case 'CALC':
                    //     html = addLabel(html, code);
                    //     html = addCalcField(html, code, fields);
                    //     break;
                    case 'REFERENCE_TABLE':
                        if (event.auth == true || (event.auth == false && relateFieldsInfo[code.code].relateApiToken &&  relateFieldsInfo[code.code].relateApiToken == event.apiToken0 ) ){
                            html = addLabel(html, code);
                            html = addReTable(html, code);
                        }
                       break;
                }
                html = html + '</div>';
            }
            html = html + '</div>';
        }
        else if (layout.type == 'SUBTABLE') {
            let fieldTables = layout.fields;

            let table = `<table class="table mt-2 " id=${layout.code} data-code="${layout.code}" style="width:max-content">
                    <thead style="background: ${colorValue.backgroundColor.bcolor1}; color : ${colorValue.fontColor.fcolor1}" >
                      <tr>`;
            for (let i = 0; i < fieldTables.length; i++) {
                if (!fields[layout.code].fields.hasOwnProperty(fieldTables[i].code)){
                  continue;
                }
                if(['USER_SELECT','ORGANIZATION_SELECT','GROUP_SELECT','RICH_TEXT'].includes(fieldTables[i].type)){
                    continue;
                }
                let th = `<th class="chobiit-table-th"> ${getLabelFieldinTable(fieldTables[i].code,  fields[layout.code].fields)}</th>`;  
                table = table + th;
            }

            table = table + `</tr> </thead> <tbody id=${layout.code +'-body'}> <tr>`;
            for (let i = 0; i < fieldTables.length; i++) {
                let field = fieldTables[i];
                if (!fields[layout.code].fields.hasOwnProperty(field.code)){
                    continue;
                }
                
                let code = fields[layout.code].fields[field.code];
                // console.log('code: ' + JSON.stringify(code));

                switch (field.type) {
                    case 'SINGLE_LINE_TEXT':
                        // if ( (code && !code.hasOwnProperty('lookup')  &&  code.expression == ' ') || (code && code.hasOwnProperty('lookup'))){
                            table = table + '<td class="td-chobitone" >';
                            table = addSTextField(table, code, layout.code);
                            table = table + '</td>';
                        // }
                        break;
                    case 'CALC':
                       
                        table = table + '<td class="td-chobitone" >';
                        table = addCalcField(table, code, layout.code);
                        table = table + '</td>';
                        
                        break;

                    case 'MULTI_LINE_TEXT':
                        table = table + '<td class="td-chobitone" >';
                        table = addMTextField(table, code, layout.code);
                        table = table + '</td >';
                        break;

                    case 'MULTI_SELECT':
                        table = table + '<td class="td-chobitone" >';
                        table = addMSelectField(table, code, layout.code);
                        table = table + '</td>';
                        break;

                    case 'FILE':
                        table = table + '<td class="td-chobitone" >';
                        table = addFileField(table, code, layout.code);
                        table = table + '</td>';
                        break;

                    case 'DROP_DOWN':
                        table = table + '<td class="td-chobitone" >';
                        table = addDropdownFeild(table, code, layout.code);
                        table = table + '</td>';
                        break;

                    case 'CHECK_BOX':
                        table = table + '<td class="td-chobitone" >';
                        table = addCboxField(table, code, layout.code);
                        table = table + '</td>';
                        break;

                    case 'RADIO_BUTTON':
                        table = table + '<td class="td-chobitone" >';
                        table = addRadioField(table, code, layout.code);
                        table = table + '</td>';
                        break;

                    case 'DATE':
                        table = table + '<td class="td-chobitone" >';
                        table = addDateField(table, code, layout.code);
                        table = table + '</td>';
                        break;

                    case 'TIME':
                        table = table + '<td class="td-chobitone" >';
                        table = addTimeField(table, code, layout.code);
                        table = table + '</td>';
                        break;

                    case 'DATETIME':
                        table = table + '<td class="td-chobitone" >';
                        table = addDateTimeField(table, code, layout.code);
                        table = table + '</td>';
                        break;

                    case 'NUMBER':
                         if ( (code && !code.hasOwnProperty('lookup')) || (code && code.hasOwnProperty('lookup'))){
                            table = table + '<td class="td-chobitone" >';
                            table = addNumberField(table, code, layout.code);
                            table = table + '</td>';
                        }
                        break;

                    case 'LINK':
                        table = table + '<td class="td-chobitone" >';
                        table = addLinkField(table, code, layout.code);
                        table = table + '</td>';
                        break;

                }
            }
            //  fieldRow.parent().next().attr('id','file-info'+fieldRowId+''+i);
            // fieldRow.attr('onchange','$("#file-info'+fieldRowId+i+'").html(this.files[0].name)');
            // fieldRow.parent().next().html('');
            let opt = `<td style="border-top : 0px; border-bottom: 0px" class="table-add-row">
                <button type="button" class="btn btn-default ${'add-row-' + layout.code}">
                    <span style="font-size: 1.3em; color: ${colorValue.backgroundColor.bcolor1};"><i class="fas fa-plus-circle"></i></span>
                </button>
                <button type="button" class="btn btn-default ${'remove-row-' + layout.code}">
                    <span style="font-size: 1.3em; color: grey;"><i class="fas fa-minus-circle"></i></span>
                </button>
              </td>
              
              `;
            let script = `<script type="text/javascript">
                $(function () {
                    // tableRowIdの値のライフサイクル(特にいつ消えるかは)考慮する必要がある
                    let tableRowId = 0;
                    
                    $("${'.add-row-' + layout.code}").on("click", function(){  
                        tableRowId ++;
                        const $clickedAddRowButton = $(this)
                        addRowBelowClickedRow($clickedAddRowButton)
                    });
                    
                    $("${'.remove-row-' + layout.code}").on("click", function(){
                        const $clickedRemoveRowButton = $(this)
                        removeClickedRow($clickedRemoveRowButton)
                    });


                    function addRowBelowClickedRow($clickedAddRowButton){
                        const $clickedTableRow = $clickedAddRowButton.closest("tr")
                        // 以下のクローンの操作を, テーブル最初の要素をクローンしていたものから, クリックしたものをクローンするように変えた 
                        const $newRow = $clickedTableRow.clone(true);

                        initializeNewRow($newRow, $clickedAddRowButton, tableRowId)
                        $clickedTableRow.after($newRow);
                    }

                    function removeClickedRow($clickedRemoveRowButton){
                        if($('${'#' + layout.code +'-body'}').children("tr").length > 1){
                            const $clickedTableRow = $clickedRemoveRowButton.closest("tr")
                            $clickedTableRow.remove()
                        }
                    }

                    function initializeNewRow($newRow, $clickedAddRowButton, tableRowId){
                        removeErrorMessage($newRow)
                        clearRowContent($newRow)
                        updateWidget($newRow, tableRowId)
                        updateAttributes($newRow, tableRowId)
                        setDefaultValue($newRow, $clickedAddRowButton)
                    }

                    function removeErrorMessage($newRow){
                        $newRow.find('.alert').remove();
                    }

                    function clearRowContent($newRow){
                        $newRow.find('td').each(function(index, td) {
                            const $td = $(td);
                            const $formInputElements = $td.find(".kintone-data");
                            const dataType = $formInputElements.attr('data-type');
                            
                            switch(dataType){
                                case 'RADIO_BUTTON':
                                    // TODO: Kintoneの仕様により, ラジオボタンは必ず初期値(defaultvalue)を持っています.
                                    // そのため, この処理で行をクリアしなくても, 後の行の初期値設定で適切に初期化されます. 
                                    // しかし, 処理として存在する方が望ましいため, 後日対応を検討します. 
                                    break

                                case 'CHECK_BOX':
                                    $formInputElements.each(function(index, cbox){
                                        $(cbox).prop("checked", false);
                                    });
                                    break

                                case 'FILE':
                                    $formInputElements.parent().siblings().remove();
                                    break

                                case 'TIME':
                                case 'DATETIME':
                                case 'DATE':
                                    $formInputElements.val('');
                                    break

                                default:
                                    $formInputElements.val('');
                                    break
                                
                            }
                        })
                    }

                    function updateWidget($newRow, tableRowId){
                        $newRow.find('td').each(function(index, td) {
                            const $td = $(td);
                            const $formInputElements = $td.find('.kintone-data');
                            
                            const kintoneFieldCode = $formInputElements.attr('data-code');
                            const dataType = $formInputElements.attr('data-type');

                            switch(dataType){
                                case 'TIME':
                                case 'DATETIME':
                                case 'DATE':
                                    updateJquerySelector($td, kintoneFieldCode, tableRowId)
                                    break;
                                
                                // ルックアップのケースを書いていないが, ルックアップは設定によって異なり,
                                // SINGLE_LINE_TEXT か NUMBERに設定出来, 以下のフィールドに該当する
                                // https://cybozu.dev/ja/kintone/docs/overview/field-types/
                                case 'SINGLE_LINE_TEXT':
                                case 'MULTI_LINE_TEXT':
                                case 'NUMBER':
                                case 'CALC':
                                case 'RADIO_BUTTON':
                                case 'CHECK_BOX':
                                case 'MULTI_SElECT':
                                case 'DROP_DOWN':
                                case 'LINK':
                                case 'FILE':
                                    break;
                            }
                        }); 
                    }

                    function updateAttributes($newRow, tableRowId){
                        $newRow.find('td').each(function(index, td) {
                            const $td = $(td);
                            const $formInputElements = $td.find('.kintone-data');
                            const kintoneFieldCode = $formInputElements.attr('data-code');
                            const dataType = $formInputElements.attr('data-type');

                            switch(dataType){
                                case 'RADIO_BUTTON':
                                    $formInputElements.each(function(index, cbox){
                                        const id = $(cbox).attr('id');
                                        $(cbox).attr('name',kintoneFieldCode+''+tableRowId);
                                        $(cbox).attr('id',id+''+tableRowId);
                                        //ラジオボタン要素の直下にラベル要素があるので, そちらのfor属性を設定している
                                        $(cbox).next().attr('for',id+''+tableRowId);
                                    });
                                    break;

                                case 'CHECK_BOX':
                                    $formInputElements.each(function(index, cbox){
                                        const id = $(cbox).attr('id');
                                        $(cbox).attr('name',kintoneFieldCode+''+tableRowId);
                                        $(cbox).attr('id',id+''+tableRowId);
                                        $(cbox).next().attr('for',id+''+tableRowId);

                                    });
                                    break;

                                case 'FILE':
                                    $formInputElements.parent().attr('for',kintoneFieldCode+''+tableRowId);
                                    $formInputElements.attr('id',kintoneFieldCode+''+tableRowId);
                                    break;

                                case 'TIME':
                                case 'DATETIME':
                                case 'DATE':
                                    $formInputElements.attr('id',kintoneFieldCode+''+tableRowId);
                                    $formInputElements.attr('data-target','#' + kintoneFieldCode+''+tableRowId);
                                    break;

                                default:
                                    $formInputElements.attr('id',kintoneFieldCode+''+tableRowId);
                                    break;
                            }
                        }); 
                    }

                    function setDefaultValue($newRow, $clickedAddRowButton){
                        const $clickedTableElement = $clickedAddRowButton.closest("table")
                        const clickedTableFields = getClickedTableFields($clickedTableElement)

                        Object.values(clickedTableFields).forEach(clickedTableField => {
                            // defaultValueに何も値が設定されていない場合は " " のようにスペースが入る
                            if(clickedTableField.defaultValue === " "){
                                return; // forEachの中なので, continueの代わりにreturnを使用
                            }
                                
                            const fieldcode = clickedTableField.code
                            const fieldType = clickedTableField.type
                            const defaultValue = clickedTableField.defaultValue

                            switch(fieldType){
                                case "SINGLE_LINE_TEXT":
                                case "NUMBER":
                                case "CHECK_BOX":
                                case "DATE":
                                case "TIME":
                                case "DATETIME":
                                case "LINK":
                                    $newRow.find(\`input[data-code="\${fieldcode}"]\`).val(defaultValue)
                                    break

                                case "MULTI_LINE_TEXT":
                                    $newRow.find(\`textarea[data-code="\${fieldcode}"]\`).val(defaultValue)
                                    break

                                case "RADIO_BUTTON":
                                    $newRow.find(\`input[data-code="\${fieldcode}"][type="radio"][value="\${defaultValue}"]\`).prop("checked", true);
                                    break

                                case "MULTI_SELECT":
                                case "DROP_DOWN":
                                    $newRow.find(\`select[data-code="\${fieldcode}"]\`).val(defaultValue)
                                    break
                            }
                        })
                    }

                    function updateJquerySelector($td, kintoneFieldCode, tableRowId){
                        // tdにscript要素は一つしか存在せず, firstメソッドで取得する
                        const $scriptElement = $td.find("script").first()
                        const originalCode = $scriptElement.text()

                        // replace関数の正規表現の部分でエスケープ文字を多く使っている理由について説明します.
                        // 例えば正規表現で $ を扱う場合, この文字は特殊な文字なのでエスケープが必要であり,  \$ としなければなりません.
                        // さらに, このスクリプトは文字列として保存されているため、コードとして実行するには文字列からスクリプトにパースする必要があります.
                        // パース時にエスケープ処理されてしまい, エスケープ文字は一度取り除かれてしまうため, 
                        // これを回避するためにエスケープ文字自体もエスケープする必要があります.
                        // したがって, クライアント側のスクリプトで \$ としたい場合は,  \\$ と記述する必要があります.
                        const jquerySelectorRegex = /\\$\\((['"]).*?\\1\\)\\.datetimepicker/
                        const newJquerySelector = \`$("#\${kintoneFieldCode + String(tableRowId)}").datetimepicker\`
                        const updatedCode = originalCode.replace(jquerySelectorRegex, newJquerySelector);
                        $scriptElement.text(updatedCode)

                        const tdElement = jqueryObjectToDomElement($td)
                        const outerHTML = tdElement.outerHTML;
                        // outerHTML を使用して新しい要素を書き換えることにより, 元の要素に付随するイベントリスナーやその他の参照が解除されます.
                        // これは, 恐らくdatetimepickerなどの参照をリセットするのが目的だと考えられます.
                        $td.replaceWith($(outerHTML));
                    }

                    function jqueryObjectToDomElement($jqueryObject){
                        if (!$jqueryObject) {
                            console.error('[For Developers] Invalid input: The jQuery object is null or undefined.');
                            return null;
                        }
                        if (!isJqueryObject($jqueryObject)) {
                            console.error('[For Developers] Invalid input: expected a jQuery object.');
                            return null;
                        }
                        if ($jqueryObject.length === 0) {
                            console.warn('[For Developers] The jQuery object is empty.');
                            return null;
                        }

                        return $jqueryObject.get(0)
                    }

                    function isJqueryObject($jqueryObject){
                        return $jqueryObject instanceof jQuery
                    }

                    function getClickedTableFields($clickedTableElement){
                        const fields = getFieldsFromSessionStorage()
                        const clickedTableFieldcode = $clickedTableElement.attr("data-code"); 
                        const clickedTableFields = fields[clickedTableFieldcode].fields
                        return clickedTableFields
                    }

                    function getFieldsFromSessionStorage(){
                        const appSetting = JSON.parse(sessionStorage.getItem("appSetting"));
                        return appSetting.fields
                    }
                });
                      </script>`
            table = table  +opt;
            table = table + ' </tr> </tbody> </table>';
            
            let label = '';
            if (fields[layout.code].noLabel != true){
                label = `<label class="font-weight-bold" style="color: #283f56; width : 100%">  ${fields[layout.code].label} </label>` ;   
            }
            html = html + label + table + script;
        }
        else if (layout.type == 'GROUP') {
            let tab =
                `<div class="row field-${layout.code}">
      <div class ="col-md-12 mb-3">
      <button type="button" class="btn btn-default" id=${'button-'+layout.code}>
        <span style="font-size: 1.3em; color: #283f56;">
          <i class="fas fa-angle-right" id=${'hide-'+layout.code}></i>
          <i class="fas fa-angle-down" id=${'show-'+layout.code}></i>
            ${fields[layout.code].label}
        </span>
        
      </div>
      </div>`;

            let sTab = `
      <script type="text/javascript">
      $(function () {
         if (${fields[layout.code].openGroup == true} ){
             $('${'#hide-'+layout.code}').hide();   
        }else{
              $('${'#show-'+layout.code}').hide();      
        }
        
        $('${'#button-'+layout.code}').click(function(){
         if ($('${'#show-'+layout.code}').is(":hidden")){
           $('${'#show-'+layout.code}').show();
           $('${'#hide-'+layout.code}').hide();
         }else {
           $('${'#show-'+layout.code}').hide();
           $('${'#hide-'+layout.code}').show();
         }
         
         if ($('${'#'+layout.code}').is(":hidden")){
           $('${'#'+layout.code}').show();
         }else {
           $('${'#'+layout.code}').hide();
         }
         
       });
     });
     </script>`;
            console.log('openGroup: ',JSON.stringify(fields[layout.code], null, 2))
            tab = tab + `<div id="${layout.code}" class="kintone-group" style="display:${fields[layout.code].openGroup==true ? "block" : "none"}" >`;

            let fieldGrLayoutArr = layout.layout;
            for (let k = 0; k < fieldGrLayoutArr.length; k++) {
                let fieldGrLayout = fieldGrLayoutArr[k];
                if (fieldGrLayout.type == 'ROW') {
                    tab = tab + '<div class="row mb-3">';
                    let fieldRow = fieldGrLayout.fields;

                    for (let j = 0; j < fieldRow.length; j++) {
                        if (!fields.hasOwnProperty(fieldRow[j].code) && fieldRow[j].type != 'LABEL'){
                            continue;
                        }
                        let code = fields[fieldRow[j].code];
                        let fieldWidth = 0;
                        
                        if (fieldRow[j].hasOwnProperty('size')){
                            fieldWidth = fieldRow[j].size.width;
                        }
                        
                        //if (fieldRow[j].type == 'DATE'){
                            fieldWidth = parseInt(fieldWidth) + 20;
                        //}
                        if (fieldRow[j].type == 'REFERENCE_TABLE'){
                              tab = tab + `<div class="kintone-field-style">`;
                        }else {
                            tab = tab + `<div class="kintone-field-style" style="width: ${fieldWidth}px;">`;
                        }
                        switch (fieldRow[j].type) {
                            case 'LABEL':
                                // console.log('ok....')
                                let labelField = fieldRow[j].label.replace(/<\s*[^>]*>/gi, '').replace(' ', '');
                                tab = tab + `<div class="field-${labelField}" style="width: ${fieldRow[j].size.width}px ; padding-left: 15px">`;
                                tab = tab + fieldRow[j].label;
                                tab = tab + '</div>';
                                break;

                            case 'SINGLE_LINE_TEXT':
                                // if ( (code && !code.hasOwnProperty('lookup')  &&  code.expression == ' ') || (code && code.hasOwnProperty('lookup'))){
                                    tab = addLabel(tab, code);
                                    tab = addSTextField(tab, code);
                                // }
                                break;
                            case 'CALC':
                           
                                tab = addLabel(tab, code);
                                tab = addCalcField(tab, code);
                                
                                break;
                                
                            case 'REFERENCE_TABLE':
                                if (event.auth == true || (event.auth == false && relateFieldsInfo[code.code].relateApiToken  &&  relateFieldsInfo[code.code].relateApiToken == event.apiToken0)){
                                    tab = addLabel(tab, code);
                                    tab = addReTable(tab, code);
                                }
                            break;

                            case 'MULTI_LINE_TEXT':
                                tab = addLabel(tab, code);
                                tab = addMTextField(tab, code);
                                break;

                            case 'FILE':
                                tab = addLabel(tab, code);
                                tab = addFileField(tab, code);
                                break;

                            case 'DROP_DOWN':
                                tab = addLabel(tab, code);
                                tab = addDropdownFeild(tab, code);
                                break;

                            case 'CHECK_BOX':
                                tab = addLabel(tab, code);
                                tab = addCboxField(tab, code);
                                break;

                            case 'MULTI_SELECT':
                                tab = addLabel(tab, code);
                                tab = addMSelectField(tab, code);
                                break;

                            case 'RADIO_BUTTON':
                                tab = addLabel(tab, code);
                                tab = addRadioField(tab, code);
                                break;

                            case 'DATE':
                                tab = addLabel(tab, code);
                                tab = addDateField(tab, code);
                                break;

                            case 'TIME':
                                tab = addLabel(tab, code);
                                tab = addTimeField(tab, code);
                                break;

                            case 'DATETIME':
                                tab = addLabel(tab, code);
                                tab = addDateTimeField(tab, code);
                                break;

                            case 'NUMBER':
                                 if ( (code && !code.hasOwnProperty('lookup')) || (code && code.hasOwnProperty('lookup'))){
                                    tab = addLabel(tab, code);
                                    tab = addNumberField(tab, code);
                                }
                                break;

                            case 'LINK':
                                tab = addLabel(tab, code);
                                tab = addLinkField(tab, code);
                                break;
                        }
                        tab = tab + '</div>';
                    }
                    tab = tab + '</div>';
                }
            }

            tab = tab + '</div>';

            html = html + '<div class="border" style="margin-right: 15px; margin-top: 15px; padding: 15px; border-radius: .25rem;">' + tab + sTab + '</div>';
        }
    }
    html = html + '</form> </div> </body> </html>';

    //作成したHTMLファイルをs3にpostする。
  
    
    let randomStr = Math.random().toString(36).substr(2, 26);
    
    let params = {
        Key: `public/${domain.split('.')[0]}/form/${randomStr}.html`,
        Body: html,
        ContentType: 'text/html'
    };

    let formUrl = `https://${domain.substr(0, domain.indexOf('.'))}.${CHOBIIT_DOMAIN_NAME}/form/${randomStr}.html`
    
    
    async function handleBeforeCreate(){
         console.log('starting get form url exist............');
        let getParams = {
            TableName: TABLE_NAME,
            Key:{
                domain : event.domain,
                app : event.app
            }
        };
        
        let getResp = await dynamo.get(getParams).promise();
        console.log('get form url resp : ' + JSON.stringify(getResp, null, 2));
        
        if (getResp.Item && getResp.Item.formUrl){
            let url =  getResp.Item.formUrl;
             
            let s3Key = 'public/'+ domain.split('.')[0] + '/' + url.substr(url.indexOf('form'), url.length);
            
            let deleteParams = {
                Key: s3Key
            };
            
            let deleteResp = await s3Bucket.deleteObject(deleteParams).promise();
            console.log('delete s3 object resp: '+JSON.stringify(deleteResp, null, 2));
            
        }
    }
    
    handleBeforeCreate()
    .then(function(){
        // put object to s3 
        return s3Bucket.putObject(params, (error, data) => {
            if (error){
                handleError(error, callback )
            }else {
                console.log('put to s3 succeeded')
                putFormUrlToDyanmo(formUrl);
            }
        });
    })
    .catch(err => {
        handleError(err, callback)
    })

   
    
    function putFormUrlToDyanmo(formUrl){
        var params = {
            TableName: TABLE_NAME,
            Key:{
                domain : domain,
                app : app
            },
            UpdateExpression: "set formUrl = :fr",
            ExpressionAttributeValues:{
                ":fr": formUrl
            },
            ReturnValues:"UPDATED_NEW"
        };
        
        console.log("Updating form url to dynamo.");
        dynamo.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update form url. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Update form url succeeded:", JSON.stringify(data, null, 2));
            }
        });
    }
    
    function getLabelFieldinTable(fieldCode, formfield) {
        console.log('fieldcode : ' + fieldCode);
        console.log('formfield : ' + JSON.stringify(formfield));
        
        return (formfield[fieldCode].label);
    }
    
    function addLabel(html, code) {
        let label = `<label class="font-weight-bold" style="color: #283f56; width : 100%">  ${code.noLabel == true ? "" : code.label} ${code.required == true ? '<span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>' : ''}</label>`
        return html  +label;
    }

    /**
     * 文字列フィールドの作成
     */
    function addSTextField(html, code, referenceCode = false) {
        if (code.hasOwnProperty('lookup')){
            console.log('lookup field: ', code.code);
            let temp = `<div class="field-${code.code} row">
                <div class="col-md-6 col-6">
                   <input type="text" class="form-control kintone-data" placeholder="" id=${code.code} ${code.required == true ? 'required' : ''}  ${code.unique == true ? 'unique' : ''}
                    data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} >
                </div>
                <div class="col-md-6 col-6 mt-2 lookup-group">
                    <span class="lookup-action mr-2 lk-lookup" data-code="${code.code}">${localeService.translate("common", "lookup")}</span>
                    <span class="lookup-action lk-clear" data-code="${code.code}">${localeService.translate("common", "clear")}</span>
                </div>
            </div>`
            return html + temp ;
        }else if (code.expression !== ' '){
            const expression = code.hideExpression === true  ? '' : escapeSpecialCharacters(code.expression);
            let inputField = `<div class="field-${code.code}"><input  disabled type="text" class="form-control kintone-data" placeholder="${expression}" id=${code.code} data-code=${code.code} data-type="CALC" data-protocol=${code.protocol} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} ></div>`; 
            return html + inputField;
        }else{
            let inputField = `<div class="field-${code.code}"><input type="text" class="form-control kintone-data" value =  "${code.defaultValue != ' ' ? code.defaultValue : ''}" id=${code.code} ${code.required == true ? 'required' : ''}  ${code.unique == true ? 'unique' : ''}
            data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} ></div>`
            return html + inputField;
        }
    }
    
    function addReTable(html, code) {
        if (!code.referenceTable) return html;
        html = html + `<div class="field-${code.code}">`;
        let referenceTable = code.referenceTable;
        let relateInfo = relateFieldsInfo[code.code].displayFieldsInfo;
        let table = `<table class="table  table-striped table-bordered" style="width: max-content" id=${code.code} data-code="${code.code}" data-type="${code.type}">
                    <thead>
                      <tr>`;
        referenceTable.displayFields.forEach(field => {
            table = table + `<th>${relateInfo.find(x => x.code ==field).label}</th>`;
        })
        
        table = table + `</tr></thead><tbody>
        <tr>
            <td class="td-relate" colspan="${referenceTable.displayFields.length}">${localeService.translate("info", "no-record-available")}</td>
        </tr> </tbody></table>`;
        return html + table + `</div>`;
        
    }
    
    function addMTextField(html, code, referenceCode = false) {
        html = html + `<div class="field-${code.code}">`;
        let input = `<textarea class="form-control kintone-data" rows="3" placeholder="" id=${code.code} ${code.required == true ? 'required' : ''}
            data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} >${code.defaultValue != ' '? code.defaultValue : ''}</textarea>`;
        
        return html + input + '</div>';
    }
    
    function addCboxField(html, code, referenceCode = false) {
        html = html + `<div class="field-${code.code}">`;
        let option = code.options;
        let opt = `<div class=${code.code + '-cbox'}>`;
        let objK = Object.values(option)
                    .sort((a,b) => parseInt(a.index) - parseInt(b.index))
                    .map(x => x.label);
    
        if (code.required == true) {
            for (let i = 0; i < objK.length; i++) {
                let o = `<div class="custom-control custom-checkbox  ${code.align == "HORIZONTAL" ? 'custom-control-inline' : ''}">
                            <input type="checkbox" class="custom-control-input kintone-data" ${code.defaultValue.includes(objK[i]) ? 'checked' : ''} id=${code.code + '' + i} name=${code.code} required value="${objK[i]}"
                                data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''}">
                            <label class="custom-control-label" for=${code.code + '' + i}>${objK[i]}</label>
                        </div>`;
                opt = opt + o;
            }
            opt = opt + `
            <script type="text/javascript">
                $(function () {
                    var requiredCheckboxes = $('${'.' + code.code + '-cbox'} :checkbox[required]');
                    requiredCheckboxes.change(function(){
                        if(requiredCheckboxes.is(':checked')) {
                            requiredCheckboxes.removeAttr('required');
                        } else {
                            requiredCheckboxes.attr('required', 'required');
                        }
                    });
                });
            </script> `;
        }
        else {
            for (let i = 0; i < objK.length; i++) {
                let o = `<div class="custom-control custom-checkbox  ${code.align == "HORIZONTAL" ? 'custom-control-inline' : ''}">
                            <input type="checkbox" class="custom-control-input kintone-data"  ${code.defaultValue.includes(objK[i]) ? 'checked' : ''} id=${code.code + '' + i} name=${code.code} value="${objK[i]}"
                                data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} ">
                            <label class="custom-control-label" for=${code.code + '' + i}>${objK[i]}</label>
                        </div>`;
                opt = opt + o;
            }
        }
        return html +  opt + '</div> </div>';
    }
    
    function addMSelectField(html, code, referenceCode = false) {
        html = html + `<div class="field-${code.code}">`;
        let option = code.options;
        let opt = '';
        let objK = Object.values(option)
                    .sort((a,b) => parseInt(a.index) - parseInt(b.index))
                    .map(x => x.label);
        for (let i = 0; i < objK.length; i++) {
            let o = `<option ${code.defaultValue.includes(objK[i]) ? 'selected' : ''} value="${objK[i]}" >${objK[i]}</option>`;
            opt = opt + o;
        }
        let select = `<select multiple class="form-control kintone-data" id=${code.code} ${code.required == true ? 'required' : ''}
                        data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''}
                    >
                        ${opt}
                    </select>`;
                    
        return html + select + '</div>';
    }
    /**
     * 添付ファイルの追加
     */
    function addFileField(html, code, referenceCode = false) {
        console.log('file field button: ' + JSON.stringify(colorValue));
        html = html + `<div class="field-${code.code} file-space-chobitone">`;
        let input = `<div class="">
                        <label class="btn  file-upload-button"  for=${code.code} >
                            <input id=${code.code}  multiple="multiple" class="kintone-data" type="file" style="display:none"  ${code.required == true ? 'required' : ''}
                                data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''}
                            ><i class="fas fa-upload"></i> ${localeService.translate("common", "choose-file")}
                        </label>
                       
                    </div> `;
        return html + input + '</div>';
    }
    
    function addDropdownFeild(html, code, referenceCode = false) {
        html = html + `<div class="field-${code.code}">`;
        let option = code.options;
        let opt = '<option value></option>';
        //let objK = Object.keys(option);
        let objK = Object.values(option)
                    .sort((a,b) => parseInt(a.index) - parseInt(b.index))
                    .map(x => x.label);
        for (let i = 0; i < objK.length; i++) {
            let o = `<option ${code.defaultValue == objK[i] ? 'selected' : ''} value="${objK[i]}"> ${objK[i]}</option>`;
            opt = opt + o;
        }
        let select = `
            <select class="custom-select d-block w-100 kintone-data" id=${code.code} ${code.required == true ? 'required' : ''}
                data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} >
                ${opt}
            </select> `;
        
        return html + select + '</div>';
    }
    
    function addRadioField(html, code, referenceCode = false) {
        html = html + `<div class="field-${code.code}">`;
        let option = code.options;
        let opt = '';
        let objK = Object.values(option)
                    .sort((a,b) => parseInt(a.index) - parseInt(b.index))
                    .map(x => x.label);
        for (let i = 0; i < objK.length; i++) {
            let o = `<div class="custom-control custom-radio ${code.align == "HORIZONTAL" ? 'custom-control-inline' : ''}">
                      <input id=${code.code + '' + i} ${code.defaultValue == objK[i] ? 'checked' : ''} name=${code.code} type="radio" class="custom-control-input kintone-data" value="${objK[i]}"
                        data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} >
                      <label class="custom-control-label" for=${code.code + '' + i}>${objK[i]}</label>
                  </div>`;
            opt = opt + o;
        }
        return html + opt + '</div>';
    }
    
    function addDateField(html, code, referenceCode = false) {
        html = html + `<div class="field-${code.code}">`;
        
        let i0 = `<input type="text" class="form-control kintone-data" id=${code.code} ${code.required == true ? 'required' : ''} ${code.unique == true ? 'unique' : ''}
            data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} >`;
        
        
        let input;
        if (code.defaultNowValue == true){
            input= i0 + `
                        <script type="text/javascript">
                          $(function () {
                           
                                $("${'#'+code.code}").datetimepicker({
                                      format: 'YYYY-MM-DD',
                                      locale: '${process.env.CHOBIIT_LANG}',
                                      icons: {
                                                time: 'fas fa-clock',
                                                date: 'fas fa-calendar',
                                        },
                                     defaultDate:new Date()
                                });
                          
                          });
                        </script>`;
        }else if (code.defaultValue != " "){
             input= i0 + `
                        <script type="text/javascript">
                          $(function () {
                           
                                $("${'#'+code.code}").datetimepicker({
                                      format: 'YYYY-MM-DD',
                                      locale: '${process.env.CHOBIIT_LANG}',
                                      icons: {
                                                time: 'fas fa-clock',
                                                date: 'fas fa-calendar',
                                        },
                                     defaultDate:new Date("${code.defaultValue}")
                                });
                          
                          });
                        </script>`;
        }else{
            input= i0 + `
                        <script type="text/javascript">
                          $(function () {
                           
                                $("${'#'+code.code}").datetimepicker({
                                      format: 'YYYY-MM-DD',
                                      locale: '${process.env.CHOBIIT_LANG}',
                                      icons: {
                                                time: 'fas fa-clock',
                                                date: 'fas fa-calendar',
                                        }
                                });
                          
                          });
                        </script>`;
        }
        return html + '<div class="controls" style="position: relative">' + input + '</div> </div>';
    }
    
    function addTimeField(html, code, referenceCode = false) {
        html = html + `<div class="field-${code.code}">`;
        let i0 = `<input type="text" class="form-control datetimepicker-input kintone-data" id=${code.code} data-toggle="datetimepicker" data-target=${'#'+code.code} ${code.required == true ? 'required' : ''} ${code.unique == true ? 'unique' : ''}
            data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} >`;
        
        console.log('code: ',JSON.stringify(code));
        let input;
        if (code.defaultNowValue == true){
              input= i0 + `
                    <script type="text/javascript">
                        $(function () {
                                $("${'#'+code.code}").datetimepicker({
                                    format: '${LocaleService.getTimeFormat()}',
                                    ${process.env.CHOBIIT_LANG === "ja" ? "locale: 'ja'," : ""}
                                     icons: {
                                        time: 'fas fa-clock',
                                        date: 'fas fa-calendar',
                                    },
                                     defaultDate:new Date()
                                });
                        });
                    </script>`;    
        }else if (code.defaultValue != " "){
            input= i0 + `
                    <script type="text/javascript">
                        $(function () {
                                $("${'#'+code.code}").datetimepicker({
                                    format: '${LocaleService.getTimeFormat()}',
                                    ${process.env.CHOBIIT_LANG === "ja" ? "locale: 'ja'," : ""}
                                     icons: {
                                        time: 'fas fa-clock',
                                        date: 'fas fa-calendar',
                                    },
                                     defaultDate:new Date("2019/04/21 ${code.defaultValue}")
                                });
                        });
                    </script>`; 
        }else {
             input= i0 + `
                    <script type="text/javascript">
                        $(function () {
                                $("${'#'+code.code}").datetimepicker({
                                    format: '${LocaleService.getTimeFormat()}',
                                    ${process.env.CHOBIIT_LANG === "ja" ? "locale: 'ja'," : ""}
                                     icons: {
                                        time: 'fas fa-clock',
                                        date: 'fas fa-calendar',
                                    }
                                });
                        });
                    </script>`; 
        }
        return html + '<div class="controls" style="position: relative">' + input + '</div> </div>';
    }
    
    function addDateTimeField(html, code, referenceCode = false) {
        html = html + `<div class="field-${code.code}">`;
        let i0 = `<input type="text" class="form-control datetimepicker-input kintone-data" id=${code.code} data-toggle="datetimepicker" data-target=${'#'+code.code} ${code.required == true ? 'required' : ''} ${code.unique == true ? 'unique' : ''}
            data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} >`;
        
        let input;
        if (code.defaultNowValue == true){
            input = i0 + `
                    <script type="text/javascript">
                        $(function () {
                           
                                $("${'#'+code.code}").datetimepicker({
                                    format: 'YYYY-MM-DD ${LocaleService.getTimeFormat()}',
                                    ${process.env.CHOBIIT_LANG === "ja" ? "locale: 'ja'," : ""}
                                     icons: {
                                        time: 'fas fa-clock',
                                        date: 'fas fa-calendar',
                                    },
                                    defaultDate: new Date()
                                });
                      
                        });
                    </script>`;
        }else if(code.defaultValue != " "){
            input = i0 + `
                    <script type="text/javascript">
                        $(function () {
                           
                                $("${'#'+code.code}").datetimepicker({
                                    format: 'YYYY-MM-DD ${LocaleService.getTimeFormat()}',
                                    ${process.env.CHOBIIT_LANG === "ja" ? "locale: 'ja'," : ""}
                                     icons: {
                                        time: 'fas fa-clock',
                                        date: 'fas fa-calendar',
                                    },
                                    defaultDate: new Date("${code.defaultValue}")
                                });
                      
                        });
                    </script>`;
            
        }else {
            input = i0 + `
                    <script type="text/javascript">
                        $(function () {
                           
                                $("${'#'+code.code}").datetimepicker({
                                    format: 'YYYY-MM-DD ${LocaleService.getTimeFormat()}',
                                    ${process.env.CHOBIIT_LANG === "ja" ? "locale: 'ja'," : ""}
                                     icons: {
                                        time: 'fas fa-clock',
                                        date: 'fas fa-calendar',
                                    },
                                });
                      
                        });
                    </script>`;
        }
        return html + '<div class="controls" style="position: relative">' + input + '</div> </div>';
    }
    
    function addNumberField(html, code, referenceCode = false) {
        let beforeInput ="";
        let afterInput="";
        if (code.unit !==" " && code.unitPosition == "BEFORE"){
            beforeInput = `<div style="margin-right: 0.5rem">${code.unit}</div>`
        } else if(code.unit !==" " && code.unitPosition == "AFTER"){
            afterInput = `<div style="margin-left: 0.5rem">${code.unit}</div>`
        }
        if (code.hasOwnProperty('lookup')){
            let temp = `
            <div class="field-${code.code} row" style="display: flex;align-items: center;">
                ${beforeInput}
                <div class="col-md-6 col-6">
                   <input type="text" class="form-control kintone-data" placeholder="" id=${code.code} ${code.required == true ? 'required' : ''} ${code.unique == true ? 'unique' : ''}
                        data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} >
                </div>
                ${afterInput}
                <div class="col-md-6 col-6 mt-2 lookup-group">
                    <span class="lookup-action mr-2 lk-lookup" data-code="${code.code}">${localeService.translate("common", "lookup")}</span>
                    <span class="lookup-action lk-clear" data-code="${code.code}">${localeService.translate("common", "clear")}</span>
                </div>
            </div>`
            return html + temp ;
        }else{
            html = html + `<div class="field-${code.code}" style="display: flex;align-items: center;">`;
            let input = `<input type="text" value="${code.defaultValue != ' ' ? code.defaultValue : ''}" class="form-control kintone-data" placeholder="" id=${code.code} ${code.required == true ? 'required' : ''} ${code.unique == true ? 'unique' : ''}
            data-code=${code.code} data-type=${code.type} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} >`
            return html + beforeInput + input + afterInput + '</div>';
        }
    }

    /**
     * 計算フィールドの作成
     */
    function addCalcField(html, code,  referenceCode = false) {
        const expression = code.hideExpression === true  ? '' : escapeSpecialCharacters(code.expression);
        const inputField = `<div class="field-${code.code}"><input  disabled type="text" class="form-control kintone-data" placeholder="${expression}" id=${code.code} data-code=${code.code} data-type=${code.type} data-protocol=${code.protocol} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} ></div>`;
        return html + inputField;
    }
    
    function addLinkField(html, code, referenceCode = false) {
        let type;
        if (code.protocol == "WEB") type = "url";
        if (code.protocol == "CALL") type = "tel";
        if (code.protocol == "MAIL") type = "email";
            
        html = html + `<div class="field-${code.code}">`;
        let i0 = `<input type="${type}"  value="${code.defaultValue != ' ' ? code.defaultValue : ''}" class="form-control kintone-data" placeholder="" id=${code.code} ${code.required == true ? 'required' : ''} ${code.unique == true ? 'unique' : ''}
            data-code=${code.code} data-type=${code.type} data-protocol=${code.protocol} data-label=${code.label} ${referenceCode ? `data-reference="${referenceCode}"` : ''} >`;
        
        return html + i0 + '</div>';
    }
};

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

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'create form success',
        data: data
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(err,  callback) {
    console.log('Handle error:', JSON.stringify(err.message || err, null, 2));
   

    let body = {
        code: 400,
        message: err.message
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };

    callback(null, response);
}

/**
 * 文字列をエスケープ文字に変換する
 * 計算式をplaceholderに設定する際に使用する
 */
function escapeSpecialCharacters(text) {
    return text.replace(/[<>&" ]/g, (specialCharacter) => {
        switch(specialCharacter){
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '&':
                return '&amp;';
            case '"':
                return '&quot;';
            case ' ':
                return '&nbsp;';
            default:
                return specialCharacter;
        }
    })
}
