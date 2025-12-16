/**
 * # NOTE
 *
 * サービスを乱用したくはないが、一度、レコード一覧画面の
 * カレンダビューに関する要素を切り出すためにサービスを実装してみる。
 *
 * コードが整理できてくれば、domain にオブジェクトを定義して整理していく。
 */

/**
 * FIXME: moment.js は非推奨になっているため、別の日付ライブラリに移行する。
 */
import { CalendarView } from "chobiit-common/src/types/chobiit";
import { Moment } from "moment";
import { CalendarDisplayData } from "chobiit-common/src/types/chobiit";

/**
 * カレンダビューに関する責務を持つサービス
 *
 * TODO: ドメインオブジェクトを定義して整理していく。Fat Service にならないようにする。
 */
export default class CalendarViewService {
	/**
	 * カレンダービューでの月の表示を取得する。
	 * `CHOBIIT_LANG`の設定に応じて結果を変える。
	 *
	 * @param {*} momentDate - Date object wrapper by moment
	 * @returns
	 */
	static getCalendarMonth(momentDate: Moment): string {
		const format = (date: Moment, formatString: string) =>
			date.format(formatString);

		switch (process.env.CHOBIIT_LANG) {
			/**
			 * ロケールで対応することが望ましいです
			 */
			case "ja":
				return `${format(momentDate, "YYYY")}年${format(momentDate, "M")}月`;
			case "en":
				return format(momentDate, "MMMM");
			default:
				throw new Error(`Unknown language: ${process.env.CHOBIIT_LANG}`);
		}
	}
	
	static getEventSource(
		records,
		calendarView: CalendarView,
		appId: string,
		isPublicListRecord: boolean,
	): { events: CalendarDisplayData[] } {
		const event_title = calendarView.event_title;
		const event_start = calendarView.event_start;
		const event_end = calendarView.event_end;
		const event_color = calendarView.event_color;

		const detailRecordUrl = isPublicListRecord
			? "./p_detail_record.html"
			: "./detail_record.html";

		const events: CalendarDisplayData[] = records
			.filter((record) => {
				if (
					!record[event_title] ||
					!record[event_start] ||
					!record[event_end]
				) {
					return false;
				}

				if (record[event_title].value && record[event_start].value) {
					return true;
				}
			})
			.map((record) => {
				const calendarData: CalendarDisplayData = {
					title: record[event_title].value,
					url: `${detailRecordUrl}?appId=`
						.concat(appId, "&id=")
						.concat(record.$id.value),
					start: record[event_start].value,
					/**
					 * fullCalendarの仕様で, eventのstartとendを同日同時刻に設定すると, 
					 * endが次のxx:00になる仕様があります.
					 * 23:00~23:59 の間に同日同時刻で設定すると, 24:00になってしまい
					 * カレンダー上では次の日にまたがっているように見えてしまいます.
					 * この不具合を修正するために, endにプラス1秒することで対応します.
					 * 
					 * 詳しい内容や改修による影響などは以下からご確認ください.
					 * 該当のjiraタスク: https://novelworks.atlassian.net/browse/CFK-292
					 * ドキュメント: https://drive.google.com/drive/folders/1KHlDdYPv_mW2xcO_VfGPL8ovIy1G-RAo?hl=ja
					 */ 
					end: addOneSecondToISODate(record[event_end].value),
					id: record.$id.value,
				};

				if (event_color && event_color.hasOwnProperty("cond")) {
					const cond = event_color.cond;
					const field = event_color.field;
					calendarData.color = cond[record[field].value];
				}
				return calendarData;
			});
		return { events };
	}

	
}

/**
 * ISO 8601形式の日付文字列に1秒を追加し、秒までの精度で返す関数
 * @param {string} isoDateString - ISO 8601形式の日付文字列
 * @returns {string} - 1秒追加されたISO 8601形式の日付文字列（秒までの精度）
 */
export function addOneSecondToISODate(isoDateString) {
    const date = new Date(isoDateString);
    date.setSeconds(date.getSeconds() + 1);
    const isoString = date.toISOString();

	// ミリ秒部分を除外して秒までの精度で返す
    return isoString.split('.')[0] + 'Z';
}

