import { ChobiitFilterCondition } from "./chobiit-filter-condition"

export class ChobiitFilterConditionList {
    private chobiitFilterConditionList : ChobiitFilterCondition[]
    private filterCompositionKeyword: string
    constructor(chobiitFilterConditionList,isMatchAll:boolean) {
        this.chobiitFilterConditionList = chobiitFilterConditionList
        this.filterCompositionKeyword = isMatchAll ? 'and' : 'or'
    }

    toKintoneQuery() {
        return this.chobiitFilterConditionList.map(chobiitFilterCondition => chobiitFilterCondition.toKintoneQuery()).join(` ${this.filterCompositionKeyword} `)
    }
}