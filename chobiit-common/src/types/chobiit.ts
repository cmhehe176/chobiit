import { ViewForResponse } from "@kintone/rest-api-client/esm/src/client/types/app/view";
import { KintoneRESTAPI } from "./kintone";

type FieldCode = string;

type KintoneFieldCode = string;

/**
 * DynamoDB Table `ChobitoneApp` の型定義
 *
 * ## TODO
 * 必要なプロパティは順次追加していきましょう。
 */
export interface ChobitoneApp {
	domain: string;

	app: string;

	/**
	 * アプリのフィールド定義
	 */
	fields: Record<
		KintoneFieldCode,
		{ code: string; label: string } & Record<string, string | boolean>
	>;

	/**
	 * アプリの一覧ビューの定義
	 * 今後一覧ビューの情報はviewsに格納されていくので
	 * recordCond1は将来的に無くなる予定
	 */
	recordCond1?: ViewForResponse | boolean;

	/**
	 * アプリの一覧ビューの定義
	 */
	views: ChobitoneAppViews;

	calendarView?: CalendarView | boolean;

	fieldCond0?: FieldCond | false;
	actionCondList?: ActionCondList | []
	actionCond0?: ActionCond | false;
}

/**
 * ルックアップフィールドの型
 * kintoneをベースにしているが若干異なる
 * 本来はchobitoneAppの型定義に含めるべきだが、めんどくさいので別途定義
 */
export type LookupInfo = {
	relatedApp: {
		app: string;
		code: string | " ";
	};
	lookupPickerFields: FieldCode[];
	relatedKeyField: FieldCode;
	fieldMappings: {
		field: FieldCode;
		relatedField: FieldCode;
	}[];
	sort: string;
	filterCond: string | " ";
}

/**
 * (US版のみ) ルックアップ完全一致のフィールド
 */
export type lkCompleteMatch = FieldCode[] | undefined;

/**
 * Chobiit をログイン認証あり・外部公開のどちらで利用しているか。
 */
export type ChobiitUsageSituation = "private" | "public";

export type CalendarView = {
	eventLimit: boolean;
	event_color: {
		cond: {
			[key in string]: string;
		};
		field: string;
	};
	event_end: string;
	event_start: string;
	event_title: string;
};

export type CalendarDisplayData = {
	title: string;
	url: string;
	start: string;
	end: string;
	id: string;
	color?: string;
};

export type FormatListViewData = {
	recordCond1: boolean | (View | AllView) | ChobitoneApp["recordCond1"];
	calendarView: boolean | (undefined | CalendarView);
};

/**
 * kintoneRestApiから一覧ビューの設定情報を取得した時
 * fieldsプロパティが存在するはずだが、型ViewForResponseには存在しないため
 * fieldsという型を追加している
 */
export type View = ViewForResponse & {
	calendarView?: CalendarView;
	fields?: string[];
};

export type AllView = {
	id: "all";
	calendarView?: CalendarView;
};

/**
 * chobitoneAppテーブルの中にある
 * 一覧ビューの設定情報である views オブジェクトの型定義
 */
export type ChobitoneAppViews = (View | AllView)[];




/**
 * chobiitConfigテーブルのオブジェクトの型定義
 */

export type AllConfigData = {
	code: number
	data: ConfigData;
}

type ConfigData = {
	// 時間のなどの都合から、テストに用いるプロパティだけ定義しています(ver1.0.4時点)
	// 残りのすべてのプロパティを定義することが望まれます 
	users: ConfigDataUsers[]
	kintoneUsers: ConfigDataKintoneUsers[]
	apps: ConfigDataApps[]
}

type ConfigDataUsers = {
	kintoneUsername: string;
	password: string;
	kintoneLoginName: string;
	apps: string;
	kintoneOrganizations: string;
	kintoneGroups: string;
	mailAddress: string;
	cybozuToken: string;
	isAdmin: boolean;
	name: string;
	domain: string;
	loginName: string;
}

type ConfigDataKintoneUsers = {
	kintoneLoginName: string;
	cybozuToken: string;
	domain: string;
}

type ConfigDataApps = {
	// 時間のなどの都合から、テストに用いるプロパティだけ定義しています(ver1.0.4時点)
	// 残りのすべてのプロパティを定義することが望まれます 
	app: string;
	auth: boolean;
}

export type FieldCond = {
	field: string
	"function": ("view" | "edit")[] | []
	typeField: KintoneRESTAPI.KintoneFieldTypes
}[]

export type ActionCond = {
	actionApp: string,
	actionName: string,
	copyFields: {
		copyFrom: string
		copyFromType: KintoneRESTAPI.KintoneFieldTypes
		copyTo: string
		copyToType: KintoneRESTAPI.KintoneFieldTypes
		editable: boolean
	}[],
}

export type ActionCondList = (ActionCond & {
	webhookSync: any // TODO
})[]
