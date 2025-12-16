const {
	userRepository,
	deletedUserRepository,
} = require("../infrastructure/aws-dynamodb-repository");
const {
	AwsCognitoRepository,
} = require("../infrastructure/aws-cognito-repository");

exports.handler = async (event) => {
	const loginName = event.queryStringParameters.loginName;
	const domain = event.queryStringParameters.domain;

	const params = {
		KeyConditionExpression: "#domain = :domain AND loginName = :loginName",
		ExpressionAttributeNames: {
			"#domain": "domain",
		},
		ExpressionAttributeValues: {
			":domain": domain,
			":loginName": loginName,
		},
	};

	try {
		validateLoginNameAndDomain(loginName, domain);

		const isExistUser = await AwsCognitoRepository.isExistUser(loginName);
		const deletedTargetUser = await deletedUserRepository.query(params);
		const targetUser = await userRepository.query(params);

		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
			},
			body: JSON.stringify({
				operateType: judgeOperateType(
					isExistUser,
					deletedTargetUser,
					targetUser,
				),
			}),
		};
	} catch (error) {
		console.error(error.message);
		return {
			statusCode: "400",
			headers: {
				"Access-Control-Allow-Origin": "*",
				"content-type": "application/json",
			},
			body: JSON.stringify({ errorMessage: error.message }),
		};
	}
};

const judgeOperateType = (isExistUser, deletedTargetUser, targetUser) => {
	const existUserNumber = 1;
	const notExistUserNumber = 0;

	if (!isExistUser) {
		if (deletedTargetUser.length === notExistUserNumber) {
			return "create";
		}
	} else {
		if (targetUser.length === existUserNumber) {
			return "update";
		}
	}
	return "none";
};

const validateLoginNameAndDomain = (loginName, domain) => {
	if (loginName === "") {
		throw new Error("Login name is empty.");
	}

	if (domain === "") {
		throw new Error("Domain is empty.");
	}

	if (loginName === undefined) {
		throw new Error("No query parameter Login name.");
	}

	if (domain === undefined) {
		throw new Error("No query parameter domain.");
	}
};

exports.judgeOperateType = judgeOperateType;
exports.validateLoginNameAndDomain = validateLoginNameAndDomain;
