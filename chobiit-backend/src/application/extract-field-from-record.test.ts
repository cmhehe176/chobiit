import { extractFieldPublicRecord } from './extract-field-from-record';
import { ChobitoneApp } from "chobiit-common/src/types/chobiit";
import { KintoneRESTAPI } from "chobiit-common/src/types/kintone";

/**
 * テストケース資料: https://docs.google.com/spreadsheets/d/1qy3v_TiIv-UTf5-WkYLG5slD30aOiQUY6vXGoJ-9HSI/edit?gid=0#gid=0
 */

describe('extractFieldPublicRecord test', () => {
  describe('action setting = none)', () => {

    const record: KintoneRESTAPI.KintoneRecord = {
      "レコード番号": {
        "type": "RECORD_NUMBER",
        "value": "1"
      },
      "文字列__1行_1_非表示_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストやねん"
      },
      "文字列__1行_2_非表示": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなんだ"
      },
      "文字列__1行_3_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなの"
      },
    }

    const expected = {
      "レコード番号": {
        "type": "RECORD_NUMBER",
        "value": "1"
      },
      "文字列__1行_1_非表示_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストやねん"
      },
      "文字列__1行_2_非表示": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなんだ"
      },
      "文字列__1行_3_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなの"
      },
    }

    describe('test case No.1: show setting length = 0', () => {
      test("all properties not exists", () => {
        const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {}
        const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
        expect(actual).toEqual(expected)
      })

      test("all properties exists", () => {
        const chobitoneApp2: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          actionCondList: [],
          actionCond0: false,
          fieldCond0: []
        }
        const actual = extractFieldPublicRecord(record, chobitoneApp2.actionCond0, chobitoneApp2.actionCondList, chobitoneApp2.fieldCond0)
        expect(actual).toEqual(expected)
      })

      test("exists only actionCond0 and fieldCond0", () => {
        const chobitoneApp3: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          actionCond0: false,
          fieldCond0: []
        }

        const actual = extractFieldPublicRecord(record, chobitoneApp3.actionCond0, chobitoneApp3.actionCondList, chobitoneApp3.fieldCond0)
        expect(actual).toEqual(expected)
      })

      test("exists only fieldCond0", () => {
        const chobitoneApp4: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          fieldCond0: []
        }
        const actual = extractFieldPublicRecord(record, chobitoneApp4.actionCond0, chobitoneApp4.actionCondList, chobitoneApp4.fieldCond0)
        expect(actual).toEqual(expected)
      })


      test("exists only actionCondList", () => {
        const chobitoneApp5: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          actionCondList: [],
        }
        const actual = extractFieldPublicRecord(record, chobitoneApp5.actionCond0, chobitoneApp5.actionCondList, chobitoneApp5.fieldCond0)
        expect(actual).toEqual(expected)
      })


      test("exists only actionCond0", () => {
        const chobitoneApp6: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          actionCond0: false,
        }

        const actual = extractFieldPublicRecord(record, chobitoneApp6.actionCond0, chobitoneApp6.actionCondList, chobitoneApp6.fieldCond0)
        expect(actual).toEqual(expected)
      })

      test("exists only actionCondList and fieldCond0", () => {
        const chobitoneApp7: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          actionCondList: [],
          fieldCond0: []
        }
        const actual = extractFieldPublicRecord(record, chobitoneApp7.actionCond0, chobitoneApp7.actionCondList, chobitoneApp7.fieldCond0)
        expect(actual).toEqual(expected)
      })
    })
    test('test case No.2: show setting length = 2', () => {

      const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
        "fieldCond0": [
          {
            "field": "文字列__1行_1_非表示_コピー元",
            "function": [
              "view"
            ],
            "typeField": "SINGLE_LINE_TEXT"
          },
          {
            "field": "文字列__1行_2_非表示",
            "function": [
              "view"
            ],
            "typeField": "SINGLE_LINE_TEXT"
          }
        ]
      }

      const record: KintoneRESTAPI.KintoneRecord = {
        "レコード番号": {
          "type": "RECORD_NUMBER",
          "value": "1"
        },
        "文字列__1行_1_非表示_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストやねん"
        },
        "文字列__1行_2_非表示": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなんだ"
        },
        "文字列__1行_3_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなの"
        },
      }

      const expected = {
        "レコード番号": {
          "type": "RECORD_NUMBER",
          "value": "1"
        },
        // "文字列__1行_1_非表示_コピー元": {
        //   "type": "SINGLE_LINE_TEXT",
        //   "value": "テストやねん"
        // },
        // "文字列__1行_2_非表示": {
        //   "type": "SINGLE_LINE_TEXT",
        //   "value": "テストなんだ"
        // },
        "文字列__1行_3_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなの"
        },
      }

      const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
      expect(actual).toEqual(expected)
    })
  })
  describe('action setting = old (actionCond0)', () => {
    test('test case No.3: not viewable fields length = 2', () => {

      const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
        "actionCond0": {
          "actionApp": "135",
          "actionName": "action",
          "copyFields": [
            {
              "copyFrom": "文字列__1行_1_非表示_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_1",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            },
            {
              "copyFrom": "文字列__1行_3_非表示_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_3",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            }
          ],
        },
        "fieldCond0": [
          {
            "field": "文字列__1行_1_非表示_コピー元",
            "function": [
              "view"
            ],
            "typeField": "SINGLE_LINE_TEXT"
          },
          {
            "field": "文字列__1行_3_非表示_コピー元",
            "function": [
              "view"
            ],
            "typeField": "SINGLE_LINE_TEXT"
          }
        ]
      }

      const record: KintoneRESTAPI.KintoneRecord = {
        "レコード番号": {
          "type": "RECORD_NUMBER",
          "value": "1"
        },
        "文字列__1行_1_非表示_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストやねん"
        },
        "文字列__1行_2": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなんだ"
        },
        "文字列__1行_3_非表示_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなの"
        },
      }

      const expected = {
        "レコード番号": {
          "type": "RECORD_NUMBER",
          "value": "1"
        },
        "文字列__1行_1_非表示_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストやねん"
        },
        "文字列__1行_2": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなんだ"
        },
        "文字列__1行_3_非表示_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなの"
        },
      }

      const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
      expect(actual).toEqual(expected)
    })

    test('test case No.4: viewable fields length = 2', () => {

      const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
        "actionCond0": {
          "actionApp": "135",
          "actionName": "action",
          "copyFields": [
            {
              "copyFrom": "文字列__1行_1_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_1",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            },
            {
              "copyFrom": "文字列__1行_3_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_3",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            }
          ],
        },
        "fieldCond0": false
      }

      const record: KintoneRESTAPI.KintoneRecord = {
        "レコード番号": {
          "type": "RECORD_NUMBER",
          "value": "1"
        },
        "文字列__1行_1_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストやねん"
        },
        "文字列__1行_2": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなんだ"
        },
        "文字列__1行_3_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなの"
        },
      }

      const expected = {
        "レコード番号": {
          "type": "RECORD_NUMBER",
          "value": "1"
        },
        "文字列__1行_1_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストやねん"
        },
        "文字列__1行_2": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなんだ"
        },
        "文字列__1行_3_コピー元": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなの"
        },
      }

      const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
      expect(actual).toEqual(expected)
    })

    test('test case No.5: not viewable fields length = 2', () => {

      const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
        "actionCond0": {
          "actionApp": "135",
          "actionName": "action",
          "copyFields": [
            {
              "copyFrom": "文字列__1行_コピー元1",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_1",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            },
            {
              "copyFrom": "文字列__1行_コピー元2",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_3",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            }
          ],
        },
        "fieldCond0": [
          {
            "field": "文字列__1行_非表示1",
            "function": [
              "view"
            ],
            "typeField": "SINGLE_LINE_TEXT"
          },
          {
            "field": "文字列__1行_非表示2",
            "function": [
              "view"
            ],
            "typeField": "SINGLE_LINE_TEXT"
          }
        ]
      }

      const record: KintoneRESTAPI.KintoneRecord = {
        "レコード番号": {
          "type": "RECORD_NUMBER",
          "value": "1"
        },
        "文字列__1行_コピー元1": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストやねん"
        },
        "文字列__1行_コピー元2": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなの"
        },
        "文字列__1行_非表示1": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなんだ"
        },
        "文字列__1行_非表示2": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなんだ"
        },
      }

      const expected = {
        "レコード番号": {
          "type": "RECORD_NUMBER",
          "value": "1"
        },
        "文字列__1行_コピー元1": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストやねん"
        },
        "文字列__1行_コピー元2": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなの"
        },
        // "文字列__1行_非表示1": {
        //   "type": "SINGLE_LINE_TEXT",
        //   "value": "テストなんだ"
        // },
        // "文字列__1行_非表示2": {
        //   "type": "SINGLE_LINE_TEXT",
        //   "value": "テストなんだ"
        // },
      }

      const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
      expect(actual).toEqual(expected)
    })

    test('test case No.6: mix, viewable used by action = 2, not viewable = 2', () => {

      const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
        "actionCond0": {
          "actionApp": "135",
          "actionName": "action",
          "copyFields": [
            {
              "copyFrom": "文字列__1行_非表示コピー元1",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_1",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            },
            {
              "copyFrom": "文字列__1行_非表示コピー元2",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_3",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            },
            {
              "copyFrom": "文字列__1行_コピー元1",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_1",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            },
            {
              "copyFrom": "文字列__1行_コピー元2",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_3",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            }
          ],
        },
        "fieldCond0": [
          {
            "field": "文字列__1行_非表示コピー元1",
            "function": [
              "view"
            ],
            "typeField": "SINGLE_LINE_TEXT"
          },
          {
            "field": "文字列__1行_非表示コピー元2",
            "function": [
              "view"
            ],
            "typeField": "SINGLE_LINE_TEXT"
          }
        ]
      }

      const record: KintoneRESTAPI.KintoneRecord = {
        "レコード番号": {
          "type": "RECORD_NUMBER",
          "value": "1"
        },
        "文字列__1行_非表示コピー元1": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストやねん"
        },
        "文字列__1行_非表示コピー元2": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなの"
        },
        "文字列__1行_コピー元1": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなんだ"
        },
        "文字列__1行_コピー元2": {
          "type": "SINGLE_LINE_TEXT",
          "value": "テストなんだ"
        },
      }

      const expected = record

      const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
      expect(actual).toEqual(expected)
    })

  })

  describe('action setting = current (actionCondList)', () => {
    describe('actionCondList length = 1', () => {
      test('test case No.7: not viewable fields length = 2', () => {

        const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          "actionCondList": [
            {
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_1_非表示_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_3_非表示_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                }
              ],
              webhookSync: false,
            }
          ],
          "fieldCond0": [
            {
              "field": "文字列__1行_1_非表示_コピー元",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            },
            {
              "field": "文字列__1行_3_非表示_コピー元",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            }
          ]
        }

        const record: KintoneRESTAPI.KintoneRecord = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_1_非表示_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_3_非表示_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
        }

        const expected = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_1_非表示_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_3_非表示_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
        }

        const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
        expect(actual).toEqual(expected)
      })

      test('test case No.8: viewable fields length = 2', () => {

        const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          "actionCondList": [
            {
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_1_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_3_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                }
              ],
              webhookSync: false,
            }
          ],
          "fieldCond0": false
        }

        const record: KintoneRESTAPI.KintoneRecord = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_1_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_3_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
        }

        const expected = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_1_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_3_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
        }

        const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
        expect(actual).toEqual(expected)
      })

      test('test case No.9: not viewable fields length = 2', () => {

        const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          "actionCondList":
            [{
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_コピー元1",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_コピー元2",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                }
              ],
              webhookSync: false,
            }],
          "fieldCond0": [
            {
              "field": "文字列__1行_非表示1",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            },
            {
              "field": "文字列__1行_非表示2",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            }
          ]
        }

        const record: KintoneRESTAPI.KintoneRecord = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_コピー元1": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_コピー元2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
          "文字列__1行_非表示1": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_非表示2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
        }

        const expected = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_コピー元1": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_コピー元2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
          // "文字列__1行_非表示1": {
          //   "type": "SINGLE_LINE_TEXT",
          //   "value": "テストなんだ"
          // },
          // "文字列__1行_非表示2": {
          //   "type": "SINGLE_LINE_TEXT",
          //   "value": "テストなんだ"
          // },
        }

        const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
        expect(actual).toEqual(expected)
      })

      test('test case No.10: mix, viewable used by action = 2, not viewable = 2', () => {

        const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          "actionCondList": [
            {
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_非表示コピー元1",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_非表示コピー元2",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_コピー元1",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_コピー元2",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                }
              ],
              webhookSync: false,
            }
          ],
          "fieldCond0": [
            {
              "field": "文字列__1行_非表示コピー元1",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            },
            {
              "field": "文字列__1行_非表示コピー元2",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            }
          ]
        }

        const record: KintoneRESTAPI.KintoneRecord = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_非表示コピー元1": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_非表示コピー元2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
          "文字列__1行_コピー元1": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_コピー元2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
        }

        const expected = record

        const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
        expect(actual).toEqual(expected)
      })
    })

    describe('actionCondList length = 2', () => {
      test('test case No.11: not viewable fields length = 2', () => {

        const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          "actionCondList": [
            {
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_1_非表示_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_3_非表示_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                }
              ],
              webhookSync: false,
            },
            {
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_4_非表示_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_5_非表示_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                }
              ],
              webhookSync: false,
            }
          ],
          "fieldCond0": [
            {
              "field": "文字列__1行_1_非表示_コピー元",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            },
            {
              "field": "文字列__1行_3_非表示_コピー元",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            },
            {
              "field": "文字列__1行_4_非表示_コピー元",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            },
            {
              "field": "文字列__1行_5_非表示_コピー元",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            }
          ]
        }

        const record: KintoneRESTAPI.KintoneRecord = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_1_非表示_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_3_非表示_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
          "文字列__1行_4_非表示_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
          "文字列__1行_5_非表示_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
        }

        const expected = record

        const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
        expect(actual).toEqual(expected)
      })

      test('test case No.12: viewable fields length = 2', () => {

        const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          "actionCondList": [
            {
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_1_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_3_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                }
              ],
              webhookSync: false,
            },
            {
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_3_コピー元",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                }
              ],
              webhookSync: false,
            }
          ],
          "fieldCond0": false
        }

        const record: KintoneRESTAPI.KintoneRecord = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_1_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_3_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
        }

        const expected = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_1_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_3_コピー元": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
        }

        const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
        expect(actual).toEqual(expected)
      })

      test('test case No.13: not viewable fields length = 2', () => {

        const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          "actionCondList":
            [{
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_コピー元1",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
              ],
              webhookSync: false,
            },
            {
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_コピー元2",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                }
              ],
              webhookSync: false,
            }
            ],
          "fieldCond0": [
            {
              "field": "文字列__1行_非表示1",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            },
            {
              "field": "文字列__1行_非表示2",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            }
          ]
        }

        const record: KintoneRESTAPI.KintoneRecord = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_コピー元1": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_コピー元2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
          "文字列__1行_非表示1": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_非表示2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
        }

        const expected = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_コピー元1": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_コピー元2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
          // "文字列__1行_非表示1": {
          //   "type": "SINGLE_LINE_TEXT",
          //   "value": "テストなんだ"
          // },
          // "文字列__1行_非表示2": {
          //   "type": "SINGLE_LINE_TEXT",
          //   "value": "テストなんだ"
          // },
        }

        const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
        expect(actual).toEqual(expected)
      })

      test('test case No.14: mix, viewable used by action = 2, not viewable = 2', () => {

        const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
          "actionCondList": [
            {
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_非表示コピー元1",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_コピー元2",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
              ],
              webhookSync: false,
            },
            {
              "actionApp": "135",
              "actionName": "action",
              "copyFields": [
                {
                  "copyFrom": "文字列__1行_コピー元1",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_1",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                },
                {
                  "copyFrom": "文字列__1行_非表示コピー元2",
                  "copyFromType": "SINGLE_LINE_TEXT",
                  "copyTo": "文字列__1行_3",
                  "copyToType": "SINGLE_LINE_TEXT",
                  "editable": true
                }
              ],
              webhookSync: false,
            }
          ],
          "fieldCond0": [
            {
              "field": "文字列__1行_非表示コピー元1",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            },
            {
              "field": "文字列__1行_非表示コピー元2",
              "function": [
                "view"
              ],
              "typeField": "SINGLE_LINE_TEXT"
            }
          ]
        }

        const record: KintoneRESTAPI.KintoneRecord = {
          "レコード番号": {
            "type": "RECORD_NUMBER",
            "value": "1"
          },
          "文字列__1行_非表示コピー元1": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストやねん"
          },
          "文字列__1行_非表示コピー元2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなの"
          },
          "文字列__1行_コピー元1": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
          "文字列__1行_コピー元2": {
            "type": "SINGLE_LINE_TEXT",
            "value": "テストなんだ"
          },
        }

        const expected = record

        const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
        expect(actual).toEqual(expected)
      })
    })
  })
  test('additional test 1 ', () => {

    const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
      "actionCondList": [
        {
          "actionApp": "135",
          "actionName": "action",
          "copyFields": [
            {
              "copyFrom": "文字列__1行_1_非表示_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_1",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            },
            {
              "copyFrom": "文字列__1行_3_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_3",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            }
          ],
          "webhookSync": false
        }
      ],
      "fieldCond0": [
        {
          "field": "文字列__1行_1_非表示_コピー元",
          "function": [
            "view"
          ],
          "typeField": "SINGLE_LINE_TEXT"
        },
        {
          "field": "文字列__1行_2_非表示",
          "function": [
            "view"
          ],
          "typeField": "SINGLE_LINE_TEXT"
        }
      ]
    }

    const record: KintoneRESTAPI.KintoneRecord = {
      "レコード番号": {
        "type": "RECORD_NUMBER",
        "value": "1"
      },
      "文字列__1行_1_非表示_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストやねん"
      },
      "文字列__1行_2_非表示": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなんだ"
      },
      "文字列__1行_3_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなの"
      },
    }

    const expected = {
      "レコード番号": {
        "type": "RECORD_NUMBER",
        "value": "1"
      },
      "文字列__1行_1_非表示_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストやねん"
      },
      // "文字列__1行_2_非表示": {
      //     "type": "SINGLE_LINE_TEXT",
      //     "value": "テストなんだ"
      // },
      "文字列__1行_3_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなの"
      },
    }

    const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
    expect(actual).toEqual(expected)
  })

  test('additional test 2: ', () => {

    const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
      "actionCondList": [
        {
          "actionApp": "135",
          "actionName": "action",
          "copyFields": [
            {
              "copyFrom": "文字列__1行_1_非表示_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_1",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            },
            {
              "copyFrom": "文字列__1行_3_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_3",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            }
          ],
          "webhookSync": false
        },
        {
          "actionApp": "136",
          "actionName": "action",
          "copyFields": [
            {
              "copyFrom": "文字列__1行_1_非表示_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_1",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            },
            {
              "copyFrom": "文字列__1行_3_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_3",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            }
          ],
          "webhookSync": false
        },
        {
          "actionApp": "137",
          "actionName": "action",
          "copyFields": [
            {
              "copyFrom": "文字列__1行_4_非表示_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_1",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            },
            {
              "copyFrom": "文字列__1行_6_コピー元",
              "copyFromType": "SINGLE_LINE_TEXT",
              "copyTo": "文字列__1行_3",
              "copyToType": "SINGLE_LINE_TEXT",
              "editable": true
            }
          ],
          "webhookSync": false
        }
      ],
      "fieldCond0": [
        {
          "field": "文字列__1行_1_非表示_コピー元",
          "function": [
            "view"
          ],
          "typeField": "SINGLE_LINE_TEXT"
        },
        {
          "field": "文字列__1行_2_非表示",
          "function": [
            "view"
          ],
          "typeField": "SINGLE_LINE_TEXT"
        }
      ]
    }

    const record: KintoneRESTAPI.KintoneRecord = {
      "レコード番号": {
        "type": "RECORD_NUMBER",
        "value": "1"
      },
      "文字列__1行_1_非表示_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストやねん"
      },
      "文字列__1行_2_非表示": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなんだ"
      },
      "文字列__1行_3_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなの"
      },
      "文字列__1行_4_非表示_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストやねん"
      },
      "文字列__1行_5": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなんだ"
      },
      "文字列__1行_6_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなの"
      },
    }

    const expected = {
      "レコード番号": {
        "type": "RECORD_NUMBER",
        "value": "1"
      },
      "文字列__1行_1_非表示_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストやねん"
      },
      // "文字列__1行_2_非表示": {
      //     "type": "SINGLE_LINE_TEXT",
      //     "value": "テストなんだ"
      // },
      "文字列__1行_3_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなの"
      },
      "文字列__1行_4_非表示_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストやねん"
      },
      "文字列__1行_5": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなんだ"
      },
      "文字列__1行_6_コピー元": {
        "type": "SINGLE_LINE_TEXT",
        "value": "テストなの"
      },
    }

    const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
    expect(actual).toEqual(expected)
  })

  test('additional test 3: 実際の運用データを用いてのテスト("開始"フィールドが閲覧禁止になっている場合)', () => {

    const chobitoneApp: Pick<ChobitoneApp, "actionCondList" | "actionCond0" | "fieldCond0"> = {
      "fieldCond0": [
        { field: '文字列__1行__4', function: [], typeField: 'SINGLE_LINE_TEXT' },
        { field: '開始', function: [ 'view' ], typeField: 'DATETIME' }
      ],
    }

    const record: KintoneRESTAPI.KintoneRecord = {
      'レコード番号': { type: 'RECORD_NUMBER', value: '125' },
      '更新者': { type: 'MODIFIER', value: { code: 'dev-1', name: 'dev-1' } },
      '文字列__1行_': { type: 'SINGLE_LINE_TEXT', value: 'tossy-chobiit320' },
      '終了': { type: 'DATETIME', value: '2024-10-01T14:59:00Z' },
      '複数選択_1': { type: 'MULTI_SELECT', value: [] },
      '文字列__複数行__1': { type: 'MULTI_LINE_TEXT', value: '' },
      '文字列__複数行_': { type: 'MULTI_LINE_TEXT', value: '' },
      '時刻_1': { type: 'TIME', value: null },
      'ルックアップ': { type: 'SINGLE_LINE_TEXT', value: '' },
      '計算': { type: 'CALC', value: '1' },
      '日付': { type: 'DATE', value: null },
      '日時_3': { type: 'DATETIME', value: '' },
      'テーブル': { type: 'SUBTABLE', value: [ [Object] ] },
      '作成者': { type: 'CREATOR', value: { code: 'dev-1', name: 'dev-1' } },
      'ラジオボタン': { type: 'RADIO_BUTTON', value: 'sample1' },
      'ドロップダウン': { type: 'DROP_DOWN', value: null },
      'ラジオボタン_1': { type: 'RADIO_BUTTON', value: 'sample1' },
      '$revision': { type: '__REVISION__', value: '2' },
      '文字列__1行__0': { type: 'SINGLE_LINE_TEXT', value: 'tossy-chobiit320' },
      '文字列__1行__1': { type: 'SINGLE_LINE_TEXT', value: '' },
      '更新日時': { type: 'UPDATED_TIME', value: '2024-09-30T08:24:00Z' },
      '数値_1': { type: 'NUMBER', value: '' },
      'チェックボックス_1': { type: 'CHECK_BOX', value: [] },
      '文字列__1行__4': { type: 'SINGLE_LINE_TEXT', value: 'test' },
      '日時': { type: 'DATETIME', value: '2024-09-30T08:24:00Z' },
      '開始': { type: 'DATETIME', value: '2024-10-01T14:59:00Z' },
      '文字列__1行__3': { type: 'SINGLE_LINE_TEXT', value: '' },
      'ドロップダウン_0': { type: 'DROP_DOWN', value: null },
      '時刻': { type: 'TIME', value: null },
      'チェックボックス': { type: 'CHECK_BOX', value: [] },
      '複数選択': { type: 'MULTI_SELECT', value: [] },
      'リンク_0': { type: 'LINK', value: '' },
      '数値': { type: 'NUMBER', value: '' },
      '添付ファイル': { type: 'FILE', value: [] },
      'リンク': { type: 'LINK', value: '' },
      'ルックアップ_1': { type: 'SINGLE_LINE_TEXT', value: '' },
      '日付_0': { type: 'DATE', value: null },
      '作成日時': { type: 'CREATED_TIME', value: '2024-09-30T08:22:00Z' },
      '日時_1': { type: 'DATETIME', value: '' },
      '日時_0': { type: 'DATETIME', value: '2024-09-30T08:22:00Z' },
      '$id': { type: '__ID__', value: '125' }
    }

    const expected = {
      'レコード番号': { type: 'RECORD_NUMBER', value: '125' },
      '更新者': { type: 'MODIFIER', value: { code: 'dev-1', name: 'dev-1' } },
      '文字列__1行_': { type: 'SINGLE_LINE_TEXT', value: 'tossy-chobiit320' },
      '終了': { type: 'DATETIME', value: '2024-10-01T14:59:00Z' },
      '複数選択_1': { type: 'MULTI_SELECT', value: [] },
      '文字列__複数行__1': { type: 'MULTI_LINE_TEXT', value: '' },
      '文字列__複数行_': { type: 'MULTI_LINE_TEXT', value: '' },
      '時刻_1': { type: 'TIME', value: null },
      'ルックアップ': { type: 'SINGLE_LINE_TEXT', value: '' },
      '計算': { type: 'CALC', value: '1' },
      '日付': { type: 'DATE', value: null },
      '日時_3': { type: 'DATETIME', value: '' },
      'テーブル': { type: 'SUBTABLE', value: [ [Object] ] },
      '作成者': { type: 'CREATOR', value: { code: 'dev-1', name: 'dev-1' } },
      'ラジオボタン': { type: 'RADIO_BUTTON', value: 'sample1' },
      'ドロップダウン': { type: 'DROP_DOWN', value: null },
      'ラジオボタン_1': { type: 'RADIO_BUTTON', value: 'sample1' },
      '$revision': { type: '__REVISION__', value: '2' },
      '文字列__1行__0': { type: 'SINGLE_LINE_TEXT', value: 'tossy-chobiit320' },
      '文字列__1行__1': { type: 'SINGLE_LINE_TEXT', value: '' },
      '更新日時': { type: 'UPDATED_TIME', value: '2024-09-30T08:24:00Z' },
      '数値_1': { type: 'NUMBER', value: '' },
      'チェックボックス_1': { type: 'CHECK_BOX', value: [] },
      '文字列__1行__4': { type: 'SINGLE_LINE_TEXT', value: 'test' },
      '日時': { type: 'DATETIME', value: '2024-09-30T08:24:00Z' },
      // '開始': { type: 'DATETIME', value: '2024-10-01T14:59:00Z' },
      '文字列__1行__3': { type: 'SINGLE_LINE_TEXT', value: '' },
      'ドロップダウン_0': { type: 'DROP_DOWN', value: null },
      '時刻': { type: 'TIME', value: null },
      'チェックボックス': { type: 'CHECK_BOX', value: [] },
      '複数選択': { type: 'MULTI_SELECT', value: [] },
      'リンク_0': { type: 'LINK', value: '' },
      '数値': { type: 'NUMBER', value: '' },
      '添付ファイル': { type: 'FILE', value: [] },
      'リンク': { type: 'LINK', value: '' },
      'ルックアップ_1': { type: 'SINGLE_LINE_TEXT', value: '' },
      '日付_0': { type: 'DATE', value: null },
      '作成日時': { type: 'CREATED_TIME', value: '2024-09-30T08:22:00Z' },
      '日時_1': { type: 'DATETIME', value: '' },
      '日時_0': { type: 'DATETIME', value: '2024-09-30T08:22:00Z' },
      '$id': { type: '__ID__', value: '125' }
    }

    const actual = extractFieldPublicRecord(record, chobitoneApp.actionCond0, chobitoneApp.actionCondList, chobitoneApp.fieldCond0)
    expect(actual).toEqual(expected)
  })
})
