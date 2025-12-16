import moment from "moment";
import CalendarViewService from "./calendar-view-service";
import { addOneSecondToISODate } from "./calendar-view-service";

describe("Test `CalendarViewService.getCalendarMonth`", () => {
    test('If `CHOBIIT_LANG` is `ja`, return `YYYY年M月`', () => {
        process.env.CHOBIIT_LANG = "ja";

        const momentDate = moment("2023-07-25");
        expect(CalendarViewService.getCalendarMonth(momentDate)).toBe("2023年7月");
    });
    
    test('If `CHOBIIT_LANG` is `en`, return `MMMM`', () => {
        process.env.CHOBIIT_LANG = "en";

        const momentDate1 = moment("2023-07-25");
        expect(CalendarViewService.getCalendarMonth(momentDate1)).toBe("July");
        
        const momentDate2 = moment("2023-12-31");
        expect(CalendarViewService.getCalendarMonth(momentDate2)).toBe("December");
    });
});

describe("Test `addOneSecondToISODate()`", () => {
    test('ISO 8601形式の日付に1秒追加される', () => {
        const isoDateString = '2024-09-13T12:00:00Z';
        const result = addOneSecondToISODate(isoDateString);
        expect(result).toBe('2024-09-13T12:00:01Z');
    });


    test('ミリ秒が除外される', () => {
        const isoDateString = '2024-09-13T12:00:00.123Z';
        const result = addOneSecondToISODate(isoDateString);
        expect(result).toBe('2024-09-13T12:00:01Z');
    });

})
