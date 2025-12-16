import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import {
	AllView,
	ChobitoneApp,
	ChobitoneAppViews,
	View,
} from "chobiit-common/src/types/chobiit";
import LocaleService from "chobiit-common/src/application/locale-service";
import { KintoneListViewUtil } from "chobiit-common/src/infrastructure/kintone-list-view-util";
const localeService = LocaleService.getInstance("config");
const translateInfo = (key, option?) =>
	localeService.translate("info", key, option);
const translateCommon = (key, option?) =>
	localeService.translate("common", key, option);
const translateError = (key, option?) =>
	localeService.translate("error", key, option);
const { ADD_ROW_BUTTON, REMOVE_ROW_BUTTON } = require("../components/button");
import { $ } from "../components/jquery";
import {
	makeCalendarOption,
	makeCalendarColorOption,
	checkDuplicate,
} from "../config";
import { ViewSettingsStore } from "../view-settings-store";
import { BackwardCompatibility } from "chobiit-common/src/domain/backward-compatibility";

/**
 * 汚いコードになっているがリファクタリングする時間がないのでコメントを極力残した。
 * TODO : 型情報、関数切り出しがろくにできていないので将来的にリファクタリングしたい
 */

/**
 * カレンダービューの設定を行うモーダルを表示する用のHTML
 */
const calendarViewHTML = `
		<div class="pb-3">
				<div class="custom-control custom-switch pb-3">
						<input type="checkbox" class="custom-control-input" id="view_type">
						<label class="custom-control-label" for="view_type">${translateInfo(
							"app-setting.display-setting.calendar-view",
						)}</label>
				</div>

				<div id="view-type-selection" style="display:none">
						<div class="row pb-3">
								<div class="col-md-4">
										<div class="custom-control custom-checkbox custom-control-inline">
												<input type="checkbox" class="custom-control-input" id="eventLimit" checked="">
												<label class="custom-control-label" for="eventLimit">${translateInfo(
													"app-setting.display-setting.abbreviate-events",
												)}</label>
										</div>
								</div>
						</div>
						<div class="row">
								<div class="col-md-3">
										<label class="mr-sm-2">${translateInfo(
											"app-setting.display-setting.event-title",
										)}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
										<select class="custom-select d-block w-100" id="event_title">
												<option value=""></option>
										</select>
								</div>
								<div class="col-md-3">
										<label class="mr-sm-2">${translateInfo(
											"app-setting.display-setting.event-start-datetime",
										)}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
										<select class="custom-select d-block w-100" id="event_start">
												<option value=""></option>
										</select>
								</div>
								<div class="col-md-3">
										<label class="mr-sm-2">${translateInfo(
											"app-setting.display-setting.event-end-datetime",
										)}</label><span style="font-size: 0.5em; color: Tomato;"><i class="fas fa-asterisk"></i></span>
										<select class="custom-select d-block w-100" id="event_end">
												<option value=""></option>
										</select>
								</div>
						</div>
						<label class="mr-sm-2 pt-3">${translateInfo(
							"app-setting.display-setting.event-color-setting",
						)}</label>
						<div class="row pb-3">
								<div class="col-md-3">
										<select class="custom-select d-block w-100" id="schedule_color">
												<option value=""></option>
										</select>
								</div>
								<div class="col-md-8" id="schedule-color-selection">
										<table class="table  table-bordered" style="width: max-content; border:none">
												<thead>
												<tr>
														<th>${translateInfo(
															"app-setting.display-setting.value",
														)}</th>
														<th>${translateInfo(
															"app-setting.display-setting.color",
														)}</th>
														<th style="border:none"></th>
												</tr>
												</thead>
												<tbody>
														<tr>
																<td>
																		<select class="custom-select d-block w-100 schedule-color-value">
																				<option value=""></option>
																		</select>
																</td>
																<td>
																		<input type="color" id="" class="schedule-color-option" value="#37d89d">
																</td>
																<td style="border:none">
																		${ADD_ROW_BUTTON + REMOVE_ROW_BUTTON}
																</td>
														</tr>
												</tbody>
										</table>
								</div>
						</div>
				</div>
		</div>
`;
/**
 * 「(すべて)」の一覧ビューであるかを判定する処理
 * 「(すべて)」の一覧ビューの時、id が "all" となるのでそれで判定している
 */
