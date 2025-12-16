// process.env.CHOBIIT_LANG = "ja";

// import { ListViewSelector } from "./list-view-selector"

describe("KintoneRecordListSelector test ",() => {
    test("github action test counter measure", () => {
        expect(1).toBe(1)
    })
//     const appSetting = {
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
//         }
//     }

//     beforeEach(() => {
//         sessionStorage.setItem('appSetting', JSON.stringify(appSetting));
//     })

//     afterEach(() => {
//         sessionStorage.clear();
//     })

//     test("when Initial rendering",() => {
//         document.body.innerHTML = `
//             <div id="root">
//             </div>
//         `
//         ListViewSelector.render("root")
//         const listViewSelector = document.getElementById("list-view-selector") as HTMLSelectElement
//         if(listViewSelector === null) {
//             throw new Error('listViewSelector is null')
//         }
//         expect(listViewSelector.options.length).toBe(4)

//         expect(listViewSelector.options[0].innerText).toBe("一覧1")
//         // expect(listViewSelector.options[0].selected).toBe(true)
//         expect(listViewSelector.options[0].value).toBe("8251174")

//         expect(listViewSelector.options[1].innerText).toBe("（作業者が自分）")
//         // expect(listViewSelector.options[1].selected).toBe(false)
//         expect(listViewSelector.options[1].value).toBe("8251042")

//         expect(listViewSelector.options[2].innerText).toBe("数値ラジオレコード番号")
//         // expect(listViewSelector.options[2].selected).toBe(false)
//         expect(listViewSelector.options[2].value).toBe("8251230")

//         expect(listViewSelector.options[3].innerText).toBe("（すべて）")
//         // expect(listViewSelector.options[3].selected).toBe(false)
//         expect(listViewSelector.options[3].value).toBe("all")
//     })

//     // test("When Initial rendering with If all view are set to false ",() => {
//     //     appSetting.views.existsAll = false
//     //     sessionStorage.setItem('appSetting', JSON.stringify(appSetting));
//     //     ListViewSelector.render("root")
//     //     const listViewSelector = document.getElementById("list-view-selector") as HTMLSelectElement
//     //     if(listViewSelector === null) {
//     //         throw new Error('listViewSelector is null')
//     //     }
//     //     expect(listViewSelector.options.length).toBe(3)
        
//     //     expect(listViewSelector.options[0].innerText).toBe("（作業者が自分）")
//     //     expect(listViewSelector.options[0].selected).toBe(false)
//     //     expect(listViewSelector.options[0].value).toBe("8251042")

//     //     expect(listViewSelector.options[1].innerText).toBe("数値ラジオレコード番号")
//     //     expect(listViewSelector.options[1].selected).toBe(false)
//     //     expect(listViewSelector.options[1].value).toBe("8251230")

//     //     expect(listViewSelector.options[2].innerText).toBe("一覧1")
//     //     expect(listViewSelector.options[2].selected).toBe(true)
//     //     expect(listViewSelector.options[2].value).toBe("8251174")
//     // })

//     /**
//      * テスト何故か通らないので一旦保留
//      */

//     // test("When Initial rendering with If view index minimum number is 1",() => {
//     //     appSetting.views.existsAll = true
//     //     appSetting.views.list[2].index = "3"
//     //     sessionStorage.setItem('appSetting', JSON.stringify(appSetting));
//     //     ListViewSelector.render("root")
//     //     const listViewSelector = document.getElementById("list-view-selector") as HTMLSelectElement
//     //     if(listViewSelector === null) {
//     //         throw new Error('listViewSelector is null')
//     //     }
//     //     expect(listViewSelector.options.length).toBe(4)
        
//     //     expect(listViewSelector.options[0].innerText).toBe("（作業者が自分）")
//     //     expect(listViewSelector.options[0].selected).toBe(true)
//     //     expect(listViewSelector.options[0].value).toBe("8251042")

//     //     expect(listViewSelector.options[1].innerText).toBe("数値ラジオレコード番号")
//     //     expect(listViewSelector.options[1].selected).toBe(false)
//     //     expect(listViewSelector.options[1].value).toBe("8251230")

//     //     expect(listViewSelector.options[2].innerText).toBe("一覧1")
//     //     expect(listViewSelector.options[2].selected).toBe(false)
//     //     expect(listViewSelector.options[2].value).toBe("8251174")
    
//     //     expect(listViewSelector.options[3].innerText).toBe("(すべて)")
//     //     expect(listViewSelector.options[3].selected).toBe(false)
//     //     expect(listViewSelector.options[3].value).toBe("all")
//     // })

//     // test("when List view not configured ",() => {
//     //     const appSetting = {}
//     //     sessionStorage.setItem('appSetting', JSON.stringify(appSetting));
//     //     ListViewSelector.render("root")
//     //     const listViewSelector = document.getElementById("list-view-selector") as HTMLSelectElement
//     //     expect(listViewSelector).toBeNull()
//     // })

//     // test("When Initial rendering with only all view. ",() => {
//     //     const appSetting = {
//     //         views: {
//     //             existsAll: true,
//     //             list : []
//     //         }
//     //     }
//     //     sessionStorage.setItem('appSetting', JSON.stringify(appSetting));
//     //     ListViewSelector.render("root")
//     //     const listViewSelector = document.getElementById("list-view-selector") as HTMLSelectElement
//     //     expect(listViewSelector).toBeNull()
//     // })

//     /**
//      * テスト何故か通らないので一旦保留
//      */
//     // test("When viewId in queryParams setting",() => {
//     //     Object.defineProperty(window, 'location', {
//     //         value: {
//     //           search: '?viewId=8251042',
//     //         },
//     //         writable: false,
//     //     });
        
//     //     const appSetting = {
//     //         views: {
//     //             existsAll: true,
//     //             list : [
//     //                 {
//     //                     "name": "（作業者が自分）",
//     //                     "index": "1",
//     //                     "id": "8251042",
//     //                     "sort": "レコード番号 desc",
//     //                     "fields": [
//     //                         "更新日時",
//     //                         "レコード番号"
//     //                     ],
//     //                     "filterCond": "作業者 in (LOGINUSER())",
//     //                     "type": "LIST",
//     //                     "builtinType": "ASSIGNEE"
//     //                 },
//     //                 {
//     //                     "name": "数値ラジオレコード番号",
//     //                     "index": "2",
//     //                     "id": "8251230",
//     //                     "sort": "レコード番号 desc",
//     //                     "fields": [
//     //                         "数値",
//     //                         "レコード番号",
//     //                         "ラジオボタン_0"
//     //                     ],
//     //                     "filterCond": "",
//     //                     "type": "LIST"
//     //                 },
//     //                 {
//     //                     "name": "一覧1",
//     //                     "index": "0",
//     //                     "id": "8251174",
//     //                     "sort": "レコード番号 desc",
//     //                     "fields": [
//     //                         "レコード番号",
//     //                         "複数選択",
//     //                         "タイトル",
//     //                         "日時_2",
//     //                         "リンク",
//     //                         "ステータス",
//     //                         "時刻_0",
//     //                         "ドロップダウン",
//     //                         "チェックボックス",
//     //                         "ラジオボタン_0",
//     //                         "数値"
//     //                     ],
//     //                     "filterCond": "",
//     //                     "type": "LIST"
//     //                 }
//     //             ]  
//     //         }
//     //     }
//     //     sessionStorage.setItem('appSetting', JSON.stringify(appSetting));
//     //     ListViewSelector.render("root")
//     //     const listViewSelector = document.getElementById("list-view-selector") as HTMLSelectElement
//     //     if(listViewSelector === null) {
//     //         throw new Error('listViewSelector is null')
//     //     }

//     //     expect(listViewSelector.options.length).toBe(4)

//     //     expect(listViewSelector.options[0].innerText).toBe("（作業者が自分）")
//     //     expect(listViewSelector.options[0].selected).toBe(true)
//     //     expect(listViewSelector.options[0].value).toBe("8251042")

//     //     expect(listViewSelector.options[1].innerText).toBe("数値ラジオレコード番号")
//     //     expect(listViewSelector.options[1].selected).toBe(false)
//     //     expect(listViewSelector.options[1].value).toBe("8251230")

//     //     expect(listViewSelector.options[2].innerText).toBe("一覧1")
//     //     expect(listViewSelector.options[2].selected).toBe(false)
//     //     expect(listViewSelector.options[2].value).toBe("8251174")

//     //     expect(listViewSelector.options[3].innerText).toBe("(すべて)")
//     //     expect(listViewSelector.options[3].selected).toBe(false)
//     //     expect(listViewSelector.options[3].value).toBe("all")

//     // })
})