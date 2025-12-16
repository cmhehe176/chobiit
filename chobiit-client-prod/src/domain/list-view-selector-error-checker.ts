import { KintoneListViewUtil } from "chobiit-common/src/infrastructure/kintone-list-view-util";
import { SessionStorageWrapper } from "../infrastructure/session-storage-wrapper";
import { UrlQueryParameterWrapper } from "../infrastructure/url-query-parameter-wrapper";
import { View } from "chobiit-common/src/types/chobiit";

export class ListViewSelectorErrorChecker {
	static check(): void {
		const queryParameterViewId = UrlQueryParameterWrapper.getViewId();
		const views = SessionStorageWrapper.getViews();
		if (views === undefined) {
			console.log("ListView is not set.");
			return;
		}
		const { allView, removedAllView } =
			KintoneListViewUtil.splitViewData(views);

		if (queryParameterViewId === "") {
			console.log(
				"Not necessary check queryParameterViewId because queryParameterViewId is empty.",
			);
			return;
		}

		if (queryParameterViewId === "all") {
			if (allView === undefined) {
				throw new Error("target-list-view-not-found");
			}
		} else if (removedAllView !== undefined) {
			const foundViewData = removedAllView.find(
				(view: View) => view.id === queryParameterViewId,
			);
			if (foundViewData === undefined) {
				throw new Error("target-list-view-not-found");
			}
		}
	}
}
