import { ChobiitFilterCondition } from "./chobiit-filter-condition";

export class MultipleStringFilterCondition extends ChobiitFilterCondition {
    constructor(filterCode,filterOperator,filterValue) {
        super(filterCode,filterOperator,filterValue)
    }

    protected mapOperator():string {
        const mapping = new Map([
            ['s_include', 'in'],
            ['s_notInclude', 'not in'],
            ['s_mutilInclude', 'in'],
            ['s_notMutilInclude', 'not in'],
        ])

        const kintoneOperator = mapping.get(this.filterOperator);

        if(kintoneOperator === undefined) throw new Error(`No operator matched ${this.filterOperator}`);

        return kintoneOperator;
    }

    toKintoneQuery():string {
        if(Array.isArray(this.filterValue)) {
            const filterValues = `(${this.filterValue.map(value => `"${this.escapeKintoneQueryParam(value)}"`).join(',')})`
            return `${this.filterCode} ${this.mapOperator()} ${filterValues}`
        }

        if(typeof this.filterValue === 'string'){
            return `${this.filterCode} ${this.mapOperator()} ("${this.escapeKintoneQueryParam(this.filterValue)}")`
        }

        throw new Error(`MultipleString need type at string or object but MultipleString is not type at string or object`)
    }

}