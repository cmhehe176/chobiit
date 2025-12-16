import LocaleService from "chobiit-common/src/application/locale-service";
import { SessionStorageWrapper } from "../infrastructure/session-storage-wrapper";
import { ListViewSelectorSelectionItem } from "../domain/list-view-selector-selection-item";
import { ListViewSelectorErrorChecker } from "../domain/list-view-selector-error-checker";
const localeService = LocaleService.getInstance("client");

/**
 * cssをstyle属性に直書きしているので、良くはない
 */
export class ListViewSelector {

	static render (elementId: string): void {
		/**
		 * プラグイン設定画面で一覧ビューの設定をしていない時、
		 * セッションストレージ appSetting の中に views が存在しないため、処理を終了させる
		 */
		const viewsInAppSetting = SessionStorageWrapper.getViews();
		if (viewsInAppSetting === undefined) {
			console.log("ListView is not set.");
			return;
		}

		const targetElement = document.getElementById(elementId);
		if (targetElement === null) {
			console.error("targetElement is null");
			throw new Error("targetElement is null");
		}

		const surroundAllDiv = this.createSurroundAllDiv();
		const listViewSelectorTitle = this.createListViewSelectorTitle();
		const listViewSelector = this.createListViewSelector();

		if (listViewSelector.options.length === 0) {
			console.error("ListView setting is none.");
			throw new Error("ListView setting is none.");
		}

		if (listViewSelector.options.length === 1) {
			console.log("ListView setting is one.");
			ListViewSelectorErrorChecker.check();
			return;
		}

		const divOnListViewSelector = this.createDivOnListViewSelector();
		divOnListViewSelector.appendChild(listViewSelector);
		surroundAllDiv.appendChild(listViewSelectorTitle);
		surroundAllDiv.appendChild(divOnListViewSelector);
		targetElement.prepend(surroundAllDiv);

		ListViewSelectorErrorChecker.check();
	};

	static createListViewSelector() : HTMLSelectElement{
		const listViewSelector = document.createElement("select");
		listViewSelector.setAttribute("id", "list-view-selector");
		listViewSelector.setAttribute("class", "form-control input-filter-field");
		ListViewSelectorSelectionItem.set(listViewSelector);
		ListViewSelectorSelectionItem.addChangeEvent(listViewSelector);
		return listViewSelector;
	}

	static createListViewSelectorTitle() : HTMLHeadingElement{
		const listViewSelectorTitle = document.createElement("h4");
		listViewSelectorTitle.innerText = localeService.translate(
			"common",
			"displaying-list",
		);
		listViewSelectorTitle.setAttribute(
			"style",
			"padding-bottom: 7px; font-weight: 600 ; color: #212529",
		);
		return listViewSelectorTitle;
	}

	static createDivOnListViewSelector() : HTMLDivElement{
		const divOnListViewSelector = document.createElement("div");
		divOnListViewSelector.setAttribute("class", "col-sm-12 col-md-5");
		divOnListViewSelector.setAttribute("style", "padding-left: 0");
		return divOnListViewSelector;
	}

	static createSurroundAllDiv() : HTMLDivElement{
		const surroundAllDiv = document.createElement("div");
		surroundAllDiv.setAttribute(
			"class",
			"border-2-ctblack padding-default",
		);
		return surroundAllDiv;
	}
}
