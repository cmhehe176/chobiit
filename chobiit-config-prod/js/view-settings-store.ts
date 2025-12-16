import {
	CalendarView,
	ChobitoneAppViews,
} from "chobiit-common/src/types/chobiit";

type CalendarViewSetting = {
	viewId: string;
	calendarView: CalendarView;
};

export class ViewSettingsStore {
	store: CalendarViewSetting[];

	constructor() {
		this.store = [];
	}

	get() {
		return this.store;
	}

	set(newSettings: CalendarViewSetting): void {
		const settingViewId = newSettings.viewId;
		const foundCalenderViewIndex = this.store.findIndex(
			(setting) => setting.viewId === settingViewId,
		);
		const isRegisteredCalenderView = foundCalenderViewIndex >= 0;
		if (isRegisteredCalenderView) {
			this.store[foundCalenderViewIndex] = newSettings;
		} else {
			this.store.push(newSettings);
		}
	}

	delete(viewId: string) {
		this.store = this.store.filter((setting) => setting.viewId !== viewId);
	}

	reset() {
		this.store = [];
	}
}
