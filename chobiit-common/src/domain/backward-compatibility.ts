import { UserDefineTypeJudge } from "../infrastructure/user-define-type-judge";
import { AllView, ChobitoneApp, ChobitoneAppViews, View } from "../types/chobiit";

export class BackwardCompatibility {
    static hasViewInChobitoneApp(appInfo: ChobitoneApp) {
        if(appInfo.views === undefined){
			if(appInfo.recordCond1 === undefined) {
				console.error("recordCond1 not exists")
				throw new Error("List view is not set correctly,There may be data inconsistencies");
			}
			return false
		}else{
			return true
		}
    }

	static convertToListViewData(recordCond1:ChobitoneApp["recordCond1"], calendarView:ChobitoneApp["calendarView"], views:ChobitoneAppViews): ChobitoneAppViews {
		const isViews = views !== undefined 
		const isRecordCond1 = recordCond1 !== undefined
		const isCalendarView = calendarView !== undefined
		if(isRecordCond1 && isCalendarView){
			if(UserDefineTypeJudge.isViewForResponse(recordCond1)){ 
				const view:View = JSON.parse(JSON.stringify(recordCond1))
				if(UserDefineTypeJudge.isCalendarView(calendarView)){
					view.calendarView = calendarView
				}
				return [view]
			}else{
				const allView:AllView = {id: "all"}
				if(UserDefineTypeJudge.isCalendarView(calendarView)){
					allView.calendarView = calendarView
				}
				return [allView]
			}
		}else{
			if(isViews !== undefined){
				return views
			}else{
				return []
			}
		}
	}

}