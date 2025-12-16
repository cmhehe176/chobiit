export abstract class ChobiitFilterCondition {
    protected filterCode : string
    protected filterOperator : string
    protected filterValue : string | string[] | Date
    constructor(filterCode:string,filterOperator:string,filterValue:string) {
        this.filterCode = filterCode
        this.filterOperator = filterOperator
        this.filterValue = filterValue
    }

    protected abstract mapOperator():string 

    abstract toKintoneQuery():string 

    protected escapeKintoneQueryParam(param:string | string[] | Date) {
        return JSON.stringify(param).replace(/^"/, "").replace(/"$/, "")
    }
}