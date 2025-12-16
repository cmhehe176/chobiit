import { ChobiitFilterCondition } from "./chobiit-filter-condition";
import { DateTimeControlWrapper } from "../infrastructure/date-time-control-wrapper";

export class TimeFilterCondition extends ChobiitFilterCondition {
    
    constructor(filterCode:string,filterOperator:string,filterValue:string) {
        super(filterCode,filterOperator,filterValue)
    }

    protected mapOperator():string {
        const mapping = new Map([
            ['t_e', '='],
            ['t_ne', '!='],
            ['t_gte', '>='],
            ['t_lte', '<='],
            ['t_gt', '>'],
            ['t_lt', '<'],
        ])

        const kintoneOperator = mapping.get(this.filterOperator);

        if(kintoneOperator === undefined) throw new Error(`No operator matched ${this.filterOperator}`);

        return kintoneOperator;
    }   

    toKintoneQuery():string {
        const escapedFilterValue = this.escapeKintoneQueryParam(this.filterValue)
        if(escapedFilterValue === '') return ''

        return `${this.filterCode} ${this.mapOperator()} "${DateTimeControlWrapper.convert24HourClock(escapedFilterValue)}"`
    }
}