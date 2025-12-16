import LocaleService from "chobiit-common/src/application/locale-service";
const localeService = LocaleService.getInstance("client");

export default class CountRecordService {
	private static previousRecordsCount: number = 1;
	private static appRecordsCount: number = 0;

	private static updateRecordCounts(
		hasNextPage: boolean,
		recordsCount: number,
	): void {
		this.appRecordsCount += hasNextPage
			? recordsCount
			: -this.previousRecordsCount;
		this.previousRecordsCount = recordsCount;
	}

	static countRecords(
		page: number,
		totalCount: string,
		recordsCount: number,
		groupView: boolean,
		hasNextPage: boolean,
	): string {
		this.updateRecordCounts(hasNextPage, recordsCount);

		const prevPageMaxRecordsCount = page * 100;
		const currentPageMaxRecordsCount = (page + 1) * 100;
		const hasNoRecords = totalCount === "0";

		let start = hasNoRecords
			? totalCount
			: (prevPageMaxRecordsCount + 1).toString();

		let end =
			parseInt(start, 10) + 99 < parseInt(totalCount, 10)
				? (parseInt(start, 10) + 99).toString()
				: totalCount;

		/**
		 * 「グループのみ表示」の時に、正確な件数を取得する方法がないため「〇〇+ 件」と表示させている。[backlog](https://noveldev.backlog.com/view/CHOBIIT-195)
		 */
		if (groupView) {
			const isOverMaxRecordsInGroupView =
				groupView && parseInt(totalCount, 10) >= currentPageMaxRecordsCount;
			const isEmptyGroupView = recordsCount === 0;

			const groupViewStart = isEmptyGroupView
				? recordsCount.toString()
				: (this.appRecordsCount - recordsCount + 1).toString();

			const groupViewEnd = isEmptyGroupView
				? recordsCount.toString()
				: this.appRecordsCount.toString();

			const groupViewTotalCount = isOverMaxRecordsInGroupView
				? `${this.appRecordsCount}+`
				: this.appRecordsCount.toString();

			return localeService.translate("info", "group-view-records-stat", {
				groupViewStart,
				groupViewEnd,
				groupViewTotalCount
			});
		}

		return localeService.translate("info", "records-stat", {
			start,
			end,
			totalCount,
		});
	}
}
