
/**
 * Test suite for the `extractFieldFromLookupRecords` function.
 * 
 * This suite contains multiple test cases to verify the behavior of the function
 * under different scenarios, including:
 * - When `lookupPickerFields` and `fieldMappings` are provided.
 * - When `lookupPickerFields` is an empty array.
 * - When `fieldMappings` is an empty array.
 * - When both `lookupPickerFields` and `fieldMappings` are empty arrays.
 * 
 * Each test case checks the function's ability to extract relevant fields from
 * the provided records, and optionally include fields specified in `lkCompleteMatch`.
 */

import { extractFieldFromLookupRecords } from './extract-field-from-lookup-records';
import { KintoneRESTAPI } from 'chobiit-common/src/types/kintone';
import { LookupInfo } from 'chobiit-common/src/types/chobiit';

describe('extractFieldFromLookupRecords', () => {
  describe('lookupPickerFields and fieldMappings are exists', () => {
    const lookupInfo: LookupInfo = {
      relatedKeyField: 'relatedKeyField',
      lookupPickerFields: ['lookupPickerField1', 'lookupPickerField2'],
      fieldMappings: [
        { field: 'mappedField1', relatedField: 'relatedField1' },
        { field: 'mappedField2', relatedField: 'relatedField2' },
      ],
      relatedApp: {
        app: '',
        code: ''
      },
      sort: '',
      filterCond: ''
    };

    const records: KintoneRESTAPI.KintoneRecord[] = [
      {
        $id: { type: 'RECORD_NUMBER', value: '1' },
        relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
        lookupPickerField1: { type: 'SINGLE_LINE_TEXT', value: 'value3' },
        relatedField1: { type: 'SINGLE_LINE_TEXT', value: 'value4' },
        unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value5' },
      },
      {
        $id: { type: 'RECORD_NUMBER', value: '2' },
        relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
        lookupPickerField2: { type: 'SINGLE_LINE_TEXT', value: 'value8' },
        relatedField2: { type: 'SINGLE_LINE_TEXT', value: 'value9' },
        unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value10' },
      },
    ];

    it('should extract only the relevant fields from the records', () => {
      const result = extractFieldFromLookupRecords({
        records,
        lookupInfo,
        lkCompleteMatch: undefined,
      });

      expect(result).toEqual([
        {
          $id: { type: 'RECORD_NUMBER', value: '1' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
          lookupPickerField1: { type: 'SINGLE_LINE_TEXT', value: 'value3' },
          relatedField1: { type: 'SINGLE_LINE_TEXT', value: 'value4' },
        },
        {
          $id: { type: 'RECORD_NUMBER', value: '2' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
          lookupPickerField2: { type: 'SINGLE_LINE_TEXT', value: 'value8' },
          relatedField2: { type: 'SINGLE_LINE_TEXT', value: 'value9' },
        },
      ]);
    });

    it('should include fields from lkCompleteMatch if provided', () => {
      const result = extractFieldFromLookupRecords({
        records,
        lookupInfo,
        lkCompleteMatch: ['unrelatedField'],
      });

      expect(result).toEqual([
        {
          $id: { type: 'RECORD_NUMBER', value: '1' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
          lookupPickerField1: { type: 'SINGLE_LINE_TEXT', value: 'value3' },
          relatedField1: { type: 'SINGLE_LINE_TEXT', value: 'value4' },
          unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value5' },
        },
        {
          $id: { type: 'RECORD_NUMBER', value: '2' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
          lookupPickerField2: { type: 'SINGLE_LINE_TEXT', value: 'value8' },
          relatedField2: { type: 'SINGLE_LINE_TEXT', value: 'value9' },
          unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value10' },
        },
      ]);
    });
  })

  describe('lookupPickerFields is empty array', () => {
    const lookupInfo: LookupInfo = {
      relatedKeyField: 'relatedKeyField',
      lookupPickerFields: [],
      fieldMappings: [
        { field: 'mappedField1', relatedField: 'relatedField1' },
        { field: 'mappedField2', relatedField: 'relatedField2' },
      ],
      relatedApp: {
        app: '',
        code: ''
      },
      sort: '',
      filterCond: ''
    };

    const records: KintoneRESTAPI.KintoneRecord[] = [
      {
        $id: { type: 'RECORD_NUMBER', value: '1' },
        relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
        lookupPickerField1: { type: 'SINGLE_LINE_TEXT', value: 'value3' },
        relatedField1: { type: 'SINGLE_LINE_TEXT', value: 'value4' },
        unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value5' },
      },
      {
        $id: { type: 'RECORD_NUMBER', value: '2' },
        relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
        lookupPickerField2: { type: 'SINGLE_LINE_TEXT', value: 'value8' },
        relatedField2: { type: 'SINGLE_LINE_TEXT', value: 'value9' },
        unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value10' },
      },
    ];

    it('should extract only the relevant fields from the records', () => {
      const result = extractFieldFromLookupRecords({
        records,
        lookupInfo,
        lkCompleteMatch: undefined,
      });

      expect(result).toEqual([
        {
          $id: { type: 'RECORD_NUMBER', value: '1' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
          relatedField1: { type: 'SINGLE_LINE_TEXT', value: 'value4' },
        },
        {
          $id: { type: 'RECORD_NUMBER', value: '2' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
          relatedField2: { type: 'SINGLE_LINE_TEXT', value: 'value9' },
        },
      ]);
    });

    it('should include fields from lkCompleteMatch if provided', () => {
      const result = extractFieldFromLookupRecords({
        records,
        lookupInfo,
        lkCompleteMatch: ['unrelatedField'],
      });

      expect(result).toEqual([
        {
          $id: { type: 'RECORD_NUMBER', value: '1' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
          relatedField1: { type: 'SINGLE_LINE_TEXT', value: 'value4' },
          unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value5' },
        },
        {
          $id: { type: 'RECORD_NUMBER', value: '2' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
          relatedField2: { type: 'SINGLE_LINE_TEXT', value: 'value9' },
          unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value10' },
        },
      ]);
    });

    it('should handle empty lookupPickerFields', () => {

      const result = extractFieldFromLookupRecords({
        records,
        lookupInfo: lookupInfo,
        lkCompleteMatch: undefined,
      });

      expect(result).toEqual([
        {
          $id: { type: 'RECORD_NUMBER', value: '1' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
          relatedField1: { type: 'SINGLE_LINE_TEXT', value: 'value4' },
        },
        {
          $id: { type: 'RECORD_NUMBER', value: '2' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
          relatedField2: { type: 'SINGLE_LINE_TEXT', value: 'value9' },
        },
      ]);
    });
  });

  describe('fieldMappings is empty array', () => {
    const lookupInfo: LookupInfo = {
      relatedKeyField: 'relatedKeyField',
      lookupPickerFields: ['lookupPickerField1', 'lookupPickerField2'],
      fieldMappings: [],
      relatedApp: {
        app: '',
        code: ''
      },
      sort: '',
      filterCond: ''
    };

    const records: KintoneRESTAPI.KintoneRecord[] = [
      {
        $id: { type: 'RECORD_NUMBER', value: '1' },
        relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
        lookupPickerField1: { type: 'SINGLE_LINE_TEXT', value: 'value3' },
        relatedField1: { type: 'SINGLE_LINE_TEXT', value: 'value4' },
        unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value5' },
      },
      {
        $id: { type: 'RECORD_NUMBER', value: '2' },
        relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
        lookupPickerField2: { type: 'SINGLE_LINE_TEXT', value: 'value8' },
        relatedField2: { type: 'SINGLE_LINE_TEXT', value: 'value9' },
        unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value10' },
      },
    ];

    it('should extract only the relevant fields from the records', () => {
      const result = extractFieldFromLookupRecords({
        records,
        lookupInfo,
        lkCompleteMatch: undefined,
      });

      expect(result).toEqual([
        {
          $id: { type: 'RECORD_NUMBER', value: '1' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
          lookupPickerField1: { type: 'SINGLE_LINE_TEXT', value: 'value3' },
        },
        {
          $id: { type: 'RECORD_NUMBER', value: '2' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
          lookupPickerField2: { type: 'SINGLE_LINE_TEXT', value: 'value8' },
        },
      ]);
    })

    it('should include fields from lkCompleteMatch if provided', () => {
      const result = extractFieldFromLookupRecords({
        records,
        lookupInfo,
        lkCompleteMatch: ['unrelatedField'],
      });

      expect(result).toEqual([
        {
          $id: { type: 'RECORD_NUMBER', value: '1' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
          lookupPickerField1: { type: 'SINGLE_LINE_TEXT', value: 'value3' },
          unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value5' },
        },
        {
          $id: { type: 'RECORD_NUMBER', value: '2' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
          lookupPickerField2: { type: 'SINGLE_LINE_TEXT', value: 'value8' },
          unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value10' },
        },
      ]);
    });
  })

  describe('fieldMappings and lookupPickerFields are empty array', () => {
    const lookupInfo: LookupInfo = {
      relatedKeyField: 'relatedKeyField',
      lookupPickerFields: [],
      fieldMappings: [],
      relatedApp: {
        app: '',
        code: ''
      },
      sort: '',
      filterCond: ''
    };

    const records: KintoneRESTAPI.KintoneRecord[] = [
      {
        $id: { type: 'RECORD_NUMBER', value: '1' },
        relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
        lookupPickerField1: { type: 'SINGLE_LINE_TEXT', value: 'value3' },
        relatedField1: { type: 'SINGLE_LINE_TEXT', value: 'value4' },
        unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value5' },
      },
      {
        $id: { type: 'RECORD_NUMBER', value: '2' },
        relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
        lookupPickerField2: { type: 'SINGLE_LINE_TEXT', value: 'value8' },
        relatedField2: { type: 'SINGLE_LINE_TEXT', value: 'value9' },
        unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value10' },
      },
    ];

    it('should extract only the relevant fields from the records', () => {
      const result = extractFieldFromLookupRecords({
        records,
        lookupInfo,
        lkCompleteMatch: undefined,
      });

      expect(result).toEqual([
        {
          $id: { type: 'RECORD_NUMBER', value: '1' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
        },
        {
          $id: { type: 'RECORD_NUMBER', value: '2' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
        },
      ]);
    });

    it('should include fields from lkCompleteMatch if provided', () => {
      const result = extractFieldFromLookupRecords({
        records,
        lookupInfo,
        lkCompleteMatch: ['unrelatedField'],
      });

      expect(result).toEqual([
        {
          $id: { type: 'RECORD_NUMBER', value: '1' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value2' },
          unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value5' },
        },
        {
          $id: { type: 'RECORD_NUMBER', value: '2' },
          relatedKeyField: { type: 'SINGLE_LINE_TEXT', value: 'value7' },
          unrelatedField: { type: 'SINGLE_LINE_TEXT', value: 'value10' },
        },
      ]);
    });
  });
});
