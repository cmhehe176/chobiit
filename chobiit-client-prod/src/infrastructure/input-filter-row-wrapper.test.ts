import { InputFilterRowWrapper } from "./input-filter-row-wrapper";

describe("InputFilterRowWrapper", () => {

    beforeEach(() => {
        document.body.innerHTML = ` 
        <div class="filter-row"> 
            <div class="filter-content col-11">
                <select class="form-control input-filter-field">
                    <option></option>
                    <option value="単価">単価</option>
                    <option value="ユーザー数">ユーザー数</option>
                    <option value="文字列__1行_">レコード作成者</option>
                    <option value="テスト">テスト</option>
                    <option value="ステータス">ステータス</option>
                    <option value="先方担当者" selected>先方担当者</option>
                </select>
            </div>
            <div class="filter-type col-sm-12 col-md-2">
                <select class="form-control input-filter-type">
                    <option value="s_include">次のいずれかを含む</option>
                    <option value="s_notInclude" selected>次のいずれも含まない</option>
                </select>
            </div>
            <div class="filter-value col-sm-12 col-md-7">
                <select multiple="" class="form-control input-filter-value">
                    <option value="">--</option>
                    <option value="ラジオ1">ラジオ1</option>
                    <option value="ラジオ2" selected>ラジオ2</option>
                </select>
            </div>
        </div>
        <div class="filter-row"> 
            <div class="filter-content col-11">
                <select class="form-control input-filter-field">
                    <option></option>
                    <option value="単価">単価</option>
                    <option value="ユーザー数">ユーザー数</option>
                    <option value="文字列__1行_">レコード作成者</option>
                    <option value="テスト">テスト</option>
                    <option value="ステータス">ステータス</option>
                    <option value="先方担当者" selected>先方担当者</option>
                </select>
            </div>
            <div class="filter-type col-sm-12 col-md-2">
                <select class="form-control input-filter-type">
                    <option value="s_include">次のいずれかを含む</option>
                    <option value="s_notInclude" selected>次のいずれも含まない</option>
                </select>
            </div>
            <div class="filter-value col-sm-12 col-md-7">
                <select multiple="" class="form-control input-filter-value">
                    <option value="">--</option>
                    <option value="ラジオ1">ラジオ1</option>
                    <option value="ラジオ2" selected>ラジオ2</option>
                </select>
            </div>
        </div>`
    })

    test("get filter row content", () => {
        const firstIndex = 0;
        const item = document.getElementsByClassName("filter-row")[firstIndex]
        const inputFilterField = item.querySelector<HTMLInputElement>('.input-filter-field')
        const inputFilterType = item.querySelector<HTMLInputElement>('.input-filter-type')
        const inputFilterValue = item.querySelector<HTMLInputElement>('.input-filter-value')
        if(inputFilterField === null || inputFilterType === null || inputFilterValue === null) return
        expect(inputFilterField.value).toBe('先方担当者');
        expect(inputFilterType.value).toBe('s_notInclude');
        expect(inputFilterValue.value).toBe('ラジオ2');
        expect(inputFilterValue.type).toBe('select-multiple');
        expect(inputFilterValue.getAttribute("class")).toBe('form-control input-filter-value');
    })

    test("first line except is none", () => {
        InputFilterRowWrapper.resetFilterRow();
        expect(document.getElementsByClassName("filter-row").length).toBe(1);
    })

    test("if initial row is multiSelector when filter reset" , () => {
        InputFilterRowWrapper.resetFilterRow();
        const firstIndex = 0;
        const item = document.getElementsByClassName("filter-row")[firstIndex]
        const inputFilterField = item.querySelector<HTMLInputElement>('.input-filter-field')
        const inputFilterType = item.querySelector<HTMLInputElement>('.input-filter-type')
        const inputFilterValue = item.querySelector<HTMLInputElement>('.input-filter-value')
        if(inputFilterField === null || inputFilterType === null || inputFilterValue === null) return  
        expect(inputFilterField.value).toBe('');
        expect(inputFilterType.value).toBe('');
        expect(inputFilterValue.value).toBe('');
        expect(inputFilterValue.type).toBe('text');
        expect(inputFilterValue.getAttribute("class")).toBe('form-control input-filter-value');
    })

    test("initialize filter value element", () => {
        const initializeFilterValue = document.createElement("input")
        initializeFilterValue.setAttribute("type","text")
        initializeFilterValue.setAttribute("class", "form-control input-filter-value");

        InputFilterRowWrapper.initializeFilterValueElement(document.getElementsByClassName("filter-row")[0]);

        const filterContent = document.getElementsByClassName("filter-row")[0]
        const inputFilterValue = filterContent.querySelector<HTMLInputElement>('.input-filter-value')
        
        expect(initializeFilterValue).toEqual(inputFilterValue)
    })
})