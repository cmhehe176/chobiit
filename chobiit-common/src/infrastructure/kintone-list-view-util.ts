import { AllView, ChobitoneAppViews, View } from "../types/chobiit";

export class KintoneListViewUtil {
	static getSortedViews(views: ChobitoneAppViews): ChobitoneAppViews{
		const { allView, removedAllView } = this.splitViewData(views);
		if(removedAllView !== undefined){
			const sortedViews:ChobitoneAppViews = structuredClone(removedAllView).sort((currentView, nextView) => {
				return Number(currentView.index) - Number(nextView.index);
			});

			if(allView !== undefined){
				sortedViews.push(allView);
			}

			return sortedViews;

		}else{
			if(allView !== undefined){
				return [allView];
			}else{
				throw new Error("Views is not found");
			}
		}
	}

	static getDefaultView = (views: ChobitoneAppViews): View | AllView => {
		const { allView, removedAllView } = this.splitViewData(views);
		if(removedAllView !== undefined && removedAllView.length > 0){
			let minimumIndex = "";
			removedAllView.forEach((view: View) => {
				if (minimumIndex === "") {
					minimumIndex = view.index;
				}
				if (Number(view.index) < Number(minimumIndex)) {
					minimumIndex = view.index;
				}
			});

			const defaultView = removedAllView.find(
				(view: View) => view.index === minimumIndex,
			);

			if (defaultView === undefined) {
				throw new Error("Default view is not found");
			}
			return defaultView;
		}else{
			if(allView !== undefined){
				return allView;
			}else{
				throw new Error("Default view is not found");
			}
		}

	};

	static splitViewData = (views:ChobitoneAppViews): { allView: AllView | undefined, removedAllView: View[] | undefined } => {
		const allView = views.find((view) => view.id === "all") as AllView | undefined;
		const removedAllView = views.filter((view) => view.id !== "all") as View[] | undefined;
		
		return { allView, removedAllView };
	}
}
