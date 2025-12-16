import { ChobiitFilterCondition } from "./chobiit-filter-condition";
import { DateTimeControlWrapper } from "../infrastructure/date-time-control-wrapper";

export class DateTimeFilterCondition extends ChobiitFilterCondition {
    constructor(filterCode,filterOperator,filterValue) {
        super(filterCode,filterOperator,filterValue)
    }

    protected mapOperator():string {
        const mapping = new Map([
            ['dt_e', '='],
            ['dt_ne', '!='],
            ['dt_gte', '>='],
            ['dt_lte', '<='],
            ['dt_gt', '>'],
            ['dt_lt', '<'],
        ])

        const kintoneOperator = mapping.get(this.filterOperator);

        if(kintoneOperator === undefined) throw new Error(`No operator matched ${this.filterOperator}`);

        return kintoneOperator;
    }

    private convertLocalTimeToUtc(filterValue:string | string[] | Date):string {
        if(filterValue === '') return ''

        /**
         * kintone は ISO8601形式で保存されているため、変換する必要がある
         */
        if(DateTimeControlWrapper.getTimeZone() === 'Asia/Tokyo') {
            return DateTimeControlWrapper.convertJSTtoUTC(this.escapeKintoneQueryParam(filterValue))
        }else{
            return DateTimeControlWrapper.convertToUTC(this.escapeKintoneQueryParam(filterValue))
        }
    }

    toKintoneQuery():string {
        return `${this.filterCode} ${this.mapOperator()} "${this.convertLocalTimeToUtc(this.filterValue)}"`
    }
}