/**
 * # NOTE
 * 
 * サービスを乱用したくはないが、一度、レコード一覧画面の
 * 絞り込み機能に関する要素を切り出すためにサービスを実装してみる。
 * 
 * コードが整理できてくれば、domain にオブジェクトを定義して整理していく。
 */

import LocaleService from "chobiit-common/src/application/locale-service";


/**
 * レコード一覧画面の絞り込み機能に関する要素を切り出すためにサービス
 */
export default class FilterRecordsService {
    
    /**
     * 画面に絞り込み機能を表示する際の各選択肢のフィールドタイプごとのオペレータの選択肢。
     *
     * @param fieldType
     * @returns 
     */
    static getFilterTypeOptions(fieldType: string): Record<string, string> | null {
        const localeService = LocaleService.getInstance("client");
        switch (fieldType) {
            case 'RECORD_NUMBER':
            case 'NUMBER':
            case 'CALC':
                return {
                    's_e': localeService.translate('info', 'filter-operator.equal'),
                    's_ne': localeService.translate('info', 'filter-operator.not-equal'),
                    's_gte': localeService.translate('info', 'filter-operator.greater-or-equal'),
                    's_lte': localeService.translate('info', 'filter-operator.less-or-equal'),
                };

            case 'SINGLE_LINE_TEXT':
            case 'LINK':
                return {
                    's_contain': localeService.translate('info', 'filter-operator.contain'),
                    's_notContain': localeService.translate('info', 'filter-operator.not-contain'),
                    's_e': localeService.translate('info', 'filter-operator.equal'),
                    's_ne': localeService.translate('info', 'filter-operator.not-equal'),
                };

            case 'MULTI_LINE_TEXT':
            case 'FILE':
                return {
                    's_contain': localeService.translate('info', 'filter-operator.contain'),
                    's_notContain': localeService.translate('info', 'filter-operator.not-contain'),
                };

            case 'CHECK_BOX':
            case 'MULTI_SELECT':
                return {
                    's_mutilInclude': localeService.translate('info', 'filter-operator.mutil-include'),
                    's_notMutilInclude': localeService.translate('info', 'filter-operator.not-mutil-include'),
                };

            case 'STATUS':
            case 'RADIO_BUTTON':
            case 'DROP_DOWN':
                return {
                    's_include': localeService.translate('info', 'filter-operator.mutil-include'),
                    's_notInclude': localeService.translate('info', 'filter-operator.not-mutil-include'),
                };

            case 'CREATED_TIME':
            case 'UPDATED_TIME':
            case 'DATETIME':
                return {
                    'dt_e': localeService.translate('info', 'filter-operator.equal'),
                    'dt_ne': localeService.translate('info', 'filter-operator.not-equal'),
                    'dt_gte': localeService.translate('info', 'filter-operator.datetime-greater-or-equal'),
                    'dt_lte': localeService.translate('info', 'filter-operator.datetime-less-or-equal'),
                    'dt_gt': localeService.translate('info', 'filter-operator.datetime-greater-than'),
                    'dt_lt': localeService.translate('info', 'filter-operator.datetime-less-than'),
                };

            case 'DATE':
                return {
                    'd_e': localeService.translate('info', 'filter-operator.equal'),
                    'd_ne': localeService.translate('info', 'filter-operator.not-equal'),
                    'd_gte': localeService.translate('info', 'filter-operator.datetime-greater-or-equal'),
                    'd_lte': localeService.translate('info', 'filter-operator.datetime-less-or-equal'),
                    'd_gt': localeService.translate('info', 'filter-operator.datetime-greater-than'),
                    'd_lt': localeService.translate('info', 'filter-operator.datetime-less-than'),
                };

            case 'TIME':
                return {
                    't_e': localeService.translate('info', 'filter-operator.equal'),
                    't_ne': localeService.translate('info', 'filter-operator.not-equal'),
                    't_gte': localeService.translate('info', 'filter-operator.datetime-greater-or-equal'),
                    't_lte': localeService.translate('info', 'filter-operator.datetime-less-or-equal'),
                    't_gt': localeService.translate('info', 'filter-operator.datetime-greater-than'),
                    't_lt': localeService.translate('info', 'filter-operator.datetime-less-than'),
                };

            default:
                return null;
        }
    }

    /**
     * 絞り込み機能で未入力可能なフィールドタイプのオペレータ
     */    
    static emptiableValueOperators = [
        "s_e",      // 文字列系の等しい(=)
        "s_ne",      // 文字列系の等しくない(!=)
        "dt_e",     // 日時の等しい(=)
        "dt_ne",      // 日時の等しくない(!=)
        "d_e",     // 日付の等しい(=)
        "d_ne",      // 日付の等しくない(!=)
        "t_e",     // 時刻の等しい(=)
        "t_ne"      // 時刻の等しくない(!=)
    ] as const;
}