const isAllView = (view: AllView | View): view is AllView => {
	return view.id === "all";
};

/**
 * 一覧ビューのテーブルを生成する処理を纏めているクラス
 */
export class KintoneListViewTable {
	/**
	 * 一覧ビューのテーブルに属性を設定する処理
	 * @param targetTable HTMLTableElement
	 */
	private static setAttributeListViewTable(targetTable: HTMLTableElement) {
		targetTable.setAttribute("id", "views");
		targetTable.setAttribute("class", "table table-bordered");
		targetTable.setAttribute("style", "border:none;");
	}

	/**
	 *　一覧ビューのカレンダー設定ボタンが押された時の処理
	 */
	private static onClickEditButton(
		clickEvent: Event,
		appConfig,
		dataFields,
		viewStore: ViewSettingsStore,
		viewId: string,
	) {
		const target = clickEvent.currentTarget as HTMLElement;
		const viewNameElement = target?.parentNode?.previousSibling as HTMLElement;
		showCalendarViewSettingModal(
			viewNameElement.innerText,
			appConfig,
			dataFields,
			viewStore,
			viewId,
		);
	}

	/**
	 * 一覧ビューのテーブルに子要素を全て追加する処理
	 */
	private static appendChildren(
		targetTable: HTMLTableElement,
		viewId: string,
		viewName: string,
		appConfig,
		dataFields,
		viewStore: ViewSettingsStore,
	) {
		/**
		 * 設定したい一覧ビューを選択するためのチェックボックス
		 */
		const checkBox = document.createElement("input");
		checkBox.setAttribute("type", "checkbox");
		checkBox.setAttribute("id", `viewId-${viewId}`);
		checkBox.setAttribute("value", viewName);
		checkBox.setAttribute("class", "list-view-checkbox");

		/**
		 * 一覧ビューの名前を表示するための p 要素
		 */
		const listViewNameParagraph = document.createElement("p");
		listViewNameParagraph.setAttribute("style", "margin:0;");
		listViewNameParagraph.innerText = viewName;

		/**
		 * 一覧ビューの名前を囲う td 要素
		 */
		const tableDataWithViewName = document.createElement("td");
		tableDataWithViewName.setAttribute("style", "vertical-align: middle;");
		tableDataWithViewName.appendChild(listViewNameParagraph);

		/**
		 * カレンダービューの設定の編集ボタンを囲う td 要素
		 */
		const tableDataWithEditButton = document.createElement("td");
		/**
		 * カレンダービューの設定の編集ボタン
		 */
		const editButton = document.createElement("button");
		`<button id=buttonId-${viewId} title="${translateInfo(
			"edit-record-button",
		)}" class="btn edit-record" style="border: none;background: none;"><i class="far fa-edit  small-btn"></i></button>`;
		editButton.title = translateInfo("edit-record-button");
		editButton.setAttribute("class", "btn edit-record");
		editButton.setAttribute("id", `buttonId-${viewId}`);

		/**
		 * カレンダービューの設定の編集ボタンをクリックした時のイベント
		 */
		const _this = this;
		editButton.addEventListener("click", (event) => {
			/**
			 * チェックボックスがチェックされている時だけ編集ボタンを有効にする
			 */
			if (checkBox.checked) {
				_this.onClickEditButton(
					event,
					appConfig,
					dataFields,
					viewStore,
					viewId,
				);
			}
		});

		/**
		 * カレンダービューの設定の編集ボタンのスタイルを設定
		 */
		editButton.setAttribute(
			"style",
			"border: none;background: none; color: gray;",
		);

		/**
		 * 設定したい一覧ビューを選択するためのチェックボックスのイベント
		 * チェックボックスがチェックされた時だけ編集ボタンを有効にする事を示すため
		 * チェックボックスがチェックされた時は編集ボタンを緑に
		 * チェックボックスがチェックされていない時は編集ボタンをグレーにする
		 */
		checkBox.addEventListener("change", (event) => {
			if (checkBox.checked) {
				editButton.setAttribute("style", "border: none;background: none;");
			} else {
				editButton.setAttribute(
					"style",
					"border: none;background: none; color: gray;",
				);
			}
		});

		/**
		 * カレンダービューの設定の編集ボタンにアイコンを追加
		 */
		const editButtonIcon = document.createElement("i");
		editButtonIcon.setAttribute("class", "far fa-edit  small-btn");
		editButton.appendChild(editButtonIcon);

		/**
		 *  設定したい一覧ビューを選択するためのチェックボックスを囲う td 要素
		 */
		const tableDataWithCheckBox = document.createElement("td");
		tableDataWithCheckBox.setAttribute(
			"style",
			"vertical-align: middle; text-align: center;",
		);
		tableDataWithCheckBox.appendChild(checkBox);

		/**
		 * カレンダービューの設定の編集ボタンを囲う td 要素
		 */
		tableDataWithEditButton.appendChild(editButton);

		/**
		 * 一覧ビューのテーブルの行を生成して、子要素を追加
		 */
		const tableRow = document.createElement("tr");
		tableRow.setAttribute("style", "height:4rem;");
		tableRow.appendChild(tableDataWithCheckBox);
		tableRow.appendChild(tableDataWithViewName);
		tableRow.appendChild(tableDataWithEditButton);

		/**
		 * 一覧ビューのテーブルに行を追加
		 */
		targetTable.appendChild(tableRow);
	}

