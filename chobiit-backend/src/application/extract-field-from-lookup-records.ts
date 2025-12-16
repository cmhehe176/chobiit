import { KintoneRESTAPI } from "chobiit-common/src/types/kintone";
import { LookupInfo, lkCompleteMatch } from "chobiit-common/src/types/chobiit";

type ExtractFieldFromLookupRecordsParams = {
  records: KintoneRESTAPI.KintoneRecord[];
  lookupInfo: LookupInfo;
  lkCompleteMatch: lkCompleteMatch;
}

const FIELDS_USED_IN_FRONT = ["$id"];

export function extractFieldFromLookupRecords(params: ExtractFieldFromLookupRecordsParams): KintoneRESTAPI.KintoneRecord[] {
  const { records, lookupInfo, lkCompleteMatch } = params;
  const extractedRecords: KintoneRESTAPI.KintoneRecord[] = [];

  for (const record of records) {
    const extractedRecord: KintoneRESTAPI.KintoneRecord = {};

    for (const [fieldCode, fieldValue] of Object.entries(record)) {
      if (isLookupField(fieldCode, lookupInfo, lkCompleteMatch)) {
        extractedRecord[fieldCode] = fieldValue;
      }
    }
    extractedRecords.push(extractedRecord);
  }

  return extractedRecords;
}

function isLookupField(fieldCode: string, lookupInfo: LookupInfo, lkCompleteMatch: lkCompleteMatch): boolean {

  // field used as lookup key
  if (fieldCode === lookupInfo.relatedKeyField) {
    return true;
  }

  // fields displayed in lookup result list
  if (lookupInfo.lookupPickerFields.includes(fieldCode)) {
    return true;
  }

  // fields used as copy source
  if (lookupInfo.fieldMappings.some((fieldMapping) => fieldMapping.relatedField === fieldCode)) {
    return true;
  }

  // fields used in lookup complete match
  // Always false in the Japanese version, as it is a feature not offered in the Japanese version.
  if (Array.isArray(lkCompleteMatch) && lkCompleteMatch.includes(fieldCode)) {
    return true;
  }

  // Fields used in front processing
  if (FIELDS_USED_IN_FRONT.includes(fieldCode)) {
    return true;
  }

  return false;
}
