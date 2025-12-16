import { KintoneListViewUtil } from "../infrastructure/kintone-list-view-util";
import {
	AllView,
	ChobitoneApp,
	FormatListViewData,
	View,
} from "../types/chobiit";

export class ListViewData {
	static getListView(
		targetViewId: string | undefined,
		chobitoneApp: ChobitoneApp,
	): FormatListViewData {
		if (
			targetViewId === undefined ||
			targetViewId === "" ||
			targetViewId === null
		) {
			return this.getDefaultListView(chobitoneApp);
		} else {
			return this.getTargetListView(targetViewId, chobitoneApp);
		}
	}

	private static formatReturnViewData(
		targetView: AllView | View,
	): FormatListViewData {
		const isCalendarView = targetView.calendarView !== undefined;
		const isAllView = targetView.id === "all";
		if (isAllView && isCalendarView) {
			return { recordCond1: false, calendarView: targetView.calendarView };
		} else if (isAllView && !isCalendarView) {
			return { recordCond1: false, calendarView: false };
		} else if (!isAllView && isCalendarView) {
			return { recordCond1: targetView, calendarView: targetView.calendarView };
		} else if (!isAllView && !isCalendarView) {
			return { recordCond1: targetView, calendarView: false };
		} else {
			throw new Error(
				"List view is not set correctly,There may be data inconsistencies",
			);
		}
	}

	private static getDefaultListView(
		chobitoneApp: ChobitoneApp,
	): FormatListViewData {
		const defaultView = KintoneListViewUtil.getDefaultView(chobitoneApp.views);
		return this.formatReturnViewData(defaultView);
	}

	private static getTargetListView(
		targetViewId: string,
		chobitoneApp: ChobitoneApp,
	): FormatListViewData {
		const { allView, removedAllView } = KintoneListViewUtil.splitViewData(
			chobitoneApp.views,
		);

		if (targetViewId === "all") {
			if (allView === undefined) {
				throw new Error(
					"All view list is not setting in plugin setting display but request target is all view.",
				);
			}
			return this.formatReturnViewData(allView);
		}

		if (removedAllView === undefined) {
			throw new Error(
				"List view is not set correctly,There may be data inconsistencies",
			);
		}

		const selectedView = removedAllView.find(
			(view: View) => view.id === targetViewId,
		);

		if (selectedView === undefined) {
			throw new Error("Target view is not found");
		}

		return this.formatReturnViewData(selectedView);
	}
}
