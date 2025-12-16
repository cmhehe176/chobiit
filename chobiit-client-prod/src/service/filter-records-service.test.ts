import FilterRecordsService from './filter-records-service';

beforeAll(() => {
    process.env.CHOBIIT_LANG = 'ja';
});

test("If the field type is 'RECORD_NUMBER', 'NUMBER', or 'CALC', return the expected object", () => {
    const fieldType1 = "RECORD_NUMBER";
    const fieldType2 = "NUMBER";
    const fieldType3 = "CALC";
    
    const expected = {
        s_e: '= (等しい)',
        s_ne: '&#8800; (等しくない)',
        s_gte: '&#8805; (以上)',
        s_lte: '&#8804; (以下)',
    };
    
    expect(FilterRecordsService.getFilterTypeOptions(fieldType1)).toEqual(expected);
    expect(FilterRecordsService.getFilterTypeOptions(fieldType2)).toEqual(expected);
    expect(FilterRecordsService.getFilterTypeOptions(fieldType3)).toEqual(expected);
});

test("If the field type is 'SINGLE_LINE_TEXT' or 'LINK', return the expected object", () => {
    const fieldType1 = "SINGLE_LINE_TEXT";
    const fieldType2 = "LINK";
    
    const expected = {
        s_contain: '次のキーワードを含む',
        s_notContain: '次のキーワードを含まない',
        s_e: "= (等しい)",
        s_ne: "&#8800; (等しくない)"
    };
    
    expect(FilterRecordsService.getFilterTypeOptions(fieldType1)).toEqual(expected);
    expect(FilterRecordsService.getFilterTypeOptions(fieldType2)).toEqual(expected);
});

test("If the field type is 'MULTI_LINE_TEXT' or 'FILE', return the expected object", () => {
    const fieldType1 = "MULTI_LINE_TEXT";
    const fieldType2 = "FILE";
    
    const expected = {
        s_contain: '次のキーワードを含む',
        s_notContain: '次のキーワードを含まない',
    };
    
    expect(FilterRecordsService.getFilterTypeOptions(fieldType1)).toEqual(expected);
    expect(FilterRecordsService.getFilterTypeOptions(fieldType2)).toEqual(expected);
});

test("If the field type is 'CHECK_BOX' or 'MULTI_SELECT', return the expected object", () => {
    const fieldType1 = "CHECK_BOX";
    const fieldType2 = "MULTI_SELECT";
    
    const expected = {
        s_mutilInclude: '次のいずれかを含む',
        s_notMutilInclude: '次のいずれも含まない',
    };
    
    expect(FilterRecordsService.getFilterTypeOptions(fieldType1)).toEqual(expected);
    expect(FilterRecordsService.getFilterTypeOptions(fieldType2)).toEqual(expected);
});

test("If the field type is 'STATUS', or 'RADIO_BUTTON', or 'DROP_DOWN', return the expected object", () => {
    const fieldType1 = "STATUS";
    const fieldType2 = "RADIO_BUTTON";
    const fieldType3 = "DROP_DOWN";
    
    const expected = {
        s_include: '次のいずれかを含む',
        s_notInclude: '次のいずれも含まない',
    };
    
    expect(FilterRecordsService.getFilterTypeOptions(fieldType1)).toEqual(expected);
    expect(FilterRecordsService.getFilterTypeOptions(fieldType2)).toEqual(expected);
    expect(FilterRecordsService.getFilterTypeOptions(fieldType3)).toEqual(expected);
});

test("If the field type is 'CREATED_TIME', 'UPDATED_TIME', or 'DATETIME', return the expected object", () => {
    const fieldType1 = "CREATED_TIME";
    const fieldType2 = "UPDATED_TIME";
    const fieldType3 = "DATETIME";
    
    const expected = {
        dt_e: '= (等しい)',
        dt_ne: '&#8800; (等しくない)',
        dt_gte: '&#8805; (以降)',
        dt_lte: '&#8804; (以前)',
        dt_gt: '&#62; (より後)',
        dt_lt: '&#60; (より前)',
    };
    
    expect(FilterRecordsService.getFilterTypeOptions(fieldType1)).toEqual(expected);
    expect(FilterRecordsService.getFilterTypeOptions(fieldType2)).toEqual(expected);
    expect(FilterRecordsService.getFilterTypeOptions(fieldType3)).toEqual(expected);
});

test("If the field type is 'DATE', return the expected object", () => {
    const fieldType = "DATE";
    
    const expected = {
        d_e: '= (等しい)',
        d_ne: '&#8800; (等しくない)',
        d_gte: '&#8805; (以降)',
        d_lte: '&#8804; (以前)',
        d_gt: '&#62; (より後)',
        d_lt: '&#60; (より前)',
    };
    
    expect(FilterRecordsService.getFilterTypeOptions(fieldType)).toEqual(expected);
});

test("If the field type is 'TIME', return the expected object", () => {
    const fieldType = "TIME";
    
    const expected = {
        t_e: '= (等しい)',
        t_ne: '&#8800; (等しくない)',
        t_gte: '&#8805; (以降)',
        t_lte: '&#8804; (以前)',
        t_gt: '&#62; (より後)',
        t_lt: '&#60; (より前)',
    };
    
    expect(FilterRecordsService.getFilterTypeOptions(fieldType)).toEqual(expected);
});

test("If the field type is unknown, return null", () => {
    const fieldType = "UNKNOWN";
    expect(FilterRecordsService.getFilterTypeOptions(fieldType)).toBeNull();
});
