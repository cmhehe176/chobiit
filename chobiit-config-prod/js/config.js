import { LocalConfig } from './domain/local-config';
import { ListViewConfigService } from './service/list-view-config-service';
import { CreateAndUpdateProgressMeterPopup } from './ui/progress-meter-popup'
import { validateCsvFile } from './service/validate-csv-file'
import { readFile } from './service/read-file'
import { CSVToArray } from './service/csv-to-array'
import { datasFormat } from './service/datas-format';
import { getAllIndexes } from './service/get-all-indexes';
import { maxUser } from './service/max-user';
import { isAlphanumeric } from './service/is-alphanumeric';
import { confirmChobiitUserImport } from './ui/confirm-chobiit-user-import';
import { makeUserList } from './service/make-user-list';
import { isHalfWidthSymbol } from './service/is-half-width-symbol';
import { HtmlString } from './class/HtmlString';
import { AjaxResponseHandler } from './service/ajax-handler';
import { AjaxErrorHandler } from './service/ajax-handler';

jQuery.noConflict();

const LocaleService = require('chobiit-common/src/application/locale-service').default;
const localeService = LocaleService.getInstance("config");

/**
 * 
 * @param {string} key 
 * @param {Record<string, any> | undefined} option 
 * @returns {string}
 */
const translateInfo = (key, option) => localeService.translate("info", key, option);

/**
 * 
 * @param {string} key 
 * @param {Record<string, any> | undefined} option 
 * @returns {string}
 */
const translateCommon = (key, option) => localeService.translate("common", key, option);

/**
 * 
 * @param {string} key 
 * @param {Record<string, any> | undefined} option 
 * @returns {string}
 */
const translateError = (key, option) => localeService.translate("error", key, option);

const {ADD_ROW_BUTTON, REMOVE_ROW_BUTTON} = require("./components/button");
const { KintoneListViewTable } = require('./ui/kintone-list-view-table');
const { ViewSettingsStore } = require('./view-settings-store');
const view = new ViewSettingsStore();

(async function ($, PLUGIN_ID) {
    "use strict";

    const CHOBIIT_BACKEND_BASE_URL = process.env.CHOBIIT_BACKEND_BASE_URL;
    const CHOBIIT_CONFIG_S3_BUCKET_BASE_URL = process.env.CHOBIIT_CONFIG_S3_BUCKET_BASE_URL;
    
    const loginNameRegex =  /^\S{1,}$/;

    const domainRegex = /(?=^.{1,254}$)(^(?:(?!\d+\.|-)[a-zA-Z0-9_\-]{1,63}(?<!-)\.?)+(?:[a-zA-Z]{2,})$)/;

        ///Vars-----------------------------------------
    const FIELDLIST = ['NUMBER',  'CHECK_BOX', 'RADIO_BUTTON', 'DROP_DOWN', 'MULTI_SELECT', 'FILE', 'RICH_TEXT', 'LINK', 'MULTI_LINE_TEXT', 'SINGLE_LINE_TEXT', 'DATE', 'TIME', 'DATETIME','CALC', 'STATUS', 'GROUP']
    const COPY_FROM_TYPE = [
        'SINGLE_LINE_TEXT',
        'NUMBER',
        'LINK',
        'MULTI_LINE_TEXT',
        'CHECK_BOX',
        'RADIO_BUTTON',
        'DROP_DOWN',
        'MULTI_SELECT',
        'DATE',
        'TIME',
        'DATETIME',
        'RECORD_NUMBER'
    ];

    var COPY_TO_TYPE = {
        'SINGLE_LINE_TEXT': ['SINGLE_LINE_TEXT', 'NUMBER', 'LINK', 'DROP_DOWN', 'RADIO_BUTTON', 'MULTI_LINE_TEXT'],
        'NUMBER': ['SINGLE_LINE_TEXT', 'NUMBER', 'MULTI_LINE_TEXT'],
        'LINK': ['SINGLE_LINE_TEXT', 'LINK', 'MULTI_LINE_TEXT'],
        'MULTI_LINE_TEXT': ['MULTI_LINE_TEXT'],
        'RICH_TEXT': ['RICH_TEXT', 'MULTI_LINE_TEXT'],
        'CHECK_BOX': ['CHECK_BOX', 'MULTI_SELECT'],
        'RADIO_BUTTON': ['DROP_DOWN', 'RADIO_BUTTON', 'SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT'],
        'DROP_DOWN': ['DROP_DOWN', 'RADIO_BUTTON', 'SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT'],
        'MULTI_SELECT': ['CHECK_BOX', 'MULTI_SELECT'],
        'DATE': ['DATE', 'SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT'],
        'TIME': ['TIME', 'SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT'],
        'DATETIME': ['DATETIME'],
        'USER_SELECT': ['USER_SELECT'],
        'CALC': ['NUMBER', 'SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT'],
        'CREATED_TIME': ['DATETIME'],
        'UPDATED_TIME': ['DATETIME'],
        'RECORD_NUMBER': ['NUMBER', "SINGLE_LINE_TEXT", "MULTI_LINE_TEXT"],
        'SUBTABLE': ['SUBTABLE'],

    };

    var update_to_field_type = [
        'SINGLE_LINE_TEXT',
        'NUMBER',
        'LINK',
        'MULTI_LINE_TEXT',
        'CHECK_BOX',
        'RADIO_BUTTON',
        'DROP_DOWN',
        'MULTI_SELECT',
        'DATE',
        'TIME',
        'DATETIME',
        'SUBTABLE',
    ];

    var update_from_field_type = {
        'SINGLE_LINE_TEXT': ['SINGLE_LINE_TEXT', 'NUMBER', 'LINK', 'DROP_DOWN', 'RADIO_BUTTON', 'RECORD_NUMBER', 'DATE', 'TIME', 'DATETIME'],
        'NUMBER': [ 'NUMBER', 'RECORD_NUMBER'],
        'LINK': ['LINK'],
        'MULTI_LINE_TEXT': ['MULTI_LINE_TEXT'],
        'CHECK_BOX': ['CHECK_BOX', 'MULTI_SELECT'],
        'RADIO_BUTTON': ['DROP_DOWN', 'RADIO_BUTTON', 'SINGLE_LINE_TEXT'],
        'DROP_DOWN': ['DROP_DOWN', 'RADIO_BUTTON', 'SINGLE_LINE_TEXT'],
        'MULTI_SELECT': ['CHECK_BOX', 'MULTI_SELECT'],
        'DATE': ['DATE'],
        'TIME': ['TIME'],
        'DATETIME': ['DATETIME','CREATED_TIME', 'UPDATED_TIME'],
        'SUBTABLE': ['SUBTABLE'],
    };


    const domain = window.location.host.replace('.s.','.');
    const configApi = {}

    configApi['getConfig'] = CHOBIIT_BACKEND_BASE_URL + '/config';
    configApi['getConfigUsers'] = CHOBIIT_BACKEND_BASE_URL + '/config-users';
    configApi['storeErr'] = CHOBIIT_BACKEND_BASE_URL + '/error';
    configApi['putKintoneUser'] = CHOBIIT_BACKEND_BASE_URL+'/kintone-user';
    configApi['deleteKintoneUser'] = CHOBIIT_BACKEND_BASE_URL + '/kintone-user';
    configApi['manageApp'] = CHOBIIT_BACKEND_BASE_URL+ '/app-manage';
    configApi['createForm'] = CHOBIIT_BACKEND_BASE_URL+'/form';
    configApi['deleteApp'] = CHOBIIT_BACKEND_BASE_URL + '/delete-app';
    configApi['createUser'] = CHOBIIT_BACKEND_BASE_URL + '/chobitone-user-create';
    configApi['deleteUser'] = CHOBIIT_BACKEND_BASE_URL + '/chobitone-user-delete';
    configApi['updateUser'] = CHOBIIT_BACKEND_BASE_URL + '/chobitone-user-update';
    configApi['createGroup'] = CHOBIIT_BACKEND_BASE_URL + '/group';
    configApi['deleteGroup'] = CHOBIIT_BACKEND_BASE_URL + '/group';
    configApi['createDistribution'] = CHOBIIT_BACKEND_BASE_URL+'/domain';
    configApi['getDistribution'] = CHOBIIT_BACKEND_BASE_URL+'/cloudfront';
    configApi['uploadCustomFile'] = CHOBIIT_BACKEND_BASE_URL+'/custom-file';
    configApi['sendMail'] = CHOBIIT_BACKEND_BASE_URL+'/mail';
    configApi['existUser'] = CHOBIIT_BACKEND_BASE_URL+'/chobitone/exist-user';
    configApi['createCloudFrontInvalidation'] = CHOBIIT_BACKEND_BASE_URL+'/cloudfront/caches';
    configApi['deleteUsers'] = CHOBIIT_BACKEND_BASE_URL + '/chobiit-delete-users';
    configApi['deleteGroups'] = CHOBIIT_BACKEND_BASE_URL + '/chobiit-delete-groups';
    /**
     * TODO: この関数についての説明を書き忘れている 
     * 以下の改修分での変更点
     * https://noveldev.backlog.com/view/CHOBIIT-56
     */
    configApi['checkUserOperateType'] = `${CHOBIIT_BACKEND_BASE_URL}/chobitone/check-user-operate-type`

    const _detailRecordBtn = `<button  title="${translateInfo("record-detail-button")}" class="btn" style="border: none;background: none;"><i class="far fa-file-alt detail-record small-btn"></i></button>`;
    const checkboxDeleteGroup = `<input type="checkbox" class="checked-group">`;
    const checkboxDeleteUser = `<input type="checkbox" class="checked-user">`;
    const editRecordBtn = `<button title="${translateInfo("edit-record-button")}" class="btn edit-record" style="border: none;background: none;"><i class="far fa-edit  small-btn"></i></button>`;
    const deleteRecordBtn = `<button title="${translateInfo("delete-record-button")}" class="btn delete-record "  style="border: none;background: none;"><i class="far fa-trash-alt small-btn"></i></button>`;
    const putDynamoBtn = `<button title="${translateInfo("reflect-in-chobiit-button")}" class="btn put-dynamo"  style="border: none;background: none;"><i class="fas fa-cloud-upload-alt  small-btn"></i></button>`;
    const requireIcon = `<span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>`;
    const saveLoadingBtn = `<i class="fas fa-spinner fa-spin"></i> ${translateInfo("save-loading-button")}`;
    const loadingBtn = `<i class="fas fa-spinner fa-spin"></i> `;
    const changePasswordBtn = `<div class="btn-group float-right pb-1" role="group"><a class="btn btn-light btn-sm change-password" href="#" style="font-weight: 600;"><i class="far fa-edit"></i> ${translateInfo("change-password-button")}</a>`;

    //domain 取得
    let login_url =  getChobiitLoginUrl();
    let appSettingId = kintone.app.getId();
    //-------------------------------------------------------------------------

    let tab = ` 
        <ul class="nav nav-tabs ml-4 mb-5" role="tablist">
            <li class="nav-item">
                <a class="nav-link" id="common-setting-tab" data-toggle="pill" href="#common-setting" role="tab" aria-controls="v-pills-common" aria-selected="false"><i class="fas fa-cog"></i> ${translateInfo("common-setting-tab")}</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="kintone-setting-tab" data-toggle="pill" href="#kintone-setting" role="tab" aria-controls="v-pills-kintone" aria-selected="false"><i class="fas fa-cloud"></i> ${translateInfo("kintone-setting-tab")}</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="app-setting-tab" data-toggle="pill" href="#app-setting" role="tab" aria-controls="v-pills-app" aria-selected="false"><i class="fas fa-folder"></i> ${translateInfo("app-setting-tab")}</a>
            </li>
           
            <li class="nav-item">
                <a class="nav-link" id="user-setting-tab" data-toggle="pill" href="#user-setting" role="tab" aria-controls="v-pills-user" aria-selected="false"><i class="fas fa-user-cog"></i> ${translateInfo("user-setting-tab")}</a>
            </li>

            <li class="nav-item">
                <a class="nav-link" id="group-setting-tab" data-toggle="pill" href="#group-setting" role="tab" aria-controls="v-pills-user" aria-selected="false"><i class="fas fa-users"></i>${translateInfo("group-setting-tab")}</a>
            </li>

            <li class="nav-item">
             <a class="nav-link active show" id="licence-setting-tab" data-toggle="pill" href="#licence-setting" role="tab" aria-controls="v-pills-licence" aria-selected="true"><i class="fas fa-key"></i> ${translateInfo("license-setting-tab")}</a>
            </li>
        </ul>

    <div>
    
            <div class="tab-content ml-4" id="v-pills-tabContent" style=" max-width:1070px">
                <div class="tab-pane fade" id="common-setting" role="tabpanel" aria-labelledby="v-pills-home-tab">
                    <span id="common-request"class="badge badge-pill badge-warning" style="font-size: 100%;">${translateInfo("total-request-counts")}: 0</span>

                    <div class="bs-callout bs-callout-info" style="margin: 1rem 0rem 1rem 0rem">
                        <p>${translateInfo("display-setting-description")}</p>
                        <img src="${CHOBIIT_CONFIG_S3_BUCKET_BASE_URL}/ChobiitGuide.png" class="img-fluid" alt="Responsive image">
                    </div>

                    <div class="row">
                        <div class="col-md-4">
                            <div class="kintone-field-style" style="width: max-content;">
                                <label class="font-weight-bold" style="color: #283f56; width : max-content">${translateInfo("display-type-description")}</label>${requireIcon}
                                <div class="field-Radio_button">
                                    <div class="custom-control custom-radio">
                                        <input id="Radio_button0" name="logo-partten" type="radio" class="custom-control-input kintone-data" required="" value="0" checked="">
                                        <label class="custom-control-label" for="Radio_button0">${translateInfo("display-type-only-logo")}</label>
                                    </div>
                                    <div class="custom-control custom-radio ">
                                        <input id="Radio_button1" name="logo-partten" type="radio" class="custom-control-input kintone-data" value="1">
                                        <label class="custom-control-label" for="Radio_button1">${translateInfo("display-type-only-name")}</label>
                                    </div>
                                    <div class="custom-control custom-radio ">
                                        <input id="Radio_button2" name="logo-partten" type="radio" class="custom-control-input kintone-data" value="2">
                                        <label class="custom-control-label" for="Radio_button2">${translateInfo("display-type-both-logo-and-name")}</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div id="name-input" class="kintone-field-style name-input" style="width: 200px; display: none">
                                <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateInfo("display-name-label")}</label>
                                <input type="text" class="form-control kintone-data" placeholder="" id="showName">
                            </div>

                            <div id="file-select">
                                <label for="selectLogo" class="btn action-button" style="cursor:pointer">${translateInfo("select-display-file-label")}</label>
                                <input id="selectLogo" type="file" accept="image/*" style="display: none">
                                <div id="showLogo"></div>
                            </div>
                        </div>
                    </div> 
                    
                    <div class="row pt-4">
                        <div class="col-md-5">
                            <div class="apitoken-input">
                                <label class="font-weight-bold" style="color: #283f56; width : max-content">${translateInfo("app-setting-api-token-label")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                <input type="text" class="form-control kintone-data" placeholder="" id="appSettingToken">
                            </div>
                        </div>
                    </div>


                    <div class="row pt-5">
                        <div class="col-md-6"><div class="custom-control custom-switch pb-3">
                            <input type="checkbox" class="custom-control-input" id="user-auth-cond">
                            <label class="font-weight-bold custom-control-label" for="user-auth-cond" style="color: #283f56;">${translateInfo("user-auth-function-label")}</label>
                        </div>
                        
                        <div class="user-auth-app-selection" style="display: none;">
                            <div class="form-inline" style="padding:0.1rem">
                                <label for="login_url" class="mr-sm-2">${translateInfo("login-screen-label")}</label>
                                <a target="_blank" href="https://${getChobiitFQDN()}">https://${getChobiitFQDN()}</a>
                            </div>
                            <div class="form-inline" style="padding:0.1rem">
                                <label for="register_url" class="mr-sm-2">${translateInfo("user-registration-screen-label")}</label>
                                <a target="_blank" href="https://${getChobiitFQDN()}/register.html">https://${getChobiitFQDN()}/register.html</a>
                            </div>   
                                <div class="user-auth-app-setting pt-3">
                                    <div class="bs-callout bs-callout-info">
                                        <p>${translateInfo("select-link-apps-navigation")}</p>
                                    </div>
                                    <table class="table  table-bordered" style="/* width: max-content !important; */border:none;">
                                        <thead>
                                            <tr>
                                                <th>${translateCommon("app")}</th>
                                                <th style="border:none"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <select class="custom-select d-block w-100 user-auth-app">
                                                        <option value=""></option>
                                                    </select>
                                                </td>                
                                                <td style="border:none">
                                                    <button class="btn add-user-auth-app" style="border: none;background: none; color: #42a3b8"><i class="fas fa-plus-circle  small-btn "></i></button>
                                                    <button class="btn remove-user-auth-app" style="border: none;background: none; color: #9E9E9E"><i class="fas fa-minus-circle  small-btn "></i></button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="user-auth-kintone-setting">
                                    <div class="bs-callout bs-callout-info">
                                        <p>${translateInfo("associate-accounts-navigation")}</p>
                                    </div>
                                    <table class="table  table-bordered" style="/* width: max-content !important; */border:none;">
                                        <thead>
                                            <tr>
                                                <th>${translateCommon("kintone-account")}</th>
                                                <th style="border:none"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <select class="custom-select d-block w-100 user-auth-kintone">
                                                        <option value=""></option>
                                                    </select>
                                                </td>                
                                                <td style="border:none">
                                                    <button class="btn add-user-auth-app" style="border: none;background: none; color: #42a3b8"><i class="fas fa-plus-circle  small-btn "></i></button>
                                                    <button class="btn remove-user-auth-app" style="border: none;background: none; color: #9E9E9E"><i class="fas fa-minus-circle  small-btn "></i></button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <br>
                    <label class="c-label">${translateInfo("customize-with-js-css-description")}</label>
                    <div class="pt-3">
                        <div id="js-setting-all" style="" class="custom-setting-all">
                            <table class="table  table-bordered" style="width: max-content; border:none">
                                <thead>
                                <tr>
                                    <th>${translateCommon("javascript-file")}</th>
                                    <th style="border:none"></th>
                                </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <input type="text" class="form-control js-custom-all" placeholder="" value="https://" style="width: 500px">
                                        </td>
                                        <td style="border:none">
                                            <button class="btn  add-custom" style="border: none;background: none; color: #42a3b8;"><i class="fas fa-plus-circle  small-btn "></i></button>
                                            <button class="btn  remove-custom" style="border: none;background: none;  color: #9E9E9E;"><i class="fas fa-minus-circle  small-btn "></i></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <label class="btn  file-upload-button" for="js-file-custom-all">
                                <input id="js-file-custom-all" multiple="multiple" class="kintone-data input-file-custom-all" type="file" style="display:none" accept=".js" ><i class="fas fa-upload"></i> ${translateInfo("select-file-label")}
                            </label>
                        </div>
                    </div>
                    <div class="pt-3">
                        <div id="css-setting-all" style="" class="custom-setting-all">
                            <table class="table  table-bordered" style="width: max-content; border:none">
                                <thead>
                                    <tr>
                                        <th>${translateCommon("css-file")}</th>
                                        <th style="border:none"></th>
                                </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <input type="text" class="form-control css-custom-all" placeholder="" value="https://" style="width: 500px">
                                        </td>
                                        <td style="border:none">
                                            <button class="btn  add-custom" style="border: none;background: none; color: #42a3b8;"><i class="fas fa-plus-circle  small-btn "></i></button>
                                            <button class="btn remove-custom" style="border: none;background: none; color: #9E9E9E;"><i class="fas fa-minus-circle  small-btn "></i></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <label class="btn  file-upload-button" for="css-file-custom-all">
                                <input id="css-file-custom-all" multiple="multiple" class="kintone-data input-file-custom-all" type="file" style="display:none" accept=".css"><i class="fas fa-upload"></i> ${translateInfo("select-file-label")}
                            </label>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="kintone-setting" role="tabpanel" aria-labelledby="v-pills-profile-tab">
                    <table id="kintone-user-table" class="table table-striped table-bordered" width="100%"></table>
                </div>

                <div class="tab-pane fade" id="app-setting" role="tabpanel" aria-labelledby="v-pills-messages-tab">
                    <table id="app-table" class="table table-striped table-bordered"></table>
                </div>

                <div class="tab-pane fade" id="user-setting" role="tabpanel" aria-labelledby="v-pills-messages-tab">
                    <table id="user-table" class="table table-striped table-bordered"></table>
                </div>
                
                <div class="tab-pane fade" id="group-setting" role="tabpanel" aria-labelledby="v-pills-messages-tab">
                    <table id="group-table" class="table table-striped table-bordered"></table>
                </div>

                <div class="tab-pane fade active show" id="licence-setting" role="tabpanel" aria-labelledby="v-pills-settings-tab">
                    <div id = "config-authKey">
                        <div class="kintone-field-style">
                         <label class="font-weight-bold" style="color: #283f56; width : max-content">  ${translateCommon("activation-key")}  </label>
                        <input type="text" class="form-control kintone-data" placeholder="${translateCommon("activation-key-placeholder")}" id="authKey">
                        <div style="font-size: 12px">${translateCommon("activation-key-note")}</div>
                        </div>

                        <div id="config-authEmail">
                            <div class="kintone-field-style"> 
                            <label class="font-weight-bold" style="color: #283f56; width : max-content">${translateCommon("email-address")}</label>
                            ${requireIcon}
                            <input type="text" class="form-control kintone-data" placeholder="${translateCommon("email-address-placeholder")}" id="authEmail"></div>
                            <div style="font-size: 12px">${translateCommon("email-address-note")}</div>
                            <br></br>
                            <button id="tryBtn" class="btn btn-info" style="width: 110px">${translateInfo("start-trial-label")} </button>
                        </div>

                    </div>
                </div>

            </div>
        
    </div>

    <br></br>
    <div class="row ml-4" id="submitCancelBtn">
            <button type="button" class="btn btn-secondary mr-2" id="cancelBtn" style="width: 110px;">${translateCommon("cancel")}</button>
            <button type="button" class="btn btn-info" id="submitBtn" style="width: 110px" >${translateCommon("save")}</button>
    </div>
    `

    let kintoneSettingRecord = ` <div style="padding-top: 1rem; padding: 1rem;">
        <div class="kintone-field-style">   
            <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateCommon("kintone-user")}</label>${requireIcon}
            <span class="fas fa-search form-control-feedback"></span>
            <input list="list-kintone-user-name" id= "kintone-user-name" type="text" class="form-control input-search" placeholder="">
            <datalist id="list-kintone-user-name">
            </datalist>
        </div>
        <div class="kintone-field-style">   
            <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateCommon("password")}</label>${requireIcon}
            <input type="text" class="form-control kintone-data" placeholder="" id="kintone-user-password">
        </div>
    </div>`

    let appSettingRecord = `<div style="padding-top: 1rem;padding: 1rem;">
            
        <div class="kintone-field-style">   
            <label class="font-weight-bold" style="color: #283f56; width : max-content">${translateCommon("app")}</label>${requireIcon}
            <span class="fas fa-search form-control-feedback"></span>
            <input list="app-list" id= "app" type="text" class="form-control input-search" placeholder="${translateInfo("app-setting.search-apps-label")}">
            <datalist id="app-list">
            </datalist>
        </div>

        <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item">
            <a class="nav-link active" data-toggle="tab" href="#menu1">${translateInfo("app-setting.linked-app-setting")}</a>
            </li>
            <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#menu2">${translateInfo("app-setting.display-setting")}</a>
            </li>
            <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#menu4">${translateInfo("app-setting.customize-setting")}</a>
            </li>
            <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#menu3">${translateInfo("app-setting.other-setting")}</a>
            </li>
        </ul>

        <!-- Tab panes -->
        <div class="tab-content">
            <div id="menu1" class="container tab-pane active"><br>
            <label style="
                font-size: 1.4rem;
                font-weight: 600;
            ">${translateInfo("app-setting.linked-app-setting.auth-function-label")}</label>
            <div class="pt-1 pb-1">
                <div class="form-check-inline">
                <label class="form-check-label">
                    <input checked type="radio" class="form-check-input" value="認証あり" name="user_authen">${translateInfo("app-setting.linked-app-setting.with-auth")}</label>
                </div>
                <div class="form-check-inline">
                <label class="form-check-label">
                    <input type="radio" class="form-check-input" value="外部公開" name="user_authen">${translateInfo("app-setting.linked-app-setting.public")}</label>
                </div>
                <div class="form-check-inline">
                <label class="form-check-label">
                    <input type="radio" class="form-check-input" value="両方" name="user_authen">${translateInfo("app-setting.linked-app-setting.both")}</label>
                </div>
            </div>

            <div id="authen-panel">
                <div class="">  
                    <label style="
                        margin-top: 2rem;
                        font-weight: 600;
                        display: block;
                        color: #607D8B;
                        font-size: 1.1rem;
                        background: #0096880a;
                        padding: .5rem;
                        border-left: 5px solid;
                    ">${translateInfo("app-setting.linked-app-setting.with-auth-setting")}</label>

                    <label class="c-label">${translateInfo("app-setting.linked-app-setting.with-auth-setting.display-setting")}</label>  
                    <div class="custom-control custom-switch pb-3">
                        <input type="checkbox" class="custom-control-input" id="owner_view">
                        <label class="custom-control-label" for="owner_view">${translateInfo("app-setting.linked-app-setting.with-auth-setting.display-setting.only-mine")}</label>
                    </div>

                    <div class="group-view-setting">
                        <div class="custom-control custom-switch pb-3">
                            <input type="checkbox" class="custom-control-input" id="group-view-cond">
                            <label class="custom-control-label" for="group-view-cond">${translateInfo("app-setting.linked-app-setting.with-auth-setting.display-setting.only-my-group")}</label>
                        </div>

                        <div id="group-view-selection" style="display: none;">
                            <div class="row mb-3" style="">
                                <div class="col-md-4">
                                    <label>${translateCommon("chobiit-group")}</label>${requireIcon}
                                    <select class="custom-select d-block w-100" id="group-view">
                                        <option value=""></option>
                                    </select>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div class="custom-control custom-switch pb-4">
                        <input type="checkbox" class="custom-control-input" id="show-comment">
                        <label class="custom-control-label" for="show-comment">${translateInfo("app-setting.linked-app-setting.with-auth-setting.display-setting.enable-comment")}</label>
                    </div>

                    <div class="app-linkto-setting">
                        <div class="custom-control custom-switch pb-3">
                            <input type="checkbox" class="custom-control-input" id="app-linkto-cond">
                            <label class="custom-control-label" for="app-linkto-cond">${translateInfo("app-setting.linked-app-setting.with-auth-setting.display-setting.enable-app-link")}</label>
                        </div>

                        <div id="app-linkto-selection" style="display: none">
                            <div class="row pb-3">
                                <div class="col-md-4">
                                    <label class="mr-sm-2">${translateCommon("linked-app")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                    <select class="custom-select d-block w-100" id="app-linkto"><option value=""></option></select>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    
                    <div class="pb-3">
                        <div class="row">
                            <div class="col-md-4">
                                <label for="add_record_url" class="mr-sm-2">${translateInfo("app-setting.linked-app-setting.with-auth-setting.display-setting.record-index-link-name")}</label>
                                <input  class="form-control mb-2 mr-sm-2" id="list_screen" value="${translateCommon("list-screen")}">
                            </div>
                            <div class="col-md-4">
                                <label for="add_record_url" class="mr-sm-2">${translateInfo("app-setting.linked-app-setting.with-auth-setting.display-setting.record-add-link-name")}</label>
                                <input  class="form-control mb-2 mr-sm-2" id="add_screen" value="${translateCommon("create")}">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mail-notif">   
                    <label class="c-label">${translateInfo("app-setting.linked-app-setting.with-auth-setting.email-notification-setting")}</label> 
                    <div class="bs-callout bs-callout-info">
                        <p>${translateInfo("app-setting.linked-app-setting.with-auth-setting.email-notification-setting.select-conditions")}</p>
                    </div>
                    <table class="table  table-bordered" style="width: max-content; border:none">
                        <thead>
                        <tr>
                            <th>${translateInfo("app-setting.linked-app-setting.with-auth-setting.email-notification-setting.target-operation")}</th>
                            <th>${translateInfo("app-setting.linked-app-setting.with-auth-setting.email-notification-setting.notification-content")}</th>
                            <th style="border:none"></th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <select class="custom-select d-block w-100 event_notif">
                                        <option value=""></option>
                                        <option value="レコード編集">${translateInfo("app-setting.linked-app-setting.with-auth-setting.email-notification-setting.edit-record")}</option>
                                        <option value="コメント投稿">${translateInfo("app-setting.linked-app-setting.with-auth-setting.email-notification-setting.post-comment")}</option>
                                    </select>
                                </td>
                                <td>
                                    <input type="text" class="form-control  text_notif text-field" placeholder="">
                                </td>
                                <td style="border:none">
                                    ${ADD_ROW_BUTTON + REMOVE_ROW_BUTTON}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="kintone-field-style">   
                    <div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input" id="pro_cond_1">
                        <label class="custom-control-label" for="pro_cond_1">${translateInfo("app-setting.linked-app-setting.with-auth-setting.email-notification-setting.use-process-management")}</label>
                    </div>
                </div>
                <div id="pro-setting" style="display: none">
                    <table class="table  table-bordered" style="width: max-content; border:none">
                        <thead>
                        <tr>
                            <th>${translateInfo("app-setting.linked-app-setting.with-auth-setting.email-notification-setting.status-value")}</th>
                            <th>${translateInfo("app-setting.linked-app-setting.with-auth-setting.email-notification-setting.notification-content")}</th>
                            <th style="border:none"></th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <select class="custom-select d-block w-100 pro_state_value_1">
                                        <option value=""></option>
                                    </select>
                                </td>
                                <td>
                                    <input type="text" class="form-control text-field pro_alert_content_1" placeholder="" value="${translateInfo("app-setting.linked-app-setting.with-auth-setting.email-notification-setting.status-has-been-updated")}">
                                </td>
                                <td style="border:none">
                                    ${ADD_ROW_BUTTON + REMOVE_ROW_BUTTON}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="chobiit-fields">   
                    <label class="c-label">${translateInfo("app-setting.linked-app-setting.with-auth-setting.field-setting")}</label>
                    <div class="bs-callout bs-callout-info">
                        <p>${translateInfo("app-setting.linked-app-setting.with-auth-setting.chobiit-users-operation-fields")}</p>
                    </div>
                    <div class="row">
                        <div class="col-md-3 ">
                            <label>${translateInfo("app-setting.linked-app-setting.with-auth-setting.record-creator")}</label>${requireIcon}
                            <select class="custom-select d-block w-100" id="creator">
                                <option value=""></option>
                            </select>
                        </div>

                        <div class="col-md-3 ">
                            <label>${translateInfo("app-setting.linked-app-setting.with-auth-setting.record-created-at")}</label>${requireIcon}
                            <select class="custom-select d-block w-100" id="create_time">
                                <option value=""></option>
                            </select>
                        </div>

                        <div class="col-md-3 ">
                            <label>${translateInfo("app-setting.linked-app-setting.with-auth-setting.record-updator")}</label>${requireIcon}
                            <select class="custom-select d-block w-100" id="editor">
                                <option value=""></option>
                            </select>
                        </div>

                        <div class="col-md-3 ">
                            <label>${translateInfo("app-setting.linked-app-setting.with-auth-setting.record-updated-at")}</label>${requireIcon}
                            <select class="custom-select d-block w-100" id="edit_time">
                                <option value=""></option>
                            </select>
                        </div>

                    </div>

                   
                    
                </div>

            </div>

            <div id="no-authen-panel" style="display:none">
                <label style="
                    margin-top: 2rem;
                    font-weight: 600;
                    display: block;
                    color: #607D8B;
                    font-size: 1.1rem;
                    background: #0096880a;
                    padding: .5rem;
                    border-left: 5px solid;
                ">${translateInfo("app-setting.linked-app-setting.publication-setting")}</label>

                <div class="kintone-field-style pt-2">   
                    <label class="font-weight-bold" style="color: #283f56; width : max-content">${translateInfo("app-setting.linked-app-setting.publication-setting.api-token")}</label>${requireIcon}
                    <input type="text" class="form-control kintone-data" placeholder="" id="api-token">
                </div>

                <div class="function-setting pb-3">
                    <label class="c-label">${translateInfo("app-setting.linked-app-setting.publication-setting.feature-setting")}</label> 
                    <div class="bs-callout bs-callout-info">
                        <p>${translateInfo("app-setting.linked-app-setting.publication-setting.features-used-in-chobiit")} ${requireIcon}</p>
                    </div>

                    <div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input" id="view-function">
                        <label class="custom-control-label" for="view-function">${translateInfo("app-setting.linked-app-setting.publication-setting.view-records")}</label>
                    </div>
                    <div id="view-function-selection" style="display:none; padding: .8rem">
                        <div class="form-inline" style="padding:0.1rem">
                            <label for="list_record_url" class="mr-sm-2">${translateInfo("app-setting.linked-app-setting.publication-setting.url-of-record-list-page")}</label>
                            <input  class="form-control mb-2 mr-sm-2" style="width: 500px;color: black;border: none;" disabled="" id="list_record_url">
                        </div>
                        <div class="form-inline"  style="padding:0.1rem">
                            <label for="list_record_iframe_tag" class="mr-sm-2">${translateInfo("app-setting.linked-app-setting.publication-setting.iframe-tag-of-record-list-page")}</label>
                            <input  class="form-control mb-2 mr-sm-2" style="width: 500px;color: black;border: none;" disabled="" id="list_record_iframe_tag">
                            <button class="chobit-copy-button mb-2" ><i class="fas fa-copy"></i></button>
                        </div>
                    </div>

                    <div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input" id="add-function">
                        <label class="custom-control-label" for="add-function">${translateInfo("app-setting.linked-app-setting.publication-setting.add-records")}</label>
                    </div>
                    <div id="add-function-selection" style="display:none; padding: .8rem">
                        <div class="form-inline" style="padding:0.1rem">
                            <label for="add_record_url" class="mr-sm-2">${translateInfo("app-setting.linked-app-setting.publication-setting.url-of-record-add-page")}</label>
                            <input  class="form-control mb-2 mr-sm-2" style="width: 500px;color: black;border: none;" disabled="" id="add_record_url">
                        </div>
                        <div class="form-inline"  style="padding:0.1rem">
                            <label for="add_record_iframe_tag" class="mr-sm-2">${translateInfo("app-setting.linked-app-setting.publication-setting.iframe-tag-of-record-add-page")}</label>
                            <input  class="form-control mb-2 mr-sm-2" style="width: 500px;color: black;border: none;" disabled="" id="add_record_iframe_tag">
                            <button class="chobit-copy-button mb-2"><i class="fas fa-copy"></i></button>
                        </div>
                    </div>
                    <div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input" id="iframe-function">
                        <label class="custom-control-label" for="iframe-function">
                            ${translateInfo("app-setting.linked-app-setting.publication-setting.specify-embed-permitted-sites")}
                            <span class="iframe-function-tooltip2" style="display: none">${translateInfo("app-setting.linked-app-setting.publication-setting.max-two-sites")}</span>
                        </label>
                        <p class="iframe-function-tooltip">
                            <i class="fa fa-exclamation-circle"></i>
                            <span style="color: #009688">${translateInfo("app-setting.linked-app-setting.publication-setting.iframe-embed-warning")}</span>
                        </p>
                        <p class="iframe-function-tooltip2" style="display:none">
                            <span style="color: #009688">${translateInfo("app-setting.linked-app-setting.publication-setting.enter-fqdn")}</span>
                        </p>
                    </div>
                    <div id="iframe-function-selection" style="display:none; padding: .8rem">
                        <div class="pt-1 pb-1">
                            <div class="form-check-inline">
                                <select class="custom-select scheme d-block w-100" name="scheme[]">
                                    <option value="http">http</option>
                                    <option value="https">https</option>
                                </select>
                                <span class="px-1">://</span>
                                <input type="text" class="form-control kintone-data domain" placeholder="" name="domain">
                                <button class="btn add-row-iframe iframe-url" style="border: none;background: none; color: #42a3b8; padding: 0; margin: .375rem .75rem; line-height: 1rem">
                                    <i class="fas fa-plus-circle small-btn"></i>
                                </button>
                                <button class="btn remove-row-iframe iframe-url" style="border: none;background: none; color: #9E9E9E; padding: 0; margin: .375rem .75rem; line-height: 1rem">
                                    <i class="fas fa-minus-circle small-btn"></i>
                                </button>
                            </div>
                        </div> 
                    </div>
                </div>

                <div class="field-right-setting pb-3">
                    <label class="c-label">${translateInfo("app-setting.linked-app-setting.publication-setting.display-setting")}</label> 
                    <div class="custom-control custom-switch pb-3">
                        <input type="checkbox" class="custom-control-input" id="roboto_check" checked>
                        <label class="custom-control-label" for="roboto_check">${translateInfo("app-setting.linked-app-setting.publication-setting.robot-check")}</label>
                    </div>

                    <div class="custom-control custom-switch pb-3">
                        <input type="checkbox" class="custom-control-input" id="field_cond_0">
                        <label class="custom-control-label" for="field_cond_0">${translateInfo("app-setting.linked-app-setting.publication-setting.field-display-condition")}</label>
                    </div>

                    <div id="field-cond-selection" style="display: none">
                        <table class="table  table-bordered" style="width: max-content; border:none">
                            <thead>
                            <tr>
                                <th>${translateInfo("app-setting.linked-app-setting.publication-setting.field")}</th>
                                <th>${translateInfo("app-setting.linked-app-setting.publication-setting.feature")}</th>
                                <th style="border:none"></th>
                            </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <select class="custom-select d-block w-100 field_cond_field_0">
                                            <option value=""></option>
                                        </select>
                                    </td>
                                    <td>
                                        <div class = "field-cond-func">
                                            <div class="custom-control custom-checkbox custom-control-inline">
                                                <input type="checkbox" class="custom-control-input" id="cond-view" name="field-cond-view" value="view">
                                                <label class="custom-control-label" for="cond-view">${translateInfo("app-setting.linked-app-setting.publication-setting.hide")}</label>
                                            </div>

                                            <div class="custom-control custom-checkbox custom-control-inline">
                                                <input type="checkbox" class="custom-control-input" id="cond-edit" name="field-cond-edit" value="edit">
                                                <label class="custom-control-label" for="cond-edit">${translateInfo("app-setting.linked-app-setting.publication-setting.not-editable")}</label>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="border:none">
                                        ${ADD_ROW_BUTTON + REMOVE_ROW_BUTTON}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="puclic-lookup-setting">            
                    <label class="c-label">${translateInfo("app-setting.linked-app-setting.publication-setting.lookup-setting")}</label>
                        <table class="table  table-bordered" style="width: max-content; border:none">
                            <thead>
                                <tr>
                                    <th>${translateInfo("app-setting.linked-app-setting.publication-setting.lookup-setting.field-name")}</th>
                                    <th>${translateInfo("app-setting.linked-app-setting.publication-setting.lookup-setting.linked-app")}</th>
                                    <th>${translateInfo("app-setting.linked-app-setting.publication-setting.lookup-setting.api-token")}<span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span></th>
                                    <th style="border:none"></th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </div>
            <div id="menu2" class="container tab-pane fade"><br>
                <label class="c-label">${translateInfo("app-setting.display-setting.save-button-label")}</label>
                <div class="kintone-field-style">
                    <input class="form-control mb-2 mr-sm-2" id="save_btn_name" value="${translateInfo("app-setting.display-setting.save")}">
                </div>
                <label class="c-label">${translateInfo("app-setting.display-setting.display-setting")}</label>             
                <div class="bs-callout bs-callout-info">
                    <label>${translateInfo("app-setting.display-setting.view-setting")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                </div>
                <div id="record-cond-selection" style="display:none">
                </div>

                <label class="c-label">${translateInfo("app-setting.display-setting.theme-color-setting")}</label> 
                <table>
                    <tr>
                        <td>${translateInfo("app-setting.display-setting.theme-color")}<hr></td>
                        <td> &nbsp<hr></td>
                        <td style="padding-left:4em"></td>
                        <td>${translateInfo("app-setting.display-setting.font-color")}<hr></td>
                        <td> &nbsp<hr></td>
                    </tr>
                    <tr>
                        <td>${translateInfo("app-setting.display-setting.menu-bar-background-table-plus-button")}: &nbsp </td>
                        <td><input type="color" id="bcolor1" class="template_color_select" value="#2b4156"></td>
                        <td style="padding-left:4em"></td>
                        <td>${translateInfo("app-setting.display-setting.menu-bar-main-text-subtable-field-name")}</td>
                        <td><input type="color"  id="fcolor1" class="template_color_select" value="#ffffff"></td>
                    </tr>
                    <tr>
                        <td>${translateInfo("app-setting.display-setting.menu-bar-accent-button")}: &nbsp </td>
                        <td><input type="color"  id="bcolor2" class="template_color_select" value="#00989e"></td>
                        <td style="padding-left:4em"></td>
                        <td>${translateInfo("app-setting.display-setting.menu-bar-unselected-text")}: &nbsp </td>
                        <td><input type="color"  id="fcolor2" class="template_color_select" value="#ffffff"></td>
                    </tr>
                    <tr>
                        <td>${translateInfo("app-setting.display-setting.header-background-color")}:  &nbsp</td>
                        <td><input type="color"  id="bcolor3" class="template_color_select" value="#ececec"> </td>
                        <td style="padding-left:4em"></td>
                        <td>${translateInfo("app-setting.display-setting.user-display-name")}: &nbsp </td>
                        <td><input type="color" id="fcolor3" class="template_color_select" value="#000000"> </td>
                    </tr>
                </table>
            </div>

            <div id="menu4" class="container tab-pane fade">
                <br>
                <label class="c-label">${translateInfo("app-setting.customize-setting.javascript-css-customization")}</label>
                <div class="pt-3">
                    <div id="js-setting" style="" class="custom-setting">
                        <table class="table  table-bordered" style="width: max-content; border:none">
                            <thead>
                            <tr>
                                
                                <th>${translateInfo("app-setting.customize-setting.javascript-file")}</th>
                                <th style="border:none"></th>
                            </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <input type="text" class="form-control js-custom" placeholder="" value="https://"  style="width: 500px">
                                    </td>
                                    <td style="border:none">
                                        <button class="btn add-row" style="border: none;background: none;"><i class="fas fa-plus-circle  small-btn "></i></button><button class="btn remove-row" style="border: none;background: none;"><i class="fas fa-minus-circle  small-btn "></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <label class="btn  file-upload-button" for="js-file-custom">
                            <input id="js-file-custom" multiple="multiple" class="kintone-data input-file-custom" type="file" style="display:none" accept=".js"><i class="fas fa-upload"></i> ${translateInfo("app-setting.customize-setting.choose-file")}
                        </label>
                    </div>
                </div>
                
                <div class="pt-3">
                    <div id="css-setting" style=""  class="custom-setting"> 
                        <table class="table  table-bordered" style="width: max-content; border:none">
                            <thead>
                                <tr>
                                    <th>${translateInfo("app-setting.customize-setting.css-file")}</th>
                                    <th style="border:none"></th>
                            </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <input type="text" class="form-control css-custom" placeholder="" value="https://" style="width: 500px">
                                    </td>
                                    <td style="border:none">
                                        <button class="btn add-row" style="border: none;background: none;"><i class="fas fa-plus-circle  small-btn "></i></button><button class="btn remove-row" style="border: none;background: none;"><i class="fas fa-minus-circle  small-btn "></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <label class="btn  file-upload-button" for="css-file-custom">
                            <input id="css-file-custom" multiple="multiple" class="kintone-data input-file-custom" type="file" style="display:none" accept=".css"><i class="fas fa-upload"></i> ${translateInfo("app-setting.customize-setting.css-file")}
                        </label>
                    </div>
                </div>
            </div>

            <div id="menu3" class="container tab-pane fade"><br>
                <div class="location-setting">
                    <div class="custom-control custom-switch pb-3">
                        <input type="checkbox" class="custom-control-input" id="locate_cond_1">
                        <label class="custom-control-label" for="locate_cond_1">${translateInfo("app-setting.other-setting.location-information-feature")}</label>
                    </div>

                    <div id="locate-cond-selection" style="display:none">
                        <div class="row pb-3">
                            <div class="col-md-3">
                                <label class="mr-sm-2">${translateInfo("app-setting.other-setting.latitude")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                <select class="custom-select d-block w-100" id="latitude_1">
                                    <option value=""></option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="mr-sm-2">${translateInfo("app-setting.other-setting.longitude")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                <select class="custom-select d-block w-100" id="longitude_1">
                                    <option value=""></option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="thanks-setting">
                    <div class="custom-control custom-switch pb-3">
                        <input type="checkbox" class="custom-control-input" id="thanks_page">
                        <label class="custom-control-label" for="thanks_page">${translateInfo("app-setting.other-setting.custom-page-setting-after-saving-record")}</label>
                    </div>

                    <div id="thanks-page-selection" style="display:none">
                        <div id="trumbowyg">
                        </div>
                    </div>
                </div>

                <div class="action-setting">
                    <div class="custom-control custom-switch pb-3">
                        <input type="checkbox" class="custom-control-input" id="action_cond">
                        <label class="custom-control-label" for="action_cond">${translateInfo("app-setting.other-setting.action-feature-setting")}</label>
                        <span class="chobiit_tooltip">
                            <i class="fas fa-question-circle"></i>
                            <span class="chobiit_tooltiptext">${translateInfo("app-setting.other-setting.action-feature-setting-notes")}</span>
                        </span>
                    </div> 

                    <div id="action-cond-selection" style="display:none"> 
                        <table class="table table-bordered" bordercolor="gray" style="width: max-content; border:none">
                            <tbody>
                                <tr class="action-tr">
                                    <td style="border:none">
                                        <button class="btn add-row"  style="border: none;background: none;display: block;"><i class="fas fa-plus-circle  small-btn "></i></button>
                                        <button class="btn remove-row"  style="border: none;background: none;display: block;"><i class="fas fa-minus-circle  small-btn "></i></button>
                                    </td>
                                    <td class="action-td">
                                        <div class="row">
                                            <div class="col-md-3">
                                                <label class="mr-sm-2">${translateInfo("app-setting.other-setting.action-button-name")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                                <input  class="form-control mb-2 mr-sm-2 action_name">
                                            </div>
                                            <div class="col-md-3">
                                                <label class="mr-sm-2">${translateInfo("app-setting.other-setting.action-destination-app")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                                <select class="custom-select d-block w-100 action_to_app">
                                                    <option value=""></option>
                                                </select>
                                            </div>
                                        </div>

                                        <label class="mr-sm-2 pb-1 pt-2">${translateInfo("app-setting.other-setting.select-copy-source-and-dest-fields")}</label> 
                                        <table class="table  table-bordered" style="width: max-content; border:none">
                                            <thead>
                                            <tr>
                                                <th>${translateInfo("app-setting.other-setting.copy-source-fields")}</th>
                                                <th>${translateInfo("app-setting.other-setting.copy-dest-fields")}</th>
                                                <th>${translateInfo("app-setting.other-setting.is-uneditable-field")}</th>
                                                <th style="border:none"></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                                <tr class="act-map-tr">
                                                    <td>
                                                        <select class="custom-select d-block w-100 action_copy_from">
                                                            <option value=""></option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select class="custom-select d-block w-100 action_copy_to">
                                                            <option value=""></option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <div class="custom-control custom-checkbox custom-control-inline" style="padding-left:5rem">
                                                            <input type="checkbox" class="custom-control-input editable" id="editable" name="action_field_editable" value="view">
                                                            <label class="custom-control-label" for="editable"></label>
                                                        </div>
                                                        
                                                    </td>
                                                    <td style="border:none">
                                                        ${ADD_ROW_BUTTON + REMOVE_ROW_BUTTON}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div class="wsync-setting">
                                            <div class="custom-control custom-switch pb-3">
                                                <input type="checkbox" class="custom-control-input wsync-cond-trig" id="wsync-cond">
                                                <label class="custom-control-label" for="wsync-cond">${translateInfo("app-setting.other-setting.webhook-app-synchronization")}</label>
                                                <span class="chobiit_tooltip">
                                                    <i class="fas fa-question-circle"></i>
                                                    <span class="chobiit_tooltiptext">
                                                        ${translateInfo("app-setting.other-setting.webhook-app-synchronization-description")}
                                                    </span>
                                                </span>
                                            </div> 
                        
                                            <div class="wsync-selection init-hide" style="display: none"> 
                                                <div class="row pb-1">
                                                    <div class="col-md-4">
                                                        <label class="mr-sm-2">${translateInfo("app-setting.other-setting.api-token-of-the-source-app")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                                        <input class="form-control mb-2 mr-sm-2 wsync-apitoken">
                                                    </div>
                                                    
                                                </div>    
                                                <div class="row pl-3 pt-3">
                                                    <p>${translateInfo("app-setting.other-setting.select-the-update-key-field")}</p>
                                                </div>
                                                <div class="row pl-3 pb-3">
                                                    <small>${translateInfo("app-setting.other-setting.the-update-key-must-be-unique")}</small>
                                                </div>                 
                                                <div class="row">
                                                    <div class="col-md-4">
                                                        <label class="mr-sm-2">${translateInfo("app-setting.other-setting.update-key-of-the-source-app")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                                        <select class="custom-select d-block w-100 wsync-to-key">
                                                            <option value=""></option>
                                                        </select>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <label class="mr-sm-2">${translateInfo("app-setting.other-setting.update-key-of-the-dest-app")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                                        <select class="custom-select d-block w-100 wsync-from-key">
                                                            <option value=""></option>
                                                        </select>
                                                    </div>
                                                </div>
                        
                                                <br> 
                                                
                                                <table class="table  table-bordered wsync-map" style="width: max-content; border:none">
                                                    <thead>
                                                    <tr>
                                                        <th>${translateInfo("app-setting.other-setting.update-target-fields-of-the-source-app")}</th>
                                                        <th>${translateInfo("app-setting.other-setting.update-target-fields-of-the-dest-app")}</th>
                                                        <th style="border:none"></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr class="wh-map-tr">
                                                            <td>
                                                                <select class="custom-select d-block w-100 wsync-to-field"><option value=""></option></select>
                                                            </td>
                                                            <td>
                                                                <select class="custom-select d-block w-100 wsync-from-field"><option value=""></option></select>
                                                            </td>
                                                            <td style="border:none">
                                                                <button class="btn add-row" style="border: none;background: none;"><i class="fas fa-plus-circle  small-btn "></i></button><button class="btn remove-row" style="border: none;background: none;"><i class="fas fa-minus-circle  small-btn "></i></button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="auto-sendmail-setting">
                    <div class="custom-control custom-switch pb-3">
                        <input type="checkbox" class="custom-control-input" id="auto_sendmail_cond">
                        <label class="custom-control-label" for="auto_sendmail_cond">${translateInfo("app-setting.other-setting.auto-reply-mail-feature")}</label>
                    </div>

                    <div id="auto-sendmail-selection" style="display:none">
                        <div class="row" >
                            <label class="ml-sm-3" style="color: grey">${translateInfo("app-setting.other-setting.auto-reply-mail-feature-decription")}</label>
                            <div class="col-md-7">
                                <label class="mr-sm-2">${translateInfo("app-setting.other-setting.destination-address")}</label><span style="font-size: 0.5em; color: Tomato;"><i
                                        class="fas fa-asterisk"></i></span>
                                <select class="custom-select d-block w-100" id="auto-email">
                                    <option value=""></option>
                                </select>

                                <br>
                                <label class="mr-sm-2">${translateInfo("app-setting.other-setting.mail-subject")}</label>
                                <span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                <input class="form-control mb-2 mr-sm-2" id="auto-subject"><br>

                                <label class="mr-sm-2">${translateInfo("app-setting.other-setting.mail-content")}</label>
                                <span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                                <textarea class="form-control" id="auto-content" rows="10"></textarea>

                            </div>
                            <div class="col-md-5">
                                <ul class="list-group"  id="insert-fieldcode" style="font-size: .9rem;">
                                    <li class="list-group-item " style=" background: grey;color: white;">${translateInfo("app-setting.other-setting.use-fields-in-mail-content")}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="response-control-setting">
                    <div class="custom-control custom-switch pb-3">
                        <input type="checkbox" class="custom-control-input" id="response-control">
                        <label class="custom-control-label" for="response-control">${translateInfo("app-setting.other-setting.multiple-submission-control-setting")}</label>
                    </div>
                
                    <div id="response-control-selection" style="display:none;">
                        <div class="row">
                            <label class="ml-sm-3" style="color: grey">${translateInfo("app-setting.other-setting.multiple-submission-prohibited-period")}</label>
                        </div>
                        <div class="row">
                            <div class="col-md-2">        
                                <select class="custom-select d-block w-100" id="duration">
                                    <option value="0">${translateInfo("app-setting.other-setting.infinite")}</option>
                                    <option value="1">${translateInfo("app-setting.other-setting.finite")}</option>
                                </select>
                            </div>
                            <div class="col-md-2 duration-setting" style="display:none;">
                                <div class="input-group mb-3">
                                    <input type="number" class="form-control" id="duration-days">
                                    <div class="input-group-append">
                                        <span class="input-group-text">${translateInfo("app-setting.other-setting.days")}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 duration-setting" style="display:none;">
                                <p id="duration-text" style="font-weight: 700;font-size: 1.2rem;"></p>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="temp-saving-setting">
                    <div class="custom-control custom-switch pb-3">
                        <input type="checkbox" class="custom-control-input" id="temp-saving">
                        <label class="custom-control-label" for="temp-saving">${translateInfo("app-setting.other-setting.temp-saving-setting")}</label>
                    </div>
                
                    <div id="temp-saving-selection" style="display:none;">
                        <div class="row">
                            <label class="ml-sm-3" style="color: grey">${translateInfo("app-setting.other-setting.temp-saving-button-name")}</label>
                        </div>
                        <div class="row">
                            <div class="col-md-3">        
                                <input class="form-control mb-2 mr-sm-2" id="temp-saving-btn" value="${translateInfo("app-setting.other-setting.temp-save")}">
                            </div>
                            
                        </div>
                    </div>
                </div>

                
                ${process.env.CHOBIIT_LANG === "en" ? `
                <div class="lk-complete-match-setting">
                    <div class="custom-control custom-switch pb-3">
                        <input type="checkbox" class="custom-control-input" id="lk-complete-match">
                        <label class="custom-control-label" for="lk-complete-match">Prohibit lookup partial match</label>
                    </div>
                
                    <div id="lk-complete-match-selection" style="display:none">
                        <div class="row">
                            <label class="ml-sm-3" style="color: grey">Select a field for lookup exact match</label>
                        </div>
                        <table class="table  table-bordered" style="width: max-content; border:none">
                            <thead>
                                <tr>
                                    <th>lookup field</th>
                                    <th style="border:none"></th>
                            </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <select class="custom-select d-block w-100 lk-complete-match-field">
                                            <option value=""></option>
                                        </select>
                                    </td>
                                    <td style="border:none">
                                        <button class="btn add-row" style="border: none;background: none;"><i class="fas fa-plus-circle  small-btn "></i></button><button class="btn remove-row" style="border: none;background: none;"><i class="fas fa-minus-circle  small-btn "></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : ""}

            </div>
        </div>
    </div>
    </div>`;

    let groupSettingRecord = `
    <div style="padding-top: 1rem; padding: 1rem;">    
        <div class="row pb-3">
            <div class="col-md-6">
                <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateInfo("group-setting.chobiit-group-name")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                <input type="text" class="form-control kintone-data" placeholder="" id="group_name">
            </div>
            <div class="col-md-6">
                <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateInfo("group-setting.chobiit-user")}</label>
                <select size=10 multiple="" class="form-control" id="group-users">
                </select>
            </div>
        </div>
    </div>`;

    let userSettingRecord = `
        <div style="padding-top: 1rem; padding: 1rem;">    
            <div class="admin-select mb-3">
                <div class="bs-callout bs-callout-info">
                    <p>${translateInfo("user-setting.description-of-admin")}</p>
                </div>
                <div class="custom-control custom-switch">
                    <input type="checkbox" class="custom-control-input" id="administrator">
                    <label class="custom-control-label" for="administrator">${translateInfo("user-setting.administrator")}</label>
                </div>
            </div>    
            <div class="row pb-3">
                <div class="col-md-5">
                    <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateInfo("user-setting.chobiit-login-name")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                    <input type="text" class="form-control kintone-data" placeholder="" id="login_name">
                    ${process.env.CHOBIIT_LANG === "en" ? `
                        <div style="
                            font-weight: 600;
                            font-size: .7rem;
                            margin: .5rem;
                        ">Use 3 - 64 characters with a mix of letters and/or numbers, <br>and symbol . - _ @ (other symbols are not supported) <br>starting from either a letter or number
                        </div>
                    `: ""}
                </div>

                <div class="col-md-5">
                    <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateInfo("user-setting.associated-kintone-account")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                    <select class="custom-select d-block w-100 kintone-data" id="kintone_user">
                        <option value=""></option>
                    </select>
                </div>
            </div>

            <div class="row pb-3">
                <div class="col-md-5">
                    <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateInfo("user-setting.chobiit-display-name")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                    <input type="text" class="form-control kintone-data" placeholder="" id="name">
                </div>
                <div class="col-md-5">
                    <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateInfo("user-setting.email-address")}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
                    <input type="text" class="form-control kintone-data" placeholder="" id="email">
                </div>
            </div>

            <div class="app-selection">   
                <div class="bs-callout bs-callout-info">
                    <p>${translateInfo("user-setting.select-kintone-apps-to-use-in-chobiit")}</p>
                </div>
                <table class="table  table-bordered" style="width: max-content; border:none">
                    <thead>
                        <tr>
                            <th>${translateInfo("user-setting.kintone-app")}</th>
                            <th style="border:none"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <select class="custom-select d-block w-100 user-app">
                                    <option value=""></option>
                                </select>
                            </td>                
                            <td style="border:none">
                                ${ADD_ROW_BUTTON + REMOVE_ROW_BUTTON}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`;

    $('#config-body').append(tab);

     // ############### 認証処理 START 2018/06/18 #########################
     var conf = kintone.plugin.app.getConfig(PLUGIN_ID);  //プラグインの設定情報を取得
     var user = kintone.getLoginUser();
     console.log("PLUGIN_ID=" + PLUGIN_ID);
     console.log("*** Conf情報 ****");
     console.log(conf);
     console.log("*** user情報 ****");
     console.log(user);

     var authKey = conf['authKey'];
     var authEmail = conf['authEmail'];
     var lang = user['language'];
     console.log("*** 認証情報 ****");
     console.log("authKey=" + authKey);
     console.log("authEmail=" + authEmail);
     console.log("lang=" + lang);

     if (!authKey) {
         authKey = ''
     };
     var authentication = new NovelPluginAuthorization(PLUGIN_ID, lang, authKey);
     var resultAuthorization = authentication.authorizeConfigCheck();
     var limit = resultAuthorization['limit'];
     console.log("### resultAuthorization ###", resultAuthorization);

     var authState = resultAuthorization['authState'];

     var endDate = resultAuthorization['endDate'];
    /**
     * # FIXME
     * `moment`は非推奨. See: https://momentjs.com/docs/#/-project-status/
     */
     var wrkEndDate1 = moment(endDate);
     var wrkEndDate2 = wrkEndDate1.format('YYYY/MM/DD HH:mm');

     if (authState === 'trialStart' || authState === 'trialEnd' || authState === 'NotActive') {
         if (authState === 'trialStart' || authState === 'trialEnd') {
             $('#config-authKey').prepend(`<p>${translateInfo("trial-period-due-date-is", {dueDate: wrkEndDate2})}</p><br>`);
         }
         $('#config-authKey').prepend(`<button type="button" class="btn action-button" id="applicationButton" onClick="window.open('${process.env.CHOBIIT_PAID_INFORMATION_URL}')">${translateInfo("click-here-to-purchase-chobiit")}</button>`);
     }


    const configApiToken = conf.appSettingToken || '';
    const settingAppId = kintone.app.getId();
    const apiKey = [configApiToken,domain,settingAppId].join(':')



     if (conf) {
         console.log("*** Save Conf ****");
         $('#authKey').val(conf['authKey']);
         $('#authEmail').val(conf['authEmail']);
     }
     if (conf['authEmail']) {
         console.log("*** [無-旧認証から新認証に乗り換え]****");
         $('#submitCancelBtn').show();
         $('#config-authEmail').hide();

         $('#common-setting-tab').removeClass("disabled");
         $('#kintone-setting-tab').removeClass("disabled");
         $('#app-setting-tab').removeClass("disabled");
         $('#group-setting-tab').removeClass("disabled");
         $('#user-setting-tab').removeClass("disabled");

         $('#licence-setting-tab').removeClass('active show')
         $('#licence-setting').removeClass('active show')
         $('#common-setting-tab').addClass('active show')
         $('#common-setting').addClass('active show')
     } else {
         console.log("*** [有-旧認証から新認証に乗り換え]****");
         console.log("***  Email 表示 ****");
         $('#submitCancelBtn').hide();

         $('#common-setting-tab').addClass("disabled");
         $('#kintone-setting-tab').addClass("disabled");
         $('#app-setting-tab').addClass("disabled");
         $('#group-setting-tab').addClass("disabled");
         $('#user-setting-tab').addClass("disabled");
     }
     if (conf['authKey']) {//アクティベートキーがあれば認証不可にする。
         $('#authKey').prop("disabled", true);
     }

     //check chobiit auth
     if (authState == 'trialEnd' || authState == 'NotActive'){
        $('#licence-setting-tab').addClass('active show')
        $('#licence-setting').addClass('active show')
        $('#common-setting-tab').removeClass('active show')
        $('#common-setting').removeClass('active show')

        $('#common-setting-tab').addClass("disabled");
        $('#kintone-setting-tab').addClass("disabled");
        $('#app-setting-tab').addClass("disabled");
        $('#group-setting-tab').addClass("disabled");
        $('#user-setting-tab').addClass("disabled");
     }
     if (authState == 'trialStart'){
        let today = new Date();
        let eDate = new Date(endDate);
        if (today > eDate){
            $('#licence-setting-tab').addClass('active show')
            $('#licence-setting').addClass('active show')
            $('#common-setting-tab').removeClass('active show')
            $('#common-setting').removeClass('active show')

            $('#common-setting-tab').addClass("disabled");
            $('#kintone-setting-tab').addClass("disabled");
            $('#app-setting-tab').addClass("disabled");
            $('#group-setting-tab').addClass("disabled");
            $('#user-setting-tab').addClass("disabled");
        }
     }

           //licence setting handle----------------------------------------------------------------
     // 「お試し開始」ボタン押下時
     $('#tryBtn').click(function () {
        console.log("***お試し開始ボタン押下 ****");

        if (doAuthentication()) {
            $('#tryBtn').html(`<span class="spinner-border spinner-border-sm"></span>`)
            conf['authKey'] = $('#authKey').val();

            conf['authEmail'] = $('#authEmail').val();

            let kintoneDomain = domain;
            let checkEnvironmentExistPromise = new Promise((resolve, reject) => {
                let url = configApi.getDistribution;
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var response = this.response;
                        if (typeof response != 'object'){
                            response = JSON.parse(response);
                        }
                        if (response.body){
                            let body = JSON.parse(response.body);
                            if (body.code === 200) {
                                resolve(body);
                            } else {
                                swal(
                                    translateCommon("failure-title"),
                                    translateError("failed-to-create-chobiit-environment"),
                                    'error'
                                );
                                reject(body);
                            }
                        }else{
                            swal(
                                translateCommon("failure-title"),
                                translateError("failed-to-create-chobiit-environment"),
                                'error'
                            );
                            reject(this.response);
                        }
                    }
                };
                xhr.open('GET', url);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.responseType = 'json';
                xhr.send();
            })

            checkEnvironmentExistPromise.then(resp => {
                //console.log('list distribution resp' +JSON.stringify(resp,null, 2));
                const listDomain = resp.distributionsInfo.map(item => item.Aliases.Items[0])
                const subdomain = kintoneDomain.substr(0, kintoneDomain.indexOf('.'));
                const chobiitDomain = `${subdomain}.${process.env.CHOBIIT_DOMAIN_NAME}`;

                if (listDomain.includes(chobiitDomain)){
                    kintone.plugin.app.setConfig(conf);
                }else{
                    //Chobiitの環境を作成
                    $('#tryBtn').html(translateInfo("start-your-chobiit-trial"));
                    let loading = $.dialog({
                        icon: 'fa fa-spinner fa-spin',
                        title: translateCommon("constructing-chobiit-environment"),
                        content: translateInfo("constructing-chobiit-environment"),
                        boxWidth: '30%',
                        useBootstrap: false,
                        theme: 'supervan',
                        closeIcon: false,
                    });
                    let createDistributionPromise = new Promise((resolve, reject) => {
                        let url = `${configApi.createDistribution}?domain=${kintoneDomain}`;
                        let xhr = new XMLHttpRequest();
                        xhr.onreadystatechange = function () {
                            if (this.readyState === 4 && this.status === 200) {
                                var response = this.response;
                                if (typeof response != 'object'){
                                    response = JSON.parse(response);
                                }
                                if(response.body){
                                    let body = JSON.parse(response.body);
                                    if (body.code === 200) {
                                        resolve(body.distributionId);
                                    } else {
                                        reject(body.message);
                                    }
                                }else{
                                    reject(this.response)
                                }
                            }
                        };
                        xhr.open('GET', url);
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.responseType = 'json';
                        xhr.send();
                    })

                    createDistributionPromise.then(function (distributionId) {
                        console.log('distribution id: ' + distributionId);

                        var requestLoop = setInterval(function () {
                            let url = `${configApi.getDistribution}?id=${distributionId}`;
                            let xhr = new XMLHttpRequest();
                            xhr.onreadystatechange = function () {
                                if (this.readyState === 4 && this.status === 200) {
                                    var response = this.response;
                                    if (typeof response != 'object'){
                                        response = JSON.parse(response);
                                    }
                                    if (response.body){
                                        let body = JSON.parse(response.body);
                                        if (body.code === 200) {
                                            if (body.distributionState == 'Deployed') {
                                                clearInterval(requestLoop);
                                                loading.close();
                                                swal(
                                                    translateCommon("success-title"),
                                                    translateInfo("succeeded-in-creating-chobiit-environment"),
                                                    'success'
                                                ).then(function () {
                                                        kintone.plugin.app.setConfig(conf);
                                                    })
                                            }
                                        } else {
                                            loading.close()
                                            swal(
                                                translateCommon("failure-title"),
                                                translateError("failed-to-create-chobiit-environment"),
                                                'error'
                                            );
                                            storeErr(err, 'create distribuion');
                                            clearInterval(requestLoop)
                                        }
                                    }else{
                                        loading.close()
                                        swal(
                                            translateCommon("failure-title"),
                                            translateError("failed-to-create-chobiit-environment"),
                                            'error'
                                        );
                                        storeErr(err, 'create distribuion');
                                        clearInterval(requestLoop)
                                    }
                                }
                            };
                            xhr.open('GET', url);
                            xhr.setRequestHeader('Content-Type', 'application/json');
                            xhr.responseType = 'json';
                            xhr.send();
                        }, 60000)

                    }).catch(function (err) {
                        console.error(err);
                        loading.close()
                        swal(
                            translateCommon("failure-title"),
                            translateError("failed-to-create-chobiit-environment"),
                            'error'
                        );
                        storeErr(err, 'create distribuion');
                    })
                }
            }).catch(err => {
                console.error(err);
                swal(
                    translateCommon("failure-title"),
                    translateError("failed-to-create-chobiit-environment"),
                    'error'
                );
                storeErr(err, 'create distribuion');
            })

        }
    });

    $('#submitBtn').click(async function(){
        if (!doAuthentication()) {
            return;
        }

        if (authState == 'trialEnd' || authState == 'NotActive'){
            let  config = {};
            config['authKey'] = $('#authKey').val(); // 2018/06/18 ADD START 認証処理変更
            config['authEmail'] = $('#authEmail').val();  // 2018/06/18 ADD START 認証処理変更
            config['appSettingToken'] = configApiToken;
            config['userAuth'] = conf['userAuth'];
            config['userAuthApps'] =  conf['userAuthApps'];
            config['userAuthKintones'] =  conf['userAuthKintones'];  
            config['jsCustomAll'] =  conf['jsCustomAll'];
            config['cssCustomAll'] =  conf['cssCustomAll'];
            config['logoPattern'] = conf['logoPattern'];
            if (conf['showName']) {
                config['showName'] = conf['showName']
            }
            if (conf['logofile']) {
                config['logofile'] = conf['logofile']
            }
            kintone.plugin.app.setConfig(config);
        }else{
            let config = {};
            config['authKey'] = $('#authKey').val(); // 2018/06/18 ADD START 認証処理変更
            config['authEmail'] = $('#authEmail').val();  // 2018/06/18 ADD START 認証処理変更

            let logoPatternValue = $('input[name="logo-partten"]:checked').val();
            let showName = $('#showName').val()
            let logofile = $('#selectLogo')[0].files[0];
            let appSettingToken = escapeOutput($('#appSettingToken').val());

            //check file size
            if(logofile && logofile.size > 50000 & logoPatternValue != 1){
                swal(
                    translateCommon("input-error-title"),
                    translateError("select-smaller-file-than-50-kb"),
                    'error'
                );
                return;
            }

            if (!showName){
                if (logoPatternValue == 1 || logoPatternValue == 2){
                    swal(
                        translateCommon("input-error-title"),
                        translateError("please-input-display-name"),
                        "error"
                    );
                    return;
                }
            }

            if (showName.length > 32){
                if (logoPatternValue == 1 || logoPatternValue == 2){
                    swal(
                        translateCommon("input-error-title"),
                        translateError("max-length-of-display-name-is-32"),
                        "error"
                    );
                    return;
                }
            }

            showName = escapeOutput(showName);

            if (!logofile && !conf.logofile){
                if (logoPatternValue == 0 || logoPatternValue == 2){
                    swal(
                        translateCommon("input-error-title"),
                        translateError("please-select-log-file"),
                        "error"
                    );
                    return;
                }
            }

            config['logoPattern'] = logoPatternValue;
            if (logoPatternValue == 0){
                if (conf.logofile){
                    config['logofile'] = conf.logofile;
                }
                if (logofile){
                    config['logofile'] = await getBase64(logofile);
                }
            }else if (logoPatternValue == 1){
                config['showName'] = showName;
            }else {
                config['showName'] = showName;
                if (conf.logofile){
                    config['logofile'] = conf.logofile;
                }
                if (logofile){
                    config['logofile'] = await getBase64(logofile);
                }
            }

            if(!appSettingToken){
                swal(
                    translateCommon("input-error-title"),
                    translateError("enter-api-token-of-chobiit-setting-app"),
                    "error"
                );
                return;
            }

            if (appSettingToken.length > 128){
                swal(
                    translateCommon("input-error-title"),
                    translateError("max-length-of-api-token-is-128"),
                    "error"
                );
                return;
            }

            let checkAppSettingTokenResp = await checkApiToken(appSettingToken, appSettingId);
            if(!checkAppSettingTokenResp){
                swal(
                    translateCommon("input-error-title"),
                    translateError("invalid-api-token-for-chobiit-setting-app"),
                    "error"
                );
                return;
            }

            let userAuth = false;
            let userAuthApps = [];
            let userAuthKintones = [];


            if ($('#user-auth-cond').is(':checked')){
                userAuth = true;
                $('.user-auth-app').each(function(){
                    let userAuthApp = $(this).val();
                    if (userAuthApp) userAuthApps.push(userAuthApp)
                });

                if (!userAuthApps.length){
                    swal(
                        translateCommon("input-error-title"),
                        translateError("select-user-auth-apps"),
                        "error"
                    );
                    return;
                }else{
                    let userAuthAppDuplicate = checkDuplicate(userAuthApps);
                    if (userAuthAppDuplicate){
                        swal(
                            translateCommon("input-error-title"),
                            translateError("some-user-auth-apps-are-duplicated"),
                            "error"
                        );
                        return;
                    }
                }

                $('.user-auth-kintone').each(function(){
                    let userAuthKintone = $(this).val();
                    if (userAuthKintone) userAuthKintones.push(userAuthKintone)
                });

                if (!userAuthKintones.length){
                    swal(
                        translateCommon("input-error-title"),
                        translateError("select-kintone-account-associations"),
                        "error"
                    );
                    return;
                }else{
                    let userAuthKintoneDuplicate = checkDuplicate(userAuthKintones);
                    if (userAuthKintoneDuplicate){
                        swal(
                            translateCommon("input-error-title"),
                            translateError("some-kintone-account-associations-are-duplicated"),
                            "error"
                        );
                        return;
                    }
                }

                // userAuthGroup = $('#user-auth-group').val();
                // if (!userAuthGroup){
                //     swal('エラー','Chobiitグループの紐付けを選択して下さい','error');
                //     return;
                // }

            }

            let jsCustomAll = [];
            let cssCustomAll = [];

            const jsCustomTempAll = $('.js-custom-all').toArray()
            for (let i = 0; i < jsCustomTempAll.length; i++){
                const $jsLink =$(jsCustomTempAll[i])

                const hasFileId = $jsLink.attr('fileId')
                const hasFileUrl = $jsLink.attr('fileUrl')

                if (hasFileUrl){
                    jsCustomAll.push(hasFileUrl);
                    continue;
                }

                if (hasFileId){
                    let found = fileSpaceAll.find(x => x.fileId == hasFileId);
                    if (found){
                        let foundLink = await getUploadLink(found);
                        jsCustomAll.push(foundLink)
                        continue;
                    }
                }

                const jsLink = $jsLink.val();
                if (jsLink && jsLink !==  'https://' && jsLink.indexOf('https://') != -1){
                    jsCustomAll.push(jsLink);
                }

            }

            const cssCustomTempAll = $('.css-custom-all').toArray()
            for (let i = 0; i < cssCustomTempAll.length; i++){
                const $cssLink =$(cssCustomTempAll[i])

                const hasFileId = $cssLink.attr('fileId')
                const hasFileUrl = $cssLink.attr('fileUrl')

                if (hasFileUrl){
                    cssCustomAll.push(hasFileUrl);
                    continue;
                }

                if (hasFileId){
                    let found = fileSpaceAll.find(x => x.fileId == hasFileId);
                    if (found){
                        let foundLink = await getUploadLink(found);
                        cssCustomAll.push(foundLink)
                        continue;
                    }
                }

                const cssLink = $cssLink.val();
                if (cssLink && cssLink !==  'https://' && cssLink.indexOf('https://') != -1){
                    cssCustomAll.push(cssLink);
                }

            }

            $(this).html(saveLoadingBtn);
            config['userAuth'] = JSON.stringify(userAuth);
            config['userAuthApps'] = JSON.stringify(userAuthApps);
            config['userAuthKintones'] = JSON.stringify(userAuthKintones);

            config['appSettingToken'] = appSettingToken;
            config['jsCustomAll'] = JSON.stringify(jsCustomAll);
            config['cssCustomAll'] = JSON.stringify(cssCustomAll);


            let chobiitConfigData = {};
            chobiitConfigData['domain'] = domain;
            
            /**
             * # FIXME
             * なぜUS版だけこの処理があるのか調査して解消する。
             */
            if (process.env.CHOBIIT_LANG === "en") {
                chobiitConfigData['maxUser'] = 10;
            }

            chobiitConfigData['showName'] = config.showName || false;
            chobiitConfigData['logoPattern'] = config.logoPattern;
            chobiitConfigData['logofile'] = config.logofile || false;
            chobiitConfigData['appSettingToken'] = config.appSettingToken;
            chobiitConfigData['appSettingId'] = appSettingId;
            chobiitConfigData['userAuth'] = userAuth;
            chobiitConfigData['userAuthApps'] = userAuthApps;
            chobiitConfigData['userAuthKintones'] = userAuthKintones;
            chobiitConfigData['jsCustomAll'] = jsCustomAll;
            chobiitConfigData['cssCustomAll'] = cssCustomAll;


            // chobiitConfigData = iterateXss(chobiitConfigData)

            console.log('---------chobiitConfigData-------')
            console.log(chobiitConfigData);

            jQuery.ajax({
                type: 'PUT',
                contentType: 'application/json',// 2018/06/27 ADD
                url: configApi.getConfig,
                headers: { 'X-Api-Key': apiKey },
                data: JSON.stringify(chobiitConfigData),
                crossDomain: true,
            })
            .done(function (response) {
                console.log("API kintonetodynamo のレスポンス ****");
                console.log(response);

                if (response) {
                    if (response == 200) {
                        console.log('response', response);
                        kintone.plugin.app.setConfig(config);
                    } else {
                        /**
                         * # FIXME
                         * ここのエラーメッセージ、日本版が特に変だと考えます。何を持って IP アドレス制限が原因と考えているのか、全く意味がわからない。
                         * そして、US 版は IP アドレス制限とは全く異なるニュアンスのメッセージになっている。
                         * 
                         * 適切なエラーメッセージを設計すること。
                         */
                        let errorMessage;
                        
                        if (process.env.CHOBIIT_LANG === "ja") {
                            errorMessage = "IPアドレス制限が設定されています。\nCybozu.com Storeより、ChobiitのIPアドレスの許可設定を行ってください。\n詳細：https://www.novelworks.jp/chobiit/manual/new/#manual16";
                        }
                        
                        if (process.env.CHOBIIT_LANG === "en") {
                            errorMessage = "An error occurred during processing.\nRefresh the page and start again from the beginning.\nErrorCode = " + response.stateCode;
                        }

                        swal(translateCommon("input-error-title"), errorMessage, "error");
                        return;
                    }
                } else {
                    /**
                     * # FIXME
                     * ここのエラーメッセージ、日本版が特に変だと考えます。何を持って IP アドレス制限が原因と考えているのか、全く意味がわからない。
                     * そして、US 版は IP アドレス制限とは全く異なるニュアンスのメッセージになっている。
                     * 
                     * 適切なエラーメッセージを設計すること。
                     */
                    let errorMessage;
                    
                    if (process.env.CHOBIIT_LANG === "ja") {
                        errorMessage = "IPアドレス制限が設定されています。\nCybozu.com Storeより、ChobiitのIPアドレスの許可設定を行ってください。\n詳細：https://www.novelworks.jp/chobiit/manual/new/#manual16";
                    }
                    
                    if (process.env.CHOBIIT_LANG === "en") {
                        errorMessage = "An error occurred during processing.\nRefresh the page and start again from the beginning.\nErrorCode = " + response.stateCode;
                    }

                    swal(translateCommon("input-error-title"), errorMessage, "error");
                    return;
                }
            })
            .fail(function (err) {
                swal(
                    translateCommon("input-error-title"),
                    JSON.stringify(err),
                    "error"
                );
                return;
            });
        }
    })

    //Cancel button handle---------------------------------------------
    $('#cancelBtn').click(function () {
        history.back();
    });

    $('#selectLogo').change(function () {
        let file = this.files[0];
        if(file){
            let fileUrl = URL.createObjectURL(file);
            $('#showLogo').html(`<img src='${fileUrl}' class='chobit-logo'>`)
        }
    })

    $(".add-custom").on( "click", function(){
        let clickedBodyTable = $(this).parent().parent().parent();;
        let cloneClikedTr = clickedBodyTable.children().first().clone(true);

        cloneClikedTr.find('input').val('https://');
        cloneClikedTr.find('input').prop('disabled',false)

        let clickedTr = $(this).parent().parent();
        clickedTr.after(cloneClikedTr);
    });

    $(".remove-custom").click(function(){
        let $tr =  $(this).parent().parent();
        if($tr.siblings().length >= 1){
             $tr.remove();
        }else{
            const $custom = $tr.find('.js-custom-all').length ?  $tr.find('.js-custom-all') : $tr.find('.css-custom-all');
            if ($custom.length && $custom.is(":disabled")){
                $custom.val('');
                $custom.attr('fileId','');
                $custom.attr('fileUrl','');
                $custom.prop('disabled',false);

            }
        }
    });

    $('input[type=radio][name=logo-partten]').change(function() {
        if (this.value == 0) {
            $('#name-input').hide();
            $('#file-select').show();
        }else if(this.value == 1){
            $('#name-input').show();
            $('#file-select').hide();
        }else {
            $('#name-input').show();
            $('#file-select').show();
        }
    });

    $('#user-auth-cond').change(function(){
        if(this.checked){
            $('.user-auth-app-selection').fadeIn('slow');
        }else {
            $('.user-auth-app-selection').fadeOut('slow');
        }
    })

    $(".add-user-auth-app").on( "click", function(){
        let clickedBodyTable = $(this).parent().parent().parent();;
        let cloneClikedTr = clickedBodyTable.children().first().clone(true);

        cloneClikedTr.find('select').val('')

        let clickedTr = $(this).parent().parent();
        clickedTr.after(cloneClikedTr);
    });

    $(".remove-user-auth-app").click(function(){
        let $tr =  $(this).parent().parent();
        if($tr.siblings().length >= 1){
             $tr.remove();
        }
    });

    let fileSpaceAll = [];
    $(".input-file-custom-all").change(function() {
        let files = Array.from(this.files);

        if(files.length){
            files.forEach(file=> {
            const fileId = getUniqueStr();


                fileSpaceAll.push({
                    fileId : fileId,
                    file : file
                });

                let lastRow = $(this).closest('.custom-setting-all').find('tr').last();
                let cloneRow = lastRow.clone(true);
                cloneRow.find('input').val(file.name);
                cloneRow.find('input').prop('disabled',true);
                cloneRow.find('input').attr('fileId',fileId);
                cloneRow.find('input').attr('fileUrl','');
                lastRow.after(cloneRow);

                if (lastRow.find('input').val() == "" || lastRow.find('input').val() == "https://"){
                lastRow.remove();
            }

            });
        }
        $(this).val('')
    });




      // load config
    //--------------------------------------------------------------
    let loadingConfig = $.dialog({
        icon: 'fa fa-spinner fa-spin',
        title: '',
        content: translateInfo("getting-configuration-information"),
        boxWidth: '30%',
        useBootstrap: false,
        theme: 'supervan',
        closeIcon: false,
    });

    let allConfigData = await getAllConfigData();
    let allConfigUsers = await getAllConfigUser().catch(err => console.log(err));
    let allConfigDataGroups =   allConfigData &&  allConfigData.data && allConfigData.data.groups ? allConfigData.data.groups : [];

    if (allConfigUsers && allConfigData && allConfigData.data){
        allConfigData.data.users = allConfigUsers;
    }

    loadingConfig.close();

    if(!allConfigData.data){ //when config not setting
        $('#kintone-setting-tab').addClass("disabled");
        $('#app-setting-tab').addClass("disabled");
        $('#group-setting-tab').addClass("disabled");
        $('#user-setting-tab').addClass("disabled");
        return;
    }

    /**
     * # 注意
     * 日本版・US版で差分が発生している。以下のチケット・PR で発生：
     * - https://noveldev.backlog.com/view/CHOBIIT-65
     * - https://noveldev.backlog.com/git/CHOBIIT/chobiit-prod-archived/pullRequests/38
     */
    const maxNumberOfUsers = maxUser(allConfigData, limit)

    let countConfig = allConfigData.data.config.count;
    let countCommon = 0;
    if (countConfig) {
        let countArr = countConfig.byApp;
        countArr.map(ct => {
            countCommon = countCommon + ct.total;
        })
    }
    $('#common-request').text(`${translateInfo("total-requests-count")}: ${countCommon}`);
    if (allConfigData.data.buyRequest){
        const buyRequest = allConfigData.data.buyRequest;
        const startContract = allConfigData.data.startContract;

        let usedRequest = moment().format('YYYY-MM-DD') < startContract ? 0 : countCommon;
        $('#common-request').after(`<span class="badge badge-pill badge-primary" style="font-size: 100%;margin-left: .5rem;">${translateInfo("purchased-requests-count")}： <span style="color: ${+usedRequest >= +buyRequest ? "#C1272D": "white"};">${usedRequest}</span>/${buyRequest}</span>`)
    }

    let kintoneUserList = await fetchUsers();
    let appList = await getAllAppInfo();

    //common setting handle----------------------------------------
    makeUserAuthAppsOption();
    makeUserAuthKintoneOption();
    // makeUserAuthGroupOption();




    if (conf) {
        $('#authKey').val(conf['authKey']);
        $('#authEmail').val(conf['authEmail']);
        $('input[value=' + conf["logoPattern"] + ']').prop('checked', true);
        $('#appSettingToken').val(conf['appSettingToken']);

        if(conf.logoPattern == 0){
            $('#name-input').hide();
            $('#file-select').show();
        }else if (conf.logoPattern == 1){
            $('#name-input').show();
            $('#file-select').hide();
        }else {
            $('#name-input').show();
            $('#file-select').show();
        }

        if(conf.showName){
            $('#showName').val( $('<div/>').html(conf.showName).text());
        }

        if (conf.logofile) {
            $('#showLogo').html(`<img src='${conf.logofile}' class='chobit-logo'>`)
        }

        if (conf.userAuth == 'true'){
            let userAuthAppsConfig = JSON.parse(conf.userAuthApps);

            $('#user-auth-cond').attr('checked',true);
            $('.user-auth-app-selection').fadeIn('slow');

            for (let i = 1; i <userAuthAppsConfig.length; i ++){
                $(".user-auth-app-setting").find(".add-user-auth-app").first().trigger('click');
            }

            userAuthAppsConfig.forEach((app,index) => {
                $('.user-auth-app').eq(index).val(app);
            })

            let userAuthKintonesConfig = JSON.parse(conf.userAuthKintones)
            for (let i = 1; i <userAuthKintonesConfig.length; i ++){
                $(".user-auth-kintone-setting").find(".add-user-auth-app").first().trigger('click');
            }

            userAuthKintonesConfig.forEach((user,index) => {
                $('.user-auth-kintone').eq(index).val(user);
            })

            // if (conf.userAuthGroup){
            //     $('#user-auth-group').val(conf.userAuthGroup);
            // }

        }

        if (conf.jsCustomAll){
            let jsCustomAll = JSON.parse(conf.jsCustomAll);

            for (let i = 1; i <jsCustomAll.length; i ++){
                $('#js-setting-all').find('.add-custom').first().trigger('click');
            }
            jsCustomAll.forEach((link,index) => {
                if (link.indexOf(domain) != -1){
                    let fileName = link.substr(link.lastIndexOf('/')+1);
                    $('.js-custom-all').eq(index).val(fileName);
                    $('.js-custom-all').eq(index).prop('disabled',true);
                    $('.js-custom-all').eq(index).attr('fileUrl',link)
                }else{
                    $('.js-custom-all').eq(index).val(link);
                }
            })
        }

        if (conf.cssCustomAll){
            let cssCustomAll = JSON.parse(conf.cssCustomAll);

            for (let i = 1; i <cssCustomAll.length; i ++){
                $('#css-setting-all').find('.add-custom').first().trigger('click');
            }
            cssCustomAll.forEach((link,index) => {
                if (link.indexOf(domain) != -1){
                    let fileName = link.substr(link.lastIndexOf('/')+1);
                    $('.css-custom-all').eq(index).val(fileName);
                    $('.css-custom-all').eq(index).prop('disabled',true);
                    $('.css-custom-all').eq(index).attr('fileUrl',link)
                }else{
                    $('.css-custom-all').eq(index).val(link);
                }
            })
        }

    }








    //kintone setting handle-------------------------------------------------------------
    let kintoneUserDataSet = allConfigData.data.kintoneUsers.map(x => {
        return [editRecordBtn + deleteRecordBtn, x.kintoneLoginName, x.cybozuToken.split('').map(x => '*').join('')]
    })

    let kintoneUserTable = $('#kintone-user-table').DataTable( {
        autoWidth: false,
        /**
         * # 注意
         * US版は DataTable の`language`オプションについてはデフォルト設定を使っている模様。
         * 参照：https://datatables.net/reference/option/language
         */
        ...(process.env.CHOBIIT_LANG === "ja" ? {
            language: {
                "lengthMenu": "表示する件数 _MENU_ ",
                "zeroRecords": "該当するレコードがありません。",
                "info": " _START_ - _END_ 件表示  (_TOTAL_件中)",
                "infoEmpty": "0 - 0 件表示　(_TOTAL_件中)",
                "infoFiltered": "",
                "paginate": {
                    "previous": "戻る",
                    "next": "次へ"
                },
                "search": "検索"
            },
        } : {}),
        data: kintoneUserDataSet,
        columns: [
            {title: "&nbsp;"},
            { title: translateInfo("kintone-setting.kintone-login-name") },
            { title: "cybozuToken" }
        ],
        pageLength : 10,
        lengthChange: false
    } );

    let kintoneUserAddBtn = ` <button type="button" class="btn action-button" id="kintone-user-add" style="margin: 0rem .5rem 1rem 0rem;" ><i class="fas fa-plus"></i> ${translateInfo("kintone-setting.add-button-label")}</button>`;
    let kintoneUserImportBtn = `<button type="button" class="btn csv-ie-button" id="kintone-user-csv-im" style="margin: 0rem .2rem 1rem 0rem;"><i class="fas fa-file-upload"></i> ${translateInfo("kintone-setting.import-button-label")}</button>`
    let kintoneUserExportBtn = ` <button type="button" class="btn csv-ie-button" id="kintone-user-csv-ex" style="margin: 0rem .2rem 1rem 0rem;"><i class="fas fa-file-download"></i> ${translateInfo("kintone-setting.export-button-label")}</button>`;
    $('#kintone-user-table_wrapper').children().first().children().first().append(kintoneUserAddBtn+kintoneUserImportBtn+kintoneUserExportBtn);
    $('#kintone-user-add').click(function(){
        let jcCreateKintoneUser =  $.confirm({
            animateFromElement: false,

            title: translateInfo("kintone-setting.create-user-setting-modal-title"),
            content: kintoneSettingRecord,
            buttons: {
                formSubmit: {
                    text: translateCommon("save"),
                    btnClass: 'btn-info add-kintone-user',
                    action: function () {
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {
                kintoneUserList.forEach(user => {
                    let option = document.createElement('option');
                    option.setAttribute('value', user.code);
                    let esSapce = document.createTextNode(escapeOutput(user.name + " (" + user.code + ")"));
                    option.appendChild(esSapce);
                    $('#list-kintone-user-name').append(option);
                })
                $('.add-kintone-user').click(async function(){
                    try{
                        let password = $('#kintone-user-password').val();
                        let loginName = $('#kintone-user-name').val();
                        if(!loginName){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("Please select a Kintone user."),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                        if(!password){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("enter-kintone-user-password"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                        let userNames = kintoneUserTable.column(1).data().toArray();
                        if(userNames.includes(loginName)){
                            $.alert({
                                title: translateCommon("input-duplication-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("this-login-name-is-already-used"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                        //put to Dynamo
                        let cybozuToken = base64EncodeUnicode(loginName+':'+password);

                        let check = await checkCybozuToken(cybozuToken);
                        console.log(check);

                        if (!check){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("this-password-is-invalid"),
                                type: 'red',
                                animateFromElement: false,

                            });
                            return false;
                        }

                        let data = {
                            domain              : domain,
                            kintoneLoginName    : loginName,
                            cybozuToken         : cybozuToken
                        };
                        console.log('starting add kintone user...')
                        $(this).html(saveLoadingBtn);
                        await putKintoneUser(data);
                        //add data to table
                        kintoneUserTable.row.add( [editRecordBtn + deleteRecordBtn,loginName, cybozuToken.split('').map(x => '*').join('')] ).draw(false).page('last').draw('page');
                        allConfigData.data.kintoneUsers.push({kintoneLoginName: loginName, cybozuToken:cybozuToken});

                        //add to user auth
                        $('.user-auth-kintone').append(`<option value="${loginName}">${loginName}</option>`)
                        jcCreateKintoneUser.close();
                        console.log('add kintone user success');
                    }catch(err){
                        jcCreateKintoneUser.close();
                        console.error(err);
                        storeErr(err, 'add kintone user')
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("cannot-setup-kintone-config"),
                            type: 'red',
                            animateFromElement: false,
                        });
                    }
                })
            }
        });

    })
    //export kintone user csv
    $('#kintone-user-csv-ex').click(function(){
        $.confirm({
            animateFromElement: false,

            columnClass: 'col-md-8',
            title: translateInfo("kintone-setting.export-users-modal-title"),
            content: translateInfo("kintone-setting.export-users-modal-description"),
            buttons: {
                formSubmit: {
                    text: translateInfo("kintone-setting.export-users-button-label"),
                    btnClass: 'btn-info ',
                    action: function () {
                        let fileName = `${translateInfo("kintone-setting.export-users-file-name")}.csv`;
                        let header = [
                            translateInfo("kintone-setting.kintone-login-name"),
                            translateInfo("kintone-setting.kintone-password"),
                        ];
                        let dataExport = [header];
                        allConfigData.data.kintoneUsers.forEach(user => {
                            let cybozuTokenDecoded = b64DecodeUnicode(user.cybozuToken)
                            let pass = cybozuTokenDecoded.substr(cybozuTokenDecoded.indexOf(':')+1);
                            dataExport.push([user.kintoneLoginName, pass]);
                        })
                        exportToCsv(fileName, dataExport);
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {

            }
        });
    })
    //import kintone user csv
    $('#kintone-user-csv-im').click(function(){
        let jcKintoneUserImport = $.confirm({
            animateFromElement: false,

            columnClass: 'col-md-8',
            title: translateInfo("kintone-setting.import-users-modal-title"),
            content: `<p>${translateInfo("kintone-setting.import-users-modal-description")}</p>
                    <div class="file-space-chobitone">
                        <label class="btn  file-upload-button" for="kintone-user-file-input">
                            <input id="kintone-user-file-input" accept=".csv" class="kintone-data" type="file" style="display:none"<i class="fas fa-upload"></i> ${translateInfo("kintone-setting.import-users-select-file-button-label")}
                        </label>
                        <div class="label label-info"></div>
                    </div> `,
            buttons: {
                formSubmit: {
                    text: translateInfo("kintone-setting.import-users-button-label"),
                    btnClass: 'btn-info kintone-user-import',
                    action: function () {
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {
                $('#kintone-user-file-input').on("change", function() {
                    let files = this.files;
                    if (files.length) {
                        $(this).parent().next('.label-info').html(files[0].name)
                    }
                });
                $('.kintone-user-import').click(async function(){
                    try{
                        let files = $('#kintone-user-file-input')[0].files;
                        if(!files.length){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("select-a-csv-file"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }

                        let textFile = await readFile(files[0]);
                        if (!textFile){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("csv-headers-are-invalid"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }

                        let datas = CSVToArray(textFile);

                        if (datas[datas.length -1] == ""){
                            datas.pop();
                        }
                        //delete null row
                        datas = datas.filter(data => {
                            let check = false;
                            data.forEach(item => {
                                if (item != ""){
                                    check = true;
                                    return;
                                }
                            })
                            return check;
                        })
                        if (!datas.length){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("csv-headers-are-invalid"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                        if (datas.length == 1){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("there-is-no-user-record"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }

                        let loginNameArr = datas.map(x => x[0])//check duplicate
                        let errFlag = false;
                        //check before submit
                        for (let i = 1; i < datas.length; i ++){
                            let loginName = datas[i][0];
                            let password = datas[i][1];

                            if(!loginName || !password){
                                $.alert({
                                    title: translateCommon("input-error-title"),
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("there-are-some-empty-attributes-in-a-line", {lineNumber: i + 1}),
                                    type: 'red',
                                    animateFromElement: false,
                                });
                                return false;
                            }

                            let cybozuToken = base64EncodeUnicode(loginName+':'+password);
                            let check = await checkCybozuToken(cybozuToken);
                            console.log(check);

                            if (!check){
                                $.alert({
                                    title: translateCommon("input-error-title"),
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("password-is-invalid-in-a-line", {lineNumber: i + 1}),
                                    type: 'red',
                                    animateFromElement: false,

                                });
                                return false;
                            }

                            let userNames = kintoneUserTable.column(1).data().toArray();
                            if(userNames.includes(loginName) || (loginNameArr.indexOf(loginName) > 0 && loginNameArr.indexOf(loginName) != i)){
                                $.alert({
                                    title: translateCommon("input-duplication-error-title"),
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("kintone-login-name-is-duplicated-in-a-line", {lineNumber: i + 1}),
                                    type: 'red',
                                    animateFromElement: false,
                                });
                                return false;
                            }

                            let found = kintoneUserList.find(user => user.code == loginName);
                            if(!found){
                                $.alert({
                                    title: translateCommon("input-error-title"),
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("kintone-login-name-does-not-exist-in-a-line", {lineNumber: i + 1}),
                                    type: 'red',
                                    animateFromElement: false,
                                });
                                return false;
                            }
                        }
                        //submit
                        for (let i = 1; i < datas.length; i ++){
                            const lineNumber = i+1

                            let loginName = datas[i][0];
                            let password = datas[i][1];
                            let cybozuToken = base64EncodeUnicode(loginName+':'+password);
                            let submitData = {
                                domain              : domain,
                                kintoneLoginName    : loginName,
                                cybozuToken         : cybozuToken
                            };

                            console.log('starting add kintone user...')
                            $(this).html(saveLoadingBtn);

                            try {
                                await putKintoneUser(submitData, lineNumber);                                
                            } catch (error) {
                                $(this).html(translateInfo("kintone-setting.import-users-button-label"));
                                errFlag = true;
                                break;
                            }
                            
                            kintoneUserTable.row.add( [editRecordBtn + deleteRecordBtn,loginName, cybozuToken.split('').map(x => '*').join('')] ).draw( false );
                            allConfigData.data.kintoneUsers.push({kintoneLoginName: loginName, cybozuToken:cybozuToken});
                        }
                        if (!errFlag){
                            $.alert({
                                title: translateCommon("success-title"),
                                icon: 'fas fa-check',
                                content: translateInfo("kintone-setting.import-users-succeeded"),
                                type: 'green',
                                animateFromElement: false,
                            });
                            jcKintoneUserImport.close();
                        }
                    }catch(err){
                        jcKintoneUserImport.close();
                        console.error(err);
                        storeErr(err, 'import kintone user')
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("failed-to-import-kintone-users"),
                            type: 'red',
                            animateFromElement: false,
                        });
                    }
                })
            }
        });
    })


    $('#kintone-user-table').on('click','.edit-record',function(){
        console.log('----edit record handle------');
        let tableRow = kintoneUserTable.row($(this).closest('tr'));
        let rowValue =  kintoneUserTable.row(tableRow).data();
        let kintoneUserConfig = allConfigData.data.kintoneUsers.find(x => x.kintoneLoginName == rowValue[1]);
        let jcEditKintoneUser =  $.confirm({
            animateFromElement: false,
            title: translateInfo("kintone-setting.edit-user-setting-modal-title"),
            content: kintoneSettingRecord,
            buttons: {
                formSubmit: {
                    text: translateCommon("save"),
                    btnClass: 'btn-info edit-kintone-user',
                    action: function () {
                       return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {
                $('#kintone-user-name').prop('disabled', true);
                let cybozuToken = kintoneUserConfig.cybozuToken;
                let cybozuTokenDecoded = b64DecodeUnicode(cybozuToken)
                let pass = cybozuTokenDecoded.substr(cybozuTokenDecoded.indexOf(':')+1);
                // $('#kintone-user-password').val(pass)
                kintoneUserList.forEach(user => {
                    let option = document.createElement('option');
                    option.setAttribute('value', user.code);
                    let esSapce = document.createTextNode(escapeOutput(user.name + " (" + user.code + ")"));
                    option.appendChild(esSapce);
                    $('#list-kintone-user-name').append(option);
                })
                $('#kintone-user-name').val(rowValue[1]);
                //submit handle
                $('.edit-kintone-user').click(async function(){
                    try{
                        let password = $('#kintone-user-password').val();
                        let loginName = $('#kintone-user-name').val();
                        if(!loginName){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("select-a-kintone-user"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                        if(!password){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("enter-kintone-user-password"),
                                type: 'red',
                                animateFromElement: false,

                            });
                            return false;
                        }
                        let userNames = kintoneUserTable.column(1).data().toArray();
                        if (loginName != rowValue[1] && userNames.includes(loginName)){
                            $.alert({
                                title: translateCommon("input-duplication-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("this-login-name-is-already-used"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                        //put to Dynamo
                        let cybozuToken = base64EncodeUnicode(loginName+':'+password);

                        let check = await checkCybozuToken(cybozuToken);
                        console.log(check);

                        if (!check){
                            $.alert({
                                title: translateCommon("input-duplication-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("this-password-is-invalid"),
                                type: 'red',
                                animateFromElement: false,

                            });
                            return false;
                        }

                        let data = {
                            domain              : domain,
                            kintoneLoginName    : loginName,
                            cybozuToken         : cybozuToken
                        };
                        console.log('starting updating kintone user');
                        $(this).html(saveLoadingBtn);
                        await putKintoneUser(data);
                        //update data to table
                        kintoneUserTable
                        .row( tableRow )
                        .data([editRecordBtn + deleteRecordBtn,loginName, cybozuToken.split('').map(x => '*').join('')])
                        .draw();
                        //update config data
                        let find = allConfigData.data.kintoneUsers.find(x => x.kintoneLoginName == loginName);
                        if(find){
                            find.cybozuToken = cybozuToken;
                        }
                        console.log('update kintone user success');
                        jcEditKintoneUser.close();
                    }catch(err){
                        jcEditKintoneUser.close();
                        console.error(err);
                        storeErr(err, 'upadte kintone user');
                        $.alert({
                            title: translateCommon("input-duplication-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("cannot-setup-kintone-config"),
                            type: 'red',
                            animateFromElement: false,
                        });
                    }
                })
            }
        });
    })
    //delete kintone user
    $('#kintone-user-table').on('click','.delete-record',function(){
        let $deleteIcon = $(this);
        $.confirm({
            animateFromElement: false,

            title: translateCommon("confirmation-title"),
            content: translateCommon("confirmation-message"),
            buttons: {
                somethingElse: {
                    text: translateCommon("delete"),
                    btnClass: 'btn-red',
                    action: function(){
                        console.log('starting delete kintone user...');
                        let tableRow = kintoneUserTable.row($deleteIcon.closest('tr'));
                        let rowValue =  kintoneUserTable.row(tableRow).data();
                        let kintoneLoginName = rowValue[1];
                        let deleteable = true;
                        if (allConfigData.data.users.map(user=> user.kintoneLoginName).includes(kintoneLoginName)){
                            deleteable = false;
                        }

                        if (allConfigData.data.config.userAuthKintones && allConfigData.data.config.userAuthKintones.includes(kintoneLoginName)){
                            deleteable = false;
                        }
                        if(!deleteable){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("cannot-delete-this-kintone-account-because-it-is-linked"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return;
                        }

                        let URL =  configApi.deleteKintoneUser;
                        const data = {
                            domain : domain,
                            kintoneLoginName : kintoneLoginName
                        }
                        $.ajax({
                            type: 'DELETE',
                            url: URL,
                            dataType: 'json',
                            contentType: 'application/json',
                            data: JSON.stringify(data),
                            headers: { 'X-Api-Key': apiKey },
                            success: function () {
                                console.log('delete user kintone success');
                                kintoneUserTable.row(tableRow).remove().draw(false);
                                for(let i = 0; i < allConfigData.data.kintoneUsers.length; i ++){
                                    let kintoneUserConfig = allConfigData.data.kintoneUsers[i];
                                    if (kintoneUserConfig.kintoneLoginName == kintoneLoginName){
                                        allConfigData.data.kintoneUsers.splice(i, 1);
                                    }
                                }

                                //remove option user auth
                                $(`.user-auth-kintone option[value="${kintoneLoginName}"]`).remove();
                            },
                            error: function () {
                                console.err('delete kintone user fail')
                            }
                        });
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function(){

                    }
                }
            }
        });
    })

    //app setting handle -------------------------------------------------------------------
    //init table
    let appDataSet = allConfigData.data.apps.map(app => [
        putDynamoBtn + editRecordBtn + deleteRecordBtn,
        `<div class="count">${getCountByApp(countConfig, app.app)}</div>`,
        // escapeOutput(app.appName) +` (${app.app})`,
        showAppNameInList(app),
        showAuth(app.auth),
        getListRecordUrl(app),
        getAddRecordUrl(app),
        app.apiToken0,
        app.creator,
        app.editor,
        app.timeCond.createTime || false,
        app.timeCond.editTime || false,
        app.locateCond.latitude || false,
        app.locateCond.longitude || false,
        app.ownerView
    ]);

    function showAppNameInList(app) {
        let docHtml = document.createElement('div');
        let esSapce = document.createTextNode(escapeOutput(app.appName + ` (${app.app})`));
        docHtml.appendChild(esSapce);

        return docHtml.innerHTML ;
    };

    let appTable = $('#app-table').DataTable( {
        autoWidth: false,
        /**
         * # 注意
         * US版は DataTable の`language`オプションについてはデフォルト設定を使っている模様。
         * 参照：https://datatables.net/reference/option/language
         */
        ...(process.env.CHOBIIT_LANG === "ja" ? {
            language: {
                "lengthMenu": "表示する件数 _MENU_ ",
                "zeroRecords": "該当するレコードがありません。",
                "info": " _START_ - _END_ 件表示  (_TOTAL_件中)",
                "infoEmpty": "0 - 0 件表示　(_TOTAL_件中)",
                "infoFiltered": "",
                "paginate": {
                    "previous": "戻る",
                    "next": "次へ"
                },
                "search": "検索"
            },
        } : {}),
        data: appDataSet,
        columns: [
            {title: "&nbsp;"},
            {title: translateInfo("app-setting.table-column.requests-count")},
            {title: translateInfo("app-setting.table-column.app-linked-to-chobiit")},
            {title: translateInfo("app-setting.table-column.chobiit-authentication")},
            {title: translateInfo("app-setting.table-column.list-record-url")},
            {title: translateInfo("app-setting.table-column.add-record-url")},
            {title: translateInfo("app-setting.table-column.api-token")},
            {title: translateInfo("app-setting.table-column.record-creator-field")},
            {title: translateInfo("app-setting.table-column.record-updater-field")},
            {title: translateInfo("app-setting.table-column.record-creation-datetime-field")},
            {title: translateInfo("app-setting.table-column.record-updation-datetime-field")},
            {title: translateInfo("app-setting.table-column.latitude-field")},
            {title: translateInfo("app-setting.table-column.longitude-field")},
            {title: translateInfo("app-setting.table-column.show-own-records-or-not")},
        ],
        pageLength : 10,
        lengthChange: false,
    } );
    $('#app-table').css('width','max-content');

    let appAddBtn = ` <button type="button" class="btn action-button" id="app-add" style="margin: 0rem 0rem 1rem 0rem;" ><i class="fas fa-plus"></i> ${translateInfo("app-setting.table.add-app-button-label")}</button>`;
    $('#app-table_wrapper').children().first().children().first().append(appAddBtn);
    let updateAllBtn = `<button type="button" class="btn btn-primary" id="update-all" style="border: none; margin: 0rem 0rem 1rem 0.5rem;"><i class="fas fa-cloud-upload-alt  small-btn"></i> ${translateInfo("app-setting.table.bulk-update-button-label")}</button>`
    $('#app-table_wrapper').children().first().children().first().append(updateAllBtn);
    //update all
    $('#update-all').click(async function(){
        let loading = $.dialog({
            icon: 'fa fa-spinner fa-spin',
            title: '',
            content: translateInfo("app-setting.table.bulk-update-button-progress-label"),
            boxWidth: '30%',
            useBootstrap: false,
            theme: 'supervan',
            closeIcon: false,
        });

        try {
            await Promise.all(
                allConfigData.data.apps.map(async appConfig => {
                    let app = appConfig.app;
                    let body = {
                        'app' : app
                    }

                    let listkintoneAPi = await Promise.all([
                        kintone.api(kintone.api.url('/k/v1/app/acl', true), 'GET', body),
                        kintone.api(kintone.api.url('/k/v1/record/acl', true), 'GET', body),
                        kintone.api(kintone.api.url('/k/v1/field/acl', true), 'GET', body),
                        kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', body),
                        kintone.api(kintone.api.url('/k/v1/app/form/layout', true), 'GET', body),
                        kintone.api(kintone.api.url('/k/v1/app', true), 'GET', {id : app}),
                        kintone.api(kintone.api.url('/k/v1/app/views', true), "GET", {'app': app}),
                        kintone.api(kintone.api.url('/k/v1/app/status', true), 'GET', body),
                    ]);

                    let appRights = listkintoneAPi[0].rights;
                    let recordRights = listkintoneAPi[1].rights;
                    let fieldRights = listkintoneAPi[2].rights;
                    let fields = listkintoneAPi[3].properties;
                    let formLayout = listkintoneAPi[4].layout;
                    let appName = listkintoneAPi[5].name;
                    let appCreatorCode = listkintoneAPi[5].creator.code;
                    let viewInfo = listkintoneAPi[6].views;
                    const statusInfo = listkintoneAPi[7].enable ? Object.values(listkintoneAPi[7].states) : false
        
                    let relateFieldsInfo = false;
                    let relateFields = Object.values(fields).filter(x => x.type == 'REFERENCE_TABLE');
                    if (relateFields.length){
                        relateFieldsInfo = {};
                        for (let j = 0; j < relateFields.length; j++){
                            if(relateFields[j].referenceTable){
                                let relateApiToken = false;
                                let relateAppId = relateFields[j].referenceTable.relatedApp.app;
                                let displayFields = relateFields[j].referenceTable.displayFields;
                                let relateFieldRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app : relateAppId});
                                let displayFieldsInfo = displayFields.map(field => ({code : relateFieldRes.properties[field].code, label : relateFieldRes.properties[field].label}))

                                let realateAppSettings= allConfigData.data.apps;
                                if (realateAppSettings.length){
                                    let realateAppSetting　= realateAppSettings.find(x => x.app == relateAppId);
                                    if(realateAppSetting && (realateAppSetting.auth == false || realateAppSetting.auth ===  1)){
                                        relateApiToken = realateAppSetting.apiToken0;
                                    }
                                }

                                let obj = {
                                    [relateFields[j].code] : {
                                        displayFieldsInfo : displayFieldsInfo,
                                        relateApiToken : relateApiToken
                                    }
                                }
                                Object.assign(relateFieldsInfo, obj)
                            }
                        }
                    }

                        //get lookup field;
                    let lookupRelateInfo = false;
                    let lookupFields = [];
                    for (let key in fields){
                        if (fields[key].type =='SUBTABLE'){
                            let tFields = fields[key].fields;
                            for (let key3 in tFields){
                                if (tFields[key3].hasOwnProperty('lookup') && tFields[key3].lookup != null){
                                    lookupFields.push(tFields[key3]);
                                }
                            }
                        }
                        else if (fields[key].hasOwnProperty('lookup') && fields[key].lookup != null){
                            lookupFields.push(fields[key]);
                        }
                    }
                    //let listLookupKeyFail = [];
                    let checkLookupKey = true;
                    if (lookupFields.length){
                        if (appConfig.auth){ // check lookup setting
                            for (let i = 0; i < lookupFields.length; i ++ ){
                                let relateAppId = lookupFields[i].lookup.relatedApp.app;
                                let relatedKeyField = lookupFields[i].lookup.relatedKeyField;
                                let relateFieldsResp = await   kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app : relateAppId});
                                let relateFields = relateFieldsResp.properties;
                                if (relateFields[relatedKeyField].type != 'RECORD_NUMBER' && !relateFields[relatedKeyField].unique){
                                    checkLookupKey = false;
                                    //listLookupKeyFail.push(lookupFields[i].code);
                                }
                            }
                        }
                        //lookupFields = lookupFields.filter(x => listLookupKeyFail.indexOf(x.code) == -1)
                        let promises = lookupFields.map(async field => {
                            let fieldCode = field.code;
                            let relateAppId = field.lookup.relatedApp.app;
                            let relateAppApiToken = false;
                            if (appConfig.lookupRelateInfo){
                                let relateConfig = appConfig.lookupRelateInfo.find(x => x.fieldCode == fieldCode);
                                if (relateConfig) relateAppApiToken = relateConfig.relateAppApiToken;
                            }
                            let relateAppResp = await  kintone.api(kintone.api.url('/k/v1/app', true), 'GET', {id : relateAppId});
                            let relateAppName = relateAppResp.name;
                            let relateFieldsResp = await   kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app : relateAppId});
                            let  rlFieldInfo = {};
                            for (let key in relateFieldsResp.properties){
                                let rlField = relateFieldsResp.properties[key];
                                if (field.lookup.lookupPickerFields.includes(rlField.code) || field.lookup.relatedKeyField == rlField.code){
                                    let obj = {
                                        [rlField.code] : rlField.label
                                    };
                                    Object.assign(rlFieldInfo, obj)
                                }
                            }
                            return {
                                fieldCode : fieldCode,
                                fieldMappings: field.lookup.fieldMappings,
                                relateAppName : escapeOutput(relateAppName),
                                relateAppApiToken  : relateAppApiToken,
                                rlFieldInfo : rlFieldInfo
                            }
                        })
                        lookupRelateInfo = await Promise.all(promises);
                    }

                    //check null
                    for (let i = 0; i < appRights.length; i++){
                        if (appRights[i].entity.code == null)
                            appRights[i].entity.code = ' ';
                    }
                    for (var key in fields){
                        for (var key2 in fields[key]){
                            if (fields[key][key2] == ''){
                                fields[key][key2] = ' ';
                            }
                        }
                        if (fields[key].type =='SUBTABLE'){
                            let tFields = fields[key].fields;
                            for (var key3 in tFields){
                                for (var key4 in tFields[key3]){
                                    if (tFields[key3][key4] == ''){
                                        tFields[key3][key4] = ' ';
                                    }
                                }
                                if (tFields[key3].hasOwnProperty('lookup')){
                                    if(!appConfig.auth || tFields[key3].lookup == null){
                                        delete tFields[key3];
                                    } else{
                                        tFields[key3].lookup.relatedApp.code = tFields[key3].lookup.relatedApp.code || ' ';
                                        tFields[key3].lookup.filterCond = tFields[key3].lookup.filterCond || ' ';
                                    }
                                }

                            }
                        }

                        else if (fields[key].type =='REFERENCE_TABLE'){
                            fields[key].referenceTable.filterCond =  fields[key].referenceTable.filterCond || " ";
                            fields[key].referenceTable.relatedApp.code = fields[key].referenceTable.relatedApp.code  || " ";
                        }

                        else if (fields[key].hasOwnProperty('lookup')){
                            if(!appConfig.auth|| fields[key].lookup == null){
                                delete fields[key];
                            } else{
                                fields[key].lookup.relatedApp.code = fields[key].lookup.relatedApp.code || ' ';
                                fields[key].lookup.filterCond = fields[key].lookup.filterCond || ' ';
                            }
                        }
                    }

                    //check null record right
                    for (let j = 0; j < recordRights.length; j ++){
                        if (recordRights[j].filterCond == ""){
                            recordRights[j].filterCond = " ";
                        }
                    }

                    //
                    let recordCond1 =  appConfig.recordCond1;
                    if (recordCond1){
                        let found = Object.values(viewInfo).find(x => x.id == recordCond1.id);
                        recordCond1 = found ? iterate(found) : false;
                    }

                    let data = {
                        saveButtonName : appConfig.saveButtonName,
                        appRights    : appRights,
                        recordRights : recordRights,
                        fieldRights  : fieldRights,
                        fields       : fields,
                        app          : app,
                        appName      : escapeOutput(appName),
                        appCreatorCode: appCreatorCode,
                        locateCond   : appConfig.locateCond,
                        timeCond     : appConfig.timeCond,
                        auth         : appConfig.auth,
                        funcCond0    : appConfig.funcCond0,
                        apiToken0    : appConfig.apiToken0,
                        recordCond0  : appConfig.recordCond0,
                        fieldCond0   : appConfig.fieldCond0,
                        // recordCond1  : appConfig.recordCond1,
                        processCond1 : appConfig.processCond1,
                        domain       : domain,
                        formLayout   : formLayout,
                        thanksPage   : appConfig.thanksPage,
                        templateColor: appConfig.templateColor,
                        showText     : appConfig.showText,
                        creator      : appConfig.creator,
                        editor       : appConfig.editor,
                        calendarView : appConfig.calendarView,
                        notif        : appConfig.notif,
                        /**
                         * # 補足
                         * [CHOBIIT-184](https://noveldev.backlog.com/view/CHOBIIT-184)の対応で`actionCondList`に徐々に移行している。
                         * 古い形のデータにも対応するよう`actionCond`, `webhookSync`を残している。
                         */
                        actionCondList: appConfig.actionCondList,
                        actionCond   : appConfig.actionCond,
                        webhookSync : appConfig.webhookSync,

                        ownerView    : appConfig.ownerView,
                        groupView    : appConfig.groupView,
                        relateFieldsInfo : relateFieldsInfo,
                        lookupRelateInfo : lookupRelateInfo,
                        showComment : appConfig.showComment,
                        appLinkTo : appConfig.appLinkTo,
                        jsCustom: appConfig.jsCustom,
                        cssCustom : appConfig.cssCustom,
                        robotoCheck : appConfig.robotoCheck,
                        autoSendMail : appConfig.autoSendMail,
                        responseControl : appConfig.responseControl,
                        tempSaving : appConfig.tempSaving,
                        lkCompleteMatch : appConfig.lkCompleteMatch,
                        trustedSites: appConfig.trustedSites,
                        statusInfo : statusInfo
                        //evaluateRecordRights: evaluateRecordRights
                    }

                    /**
                     *  一覧ビューを最新のものに置き換える
                     */
                    const views = appConfig.views;
                    if(views !== undefined){
                        data.views = ListViewConfigService.replaceWithLatestViews(views, viewInfo);
                    }

                    if(recordCond1 !== undefined){
                        data.recordCond1 = recordCond1;
                    }


                    if ((appConfig.auth === false || appConfig.auth === 1) &&  lookupRelateInfo && lookupRelateInfo.map(x => x.relateAppApiToken).includes(false)){
                        throw new Error(`[${appName}]${translateInfo("check-api-token-setting-of-the-linked-app")}`);
                    }

                    let dataToDyanmo = Object.assign({},data);
                    let putDynamoPromise  = new Promise((resolve, reject) => {
                        let URL = configApi.manageApp;
                        $.ajax({
                            type: 'POST',
                            url: URL,
                            headers: { 'X-Api-Key': apiKey },
                            dataType: 'json',
                            contentType: 'application/json',
                            data: JSON.stringify(dataToDyanmo),
                            success: function () {
                                console.log('put app to dynamo success');
                                resolve();
                            },
                            error: function (err) {
                                console.error('put app to dynamo fail')
                                reject(err);
                            }
                        })
                    })
                    let createFormPromise = new Promise((resolve, reject) => {
                        console.log('starting create form....')
                        let URL = configApi.createForm;
                        $.ajax({
                            type: 'POST',
                            url: URL,
                            headers: { 'X-Api-Key': apiKey },
                            dataType: 'json',
                            contentType: 'application/json',
                            data: JSON.stringify(data),
                            success: function (resp) {
                                console.log('create form success!!');
                                resolve();
                            },
                            error: function (err) {
                                console.error('create form fail');
                                reject(err);
                            }
                        })
                    })
                    await putDynamoPromise
                    await createFormPromise
                })
            )
            loading.close();
            $.alert({
                title: translateCommon("success-title"),
                icon: 'fas fa-check',
                content: translateInfo("app-setting.table.bulk-update-success-message"),
                type: 'green',
                animateFromElement: false,
            });
        }catch(err){
            loading.close();
            storeErr(err, 'put app to dynamo');
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: err.message || translateError("failed-to-update-linked-apps"),
                type: 'red',
                animateFromElement: false,
            });
        }
    })
    //add app
    $('#app-add').click(function(){
        let jcCreateApp = $.confirm({
            animateFromElement: false,
            columnClass: 'col-md-12',
            title: translateInfo("app-setting.add-app.modal-title"),
            content: appSettingRecord,
            buttons: {
                formSubmit: {
                    text: translateCommon("save"),
                    btnClass: 'btn-info add-app-btn',
                    action: function(){
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {
                $(".add-row-iframe").on('click', function () {
                    const parent = $(this).parent().parent();
                    if (parent.siblings().length == 1) {
                        return
                    }
                    let clickedBodyTable = $(this).parent().parent().parent();
                    let cloneClikedTr = clickedBodyTable.children().first().clone(true);
                    cloneClikedTr.find('.scheme').val('http')
                    cloneClikedTr.find('.domain').val('')
                    cloneClikedTr.find('.domain').val('')
                    let clickedTr = $(this).parent().parent();
                    clickedTr.after(cloneClikedTr);
                });
                $(".remove-row-iframe").on('click', function () {
                    const parent = $(this).parent().parent();
                    if (parent.siblings().length >= 1) {
                        parent.remove();
                    }
                });

                //app handle
                let listAppConfigAuth = [];
                allConfigData.data.apps.forEach(x => {
                    if (x.auth){
                        listAppConfigAuth.push(x.app);
                    }
                });


                //app handle
                appList.forEach(app => {
                    let option = document.createElement('option');
                    option.setAttribute('value', app.appId);
                    let esSapce = document.createTextNode(escapeOutput(app.name));
                    option.appendChild(esSapce);
                    $('#app-list').append(option);

                    if (listAppConfigAuth.includes(app.appId)){
                        $('#app-linkto').append(option);
                    }
                })

                // makeGroupViewOption();

                $('#app').change(async function(){
                    let appValue = $(this).val();
                    if (!appList.map(x => x.appId).includes(appValue)){
                       $(this).val('');
                       return;
                    }
                    if(appValue){
                        makeProcessOption(appValue);
                        makeChobiitFieldOption(appValue);
                        makeFieldCondOption(appValue);
                        makePublicLookupSetting(appValue);
                        await KintoneListViewTable.render({app: appValue}, view)
                        .catch(err =>{
                            const key = err.code === "GAIA_DU01" ? "GAIA_DU01" : "system-error-of-unknown-cause"
                            const detail = err.code === "GAIA_DU01" ? "" : `<br>ERROR: ${err.message}`
                            $.alert({
                                title: translateCommon("warning-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError(key) + detail,
                                type: 'red',
                                animateFromElement: false,
                            });
                            jcCreateApp.close();
                        })

                        // makeCalendarOption(appValue);
                        makeLocationOption(appValue);
                        makeLookupFieldOption(appValue);
                        makeAutoSendMailOption(appValue);
                        makeActionCopyFromOption(appValue);

                        makeSyncKeyOption(appValue, $('.wsync-to-key'))
                        makeUpdateToFieldOption(appValue);
                        makeGroupFieldOption(appValue);

                        $('#list_record_url').val(`${login_url}/public/p_list_record.html?appId=${appValue}`);
                        $('#list_record_iframe_tag').val(`<iframe src="${login_url}/public/p_list_record.html?appId=${appValue}" style="position:relative;width:1px;min-width:80%;*width:80%;" frameborder="0" scrolling="yes" seamless="seamless" height="1563" width="80%"></iframe>`);
                        $('#add_record_url').val(`${login_url}/public/p_add_record.html?appId=${appValue}`);
                        $('#add_record_iframe_tag').val(`<iframe src="${login_url}/public/p_add_record.html?appId=${appValue}" style="position:relative;width:1px;min-width:80%;*width:80%;" frameborder="0" scrolling="yes" seamless="seamless" height="1563" width="80%"></iframe>`);
                    }

                })
                //authen handle
                $('input[name="user_authen"]').change(function(){
                    /**
                     * # 注意
                     * '認証あり', '外部公開', '両方' については、US版でも日本語のままでコーディングしていたためそのままにしている。
                     * チケット：https://noveldev.backlog.com/view/CHOBIIT-207
                     */
                    if (this.value == '認証あり'){
                        $('#authen-panel').show()
                        $('#no-authen-panel').hide()
                    };
                    if (this.value == '外部公開'){
                        $('#authen-panel').hide()
                        $('#no-authen-panel').show()
                    };
                    if (this.value == '両方'){
                        $('#authen-panel').show()
                        $('#no-authen-panel').show()
                    };

                })
                //mail notice handle
                let count = 0;
                $(".add-row").on( "click", function(){

                    if($(this).closest(".action-tr").length && $(".action-tr").length == 5) {
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("can-set-max-five-actions"),
                            type: 'red',
                            animateFromElement: false,
                        });
                        return false;
                    }

                    count ++;
                    let clickedBodyTable = $(this).parent().parent().parent();
                    let cloneClikedTr = clickedBodyTable.children().first().clone(true);

                    cloneClikedTr.find('.text_notif').val('');
                    cloneClikedTr.find('.js-custom').val('https://')
                    cloneClikedTr.find('.css-custom').val('https://')
                    cloneClikedTr.find('.js-custom').prop('disabled',false)
                    cloneClikedTr.find('.css-custom').prop('disabled',false)
                    cloneClikedTr.find('.action_name').val('')
                    cloneClikedTr.find('.wsync-apitoken').val('')

                    let $cbox = cloneClikedTr.find('input[type="checkbox"]');
                    $cbox.each(function(){
                        $(this).next().attr('for',$(this).attr('id')+''+count);
                        $(this).attr('id',$(this).attr('id')+''+count);
                        $(this).prop("checked", false);
                    })

                    if(cloneClikedTr.find('.init-hide').length) {
                        cloneClikedTr.find('.init-hide').each(function(){
                            $(this).hide()
                        })
                    }

                    if (cloneClikedTr.find(".act-map-tr").length) {
                        cloneClikedTr.find(".act-map-tr").each(function(act_i){
                            if(act_i>0) $(this).remove()
                        })

                        cloneClikedTr.find(".wh-map-tr").each(function(wh_i){
                            if(wh_i>0) $(this).remove()
                        })
                    }

                    let clickedTr = $(this).parent().parent();
                    clickedTr.after(cloneClikedTr);
                });

                $(".remove-row").click(function(){
                    let $tr =  $(this).parent().parent();
                    if($tr.siblings().length >= 1){
                         $tr.remove();
                    }else{
                        const $custom = $tr.find('.js-custom').length ?  $tr.find('.js-custom') : $tr.find('.css-custom');
                        if ($custom.length && $custom.is(":disabled")){
                            $custom.val('');
                            $custom.attr('fileId','');
                            $custom.attr('fileUrl','');
                            $custom.prop('disabled',false);

                        }
                    }
                });

                $('.event_notif').change(function(){
                    /**
                     * # 注意
                     * 'レコード編集', 'コメント投稿' については、US版でも日本語のままでコーディングしていたためそのままにしている。
                     * チケット：https://noveldev.backlog.com/view/CHOBIIT-207
                     */
                    if ($(this).val() == 'レコード編集'){
                        $(this).closest('tr').find('input').val(translateInfo("app-setting.add-app.record-edited-message"));
                    }
                    if ($(this).val() == 'コメント投稿'){
                        $(this).closest('tr').find('input').val(translateInfo("app-setting.add-app.comment-posted-message"));
                    }
                })
                //process handle
                $('#pro_cond_1').change(function() {
                    if(this.checked) {
                        $('#pro-setting').fadeIn("slow");
                    }else{
                        $('#pro-setting').fadeOut("slow");
                    }
                });

                //function handle
                $('#view-function').change(function(){
                    if(this.checked){
                        $('#view-function-selection').fadeIn('slow');
                    }else {
                        $('#view-function-selection').fadeOut('slow');
                    }
                })
                $('#add-function').change(function(){
                    if(this.checked){
                        $('#add-function-selection').fadeIn('slow');
                    }else {
                        $('#add-function-selection').fadeOut('slow');
                    }
                })
                $('#iframe-function').change(function(){
                    if(this.checked){
                        $('#iframe-function-selection').fadeIn('slow');
                        $('.iframe-function-tooltip').hide();
                        $('.iframe-function-tooltip2').show();
                    }else {
                        $('#iframe-function-selection').fadeOut('slow');
                        $('.iframe-function-tooltip').show();
                        $('.iframe-function-tooltip2').hide();
                    }
                })
                $('.chobit-copy-button').click(function(){
                    let fieldValue = $(this).parent().find('input').val();
                    var $temp = $("<input>");
                    $("body").append($temp);
                    $temp.val(fieldValue).select();
                    document.execCommand("copy");
                    $temp.remove();
                })

                //field cond handle
                $('#field_cond_0').change(function(){
                    if(this.checked){
                        $('#field-cond-selection').fadeIn('slow');
                    }else {
                        $('#field-cond-selection').fadeOut('slow');
                    }
                })

                 //custom handle
                 let fileSpace = [];
                 $(".input-file-custom").change(function() {
                     let files = Array.from(this.files);

                     if(files.length){
                         files.forEach(file=> {
                            const fileId = getUniqueStr();


                             fileSpace.push({
                                 fileId : fileId,
                                 file : file
                             });

                             let lastRow = $(this).closest('.custom-setting').find('tr').last();
                             let cloneRow = lastRow.clone(true);
                             cloneRow.find('input').val(file.name);
                             cloneRow.find('input').prop('disabled',true);
                             cloneRow.find('input').attr('fileId',fileId);
                             cloneRow.find('input').attr('fileUrl','');
                             lastRow.after(cloneRow);

                             if (lastRow.find('input').val() == "" || lastRow.find('input').val() == "https://"){
                                lastRow.remove();
                            }

                         });
                     }
                     $(this).val('')
                });

                //view handle
                $('#record_cond_1').change(function(){
                    if(this.checked){
                        $('#record-cond-selection').fadeIn('slow');
                    }else {
                        $('#record-cond-selection').fadeOut('slow');
                    }
                })

                //calendar handle
                $('#view_type').change(function(){
                    if(this.checked){
                        $('#view-type-selection').fadeIn('slow');
                    }else {
                        $('#view-type-selection').fadeOut('slow');
                    }
                })

                $('#schedule_color').change(function(){
                    let appValue = $('#app').val();
                    let fieldValue = $(this).val();
                    if(fieldValue && appValue){
                        makeCalendarColorOption(fieldValue, appValue);
                    }
                })

                //group view handle
                $('#group-view-cond').change(function(){
                    if(this.checked){
                        $('#group-view-selection').fadeIn('slow');
                    }else {
                        $('#group-view-selection').fadeOut('slow');
                    }
                })

                 //app linkto handle
                 $('#app-linkto-cond').change(function(){
                    if(this.checked){
                        $('#app-linkto-selection').fadeIn('slow');
                    }else {
                        $('#app-linkto-selection').fadeOut('slow');
                    }
                    onOffLinkAction();
                })


                $('#app-linkto').change(function(){
                    onOffLinkAction();
                })

                //location handle
                $('#locate_cond_1').change(function(){
                    if(this.checked){
                        $('#locate-cond-selection').fadeIn('slow');
                    }else {
                        $('#locate-cond-selection').fadeOut('slow');
                    }
                })

                //auto send mail
                $('#auto_sendmail_cond').change(function(){
                    if(this.checked){
                        $('#auto-sendmail-selection').fadeIn('slow');
                    }else {
                        $('#auto-sendmail-selection').fadeOut('slow');
                    }
                })

                //response control
                $('#response-control').change(function(){
                    if(this.checked){
                        $('#response-control-selection').fadeIn('slow');
                    }else {
                        $('#response-control-selection').fadeOut('slow');
                    }
                })

                //temp-saving
                $('#temp-saving').change(function(){
                    if(this.checked){
                        $('#temp-saving-selection').fadeIn('slow');
                    }else {
                        $('#temp-saving-selection').fadeOut('slow');
                    }
                })

                  //lookup complete match
                  $('#lk-complete-match').change(function(){
                    if(this.checked){
                        $('#lk-complete-match-selection').fadeIn('slow');
                    }else {
                        $('#lk-complete-match-selection').fadeOut('slow');
                    }
                })

                //duaration
                $('#duration').change(function(){
                    if(this.value == 1){
                        $('.duration-setting').show();
                    }else {
                        $('.duration-setting').hide();
                    }
                })

                 //duration-days
                 $('#duration-days').change(function(){
                    let durationDays = $(this).val();
                    $('#duration-text').text('');
                    if (isNaN(durationDays) ||  durationDays < 1 || durationDays > 365){
                        $(this).val('');
                    }else{
                        let outDate = moment().add(durationDays, 'days').format('YYYY-MM-DD');
                        $('#duration-text').text(translateInfo("app-setting.add-app.duration-period-is-up-to", {outDate}));
                    }
                })

                //thanks page handle
                $('#thanks_page').change(function(){
                    if(this.checked){
                        $('#thanks-page-selection').fadeIn('slow');
                        $('#trumbowyg').trumbowyg({
                            btns: [
                                ['viewHTML'],
                                ['undo', 'redo'], // Only supported in Blink browsers
                                ['formatting'],
                                ['strong', 'em', 'del'],
                                ['superscript', 'subscript'],,
                                ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                                ['horizontalRule'],
                                ['removeformat'],
                                ['fullscreen']
                            ]
                        });
                    }else {
                        $('#thanks-page-selection').fadeOut('slow');
                    }
                })



                //action handel
                $('#action_cond').change(function(){
                    if(this.checked){
                        $('#action-cond-selection').fadeIn('slow');
                        $('.wsync-setting').fadeIn('slow');
                    }else {
                        $('#action-cond-selection').fadeOut('slow');
                        $('.wsync-setting').fadeOut('slow');
                    }
                    onOffLinkAction();
                })
                makeActionToAppOption();

                $(document).off('change', '.action_to_app')
                $(document).on('change', '.action_to_app', function(){
                    let actionApp = $(this).val();

                    if (actionApp){
                        makeActionCopyToOptionByAction(actionApp, this);

                        const fromkey = $(this).closest(".action-tr").find(".wsync-from-key")
                        //makeSyncKeyOption(actionApp, $('#wsync-from-key'))
                        makeSyncKeyOption(actionApp, fromkey)
                        makeUpdateFromFieldOptionByApp(actionApp, {change_this: this});
                    }
                    onOffLinkAction();

                });
                $('.action_copy_from').change(function(){
                    makeActionCopyToOptionByCopy(this);
                });

                //複数設定に対応する
                $(document).on("change", ".wsync-cond-trig", function(){
                    if(this.checked){
                        $(this).closest(".wsync-setting").find(".wsync-selection").fadeIn('slow');
                    }else {
                        $(this).closest(".wsync-setting").find(".wsync-selection").fadeOut('slow');
                    }
                });

                $('.wsync-to-field').change(function(){
                    makeUpdateFromFieldOptionByField(this);
                });

                //submit handle
                $('.add-app-btn').on('click',async function(){
                    try {
                        let allSubmitData = await getSubmitAppData('add', fileSpace);
                        if(allSubmitData){
                            if(!allSubmitData.checkLookupKey){
                                $.alert({
                                    title: 'Warning',
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("copy-origin-key-of-lookup-field-must-be-unique"),
                                    type: 'orange',
                                    animateFromElement: false,
                                    buttons: {
                                        OK: async function () {
                                            $(this).html(saveLoadingBtn);
                                            let dataToDyanmo = await submitApp(allSubmitData);
                                            allConfigData.data.apps.push(dataToDyanmo);
                                            appTable.row.add( [
                                                putDynamoBtn + editRecordBtn + deleteRecordBtn,
                                                `<div class="count">${getCountByApp(countConfig, dataToDyanmo.app)}</div>`,
                                                dataToDyanmo.appName +` (${dataToDyanmo.app})`,
                                                showAuth(dataToDyanmo.auth),
                                                getListRecordUrl(dataToDyanmo),
                                                getAddRecordUrl(dataToDyanmo),
                                                dataToDyanmo.apiToken0,
                                                dataToDyanmo.creator,
                                                dataToDyanmo.editor,
                                                dataToDyanmo.timeCond.createTime || false,
                                                dataToDyanmo.timeCond.editTime || false,
                                                dataToDyanmo.locateCond.latitude || false,
                                                dataToDyanmo.locateCond.longitude || false,
                                                dataToDyanmo.ownerView,
                                            ]).draw(false).page('last').draw('page');

                                            //add to user auth
                                            if (dataToDyanmo.auth){
                                                $('.user-auth-app').append(`<option value="${dataToDyanmo.app}"> ${dataToDyanmo.appName} (${dataToDyanmo.app})</option>`)
                                            }


                                            jcCreateApp.close();
                                        },
                                    }
                                });
                            }else{
                                $(this).html(saveLoadingBtn);
                                let dataToDyanmo = await submitApp(allSubmitData);
                                allConfigData.data.apps.push(dataToDyanmo);
                                appTable.row.add( [
                                    putDynamoBtn + editRecordBtn + deleteRecordBtn,
                                    `<div class="count">${getCountByApp(countConfig, dataToDyanmo.app)}</div>`,
                                    dataToDyanmo.appName +` (${dataToDyanmo.app})`,
                                    showAuth(dataToDyanmo.auth),
                                    getListRecordUrl(dataToDyanmo),
                                    getAddRecordUrl(dataToDyanmo),
                                    dataToDyanmo.apiToken0,
                                    dataToDyanmo.creator,
                                    dataToDyanmo.editor,
                                    dataToDyanmo.timeCond.createTime || false,
                                    dataToDyanmo.timeCond.editTime || false,
                                    dataToDyanmo.locateCond.latitude || false,
                                    dataToDyanmo.locateCond.longitude || false,
                                    dataToDyanmo.ownerView
                                ]).draw(false).page('last').draw('page');

                                //add to user auth
                                if (dataToDyanmo.auth){
                                    $('.user-auth-app').append(`<option value="${dataToDyanmo.app}"> ${dataToDyanmo.appName} (${dataToDyanmo.app})</option>`)
                                }
                                view.reset();
                                jcCreateApp.close();
                            }
                        }
                    }catch(err){
                        jcCreateApp.close();
                        console.error(err);
                        storeErr(err, 'upadte app ');
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("you-dont-have-app-manage-permission"),
                            type: 'red',
                            animateFromElement: false,
                        });
                    }
                })
            }
        });
    })
    //edit app
    $('#app-table').on('click','.edit-record',function(){
        let tableRow = appTable.row($(this).closest('tr'));
        let rowValue =  appTable.row(tableRow).data();
        let app = getCode(rowValue[2]);
        let appConfig = allConfigData.data.apps.find(x => x.app == app);
        let jcEditApp = $.confirm({
            animateFromElement: false,
            columnClass: 'col-md-12',
            title: translateInfo("app-setting.edit-app.modal-title"),
            content: appSettingRecord,
            buttons: {
                formSubmit: {
                    text: translateCommon("save"),
                    btnClass: 'btn-info edit-app-btn',
                    action: function(){
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: async function () {
                makeActionToAppOption();
                let count = 0;
                let dataFields = await makeChobiitFieldEditApp(appConfig.app).then(dataField => {return dataField});
                $(".add-row-iframe").click(function () {
                    const parent = $(this).parent().parent();
                    if (parent.siblings().length == 1) {
                        return
                    }
                    let clickedBodyTable = $(this).parent().parent().parent();
                    let cloneClikedTr = clickedBodyTable.children().first().clone(true);
                    cloneClikedTr.find('.scheme').val('http')
                    cloneClikedTr.find('.domain').val('')
                    let clickedTr = $(this).parent().parent();
                    clickedTr.after(cloneClikedTr);
                });
                $(".remove-row-iframe").click(function () {
                    const parent = $(this).parent().parent();
                    if (parent.siblings().length >= 1) {
                        parent.remove();
                    }
                });
                $(".add-row").click(function(){

                    if($(this).closest(".action-tr").length && $(".action-tr").length == 5) {
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("can-set-max-five-actions"),
                            type: 'red',
                            animateFromElement: false,
                        });
                        return false;
                    }

                    count ++;
                    let clickedBodyTable = $(this).parent().parent().parent();
                    let cloneClikedTr = clickedBodyTable.children().first().clone(true);

                    cloneClikedTr.find('.text_notif').val('');
                    cloneClikedTr.find('.js-custom').val('https://')
                    cloneClikedTr.find('.css-custom').val('https://')
                    cloneClikedTr.find('.js-custom').prop('disabled',false)
                    cloneClikedTr.find('.css-custom').prop('disabled',false)
                    cloneClikedTr.find('.action_name').val('')
                    cloneClikedTr.find('.wsync-apitoken').val('')

                    let $cbox = cloneClikedTr.find('input[type="checkbox"]');
                    $cbox.each(function(){
                        $(this).next().attr('for',$(this).attr('id')+''+count);
                        $(this).attr('id',$(this).attr('id')+''+count);
                        $(this).prop("checked", false);
                    })

                    if(cloneClikedTr.find('.init-hide').length) {
                        cloneClikedTr.find('.init-hide').each(function(){
                            $(this).hide()
                        })
                    }

                    if (cloneClikedTr.find(".act-map-tr").length) {
                        cloneClikedTr.find(".act-map-tr").each(function(act_i){
                            if(act_i>0) $(this).remove()
                        })

                        cloneClikedTr.find(".wh-map-tr").each(function(wh_i){
                            if(wh_i>0) $(this).remove()
                        })
                    }

                    let clickedTr = $(this).parent().parent();
                    clickedTr.after(cloneClikedTr);
                });

                $(".remove-row").click(function(){
                    let $tr =  $(this).parent().parent();
                    if($tr.siblings().length >= 1){
                         $tr.remove();
                    }else{
                        const $custom = $tr.find('.js-custom').length ?  $tr.find('.js-custom') : $tr.find('.css-custom');
                        if ($custom.length && $custom.is(":disabled")){
                            $custom.val('');
                            $custom.attr('fileId','');
                            $custom.attr('fileUrl','');
                            $custom.prop('disabled',false);

                        }
                    }
                });

                //app handle
                let listAppConfigAuth = [];
                allConfigData.data.apps.forEach(x => {
                    if (x.auth){
                        listAppConfigAuth.push(x.app);
                    }
                });


                //app handle
                appList.forEach(app => {
                    let option = document.createElement('option');
                    option.setAttribute('value', app.appId);
                    let esSapce = document.createTextNode(escapeOutput(app.name));
                    option.appendChild(esSapce);

                    $('#app-list').append(option);

                    if (listAppConfigAuth.includes(app.appId) && appConfig.app != app.appId){
                        $('#app-linkto').append(option);
                    }
                })

                //set value
                //アプリ
                $('#app').val(appConfig.app);
                $("#app").prop('disabled', true);

                //Chobiitへのログイン認証機能
                $('input[name="user_authen"]').prop('checked',false);
                $('input[name="user_authen"]').each(function(){
                    /**
                     * # 注意
                     * '認証あり', '外部公開', '両方' については、US版でも日本語のままでコーディングしていたためそのままにしている。
                     * チケット：https://noveldev.backlog.com/view/CHOBIIT-207
                     */
                    if (this.value == '認証あり' && appConfig.auth === true){
                        $(this).prop('checked',true);
                        $('#authen-panel').show();
                        $('#no-authen-panel').hide();
                    }

                    if (this.value == '外部公開' && appConfig.auth === false){
                        $(this).prop('checked',true);
                        $('#authen-panel').hide();
                        $('#no-authen-panel').show();
                    }

                    if (this.value == '両方' && appConfig.auth === 1){
                        $(this).prop('checked',true);
                        $('#authen-panel').show();
                        $('#no-authen-panel').show();
                    }
                })

                if(appConfig.auth){
                    //自分のレコードだけ表示
                    if(appConfig.ownerView){
                        $('#owner_view').prop('checked', true);
                    }else {
                        $('#owner_view').prop('checked', false);
                    }

                    //グループのレコードだけ表示
                    makeGroupFieldOption(appConfig.app, dataFields)
                    .then(() => {
                        if (appConfig.groupView){
                            $('#group-view-cond').prop('checked', true);

                            $('#group-view-selection').fadeIn('slow');
                            $('#group-view').val(appConfig.groupView);

                        }
                    })


                    //コメント機能
                    if (appConfig.showComment == true){
                        $('#show-comment').prop('checked', true);
                    }else{
                        $('#show-comment').prop('checked', false);
                    }

                    //アプリ間連携機能
                    if (appConfig.appLinkTo){
                        $('#app-linkto-cond').prop('checked', true);
                        $('#app-linkto-selection').fadeIn('slow');
                        $('#app-linkto').val(appConfig.appLinkTo);
                    }

                    //一覧画面へのリンク名 & レコード追加画面へのリンク名
                    if(appConfig.showText){
                        $('#list_screen').val(appConfig.showText.list);
                        $('#add_screen').val(appConfig.showText.add)
                    }
                    ///Chobiitユーザーにメール通知する条件を選択して下さい
                    for (let i = 1; i < appConfig.notif.length; i++){
                        $('.mail-notif').find('.add-row').first().trigger('click');
                    }
                    appConfig.notif.forEach((item, index) => {
                        $('.event_notif').eq(index).val(item.event);
                        $('.text-field').eq(index).val(item.text);
                    })
                    //プロセス管理を利用してメール通知
                    makeProcessOption(appConfig.app).then(function(){
                        if (appConfig.processCond1){
                            $('#pro_cond_1').prop('checked', true);
                            $('#pro-setting').fadeIn("slow");
                            for (let i = 1; i < appConfig.processCond1.length ; i++){
                                $('#pro-setting').find('.add-row').first().trigger('click');
                            }
                            appConfig.processCond1.forEach((item, index) => {
                                $('.pro_state_value_1').eq(index).val(item.state);
                                $('.pro_alert_content_1').eq(index).val(item.annocument)
                            })
                        }
                    })
                    //レコード作成者 ,Chobiit作成日時, レコード更新者, Chobiit更新日時
                    makeChobiitFieldOption(appConfig.app, dataFields).then(function(){
                        $('#creator').val(appConfig.creator);
                        $('#editor').val(appConfig.editor);
                        $('#create_time').val(appConfig.timeCond.createTime);
                        $('#edit_time').val(appConfig.timeCond.editTime);
                    })

                };
                if (appConfig.auth == false || appConfig.auth === 1){
                    $('#api-token').val(appConfig.apiToken0);
                    //Chobiitで利用する機能
                    $('#list_record_url').replaceWith(`<a  target="_blank"  href="${login_url}/public/p_list_record.html?appId=${appConfig.app}">${login_url}/public/p_list_record.html?appId=${appConfig.app}</a>`);
                    $('#list_record_iframe_tag').val(`<iframe src="${login_url}/public/p_list_record.html?appId=${appConfig.app}" style="position:relative;width:1px;min-width:80%;*width:80%;" frameborder="0" scrolling="yes" seamless="seamless" height="1563" width="80%"></iframe>`);
                    $('#add_record_url').replaceWith(`<a  target="_blank"  href="${login_url}/public/p_add_record.html?appId=${appConfig.app}">${login_url}/public/p_add_record.html?appId=${appConfig.app}</a>`);
                    $('#add_record_iframe_tag').val(`<iframe src="${login_url}/public/p_add_record.html?appId=${appConfig.app}" style="position:relative;width:1px;min-width:80%;*width:80%;" frameborder="0" scrolling="yes" seamless="seamless" height="1563" width="80%"></iframe>`);
                    if(appConfig.funcCond0){
                       if(appConfig.funcCond0.includes('view')){
                            $('#view-function').prop('checked', true);
                            $('#view-function-selection').fadeIn('slow');
                       }
                       if(appConfig.funcCond0.includes('add')){
                            $('#add-function').prop('checked', true);
                            $('#add-function-selection').fadeIn('slow');
                        }
                        if(appConfig.funcCond0.includes('iframe')){
                            $('#iframe-function').prop('checked', true);
                            $('#iframe-function-selection').fadeIn('slow');
                            $('.iframe-function-tooltip').hide();
                            $('.iframe-function-tooltip2').show();
                        }
                    }
                    //フィールドの表示条件
                    makeFieldCondOption(appConfig.app, dataFields).then(function(){
                        if(appConfig.fieldCond0){
                            $('#field_cond_0').prop('checked', true);
                            $('#field-cond-selection').fadeIn('slow');

                            for (let i = 1; i < appConfig.fieldCond0.length; i++){
                                $('#field-cond-selection').find('.add-row').first().trigger('click');
                            }
                            appConfig.fieldCond0.forEach((item, index) => {
                                $('.field_cond_field_0').eq(index).val(item.field);
                                if(item.function.includes('view')){
                                    $('.field-cond-func').eq(index).find('input[name="field-cond-view"]').prop('checked',true);
                                }
                                if(item.function.includes('edit')){
                                    $('.field-cond-func').eq(index).find('input[name="field-cond-edit"]').prop('checked',true);
                                }
                                if (item.hasOwnProperty('typeField') && item.typeField === "LABEL"){
                                    $('.field-cond-func').eq(index).find('input[name="field-cond-edit"]').prop('disabled',true);
                                    $('.field-cond-func').eq(index).find('input[name="field-cond-view"]').prop('disabled',true);
                                }
                            })
                        }
                    })

                    //public loookup
                    makePublicLookupSetting(appConfig.app, dataFields)
                    .then(function(){
                        if (appConfig.lookupRelateInfo){
                            appConfig.lookupRelateInfo.forEach(item => {
                                if (item.relateAppApiToken){
                                    $(`input[lookup-fieldcode="${item.fieldCode}"]`).val(item.relateAppApiToken);
                                }
                            })
                        }
                    })

                    if (appConfig.robotoCheck === false) {
                        $('#roboto_check').prop('checked', false);
                    }else{
                        $('#roboto_check').prop('checked', true);
                    }
                }
                //保存ボタンの名称
                if (appConfig.saveButtonName){
                    $('#save_btn_name').val(appConfig.saveButtonName);
                }
                
                //一覧で表示するレコード条件の指定
                await KintoneListViewTable.render(appConfig, view, dataFields).catch(err =>{
                    const key = err.code === "GAIA_DU01" ? "GAIA_DU01" : "system-error-of-unknown-cause"
                    const detail = err.code === "GAIA_DU01" ? "" : `<br>ERROR: ${err.message}`
                    $.alert({
                        title: translateCommon("warning-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError(key) + detail,
                        type: 'red',
                        animateFromElement: false,
                    });
                    jcEditApp.close();
                })

                //画面カラー設定
                $('#bcolor1').val(appConfig.templateColor.backgroundColor.bcolor1);
                $('#bcolor2').val(appConfig.templateColor.backgroundColor.bcolor2);
                $('#bcolor3').val(appConfig.templateColor.backgroundColor.bcolor3);
                $('#fcolor1').val(appConfig.templateColor.fontColor.fcolor1);
                $('#fcolor2').val(appConfig.templateColor.fontColor.fcolor2);
                $('#fcolor3').val(appConfig.templateColor.fontColor.fcolor3);
                if (appConfig.trustedSites !== undefined && appConfig.trustedSites) {
                    if (appConfig.trustedSites.length > 1) {
                        let clickedBodyTable = $(".add-row-iframe").parent().parent().parent();
                        let cloneClikedTr = clickedBodyTable.children().first().clone(true);
                        cloneClikedTr.find('.scheme').val('http')
                        cloneClikedTr.find('.domain').val('')
                        cloneClikedTr.find('.domain').val('')
                        let clickedTr = $(".add-row-iframe").parent().parent();
                        clickedTr.after(cloneClikedTr);
                    }

                    const schemes = $('.scheme');
                    const domains = $('.domain');
                    appConfig.trustedSites.forEach(function(site, index) {
                        const scheme = site.includes('https') ? 'https' : 'http';
                        const domain = site.split('://')[1];
                        $(schemes[index]).val(scheme);
                        $(domains[index]).val(domain);
                    })
                }

                //js/cssカスタマイズ機能
                if (appConfig && appConfig.jsCustom && appConfig.jsCustom.length){
                    for(let i = 1; i < appConfig.jsCustom.length; i ++){
                        $('#js-setting').find('.add-row').first().trigger('click');
                    }
                    appConfig.jsCustom.forEach((link, index) =>{
                        // $('.js-custom').eq(index).val(link);

                        if (link.indexOf(domain) != -1){
                            let fileName = link.substr(link.lastIndexOf('/')+1);
                            $('.js-custom').eq(index).val(fileName);
                            $('.js-custom').eq(index).prop('disabled',true);
                            $('.js-custom').eq(index).attr('fileUrl',link)
                        }else{
                            $('.js-custom').eq(index).val(link);
                        }
                    })
                }
                if (appConfig && appConfig.cssCustom && appConfig.cssCustom.length){
                    for(let i = 1; i < appConfig.cssCustom.length; i ++){
                        $('#css-setting').find('.add-row').first().trigger('click');
                    }
                    appConfig.cssCustom.forEach((link, index) =>{
                        // $('.css-custom').eq(index).val(link);
                        if (link.indexOf(domain) != -1){
                            let fileName = link.substr(link.lastIndexOf('/')+1);
                            $('.css-custom').eq(index).val(fileName);
                            $('.css-custom').eq(index).prop('disabled',true);
                            $('.css-custom').eq(index).attr('fileUrl',link)
                        }else{
                            $('.css-custom').eq(index).val(link);
                        }
                    })
                }

                //位置情報取得機能
                makeLocationOption(appConfig.app, dataFields).then(function(){
                    if(appConfig.locateCond){
                        $('#locate_cond_1').prop('checked',true);
                        $('#locate-cond-selection').fadeIn('slow');
                        $('#latitude_1').val(appConfig.locateCond.latitude);
                        $('#longitude_1').val(appConfig.locateCond.longitude);
                    }
                })

                 //lookup complete match
                 makeLookupFieldOption(appConfig.app, dataFields).then(function(){
                    if (appConfig.lkCompleteMatch){
                        $('#lk-complete-match').prop('checked',true);
                        $('#lk-complete-match-selection').fadeIn('slow');
                        appConfig.lkCompleteMatch.forEach((item, index) => {
                            if (index > 0){
                                $('#lk-complete-match-selection').find('.add-row').last().click();
                            }
                            $('.lk-complete-match-field').eq(index).val(item);
                        })
                    }
                })

                //自動返信メール機能
                makeAutoSendMailOption(appConfig.app, dataFields).then(function(){
                    if(appConfig.autoSendMail){
                        $('#auto_sendmail_cond').prop('checked',true);
                        $('#auto-sendmail-selection').fadeIn('slow');
                        $('#auto-email').val(appConfig.autoSendMail.autoEmail);
                        $('#auto-subject').val(appConfig.autoSendMail.autoSubject);
                        $('#auto-content').val(appConfig.autoSendMail.autoContent);
                    }
                })

                //レコード保存後のページ表示設定
                if(appConfig.thanksPage){
                    $('#thanks_page').prop('checked',true);
                    $('#thanks-page-selection').fadeIn('slow');
                    $('#trumbowyg').trumbowyg({
                        btns: [
                            ['viewHTML'],
                            ['undo', 'redo'], // Only supported in Blink browsers
                            ['formatting'],
                            ['strong', 'em', 'del'],
                            ['superscript', 'subscript'],,
                            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                            ['horizontalRule'],
                            ['removeformat'],
                            ['fullscreen']
                        ]
                    });
                    $('#trumbowyg').trumbowyg('html', appConfig.thanksPage);
                }

                //アンケート回答の多重回答禁止制御
                if(appConfig.responseControl){
                    $('#response-control').prop('checked',true);
                    $('#response-control-selection').fadeIn('slow');

                    if (appConfig.responseControl.duration){
                        $('#duration').val('1');
                        $('.duration-setting').show();
                        $('#duration-days').val(appConfig.responseControl.duration.durationDays);
                        $('#duration-text').text(`禁止期限：${appConfig.responseControl.duration.durationDate}まで`)
                    }
                }

                //簡易一時保存機能
                if(appConfig.tempSaving){
                    $('#temp-saving').prop('checked',true);
                    $('#temp-saving-selection').fadeIn('slow');
                    $('#temp-saving-btn').val(appConfig.tempSaving);
                }

                //アクション機能設定
                await makeActionCopyFromOption(appConfig.app, dataFields)
                
                /**
                 * # 注意
                 * [CHOBIIT-184](https://noveldev.backlog.com/view/CHOBIIT-184)の対応を行なった。
                 * 要点は、
                 * 
                 * - US 版ではアクションを複数設定できる機能を先行して実装した（意図せず誤って実装されてしまった）
                 * - データ構造の差分が大きいため、日本版も機能を合わせる形にした。
                 * - `appCondig.actionCond`の情報を、`appConfig.actionCondList`に徐々に移行するため、古いデータのままのアプリの場合は、特別に考慮してデータを扱う必要がある。
                 * - その対応が以下の`if`文である。
                 * - いずれ顧客のすべてのアプリ設定において`actionCond`が消え去った場合には、以下の`if`はデッドコードとなるため、削除してOK。
                 */
                if(appConfig.actionCond){
                    $('#action_cond').prop('checked',true);
                    $('#action-cond-selection').fadeIn('slow');
                    $('.action_name').eq(0).val(appConfig.actionCond.actionName);
                    $('.action_to_app').eq(0).val(appConfig.actionCond.actionApp);
                    if(appConfig.actionCond.copyFields.length){
                        let copyFields = appConfig.actionCond.copyFields;
                        /**
                         * # 注意
                         * コピー元フィールド・コピー先フィールドの行を、必要な設定数分だけクリックイベントで増やしている。
                         */
                        for(let i = 1; i < copyFields.length; i ++){
                            /**
                             * # 注意：US版との差分
                             * 
                             * US版は以下のようなコードになっているが、これはUIがおかしな形になる。
                             *
                             * ```javascript
                             * $('#action-cond-selection').find('.add-row').first().trigger('click');
                             * ```
                             * 
                             * ただ、US 版は DynamoDB Table `chobitoneApp` 内のデータが全て`actionCond`を持っていないので、
                             * ここの部分が US 版ではデッドコードになっている。
                             * 
                             * よってUS版で動かすときは、`if(appConfig.actionCond)`内の処理は気にしなくて大丈夫のはずである。
                             */
                            $('#action-cond-selection').find('.action-td').find('.add-row').first().trigger('click');
                        }
                        copyFields.forEach((item, index) => {
                            $('.action_copy_from').eq(index).val(item.copyFrom);
                            if(!item.editable){
                                $('.editable').eq(index).prop('checked',true);
                            }
                        })
                        makeActionCopyToOptionByAction(appConfig.actionCond.actionApp).then(function(){
                            copyFields.forEach((item, index) => {
                                $('.action_copy_to').eq(index).val(item.copyTo);
                            })
                        });
                    }
                }

                if (appConfig.actionCondList && appConfig.actionCondList.length){
                    $('#action_cond').prop('checked',true);
                    $('#action-cond-selection').fadeIn('slow');

                    /**
                     * # 注意
                     * アクション設定の行を、必要な設定数分だけクリックイベントで増やしている。
                     */
                    appConfig.actionCondList.forEach((e,i)=>{
                        if(i>0) $('.action-tr').find('.add-row').first().trigger('click');
                    })

                    appConfig.actionCondList.forEach((_set, acl_i) => {
                        $('.action_name').eq(acl_i).val(_set.actionName);
                        $('.action_to_app').eq(acl_i).val(_set.actionApp);

                        if(_set.copyFields.length){
                            let copyFields = _set.copyFields;
                            for(let i = 1; i < copyFields.length; i ++){
                                $('.action-tr').eq(acl_i).find('.action-td').find('.add-row').first().trigger('click');
                            }
                            copyFields.forEach((item, cf_i) => {
                                $('.action-tr').eq(acl_i).find('.action_copy_from').eq(cf_i).val(item.copyFrom);
                                if(!item.editable){
                                    $('.action-tr').eq(acl_i).find('.editable').eq(cf_i).prop('checked',true);
                                }
                            })
                            makeActionCopyToOptionByAction(_set.actionApp).then(function(){
                                copyFields.forEach((item, aa_i) => {
                                    $('.action-tr').eq(acl_i).find('.action_copy_to').eq(aa_i).val(item.copyTo);
                                })
                            });
                        }
                    })
                }

                await Promise.all([
                    makeSyncKeyOption(appConfig.app, $('.wsync-to-key'), dataFields),
                    makeUpdateToFieldOption(appConfig.app, dataFields)
                ])

                /**
                 * # 注意
                 * [CHOBIIT-184](https://noveldev.backlog.com/view/CHOBIIT-184)の対応を行なった。
                 * 要点は、
                 * 
                 * - US 版ではアクションを複数設定できる機能を先行して実装した（意図せず誤って実装されてしまった）
                 * - データ構造の差分が大きいため、日本版も機能を合わせる形にした。
                 * - `appCondig.actionCond`の情報を、`appConfig.actionCondList`に徐々に移行するため、古いデータのままのアプリの場合は、特別に考慮してデータを扱う必要がある。
                 * - その対応が以下の`if`文である。
                 * - いずれ顧客のすべてのアプリ設定において`actionCond`が消え去った場合には、以下の`if`はデッドコードとなるため、削除してOK。
                 */
                if (appConfig.actionCond){
                    $('.wsync-setting').fadeIn('slow');
                    await makeSyncKeyOption(appConfig.actionCond.actionApp, $('.wsync-from-key'))

                    if(appConfig.webhookSync){
                        // $('.wsync-setting').fadeIn('slow');

                        /**
                         * # 注意：US版との差分
                         * 
                         * US版は以下のようなコードになっているが、これは webhook 設定のチェックがつかない不具合が発生する。
                         *
                         * ```javascript
                         * $('.wsync-cond').eq(0).prop('checked',true);
                         * ```
                         * 
                         * これについても、US版は DynamoDB Table `chobitoneApp` 内のデータが全て`actionCond`を持っていないので、
                         * やはりここの部分も US 版はデッドコードになっている。
                         */
                        $('.wsync-cond-trig').eq(0).prop('checked',true);

                        $('.wsync-selection').eq(0).fadeIn('slow');
                        $('.wsync-apitoken').eq(0).val(appConfig.webhookSync.apiToken);
                        $('.wsync-from-key').eq(0).val(appConfig.webhookSync.fromKey);
                        $('.wsync-to-key').eq(0).val(appConfig.webhookSync.toKey);

                        if(appConfig.webhookSync.updateFields.length){
                            let updateFields = appConfig.webhookSync.updateFields
                            for(let i = 1; i < updateFields.length; i ++){
                                $('.wsync-selection').eq(0).find('.add-row').first().trigger('click');
                            }
                            updateFields.forEach((item, uf_i) => {
                                $('.wsync-map').eq(0).find('.wsync-to-field').eq(uf_i).val(item.updateTo);

                            })
                            await makeUpdateFromFieldOptionByApp(appConfig.actionCond.actionApp, {tr_index: 0})
                            updateFields.forEach((item, uf_i) => {
                                $('.wsync-map').eq(0).find('.wsync-from-field').eq(uf_i).val(item.updateFrom);
                            })
                        }
                    }
                }

                if (appConfig.actionCondList && appConfig.actionCondList.length){
                    $('.wsync-setting').fadeIn('slow');
                    await Promise.all(appConfig.actionCondList.map((acl,acl_i)=>{
                        return new Promise(async (res,rej)=>{
                            await makeSyncKeyOption(acl.actionApp, $('.wsync-from-key').eq(acl_i))
                            if(acl.webhookSync){
                                // $('.wsync-setting').fadeIn('slow');

                                $('.wsync-cond-trig').eq(acl_i).prop('checked',true);
                                $('.wsync-selection').eq(acl_i).fadeIn('slow');
                                $('.wsync-apitoken').eq(acl_i).val(acl.webhookSync.apiToken);
                                $('.wsync-from-key').eq(acl_i).val(acl.webhookSync.fromKey);
                                $('.wsync-to-key').eq(acl_i).val(acl.webhookSync.toKey);

                                if(acl.webhookSync.updateFields.length){
                                    let updateFields = acl.webhookSync.updateFields
                                    for(let i = 1; i < updateFields.length; i ++){
                                        $('.wsync-selection').eq(acl_i).find('.add-row').first().trigger('click');
                                    }
                                    updateFields.forEach((item, uf_i) => {
                                        $('.wsync-map').eq(acl_i).find('.wsync-to-field').eq(uf_i).val(item.updateTo);

                                    })
                                    await makeUpdateFromFieldOptionByApp(acl.actionApp, {tr_index: acl_i})
                                    updateFields.forEach((item, uf_i) => {
                                        $('.wsync-map').eq(acl_i).find('.wsync-from-field').eq(uf_i).val(item.updateFrom);
                                    })
                                }
                            }
                            res()
                        })
                    }))
                }

                $('input[name="user_authen"]').prop('disabled', true);

                /**
                 * # FIXME: 恐らくこのchangeイベントは作動しない。精査の上不要であれば削除する
                 */
                $('#app').change(async function(){
                    let appValue = $(this).val();
                    if(appValue){
                        makeProcessOption(appValue);
                        makeChobiitFieldOption(appValue);
                        makeFieldCondOption(appValue);
                        makePublicLookupSetting(appValue);
                        makeLocationOption(appValue);
                        makeLookupFieldOption(appValue);
                        makeAutoSendMailOption(appValue);
                        makeActionCopyFromOption(appValue);

                        makeSyncKeyOption(appValue, $('.wsync-to-key'))
                        makeUpdateToFieldOption(appValue);
                        makeGroupFieldOption(appValue);

                        $('#list_record_url').replaceWith(`<a target="_blank" href="${login_url}/public/p_list_record.html?appId=${appConfig.app}">${login_url}/public/p_list_record.html?appId=${appConfig.app}</a>`);
                        $('#list_record_iframe_tag').val(`<iframe src="${login_url}/public/p_list_record.html?appId=${appValue}" style="position:relative;width:1px;min-width:80%;*width:80%;" frameborder="0" scrolling="yes" seamless="seamless" height="1563" width="80%"></iframe>`);
                        $('#add_record_url').replaceWith(`<a target="_blank"  href="${login_url}/public/p_add_record.html?appId=${appConfig.app}">${login_url}/public/p_add_record.html?appId=${appConfig.app}</a>`);
                        $('#add_record_iframe_tag').val(`<iframe src="${login_url}/public/p_add_record.html?appId=${appValue}" style="position:relative;width:1px;min-width:80%;*width:80%;" frameborder="0" scrolling="yes" seamless="seamless" height="1563" width="80%"></iframe>`);
                    }

                })
                //authen handle

                $('input[name="user_authen"]').change(function(){
                    if (this.value == '認証あり'){
                        $('#authen-panel').show()
                        $('#no-authen-panel').hide()
                    };
                    if (this.value == '外部公開'){
                        $('#authen-panel').hide()
                        $('#no-authen-panel').show()
                    };
                    if (this.value == '両方'){
                        $('#authen-panel').show()
                        $('#no-authen-panel').show()
                    };

                })


                $('.event_notif').change(function(){
                    /**
                     * # 注意
                     * 'レコード編集', 'コメント投稿' については、US版でも日本語のままでコーディングしていたためそのままにしている。
                     * チケット：https://noveldev.backlog.com/view/CHOBIIT-207
                     */
                    if ($(this).val() == 'レコード編集'){
                        $(this).closest('tr').find('input').val(translateInfo("app-setting.edit-app.record-edited-message"));
                    }
                    if ($(this).val() == 'コメント投稿'){
                        $(this).closest('tr').find('input').val(translateInfo("app-setting.edit-app.comment-posted-message"));
                    }
                })
                //process handle
                $('#pro_cond_1').change(function() {
                    if(this.checked) {
                        $('#pro-setting').fadeIn("slow");
                    }else{
                        $('#pro-setting').fadeOut("slow");
                    }
                });

                //function handle
                $('#view-function').change(function(){
                    if(this.checked){
                        $('#view-function-selection').fadeIn('slow');
                    }else {
                        $('#view-function-selection').fadeOut('slow');
                    }
                })
                $('#add-function').change(function(){
                    if(this.checked){
                        $('#add-function-selection').fadeIn('slow');
                    }else {
                        $('#add-function-selection').fadeOut('slow');
                    }
                })
                $('#iframe-function').change(function(){
                    if(this.checked){
                        $('#iframe-function-selection').fadeIn('slow');
                        $('.iframe-function-tooltip').hide();
                        $('.iframe-function-tooltip2').show();
                    }else {
                        $('#iframe-function-selection').fadeOut('slow');
                        $('.iframe-function-tooltip').show();
                        $('.iframe-function-tooltip2').hide();
                    }
                })
                $('.chobit-copy-button').click(function(){
                    let fieldValue = $(this).parent().find('input').val();
                    var $temp = $("<input>");
                    $("body").append($temp);
                    $temp.val(fieldValue).select();
                    document.execCommand("copy");
                    $temp.remove();
                })

                //field cond handle
                $('#field_cond_0').change(function(){
                    if(this.checked){
                        $('#field-cond-selection').fadeIn('slow');
                    }else {
                        $('#field-cond-selection').fadeOut('slow');
                    }
                })

                 //custom handle
                 let fileSpace = [];
                 $(".input-file-custom").change(function() {
                     let files = Array.from(this.files);

                     if(files.length){
                         files.forEach(file=> {
                            const fileId = getUniqueStr();


                             fileSpace.push({
                                 fileId : fileId,
                                 file : file
                             });

                             let lastRow = $(this).closest('.custom-setting').find('tr').last();
                             let cloneRow = lastRow.clone(true);
                             cloneRow.find('input').val(file.name);
                             cloneRow.find('input').prop('disabled',true);
                             cloneRow.find('input').attr('fileId',fileId);
                             cloneRow.find('input').attr('fileUrl','');
                             lastRow.after(cloneRow);

                             if (lastRow.find('input').val() == "" || lastRow.find('input').val() == "https://"){
                                lastRow.remove();
                            }

                         });
                     }
                     $(this).val('')
                });

                //group view handle
                $('#group-view-cond').change(function(){
                    if(this.checked){
                        $('#group-view-selection').fadeIn('slow');
                    }else {
                        $('#group-view-selection').fadeOut('slow');
                    }
                })


                 //app linkto handle
                 $('#app-linkto-cond').change(function(){
                    if(this.checked){
                        $('#app-linkto-selection').fadeIn('slow');
                    }else {
                        $('#app-linkto-selection').fadeOut('slow');
                    }
                    onOffLinkAction();
                })

                $('#app-linkto').change(function(){
                    onOffLinkAction();
                })

                //location handle
                $('#locate_cond_1').change(function(){
                    if(this.checked){
                        $('#locate-cond-selection').fadeIn('slow');
                    }else {
                        $('#locate-cond-selection').fadeOut('slow');
                    }
                })

                //auto send mail
                $('#auto_sendmail_cond').change(function(){
                    if(this.checked){
                        $('#auto-sendmail-selection').fadeIn('slow');
                    }else {
                        $('#auto-sendmail-selection').fadeOut('slow');
                    }
                })

                //response control
                $('#response-control').change(function(){
                    if(this.checked){
                        $('#response-control-selection').fadeIn('slow');
                    }else {
                        $('#response-control-selection').fadeOut('slow');
                    }
                })


                //duaration
                $('#duration').change(function(){
                    if(this.value == 1){
                        $('.duration-setting').show();
                    }else {
                        $('.duration-setting').hide();
                    }
                })

                //duration-days
                $('#duration-days').change(function(){
                    let durationDays = $(this).val();
                    $('#duration-text').text('');
                    if (isNaN(durationDays) ||  durationDays < 1 || durationDays > 365){
                        $(this).val('');
                    }else{
                        let outDate = moment().add(durationDays, 'days').format('YYYY-MM-DD');
                        $('#duration-text').text(translateInfo("app-setting.edit-app.duration-period-is-up-to", {outDate}));
                    }
                })


                //temp-saving
                $('#temp-saving').change(function(){
                    if(this.checked){
                        $('#temp-saving-selection').fadeIn('slow');
                    }else {
                        $('#temp-saving-selection').fadeOut('slow');
                    }
                })

                  //lookup complete match
                  $('#lk-complete-match').change(function(){
                    if(this.checked){
                        $('#lk-complete-match-selection').fadeIn('slow');
                    }else {
                        $('#lk-complete-match-selection').fadeOut('slow');
                    }
                })

                //thanks page handle
                $('#thanks_page').change(function(){
                    if(this.checked){
                        $('#thanks-page-selection').fadeIn('slow');
                        $('#trumbowyg').trumbowyg({
                            btns: [
                                ['viewHTML'],
                                ['undo', 'redo'], // Only supported in Blink browsers
                                ['formatting'],
                                ['strong', 'em', 'del'],
                                ['superscript', 'subscript'],,
                                ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                                ['horizontalRule'],
                                ['removeformat'],
                                ['fullscreen']
                            ]
                        });
                    }else {
                        $('#thanks-page-selection').fadeOut('slow');
                    }
                })

                //action handel
                $('#action_cond').change(function(){
                    if(this.checked){
                        $('#action-cond-selection').fadeIn('slow');
                        $('.wsync-setting').fadeIn('slow');
                    }else {
                        $('#action-cond-selection').fadeOut('slow');
                        $('.wsync-setting').fadeOut('slow');
                    }
                    onOffLinkAction();
                })

                $(document).off('change', '.action_to_app')
                $(document).on('change', '.action_to_app', function(){
                    let actionApp = $(this).val();

                    if (actionApp){
                        makeActionCopyToOptionByAction(actionApp, this);

                        const fromkey = $(this).closest(".action-tr").find(".wsync-from-key")
                        makeSyncKeyOption(actionApp, fromkey)
                        makeUpdateFromFieldOptionByApp(actionApp, {change_this: this});
                    }
                    onOffLinkAction();

                });
                $('.action_copy_from').change(function(){
                    makeActionCopyToOptionByCopy(this);
                });

                //複数設定に対応する
                $(document).on("change", ".wsync-cond-trig", function(){
                    if(this.checked){
                        $(this).closest(".wsync-setting").find(".wsync-selection").fadeIn('slow');
                    }else {
                        $(this).closest(".wsync-setting").find(".wsync-selection").fadeOut('slow');
                    }
                });

                $('.wsync-to-field').change(function(){
                    makeUpdateFromFieldOptionByField(this);
                });

                //submit handle
                $('.edit-app-btn').on('click',async function(){
                    try {
                        let allSubmitData = await getSubmitAppData('edit', fileSpace);
                        if(allSubmitData){
                            console.log('---all submit data----');
                            console.log(allSubmitData);
                            if(!allSubmitData.checkLookupKey){
                                $.alert({
                                    title: 'Warning',
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("copy-origin-key-of-lookup-field-must-be-unique"),
                                    type: 'orange',
                                    animateFromElement: false,
                                    buttons: {
                                        OK: async function () {
                                            $(this).html(saveLoadingBtn);
                                            let dataToDyanmo = await submitApp(allSubmitData);
                                            for (var key in dataToDyanmo){
                                                appConfig[key] = dataToDyanmo[key];
                                            }
                                            /**
                                             * recordCond1 と calendarView は 保存のタイミングで削除する
                                             */
                                            LocalConfig.deleteOldAppConfig(appConfig);
                                            appTable
                                            .row( tableRow )
                                            .data([
                                                putDynamoBtn + editRecordBtn + deleteRecordBtn,
                                                `<div class="count">${getCountByApp(countConfig, dataToDyanmo.app)}</div>`,
                                                dataToDyanmo.appName +` (${dataToDyanmo.app})`,
                                                showAuth(dataToDyanmo.auth),
                                                getListRecordUrl(dataToDyanmo),
                                                getAddRecordUrl(dataToDyanmo),
                                                dataToDyanmo.apiToken0,
                                                dataToDyanmo.creator,
                                                dataToDyanmo.editor,
                                                dataToDyanmo.timeCond.createTime || false,
                                                dataToDyanmo.timeCond.editTime || false,
                                                dataToDyanmo.locateCond.latitude || false,
                                                dataToDyanmo.locateCond.longitude || false,
                                                dataToDyanmo.ownerView
                                            ])
                                            .draw(false);
                                            jcEditApp.close();
                                        },
                                    }
                                });
                            }else{
                                $(this).html(saveLoadingBtn);
                                let dataToDyanmo = await submitApp(allSubmitData);
                                for (var key in dataToDyanmo){
                                    appConfig[key] = dataToDyanmo[key];
                                }
                                /**
                                 * recordCond1 と calendarView は 保存のタイミングで削除する
                                 */
                                // LocalConfig.deleteOldAppConfig(appConfig);
                                LocalConfig.deleteOldAppConfig(appConfig);

                                // appConfig = Object.assign({},dataToDyanmo);
                                appTable
                                .row( tableRow )
                                .data([
                                    putDynamoBtn + editRecordBtn + deleteRecordBtn,
                                    `<div class="count">${getCountByApp(countConfig, dataToDyanmo.app)}</div>`,
                                    dataToDyanmo.appName +` (${dataToDyanmo.app})`,
                                    showAuth(dataToDyanmo.auth),
                                    getListRecordUrl(dataToDyanmo),
                                    getAddRecordUrl(dataToDyanmo),
                                    dataToDyanmo.apiToken0,
                                    dataToDyanmo.creator,
                                    dataToDyanmo.editor,
                                    dataToDyanmo.timeCond.createTime || false,
                                    dataToDyanmo.timeCond.editTime || false,
                                    dataToDyanmo.locateCond.latitude || false,
                                    dataToDyanmo.locateCond.longitude || false,
                                    dataToDyanmo.ownerView
                                ])
                                .draw(false);
                                view.reset();
                                jcEditApp.close();
                                // location.reload();
                            }
                        }
                    }catch(err){
                        jcEditApp.close();
                        console.error(err);
                        storeErr(err, 'upadte app ');
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("you-dont-have-app-manage-permission"),
                            type: 'red',
                            animateFromElement: false,
                        });
                    }
                })
            }
        });
    });
    //delete app
    $('#app-table').on('click','.delete-record',function(){
        let $deleteIcon = $(this);
        $.confirm({
            animateFromElement: false,

            title: translateCommon("confirmation-title"),
            content: translateCommon("confirmation-message"),
            buttons: {
                somethingElse: {
                    text: translateCommon("delete"),
                    btnClass: 'btn-red',
                    action: function(){
                        console.log('starting delete app...');
                        let tableRow = appTable.row($deleteIcon.closest('tr'));
                        let rowValue =  appTable.row(tableRow).data();
                        let app = getCode(rowValue[2]);

                        let checkExistUserApps = allConfigData.data.users.some(user => {
                            return user.apps.includes(app);
                        })

                        if (checkExistUserApps){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("this-app-is-selected-in-user-setting"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return;
                        }

                        let checkExistActionApps = allConfigData.data.apps.some(item => item.actionCond  && item.actionCond.actionApp == app);
                        if (checkExistActionApps){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("this-app-is-targetted-for-action-feature"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return;
                        }


                        let checkExistLinkToApps =  allConfigData.data.apps.some(item => item.appLinkTo == app);
                        if (checkExistLinkToApps){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("this-app-is-now-linked"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return;
                        }

                        if (allConfigData.data.config.userAuthApps){
                            let userAuthApps = JSON.parse(allConfigData.data.config.userAuthApps);
                            if (userAuthApps.includes(app)){
                                $.alert({
                                    title: translateCommon("input-error-title"),
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("this-app-is-set-for-user-auth-feature"),
                                    type: 'red',
                                    animateFromElement: false,
                                });
                                return;
                            }
                        }


                        // let check = false;
                        // for (let i = 0; i < allConfigData.data.users.length; i++ ){
                        //     let user = allConfigData.data.users[i];
                        //     let apps =  Array.isArray(user.apps) ? user.apps : JSON.parse(user.apps);
                        //     if(apps.includes(app)){
                        //         check = true;
                        //         break;
                        //     }
                        // }
                        // allConfigData.data.apps.forEach(item => {
                        //     if (item.appLinkTo == app){
                        //         check = true;
                        //         return;
                        //     }
                        // })
                        // allConfigData.data.apps.forEach(item => {
                        //     if (item.actionCond  & item.actionCond.actionApp == app){
                        //         check = true;
                        //         return;
                        //     }
                        // })
                        // if(check){
                        //     $.alert({
                        //         title: 'エラー',
                        //         icon: 'fas fa-exclamation-triangle',
                        //         content: 'アプリが紐づいているため削除できません。',
                        //         type: 'red',
                        //         animateFromElement: false,
                        //     });
                        //     return;
                        // }
                        let URL =  configApi.deleteApp;
                        const data = {
                            domain : domain,
                            appId : app
                        }
                        $.ajax({
                            type: 'POST',
                            url: URL,
                            headers: { 'X-Api-Key': apiKey },
                            dataType: 'json',
                            contentType: 'application/json',
                            data: JSON.stringify(data),
                            success: function () {
                                console.log('delete app success');
                                appTable.row(tableRow).remove().draw(false);
                                for(let i = 0; i < allConfigData.data.apps.length; i ++){
                                    let appConfig = allConfigData.data.apps[i];
                                    if (appConfig.app == app){
                                        allConfigData.data.apps.splice(i, 1);
                                    }
                                }

                                //remove option user auth
                                $(`.user-auth-app option[value="${app}"]`).remove();
                            },
                            error: function () {
                                console.err('delete app fail')
                            }
                        });
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function(){

                    }
                }
            }
        });
    })
    //put dynamo (chobiitへ反映ボタン)
    $('#app-table').on('click','.put-dynamo',async function(){
        let $putBtn = $(this);
        $putBtn.children().toggleClass("fa-cloud-upload-alt fa-sync fa-spin");
        let tableRow = appTable.row($(this).closest('tr'));
        let rowValue =  appTable.row(tableRow).data();
        let app = getCode(rowValue[2]);
        let appConfig = allConfigData.data.apps.find(x => x.app == app);
        let body = {
            'app' : app
        }
        try {
            let listkintoneAPi = await Promise.all([
                kintone.api(kintone.api.url('/k/v1/app/acl', true), 'GET', body),
                kintone.api(kintone.api.url('/k/v1/record/acl', true), 'GET', body),
                kintone.api(kintone.api.url('/k/v1/field/acl', true), 'GET', body),
                kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', body),
                kintone.api(kintone.api.url('/k/v1/app/form/layout', true), 'GET', body),
                kintone.api(kintone.api.url('/k/v1/app', true), 'GET', {id : app}),
                kintone.api(kintone.api.url('/k/v1/app/views', true), "GET", {'app': app}),
                kintone.api(kintone.api.url('/k/v1/app/status', true), 'GET', body),
            ]);

            let appRights = listkintoneAPi[0].rights;
            let recordRights = listkintoneAPi[1].rights;
            let fieldRights = listkintoneAPi[2].rights;
            let fields = listkintoneAPi[3].properties;
            let formLayout = listkintoneAPi[4].layout;
            let appName = listkintoneAPi[5].name;
            let appCreatorCode = listkintoneAPi[5].creator.code;
            let viewInfo = listkintoneAPi[6].views;
            const statusInfo = listkintoneAPi[7].enable ? Object.values(listkintoneAPi[7].states) : false

            let relateFieldsInfo = false;
            let relateFields = Object.values(fields).filter(x => x.type == 'REFERENCE_TABLE');
            if (relateFields.length){
                relateFieldsInfo = {};
                for (let j = 0; j < relateFields.length; j++){
                    if(relateFields[j].referenceTable){
                        let relateApiToken = false;
                        let relateAppId = relateFields[j].referenceTable.relatedApp.app;
                        let displayFields = relateFields[j].referenceTable.displayFields;
                        let relateFieldRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app : relateAppId});
                        let displayFieldsInfo = displayFields.map(field => ({code : relateFieldRes.properties[field].code, label : relateFieldRes.properties[field].label}))

                        let realateAppSettings= allConfigData.data.apps;
                        if (realateAppSettings.length){
                            let realateAppSetting = realateAppSettings.find(x => x.app == relateAppId);
                            if(realateAppSetting && (realateAppSetting.auth == false || realateAppSetting.auth ===  1)){
                                relateApiToken = realateAppSetting.apiToken0;
                            }
                        }

                        let obj = {
                            [relateFields[j].code] : {
                                displayFieldsInfo : displayFieldsInfo,
                                relateApiToken : relateApiToken
                            }
                        }
                        Object.assign(relateFieldsInfo, obj)
                    }
                }
            }

             //get lookup field;
            let lookupRelateInfo = false;
            let lookupFields = [];
            for (let key in fields){
                if (fields[key].type =='SUBTABLE'){
                    let tFields = fields[key].fields;
                    for (let key3 in tFields){
                        if (tFields[key3].hasOwnProperty('lookup') && tFields[key3].lookup != null){
                            lookupFields.push(tFields[key3]);
                        }
                    }
                }
                else if (fields[key].hasOwnProperty('lookup') && fields[key].lookup != null){
                    lookupFields.push(fields[key]);
                }
            }
            //let listLookupKeyFail = [];
            let checkLookupKey = true;
            if (lookupFields.length){
                if (appConfig.auth){ // check lookup setting
                    for (let i = 0; i < lookupFields.length; i ++ ){
                        let relateAppId = lookupFields[i].lookup.relatedApp.app;
                        let relatedKeyField = lookupFields[i].lookup.relatedKeyField;
                        let relateFieldsResp = await   kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app : relateAppId});
                        let relateFields = relateFieldsResp.properties;
                        if (relateFields[relatedKeyField].type != 'RECORD_NUMBER' && !relateFields[relatedKeyField].unique){
                            checkLookupKey = false;
                            //listLookupKeyFail.push(lookupFields[i].code);
                        }
                    }
                }
                //lookupFields = lookupFields.filter(x => listLookupKeyFail.indexOf(x.code) == -1)
                let promises = lookupFields.map(async field => {
                    let fieldCode = field.code;
                    let relateAppId = field.lookup.relatedApp.app;
                    let relateAppApiToken = false;
                    if (appConfig.lookupRelateInfo){
                        let relateConfig = appConfig.lookupRelateInfo.find(x => x.fieldCode == fieldCode);
                        if (relateConfig) relateAppApiToken = relateConfig.relateAppApiToken;
                    }
                    let relateAppResp = await  kintone.api(kintone.api.url('/k/v1/app', true), 'GET', {id : relateAppId});
                    let relateAppName = relateAppResp.name;
                    let relateFieldsResp = await   kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app : relateAppId});
                    let  rlFieldInfo = {};
                    for (let key in relateFieldsResp.properties){
                        let rlField = relateFieldsResp.properties[key];
                        if (field.lookup.lookupPickerFields.includes(rlField.code) || field.lookup.relatedKeyField == rlField.code){
                            let obj = {
                                [rlField.code] : rlField.label
                            };
                            Object.assign(rlFieldInfo, obj)
                        }
                    }
                    return {
                        fieldCode : fieldCode,
                        fieldMappings: field.lookup.fieldMappings,
                        relateAppName : relateAppName,
                        relateAppApiToken : relateAppApiToken,
                        rlFieldInfo : rlFieldInfo,
                    }
                })
                lookupRelateInfo = await Promise.all(promises);
            }

            //check null
            for (let i = 0; i < appRights.length; i++){
                if (appRights[i].entity.code == null)
                    appRights[i].entity.code = ' ';
            }
            for (var key in fields){
                for (var key2 in fields[key]){
                    if (fields[key][key2] == ''){
                        fields[key][key2] = ' ';
                    }
                }
                if (fields[key].type =='SUBTABLE'){
                    let tFields = fields[key].fields;
                    for (var key3 in tFields){
                        for (var key4 in tFields[key3]){
                            if (tFields[key3][key4] == ''){
                                tFields[key3][key4] = ' ';
                            }
                        }
                        if (tFields[key3].hasOwnProperty('lookup')){
                            if(tFields[key3].lookup == null){
                                delete tFields[key3];
                            } else{
                                tFields[key3].lookup.relatedApp.code = tFields[key3].lookup.relatedApp.code || ' ';
                                tFields[key3].lookup.filterCond = tFields[key3].lookup.filterCond || ' ';
                            }
                        }

                    }
                }

                else if (fields[key].type =='REFERENCE_TABLE'){
                    fields[key].referenceTable.filterCond =  fields[key].referenceTable.filterCond || " ";
                    fields[key].referenceTable.relatedApp.code = fields[key].referenceTable.relatedApp.code  || " ";
                }

                else if (fields[key].hasOwnProperty('lookup')){
                    if(fields[key].lookup == null){
                        delete fields[key];
                    } else{
                        fields[key].lookup.relatedApp.code = fields[key].lookup.relatedApp.code || ' ';
                        fields[key].lookup.filterCond = fields[key].lookup.filterCond || ' ';
                    }
                }
            }

            //check null record right
            for (let j = 0; j < recordRights.length; j ++){
                if (recordRights[j].filterCond == ""){
                    recordRights[j].filterCond = " ";
                }
            }

            let recordCond1 =  appConfig.recordCond1;
            if (recordCond1){
                let found = Object.values(viewInfo).find(x => x.id == recordCond1.id);
                recordCond1 = found ? iterate(found) : false;
            }            

            let data = {
                saveButtonName : appConfig.saveButtonName,
                appRights    : appRights,
                recordRights : recordRights,
                fieldRights  : fieldRights,
                fields       : fields,
                app          : app,
                appName      : escapeOutput(appName),
                appCreatorCode: appCreatorCode,
                locateCond   : appConfig.locateCond,
                timeCond     : appConfig.timeCond,
                auth         : appConfig.auth,
                funcCond0    : appConfig.funcCond0,
                apiToken0    : appConfig.apiToken0,
                recordCond0  : appConfig.recordCond0,
                fieldCond0   : appConfig.fieldCond0,
                // recordCond1  : recordCond1,
                processCond1 : appConfig.processCond1,
                domain       : domain,
                formLayout   : formLayout,
                thanksPage   : appConfig.thanksPage,
                templateColor: appConfig.templateColor,
                showText     : appConfig.showText,
                creator      : appConfig.creator,
                editor       : appConfig.editor,
                calendarView : appConfig.calendarView,
                notif        : appConfig.notif,
                /**
                 * # 補足
                 * [CHOBIIT-184](https://noveldev.backlog.com/view/CHOBIIT-184)の対応で`actionCondList`に徐々に移行している。
                 * 古い形のデータにも対応するよう`actionCond`, `webhookSync`を残している。
                 */
                actionCondList: appConfig.actionCondList,
                actionCond   : appConfig.actionCond,
                webhookSync : appConfig.webhookSync,

                ownerView    : appConfig.ownerView,
                groupView    : appConfig.groupView,
                relateFieldsInfo : relateFieldsInfo,
                lookupRelateInfo : lookupRelateInfo,
                showComment : appConfig.showComment,
                appLinkTo : appConfig.appLinkTo,
                jsCustom: appConfig.jsCustom,
                cssCustom : appConfig.cssCustom,
                robotoCheck : appConfig.robotoCheck,
                autoSendMail : appConfig.autoSendMail,
                responseControl : appConfig.responseControl,
                tempSaving : appConfig.tempSaving,
                lkCompleteMatch : appConfig.lkCompleteMatch,
                trustedSites: appConfig.trustedSites,
                statusInfo : statusInfo
                //evaluateRecordRights: evaluateRecordRights
            }

            /**
             *  一覧ビューを最新のものに置き換える
             */
            const views = appConfig.views;
            if(views !== undefined){
                data.views = ListViewConfigService.replaceWithLatestViews(views, viewInfo);

            }

            if(recordCond1 !== undefined){
                data.recordCond1 = recordCond1;
            }

            if ( (appConfig.auth === false || appConfig.auth === 1) && lookupRelateInfo && lookupRelateInfo.map(x => x.relateAppApiToken).includes(false)){
                $putBtn.children().toggleClass("fa-sync fa-spin fa-cloud-upload-alt");
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("check-api-token-setting-of-the-linked-app"),
                    type: 'red',
                    animateFromElement: false,
                });
                return;
            }

            if(!checkLookupKey){
                $.alert({
                    title: 'Warning',
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("copy-origin-key-of-lookup-field-must-be-unique"),
                    type: 'orange',
                    animateFromElement: false,
                    buttons: {
                        OK: async function () {
                            console.log('starting put app to dynamo....')
                            let dataToDyanmo = Object.assign({},data);
                            let putDynamoPromise  = new Promise((resolve, reject) => {
                                let URL = configApi.manageApp;
                                $.ajax({
                                    type: 'POST',
                                    url: URL,
                                    headers: { 'X-Api-Key': apiKey },
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    data: JSON.stringify(dataToDyanmo),
                                    success: function () {
                                        console.log('put app to dynamo success');
                                        resolve();
                                    },
                                    error: function (err) {
                                        console.error('put app to dynamo fail')
                                        reject(err);
                                    }
                                })
                            })
                            let createFormPromise = new Promise((resolve, reject) => {
                                console.log('starting create form....')
                                let URL = configApi.createForm;
                                $.ajax({
                                    type: 'POST',
                                    url: URL,
                                    headers: { 'X-Api-Key': apiKey },
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    data: JSON.stringify(data),
                                    success: function (resp) {
                                        console.log('create form success!!');
                                        resolve();
                                    },
                                    error: function (err) {
                                        console.error('create form fail');
                                        reject(err);
                                    }
                                })
                            })
                            await putDynamoPromise
                            await createFormPromise
                            $putBtn.children().toggleClass("fa-sync fa-spin fa-cloud-upload-alt");
                            $.alert({
                                title: translateCommon("success-title"),
                                icon: 'fas fa-check',
                                content: translateInfo("app-setting.table.put-dynamo-success-message"),
                                type: 'green',
                                animateFromElement: false,
                            });
                        },

                    }
                });
            }else{
                console.log('starting put app to dynamo....')
                let dataToDyanmo = Object.assign({},data);
                let putDynamoPromise  = new Promise((resolve, reject) => {
                    let URL = configApi.manageApp;
                    $.ajax({
                        type: 'POST',
                        url: URL,
                        headers: { 'X-Api-Key': apiKey },
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify(dataToDyanmo),
                        success: function () {
                            console.log('put app to dynamo success');
                            resolve();
                        },
                        error: function (err) {
                            console.error('put app to dynamo fail')
                            reject(err);
                        }
                    })
                })
                let createFormPromise = new Promise((resolve, reject) => {
                    console.log('starting create form....')
                    let URL = configApi.createForm;
                    $.ajax({
                        type: 'POST',
                        url: URL,
                        headers: { 'X-Api-Key': apiKey },
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function (resp) {
                            console.log('create form success!!');
                            resolve();
                        },
                        error: function (err) {
                            console.error('create form fail');
                            reject(err);
                        }
                    })
                })
                await putDynamoPromise
                await createFormPromise
                $putBtn.children().toggleClass("fa-sync fa-spin fa-cloud-upload-alt");
                $.alert({
                    title: translateCommon("success-title"),
                    icon: 'fas fa-check',
                    content: translateInfo("app-setting.table.put-dynamo-success-message"),
                    type: 'green',
                    animateFromElement: false,
                });
            }

        }catch(err){
            console.error(err);
            storeErr(err, 'put app to dynamo');
            $putBtn.children().toggleClass("fa-sync fa-spin fa-cloud-upload-alt");
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("failed-to-update-linked-apps"),
                type: 'red',
                animateFromElement: false,
            });
        }
    })

    // group setting------------------------------------



    let groupDataSet = allConfigDataGroups.map(group => [
        checkboxDeleteGroup + editRecordBtn + deleteRecordBtn,
        group.name,
        showGroupUsers(group.users)
    ]);

    let groupTable = $('#group-table').DataTable( {
        autoWidth: false,
        /**
         * # 注意
         * US版は DataTable の`language`オプションについてはデフォルト設定を使っている模様。
         * 参照：https://datatables.net/reference/option/language
         */
        ...(process.env.CHOBIIT_LANG === "ja" ? {
            language: {
                "lengthMenu": "表示する件数 _MENU_ ",
                "zeroRecords": "該当するレコードがありません。",
                "info": " _START_ - _END_ 件表示  (_TOTAL_件中)",
                "infoEmpty": "0 - 0 件表示　(_TOTAL_件中)",
                "infoFiltered": "",
                "paginate": {
                    "previous": "戻る",
                    "next": "次へ"
                },
                "search": "検索"
            },
        } : {}),
        data: groupDataSet,
        columnDefs: [ {
            orderable: false,
            targets: 0,
            searchable: false
        } ],
        columns: [
            {title: '<input type="checkbox" id="select-all-groups">'},
            {title: translateInfo("group-setting.table.column.group-name")},
            {title: translateInfo("group-setting.table.column.chobiit-user")},

        ],
        pageLength : 10,
        lengthChange: false,
    });
    $('#group-table').css('width','max-content');
    const addGroupBtn = `<button type="button" class="btn action-button" id="group-add" style="margin: 0rem .5rem 1rem 0rem;"><i class="fas fa-plus"></i> ${translateInfo("group-setting.table.button-label.add-group")}</button>`;
    const deleteGroupsBtn = `<button type="button" class="btn btn-delete-groups" id="groups-delete" style="margin: 0rem .2rem 1rem 0rem;"><i class="far fa-trash-alt"></i> ${translateInfo("group-setting.table.button-label.bulk-delete")}</button>`;
    const chobiitGroupImportBtn = `<button type="button" class="btn csv-ie-button" id="group-csv-im" style="margin: 0rem .2rem 1rem 0rem;"><i class="fas fa-file-upload"></i> ${translateInfo("group-setting.table.button-label.csv-import")}</button>`;
    const chobiitGroupExportBtn = ` <button type="button" class="btn csv-ie-button" id="group-csv-ex" style="margin: 0rem .2rem 1rem 0rem;"><i class="fas fa-file-download"></i> ${translateInfo("group-setting.table.button-label.csv-export")}</button>`;
    $('#group-table_wrapper').children().first().children().first().append(addGroupBtn + deleteGroupsBtn + chobiitGroupImportBtn + chobiitGroupExportBtn);

    //add group
    $('#group-add').click(function(){
        let jcCreateGroup = $.confirm({
            animateFromElement: false,
            columnClass: 'col-md-8',
            title: translateInfo("group-setting.add-group.modal-title"),
            content: groupSettingRecord,
            buttons: {
                formSubmit: {
                    text: translateCommon("save"),
                    btnClass: 'btn-info add-group-btn',
                    action: function(){
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {

                allConfigData.data.users.forEach(user => {
                    let opt  =`<option value="${user.loginName}">${user.loginName}</option>`;
                    $('#group-users').append(opt)
                })

                //submit handle
                $('.add-group-btn').on('click',async function(){

                    let groupName = $('#group_name').val();
                    if (!groupName){
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("enter-group-name"),
                            type: 'red',
                            animateFromElement: false,
                        });
                        return false;
                    }

                    /**
                     * # 注意
                     * 日本版とUS版でグループ名の仕様が異なる。
                     * もし統一できるものなのであれば、統一して差分を解消してほしい。
                     */
                    
                    if (process.env.CHOBIIT_LANG === "ja") {
                        let zenkakuRegex = /^[^\x01-\x7E\uFF61-\uFF9F]+$/;

                        if((zenkakuRegex.test(groupName) &&  groupName.length > 32) || (!zenkakuRegex.test(groupName) && groupName.length > 64)){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("max-length-of-group-name-is"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                    }
                    
                    if (process.env.CHOBIIT_LANG === "en") {
                        if(groupName.length > 128){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("max-length-of-group-name-is"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                    }

                    // groupNameに「,」(半角カンマ)が含まれている場合はエラー
                    if(groupName.includes(',')){
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("group-name-cannot-have-comma"),
                            type: 'red',
                            animateFromElement: false,
                        });
                        return false;
                    }
                    
                    if (allConfigDataGroups.map(x => x.name).includes(groupName)){
                        $.alert({
                            title: translateCommon("input-duplication-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("group-names-are-duplicated"),
                            type: 'red',
                            animateFromElement: false,
                        });
                        return false;
                    }

                    let groupUsers = $('#group-users').val();
                    
                    /**
                     * # FIXME
                     * 以下のバリデーション（ユーザー数の制限？）が、日本版には実装されているがUS版には実装されていない。
                     * 原因を調査して、仕様が統一できるのであればUS版でも実行する。
                     */
                    if (process.env.CHOBIIT_LANG === "ja") {
                        for (let i = 0; i < groupUsers.length; i++){
                            let user = groupUsers[i];
                            let userGroups = allConfigDataGroups.filter(x => x.users.includes(user));
                            if (userGroups.length >= 100){
                                $.alert({
                                    title: translateCommon("input-error-title"),
                                    icon: 'fas fa-exclamation-triangle',
                                    content: `「${user}」ユーザーが参加できる最大グループ数は１００です。`,
                                    type: 'red',
                                    animateFromElement: false,
                                });
                                return false;
                            }
                        }
                    }

                    try{
                        $(this).html(loadingBtn);
                        $(this).prop('disabled', true);

                        let submitGroupData  = {
                            domain : domain,
                            name: groupName,
                            users : groupUsers
                        }
                        await submitGroup(submitGroupData, 'POST');

                        //add row
                        groupTable.row.add( [
                            checkboxDeleteGroup + editRecordBtn +  deleteRecordBtn,
                            groupName,
                            showGroupUsers(groupUsers)
                        ]).draw(false).page('last').draw('page');


                        //upadte confid data
                        allConfigDataGroups.push(submitGroupData);

                        //add to user auth
                        // $('#user-auth-group').append(`<option value="${groupName}">${groupName}</option>`)

                        jcCreateGroup.close();
                        $.alert({
                            title: translateCommon("success-title"),
                            icon: 'fas fa-check',
                            content: translateInfo("group-setting.add-group.success-message"),
                            type: 'green',
                            animateFromElement: false,
                        });
                        console.log('create group  done');

                    }catch(err){
                        jcCreateGroup.close();
                        console.error(err);
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("failed-to-set-group"),
                            type: 'red',
                            animateFromElement: false,
                        });
                    }
                })
            }
        });
    })


    //edit group
    $('#group-table').on('click','.edit-record',function(){
        let $editIcon = $(this);
        let jcUpdateGroup = $.confirm({
            animateFromElement: false,
            columnClass: 'col-md-8',
            title: translateInfo("group-setting.edit-group.modal-title"),
            content: groupSettingRecord,
            buttons: {
                formSubmit: {
                    text: translateCommon("update"),
                    btnClass: 'btn-info update-group-btn',
                    action: function(){
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {
                $('#group_name').prop('disabled',true);

                allConfigData.data.users.forEach(user => {
                    let opt  =`<option value="${user.loginName}">${user.loginName}</option>`;
                    $('#group-users').append(opt)
                })

                let tableRow = groupTable.row($editIcon.closest('tr'));
                let rowValue =  groupTable.row(tableRow).data();
                let groupName = rowValue[1];
                let groupConfig = allConfigDataGroups.find(x => x.name == groupName);
                if (groupConfig){
                    $('#group_name').val(groupConfig.name);
                    $('#group-users').val(groupConfig.users);
                }


                $('.update-group-btn').click(function(){
                    console.log('starting update group...');

                        let groupUsers = $('#group-users').val();

                        /**
                         * # FIXME
                         * 以下のバリデーション（ユーザー数の制限？）が、日本版には実装されているがUS版には実装されていない。
                         * 原因を調査して、仕様が統一できるのであればUS版でも実行する。
                         */
                        if (process.env.CHOBIIT_LANG === "ja") {
                            for (let i = 0; i < groupUsers.length; i++){
                                let user = groupUsers[i];
                                let userGroups = allConfigDataGroups.filter(x => x.users.includes(user) && x.name != groupName);
                                if (userGroups.length >= 100){
                                    $.alert({
                                        title: '入力エラー',
                                        icon: 'fas fa-exclamation-triangle',
                                        content: `「${user}」ユーザーが参加できる最大グループ数は１００です。`,
                                        type: 'red',
                                        animateFromElement: false,
                                    });
                                    return false;
                                }
                            }
                        }

                        let URL =  configApi.createGroup;
                        const submitGroupData = {
                            domain : domain,
                            name : groupName,
                            users: groupUsers
                        }



                        $(this).html(loadingBtn);
                        $(this).prop('disabled', true);
                        submitGroup(submitGroupData, 'PUT')
                        .then(() => {
                            console.log('update group success');
                                groupConfig.users = groupUsers;

                                groupTable
                                .row( tableRow )
                                .data([
                                    checkboxDeleteGroup + editRecordBtn + deleteRecordBtn,
                                    groupConfig.name,
                                    showGroupUsers(groupUsers)
                                ])
                                .draw(false);

                                jcUpdateGroup.close()
                        })
                        .catch(err => {
                            console.log(err);
                            jcUpdateGroup.close()
                            console.err('update group fail')
                        })


                })
            }
        });
    })
    //delete group
    $('#group-table').on('click','.delete-record',function(){
        let $deleteIcon = $(this);
        let jcDeleteGroup = $.confirm({
            animateFromElement: false,

            title: translateCommon("confirmation-title"),
            content: translateCommon("confirmation-message"),
            buttons: {
                somethingElse: {
                    text: translateCommon("delete"),
                    btnClass: 'btn-red delete-group-btn',
                    action: function(){
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function(){

                    }
                }
            },
            onContentReady: function () {
                $('.delete-group-btn').click(function(){
                    console.log('starting delete group...');
                        let tableRow = groupTable.row($deleteIcon.closest('tr'));
                        let rowValue =  groupTable.row(tableRow).data();
                        let groupName = rowValue[1];



                        let URL =  configApi.deleteGroup;
                        const data = {
                            domain : domain,
                            name : groupName
                        }

                        $(this).html(loadingBtn);
                        $(this).prop('disabled', true);
                        $.ajax({
                            type: 'DELETE',
                            url: URL,
                            headers: { 'X-Api-Key': apiKey },
                            dataType: 'json',
                            contentType: 'application/json',
                            data: JSON.stringify(data),
                            success: function () {
                                console.log('delete group success');
                                groupTable.row(tableRow).remove().draw(false);

                                let index = allConfigDataGroups.findIndex(x => x.name == groupName);
                                if (index != -1)  allConfigDataGroups.splice(index, 1);

                                //remove option user auth
                                // $(`#user-auth-group option[value="${groupName}"]`).remove();
                                jcDeleteGroup.close();

                            },
                            error: function () {
                                jcDeleteGroup.close()
                                console.err('delete group fail')
                            }
                        });
                })
            }
        });
    })

     //export group csv
     $('#group-csv-ex').click(function(){
        $.confirm({
            animateFromElement: false,

            columnClass: 'col-md-8',
            title: translateInfo("group-setting.export-group.modal-title"),
            content: translateInfo("group-setting.export-group.modal-message"),
            buttons: {
                formSubmit: {
                    text: translateCommon("export"),
                    btnClass: 'btn-info ',
                    action: function () {
                        let fileName = `${translateInfo("group-setting.export-group.export-group-file-name")}.csv`;
                        let header = [
                            translateInfo("group-setting.export-group.chobiit-group-name"),
                            translateInfo("group-setting.export-group.chobiit-users"),
                        ];
                        let dataExport = [header];
                        allConfigDataGroups.forEach(group => {
                            let row = [group.name, group.users.join(',')]
                            dataExport.push(row);
                        })
                        exportToCsv(fileName, dataExport);
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {

            }
        });
    })

     //import chobiit group csv
     $('#group-csv-im').click(function(){
        let jcGroupImport = $.confirm({
            animateFromElement: false,

            columnClass: 'col-md-8',
            title: translateInfo("group-setting.import-group.modal-title"),
            content: `<p>${translateInfo("group-setting.import-group.modal-message")}</p>
                    <div class="file-space-chobitone">
                        <label class="btn  file-upload-button" for="group-file-input">
                            <input id="group-file-input" accept=".csv" class="kintone-data" type="file" style="display:none"<i class="fas fa-upload"></i> ${translateCommon("choose-file")}
                        </label>
                        <div class="label label-info"></div>
                    </div> `,
            buttons: {
                formSubmit: {
                    text: translateCommon("import"),
                    btnClass: 'btn-info group-import',
                    action: function () {
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {
                $('#group-file-input').on("change", function() {
                    let files = this.files;
                    if (files.length) {
                        $(this).parent().next('.label-info').html(files[0].name)
                    }
                });
                $('.group-import').click(async function(){
                    try{
                        let files = $('#group-file-input')[0].files;
                        if(!files.length){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("select-a-csv-file"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                        let textFile = await readFile(files[0]);
                        if (!textFile){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("csv-headers-are-invalid"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                        let datas = CSVToArray(textFile);

                        if (datas[datas.length -1] == ""){
                            datas.pop();
                        }
                        //delete null row
                        datas = datas.filter(data => {
                            let check = false;
                            data.forEach(item => {
                                if (item != ""){
                                    check = true;
                                    return;
                                }
                            })
                            return check;
                        })
                        if (!datas.length){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("csv-headers-are-invalid"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }
                        if (datas.length == 1){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("there-is-no-group-record"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }

                        let groupNameArr = datas.map(x => x[0])


                        let zenkakuRegex = /^[^\x01-\x7E\uFF61-\uFF9F]+$/
                        //check duplicate
                        let errFlag = false;
                        //check before submit
                        for (let i = 1; i < datas.length; i ++){
                            let groupName = datas[i][0];


                            if(!groupName){
                                $.alert({
                                    title: translateCommon("input-error-title"),
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("there-are-some-empty-attributes-in-a-line", {lineNumber: i+1}),
                                    type: 'red',
                                    animateFromElement: false,
                                });
                                return false;
                            }



                            /**
                             * # FIXME
                             * 以下でグループ名の長さのバリデーションをしているが、US版ではここでバリデーションしていない。
                             * US版での実装漏れと思われます。
                             * 
                             * また、グループ名の仕様の違いについてはもっと上の方で同様の処理があったので、そちらを参照してください。
                             * いずれにせよ、仕様の差分が仕方のないものなのか、解消できるものなのかを調査する必要がある。
                             */
                            if (process.env.CHOBIIT_LANG === "ja") {
                                if((zenkakuRegex.test(groupName) &&  groupName.length > 32) || (!zenkakuRegex.test(groupName) && groupName.length > 64)){
                                    $.alert({
                                        title: '入力エラー',
                                        icon: 'fas fa-exclamation-triangle',
                                        content:  `${i+1}行目にグループ名の最大文字数は半角６４文字まです。（日本語全角は３２文字まで）`,
                                        type: 'red',
                                        animateFromElement: false,
                                    });
                                    return false;
                                }
                            }


                            if(groupNameArr.indexOf(groupName) != i){
                                $.alert({
                                    title: translateCommon("input-duplication-error-title"),
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("group-name-is-duplicated-in-a-line", {lineNumber: i+1}),
                                    type: 'red',
                                    animateFromElement: false,
                                });
                                return false;
                            }

                            let groupUsers = datas[i][1].split(',');
                            let subAr = datas.slice(0,i+1).map(x => x[1].split(','));

                            /**
                             * # FIXME
                             * ここのバリデーションも、US版では実装がされていない。おそらく実装漏れ。
                             * 仕様の確認をして、適切に対処してほしい。
                             */
                            if (process.env.CHOBIIT_LANG === "ja") {
                                for (let j = 0; j < groupUsers.length; j++){
                                    let user = groupUsers[j];
                                    let userGroups = allConfigDataGroups.filter(x => x.users.includes(user) && x.name != groupName);
                                    let userGroupsCSV = subAr.filter(x => x.includes(user));

                                    if (userGroups.length + userGroupsCSV.length  >= 100){
                                        $.alert({
                                            title: translateCommon("input-error-title"),
                                            icon: 'fas fa-exclamation-triangle',
                                            content: `${i+1}行目の「${user}」ユーザーが参加できる最大グループ数は１００です。`,
                                            type: 'red',
                                            animateFromElement: false,
                                        });
                                        return false;
                                    }
                                }
                            }


                            if (checkDuplicate(groupUsers)){
                                $.alert({
                                    title: translateCommon("input-duplication-error-title"),
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("chobiit-users-are-duplicated-in-a-line", {lineNumber: i+1}),
                                    type: 'red',
                                    animateFromElement: false,
                                });
                                return false;
                            }


                            if (groupUsers.some(user => !allConfigData.data.users.map(x => x.loginName).includes(user) )){
                                $.alert({
                                    title: translateCommon("input-duplication-error-title"),
                                    icon: 'fas fa-exclamation-triangle',
                                    content: translateError("chobiit-user-does-not-exist-in-a-line", {lineNumber: i+1}),
                                    type: 'red',
                                    animateFromElement: false,
                                });
                                return false;
                            }


                        }
                        //submit
                        let allConfigDataGroupNames = allConfigDataGroups.map(x => x.name);
                        for (let i = 1; i < datas.length; i ++){
                            const lineNumber = i+1

                            let groupName = datas[i][0];
                            let groupUsers = datas[i][1].split(',');

                            let submitData = {
                                domain : domain,
                                name : groupName,
                                users : groupUsers
                            };
                            $(this).html(saveLoadingBtn);

                            if (allConfigDataGroupNames.includes(groupName)){

                                try {
                                    await submitGroup(submitData, 'PUT', lineNumber);
                                } catch (error) {
                                    $(this).html(translateCommon("import"));
                                    errFlag = true;
                                    break;
                                }
                                
                                let index = allConfigDataGroups.findIndex(group => group.name == groupName);

                                groupTable.row(index)
                                .data([
                                    checkboxDeleteGroup + editRecordBtn + deleteRecordBtn,
                                    groupName,
                                    showGroupUsers(groupUsers)
                                ])
                                .draw(false);


                                allConfigDataGroups[index].users = groupUsers;
                                
                            }else{
                                $(this).html(saveLoadingBtn);
                                try {
                                    await submitGroup(submitData, 'POST', lineNumber);
                                } catch (error) {
                                    $(this).html(translateCommon("import"));
                                    errFlag = true;
                                    break;
                                }
                                
                                groupTable.row.add( [checkboxDeleteGroup + editRecordBtn+ deleteRecordBtn,groupName, showGroupUsers(groupUsers)] ).draw( false );
                                allConfigDataGroups.push(submitData)
                                
                            }
                        }
                        if (!errFlag){
                            $.alert({
                                title: translateCommon("success-title"),
                                icon: 'fas fa-check',
                                content: translateInfo("group-setting.import-group.success-message"),
                                type: 'green',
                                animateFromElement: false,
                            });
                            jcGroupImport.close();
                        }
                    }catch(err){
                        jcGroupImport.close();
                        console.error(err);
                        storeErr(err, 'import kintone user')
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("failed-to-set-group"),
                            type: 'red',
                            animateFromElement: false,
                        });
                    }
                })
            }
        });
    })

    //select all groups
    $("#group-table").on("click", "#select-all-groups", function () {
        const rows = groupTable.rows({ "search": "applied" }).nodes();
        $('input[type="checkbox"]', rows).prop("checked", this.checked);
    })

    // delete groups
    $("#groups-delete").click(function () {
        const countGroupsIsChecked =  $(".checked-group:checked", groupTable.rows().nodes()).length;
        if (countGroupsIsChecked > 0) {
            const popupDeleteGroups = $.confirm({
                animateFromElement: false,
                columnClass: "col-md-8",
                title: translateInfo("group-setting.bulk-delete.modal-title"),
                content: translateInfo("group-setting.bulk-delete.modal-message", {groupsCount: countGroupsIsChecked}),
                buttons: {
                    formSubmit: {
                        text: translateCommon("yes"),
                        btnClass: "btn-info delete-groups-btn",
                        action: async function() {
                            popupDeleteGroups.close();
                            const apiDeleteGroups =  configApi.deleteGroups;
                            const loadingDeleteGroups = $.dialog({
                                icon: "fa fa-spinner fa-spin",
                                title: "",
                                content: translateInfo("group-setting.bulk-delete.now-deleting-message"),
                                boxWidth: "30%",
                                useBootstrap: false,
                                theme: "supervan",
                                closeIcon: false,
                                lazyOpen: true,
                            });
                            try {
                                loadingDeleteGroups.open();
                                const dataGroupsIsChecked = $(groupTable.$('input[type="checkbox"]:checked').map(function () {
                                    const tableGroupRow = groupTable.row( $(this).closest(" tr ") );
                                    const groupName = groupTable.row( tableGroupRow ).data()[1];
                                    return {
                                        element: $(this),
                                        groupName: groupName,
                                    }
                                }))

                                let respDeleteGroups;

                                if (dataGroupsIsChecked.length > 0) {

                                    const groups = {
                                        domain : domain,
                                        data : dataGroupsIsChecked.map((index, item) => item?.groupName || [])
                                    }

                                    respDeleteGroups = await deleteRecords(dataGroupsIsChecked, apiDeleteGroups, apiKey, groups, groupTable)

                                }

                                loadingDeleteGroups.close();

                                if (respDeleteGroups?.statusCode === 200) {
                                    return swal(
                                        translateCommon("success-title"),
                                        translateInfo("group-setting.bulk-delete.delete-success-message"),
                                        "success"
                                    );
                                }

                                return swal(
                                    translateCommon("error-title"),
                                    translateInfo("group-setting.bulk-delete.delete-failure-message"),
                                    "error"
                                );

                            } catch(err) {
                                popupDeleteGroups.close()
                                return swal(
                                    translateCommon("error-title"),
                                    translateInfo("group-setting.bulk-delete.delete-failure-message"),
                                    "error"
                                );
                            }
                        }
                    },
                    cancel: {
                        text: translateCommon("no"),
                        action: function () {
                        }
                    },
                },
            });
        } else {
            return swal(
                translateCommon("error-title"),
                translateError("select-groups-you-want-to-delete"),
                "warning"
            );
        }
    })
    //user setting handle---------------------------
    //init table
    let userDataSet = allConfigData.data.users.map(user => [
        checkboxDeleteUser + editRecordBtn + deleteRecordBtn,
        `<div class="count">${getCountByUser(countConfig, user.loginName)}</div>`,
        user.loginName,
        user.name,
        user.mailAddress,
        user.kintoneLoginName,
        user.apps,
        user.isAdmin
    ]);
    let userTable = $('#user-table').DataTable( {
        autoWidth: false,
        /**
         * # 注意
         * US版は DataTable の`language`オプションについてはデフォルト設定を使っている模様。
         * 参照：https://datatables.net/reference/option/language
         */
        ...(process.env.CHOBIIT_LANG === "ja" ? {
            language: {
                "lengthMenu": "表示する件数 _MENU_ ",
                "zeroRecords": "該当するレコードがありません。",
                "info": " _START_ - _END_ 件表示  (_TOTAL_件中)",
                "infoEmpty": "0 - 0 件表示　(_TOTAL_件中)",
                "infoFiltered": "",
                "paginate": {
                    "previous": "戻る",
                    "next": "次へ"
                },
                "search": "検索"
            },
        } : {}),
        data: userDataSet,
        columnDefs: [ {
            orderable: false,
            targets: 0,
            searchable: false
        } ],
        columns: [
            {title: '<input type="checkbox" id="select-all-users">'},
            {title: translateInfo("user-setting.table.column.requests-count")},
            {title: translateInfo("user-setting.table.column.chobiit-login-name")},
            {title: translateInfo("user-setting.table.column.chobiit-display-name")},
            {title: translateInfo("user-setting.table.column.email-address")},
            {title: translateInfo("user-setting.table.column.linked-kintone-account")},
            {title: translateInfo("user-setting.table.column.apps-used-in-chobiit")},
            {title: translateInfo("user-setting.table.column.is-administrator")},
        ],
        pageLength : 10,
        lengthChange: false,
    });
    $('#user-table').css('width','max-content');
    const addUserBtn = `<button type="button" class="btn action-button" id="user-add" style="margin: 0rem .5rem 1rem 0rem;"><i class="fas fa-plus"></i> ${translateInfo("user-setting.table.button-label.add-user")}</button>`;
    const deleteUsersBtn = `<button type="button" class="btn btn-delete-users" id="users-delete" style="margin: 0rem .2rem 1rem 0rem;"><i class="far fa-trash-alt"></i> ${translateInfo("user-setting.table.button-label.bulk-delete")}</button>`;
    const chobiitUserImportBtn = `<button type="button" class="btn csv-ie-button" id="user-csv-im" style="margin: 0rem .2rem 1rem 0rem;"><i class="fas fa-file-upload"></i> ${translateInfo("user-setting.table.button-label.import")}</button>`;
    const chobiitUserExportBtn = ` <button type="button" class="btn csv-ie-button" id="user-csv-ex" style="margin: 0rem .2rem 1rem 0rem;"><i class="fas fa-file-download"></i> ${translateInfo("user-setting.table.button-label.export")}</button>`;
    $('#user-table_wrapper').children().first().children().first().append(addUserBtn + deleteUsersBtn + chobiitUserImportBtn + chobiitUserExportBtn);
    //add user
    $('#user-add').click(function(){
        let jcCreateUser = $.confirm({
            animateFromElement: false,
            columnClass: 'col-md-8',
            title: translateInfo("user-setting.add-user.modal-title"),
            content: userSettingRecord,
            buttons: {
                formSubmit: {
                    text: translateCommon("save"),
                    btnClass: 'btn-info add-user-btn',
                    action: function(){
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {
                let count = 0;
                $(".add-row").click(function(){
                    count ++;
                    let clickedBodyTable = $(this).parent().parent().parent();
                    let cloneClikedTr = clickedBodyTable.children().first().clone(true);

                    cloneClikedTr.find('.text_notif').val('');
                    let $cbox = cloneClikedTr.find('input[type="checkbox"]');
                    $cbox.each(function(){
                        $(this).next().attr('for',$(this).attr('id')+''+count);
                        $(this).attr('id',$(this).attr('id')+''+count);
                        $(this).prop("checked", false);
                    })

                    let clickedTr = $(this).parent().parent();
                    clickedTr.after(cloneClikedTr);
                });

                $(".remove-row").click(function(){
                    let $tr =  $(this).parent().parent();
                    if($tr.siblings().length >= 1){
                         $tr.remove();
                    }else{
                        const $custom = $tr.find('.js-custom').length ?  $tr.find('.js-custom') : $tr.find('.css-custom');
                        if ($custom.length && $custom.is(":disabled")){
                            $custom.val('');
                            $custom.attr('fileId','');
                            $custom.attr('fileUrl','');
                            $custom.prop('disabled',false);

                        }
                    }
                });



                //app handle
                let listAppConfigAuth = []
                allConfigData.data.apps.forEach(x => {
                    if (x.auth){
                        listAppConfigAuth.push(x.app);
                    }
                });
                let lisAppAuth = appList.filter(app => listAppConfigAuth.includes(app.appId));
                lisAppAuth.forEach(app => {
                    let option = `<option value="${app.appId}">${escapeOutput(app.name)} (${app.appId})</option>`
                    $('.user-app').append(option);
                })
                //kintone user select handle
                let kintoneUsers = kintoneUserList.filter(user => allConfigData.data.kintoneUsers.map(x=>x.kintoneLoginName).includes(user.code));
                kintoneUsers.forEach(user =>{
                    let option = `<option value="${user.code}">${user.name} (${user.code})</option>`
                    $('#kintone_user').append(option);
                })

                //submit handle
                $('.add-user-btn').on('click',async function(){
                    try {
                        let allSubmitData = await getSubmitUserData('add');
                        if(allSubmitData){
                            console.log('---all user submit data---');
                            console.log(allSubmitData);
                            jcCreateUser.close();
                            let jcPassSetting = $.confirm({
                                animateFromElement: false,
                                title: translateInfo("user-setting.add-user.password-setting-modal-title"),
                                content: `
                                    <div style="padding-top: 1rem; padding: 1rem;">                                         
                                        <div class="kintone-field-style">   
                                            <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateInfo("user-setting.add-user.password-setting-modal-description")}</label>${requireIcon}
                                            <input type="text" class="form-control kintone-data" placeholder="" id="chobiit-user-password">
                                        </div>
                                    </div>`,
                                buttons: {
                                    formSubmit: {
                                        text: translateInfo("user-setting.add-user.password-save-message"),
                                        btnClass: 'btn-info save-password',
                                        action: function () {
                                            return false;
                                        }
                                    },
                                    cancel: {
                                        text: translateCommon("cancel"),
                                        action: function () {
                                        }
                                    },
                                },
                                onContentReady: function () {
                                   $('.save-password').click(function(){
                                        let password = $('#chobiit-user-password').val();
                                        if(!password){
                                            $.alert({
                                                title: translateCommon("input-error-title"),
                                                icon: 'fas fa-exclamation-triangle',
                                                content: translateError("enter-your-password"),
                                                type: 'red',
                                                animateFromElement: false,
                                            });
                                            return false;
                                        }

                                        if (!isAlphanumeric(password) || password.length > 50  ){
                                            $.alert({
                                                title: translateCommon("input-error-title"),
                                                icon: 'fas fa-exclamation-triangle',
                                                content: translateError("enter-with-half-width-alphanumeric-characters"),
                                                type: 'red',
                                                animateFromElement: false,
                                            });
                                            return false;
                                        }

                                        jcPassSetting.close();
                                        let jsMail = $.confirm({
                                            animateFromElement: false,
                                            title: translateInfo("user-setting.add-user.password-and-login-navigation.modal-title"),
                                            columnClass: 'col-md-8 col-md-offset-3 ',
                                            theme: 'supervan',
                                            content: `
                                                <br>
                                                <div class='wrapper container'>
                                                  <div class="form-group row">
                                                    <label for="colFormLabel" class="col-md-3 text-right col-form-label">${translateInfo("user-setting.add-user.password-and-login-navigation.email-send-to")}:</label>
                                                    <div class="col-md-8">
                                                      <input type="email" class="form-control" id="emailAddress" disabled>
                                                    </div>
                                                  </div>
                            
                                                  <div class="form-group row">
                                                    <label for="colFormLabel" class="col-md-3 text-right col-form-label">${translateInfo("user-setting.add-user.password-and-login-navigation.email-subject")}:</label>
                                                    <div class="col-md-8">
                                                      <input type="email" class="form-control" id="subject">
                                                    </div>
                                                  </div>
                            
                                                  <div class="form-group row">
                                                    <label for="colFormLabel" class="col-md-3 text-right col-form-label">${translateInfo("user-setting.add-user.password-and-login-navigation.email-body")}:</label>
                                                    <div class="col-md-8">
                                                      <textarea class="form-control" id="content" rows="8"></textarea>
                                                    </div>
                                                  </div>
                            
                                              </div>
                                              </div>
                                            
                                            `,
                                            buttons: {
                                                send: {
                                                    text: translateCommon("send"),
                                                    btnClass: 'btn-orange send-mail',
                                                    action: function () {
                                                        return false;
                                                    }
                                                },
                                                cancel: {
                                                    text: translateCommon("cancel")
                                                },
                                            },
                                            onContentReady: function () {
                                                this.$content.find('#subject').val(translateInfo("user-setting.add-user.password-and-login-navigation.email-subject-content"));
                                                this.$content.find('#emailAddress').val(allSubmitData.mailAddress);
                                                let mailContent = translateInfo(
                                                    "user-setting.add-user.password-and-login-navigation.email-body-content",
                                                    {chobiitFQDN: getChobiitFQDN(), loginName: allSubmitData.loginName, password}
                                                );
                                                this.$content.find('#content').val(mailContent);

                                                $('.send-mail').click(async function(){
                                                    console.log('starting save user and send mail...')
                                                    try{

                                                        $(this).html(loadingBtn);
                                                        $(this).prop('disabled', true);

                                                        allSubmitData['password'] = CryptoJS.SHA512(password).toString();
                                                        // allSubmitData['password'] = password
                                                        await submitUser(allSubmitData);
                                                        var email = $('#emailAddress').val();
                                                        var subject = $('#subject').val();
                                                        var content = $('#content').val();
                                                        sendMail(email, subject, content);
                                                        //add row
                                                        userTable.row.add( [
                                                            checkboxDeleteUser + editRecordBtn + deleteRecordBtn,
                                                            `<div class="count">${getCountByUser(countConfig, allSubmitData.loginName)}</div>`,
                                                            allSubmitData.loginName,
                                                            allSubmitData.name,
                                                            allSubmitData.mailAddress,
                                                            allSubmitData.kintoneLoginName,
                                                            allSubmitData.apps,
                                                            allSubmitData.isAdmin
                                                        ]).draw(false).page('last').draw('page');


                                                        //upadte confid data
                                                        allConfigData.data.users.push(allSubmitData);

                                                        // $(this).html(`<i class="fas fa-spinner fa-spin"></i> 送信..`)
                                                        jsMail.close();
                                                        $.alert({
                                                            title: translateCommon("success-title"),
                                                            icon: 'fas fa-check',
                                                            content: translateInfo("user-setting.add-user.password-and-login-navigation.send-email-success-message"),
                                                            type: 'green',
                                                            animateFromElement: false,
                                                        });
                                                        console.log('create user and send mail done');
                                                    }catch (err){


                                                        console.error(err);
                                                        storeErr(err, 'create chobiit user');
                                                        $.alert({
                                                            title: translateCommon("input-error-title"),
                                                            icon: 'fas fa-exclamation-triangle',
                                                            content: translateInfo("user-setting.add-user.password-and-login-navigation.send-email-failure-message"),
                                                            type: 'red',
                                                            animateFromElement: false,
                                                        });
                                                        jsMail.close();
                                                    }
                                                })
                                            }
                                        });
                                   })
                                }
                            });
                        }
                    }catch(err){
                        jcCreateUser.close();
                        console.error(err);
                        storeErr(err, 'create app ');
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("cannot-configure-chobiit-user"),
                            type: 'red',
                            animateFromElement: false,
                        });
                    }
                })
            }
        });
    })
    //export chobiit user csv
    $('#user-csv-ex').click(function(){
        $.confirm({
            animateFromElement: false,

            columnClass: 'col-md-8',
            title: translateInfo("user-setting.export-users.modal-title"),
            content: translateInfo("user-setting.export-users.modal-message"),
            buttons: {
                formSubmit: {
                    text: translateCommon("export"),
                    btnClass: 'btn-info ',
                    action: function () {
                        let fileName = `${translateInfo("user-setting.export-users.export-users-file-name")}.csv`;
                        let header = [
                            translateInfo("user-setting.export-users.chobiit-login-name"),
                            translateInfo("user-setting.export-users.linked-kintone-account"),
                            translateInfo("user-setting.export-users.chobiit-display-name"),
                            translateInfo("user-setting.export-users.email-address"),
                            translateInfo("user-setting.export-users.app-ids-used-in-chobiit"),
                            translateInfo("user-setting.export-users.is-administrator"),
                            translateInfo("user-setting.export-users.password"),
                        ];
                        let dataExport = [header];
                        allConfigData.data.users.forEach(user => {
                            let isAdmin = user.isAdmin ? 1 : "" ;
                            let row = [user.loginName, user.kintoneLoginName, user.name, user.mailAddress, user.apps, isAdmin, '']
                            dataExport.push(row);
                        })
                        exportToCsv(fileName, dataExport);
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {

            }
        });
    })
     //import chobiit user csv


    $('#user-csv-im').click(function(){
        const content = (() => {
            return `<p>${translateInfo("user-setting.import-users.feature-description-message")}</p>
            <p style="font-size: 14px;">${translateInfo("user-setting.import-users.attention-message")}</p>
            <p style="font-size: 18px; font-weight: bold;">1. ${translateInfo("user-setting.import-users.select-file-to-import-message")}</p>
            <div class="file-space-chobitone">
                <label class="btn  file-upload-button" for="chobiit-user-file-input">
                    <input id="chobiit-user-file-input" accept=".csv" class="kintone-data" type="file" style="display:none"<i class="fas fa-upload"></i> ${translateCommon("choose-file")}
                </label>
                <div class="label label-info"></div>
            </div> 
            <p style="font-size: 18px; font-weight: bold; margin-top:10px;">2. ${translateInfo("user-setting.import-users.transmission-confirmation-after-import-message")}</p>
            <div id="is-send-invitaition-email">
                <input type="radio" name="is-send-invitaition-email" value="yes" checked> ${translateInfo("user-setting.import-users.send-message")}
                <input type="radio" name="is-send-invitaition-email" value="no"> ${translateInfo("user-setting.import-users.do-not-send-message")}
            </div>`;       
        })();

        let jcChobiitUserImport = $.confirm({
            animateFromElement: false,

            columnClass: 'col-md-8',
            title: translateInfo("user-setting.import-users.modal-title"),
            content,
            buttons: {
                formSubmit: {
                    /**
                     * # 注意
                     * 若干ステップが違うため、ボタンのラベルも差分が発生している。
                     */
                    text: process.env.CHOBIIT_LANG === "ja" ? " 次に進む" : " Import",
                    btnClass: 'btn-info chobiit-user-import',
                    action: function () {
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {
                /**
                 * # 注意
                 * この`_thisForChobiitJP`は日本版でだけ使われていた。US版には無かった。
                 */
                const _thisForChobiitJP = this;
                
                $('#chobiit-user-file-input').on("change", function() {
                    let files = this.files;
                    if (files.length) {
                        $(this).parent().next('.label-info').html(files[0].name)
                    }
                });
                $('.chobiit-user-import').click(async function(){
                    try{
                        let errFlag = false;

                        let files = $('#chobiit-user-file-input')[0].files;
                        if (!files.length) {
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("select-a-csv-file"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }

                        const textFile = await readFile(files[0]);
                        if (!textFile) {
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("csv-headers-are-invalid"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return false;
                        }

                        const csvArray = CSVToArray(textFile);
                        const formattedCsvArray = datasFormat(csvArray)
                        if (!formattedCsvArray) {
                            return false
                        }
        
                        const validationCsvResult = validateCsvFile(formattedCsvArray, allConfigData, loginNameRegex, maxNumberOfUsers)  
                        
                        if (!validationCsvResult.passed) {
                            const errorInfo = validationCsvResult.errorInfo
                            $.alert({
                                title: errorInfo.title,
                                icon: errorInfo.icon,
                                content: errorInfo.content,
                                type: errorInfo.type,
                                animateFromElement: errorInfo.animateFromElement,
                            });

                            return false
                        }
                        
                        const isSendInvitaitionEmail = $('input:radio[name="is-send-invitaition-email"]:checked').val()

                        _thisForChobiitJP.close();
                        
                        const canImport = await confirmChobiitUserImport(isSendInvitaitionEmail)
                        if(!canImport) {
                            return false
                        }

                        const userList = await makeUserList(formattedCsvArray, domain,configApi)
                        if (!userList) {
                            return false
                        } 

                        const createUserList = userList.createUserList
                        const updateUserList = userList.updateUserList

                        const csvImportCreateAndUpdateProgressMeterPopup = new CreateAndUpdateProgressMeterPopup("CSV_IMPORT_CREATE_AND_UPDATE", createUserList.length, updateUserList.length)
                        await csvImportCreateAndUpdateProgressMeterPopup.initialize()

                        errFlag =  await bulkOperateUserData(createUserList,"create",isSendInvitaitionEmail, csvImportCreateAndUpdateProgressMeterPopup)
                        errFlag =  await bulkOperateUserData(updateUserList,"update",isSendInvitaitionEmail, csvImportCreateAndUpdateProgressMeterPopup)

                        csvImportCreateAndUpdateProgressMeterPopup.close()

                        if (!errFlag){
                            $.alert({
                                title: translateCommon("success-title"),
                                icon: 'fas fa-check',
                                content: translateInfo("user-setting.import-users.success-message"),
                                type: 'green',
                                animateFromElement: false,
                            });
                            jcChobiitUserImport.close();
                        }
                    }catch(error){
                        const errorMessage = error.message
                        console.error(errorMessage)
                        jcChobiitUserImport.close();
                        await storeErr(error, 'import chobiit user')
                        $.alert({
                            title: translateCommon("failure-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: errorMessage,
                            type: 'red',
                            animateFromElement: false,
                        });
                    }
                })
            }
        });
    })

    /**
     * 一括でユーザーの作成又は更新を行う関数
     * 
     * @param {*} datas 更新又は作成するユーザーのデータ
     * @param {*} operateType 作成・更新処理の切り替え
     * @param {*} isSendInvitaitionEmail メール送信の有無
     */
    const bulkOperateUserData = async(datas,operateType,isSendInvitaitionEmail, progressMeterPopup) => {
        let errFlag = false

        for (let i = 0; i < datas.length; i ++){
            const lineNumber = i+1

            let loginName = datas[i][0];
            let kintoneLoginName = datas[i][1];
            let name = datas[i][2];
            let mailAddress = datas[i][3];

            let apps = datas[i][4].split(',');
            let isAdmin = datas[i][5] == 1 ? true : false;
            let pass = datas[i][6];
            let password = pass


            //kintone organization , kintone group 取得
            let departments = await kintone.api(kintone.api.url('/v1/user/organizations', true), 'GET', {"code" : kintoneLoginName});
            let groups =  await kintone.api(kintone.api.url('/v1/user/groups', true), 'GET', {'code' : kintoneLoginName});

            let organizationArr = [];
            let groupArr = [];

            let departs = departments.organizationTitles;
            let grs = groups.groups;
            for (let j = 0; j < departs.length; j++) {
                let depart = departs[j];
                if (depart.organization){
                    organizationArr.push(depart.organization.code);
                }
            }
            for (let j = 0; j < grs.length; j++){
                let gr = grs[j];
                groupArr.push(gr.code);
            }
            let cybozuToken = allConfigData.data.kintoneUsers.find(x => x.kintoneLoginName == kintoneLoginName).cybozuToken;
            let kintoneUsername = kintoneUserList.find(x => x.code == kintoneLoginName).name;

            const allSubmitData = {
                domain              : domain,
                name                : name,
                loginName           : loginName,
                apps                : apps,
                mailAddress         : mailAddress,
                kintoneLoginName    : kintoneLoginName,
                kintoneUsername     : kintoneUsername,
                cybozuToken         : cybozuToken,
                kintoneOrganizations: organizationArr,
                kintoneGroups       : groupArr,
                isAdmin             : isAdmin,
            };

            if(password !== ""){
                allSubmitData.password = CryptoJS.SHA512(password).toString()
            }

            console.log('starting add  user...')
            $(this).html(saveLoadingBtn);

            /**
             * 現状用意されているユーザー作成と更新の関数の戻り値が違う事と、メール送信のメッセージに差異があること
             * ユーザーが一覧で表示されているテーブルの更新処理に差異があるので、引数によって振る舞いを変えている
             */
            if(operateType === "create") {
                const completedNum = i+1
                

                try {
                    await submitUser(allSubmitData, lineNumber)
                } catch (error) {                    
                    $(this).html(translateCommon("import"));
                    errFlag = true;
                    continue;
                }

                if (isSendInvitaitionEmail === "yes") {
                    const mailContent = translateInfo("user-setting.add-user.password-and-login-navigation.email-body-content",{chobiitFQDN: getChobiitFQDN(), loginName: loginName, password})
                    const subject = translateInfo("user-setting.add-user.password-and-login-navigation.email-subject-content");
                    //! メール送信失敗時の処理が必要かもしれない　他のsendMailでも
                    await sendMail(allSubmitData.mailAddress, subject, mailContent);
                }   

                //add row
                userTable.row.add( [
                    checkboxDeleteUser + editRecordBtn + deleteRecordBtn,
                    `<div class="count">${getCountByUser(countConfig, allSubmitData.loginName)}</div>`,
                    allSubmitData.loginName,
                    allSubmitData.name,
                    allSubmitData.mailAddress,
                    allSubmitData.kintoneLoginName,
                    allSubmitData.apps,
                    allSubmitData.isAdmin
                ]).draw(false).page('last').draw('page');
                //upadte confid data
                allConfigData.data.users.push(allSubmitData);

                progressMeterPopup.setCreateProgress(completedNum)
            }else if(operateType === "update"){
                const completedNum = i+1
                
                try {
                    await updateUser(allSubmitData, lineNumber)
                } catch (error) {
                    $(this).html(translateCommon("import"));
                    errFlag = true;
                    continue;
                }
                
                /**
                 * パスワードが空の時、パスワードを更新しないので
                 * パスワードの変更はない旨の文章を送信するメールに適用する
                 */
                const passwordContentInMail = password === "" ? translateInfo("user-setting.edit-user-csv.no-change-password") : password
                if (isSendInvitaitionEmail === "yes") {
                    const mailContent = translateInfo("user-setting.edit-user-csv.password-and-login-navigation.email-body-content",{chobiitFQDN: getChobiitFQDN(), loginName: loginName, password:passwordContentInMail})
                    const subject = translateInfo("user-setting.edit-user-csv.password-and-login-navigation.email-subject-content");
                    sendMail(allSubmitData.mailAddress, subject, mailContent);
                }

                userTable.rows().every((rowIndex) => {
                    const currentRowLoginName = userTable.row(rowIndex).data()[2]
                    if(currentRowLoginName === loginName){
                        userTable.row(rowIndex).data([
                            checkboxDeleteUser + editRecordBtn + deleteRecordBtn,
                            `<div class="count">${getCountByUser(countConfig, allSubmitData.loginName)}</div>`,
                            allSubmitData.loginName,
                            allSubmitData.name,
                            allSubmitData.mailAddress,
                            allSubmitData.kintoneLoginName,
                            allSubmitData.apps,
                            allSubmitData.isAdmin
                        ]).draw(false);
                    }
                });
                progressMeterPopup.setUpdateProgress(completedNum)
            }else{
                throw new Error("Not accepting processes other than update and create")
            }
        }

        return errFlag
    }

    //update user
    $('#user-table').on('click','.edit-record',function(){
        let tableRow = userTable.row($(this).closest('tr'));
        let rowValue =  userTable.row(tableRow).data();
        let loginName = rowValue[2];
        let userConfig = allConfigData.data.users.find(x => x.loginName == loginName);
        let jcEditUser = $.confirm({
            animateFromElement: false,
            columnClass: 'col-md-8',
            title: translateInfo("user-setting.edit-user.modal-title"),
            content: userSettingRecord,
            buttons: {
                formSubmit: {
                    text: translateCommon("save"),
                    btnClass: 'btn-info edit-user-btn',
                    action: function(){
                        return false;
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function () {
                    }
                },
            },
            onContentReady: function () {
                let count = 0;
                $(".add-row").click(function(){
                    count ++;
                    let clickedBodyTable = $(this).parent().parent().parent();
                    let cloneClikedTr = clickedBodyTable.children().first().clone(true);

                    cloneClikedTr.find('.text_notif').val('');
                    let $cbox = cloneClikedTr.find('input[type="checkbox"]');
                    $cbox.each(function(){
                        $(this).next().attr('for',$(this).attr('id')+''+count);
                        $(this).attr('id',$(this).attr('id')+''+count);
                        $(this).prop("checked", false);
                    })

                    let clickedTr = $(this).parent().parent();
                    clickedTr.after(cloneClikedTr);
                });

                $(".remove-row").click(function(){
                    let $tr =  $(this).parent().parent();
                    if($tr.siblings().length >= 1){
                         $tr.remove();
                    }else{
                        const $custom = $tr.find('.js-custom').length ?  $tr.find('.js-custom') : $tr.find('.css-custom');
                        if ($custom.length && $custom.is(":disabled")){
                            $custom.val('');
                            $custom.attr('fileId','');
                            $custom.attr('fileUrl','');
                            $custom.prop('disabled',false);

                        }
                    }
                });



                //app handle
                let listAppConfigAuth = []
                allConfigData.data.apps.forEach(x => {
                    if (x.auth){
                        listAppConfigAuth.push(x.app);
                    }
                });
                let lisAppAuth = appList.filter(app => listAppConfigAuth.includes(app.appId));
                lisAppAuth.forEach(app => {
                    let option = `<option value="${app.appId}">${app.name} (${app.appId})</option>`
                    $('.user-app').append(option);
                })
                //kintone user select handle
                let kintoneUsers = kintoneUserList.filter(user => allConfigData.data.kintoneUsers.map(x=>x.kintoneLoginName).includes(user.code));
                kintoneUsers.forEach(user =>{
                    let option = `<option value="${user.code}">${user.name} (${user.code})</option>`
                    $('#kintone_user').append(option);
                })
                //set value
                $('#login_name').val(userConfig.loginName);
                $('#login_name').prop('disabled',true);
                $('#kintone_user').val(userConfig.kintoneLoginName);
                $('#name').val(userConfig.name);
                $('#name').prop('disabled',true);
                $('#email').val(userConfig.mailAddress);

                let apps = Array.isArray(userConfig.apps) ? userConfig.apps : JSON.parse(userConfig.apps);
                for (let i = 1; i < apps.length; i++){
                    $('.app-selection').find('.add-row').first().trigger('click');
                }
                apps.forEach((app, index) =>{
                    $('.user-app').eq(index).val(app);
                })
                if(userConfig.isAdmin){
                    $('#administrator').prop('checked',true);
                }

                jcEditUser.$title.after(changePasswordBtn);
                //change password
                $('.change-password').on('click', function(){
                    let jcPassSetting = $.confirm({
                        animateFromElement: false,
                        title: translateInfo("user-setting.edit-user.password-setting.modal-title"),
                        content: `
                            <div style="padding-top: 1rem; padding: 1rem;">                                         
                                <div class="kintone-field-style">   
                                    <label class="font-weight-bold" style="color: #283f56;width : max-content;">${translateInfo("user-setting.edit-user.password-setting.new-password")}</label>${requireIcon}
                                    <input type="text" class="form-control kintone-data" placeholder="" id="chobiit-user-password">
                                </div>
                            </div>`,
                        buttons: {
                            formSubmit: {
                                text: translateInfo("user-setting.edit-user.password-setting.change-password-then-send-email"),
                                btnClass: 'btn-info save-password',
                                action: function () {
                                    return false;
                                }
                            },
                            cancel: {
                                text: translateCommon("cancel"),
                                action: function () {
                                }
                            },
                        },
                        onContentReady: function () {
                           $('.save-password').click(function(){
                                let password = $('#chobiit-user-password').val();
                                if(!password){
                                    $.alert({
                                        title: translateCommon("input-error-title"),
                                        icon: 'fas fa-exclamation-triangle',
                                        content: translateError("enter-your-password"),
                                        type: 'red',
                                        animateFromElement: false,
                                    });
                                    return false;
                                }
                                 if (!isAlphanumeric(password) || password.length > 50 ){
                                    $.alert({
                                        title: translateCommon("input-error-title"),
                                        icon: 'fas fa-exclamation-triangle',
                                        content: translateError("enter-with-half-width-alphanumeric-characters"),
                                        type: 'red',
                                        animateFromElement: false,
                                    });
                                    return false;
                                }
                                jcPassSetting.close();
                                let jsMail = $.confirm({
                                    animateFromElement: false,
                                    title: translateInfo("user-setting.edit-user.password-setting.send-password-via-email"),
                                    columnClass: 'col-md-8 col-md-offset-3 ',
                                    theme: 'supervan',
                                    content: `
                                        <br>
                                        <div class='wrapper container'>
                                          <div class="form-group row">
                                            <label for="colFormLabel" class="col-md-3 text-right col-form-label">${translateInfo("user-setting.edit-user.password-setting.email-send-to")}:</label>
                                            <div class="col-md-8">
                                              <input type="email" class="form-control" id="emailAddress" disabled>
                                            </div>
                                          </div>
                    
                                          <div class="form-group row">
                                            <label for="colFormLabel" class="col-md-3 text-right col-form-label">${translateInfo("user-setting.edit-user.password-setting.email-subject")}:</label>
                                            <div class="col-md-8">
                                              <input type="email" class="form-control" id="subject">
                                            </div>
                                          </div>
                    
                                          <div class="form-group row">
                                            <label for="colFormLabel" class="col-md-3 text-right col-form-label">${translateInfo("user-setting.edit-user.password-setting.email-body")}:</label>
                                            <div class="col-md-8">
                                              <textarea class="form-control" id="content" rows="8"></textarea>
                                            </div>
                                          </div>
                    
                                      </div>
                                      </div>
                                    
                                    `,
                                    buttons: {
                                        send: {
                                            text: translateCommon("send"),
                                            btnClass: 'btn-orange send-mail',
                                            action: function () {
                                                return false;
                                            }
                                        },
                                        cancel: {
                                            text: translateCommon("cancel")
                                        },
                                    },
                                    onContentReady: function () {
                                        this.$content.find('#subject').val(translateInfo("user-setting.edit-user.password-setting.email-subject-content"));
                                        this.$content.find('#emailAddress').val(userConfig.mailAddress);
                                        let mailContent = translateInfo(
                                            "user-setting.edit-user.password-setting.email-body-content",
                                            {chobiitFQDN: getChobiitFQDN(), loginName, password}
                                        );
                                        this.$content.find('#content').val(mailContent);

                                        $('.send-mail').click(async function(){
                                            console.log('starting save user and send mail...')
                                            try{

                                                $(this).html(loadingBtn);
                                                $(this).prop('disabled', true);

                                                let tempData = Object.assign({}, userConfig);
                                                tempData['password'] =  CryptoJS.SHA512(password).toString();
                                                tempData['apps'] =  Array.isArray(userConfig.apps) ? userConfig.apps : JSON.parse(userConfig.apps);

                                                await updateUser(tempData);
                                                var email = $('#emailAddress').val();
                                                var subject = $('#subject').val();
                                                var content = $('#content').val();
                                                sendMail(email, subject, content);

                                                $(this).html(`<i class="fas fa-spinner fa-spin"></i> ${translateCommon("send")}..`)
                                                jsMail.close();
                                                $.alert({
                                                    title: translateCommon("success-title"),
                                                    icon: 'fas fa-check',
                                                    content: translateInfo("user-setting.edit-user.password-setting.send-email-success-message"),
                                                    type: 'green',
                                                    animateFromElement: false,
                                                });
                                                console.log('create user and send mail done');
                                            }catch (err){
                                                console.error(err);
                                                storeErr(err, 'create chobiit user');
                                                $.alert({
                                                    title: translateCommon("input-error-title"),
                                                    icon: 'fas fa-exclamation-triangle',
                                                    content: translateError("enter-chobiit-user-display-name"),
                                                    type: 'red',
                                                    animateFromElement: false,
                                                });
                                                jsMail.close();
                                            }
                                        })
                                    }
                                });
                           })
                        }
                    });
                })
                //submit handle
                $('.edit-user-btn').on('click',async function(){
                    try {
                        let allSubmitData = await getSubmitUserData('edit');
                        if(allSubmitData){
                            console.log('staring update user..');
                            console.log('---all user submit data---');
                            console.log(allSubmitData);

                            $(this).html(saveLoadingBtn);
                            await updateUser(allSubmitData);

                            for (var key in allSubmitData){
                                userConfig[key] = allSubmitData[key];
                            }
                            userTable
                            .row( tableRow )
                            .data([
                                checkboxDeleteUser + editRecordBtn + deleteRecordBtn,
                                `<div class="count">${getCountByUser(countConfig, allSubmitData.loginName)}</div>`,
                                allSubmitData.loginName,
                                allSubmitData.name,
                                allSubmitData.mailAddress,
                                allSubmitData.kintoneLoginName,
                                allSubmitData.apps,
                                allSubmitData.isAdmin
                            ])
                            .draw(false);

                            jcEditUser.close();
                            console.log('update user info done')
                        }
                    }catch(err){
                        jcEditUser.close();
                        console.error(err);
                        storeErr(err, 'edit user');
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("cannot-configure-chobiit-user"),
                            type: 'red',
                            animateFromElement: false,
                        });
                    }
                })
            }
        });
    })

     //delete user
    $('#user-table').on('click','.delete-record',function(){
        let $deleteIcon = $(this);
        $.confirm({
            animateFromElement: false,

            title: translateCommon("confirmation-title"),
            content: translateCommon("confirmation-message"),
            buttons: {
                somethingElse: {
                    text: translateCommon("delete"),
                    btnClass: 'btn-red',
                    action: function(){
                        console.log('starting delete user...');
                        let tableRow = userTable.row($deleteIcon.closest('tr'));
                        let rowValue =  userTable.row(tableRow).data();
                        let loginName = rowValue[2];

                        if (allConfigDataGroups.some(group => group.users.includes(loginName))){
                            $.alert({
                                title: translateCommon("input-error-title"),
                                icon: 'fas fa-exclamation-triangle',
                                content: translateError("cannot-delete-this-user-because-it-belongs-to-a-group"),
                                type: 'red',
                                animateFromElement: false,
                            });
                            return;
                        }

                        let URL =  configApi.deleteUser;
                        const data = {
                            domain : domain,
                            loginName : loginName
                        }
                        $.ajax({
                            type: 'DELETE',
                            url: URL,
                            headers: { 'X-Api-Key': apiKey },
                            dataType: 'json',
                            contentType: 'application/json',
                            data: JSON.stringify(data),
                            success: function () {
                                console.log('delete user success');
                                userTable.row(tableRow).remove().draw(false);
                                for(let i = 0; i < allConfigData.data.users.length; i ++){
                                    let userConfig = allConfigData.data.users[i];
                                    if (userConfig.loginName == loginName
                                        ){
                                        allConfigData.data.users.splice(i, 1);
                                    }
                                }
                            },
                            error: function () {
                                console.err('delete user fail')
                            }
                        });
                    }
                },
                cancel: {
                    text: translateCommon("cancel"),
                    action: function(){

                    }
                }
            }
        });
    })
    //delete users
    $("#users-delete").click(function () {
        const countUsersIsChecked =  $(".checked-user:checked", userTable.rows().nodes()).length;
        if (countUsersIsChecked > 0) {
            const popupDeleteUsers = $.confirm({
                animateFromElement: false,
                columnClass: "col-md-8",
                title: translateInfo("user-setting.bulk-delete.modal-title"),
                content: translateInfo("user-setting.bulk-delete.modal-message", {usersCount: countUsersIsChecked}),
                buttons: {
                    formSubmit: {
                        text: translateCommon("yes"),
                        btnClass: "btn-info delete-user-btn",
                        action: async function() {
                            popupDeleteUsers.close();
                            const apiDeleteUsers =  configApi.deleteUsers;
                            const loadingDeleteUsers = $.dialog({
                                icon: "fa fa-spinner fa-spin",
                                title: "",
                                content: translateInfo("user-setting.bulk-delete.delete-progress-message"),
                                boxWidth: "30%",
                                useBootstrap: false,
                                theme: "supervan",
                                closeIcon: false,
                                lazyOpen: true,
                            });
                            try {
                                loadingDeleteUsers.open();
                                const dataUsersIsChecked = $(userTable.$('input[type="checkbox"]:checked').map(function () {
                                    const tableUserRow = userTable.row( $(this).closest(" tr ") );
                                    const loginName = userTable.row( tableUserRow ).data()[2];
                                    return {
                                        element: $(this),
                                        loginName: loginName,
                                    }
                                }))

                                let respDeleteUsers;

                                if (dataUsersIsChecked.length > 0) {

                                    const userLogin = {
                                        domain : domain,
                                        data : dataUsersIsChecked.map((index, item) => item?.loginName || [])
                                    }

                                    respDeleteUsers = await deleteRecords(dataUsersIsChecked, apiDeleteUsers, apiKey, userLogin, userTable)

                                }

                                loadingDeleteUsers.close();

                                if (respDeleteUsers?.statusCode === 200) {
                                    return swal(
                                        translateCommon("success-title"),
                                        translateInfo("user-setting.bulk-delete.delete-success-message"),
                                        "success"
                                    );
                                }

                                return swal(
                                    translateCommon("error-title"),
                                    translateInfo("user-setting.bulk-delete.delete-failure-message"),
                                    "error"
                                );

                            } catch(err) {
                                popupDeleteUsers.close()
                                return swal(
                                    translateCommon("error-title"),
                                    translateInfo("user-setting.bulk-delete.delete-failure-message"),
                                    "error"
                                );
                            }
                        }
                    },
                    cancel: {
                        text: translateCommon("no"),
                        action: function () {
                        }
                    },
                },
            });
        } else {
            return swal(
                translateCommon("warning-title"),
                translateError("select-users-you-want-to-delete"),
                "warning"
            );
        }
    })
    // the select-option event change
    $(document).on('change', '.field_cond_field_0', function (e) {
        let typeField = $(this).find('option:selected').attr("data-type");
        let $fieldCondFunc = $(this).parent().parent().find('.field-cond-func');
        let fieldCondChecked = false;
        if (typeField === "LABEL"){
            fieldCondChecked = true;
        }
        $fieldCondFunc.find('input[name="field-cond-view"]').prop('checked',fieldCondChecked);
        $fieldCondFunc.find('input[name="field-cond-view"]').prop('disabled',fieldCondChecked);
        $fieldCondFunc.find('input[name="field-cond-edit"]').prop('checked',fieldCondChecked);
        $fieldCondFunc.find('input[name="field-cond-edit"]').prop('disabled',fieldCondChecked);
    })
    //select all users
    $("#user-table").on("click", "#select-all-users", function () {
        const rows = userTable.rows({ "search": "applied" }).nodes();
        $('input[type="checkbox"]', rows).prop("checked", this.checked);
    })
    //function--------------------------------------------------------------------------------------
    /**
     * @function delete users
     *
     * @param tableRows
     * @param url
     * @param apiKey
     * @param data
     * @param table
     * @returns {*}
     */
    function deleteRecords(tableRows, url, apiKey, data, table) {
        return $.ajax({
            type: "DELETE",
            url: url,
            headers: { "X-Api-Key": apiKey },
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                for (let index=0; index<tableRows.length; index++) {
                    const element = tableRows[index].element;
                    const tableRow = table.row( element.closest(" tr ") );
                    table.row( tableRow ).remove().draw(false);
                }
            },
            error: function (error) {
                console.log("error delete users :", error);
                return swal("Error!", "Deletion failed.", "error");
            }
        });
    }
    /**
     * `{SUB_DOMAIN}.chobiit.me` or `{SUB_DOMAIN}.chobiit.us`
     * @returns 
     */
    function getChobiitFQDN() {
        const subDomain = window.location.host.split('.')[0];
        return `${subDomain}.${process.env.CHOBIIT_DOMAIN_NAME}`;
    }
    function getChobiitLoginUrl(){
		let origin = window.location.origin;
		let index =  origin.indexOf('.');
        let login_url =  origin.substr(0,index) + '.' + process.env.CHOBIIT_DOMAIN_NAME;
        return login_url
    }
    function getAddRecordUrl(app){
        let url = '';
        if((app.auth == false || app.auth === 1) && app.funcCond0 && app.funcCond0.includes('add')){
            url = `<a target="_blank" href="${login_url}/public/p_add_record.html?appId=${app.app}">${login_url}/public/p_add_record.html?appId=${app.app}</a>`;
        }
        return url;
    }
    function getListRecordUrl(app){
        let url = '';
        if((app.auth == false || app.auth === 1) && app.funcCond0 && app.funcCond0.includes('view')){
            url = `<a target="_blank" href="${login_url}/public/p_list_record.html?appId=${app.app}">${login_url}/public/p_list_record.html?appId=${app.app}</a>`;
        }
        return url;
    }
    function getCountByApp(countConfig, appId){
        if(countConfig){
            let find = countConfig.byApp.find(x => x.appId == appId);
            if(find){
                return find.total;
            }
        }
        return 0;
    }
    function getCountByUser(countConfig, loginName){
        if(countConfig && countConfig.byUser){
            let find = countConfig.byUser.find(x => x.loginName == loginName);
            if(find){
                return find.total;
            }
        }
        return 0;
    }

    async function makeProcessOption(appValue){
        $('.pro_state_value_1').html('<option value=""></option');
        let processInfo = await kintone.api(kintone.api.url("/k/v1/app/status", true), "GET", {'app': appValue});
        if (processInfo.states){
            let stateArr = Object.keys(processInfo.states)
            for (let i = 0; i < stateArr.length; i++){
                let state = stateArr[i];
                let option = `<option value="${state}">${state}</option>`;
                $('.pro_state_value_1').append(option);
            }
        }
    }

    async function makeChobiitFieldEditApp(appValue){
        return await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
    }

    async function makeChobiitFieldOption(appValue, dataFields=null){
        $('#creator, #create_time, #editor, #edit_time').html('<option value=""></option');
        let appFieldsRes = dataFields;
        if (!appFieldsRes){
            appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
        }
        let appFieldsValues = Object.values(appFieldsRes.properties);
        for (let i = 0; i < appFieldsValues.length; i ++){
            let field = appFieldsValues[i];
            if (field.type == 'SINGLE_LINE_TEXT' && !field.hasOwnProperty('lookup')){
                let option = `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                $('#creator, #editor').append(option);
            }


            if (field.type == 'DATETIME'){
                let option = `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                $('#create_time, #edit_time').append(option);
            }
        }
    }

    async function makeGroupFieldOption(appValue, dataFields=null){
        $('#group-view').html('<option value=""></option');
        let appFieldsRes = dataFields;
        if (!appFieldsRes){
            appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
        }
        let appFieldsValues = Object.values(appFieldsRes.properties);
        for (let i = 0; i < appFieldsValues.length; i ++){
            let field = appFieldsValues[i];


            if (field.type == 'MULTI_LINE_TEXT'){
                let option = `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                $('#group-view').append(option);
            }
        }
    }


    async function makeFieldCondOption(appValue, dataFields=null){
        $('.field_cond_field_0').html('<option value=""></option');
        let appFieldsRes = dataFields;
        if (!appFieldsRes){
            appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
        }
        let infoLayout = await kintone.api(kintone.api.url('/k/v1/app/form/layout', true), 'GET', {'app': appValue});
        let appFieldsValues = Object.values(appFieldsRes.properties);
        for (let i = 0; i < appFieldsValues.length; i ++){
            let field = appFieldsValues[i];
            if (FIELDLIST.includes(field.type)){
                // if (field.type == 'SINGLE_LINE_TEXT' && field.expression) continue;
                let option = `<option data-type="${field.type}" value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                $('.field_cond_field_0').append(option);
            }
        }
        for (let i = 0; i < infoLayout.layout.length; i++) {
            if (infoLayout.layout[i].type == 'GROUP') {
                let infoLayoutGroup = infoLayout.layout[i].layout
                for (let j = 0; j < infoLayoutGroup.length; j++) {
                    let fields = infoLayoutGroup[j].fields;
                    for (let k = 0; k < fields.length; k++) {
                        if (fields[k].type === "LABEL") {
                            let label = fields[k].label;
                            label = label.replace(/<\s*[^>]*>/gi, '');
                            let option = `<option data-type="${fields[k].type}" value="${label.replace(' ', '')}">${showSepicalTextInHtml(label)}</option>`;
                            $('.field_cond_field_0').append(option);
                        }
                    }
                }
            } else {
                let fields = infoLayout.layout[i].fields;
                for (let j = 0; j < fields.length; j++) {
                    if (fields[j].type === "LABEL") {
                        let label = fields[j].label;
                        label = label.replace(/<\s*[^>]*>/gi, '');
                        let option = `<option data-type="${fields[j].type}" value="${label.replace(' ', '')}">${showSepicalTextInHtml(label)}</option>`;
                        $('.field_cond_field_0').append(option);
                    }
                }
            }
        }
    }

    async function makePublicLookupSetting(appValue, dataFields=null){
        $('#puclic-lookup-setting').find('tbody').empty();
        let appFieldsRes = dataFields;
        if (!appFieldsRes){
            appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
        }
        let fields = appFieldsRes.properties;

        let lookupFields = [];
        for (let key in fields){
            if (fields[key].type =='SUBTABLE'){
                let tFields = fields[key].fields;
                for (let key3 in tFields){
                    if (tFields[key3].hasOwnProperty('lookup') && tFields[key3].lookup != null){
                        lookupFields.push(tFields[key3]);
                    }
                }
            }
            else if (fields[key].hasOwnProperty('lookup') && fields[key].lookup != null){
                lookupFields.push(fields[key]);
            }
        }


        lookupFields.forEach(item =>{
            let fieldName = item.label;
            let relateAppId = item.lookup.relatedApp.app;
            let relateAppInfo = appList.find(x => x.appId == relateAppId);
            let relateAppName = relateAppInfo ? relateAppInfo.name : '';
            let tr = `
            <tr>
                <td>
                    <p>${fieldName}</p>
                </td>
                <td>
                    <p app-name="${relateAppName}" app-id="${relateAppId}">${relateAppName} (${relateAppId})</p>
                </td>
                <td>
                    <input type="text" lookup-fieldcode="${item.code}" class="form-control p-lookup-apiToken" placeholder="" style="width: 300px;">
                </td>
            </tr>`
            $('#puclic-lookup-setting').find('tbody').append(tr);
        })
    }

    async function makeLocationOption(appValue, dataFields=null){
        $('#latitude_1, #longitude_1').html('<option value=""></option');
        let appFieldsRes = dataFields;
        if (!appFieldsRes){
            appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
        }
        let appFieldsValues = Object.values(appFieldsRes.properties);
        for (let i = 0; i < appFieldsValues.length; i ++){
            let field = appFieldsValues[i];
            if (['SINGLE_LINE_TEXT','MULTI_LINE_TEXT','NUMBER'].includes(field.type) && !field.hasOwnProperty('lookup')){
                let option = `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                $('#latitude_1, #longitude_1').append(option);
            }
        }
    }

    async function makeAutoSendMailOption(appValue, dataFields=null){
        $('#auto-email').html('<option value=""></option');
        $('#insert-fieldcode').html(` <li class="list-group-item " style=" background: grey;color: white;font-size: .9rem;">${translateInfo("app-setting.other-setting.use-fields-in-mail-content")}</li>
        <li class="list-group-item">
            <i class="fas fa-copy copy-fieldcode"></i>
            <span class="copy-tooltip">${translateInfo("app-setting.other-setting.copy-completion-message")}</span>
            <span class="chobiit-fieldcode">{$id}</span>  (${translateInfo("app-setting.other-setting.record-number-field-code")})
        </li>`);
        let appFieldsRes = dataFields;
        if (!appFieldsRes){
            appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
        }
        let appFieldsValues = Object.values(appFieldsRes.properties);
        for (let i = 0; i < appFieldsValues.length; i ++){
            let field = appFieldsValues[i];
            if (['SINGLE_LINE_TEXT', 'DROP_DOWN', 'RADIO_BUTTON'].includes(field.type) || (field.type == 'LINK' && field.protocol == "MAIL")){
                let option = `<option value="${field.code}">${field.label} (${field.code})</option>`;
                $('#auto-email').append(option);
            }

            if (['SINGLE_LINE_TEXT','NUMBER', 'MULTI_LINE_TEXT', 'CHECK_BOX', 'MULTI_SELECT', 'LINK', 'DATE', 'TIME', 'DATETIME', 'DROP_DOWN', 'RADIO_BUTTON'].includes(field.type)){
                let li = `<li class="list-group-item">
                        <i class="fas fa-copy copy-fieldcode"></i>
                        <span class="copy-tooltip">${translateInfo("app-setting.other-setting.copy-completion-message")}</span>
                        <span class="chobiit-fieldcode">{${field.code}}</span>  (${showSepicalTextInHtml(field.label)})
                    </li>`;
                $('#insert-fieldcode').append(li);
            }
        }

        $('.copy-fieldcode').click(function(){
            let $copyBtn = $(this);
            let text = $copyBtn.siblings('.chobiit-fieldcode').text();
            copyTextToClipboard(text)

            $copyBtn.siblings('.copy-tooltip').fadeIn('slow');
            setTimeout(function(){	 $copyBtn.siblings('.copy-tooltip').fadeOut() }, 2000);
        })

    }



    async function makeActionCopyFromOption(appValue, dataFields=null){
        $('.action_copy_from, .action_copy_to').html('<option value=""></option');
        let appFieldsRes = dataFields;
        if (!appFieldsRes){
            appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
        }
        let appFieldsValues = Object.values(appFieldsRes.properties);
        for (let i = 0; i < appFieldsValues.length; i ++){
            let field = appFieldsValues[i];
            if (COPY_FROM_TYPE.includes(field.type)){
                let option = `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                $('.action_copy_from').append(option);
            }
        }
    }


    async function makeLookupFieldOption(appValue, dataFields=null){
        $('.lk-complete-match-field').html('<option value=""></option');
        let appFieldsRes = dataFields;
        if (!appFieldsRes){
            appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
        }
        let appFieldsValues = Object.values(appFieldsRes.properties);
        for (let i = 0; i < appFieldsValues.length; i ++){
            let field = appFieldsValues[i];
            if (field.hasOwnProperty('lookup')){
                let option = `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                $('.lk-complete-match-field').append(option);
            }
        }
    }


    async function makeSyncKeyOption(appValue, $dom, dataFields=null){
        $dom.html('<option value=""></option');
        let appFieldsRes = dataFields;
        if (!appFieldsRes){
            appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
        }
        let appFieldsValues = Object.values(appFieldsRes.properties);
        for (let i = 0; i < appFieldsValues.length; i ++){
            let field = appFieldsValues[i];
            if (([ 'SINGLE_LINE_TEXT','NUMBER'].includes(field.type) && field.unique === true) || (field.type == 'RECORD_NUMBER')){
                let option = `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                $dom.append(option);
            }
        }

    }

    async function makeUpdateToFieldOption(appId, dataFields=null){
        $('.wsync-to-field').html(`<option value=""></option>`)

        let appFieldsRes = dataFields;
        if (!appFieldsRes){
            appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appId});
        }
        let appFieldsValues = Object.values(appFieldsRes.properties);

        for (let i = 0; i < appFieldsValues.length; i ++){
            let field = appFieldsValues[i];
            if (update_to_field_type.indexOf(field.type) != -1 && !field.hasOwnProperty('lookup')){
                let option = `<option  value="${field.code}">${showSepicalTextInHtml(showSepicalTextInHtml(field.label))} (${field.code})</option>`;
                $('.wsync-to-field').append(option)
            }
        }
    }

    async function makeUpdateFromFieldOptionByApp(actionApp, opt) {
        const {change_this, tr_index} = opt;
        if(change_this) {
            $(change_this).closest(".action-td").find('.wsync-from-field').html('<option value=""></option>');
        }

        if(tr_index != null) {
            $(".action-tr").eq(tr_index).find('.wsync-from-field').html('<option value=""></option>');
        }
        let appValue = $('#app').val();
        if (appValue){
            let action_copy_from_fields  = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app' : appValue});
            let action_to_app_fields = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app' : actionApp});
            let action_to_app_fields_value = Object.values(action_to_app_fields.properties);

            if(change_this) {
                $(change_this).closest(".action-td").find('.wsync-from-field').each(function(i){
                    let copy_from_field_value = $('.wsync-to-field').eq(i).val();
                    if (copy_from_field_value){
                        let copy_from_field_type = action_copy_from_fields.properties[copy_from_field_value].type;
                        // let copy_to_field = action_to_app_fields_value.filter(x => x.type == copy_from_field_type);
                        let copy_to_field = action_to_app_fields_value.filter(x => update_from_field_type[copy_from_field_type].includes(x.type));

                        let action_copy_to_option = ''
                        for (let i = 0; i < copy_to_field.length; i ++){
                            let field = copy_to_field[i];
                            action_copy_to_option = action_copy_to_option + `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                        }
                        $(this).append(action_copy_to_option);
                    }
                })
            }

            if(tr_index != null) {
                $(".action-tr").eq(tr_index).find('.wsync-from-field').each(function(i){
                    let copy_from_field_value = $(this).closest("tr").find('.wsync-to-field').val()
                    if (copy_from_field_value){
                        let copy_from_field_type = action_copy_from_fields.properties[copy_from_field_value].type;
                        // let copy_to_field = action_to_app_fields_value.filter(x => x.type == copy_from_field_type);
                        let copy_to_field = action_to_app_fields_value.filter(x => update_from_field_type[copy_from_field_type].includes(x.type));

                        let action_copy_to_option = ''
                        for (let i = 0; i < copy_to_field.length; i ++){
                            let field = copy_to_field[i];
                            action_copy_to_option = action_copy_to_option + `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                        }
                        $(this).append(action_copy_to_option);
                    }
                })
            }
        }
    }

    async function makeUpdateFromFieldOptionByField(toField){
        let appValue = $('#app').val();
        let actionApp = $(toField).closest(".action-tr").find('.action_to_app').val();
        if (appValue && actionApp){
            let $fromField = $(toField).parent().next().find('select');
            $fromField .html('<option value=""></option')
            let action_copy_from_fields  = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app' : appValue});
            let action_to_app_fields = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app' : actionApp});
            let action_to_app_fields_value = Object.values(action_to_app_fields.properties);
            let copy_from_field_value = $(toField).val();
            let copy_from_field_type = action_copy_from_fields.properties[copy_from_field_value].type;
            // let copy_to_field = action_to_app_fields_value.filter(x => x.type == copy_from_field_type);
            let copy_to_field = action_to_app_fields_value.filter(x => update_from_field_type[copy_from_field_type].includes(x.type));

            for (let i = 0; i < copy_to_field.length; i ++){
                let field = copy_to_field[i];
                let option = `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                $fromField .append(option);
            }
        }
    }




    function makeActionToAppOption(){
        allConfigData.data.apps.forEach(app =>{
            let option = `<option value="${app.app}">${app.appName} (${app.app})</option>`;
            $('.action_to_app').append(option);
        })
    }

    function makeUserAuthAppsOption(){
        if (allConfigData.data &&  allConfigData.data.apps){
            allConfigData.data.apps.forEach(app =>{
                if (app.auth){
                    let option = `<option value="${app.app}">${app.appName} (${app.app})</option>`;
                    $('.user-auth-app').append(option);
                }
            })
        }
    }



    function makeUserAuthKintoneOption(){
        if (allConfigData.data &&  allConfigData.data.kintoneUsers){
            allConfigData.data.kintoneUsers.forEach(user =>{

                let option = `<option value="${user.kintoneLoginName}">${user.kintoneLoginName}</option>`;
                $('.user-auth-kintone').append(option);

            })
        }
    }




    async function makeActionCopyToOptionByAction(actionApp, change_this){
        if(change_this) {
            $(change_this).closest(".action-td").find('.action_copy_to').html('<option value=""></option>');
        } else {
            $('.action_copy_to').html('<option value=""></option>');
        }

        let appValue = $('#app').val();
        if (appValue){
            let action_copy_from_fields  = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app' : appValue});
            let action_to_app_fields = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app' : actionApp});
            let action_to_app_fields_value = Object.values(action_to_app_fields.properties);
            if(change_this){
                $(change_this).closest(".action-td").find('.action_copy_to').each(function(i){
                    let copy_from_field_value = $('.action_copy_from').eq(i).val();
                    if (copy_from_field_value){
                        let copy_from_field_type = action_copy_from_fields.properties[copy_from_field_value].type;
                        // let copy_to_field = action_to_app_fields_value.filter(x => x.type == copy_from_field_type);
                        let copy_to_field = action_to_app_fields_value.filter(x => COPY_TO_TYPE[copy_from_field_type].includes(x.type));

                        let action_copy_to_option = ''
                        for (let i = 0; i < copy_to_field.length; i ++){
                            let field = copy_to_field[i];
                            action_copy_to_option = action_copy_to_option + `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                        }
                        $(this).append(action_copy_to_option);
                    }
                })
            } else {
                $('.action_copy_to').each(function(i){
                    let copy_from_field_value = $('.action_copy_from').eq(i).val();
                    if (copy_from_field_value){
                        let copy_from_field_type = action_copy_from_fields.properties[copy_from_field_value].type;
                        // let copy_to_field = action_to_app_fields_value.filter(x => x.type == copy_from_field_type);
                        let copy_to_field = action_to_app_fields_value.filter(x => COPY_TO_TYPE[copy_from_field_type].includes(x.type));

                        let action_copy_to_option = ''
                        for (let i = 0; i < copy_to_field.length; i ++){
                            let field = copy_to_field[i];
                            action_copy_to_option = action_copy_to_option + `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                        }
                        $(this).append(action_copy_to_option);
                    }
                })
            }
        }
    }

    //copyField = from(this)
    async function makeActionCopyToOptionByCopy(copyField){
        let appValue = $('#app').val();
        //let actionApp = $('#action_to_app').val();
        let actionApp = $(copyField).closest(".action-td").find('.action_to_app').val();
        if (appValue && actionApp){
            let $toField = $(copyField).parent().next().find('select');
            $toField.html('<option value=""></option')
            let action_copy_from_fields  = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app' : appValue});
            let action_to_app_fields = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app' : actionApp});
            let action_to_app_fields_value = Object.values(action_to_app_fields.properties);
            let copy_from_field_value = $(copyField).val();
            let copy_from_field_type = action_copy_from_fields.properties[copy_from_field_value].type;
            // let copy_to_field = action_to_app_fields_value.filter(x => x.type == copy_from_field_type);
            let copy_to_field = action_to_app_fields_value.filter(x => COPY_TO_TYPE[copy_from_field_type].includes(x.type));

            for (let i = 0; i < copy_to_field.length; i ++){
                let field = copy_to_field[i];
                let option = `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
                $($toField).append(option);
            }
        }
    }

    async function getSubmitAppData(eventType, fileSpace){
        let app = $('#app').val();

        if (!app){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("select-linked-app"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }


        let appConfig = allConfigData.data.apps.find(x => x.app == app);

        if (allConfigData.data.apps.map(x => x.app).includes(app) && eventType == 'add'){
            $.alert({
                title: translateCommon("input-duplication-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("this-app-is-already-set"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }
        let body = {
            'app' : app
        }



        let listkintoneAPi = await Promise.all([
            kintone.api(kintone.api.url('/k/v1/app/acl', true), 'GET', body),
            kintone.api(kintone.api.url('/k/v1/record/acl', true), 'GET', body),
            kintone.api(kintone.api.url('/k/v1/field/acl', true), 'GET', body),
            kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', body),
            kintone.api(kintone.api.url('/k/v1/app/form/layout', true), 'GET', body),
            kintone.api(kintone.api.url('/k/v1/app', true), 'GET', {id : app}),
            kintone.api(kintone.api.url('/k/v1/app/views', true), 'GET', body),
            kintone.api(kintone.api.url('/k/v1/app/status', true), 'GET', body),
        ]);

        let appRights = listkintoneAPi[0].rights;
        let recordRights = listkintoneAPi[1].rights;
        let fieldRights = listkintoneAPi[2].rights;
        let fields = listkintoneAPi[3].properties;
        let formLayout = listkintoneAPi[4].layout;
        let appName = listkintoneAPi[5].name;
        let appCreatorCode = listkintoneAPi[5].creator.code;
        let appViews = Object.values(listkintoneAPi[6].views)
        const statusInfo = listkintoneAPi[7].enable ? Object.values(listkintoneAPi[7].states) : false

        let relateFieldsInfo = false;
        let relateFields = Object.values(fields).filter(x => x.type == 'REFERENCE_TABLE');
        if (relateFields.length){
            relateFieldsInfo = {};
            for (let j = 0; j < relateFields.length; j++){
                if(relateFields[j].referenceTable){
                    let relateApiToken = false;
                    let relateAppId = relateFields[j].referenceTable.relatedApp.app;
                    let displayFields = relateFields[j].referenceTable.displayFields;
                    let relateFieldRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app : relateAppId});
                    let displayFieldsInfo = displayFields.map(field => ({code : relateFieldRes.properties[field].code, label : relateFieldRes.properties[field].label}))

                    let realateAppSettings= allConfigData.data.apps;
                    if (realateAppSettings.length){
                        let realateAppSetting = realateAppSettings.find(x => x.app == relateAppId);
                        if(realateAppSetting && (realateAppSetting.auth == false || realateAppSetting.auth ===  1)){
                            relateApiToken = realateAppSetting.apiToken0;
                        }
                    }

                    let obj = {
                        [relateFields[j].code] : {
                            displayFieldsInfo : displayFieldsInfo,
                            relateApiToken : relateApiToken
                        }
                    }
                    Object.assign(relateFieldsInfo, obj)
                }
            }
        }

        //get lookup field;
        let lookupRelateInfo = false;
        let lookupFields = [];
        for (let key in fields){
            if (fields[key].type =='SUBTABLE'){
                let tFields = fields[key].fields;
                for (let key3 in tFields){
                    if (tFields[key3].hasOwnProperty('lookup') && tFields[key3].lookup != null){
                        lookupFields.push(tFields[key3]);
                    }
                }
            }
            else if (fields[key].hasOwnProperty('lookup') && fields[key].lookup != null){
                lookupFields.push(fields[key]);
            }
        }
        //let listLookupKeyFail = [];
        let checkLookupKey = true;

        let userAuth =  $('input[name="user_authen"]:checked').val();

        if (userAuth == '外部公開' || userAuth == '両方'){
            let listPublicApiToken = $('.p-lookup-apiToken').toArray();
            for (let i = 0 ; i < listPublicApiToken.length; i++){
                let publicApiToken = $(listPublicApiToken[i]).val();
                let publicAppName = $(listPublicApiToken[i]).closest('td').prev().find('p').attr('app-name')
                let publicAppId =  $(listPublicApiToken[i]).closest('td').prev().find('p').attr('app-id');

                if (!publicApiToken){
                    $.alert({
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("enter-api-token-of-an-app", {appName: publicAppName}),
                        type: 'red',
                        animateFromElement: false,
                    });
                    return false;
                }


                let checkResp = await checkApiToken(publicApiToken, publicAppId);

                if (!checkResp){
                    $.alert({
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("this-api-token-is-invalid", {appName: publicAppName}),
                        type: 'red',
                        animateFromElement: false,
                    });
                    return false;
                }
            }
        }

        // if ((userAuth == '認証あり' || userAuth == '両方') && lookupFields.length){ // check lookup setting
        if (lookupFields.length){ // check lookup setting
            for (let i = 0; i < lookupFields.length; i ++ ){
                let relateAppId = lookupFields[i].lookup.relatedApp.app;
                let relatedKeyField = lookupFields[i].lookup.relatedKeyField;
                let relateFieldsResp = await   kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app : relateAppId});
                let relateFields = relateFieldsResp.properties;
                if (relateFields[relatedKeyField].type != 'RECORD_NUMBER' && !relateFields[relatedKeyField].unique){
                    checkLookupKey = false;
                    //listLookupKeyFail.push(lookupFields[i].code);
                    break;
                }
            }

        }
        //lookupFields = lookupFields.filter(x => listLookupKeyFail.indexOf(x.code) == -1);
        if (lookupFields.length){
            let promises = lookupFields.map(async field => {
                let fieldCode = field.code;
                let relateAppId = field.lookup.relatedApp.app;
                let relateAppApiToken = false;
                if (userAuth == '外部公開' || userAuth == '両方'){
                    relateAppApiToken = $(`input[lookup-fieldcode="${fieldCode}"]`).val();
                }
                let relateAppResp = await  kintone.api(kintone.api.url('/k/v1/app', true), 'GET', {id : relateAppId});
                let relateAppName = relateAppResp.name;
                let relateFieldsResp = await   kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app : relateAppId});
                let  rlFieldInfo = {};
                for (let key in relateFieldsResp.properties){
                    let rlField = relateFieldsResp.properties[key];
                    if (field.lookup.lookupPickerFields.includes(rlField.code) || field.lookup.relatedKeyField == rlField.code){
                        let obj = {
                            [rlField.code] : rlField.label
                        };
                        Object.assign(rlFieldInfo, obj)
                    }
                }
                return {
                    fieldCode : fieldCode,
                    relateAppName : escapeOutput(relateAppName),
                    relateAppApiToken : relateAppApiToken,
                    fieldMappings: field.lookup.fieldMappings,
                    rlFieldInfo : rlFieldInfo
                }
            })
            lookupRelateInfo = await Promise.all(promises);
        }

        let appLinkTo = false;
        let thanksPage = false;
        let funcCond0 = false;
        let recordCond0 = false;
        let fieldCond0 = false;
        let apiToken0 = false;
        let processCond1 = false;
        let creator = false;
        let editor = false;
        let locateCond = false;
        let calendarView = false;
        let notif = false;
        let timeCond = false;
        let actionCondList = [];
        let webhookSync = false;
        let ownerView = false;
        let groupView = false;
        let showText = false;
        let showComment = false;
        let robotoCheck = false;
        let jsCustom = [];
        let cssCustom = [];
        let autoSendMail = false;
        let responseControl = false;
        let tempSaving = false;
        let lkCompleteMatch = false;
        let trustedSites = [];

        let auth;
        if (userAuth == '認証あり') auth = true;
        if (userAuth == '外部公開') auth = false;
        if (userAuth == '両方') auth = 1;

        if(auth){
            if( $('#owner_view').is(':checked')){
                ownerView = true;
            }

            if ($('#group-view-cond').is(':checked')){
                groupView = $('#group-view').val();




                if (!groupView){
                    $.alert({
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("chobiit-group-is-required"),
                        type: 'red',
                        animateFromElement: false,
                    });
                    return false;
                }
            }

            if ($('#show-comment').is(':checked')){
                showComment = true;
            }

            if ($('#app-linkto-cond').is(':checked')){
                appLinkTo = $('#app-linkto').val();
                if (!appLinkTo){
                    $.alert({
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("select-linked-app"),
                        type: 'red',
                        animateFromElement: false,
                    });
                    return false;
                }
            }

              //一覧画面へのリンク名 & レコード追加画面へのリンク名
            let showTextList = escapeOutput($('#list_screen').val())
            let showTextAdd = escapeOutput($('#add_screen').val())
            if (!showTextList){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("enter-link-name-of-list-records-page"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
            if (showTextList.length > 128){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("link-name-of-list-records-page-has-limit"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
            if (!showTextAdd){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("enter-link-name-of-add-record-page"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }

            if (showTextAdd.length > 128){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("link-name-of-add-record-page-has-limit"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }

            showText = {
                list : showTextList,
                add  :showTextAdd
            }
            //メール通知設定
            notif = [];
            $('.event_notif').each(function(index){
                let event = $(this).val();
                let text = $('.text_notif').eq(index).val();
                if(event && text){
                    notif.push({event: event, text: text});
                }
            })
            if(notif.length){
                let event_duplicates = checkDuplicate(notif.map(x => x.event));
                if (event_duplicates){
                 $.alert({
                     title: translateCommon("input-duplication-error-title"),
                     icon: 'fas fa-exclamation-triangle',
                     content: translateError("duplicated-email-notification-conditions", {duplicatedEvents: event_duplicates}),
                     type: 'red',
                     animateFromElement: false,
                 });
                 return false;
                }
            }
            //プロセス管理を利用してメール通知
            if($('#pro_cond_1').is(':checked')){
                processCond1 = [];
                $('.pro_state_value_1').each(function(index){
                    let state  = $(this).val();
                    let annocument =  $('.pro_alert_content_1').eq(index).val();
                    if (state && annocument){
                        processCond1.push({state: state, annocument : annocument});
                    }
                });
                if (!processCond1.length){
                    $.alert({
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("select-status-of-process-management"),
                        type: 'red',
                        animateFromElement: false,
                    });
                    return false;
                }
                let duplicate = checkDuplicate(processCond1.map(x => x.state));
                if(duplicate){
                    $.alert({
                        title: translateCommon("input-duplication-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("duplicated-process-management-statuses", {duplicatedStatus: duplicate}),
                        type: 'red',
                        animateFromElement: false,
                    });
                    return false;
                }

            }
            //レコード作成者
            creator = $('#creator').val();
            if (!creator){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("record-creator-field-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
            //レコード更新者
            editor = $('#editor').val();
            if (!editor){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("record-editor-field-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }

            //Chobiit作成日時 &Chobiit更新日時
            let createTime = $('#create_time').val();
            let editTime = $('#edit_time').val();
            if (!createTime){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("record-creation-datetime-field-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
            if(!editTime){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("record-edition-datetime-field-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
            timeCond = {createTime : createTime,editTime : editTime}
        }

        if(auth == false || auth === 1){

            if ($('#roboto_check').is(':checked')) {
                robotoCheck = true;
            }

            //連携アプリのAPI トーク
            apiToken0 = $('#api-token').val();
            if(!apiToken0){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("api-token-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
            //機能設定
            funcCond0 = [];
            if($('#view-function').is(':checked')){
                funcCond0.push('view')
            }
            if($('#add-function').is(':checked')){
                funcCond0.push('add');
            }
            if($('#iframe-function').is(':checked')){
                funcCond0.push('iframe');

                const domains = $('.domain');

                for (let i = 0; i < domains.length; i++){
                    console.log('---', $(domains[i]).val())
                    if (!$(domains[i]).val() || !domainRegex.test($(domains[i]).val())) {
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("domain-format-is-invalid"),
                            type: 'red',
                            animateFromElement: false,
                        });
                        return false;
                    } else {
                        const scheme = $(domains[i]).parent().children('.scheme').first().val()
                        trustedSites.push(`${scheme}://` + $(domains[i]).val())
                    }
                }
            }

            if (!funcCond0.length){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("feature-field-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
	        	return false;
	    	}
            //フィールドの表示条件
            if($('#field_cond_0').is(':checked')){
                fieldCond0 = [];
                $('.field_cond_field_0').each(function(index){
                    let field = $(this).val();
                    let $view  = $('.field-cond-func').eq(index).find('input[name="field-cond-view"]');
                    let $edit = $('.field-cond-func').eq(index).find('input[name="field-cond-edit"]');
                    let func = [];
                    if ($view.is(':checked')) func.push('view');
                    if ($edit.is(':checked')) func.push('edit');
                    if (field){
                        fieldCond0.push({
                            field : field,
                            function : func,
                            typeField: $(this).find(":selected").attr("data-type")
                        });
                    }
                });
                if(!fieldCond0.length){
                    $.alert({
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("field-display-conditions-are-required"),
                        type: 'red',
                        animateFromElement: false,
                    });
                    return false;
                }
                let fieldValueDuplicate = checkDuplicate(fieldCond0.map(x=>x.field));
                if (fieldValueDuplicate){
                    $.alert({
                        title: translateCommon("input-duplication-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("duplicated-field-display-conditions", {duplicatedField: fieldValueDuplicate}),
                        type: 'red',
                        animateFromElement: false,
                    });
                    return false;
                }
            }
        }

        //保存ボタンの名称
        let saveButtonName = escapeOutput($('#save_btn_name').val())
        if (!saveButtonName){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("enter-save-button-label"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }

        if (saveButtonName.length > 20){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("save-button-label-has-max-length"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }

        //一覧で表示するレコード条件の指定
        const listViews = document.getElementById('views').getElementsByClassName("list-view-checkbox")
        const checkedViews = Array.from(listViews).filter(listView => listView.checked)
        if(checkedViews.length === 0){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("list-records-view-is-required"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }
        const lists = appViews.filter(appView => {
            return checkedViews.some(checkedView => {
                return appView.name === checkedView.value
            })
        });

        const isExistAll =  checkedViews.some(checkedView => checkedView.id === 'viewId-all')

        const views = []
        lists.forEach(list => {
            const calendarViewList = view.get().find(calendarViewList => calendarViewList.viewId === list.id)
            if(calendarViewList){
                list["calendarView"] = calendarViewList.calendarView
                views.push(list)
            }else{
                views.push(list)
            }
        })

        console.log("views", views)

        if(isExistAll){
            const calendarViewList = view.get().find(calendarViewList => calendarViewList.viewId === 'all')
            if(calendarViewList){
                views.push({
                    id: 'all',
                    calendarView: calendarViewList.calendarView
                })
            }else{
                views.push({
                    id: 'all'
                })
            }
        }

        console.log("after views", views)

        //カレンダービュー
        if($('#view_type').is(':checked')){
            let eventLimit = $('#eventLimit').is(':checked') ? true : false;
            let event_title = $('#event_title').val();
            let event_start = $('#event_start').val();
            let event_end = $('#event_end').val();
            if(!event_title){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("event-title-field-of-calendar-view-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false
            }
            if(!event_start){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("event-start-datetime-field-of-calendar-view-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
            if(!event_end){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("event-end-datetime-field-of-calendar-view-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
            calendarView = {
                eventLimit : eventLimit,
                event_title: event_title,
                event_start: event_start,
                event_end: event_end,
                event_color: false
            }
            let field = $('#schedule_color').val();
            let cond = {};
            let condArr = [];
            $('.schedule-color-value').each(function(index){
                if($(this).val()){
                    condArr.push($(this).val())
                    Object.assign(cond, {[$(this).val()] : $('.schedule-color-option').eq(index).val()});
                }
            });
            if (Object.keys(cond).length && field){
                calendarView.event_color = {
                    field : field,
                    cond : cond
                }

            }
            let duplicateCalendar = checkDuplicate(condArr);
            if(duplicateCalendar){
                $.alert({
                    title: translateCommon("input-duplication-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("color-settings-of-calendar-view-are-duplicated", {duplicatedCondition: duplicateCalendar}),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
        }
        //画面カラー設定
        let templateColor = {
            backgroundColor : {
                bcolor1 : $('#bcolor1').val(),
                bcolor2 : $('#bcolor2').val(),
                bcolor3 : $('#bcolor3').val(),
            },
            fontColor: {
                fcolor1 : $('#fcolor1').val(),
                fcolor2 : $('#fcolor2').val(),
                fcolor3 : $('#fcolor3').val(),
            }
        }

        const jsCustomTemp = $('.js-custom').toArray()
        for (let i = 0; i < jsCustomTemp.length; i++){
            const $jsLink =$(jsCustomTemp[i])

            const hasFileId = $jsLink.attr('fileId')
            const hasFileUrl = $jsLink.attr('fileUrl')

            if (hasFileUrl){
                jsCustom.push(hasFileUrl);
                continue;
            }

            if (hasFileId){
                let found = fileSpace.find(x => x.fileId == hasFileId);
                if (found){
                    let foundLink = await getUploadLink(found);
                    jsCustom.push(foundLink)
                    continue;
                }
            }

            const jsLink = $jsLink.val();
            if (jsLink && jsLink !==  'https://' && jsLink.indexOf('https://') != -1){
                jsCustom.push(jsLink);
            }

        }

        const cssCustomTemp = $('.css-custom').toArray()
        for (let i = 0; i < cssCustomTemp.length; i++){
            const $cssLink =$(cssCustomTemp[i])

            const hasFileId = $cssLink.attr('fileId')
            const hasFileUrl = $cssLink.attr('fileUrl')

            if (hasFileUrl){
                cssCustom.push(hasFileUrl);
                continue;
            }

            if (hasFileId){
                let found = fileSpace.find(x => x.fileId == hasFileId);
                if (found){
                    let foundLink = await getUploadLink(found);
                    cssCustom.push(foundLink)
                    continue;
                }
            }

            const cssLink = $cssLink.val();
            if (cssLink && cssLink !==  'https://' && cssLink.indexOf('https://') != -1){
                cssCustom.push(jsLink);
            }

        }

        //位置情報取得機能
        if($('#locate_cond_1').is(':checked')){
            let latitude = $('#latitude_1').val();
            let longitude = $('#longitude_1').val();
            if (!latitude){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("latitude-field-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
            if(!longitude){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("longitude-field-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
            locateCond = {
                latitude : latitude,
                longitude : longitude
            }
        }

        //自動返信メール機能
        if($('#auto_sendmail_cond').is(':checked')){
            let autoEmail = $('#auto-email').val();
            if (!autoEmail){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("auto-send-email-destination-field-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }

            let autoSubject = $('#auto-subject').val();
            if (!autoSubject){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("auto-send-email-subject-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }

            let autoContent = $('#auto-content').val();
            if (!autoContent){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("auto-send-email-body-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }

            autoSendMail = {
                autoEmail : autoEmail,
                autoSubject : autoSubject,
                autoContent : autoContent
            }
        }
        //レコード保存後のページ表示設定
        if($('#thanks_page').is(':checked')){
            if( !$('#trumbowyg').trumbowyg('html')){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("thanks-page-content-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }else{
                thanksPage = $('#trumbowyg').trumbowyg('html');
            }
        }

        //アンケート回答の多重回答禁止制御
        if($('#response-control').is(':checked')){
            let duration = false ;
            if ($('#duration').val() == 1){
                let durationDays = $('#duration-days').val();
                if (!durationDays){
                    $.alert({
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("response-control-period-is-required"),
                        type: 'red',
                        animateFromElement: false,
                    });
                    return false;
                }
                let durationDate = moment().add(durationDays, 'days').format('YYYY-MM-DD');
                duration = {
                    durationDays : durationDays,
                    durationDate : durationDate
                }
            }


            responseControl = {
                duration : duration
            };
        }


        //簡易一時保存機能
        if($('#temp-saving').is(':checked')){
            let tempSavingBtn = escapeOutput($('#temp-saving-btn').val())
            if (!tempSavingBtn){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("enter-temp-save-button-label"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }

            if (tempSavingBtn.length > 20){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("temp-save-button-label-has-max-length"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }

            tempSaving = tempSavingBtn;
        }

        /**
         * # 注意
         * ルックアップ完全一致の設定はUS版でしか表示されていなかった。
         * だがしかし、こうしたロジックがあることから、もしかしたら日本版でも取り込んで問題ないのかもしれない。
         */
        if($('#lk-complete-match').is(':checked')){
            lkCompleteMatch = [];
            $('.lk-complete-match-field').each(function(){
                if ($(this).val()){
                    lkCompleteMatch.push($(this).val())
                }
            })

            if (!lkCompleteMatch.length){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("lookup-complete-match-field-is-required"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }

            let duplicate = checkDuplicate(lkCompleteMatch);
            if (duplicate){
                $.alert({
                    title: translateCommon("input-duplication-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("lookup-complete-match-fields-are-duplicated"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
        }


        //thanks page and add
        if (!thanksPage && (auth == false || auth === 1) && Array.isArray(funcCond0) &&  funcCond0[0] == 'add'){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("thanks-page-content-is-required"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }
        //アクション機能設定
        if($('#action_cond').is(':checked')){
            let action_err_flag = false;

            let appIds = [];
            $('.action-tr').find('.action_to_app').each(function(){
                if ($(this).val()){
                    appIds.push($(this).val());
                }

            })

            const actionAppFieldsTemp = await Promise.all(appIds.map(id=>{
                return new Promise(async (res, rej)=>{
                    const fieldInfo = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app: id}).catch(err=>rej(err))
                    res({id, fieldInfo})
                })
            }))

            let actionAppFields = {}
            actionAppFieldsTemp.forEach(appinfo => {
                actionAppFields[appinfo.id] = appinfo.fieldInfo
            })

            $('.action-tr').each(function(a_i, elem){
                let actionCond = {};
                let actionName = escapeOutput($(this).find('.action_name').val());
                if (!actionName){
                    $.alert({
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("action-button-label-is-required"),
                        type: 'red',
                        animateFromElement: false,
                    });
                    action_err_flag = true;
                    return false;
                }
                if (actionName.length > 128){
                    $.alert({
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("action-button-label-has-max-length"),
                        type: 'red',
                        animateFromElement: false,
                    });
                    action_err_flag = true;
                    return false;
                }
                let actionApp = $(this).find('.action_to_app').val();
                if(!actionApp){
                    $.alert({
                        title: translateCommon("input-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("action-destination-app-is-required"),
                        type: 'red',
                        animateFromElement: false,
                    });
                    action_err_flag = true;
                    return false;
                }
                actionCond = {
                    actionName  : actionName,
                    actionApp :  actionApp,
                    copyFields : [],
                    webhookSync: false
                }
                //let actionAppFields = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app: actionApp});
                $(this).find('.action_copy_from').each(function(acf_i){
                    let copyFrom = $(this).val();
                    let copyTo = $(this).closest("tr").find('.action_copy_to').val();
                    let editable = $(this).closest("tr").find('.editable').is(':checked') ? false : true;
                    if (copyFrom && copyTo){
                        let obj = {
                            copyFrom : copyFrom,
                            copyFromType : fields[copyFrom].type,
                            copyTo : copyTo,
                            copyToType : actionAppFields[actionApp].properties[copyTo].type,
                            editable : editable

                        }
                        actionCond.copyFields.push(obj);
                    }
                })
                let option_duplicates = checkDuplicate(actionCond.copyFields.map(x => x.copyTo));
                if(option_duplicates){
                    $.alert({
                        title: translateCommon("input-duplication-error-title"),
                        icon: 'fas fa-exclamation-triangle',
                        content: translateError("action-copy-fields-are-duplicated", {duplicatedField: option_duplicates}),
                        type: 'red',
                        animateFromElement: false,
                    });
                    action_err_flag = true;
                    return false;
                }

                //webhookアプリ間更新
                if($(this).find('.wsync-cond-trig').is(':checked')){
                    let apiToken = $(this).find('.wsync-apitoken').val();
                    if (!apiToken){
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("webhook-sync-api-token-is-required"),
                            type: 'red',
                            animateFromElement: false,
                        });
                        action_err_flag = true;
                        return false;
                    }
                    let fromKey = $(this).find('.wsync-from-key').val();
                    if (!fromKey){
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("webhook-sync-origin-key-is-required"),
                            type: 'red',
                            animateFromElement: false,
                        });
                        action_err_flag = true;
                        return false;
                    }
                    let toKey = $(this).find('.wsync-to-key').val();
                    if (!toKey){
                        $.alert({
                            title: translateCommon("input-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("webhook-sync-destination-key-is-required"),
                            type: 'red',
                            animateFromElement: false,
                        });
                        action_err_flag = true;
                        return false;
                    }

                    webhookSync = {
                        apiToken :apiToken,
                        fromKey : fromKey,
                        fromKeyType: actionAppFields[actionApp].properties[fromKey].type,
                        toKey : toKey,
                        toKeyType : fields[toKey].type,
                        updateFields : []
                    }

                    $(this).find('.wh-map-tr').each(function(){
                        let updateTo = $(this).find(".wsync-to-field").val();
                        let updateFrom = $(this).find('.wsync-from-field').val();

                        if (updateTo && updateFrom){
                            let obj = {
                                updateTo : updateTo,
                                updateToType : fields[updateTo].type,
                                updateFrom : updateFrom,
                                updateFromType : actionAppFields[actionApp].properties[updateFrom].type,
                            }
                            webhookSync.updateFields.push(obj);
                        }
                    })
                    let option_duplicates = checkDuplicate(webhookSync.updateFields.map(x => x.updateTo));
                    if(option_duplicates){
                        $.alert({
                            title: translateCommon("input-duplication-error-title"),
                            icon: 'fas fa-exclamation-triangle',
                            content: translateError("webhook-update-target-fields-are-duplicated"),
                            type: 'red',
                            animateFromElement: false,
                        });
                        action_err_flag = true;
                        return false;
                    }

                    actionCond.webhookSync = webhookSync
                }

                actionCondList.push(actionCond)
            })
            //アクション先は同一アプリ選択OKだがwebhook更新はそのうちのいずれか1つのみ設定可能とする
            let webhookAppTargets = [];
            actionCondList.forEach(act=>{
                if(act.webhookSync) webhookAppTargets.push(act.actionApp)
            })
            let wh_duplicates = checkDuplicate(webhookAppTargets)
            if(wh_duplicates) {
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("webhook-sync-action-dest-apps-are-duplicated"),
                    type: 'red',
                    animateFromElement: false,
                });
                action_err_flag = true;
                return false;
            }

            if(action_err_flag) return false;
        }
        //check input fied dublicate
    	let checkDuplicateInputField = [];
        checkDuplicateInputField.push(creator);
        checkDuplicateInputField.push(editor);
        checkDuplicateInputField.push(locateCond.latitude);
        checkDuplicateInputField.push(locateCond.longitude);
        checkDuplicateInputField.push(timeCond.createTime);
        checkDuplicateInputField.push(timeCond.editTime);
        checkDuplicateInputField.filter(x => x!=false);

        checkDuplicateInputField = checkDuplicateInputField.filter(x => x != undefined);
        let input_duplicates = checkDuplicate(checkDuplicateInputField)

        if (input_duplicates){
            $.alert({
                title: translateCommon("input-duplication-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("chobiit-system-fields-are-duplicated", {duplicatedField: input_duplicates}),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }
        //check null
        for (let i = 0; i < appRights.length; i++){
            if (appRights[i].entity.code == null)
                appRights[i].entity.code = ' ';
        }
        for (var key in fields){
            for (var key2 in fields[key]){
                if (fields[key][key2] == ''){
                    fields[key][key2] = ' ';
                }
            }
            if (fields[key].type =='SUBTABLE'){
                let tFields = fields[key].fields;
                for (var key3 in tFields){
                    for (var key4 in tFields[key3]){
                        if (tFields[key3][key4] == ''){
                            tFields[key3][key4] = ' ';
                        }
                    }


                    if (tFields[key3].hasOwnProperty('lookup')){
                        if(tFields[key3].lookup == null){
                            delete tFields[key3];
                        } else{
                            tFields[key3].lookup.relatedApp.code = tFields[key3].lookup.relatedApp.code || ' ';
                            tFields[key3].lookup.filterCond = tFields[key3].lookup.filterCond || ' ';
                        }
                    }
                }
            }

            else if (fields[key].type =='REFERENCE_TABLE'){
                fields[key].referenceTable.filterCond =  fields[key].referenceTable.filterCond || " ";
                fields[key].referenceTable.relatedApp.code = fields[key].referenceTable.relatedApp.code  || " ";
            }

            else if (fields[key].hasOwnProperty('lookup')){
                if(fields[key].lookup == null){
                    delete fields[key];
                } else{
                    fields[key].lookup.relatedApp.code = fields[key].lookup.relatedApp.code || ' ';
                    fields[key].lookup.filterCond = fields[key].lookup.filterCond || ' ';
                }
            }
        }

        //check null record right
        for (let j = 0; j < recordRights.length; j ++){
            if (recordRights[j].filterCond == ""){
                recordRights[j].filterCond = " ";
            }
        }

        let data = {
            appRights    : appRights,
            recordRights : recordRights,
          //  evaluateRecordRights : evaluateRecordRights,
            fieldRights  : fieldRights,
            fields       : fields,
            app          : app,
            appName      : escapeOutput(appName),
            appCreatorCode: appCreatorCode,
            locateCond   : locateCond,
            timeCond     : timeCond,
            auth         : auth,
            funcCond0    : funcCond0,
            apiToken0    : apiToken0,
            recordCond0  : recordCond0,
            fieldCond0   : fieldCond0,
            views        : views,
            processCond1 : processCond1,
            domain       : domain,
            formLayout   : formLayout,
            thanksPage   : thanksPage,
            templateColor: templateColor,
            showText     : showText,
            creator      : creator,
            editor       : editor,
            notif        : notif,
            actionCondList   : actionCondList,
            //actionCond: actionCond,
            //webhookSync   : webhookSync,
            ownerView    : ownerView,
            groupView    : groupView,
            showComment : showComment,
            relateFieldsInfo : relateFieldsInfo,
            lookupRelateInfo : lookupRelateInfo,
            checkLookupKey : checkLookupKey,
            saveButtonName : saveButtonName,
            appLinkTo : appLinkTo,
            robotoCheck: robotoCheck,
            jsCustom : jsCustom,
            cssCustom : cssCustom,
            autoSendMail : autoSendMail,
            responseControl: responseControl,
            tempSaving : tempSaving,
            lkCompleteMatch: lkCompleteMatch,
            trustedSites: trustedSites,
            statusInfo : statusInfo
        }
        return data;
    }

    function getAllAppInfo(opt_limit, opt_offset, opt_apps){
        const limit  = opt_limit || 100;
        const offset = opt_offset || 0;
        let apps = opt_apps || [];
        const params = {
            limit: limit,
            offset: offset
        };
        return kintone.api(kintone.api.url("/k/v1/apps", true), "GET", params).then((resp)=>{
            apps = apps.concat(resp["apps"]);
            if(resp["apps"].length === limit){
                return getAllAppInfo(limit, offset+limit, apps);
            }
            sessionStorage.setItem('apps',JSON.stringify(apps))
            return apps;
        });
    }
    async function submitApp(data){
        console.log('starting put app to dynamo....')
        let dataToDyanmo = Object.assign({},data);
        delete dataToDyanmo.formLayout;
        // dataToDyanmo = iterateXss(dataToDyanmo)
        let putDynamoPromise  = new Promise((resolve, reject) => {
            let URL = configApi.manageApp;
            $.ajax({
                type: 'POST',
                url: URL,
                headers: { 'X-Api-Key': apiKey },
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(dataToDyanmo),
                success: function () {
                    console.log('put app to dynamo success');
                    resolve();
                },
                error: function (err) {
                    console.error('put app to dynamo fail')
                    reject(err);
                }
            })
        });
        let createFormPromise = new Promise((resolve, reject) => {
            console.log('starting create form....')
            let URL = configApi.createForm;
            $.ajax({
                type: 'POST',
                url: URL,
                headers: { 'X-Api-Key': apiKey },
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (resp) {
                    console.log('create form success!!');
                    resolve();
                },
                error: function (err) {
                    console.error('create form fail');
                    reject(err);
                }
            })
        });
        let createCloudFrontInv = new Promise((resolve, reject) => {
            console.log('starting create cloudFront invalidation ....')
            let url = configApi.createCloudFrontInvalidation +'?domain=' + domain + '&appId=' + data.app;
            $.ajax({
                type: 'DELETE',
                url: url,
                headers: { 'X-Api-Key': apiKey },
                dataType: 'json',
                contentType: 'application/json',
                success: function (result) {
                    console.log('create cloudFront invalidation success!!');
                    resolve(result);
                },
                error: function (err) {
                    console.error('create cloudFront invalidation fail');
                    reject(err);
                }
            })
        });
        await putDynamoPromise;
        await createFormPromise;
        await createCloudFrontInv;
        return dataToDyanmo;
    }


    async function getSubmitUserData(eventType){
        // 以下でアンエスケープ処理をはさんでいますが, これは過剰にエスケープ処理をされるのを防ぐためです.
        // jiraタスク: https://novelworks.atlassian.net/browse/CFK-1
        let loginName = escapeOutput(unescapeHtml($('#login_name').val()))
        if(!loginName){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("enter-login-name"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }
        if(!loginNameRegex.test(loginName)){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("login-name-cannot-contain-white-spaces"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }
        
        /**
         * # 注意
         * US 版だけ、ログイン名の詳細なバリデーションを実装している。
         */
        if (process.env.CHOBIIT_LANG === "en") {
            if (!isHalfWidthSymbol(loginName) || loginName.length < 3 || loginName.length > 64){
                $.alert({
                    title: 'Please check the input.',
                    icon: 'fas fa-exclamation-triangle',
                    content: 'Login name: Use 3 - 64 characters with a mix of letters and/or numbers, <br>and symbol . - _ @ (other symbols are not supported) <br>starting from either a letter or number',
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
        }
        
        if(loginName.length > 128){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("login-name-has-max-length"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }
        // if (allConfigData.data.users.map(x =>x.loginName).includes(loginName) && eventType == 'add'){
        //     $.alert({
        //         title: '重複エラー',
        //         icon: 'fas fa-exclamation-triangle',
        //         content: 'このログイン名は別のユーザーが既に利用しています。別のログイン名を入力してください。',
        //         type: 'red',
        //         animateFromElement: false,
        //     });
        //     return false;
        // }
        if (eventType == 'add'){
            let check = await checkExistUser(loginName);
            if (check){
                $.alert({
                    title: translateCommon("input-duplication-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("this-chobiit-login-name-is-already-used"),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
        }
        let name = escapeOutput($('#name').val())
        if(!name){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("enter-chobiit-user-display-name"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }
        if(name.length > 128){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("chobiit-display-name-has-max-length"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }

        let mailAddress = $('#email').val();
        if(!mailAddress){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("enter-email-address"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }

        const regexMail = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;

        if (!regexMail.test(mailAddress)) {
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("email-address-format-is-invalid"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }
        let kintoneLoginName = $('#kintone_user').val();
        if(!kintoneLoginName){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("select-linked-kintone-account"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }

        if (eventType == 'add' && getAllIndexes(allConfigData.data.users.map(x =>x.kintoneLoginName), kintoneLoginName) >= maxNumberOfUsers){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("the-number-of-chobiit-users-has-exceeded", {kintoneLoginName}),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }
        if (eventType == 'edit'){
            let configKintoneLoginName = allConfigData.data.users.find(x => x.loginName == loginName).kintoneLoginName;
            if (kintoneLoginName != configKintoneLoginName && getAllIndexes(allConfigData.data.users.map(x =>x.kintoneLoginName), kintoneLoginName) >= maxNumberOfUsers){
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("the-number-of-chobiit-users-has-exceeded", {kintoneLoginName}),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
        }

        let kintoneUsername = kintoneUserList.find(x => x.code == kintoneLoginName).name;
        let cybozuToken = allConfigData.data.kintoneUsers.find(x => x.kintoneLoginName == kintoneLoginName).cybozuToken;
        //kintone organization , kintone group 取得
        let departments = await kintone.api(kintone.api.url('/v1/user/organizations', true), 'GET', {"code" : kintoneLoginName});
        let groups =  await kintone.api(kintone.api.url('/v1/user/groups', true), 'GET', {'code' : kintoneLoginName});



        let organizationArr = [];
        let groupArr = [];

        let departs = departments.organizationTitles;
        let grs = groups.groups;
        for (let i = 0; i < departs.length; i++) {
            let depart = departs[i];
            if (depart.organization){
                organizationArr.push(depart.organization.code);
            }
        }
        for (let i = 0; i < grs.length; i++){
            let gr = grs[i];
            groupArr.push(gr.code);
        }
        let apps = [];
        $('.user-app').each(function(){
            if($(this).val()){
                apps.push($(this).val());
            }
        });
        if(!apps.length){
            $.alert({
                title: translateCommon("input-error-title"),
                icon: 'fas fa-exclamation-triangle',
                content: translateError("select-apps-used-in-chobiit"),
                type: 'red',
                animateFromElement: false,
            });
            return false;
        }else{
            let duplicate = checkDuplicate(apps);
            if(duplicate){
                $.alert({
                    title: translateCommon("input-duplication-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: translateError("using-apps-are-duplicated", {duplicatedApp: duplicate}),
                    type: 'red',
                    animateFromElement: false,
                });
                return false;
            }
        }
        let isAdmin = $('#administrator').is(':checked');
        //data取得
        let data = {
            domain              : domain,
            name                : name,
            loginName           : loginName,
            apps                : apps,
            mailAddress         : mailAddress,
            kintoneLoginName    : kintoneLoginName,
            kintoneUsername     : kintoneUsername,
            cybozuToken         : cybozuToken,
            kintoneOrganizations: organizationArr,
            kintoneGroups       : groupArr,
            isAdmin             : isAdmin,

        };
        return data;
    }

    function copyTextToClipboard(text) {
        var textArea = document.createElement("textarea");

        // Place in top-left corner of screen regardless of scroll position.
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;

        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em';
        textArea.style.height = '2em';

        // We don't need padding, reducing the size if it does flash render.
        textArea.style.padding = 0;

        // Clean up any borders.
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';

        // Avoid flash of white box if rendered for any reason.
        textArea.style.background = 'transparent';


        textArea.value = text;

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand('copy');

        document.body.removeChild(textArea);
      }

    async function submitUser(data, lineNumber=null){
        // let fData = iterateXss(data)
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                url: configApi.createUser,
                headers: { 'X-Api-Key': apiKey },
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (data, textStatus, jqXHR){
                    const responseHandler = new AjaxResponseHandler(jqXHR)
                    responseHandler.handleResponse()
                    resolve();
                },
                error: async function (jqXHR, textStatus, errorThrown) {
                    const errorHandler = new AjaxErrorHandler(jqXHR, "failed-to-register-kintone-user-in-a-line", lineNumber)
                    errorHandler.handleResponse()
                    
                    reject();
                }
            });
        })
    }

    async function submitGroup(data, method, lineNumber=null){
        // let fData = iterateXss(data)
        return new Promise((resolve, reject) => {
            $.ajax({
                type: method,
                url: configApi.createGroup,
                headers: { 'X-Api-Key': apiKey },
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (data, textStatus, jqXHR){
                    const responseHandler = new AjaxResponseHandler(jqXHR)
                    responseHandler.handleResponse()
                    resolve();
                },
                error: async function (jqXHR, textStatus, errorThrown) {
                    
                    const errorHandler = new AjaxErrorHandler(jqXHR, "failed-to-register-group-in-a-line", lineNumber)
                    errorHandler.handleResponse()
                    
                    reject();
                }
            });
        })
    }

    async function updateUser(data, lineNumber=null){
        // let fData = iterateXss(data)
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'PUT',
                url: configApi.updateUser,
                headers: { 'X-Api-Key': apiKey },
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (data, textStatus, jqXHR){
                    const responseHandler = new AjaxResponseHandler(jqXHR)
                    responseHandler.handleResponse()
                    resolve();
                },
                error: async function (jqXHR, textStatus, errorThrown) {
                    
                    const errorHandler = new AjaxErrorHandler(jqXHR, "failed-to-update-kintone-user-in-a-line", lineNumber)
                    errorHandler.handleResponse()
                    reject();
                }
            });
        })
    }
    async function putKintoneUser(data, lineNumber=null){
        // let fData = iterateXss(data)
        return new Promise((resolve, reject) => {
            const URL = configApi.putKintoneUser;
			$.ajax({
				type: 'PUT',
				url: URL,
                headers: { 'X-Api-Key': apiKey },
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify(data),
                success: function (data, textStatus, jqXHR){
                    const responseHandler = new AjaxResponseHandler(jqXHR)
                    responseHandler.handleResponse()
                    resolve();
                },
                error: async function (jqXHR, textStatus, errorThrown) {
                    
                    const errorHandler = new AjaxErrorHandler(jqXHR, "failed-to-register-kintone-user-in-a-line", lineNumber)
                    errorHandler.handleResponse()                    
                    reject();
                }
            });
        })
    }

    function checkApiToken(apiToken, appId){
        return new Promise((resolve, reject) => {
            var url = `${window.location.origin}/k/v1/records.json?app=${appId}`
            console.log(url);
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('X-Cybozu-API-Token', apiToken);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                   resolve(false);
                }
            };
            xhr.send();
        })
    }

    function showAuth(auth){
        if (auth === true) return translateInfo("app-setting.linked-app-setting.with-auth");
        if (auth === false) return translateInfo("app-setting.linked-app-setting.public");
        if (auth === 1) return translateInfo("app-setting.linked-app-setting.both");
    }

    function showGroupUsers(groupUsers){

        return groupUsers.length > 5 ? groupUsers.slice(0,5).join(',') + '...' : groupUsers.join(',');
    }
    function fetchUsers(opt_offset, opt_size, opt_users) {
        var offset = opt_offset || 0;
        var size = opt_size || 100;
        var allUsers = opt_users || [];
        var params = {size :  size , offset :offset};
        return kintone.api(kintone.api.url('/v1/users', true), 'GET', params).then((resp)=>{
            allUsers = allUsers.concat(resp.users);
            if (resp.users.length === size) {
                return fetchUsers(offset + size, size, allUsers);
            }
            return allUsers;
        });
    }

    async function storeErr(err, functionName){
		console.error(err)
		const URL = configApi.storeErr;
		const data = {
			domain : domain,
			functionName : functionName,
			error : err,
		}
		$.ajax({
			type: 'PUT',
			url: URL,
            headers: { 'X-Api-Key': apiKey },
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function () {
				console.log('put err success')
			},
			error: function (err) {
				console.log('put err fail');
				console.error(err)
			}
		});
	}
	function base64EncodeUnicode(str) {
		let utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
				return String.fromCharCode('0x' + p1);
		});
		return btoa(utf8Bytes);
	}

    function b64DecodeUnicode(str) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    async function getAllConfigData(){
        return new Promise((resolve, reject) => {
            var url = `${configApi.getConfig}` ;
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var response = this.response;
                    if (typeof response != 'object'){
                        response = JSON.parse(response);
                    }
                    if (response.statusCode === 200) {
                        var body = JSON.parse(response.body);
                        resolve(body);
                    }else{
                        reject(resolve);
                    }
                }
            };
            xhttp.open('GET', url, true);
            xhttp.responseType = 'json';
            xhttp.setRequestHeader('Content-type', 'application/json');
            xhttp.setRequestHeader('X-Api-Key', apiKey);

            xhttp.send();
        })
    }

    async function getAllConfigUser(){
        let allConfigUsers = [];
        let resp;
        let body = {};
        do {
            resp = await  new Promise((resolve, reject) => {
                var url = `${configApi.getConfigUsers}` ;
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var response = this.response;
                        if (typeof response != 'object'){
                            response = JSON.parse(response);
                        }
                        if (response.statusCode === 200) {
                            var body = JSON.parse(response.body);
                            if (body.code == 200){
                                resolve(body.data);
                            }else{
                                reject(body);
                            }

                        }else{
                            reject(response);
                        }
                    }
                };
                xhttp.open('POST', url, true);
                xhttp.responseType = 'json';
                xhttp.setRequestHeader('Content-type', 'application/json');
                xhttp.setRequestHeader('X-Api-Key', apiKey);

                xhttp.send(JSON.stringify(body));
            })

            allConfigUsers = allConfigUsers.concat(resp.users);
            body.ExclusiveStartKey = resp.LastEvaluatedKey

        }while(resp.LastEvaluatedKey != undefined);

        return allConfigUsers;
    }

    /**
     * バックエンドの関数 `chobiitCheckUserOperateType` を呼び出す関数
     * 
     * @param {*} loginName chobiitのログイン名
     * @param {*} domain 所属するドメイン名
     */

    function checkExistUser(loginName){
        return new Promise((resolve, reject) => {
            var url = `${configApi.existUser}?loginName=${loginName}&domain=${domain}` ;
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var response = this.response;
                    if (typeof response != 'object'){
                        response = JSON.parse(response);
                    }
                    if (response.statusCode === 200) {
                        var body = JSON.parse(response.body);
                        resolve(body.check);
                    }else{
                        reject(response);
                    }
                }
            };
            xhttp.open('GET', url, true);
            xhttp.responseType = 'json';
            xhttp.setRequestHeader('Content-type', 'application/json');

            xhttp.send();
        })
    }

    async function sendMail(email, subject, content){
		let data = {
				email: email,
				subject: subject,
				content: content,
                domain: domain
			}
		const URL = configApi.sendMail;
		$.ajax({
			type: 'POST',
			url: URL,
            headers: { 'X-Api-Key': apiKey },
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function () {
				console.log('send mail sucesss!!!');
			},
			error: function (err) {
				console.log('send mail fail !!!!' +JSON.stringify(err));
			}
		})
    }

    function onOffLinkAction(){
        let appLinkTo =  $('#app-linkto').val();
        let actionApp = $('#action_to_app').val();

        if (actionApp && appLinkTo && appLinkTo == actionApp &&  $('#app-linkto-cond').is(':checked') && $('#action_cond').is(':checked')){
            $('#app-linkaction-cond').prop('disabled', false);
        }else{
            $('#app-linkaction-cond').prop('disabled', true);
            $('#app-linkaction-cond').prop('checked', false);
        }
    }

    function getCode(str){
		let index = str.lastIndexOf('(');
		return str.substring(index+1, str.length-1);
	}

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
    function exportToCsv(filename, rows) {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';
        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        var blob = new Blob(["\uFEFF"+csvFile], { type: 'text/csv;charset=utf-8;' });

        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }




    function getUniqueStr(myStrong){
        var strong = 1000;
        if (myStrong) strong = myStrong;
        return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
    }

    async function getUploadLink(fileInfo){
        let preUrl = await new Promise((resolve, reject) => {
            jQuery.ajax({
                type: 'POST',
                contentType: 'application/json',// 2018/06/27 ADD
                url: configApi.uploadCustomFile,
                headers: { 'X-Api-Key': apiKey },
                data: JSON.stringify({
                    domain : domain,
                    fileId: fileInfo.fileId,
                    fileName : fileInfo.file.name,
                    fileType : fileInfo.file.type
                }),
                crossDomain: true
            })
            .done(function (response) {
                console.log("get presign url のレスポンス ****");
                let body = JSON.parse(response.body);
                resolve(body.url);
            })

            .fail(function (err) {
                reject(err)
            });
        })

        await new Promise ((resolve, reject) => {
            $.ajax({
                type: 'PUT',
                url: preUrl,
                contentType: fileInfo.file.type,
                processData: false,
                data: fileInfo.file,

                success: function success() {
                     console.log('File uploaded to s3 success !!!!!!!');
                    resolve();
                },
                error: function error(err, exception) {
                    reject(err);
                }
            });
        })

        let url = 'https://' + parseURL(preUrl).host + parseURL(preUrl).pathname;
        return url
    }


    function parseURL(url) {
        var parser = document.createElement('a'),
            searchObject = {},
            queries, split, i;
        // Let the browser do the work
        parser.href = url;
        // Convert query string to object
        queries = parser.search.replace(/^\?/, '').split('&');
        for( i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=');
            searchObject[split[0]] = split[1];
        }
        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname,
            search: parser.search,
            searchObject: searchObject,
            hash: parser.hash
        };
    }

    function doAuthentication() {
        $('#check-plugin-trial').prop("disabled", true);
        $('#submit').prop("disabled", true);

        var authKey = $('#authKey').val();
        var authEmail = $('#authEmail').val();
        var lang = user['language'];
        console.log("authKey=" + authKey);
        console.log("authEmail=" + authEmail);
        console.log("lang=" + lang);

        var pluginId = PLUGIN_ID;
        var authentication = new NovelPluginAuthorization(pluginId, lang, authKey, authEmail);
        var resultAuthorization = authentication.authorizeConfig();
        $('#check-plugin-trial').prop("disabled", false);
        $('#submit').prop("disabled", false);

        if (!resultAuthorization) {
            console.log("*** No  Authorization ****");
            return false;
        } else {
            console.log("*** OK  Authorization ****");
            return true;
        }
    }
    // ############### 認証処理 END 2018/06/18 #########################

    function iterate(obj){
        Object.keys(obj).forEach(key => {

        if (obj[key] === '') obj[key] = ' '

        if (typeof obj[key] === 'object') {
                iterate(obj[key])
            }
        })

        return obj;
    }

    async function checkCybozuToken(cybozuToken){

        var url = `${window.location.origin}/k/v1/apps.json`
        console.log(url);

        let check = await new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('X-Cybozu-Authorization', cybozuToken);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    // success
                    console.log(JSON.parse(xhr.responseText));
                    resolve(true)
                } else {
                    // error
                    console.log(JSON.parse(xhr.responseText));
                    resolve(false)
                }
            };
            xhr.send();
        })
        return check;
    }
})(jQuery, kintone.$PLUGIN_ID);

const $ = jQuery

export function escapeOutput(toOutput){
    return toOutput
        .replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27')
        .replace(/\//g, '&#x2F');
}

function unescapeHtml(escapedString) {
    return escapedString
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
}


export function showSepicalTextInHtml(text) {
    let docHtml = document.createElement('div');
    docHtml.innerHTML = escapeOutput(text);

    return docHtml.innerHTML ;
};


export async function makeCalendarOption(appValue, dataFields=null){
    $('#event_title, #event_start, #event_end, #schedule_color, .schedule-color-value').html('<option value=""></option');
    let appFieldsRes = dataFields;
    if (!appFieldsRes){
        appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
    }
    
    // Filter only the fields that are set in the list view
    let appFieldsValues = Object.values(appFieldsRes.properties);

    for (let i = 0; i < appFieldsValues.length; i ++){
        let field = appFieldsValues[i];
        let option = `<option value="${field.code}">${showSepicalTextInHtml(field.label)} (${field.code})</option>`;
        if (['SINGLE_LINE_TEXT', 'DROP_DOWN', 'RADIO_BUTTON'].includes(field.type) && !field.hasOwnProperty('lookup')){
            $('#event_title').append(option);
        }
        if (['DATETIME','UPDATED_TIME','CREATED_TIME'].includes(field.type)){
            $('#event_start, #event_end').append(option);
        }
        if (['DROP_DOWN','RADIO_BUTTON'].includes(field.type)){
            $('#schedule_color').append(option);
        }
    }
}

export async function makeCalendarColorOption(fieldValue, appValue, dataFields=null){
    $('.schedule-color-value').html('<option value=""></option');
    let appFieldsRes = dataFields;
    if (!appFieldsRes){
        appFieldsRes = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), "GET", {'app': appValue});
    }
    let options_radio = Object.keys(appFieldsRes.properties[fieldValue].options);
    options_radio.forEach(option => {
        let opt =  `<option value="${option}">${option}</option>`;
        $('.schedule-color-value').append(opt);
    });
}

export function checkDuplicate(arr){
    let duplicates = arr.filter(x => x != false).reduce(function(acc, el, i, arr) {
        if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el); return acc;
    }, []);

    if (duplicates.length > 0){
        return duplicates[0];
    }
    return false;
}
