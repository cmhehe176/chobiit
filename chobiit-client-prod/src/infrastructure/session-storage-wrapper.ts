import { ChobitoneAppViews } from "chobiit-common/src/types/chobiit";

export class SessionStorageWrapper {
	static getViews(): ChobitoneAppViews {
		const appSetting = sessionStorage.getItem("appSetting");
		if (appSetting === null) {
			throw new Error("appSetting of sessionStorage is null");
		}
		return JSON.parse(appSetting).views;
	}
}
