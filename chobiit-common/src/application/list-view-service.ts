import { ChobitoneApp, FormatListViewData } from "../types/chobiit";
import { BackwardCompatibility } from "../domain/backward-compatibility";
import { ListViewData } from "../domain/list-view-data";

export class ListViewService {
	static getCurrentListView = (
		appInfo: ChobitoneApp,
		targetViewId: string | undefined,
	) : FormatListViewData => {
		if(BackwardCompatibility.hasViewInChobitoneApp(appInfo)) {
			return ListViewData.getListView(targetViewId, appInfo);
		}else{
			const oldListViewData = {
				recordCond1: appInfo.recordCond1,
				calendarView: appInfo.calendarView,
			};
			return oldListViewData ;
		}		
	}
}
