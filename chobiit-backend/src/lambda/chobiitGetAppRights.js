const AWS = require("aws-sdk");

const {
	default: ListOrganizationsService,
} = require("../application/list-organizations-service");

const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = "chobitoneUser";
const appTableName = "chobitoneApp";

exports.handler = (event, context, callback) => {
	console.log("Starting get app rights", JSON.stringify(event, null, 2));
	const appId = event.pathParameters.id;
	const domain = event.requestContext.authorizer.claims["custom:domain"];
	const loginName = event.requestContext.authorizer.claims["nickname"];

	const queries = {
		TableName: userTableName,
		Key: {
			domain: domain,
			loginName: loginName,
		},
	};

	docClient.get(queries, function (err, data) {
		if (err) {
			console.error(
				"Unable to get user info. Error:",
				JSON.stringify(err, null, 2),
			);
			return handleError(err, callback);
		} else {
			if (data.Item) {
				data.Item.appId = appId;
				data.Item.domain = domain;
				ListOrganizationsService.getOrganizationWithChildren(data.Item)
					.then((organizationInfo) => {
						handleSuccess(data.Item, organizationInfo, callback);
					})
					.catch((err) => {
						handleError(err, callback);
					});
			} else {
				return handleError(new Error("Invalid token"), callback);
			}
		}
	});
};

function handleSuccess(data, organizationInfo, callback) {
	console.log("Handle success:", JSON.stringify(data, null, 2));
	let kintoneLoginName = data.kintoneLoginName;
	let kintoneOrganizations = data.kintoneOrganizations;
	let kintoneGroups = data.kintoneGroups;

	let queries = {
		TableName: appTableName,
		Key: {
			domain: data.domain,
			app: data.appId,
		},
	};

	docClient.get(queries, function (err, data) {
		if (err) {
			console.error(
				"Unable to get app info from DynamoDB. Error:",
				JSON.stringify(err, null, 2),
			);
			handleError(err, callback);
		} else {
			console.log("Get app info from DynamoDB succeed.", JSON.stringify(data));
			if (data.Item) {
				let location = data.Item.locateCond;

				let fieldRights = data.Item.fieldRights.map(function (fRight) {
					let field = fRight.code;
					let entities = fRight.entities;
					let ac;
					for (let j = 0; j < entities.length; j++) {
						let item = entities[j];
						if (
							item.entity.type == "USER" &&
							kintoneLoginName == item.entity.code
						) {
							ac = item.accessibility;
							break;
						} else if (
							item.entity.type == "GROUP" &&
							kintoneGroups.includes(item.entity.code)
						) {
							ac = item.accessibility;
							break;
						} else if (
							item.entity.type == "ORGANIZATION" &&
							kintoneOrganizations.includes(item.entity.code)
						) {
							ac = item.accessibility;
							break;
						} else if (item.entity.type == "ORGANIZATION" && item.includeSubs) {
							let found = organizationInfo.find(
								(x) => x.code == item.entity.code,
							);
							if (found && checkArr(found.listChild, kintoneOrganizations)) {
								ac = item.accessibility;
								break;
							}
						}
					}
					// このコメントは必要でない場合削除する
					console.log("ac: " + ac);
					return {
						field: field,
						ac: ac,
					};
				});

				let responseBody = {
					code: 200,
					fieldRights: fieldRights,
					location: location,
				};

				let response = {
					headers: getHeader(),
					body: JSON.stringify(responseBody),
				};

				callback(null, response);
			} else {
				handleError(new Error("App info not found"), callback);
			}
		}
	});
}

function checkArr(arr1, arr2) {
	console.log("arr1: ", arr1);
	console.log("arr2: ", arr2);
	let check = false;
	JSON.parse(arr2).forEach((x) => {
		console.log(x);
		if (arr1.includes(x)) {
			check = true;
			return;
		}
	});
	return check;
}

function handleError(error, callback) {
	console.log("Handle error:", JSON.stringify(error, null, 2));
	let responseBody = {
		code: 400,
		message: "Get app rights failed",
		messageDev: error.message,
	};

	let response = {
		headers: getHeader(),
		body: JSON.stringify(responseBody),
	};

	callback(null, response);
}

function getHeader(origin) {
	let headers = {
		"Access-Control-Allow-Credentials": "true",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers":
			"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
		"Access-Control-Allow-Methods": "GET, OPTIONS",
		"Cache-Control": "no-cache, must-revalidate",
		"Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
		"X-Content-Type-Options": "nosniff",
		"Referrer-Policy": "same-origin",
		Expires: "-1",
		Pragma: "no-cache",
	};

	return headers;
}
