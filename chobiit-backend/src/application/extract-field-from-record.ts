import { ChobitoneApp } from "chobiit-common/src/types/chobiit";
import { KintoneRESTAPI } from "chobiit-common/src/types/kintone";

/**
 * # 概要
 * chobiitPublicGetRecordのレスポンスを必要なフィールドのみに絞り込む
 * 
 * # 方針
 * 以下の条件にすべて一致するフィールドを返却しない
 *  - A = 非表示対象フィールド(fieldCond0[].function.includes("view"))
 *  - 非コピー対象フィールド
 *    - if exists actionCond0: A.includes(actionCond0.copyFields[].copyFrom)
 *   - if exists actionCondList: A.includes(actionCondList[].copyFields[].copyFrom)
 */

export function extractFieldPublicRecord(record: KintoneRESTAPI.KintoneRecord, actionCond0: ChobitoneApp["actionCond0"], actionCondList: ChobitoneApp["actionCondList"], fieldCond0: ChobitoneApp["fieldCond0"]): KintoneRESTAPI.KintoneRecord {
  const enabledActionCondList = actionCondList !== undefined && actionCond0 !== null && actionCondList.length > 0;
  const enabledFieldCond0 = fieldCond0 !== undefined && actionCond0 !== null &&fieldCond0 !== false;

  if (!enabledFieldCond0) {
    console.info("extractFieldPublicRecord: No field to delete");
    return record;
  }

  const copyFromList = enabledActionCondList ? extractCopyFromFieldsByActionCondList(actionCondList || []) : extractCopyFromFieldsByActionCond(actionCond0);
  const notViewFields = extractNotViewFields(fieldCond0);

  const extractedRecord: KintoneRESTAPI.KintoneRecord = {};

  for (const [fieldCode, fieldValue] of Object.entries(record)) {
    if (notViewFields.includes(fieldCode) && !copyFromList.includes(fieldCode)) {
      continue;
    }
    extractedRecord[fieldCode] = fieldValue;
  }

  console.info("extractFieldPublicRecord: Extracted fields", extractedRecord);
  return extractedRecord;
}

function extractCopyFromFieldsByActionCond(actionCond: ChobitoneApp["actionCond0"]): string[] {
  if (actionCond === undefined || actionCond === null || actionCond === false || !Array.isArray(actionCond.copyFields)) {
    return [];
  }

  return actionCond.copyFields.map((copyField) => copyField.copyFrom);
}

function extractCopyFromFieldsByActionCondList(actionCondList: ChobitoneApp["actionCondList"]): string[] {
  if (actionCondList === undefined || actionCondList === null || actionCondList.length === 0 || !Array.isArray(actionCondList)) {
    return [];
  }
  return actionCondList.flatMap((actionCond) => extractCopyFromFieldsByActionCond(actionCond));
}

function extractNotViewFields(fieldCond0: ChobitoneApp["fieldCond0"]): string[] {
  if (fieldCond0 === undefined || fieldCond0 === null || fieldCond0 === false) {
    return [];
  }

  const viewFields: string[] = [];

  for (const field of fieldCond0) {
    if (!field.function || !Array.isArray(field.function)) {
      continue;
    }
    for (const func of field.function) {
      if (func.includes("view")) {
        viewFields.push(field.field);
      }
    }
  }

  return viewFields;
}