	/**
	 * chobiit側で既に設定されている一覧ビューのチェックボックスにチェックを入れる処理
	 */
	private static checkCurrentSelectView(
		targetTable: HTMLTableElement,
		views: ChobitoneAppViews | undefined,
	) {
		if (views !== undefined) {
			views.forEach((view: View | AllView) => {
				const checkBox = targetTable.querySelector(
					`#viewId-${view.id}`,
				) as HTMLInputElement;
				if (checkBox !== null) {
					checkBox.checked = true;
					const editButton = targetTable.querySelector(
						`#buttonId-${view.id}`,
					) as HTMLButtonElement;
					if (editButton !== null) {
						editButton.setAttribute("style", "border: none;background: none;");
					}
				}
			});
		}
	}

	private static async setListViewData(
		targetTable: HTMLTableElement,
		appId: string,
		appConfig,
		dataFields,
		viewStore: ViewSettingsStore,
		currentViews: ChobitoneAppViews
	) {
		/**
		 * KintoneRestAPIClient を使ってアプリのビューを取得
		 */
		const client = new KintoneRestAPIClient();
		const response = await client.app.getViews({ app: appId });
		const appViews = Object.values(response.views);
		/**
		 * kintoneでカレンダービューの設定とカスタムビューの設定がされていない一覧ビューを取得
		 */
		const calendarViewRemovedViews = appViews.filter(
			(appView) => appView.type == "LIST",
		);
		/**
		 * kintoneと同じ一覧の表示順に並び替える
		 */
		const sortedViews = KintoneListViewUtil.getSortedViews(
			calendarViewRemovedViews,
		);
		/**
		 * ソートされたビューのIDを取得
		 */ 
		const sortedViewIds = sortedViews.map((view: View | AllView) => view.id);

		/**
		 * 一覧ビューの設定がされていない時 この処理は行われない
		 */ 
		if (currentViews) {
			/**
			 * kitnoneで設定されている一覧ビューの中から、chobiit側で設定されている一覧ビューを絞り込んでいる
			 */
			const foundViewData = currentViews.filter(view =>
				sortedViewIds.includes(view.id),
			);
			/**
			 *  chobiit側で設定されている一覧ビューのカレンダービューの設定を保存している
			 */
			foundViewData.forEach(view => {
				const calendarView = view.calendarView;
				if (calendarView) {
					viewStore.set({
						viewId: view.id,
						calendarView: calendarView,
					});
				}
			});

			/**
			 * chobiit側で設定されている一覧ビューの中に (すべて) の一覧ビューを絞り込んでいる
			 */
			const foundViewOfAllData = currentViews.find(
				view => view.id === "all",
			);
			if (foundViewOfAllData) {
				/**
				 * chobiit側で設定されている (すべて) の一覧ビューのカレンダービューの設定を保存している
				 */
				const calendarView = foundViewOfAllData.calendarView;
				if (calendarView) {
					viewStore.set({
						viewId: "all",
						calendarView: calendarView,
					});
				}
			}
		}

		/**
		 * テーブルに一覧ビューの数だけ子要素を追加
		 */
		sortedViews.forEach((view: View | AllView) => {
			if (!isAllView(view)) {
				this.appendChildren(
					targetTable,
					view.id,
					view.name,
					appConfig,
					dataFields,
					viewStore,
				);
			}
		});

		/**
		 * (すべて) の一覧ビューを追加
		 */
		this.appendChildren(
			targetTable,
			"all",
			localeService.translate("common", "all-list-view-name"),
			appConfig,
			dataFields,
			viewStore,
		);
	}

