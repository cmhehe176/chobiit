interface GetFilterRowContent {
    inputFilterField:HTMLInputElement | null,
    inputFilterType:HTMLInputElement | null,
    inputFilterValue:HTMLInputElement | null
}

export class InputFilterRowWrapper {
    static resetFilterRow():void {
        const firstIndex = 0;
        Array.from(document.getElementsByClassName("filter-row")).slice().reverse().forEach((item,index) => {
            if(index !== firstIndex) {
                item.remove();
            }else{
                const {inputFilterField,inputFilterType,inputFilterValue} = this.getFilterRowContent(item)
                if(inputFilterField === null || inputFilterType === null || inputFilterValue === null){ 
                    console.debug(`${inputFilterField}:inputFilterField`)
                    console.debug(`${inputFilterType}:inputFilterType`)
                    console.debug(`${inputFilterValue}:inputFilterValue`)
                    throw new Error("Not found element of className that .input-filter-field or .input-filter-type or .input-filter-value")
                }
                const inputFilterBlankValue = document.createElement("input")
                inputFilterBlankValue.setAttribute("class", "form-control input-filter-value");
                inputFilterField.value = ''; 
                inputFilterType.value = '';
                inputFilterValue.replaceWith(inputFilterBlankValue);
            }
        })
    }

    static initializeFilterValueElement(filterContent:Element){
        if(filterContent === null) {
            console.error(`filterContent is null`)
            throw new Error("filterContent is null")
        }
        const inputFilterValue = filterContent.querySelector<HTMLInputElement>('.input-filter-value')
        const initializeInputElement = document.createElement("input")
        initializeInputElement.setAttribute("type","text")
        initializeInputElement.setAttribute("class", "form-control input-filter-value");
        inputFilterValue?.replaceWith(initializeInputElement)
    }

    private static getFilterRowContent(item:Element):GetFilterRowContent {
        const inputFilterField = item.querySelector<HTMLInputElement>('.input-filter-field')
        const inputFilterType = item.querySelector<HTMLInputElement>('.input-filter-type')
        const inputFilterValue = item.querySelector<HTMLInputElement>('.input-filter-value')

        return {inputFilterField,inputFilterType,inputFilterValue}
    }
}