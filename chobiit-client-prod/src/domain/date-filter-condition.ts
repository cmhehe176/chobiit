import { ChobiitFilterCondition } from "./chobiit-filter-condition";

export class DateFilterCondition extends ChobiitFilterCondition {

    constructor(filterCode:string,filterOperator:string,filterValue:string) {
        super(filterCode,filterOperator,filterValue)
    }
    protected mapOperator():string {
        const mapping = new Map([
            ['d_e', '='],
            ['d_ne', '!='],
            ['d_gte', '>='],
            ['d_lte', '<='],
            ['d_gt', '>'],
            ['d_lt', '<'],
        ])

        const kintoneOperator = mapping.get(this.filterOperator);

        if(kintoneOperator === undefined) throw new Error(`No operator matched ${this.filterOperator}`);

        return kintoneOperator;
    }   

    toKintoneQuery():string {
        return `${this.filterCode} ${this.mapOperator()} "${this.escapeKintoneQueryParam(this.filterValue)}"`
    }
}