	/**
	 *　一覧ビューのテーブルを生成する処理の親になるメソッド
	 */
	static async render(
		appConfig: ChobitoneApp,
		viewStore: ViewSettingsStore,
		dataFields?,
	) {
		const { app: appId, views, recordCond1, calendarView } = appConfig;
		const currentViews = BackwardCompatibility.convertToListViewData(recordCond1, calendarView, views);

		/**
		 * 一覧ビューのテーブルが既に存在している時、削除する
		 */
		const currentListViewTable = document.getElementById("views");
		if (currentListViewTable !== null) {
			currentListViewTable.remove();
		}

		/**
		 * 一覧ビューのテーブルを生成
		 */
		const listViewTable = document.createElement("table");

		/**
		 * 一覧ビューのテーブルに属性を設定
		 */
		this.setAttributeListViewTable(listViewTable);
		/**
		 * 一覧ビューのテーブルにデータを設定
		 */
		await this.setListViewData(
			listViewTable,
			appId,
			appConfig,
			dataFields,
			viewStore,
			currentViews
		);
		/**
		 * chobiitで既に設定されている一覧ビューのチェックボックスにチェックを入れる
		 */
		this.checkCurrentSelectView(listViewTable, currentViews);

		/**
		 * 一覧ビューのテーブルを囲む div 要素を取得
		 */
		const divOnListViewTable = document.getElementById("record-cond-selection");
		if (divOnListViewTable === null) {
			console.error("Id is element of record-cond-selection not found.");
			throw new Error("Id is element of record-cond-selection not found.");
		}
		/**
		 * 一覧ビューのテーブルを div 要素に追加
		 */
		divOnListViewTable.appendChild(listViewTable);
		/**
		 * 一覧ビューのテーブルのスタイルを設定
		 */
		divOnListViewTable.setAttribute(
			"style",
			"max-height: 20rem; overflow-y: scroll; width: 20rem",
		);
	}
}

/**
 * カレンダービューの設定を保存する処理
 */
const submitCalenderButton = (viewStore: ViewSettingsStore, viewId: string) => {
	if ($("#view_type").is(":checked")) {
		let eventLimit = $("#eventLimit").is(":checked") ? true : false;
		let event_title = $("#event_title").val();
		let event_start = $("#event_start").val();
		let event_end = $("#event_end").val();
		if (!event_title) {
			$.alert({
				title: translateCommon("input-error-title"),
				icon: "fas fa-exclamation-triangle",
				content: translateError(
					"event-title-field-of-calendar-view-is-required",
				),
				type: "red",
				animateFromElement: false,
			});
			return false;
		}
		if (!event_start) {
			$.alert({
				title: translateCommon("input-error-title"),
				icon: "fas fa-exclamation-triangle",
				content: translateError(
					"event-start-datetime-field-of-calendar-view-is-required",
				),
				type: "red",
				animateFromElement: false,
			});
			return false;
		}
		if (!event_end) {
			$.alert({
				title: translateCommon("input-error-title"),
				icon: "fas fa-exclamation-triangle",
				content: translateError(
					"event-end-datetime-field-of-calendar-view-is-required",
				),
				type: "red",
				animateFromElement: false,
			});
			return false;
		}
		const calendarView: any = {
			eventLimit: eventLimit,
			event_title: event_title,
			event_start: event_start,
			event_end: event_end,
			event_color: false,
		};
		let field = $("#schedule_color").val();
		let cond = {};
		let condArr = [];
		$(".schedule-color-value").each(function (index) {
			if ($(this).val()) {
				condArr.push($(this).val());
				Object.assign(cond, {
					[$(this).val()]: $(".schedule-color-option").eq(index).val(),
				});
			}
		});
		if (Object.keys(cond).length && field) {
			calendarView.event_color = {
				field: field,
				cond: cond,
			};
		}
		let duplicateCalendar = checkDuplicate(condArr);
		if (duplicateCalendar) {
			$.alert({
				title: translateCommon("input-duplication-error-title"),
				icon: "fas fa-exclamation-triangle",
				content: translateError(
					"color-settings-of-calendar-view-are-duplicated",
					{ duplicatedCondition: duplicateCalendar },
				),
				type: "red",
				animateFromElement: false,
			});
			return false;
		}

		/**
		 * カレンダービューの設定を保存
		 */
		viewStore.set({
			viewId: viewId,
			calendarView: calendarView,
		});
	} else {
		viewStore.delete(viewId);
	}
};

