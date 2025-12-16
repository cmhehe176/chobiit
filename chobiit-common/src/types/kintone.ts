import type {OneOf} from "@kintone/rest-api-client/lib/src/KintoneFields/exportTypes/field";

export namespace KintoneRESTAPI {
    export type KintoneFieldCode = string;
    export type KintoneFieldValue = OneOf;
    export type KintoneFieldTypes = OneOf["type"]
    export type KintoneRecord = Record<KintoneFieldCode, KintoneFieldValue>;
}