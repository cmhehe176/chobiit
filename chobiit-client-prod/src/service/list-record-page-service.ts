/**
 * 一覧画面の処理である, list-record.jsとp-list-record.jsのコードを共通化して
 * こちらに順次まとめていきます.
 * まだ共通化出来る処理があるので, 後日対応します.
 * 
 * 認証あり と 外部公開で処理が異なる部分は, 変数isPublicListRecordで場合分けしています.
 */


import CalendarViewService from "./calendar-view-service";

export function insertHeader(fields, tableHeader, isPublicListRecord: boolean) {
    const tr = document.createElement('TR');
    Object.keys(fields).map(function (fieldKey, index) {
        const field = fields[fieldKey]; // add table header

        const th = document.createElement('TH');
        th.innerHTML = field.label;
        th.dataset.code = field.code;
        th.dataset.index = index; // if this field is record number move to first column

        if (field.type === 'RECORD_NUMBER') {
            const firstChild = tr.firstChild;
            tr.insertBefore(th, firstChild);
        } else {
            tr.appendChild(th);
        }
    }); // create empty header for column record detail

    tr.insertBefore(document.createElement('TH'), tr.firstChild);
    /**
     * 以下は"認証あり"と"外部公開"のコードを共通化した際の差分です.
     * 仕様の違いから差分が生じています.
     * 
     * "認証あり"設定時にのみ, 削除ボタン列のヘッダーを付与する
     * (外部公開の場合はレコード削除が出来ないため, 削除ボタン列のヘッダーは設けない)
     */
    if (!isPublicListRecord) {        
        tr.appendChild(document.createElement('TH'));
    }

    const fieldArray = Array.prototype.slice.call(tr.childNodes);
    const orderOfField = fieldArray.map(function (field) {
        return {
            code: field.dataset.code
        };
    });
    tableHeader.appendChild(tr);
    return orderOfField;
}

export const isKintoneQueryOffsetLimit = (hasFilterTerms, totalCount) =>
    hasFilterTerms && Number.parseInt(totalCount) > 10000;

export function setupStickyHeaderTable() {
    const ua = window.navigator.userAgent;

    if (ua.indexOf('Edge/') > 0 ||
        ua.indexOf('Trident/') > 0 ||
        ua.indexOf('MSIE ') > 0) {

        $('#content').scroll(function () {
            const top = this.scrollTop;

            let change = top - 216;

            if (top > $('#tableHeader').offset().top) {
                document.querySelectorAll("thead th").forEach(th =>
                    th.style.transform = `translateY(${change}px)`
                );
            } else {
                document.querySelectorAll("thead th").forEach(th =>
                    th.style.transform = ''
                );
            }
        });
    }
}

export function addNewFilterRow(handleChangeFilterField) {
    const filterList = $('#filterList');
    const conditionRowSample = filterList.children('.filter-row:first-child').clone();
    conditionRowSample.find('.input-filter-type').empty();
    conditionRowSample.find('.input-filter-value').replaceWith('<input class="form-control input-filter-value">');

    filterList.append(conditionRowSample);
    // attachEventはグローバル定義されている
    attachEvent('change', conditionRowSample.find('.input-filter-field')[0], handleChangeFilterField);
}

/**
 * # filterの削除ボタンの表示非表示を操作する関数
 * filterが1つだけ存在する場合は削除ボタンは表示せず
 * 1以上の場合は削除ボタンを表示する
 */
export function shouldShowDeleteButton() {
    const deleteConditionButtons = $('.filter-row .filter-delete');

    if (deleteConditionButtons.length > 1) {
        deleteConditionButtons.css('display', 'block');
    } else {
        deleteConditionButtons.css('display', 'none');
    }
}


/*--------------------------------------
 * function for filter 
 *--------------------------------------*/

export function attemptFilterCalendar(filterContents, isMatchAll, calendar, records, calendarView, appId, isPublicListRecord:boolean) {
    let recordFiltered = records;

    const _loop = function _loop(i) {
        const filterField = filterContents[i].querySelector('.input-filter-field').value;
        const filterType = filterContents[i].querySelector('.input-filter-type').value;
        const filterValue = $(filterContents[i]).find('.input-filter-value').val();

        if (filterField && filterType && filterValue !== '') {
            recordFiltered = recordFiltered.filter(function (record) {
                if (['DROP_DOWN', 'RADIO_BUTTON', 'STATUS'].includes(record[filterField].type)) {
                    if (filterType == 's_include') {
                        if (filterValue.some(item => item == record[filterField].value)) return record;
                    } else {
                        if (!filterValue.some(item => item == record[filterField].value)) return record;
                    }

                } else if (['CHECK_BOX', 'MULTI_SELECT'].includes(record[filterField].type)) {
                    if (filterType == 's_mutilInclude') {
                        if (filterValue.some(item => record[filterField].value.includes(item))) return record;
                    } else {
                        if (!filterValue.some(item => record[filterField].value.includes(item))) return record;
                    }
                } else {
                    /**
                     * "dt_e"   :  = (等しい)
                     * "dt_ne"  :  ≠ (等しくない)
                     * "dt_gte" :  ≥ (以降)
                     * "dt_lte" :  ≤ (以前)
                     * "dt_gt"  :  &gt; (より後)
                     * "dt_lt"  :  &lt; (より前)
                     * 
                     * 's_e', '='
                     * 's_ne', '!='
                     * 's_gte', '>='
                     * 's_lte', '<='
                     * 's_contain', 'like'
                     * 's_notContain', 'not like'
                     */
                    if (filterType == 's_gte' || filterType == 'dt_gte') {
                        if (record[filterField].value >= filterValue) return record;
                    } else if (filterType == 's_lte' || filterType == 'dt_lte') {
                        if (record[filterField].value <= filterValue) return record;
                    } else if (filterType == 'dt_gt') {
                        if (record[filterField].value > filterValue) return record;
                    } else if (filterType == 'dt_lt') {
                        if (record[filterField].value < filterValue) return record;
                    } else if (filterType == 's_e' || filterType == 's_contain' || filterType == 'dt_e') {
                        if (record[filterField].value.includes(filterValue)) return record;
                    } else if (filterType == 's_ne' || filterType == 's_notContain' || filterType == 'dt_ne') {
                        if (!record[filterField].value.includes(filterValue)) return record;
                    }
                }
            });
        }

        if (!isMatchAll && i == 0) {
            return "break";
        }
    };

    for (let i = 0; i < filterContents.length; i++) {
        const _ret = _loop(i);

        if (_ret === "break") break;
    }
    const eventSourceOld = calendar.getEventSources();
    eventSourceOld.forEach(function (eventSource) {
        eventSource.remove();
    });
    const eventSourceNew = CalendarViewService.getEventSource(recordFiltered, calendarView, appId, isPublicListRecord);
    calendar.addEventSource(eventSourceNew);
}


export function setFilterableFields(orderOfField, showFields) {
    const filterField = Array.prototype.slice.call(document.getElementsByClassName('filter-field'));
    filterField.forEach(function (field, index) {
        const selectTag = field.getElementsByTagName('select')[0];

        if (selectTag.children.length < 1) {
            selectTag.innerHTML = '<option></option>';
            orderOfField.forEach(function (field) {
                if (field && field.code && showFields[field.code]) {
                    selectTag.innerHTML += '<option value="' + field.code + '">' + showFields[field.code]['label'] + '</option>';
                }
            });
        }
    });
}