/**
 * カレンダービューの設定を行うモーダルを表示する処理
 */
const showCalendarViewSettingModal = (
	viewName: string,
	appConfig,
	dataFields,
	viewStore: ViewSettingsStore,
	viewId: string,
) => {
	const currentCalendarView = viewStore
		.get()
		.find((setting) => setting.viewId === viewId)?.calendarView;
	const jcEditUser = $.confirm({
		animateFromElement: false,
		columnClass: "col-md-8",
		title: translateInfo(
			"app-setting.display-setting.view-detail-setting-label",
			{ viewName },
		),
		content: calendarViewHTML,
		buttons: {
			formSubmit: {
				text: translateCommon("save"),
				btnClass: "btn-info edit-user-btn",
				action: () => submitCalenderButton(viewStore, viewId),
			},
			cancel: {
				text: translateCommon("cancel"),
				action: function () {},
			},
		},
		onContentReady: async function () {
			$("#view_type").change(function () {
				if (this.checked) {
					$("#view-type-selection").fadeIn("slow");
				} else {
					$("#view-type-selection").fadeOut("slow");
				}
			});

			$("#schedule_color").change(function () {
				const appValue = $("#app").val();
				const fieldValue = $(this).val();
				if (fieldValue && appValue) {
					makeCalendarColorOption(fieldValue, appValue);
				}
			});

			$(".add-row").click(function () {
				const clickedBodyTable = $(this).parent().parent().parent();
				const cloneClikedTr = clickedBodyTable.children().first().clone(true);
				const clickedTr = $(this).parent().parent();
				clickedTr.after(cloneClikedTr);
			});

			$(".remove-row").click(function () {
				const $tr = $(this).parent().parent();
				if ($tr.siblings().length >= 1) {
					$tr.remove();
				}
			});

			await makeCalendarOption(appConfig.app, dataFields);
			/**
			 * 既存のカレンダービューの設定がある時、それを表示する
			 */
			if (currentCalendarView) {
				console.log("currentCalendarView", currentCalendarView.event_title);
				$("#view_type").prop("checked", true);
				$("#view-type-selection").fadeIn("slow");
				if (currentCalendarView.eventLimit == false) {
					$("#eventLimit").prop("checked", false);
				}
				$("#event_title").val(currentCalendarView.event_title);
				$("#event_start").val(currentCalendarView.event_start);
				$("#event_end").val(currentCalendarView.event_end);
				if (currentCalendarView.event_color) {
					$("#schedule_color").val(currentCalendarView.event_color.field);
					makeCalendarColorOption(
						currentCalendarView.event_color.field,
						appConfig.app,
						dataFields,
					).then(function () {
						let cond = Object.entries(currentCalendarView.event_color.cond);
						for (let i = 1; i < cond.length; i++) {
							$("#view-type-selection")
								.find(".add-row")
								.first()
								.trigger("click");
						}
						cond.forEach((item, index) => {
							$(".schedule-color-value")
								.eq(index)
								.val(item[0]);
							$(".schedule-color-option")
								.eq(index)
								.val(item[1]);
						});
					});
				}
			}
		},
	});
};
