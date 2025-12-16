import {
	judgeOperateType,
	validateLoginNameAndDomain,
} from "../chobiitCheckUserOperateType";

describe("chobiit check user operate type", () => {
	test("operateType is update", () => {
		const isExistUser = true;
		const targetUserIsOne = ["test"];

		const deletedUserIsNone = [];
		expect(
			judgeOperateType(isExistUser, deletedUserIsNone, targetUserIsOne),
		).toBe("update");

		const deletedUserIsOne = ["test"];
		expect(
			judgeOperateType(isExistUser, deletedUserIsOne, targetUserIsOne),
		).toBe("update");
	});

	test("operateType is create", () => {
		const isExistUser = false;
		const deletedTargetUserIsNone = [];

		const targetUserIsNone = [];
		expect(
			judgeOperateType(isExistUser, deletedTargetUserIsNone, targetUserIsNone),
		).toBe("create");

		const targetUserIsOne = ["test"];
		expect(
			judgeOperateType(isExistUser, deletedTargetUserIsNone, targetUserIsOne),
		).toBe("create");
	});

	test("operateType is none", () => {
		let isExistUser = false;
		const targetUserIsNone = [];
		const deletedTargetUserIsOne = ["test"];

		expect(
			judgeOperateType(isExistUser, deletedTargetUserIsOne, targetUserIsNone),
		).toBe("none");

		isExistUser = true;
		expect(
			judgeOperateType(isExistUser, deletedTargetUserIsOne, targetUserIsNone),
		).toBe("none");
	});

	test("loginName validate", () => {
		const emptyLoginName = "";
		const undefinedLoginName = undefined;
		const domain = "test";

		expect(() => {
			validateLoginNameAndDomain(emptyLoginName, domain);
		}).toThrow("Login name is empty.");

		expect(() => {
			validateLoginNameAndDomain(undefinedLoginName, domain);
		}).toThrow("No query parameter Login name.");
	});

	test("domain validate", () => {
		const loginName = "test";
		const emptyDomain = "";
		const undefinedDomain = undefined;

		expect(() => {
			validateLoginNameAndDomain(loginName, emptyDomain);
		}).toThrow("Domain is empty.");

		expect(() => {
			validateLoginNameAndDomain(loginName, undefinedDomain);
		}).toThrow("No query parameter domain.");
	});
});
