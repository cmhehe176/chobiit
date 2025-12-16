import { KintoneListViewUtil } from "chobiit-common/src/infrastructure/kintone-list-view-util";
import { SessionStorageWrapper } from "../infrastructure/session-storage-wrapper";
import { UrlQueryParameterWrapper } from "../infrastructure/url-query-parameter-wrapper";
import { AllView, View } from "chobiit-common/src/types/chobiit";
import LocaleService from "chobiit-common/src/application/locale-service";
const localeService = LocaleService.getInstance("client");

export class ListViewSelectorSelectionItem {
	static addChangeEvent(listViewSelector: HTMLSelectElement): void {
		listViewSelector.addEventListener("change", () => {
			const loader = document.getElementById("loader");
			if (loader !== null) {
				loader.style.display = "block";
			}
			const currentViewId = listViewSelector.value;
			const url = UrlQueryParameterWrapper.getUrlWithQueryParameter(
				"viewId",
				currentViewId,
			);
			location.href = url.toString();
		});
	}

	static set(listViewSelector: HTMLSelectElement): void {
		const currentViewId = this.getCurrentViewId();
		const views = SessionStorageWrapper.getViews();
		const sortedViews = KintoneListViewUtil.getSortedViews(views);

		sortedViews.forEach((view: AllView | View) => {
			const option = document.createElement("option");
			option.setAttribute("value", view.id);
			if (view.id === "all") {
				option.innerText = localeService.translate(
					"common",
					"all-list-view-name",
				);
			} else if ("name" in view) {
				option.innerText = view.name;
			}
			if (view.id === currentViewId) {
				option.selected = true;
			}
			listViewSelector.appendChild(option);
		});
	}

	private static getCurrentViewId(): string {
		const views = SessionStorageWrapper.getViews();
		const queryParameterViewId = UrlQueryParameterWrapper.getViewId();

		if (queryParameterViewId === "") {
			const defaultView = KintoneListViewUtil.getDefaultView(views);
			return defaultView.id;
		} else {
			return queryParameterViewId;
		}
	}
}
