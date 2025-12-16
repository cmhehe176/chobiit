export class UrlQueryParameterWrapper {
	static getUrlWithQueryParameter(keyName: string, value: string): URL {
		const url = new URL(location.href);
		url.searchParams.set(keyName, value);
		return url;
	}

	static getViewId(): string {
		const viewId = new URLSearchParams(location.search).get("viewId");

		if (viewId === null) {
			return "";
		}

		return viewId;
	}

	static getAppId(): string {
		const appId = new URLSearchParams(location.search).get("appId");

		if (appId === null) {
			return "";
		}

		return appId;
	}
}
