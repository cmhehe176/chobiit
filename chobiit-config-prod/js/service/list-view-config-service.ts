import { ViewForResponse } from "@kintone/rest-api-client/lib/src/client/types";
import { AllView, View } from "chobiit-common/src/types/chobiit";

export class ListViewConfigService {
	static replaceWithLatestViews(
		currentSettingViews: (AllView | View)[],
		latestViews: ViewForResponse,
	) {
		const updatedViews = Object.values(latestViews).filter((latestView) => {
			const latestViewId = latestView.id;
			const isConfiguredView = currentSettingViews
				.map((settingView) => settingView.id)
				.includes(latestViewId);
			return isConfiguredView;
		});
		updatedViews.forEach((updatedCurrentView) => {
			const foundOldSettingView = currentSettingViews.find(
				(settingView) => settingView.id === updatedCurrentView.id,
			);
			if (foundOldSettingView === undefined) return;
			const isCalenderView = foundOldSettingView.calendarView !== undefined;
			if (isCalenderView) {
				updatedCurrentView.calendarView = foundOldSettingView.calendarView;
			}
		});
		const oldSettingAllView = currentSettingViews.find(
			(settingView) => settingView.id === "all",
		);
		if (oldSettingAllView !== undefined) {
			updatedViews.push(oldSettingAllView);
		}
		return updatedViews;
	}
}
