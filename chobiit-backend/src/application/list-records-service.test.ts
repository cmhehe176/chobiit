import ListRecordsService from "./list-records-service";
import KintoneRecordRepository from "../infrastructure/kintone-record-repository";

describe("ListRecordsService.listRecords", () => {
    test("It passes the correct parameters to KintoneRecordRepository.getAll.", async () => {
        const mockGetAll = jest.fn();
        KintoneRecordRepository.getAll = mockGetAll;

        await ListRecordsService.listRecords("public")("domain", "token1", {app: "app", query: "query"}, {fields: {}});

        expect(mockGetAll.mock.calls[0][1]).toEqual({chobiitUsageSituation: "public", token: "token1"});
    });
});

describe("ListRecordsService.listCalendarRecords", () => {
    test("It passes the correct parameters to KintoneRecordRepository.getAll.", async () => {
        const mockGetAll = jest.fn();
        KintoneRecordRepository.getAll = mockGetAll;
        mockGetAll.mockReturnValueOnce(Promise.resolve({
            records: Array(1).fill({number: {value: 1}}),
            totalCount: "1",
        }));

        await ListRecordsService.listCalendarRecords("public")("domain", "token2", {app: "app", query: "query"}, {fields: {}});

        expect(mockGetAll.mock.calls[0][1]).toEqual({chobiitUsageSituation: "public", token: "token2"});
    });

    test("It can get records recursively.", async () => {
        const mockGetAll = jest.fn();
        mockGetAll.mockReturnValueOnce(Promise.resolve({
            records: Array(500).fill({number: {value: 1}}),
            totalCount: "500",
        }));
        mockGetAll.mockReturnValueOnce(Promise.resolve({
            records: Array(500).fill({number: {value: 2}}),
            totalCount: "500",
        }));
        mockGetAll.mockReturnValueOnce(Promise.resolve({
            records: Array(100).fill({number: {value: 3}}),
            totalCount: "100",
        }));
        
        KintoneRecordRepository.getAll = mockGetAll;
        
        const result = await ListRecordsService.listCalendarRecords("public")("domain", "token", {app: "app", query: "query"}, {fields: {}});
        
        expect(result.totalCount).toBe("1100");
        expect(result.records).toEqual(
            [
                ...Array(500).fill({number: {value: 1}}),
                ...Array(500).fill({number: {value: 2}}),
                ...Array(100).fill({number: {value: 3}}),
            ]
        );
    });
});