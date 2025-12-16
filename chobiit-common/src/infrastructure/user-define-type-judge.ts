import { CalendarView, ChobitoneApp } from "../types/chobiit";
import { ViewForResponse } from "@kintone/rest-api-client/esm/src/client/types/app/view";

export class UserDefineTypeJudge {
    static isViewForResponse(recordCond1:ChobitoneApp["recordCond1"]): recordCond1 is ViewForResponse {
		return recordCond1 !== undefined && recordCond1 !== false
	}

    static isCalendarView(calendarView:ChobitoneApp["calendarView"]): calendarView is CalendarView {
        return calendarView !== undefined && calendarView !== false
    }
}