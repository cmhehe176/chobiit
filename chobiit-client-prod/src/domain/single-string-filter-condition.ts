import { ChobiitFilterCondition } from "./chobiit-filter-condition";

export class SingleStringFilterCondition extends ChobiitFilterCondition {
    constructor(filterCode,filterOperator,filterValue) {
        super(filterCode,filterOperator,filterValue)
    }

    protected mapOperator() {
        const mapping = new Map([
            ['s_e', '='],
            ['s_ne', '!='],
            ['s_gte', '>='],
            ['s_lte', '<='],
            ['s_contain', 'like'],
            ['s_notContain', 'not like']
        ])

        const kintoneOperator = mapping.get(this.filterOperator);

        if(kintoneOperator === undefined) throw new Error(`No operator matched ${this.filterOperator}`);

        return kintoneOperator;
    }

    toKintoneQuery() {
        return `${this.filterCode} ${this.mapOperator()} "${this.escapeKintoneQueryParam(this.filterValue)}"`
    }
}