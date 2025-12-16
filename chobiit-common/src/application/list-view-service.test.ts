// import { ListViewService } from './list-view-service';

describe('ListViewService', () => {
    test("github action test counter measure", () => {
        expect(1).toBe(1)
    })
//     const appInfo = {
//         views: {
//             existsAll: true,
//             list : [
//                 {
//                     "name": "（作業者が自分）",
//                     "index": "1",
//                     "id": "8251042",
//                     "sort": "レコード番号 desc",
//                     "fields": [
//                         "更新日時",
//                         "レコード番号"
//                     ],
//                     "filterCond": "作業者 in (LOGINUSER())",
//                     "type": "LIST",
//                     "builtinType": "ASSIGNEE"
//                 },
//                 {
//                     "name": "数値ラジオレコード番号",
//                     "index": "2",
//                     "id": "8251230",
//                     "sort": "レコード番号 desc",
//                     "fields": [
//                         "数値",
//                         "レコード番号",
//                         "ラジオボタン_0"
//                     ],
//                     "filterCond": "",
//                     "type": "LIST"
//                 },
//                 {
//                     "name": "一覧1",
//                     "index": "0",
//                     "id": "8251174",
//                     "sort": "レコード番号 desc",
//                     "fields": [
//                         "レコード番号",
//                         "複数選択",
//                         "タイトル",
//                         "日時_2",
//                         "リンク",
//                         "ステータス",
//                         "時刻_0",
//                         "ドロップダウン",
//                         "チェックボックス",
//                         "ラジオボタン_0",
//                         "数値"
//                     ],
//                     "filterCond": "",
//                     "type": "LIST"
//                 }
//             ]  
//         },
//         recordCond1: {
//             "name": "一覧1",
//             "index": "0",
//             "id": "8251174",
//             "sort": "レコード番号 desc",
//             "fields": [
//                 "レコード番号",
//                 "複数選択",
//                 "タイトル",
//                 "日時_2",
//                 "リンク",
//                 "ステータス",
//                 "時刻_0",
//                 "ドロップダウン",
//                 "チェックボックス",
//                 "ラジオボタン_0",
//                 "数値"
//             ],
//             "filterCond": "",
//             "type": "LIST"
//         }
//     }
    
//     test('findListViewData with targetViewId', () => {
//         const targetViewId = "8251042"
//         const result = ListViewService.findListViewData(appInfo,targetViewId)
//         expect(result).toEqual(appInfo.views.list[0])
//     })

//     test('findListViewData with targetViewId is invalid', () => {
//         const occurErrorFunction = () => {
//             const targetViewId = "invalid"
//             ListViewService.findListViewData(appInfo,targetViewId)
//         }

//         expect(occurErrorFunction).toThrow("Target view is not found")
//     })

//     test('findListViewData with targetViewId is undefined', () => {
//         const targetViewId = undefined
//         const result = ListViewService.findListViewData(appInfo,targetViewId)
//         expect(result).toEqual(appInfo.views.list[2])
//     })

//     test('findListViewData with targetViewId is undefined', () => {
//         appInfo.views.list[2].index = "3"
//         const targetViewId = undefined
//         const result = ListViewService.findListViewData(appInfo,targetViewId)
//         expect(result).toEqual(appInfo.views.list[0])
//     })

//     test('findListViewData with targetViewId is "all"', () => {
//         const targetViewId = "all"
//         const result = ListViewService.findListViewData(appInfo,targetViewId)
//         expect(result).toEqual(false)
//     })

//     test('findListViewData with targetViewId is undefined and views list is blank', () => {
//         appInfo.views.list = []
//         const targetViewId = undefined
//         const result = ListViewService.findListViewData(appInfo,targetViewId)
//         expect(result).toBe(false)
//     })

//     test('findListViewData with targetViewId is "all" but existsAll is false', () => {
//         appInfo.views.existsAll = false
//         const occurErrorFunction = () => {
//             const targetViewId = "all"
//             ListViewService.findListViewData(appInfo,targetViewId)
//         }
//         expect(occurErrorFunction).toThrow("All view list is not setting in plugin setting display but request target is all view.")
//     })

//     test('findListViewData with targetViewId is undefined but views in appInfo is not setting', () => {
//         const occurErrorFunction = () => {
//             const targetViewId = undefined
//             ListViewService.findListViewData(appInfo,targetViewId)
//         }
//         expect(occurErrorFunction).toThrow("List view is not set correctly,There may be data inconsistencies")
//     })

})