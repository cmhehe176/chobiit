/* eslint-disable no-undef */
/* eslint-disable no-useless-escape */
const saveRecordUtility = require("./save-record-utility");
const setMaxHeightIframe = require("./style-adjustments/customize-iframe.js");
const LocaleService =
	require("chobiit-common/src/application/locale-service").default;
const localeService = LocaleService.getInstance("client");
const loader = document.getElementById("loader");
const iframe = document.getElementById("iframe");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const appId = window.getQueryStringByName("appId");
let userInfo = JSON.parse(localStorage.getItem("userInfo"));
let loginName = userInfo.loginName;
let domain = window.getKintoneDomain();
let idToken = JSON.parse(localStorage.getItem("idToken"));
const chobiitNoReplyEmail = process.env.CHOBIIT_NO_REPLY_EMAIL_ADDRESS;
let fieldRights;
let fileSpace = [];

loader.style.display = "block";
$(".se-pre-con").css("background", "white");

window.onload = function () {
	Promise.all([loadAppListData(), window.getAppSetting(appId)])
		.then(([load, appSetting]) => {
			window.changeColor(appSetting.templateColor);
			loadAppForm(appSetting);

			$(`.text-add-${appId}`).text(appSetting.showText.add);

			/**
			 * ユーザーが設定した保存ボタンの名称を反映させています
			 */
			if (appSetting.saveButtonName) {
				$("#submitBtn").text(appSetting.saveButtonName);
			}

			/**
			 * ユーザーが設定したレイアウトのCSSを追加する
			 */
			if (appSetting.cssCustom && appSetting.cssCustom.length) {
				window.addCustomFile(appSetting.cssCustom, "css");
			}
		})
		.catch((err) => {
			loader.style.display = "none";
			swal(
				localeService.translate("common", "error-title"),
				localeService.translate("error", "cannot-get-app-config"),
				"error",
			);
			console.error("get app setting fail");
			console.error(err);
			window.storeErr(err, "Add record  page");
		});
};

/* eslint-disable-next-line no-undef */
$("iframe").on("load", function () {
	setMaxHeightIframe();
	let iframeElement = this;
	const ro = new ResizeObserver((entries, observer) => {
		iframeElement.style.height =
			Math.floor(entries[0].contentRect.height) + 50 + "px";
	});
	ro.observe(
		document
			.getElementById("iframe")
			.contentWindow.document.querySelector(".container-fluid"),
	);

	$("iframe")
		.contents()
		.find("table")
		.each(function () {
			if (
				$(this).attr("data-type") != "REFERENCE_TABLE" &&
				$(this).find("td").length == 1
			) {
				$(this).hide();
			}
		});

	/**
	 * ファイル追加時の処理
	 */
	$("iframe")
		.contents()
		.on("change", "input:file", function () {
			let files = Array.from(this.files);

			files.forEach((file) => {
				let fileId = window.getUniqueStr();

				fileSpace.push({
					fileId: fileId,
					file: file,
				});

				let label = `<div name="${file.name}" file-id="${fileId}" class="label label-info"><i class="delete-file fas fa-times"></i> ${file.name}</div>`;
				$(this).parent().parent().append(label);
			});

			$(this).val("");
		});

	$("iframe")
		.contents()
		.on("click", ".delete-file", function () {
			let fileId = $(this).parent().attr("file-id");
			fileSpace = fileSpace.filter((file) => file.fileId != fileId);
			$(this).parent().remove();
		});

	let appSetting = JSON.parse(sessionStorage.getItem("appSetting"));

	/**
	 * ユーザーが設定したテンプレート保存の処理
	 */
	if (appSetting.tempSaving) {
		tempSavingHandler(appSetting.tempSaving);
	}
});

cancelBtn.addEventListener("click", function () {
	window.history.back();
});

$(submitBtn).click(submitHandler);

window.submitHanlder = submitHandler;
function submitHandler() {
	let appSetting = JSON.parse(sessionStorage.getItem("appSetting"));
	if (appSetting.responseControl) {
		let key = [domain, appId, "responseControl"].join("_");
		if (localStorage.getItem(key)) {
			let duration = appSetting.responseControl.duration;
			if (!duration) {
				swal(
					localeService.translate("common", "error-title"),
					localeService.translate("error", "already-submitted"),
					"error",
				);
				return false;
			} else {
				let date = appSetting.responseControl.duration.durationDate;
				if (+moment() >= +moment(date).add(1, "days").startOf("day")) {
					localStorage.removeItem(key);
				} else {
					swal(
						localeService.translate("common", "error-title"),
						localeService.translate("error", "already-submitted"),
						"error",
					);
					return false;
				}
			}
		}
	}

	let iframeContent = iframe.contentWindow.document;
	console.log("starting add record...");
	loader.style.display = "block";
	let alerts = iframeContent.getElementsByClassName("alert alert-danger");
	while (alerts.length > 0) {
		alerts[0].parentNode.removeChild(alerts[0]);
	}

	/**
	 * レコード内のフィールドの検証
	 */
	let recordFields = Array.from(
		iframeContent.getElementsByClassName("kintone-data"),
	);
	let submitData = {};
	let fileContainer = [];
	let errorBag = [];
	let isValid = recordFields.map(function (fieldDom) {
		if (!fieldDom.hasAttribute("read")) {
			if (!saveRecordUtility.validateField(fieldDom)) {
				/**
				 * フィールドが必須か権限があるかを確認する
				 */
				let fieldCode = fieldDom.dataset.code;
				let thisFieldRight;
				if (fieldRights) {
					thisFieldRight = fieldRights.find((right) => {
						return right.field === fieldCode;
					});
				}
				if (
					thisFieldRight &&
					(thisFieldRight.ac === "NONE" || thisFieldRight.ac === "READ")
				) {
					let fieldLabel = fieldDom.dataset.label;
					errorBag.push(
						`Field "${fieldCode}" with label "${fieldLabel}" is required but does not have right to write. Please contact administrator`,
					);
				}

				return false;
			}
			saveRecordUtility.storeFieldValue(
				fieldDom,
				submitData,
				fileContainer,
				fileSpace,
			);
		}
		return true;
	});

	if (isValid && !isValid.includes(false)) {
		$("#submitBtn").prop("disabled", true);
		if (fileContainer.length > 0) {
			let uploadFileAPIUrl = `${window._config.api.uploadFile}`;
			saveRecordUtility
				.uploadFileToKintone(fileContainer, uploadFileAPIUrl, idToken)
				.then((uploadFileResponse) => {
					uploadFileResponse.forEach((field) => {
						Object.assign(submitData, field);
					});
					submitNewRecord(submitData);
				})
				.catch((e) => {
					$("#submitBtn").prop("disabled", false);
					console.error(e);
					swal(
						localeService.translate("common", "error-title"),
						localeService.translate("error", "file-upload-failed"),
						"error",
					);
					window.storeErr(e, "upload file function");
					loader.style.display = "none";
				});
		} else {
			submitNewRecord(submitData);
		}
	} else {
		errorBag.unshift(localeService.translate("error", "input-error"));
		swal(errorBag.join("\n"), "", "error");
		loader.style.display = "none";
	}
}
function submitNewRecord(allSubmitData) {
	console.log("submit record: ");

	var appSetting = JSON.parse(sessionStorage.getItem("appSetting"));
	let url = window._config.api.addRecord.replace(/{appId}/, appId);
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			let response = this.response;
			if (typeof response != "object") {
				response = JSON.parse(response);
			}

			if (response) {
				if (response.code === 200) {
					let result = response.result;
					console.log("add record success");

					Promise.all([
						window.countRequest(domain, appId, loginName),
						sendMailHandler(appSetting, allSubmitData, result.id),
					])
						.then(() => {
							/**
							 * レコード追加後の処理
							 */
							if (appSetting.responseControl) {
								let key = [domain, appId, "responseControl"].join("_");
								localStorage.setItem(key, 1);
							}

							localStorage.removeItem(
								getTemporarySavingKeyName(appId, loginName),
							);

							let apps = JSON.parse(sessionStorage.getItem("apps")).apps.map(
								(x) => x.appId,
							);

							if (appSetting.appLinkTo && apps.includes(appSetting.appLinkTo)) {
								window.location.href = `./add_record.html?appId=${appSetting.appLinkTo}`;
							} else {
								if (appSetting.thanksPage) {
									window.location.href =
										window.location.href = `./thanks.html?appId=${appId}&id=${result.id}`;
								} else {
									window.location.href = `./detail_record.html?appId=${appId}&id=${result.id}`;
								}
							}
						})
						.catch((err) => console.log(err));
				} else {
					$("#submitBtn").prop("disabled", false);
					swal(
						localeService.translate("common", "error-title"),
						window.showError(response),
						"error",
					);
					console.error("add record fail");
					console.error(response);
					window.storeErr(response, "add record page");
					loader.style.display = "none";
				}
			} else {
				$("#submitBtn").prop("disabled", false);
				swal(
					localeService.translate("common", "error-title"),
					window.showError(response),
					"error",
				);
				console.error("add record fail");
				console.error(response);
				loader.style.display = "none";
				window.storeErr(xhr.responseText, "add record page");
			}
		}
		if (this.readyState === 4 && this.status !== 200) {
			$("#submitBtn").prop("disabled", false);
			loader.style.display = "none";
			swal(
				localeService.translate("common", "error-title"),
				localeService.translate("error", "common-error-message"),
				"warning",
			);
			console.error("Server error!");
			window.storeErr(this.status, "server error");
		}
	};
	xhr.open("POST", url, true);
	xhr.responseType = "json";
	xhr.setRequestHeader("Authorization", idToken.jwtToken);
	xhr.send(JSON.stringify(allSubmitData));
}

function loadAppForm(appSetting) {
	iframe.setAttribute("src", appSetting.formUrl);
	var cacheParamValue = new Date().getTime();
	iframe.src = appSetting.formUrl + "?cache=" + cacheParamValue;
	iframe.addEventListener("load", filterField);
}

function filterField() {
	let appSetting = JSON.parse(sessionStorage.getItem("appSetting"));

	if (appSetting.jsCustom && appSetting.jsCustom.length) {
		window.addCustomFile(appSetting.jsCustom, "js");
	}

	if (appSetting.lookupRelateInfo) {
		appSetting.lookupRelateInfo.forEach((info) => {
			if (Array.isArray(info.fieldMappings)) {
				info.fieldMappings.forEach((item) => {
					$("#iframe")
						.contents()
						.find("#" + item.field)
						.prop("disabled", true);
					$("#iframe")
						.contents()
						.find(`input[name='${item.field}']`)
						.each(function () {
							$(this).prop("disabled", true);
						});
				});
			}
		});

		/**
		 * ルックアップの取得ボタンを押下した時の処理
		 */
		$("iframe")
			.contents()
			.on("click", ".lk-lookup", async function (e) {
				e.preventDefault();
				let $lk = $(this);
				$lk.html(`<i class="fas fa-spinner fa-spin"></i>`);
				let $input = $(this).parent().parent().find("input");
				let fieldCode = $input.attr("data-code");
				let fieldLabel = $input.attr("data-label");
				let fieldValue = $input.val();
				let fieldType = $input.attr("data-type");
				let lookup;
				let lkRelate = appSetting.lookupRelateInfo.find(
					(x) => x.fieldCode == fieldCode,
				);
				if (appSetting.fields.hasOwnProperty(fieldCode)) {
					lookup = appSetting.fields[fieldCode].lookup;
				} else {
					let tableCode = $input.attr("data-reference");
					lookup = appSetting.fields[tableCode].fields[fieldCode].lookup;
				}

				/**
				 * ルックアップするレコードの取得
				 */
				let lookupInfo = {
					fieldCode: fieldCode,
					fieldValue: fieldValue,
					fieldType: fieldType,
					lookup: lookup,
				};
				try {
					let lookupRecords = await getLookupRecords(lookupInfo);
					$lk.html(localeService.translate("common", "get-lookup-field"));

					if (
						lookupRecords.length > 1 ||
						(!fieldValue && lookupRecords.length == 1)
					) {
						const recordCount = lookupRecords.length;
						let info = `<div class="float-right">${localeService.translate(
							"common",
							"record-count",
							{ recordCount },
						)}</div>`;
						let table = `<table class="table table-striped table-bordered"><thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col">${
																			lkRelate.rlFieldInfo[
																				lookup.relatedKeyField
																			]
																		}</th>`;
						lookup.lookupPickerFields = lookup.lookupPickerFields.filter(
							(x) =>
								x != lookup.relatedKeyField &&
								lookupRecords[0].hasOwnProperty(x),
						);
						lookup.lookupPickerFields.forEach((field) => {
							table += `<th scope="col">${lkRelate.rlFieldInfo[field]}</th>`;
						});
						table += `</tr></thead><tbody>`;
						lookupRecords.forEach((record) => {
							let tr = `<tr><td><button type="button" class="btn btn-outline-info" record-id ="${
								record.$id.value
							}">${localeService.translate(
								"common",
								"set",
							)}</button></td><td>${window.formatStr(
								record[lookup.relatedKeyField].value,
							)}</td>`;
							lookup.lookupPickerFields.forEach((field) => {
								tr += `<td>${window.formatStr(record[field].value)}</td>`;
							});
							tr += "</tr>";
							table += tr;
						});
						table += `</tbody></table>`;
						let jcRecords = $.alert({
							columnClass: "col-md-10",
							title: lkRelate.relateAppName,
							content: info + table,
							animateFromElement: false,
							buttons: {
								cancel: {
									text: localeService.translate("common", "cancel-title"),
									action: function () {},
								},
							},
							onContentReady: function () {
								this.$content.find("button").click(function () {
									let recordId = $(this).attr("record-id");
									let setRecord = lookupRecords.find(
										(x) => x.$id.value == recordId,
									);
									setLookupMapingField($input, setRecord, appSetting, lookup);

									$input.parent().parent().parent().find(".alert").remove();
									$input
										.parent()
										.parent()
										.after(
											`<div class="alert alert-success" style="padding: .25rem .5rem; margin-top: .5rem; ">${localeService.translate(
												"info",
												"get-referenced-data",
											)}</div>`,
										);
									jcRecords.close();
								});
							},
						});
					} else if (fieldValue && lookupRecords.length == 1) {
						let setRecord = lookupRecords[0];
						setLookupMapingField($input, setRecord, appSetting, lookup);

						$input.parent().parent().parent().find(".alert").remove();
						$input
							.parent()
							.parent()
							.after(
								`<div class="alert alert-success" style="padding: .25rem .5rem; margin-top: .5rem; ">${localeService.translate(
									"info",
									"get-referenced-data",
								)}</div>`,
							);
					} else {
						$input.parent().parent().parent().find(".alert").remove();
						$input
							.parent()
							.parent()
							.after(
								`<div class="alert alert-danger" style="padding: .25rem .5rem; margin-top: .5rem; ">${localeService.translate(
									"info",
									"data-not-exist",
								)}</div>`,
							);
					}
				} catch (err) {
					$lk.html(localeService.translate("common", "set"));
					swal(
						localeService.translate("common", "error-title"),
						err.message || JSON.stringify(err),
						"error",
					);
					console.error(err);
					window.storeErr(err, "get lookup record");
				}
			});

		/**
		 * ルックアップフィールドのテキスト削除（初期化）
		 */
		$("iframe")
			.contents()
			.on("click", ".lk-clear", async function () {
				let $input = $(this).parent().parent().find("input");
				let fieldCode = $input.attr("data-code");
				let lookup;
				if (appSetting.fields.hasOwnProperty(fieldCode)) {
					lookup = appSetting.fields[fieldCode].lookup;
				} else {
					let tableCode = $input.attr("data-reference");
					lookup = appSetting.fields[tableCode].fields[fieldCode].lookup;
				}
				clearLookupField($input, appSetting, lookup);
			});
	}

	if (appSetting.time) {
		$("iframe")
			.contents()
			.find(".field-" + appSetting.time.createTime)
			.parent()
			.hide();
		$("iframe")
			.contents()
			.find(".field-" + appSetting.time.editTime)
			.parent()
			.hide();
	}

	if (appSetting.creator) {
		let creator = appSetting.creator;
		$("iframe")
			.contents()
			.find(".field-" + creator)
			.parent()
			.hide();
		$("iframe")
			.contents()
			.find("#" + creator)
			.val(loginName);
	}

	if (appSetting.editor) {
		let editor = appSetting.editor;
		$("iframe")
			.contents()
			.find(".field-" + editor)
			.parent()
			.hide();
		$("iframe")
			.contents()
			.find("#" + editor)
			.val(loginName);
	}

	if (appSetting.groupView) {
		$("iframe")
			.contents()
			.find(".field-" + appSetting.groupView)
			.parent()
			.remove();
	}

	if (appSetting.location) {
		let location = appSetting.location;
		let latitude = location.latitude;
		let longitude = location.longitude;

		$("iframe")
			.contents()
			.find("#" + latitude)
			.prop("disabled", true);
		$("iframe")
			.contents()
			.find("#" + longitude)
			.prop("disabled", true);

		navigator.geolocation.getCurrentPosition(
			function (position) {
				$("iframe")
					.contents()
					.find("#" + latitude)
					.val(position.coords.latitude);
				$("iframe")
					.contents()
					.find("#" + longitude)
					.val(position.coords.longitude);
			},
			function () {
				swal(
					localeService.translate("common", "error-title"),
					localeService.translate("error", "geolocation-not-support"),
					"error",
				);
			},
			{ timeout: 10000 },
		);
	}

	let url = window._config.api.getAppRights.replace(/{appId}/, appId);
	let xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			let iframeDocument = iframe.contentWindow.document;
			var response = this.response;
			if (typeof response != "object") {
				response = JSON.parse(response);
			}

			if (response.code === 200 && response.fieldRights) {
				fieldRights = response.fieldRights;
				for (let i = 0; i < fieldRights.length; i++) {
					let fRight = fieldRights[i];
					let fCode = fRight.field;

					if (fRight.ac == "READ") {
						if (iframeDocument.querySelector("#" + fCode)) {
							iframeDocument
								.querySelector("#" + fCode)
								.setAttribute("disabled", true);
							iframeDocument
								.querySelector("#" + fCode)
								.setAttribute("read", true);

							if (
								$("#iframe")
									.contents()
									.find("#" + fCode)
									.parent()
									.next()
									.hasClass("lookup-group")
							) {
								$("#iframe")
									.contents()
									.find("#" + fCode)
									.parent()
									.next()
									.hide();
							}

							if (
								$("#iframe")
									.contents()
									.find("#" + fCode)
									.parent()
									.hasClass("file-upload-button")
							) {
								$("#iframe")
									.contents()
									.find("#" + fCode)
									.parent()
									.hide();
							}
						} else {
							var crs = iframeDocument.getElementsByName(fCode);
							crs.forEach((cr) => {
								cr.setAttribute("disabled", true);
								cr.setAttribute("read", true);
							});
						}
					} else if (
						fRight.ac == "NONE" &&
						iframeDocument.querySelector(".field-" + fCode)
					) {
						$("#iframe")
							.contents()
							.find(".field-" + fCode)
							.parent()
							.remove();
					}
				}

				if (window.getQueryStringByName("type") === "duplicate") {
					getRecordNeedDuplicate();
				} else if (window.getQueryStringByName("type") === "action") {
					handleActionCopy();
				}
			} else {
				response.message
					? swal(
							localeService.translate("common", "error-title"),
							response.message,
							"error",
					  )
					: "";
			}

			$(".se-pre-con").css("background", "rgba(255, 255, 255, 0.4)");
			loader.style.display = "none";
		}
		if (this.readyState === 4 && this.status !== 200) {
			loader.style.display = "none";
			swal(
				localeService.translate("common", "error-title"),
				localeService.translate("error", "common-error-message"),
				"warning",
			);
			console.error("Server error!");
			window.storeErr(this.status, "server error");
		}
	};
	xhr.open("GET", url, true);
	xhr.responseType = "json";
	xhr.setRequestHeader("Authorization", idToken.jwtToken);
	xhr.send();
}

function getRecordNeedDuplicate() {
	let record = sessionStorage.getItem("duplicateRecord");
	let recordId = window.getQueryStringByName("duplicateId");
	if (!record && !recordId) {
		swal(
			localeService.translate("common", "error-title"),
			localeService.translate("error", "unable-copy-record"),
			"error",
		);
		return;
	}

	if (!record) {
		let url = window._config.api.getRecord
			.replace(/{appId}/, appId)
			.replace(/{id}/, recordId);
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState === 4 && this.status === 200) {
				let response = this.response;
				if (typeof response != "object") {
					response = JSON.parse(response);
				}
				if (response.code === 200) {
					record = response.record;
					displayRecordData(record);
				} else {
					swal(
						localeService.translate("common", "error-title"),
						localeService.translate("error", "unable-retrieve-record"),
						"error",
					);
					loader.style.display = "none";
				}
			}
			if (this.readyState === 4 && this.status !== 200) {
				loader.style.display = "none";
				swal(
					localeService.translate("common", "error-title"),
					localeService.translate("error", "common-error-message"),
					"warning",
				);
				console.error("Server error!");
				window.storeErr(this.status, "server error");
			}
		};
		xhr.open("GET", url);
		xhr.responseType = "json";
		xhr.setRequestHeader("Authorization", idToken.jwtToken);
		xhr.send();
		return;
	}

	displayRecordData(JSON.parse(record));
}

async function displayRecordData(record) {
	let iframeDocument = iframe.contentWindow.document;

	await new Promise((resolve) => setTimeout(resolve, 1000));

	/**
	 * テーブルに行を挿入
	 */
	let addRowTableBtns = Array.from(
		iframeDocument.querySelectorAll(".table-add-row"),
	);
	addRowTableBtns.forEach(function (btn) {
		let addBtn = $(btn).children().first();
		let rmBtn = $(btn).children().eq(1);
		let className = addBtn.attr("class").split(" ");
		let fieldCode = className[2].substring(8, className[2].length);
		let rowNumber = record[fieldCode] ? record[fieldCode].value.length : 0;
		for (let i = 0; i < rowNumber - 1; i++) {
			rmBtn.trigger("click");
		}
		for (let i = 0; i < rowNumber - 1; i++) {
			addBtn.trigger("click");
		}
	});

	/**
	 * kintoneのフィールドと一致するすべての入力フィールドを取得
	 */
	let iframeInputs = Array.from(
		iframeDocument.getElementsByClassName("kintone-data"),
	);
	iframeInputs = iframeInputs.map(function (input) {
		return {
			domElem: input,
			code: input.dataset.code,
		};
	});
	/**
	 * classがkintone-dataの入力値を入力します
	 */
	Object.keys(record).forEach(function (fieldCode) {
		let field = record[fieldCode];
		if (field.type === "SUBTABLE") {
			let subTableBody = iframeDocument.getElementById(fieldCode + "-body");
			let sampleRow = subTableBody.querySelector("tr");

			field.value.map(function (row, index) {
				let rowValue = row.value;
				let rowField = $(subTableBody).children().eq(index);
				let columns = Array.from(rowField.find(".kintone-data"));

				columns.forEach((column) => {
					let columnCode = $(column).attr("data-code");
					if (rowValue[columnCode]) {
						saveRecordUtility
							.setValueForField(rowValue[columnCode], column)
							.then(() => {
								displayBlockFieldLink(column, rowValue[columnCode]);
							});
					}
				});
			});
		} else {
			let domMatches = iframeInputs
				.filter(function (input) {
					return input.code === fieldCode;
				})
				.map(function (input) {
					return input.domElem;
				});

			domMatches.forEach(function (dom) {
				saveRecordUtility.setValueForField(field, dom).then(() => {
					displayBlockFieldLink(dom, field);
				});
			});
		}
	});
	loader.style.display = "none";
}

function displayBlockFieldLink(dom, field) {
	if (field.type == "LINK") {
		dom.style.display = "block";
		$(dom).parent().find("a").remove();
	}
}

async function sendMailHandler(appSetting, allSubmitData, recordId) {
	let recordData = window.formatSubmitData(allSubmitData);
	let autoSendMail = appSetting.autoSendMail;

	if (!autoSendMail) return 0;
	let email = recordData[autoSendMail.autoEmail]
		? recordData[autoSendMail.autoEmail].value
		: "";
	if (!email) return 0;

	let subject = window.parseData(
		autoSendMail.autoSubject,
		appSetting,
		recordData,
		recordId,
	);
	let content = window.parseData(
		autoSendMail.autoContent,
		appSetting,
		recordData,
		recordId,
	);

	let data = {
		sender: chobiitNoReplyEmail,
		email: email,
		subject: subject,
		content: content,
	};

	await window.sendMail(data);

	return 1;
}

function handleActionCopy() {
	/**
	 * ここは一時保存によって保存した値を再度追加する処理です。
	 */
	let actionInfo = JSON.parse(sessionStorage.getItem("actionInfo"));
	actionInfo.forEach((action) => {
		if (action.copyFromValue === undefined) return;
		switch (action.copyToType) {
			case "DROP_DOWN":
				let $dropdown_options = $("#iframe")
					.contents()
					.find(`#${action.copyTo} option`);
				$dropdown_options.each(function () {
					if ($(this).val() == action.copyFromValue) {
						$(this).prop("selected", true);
					}
				});
				if (!action.editable) {
					$("iframe")
						.contents()
						.find("#" + action.copyTo)
						.prop("disabled", true);
				}
				break;
			case "MULTI_SELECT":
				let $mtil_options = $("#iframe")
					.contents()
					.find(`#${action.copyTo} option`);
				$mtil_options.each(function () {
					if (action.copyFromValue.includes($(this).val())) {
						$(this).prop("selected", true);
					}
				});
				if (!action.editable) {
					$("iframe")
						.contents()
						.find("#" + action.copyTo)
						.prop("disabled", true);
				}
				break;
			case "RADIO_BUTTON":
			case "CHECK_BOX":
				$("#iframe")
					.contents()
					.find(`input[name='${action.copyTo}']`)
					.each(function () {
						if (action.copyFromValue.includes(this.value)) {
							this.checked = true;
						}
						if (!action.editable) {
							$(this).prop("disabled", true);
						}
					});
				break;
			case "DATETIME":
				if (action.copyFromValue) {
					$("#iframe")
						.contents()
						.find("#" + action.copyTo)
						.val(
							moment(action.copyFromValue).format(
								`YYYY-MM-DD ${LocaleService.getTimeFormat()}`,
							),
						);
				} else {
					$("#iframe")
						.contents()
						.find("#" + action.copyTo)
						.val(action.copyFromValue);
				}
				if (!action.editable) {
					$("iframe")
						.contents()
						.find("#" + action.copyTo)
						.prop("disabled", true);
				}
				break;
			case "DATE":
				if (action.copyFromValue) {
					$("#iframe")
						.contents()
						.find("#" + action.copyTo)
						.val(moment(action.copyFromValue).format("YYYY-MM-DD"));
				} else {
					$("#iframe")
						.contents()
						.find("#" + action.copyTo)
						.val(action.copyFromValue);
				}
				if (!action.editable) {
					$("iframe")
						.contents()
						.find("#" + action.copyTo)
						.prop("disabled", true);
				}
				break;
			case "TIME":
				/**
				 * `TIME`はUS版のみ実行されるため、条件分岐で各処理を記載しています。
				 * 今後、明快な実装（改修）を行います。
				 */
				if (process.env.CHOBIIT_LANG === "en") {
					if (action.copyFromValue) {
						$("#iframe")
							.contents()
							.find("#" + action.copyTo)
							.val(
								moment(action.copyFromValue, "HH:mm").format(
									LocaleService.getTimeFormat(),
								),
							);
					} else {
						$("#iframe")
							.contents()
							.find("#" + action.copyTo)
							.val(action.copyFromValue);
					}
					if (!action.editable) {
						$("iframe")
							.contents()
							.find("#" + action.copyTo)
							.prop("disabled", true);
					}
					break;
				} else {
					$("#iframe")
						.contents()
						.find("#" + action.copyTo)
						.val(action.copyFromValue);
					if (!action.editable) {
						$("iframe")
							.contents()
							.find("#" + action.copyTo)
							.prop("disabled", true);
					}
					break;
				}
			default:
				$("#iframe")
					.contents()
					.find("#" + action.copyTo)
					.val(action.copyFromValue);
				if (!action.editable) {
					$("iframe")
						.contents()
						.find("#" + action.copyTo)
						.prop("disabled", true);
				}
				break;
		}
	});
	loader.style.display = "none";
}

function setLookupMapingField($input, setRecord, appSetting, lookup) {
	let keyValue = setRecord[lookup.relatedKeyField].value;
	if (
		setRecord[lookup.relatedKeyField].type == "RECORD_NUMBER" &&
		isNaN(keyValue)
	) {
		keyValue = keyValue.split("-")[1];
	}

	$input.val(keyValue);

	lookup.fieldMappings.forEach((item) => {
		if (!setRecord.hasOwnProperty(item.relatedField)) return;
		let thisFieldRight = fieldRights.find((right) => {
			return right.field === item.field;
		});
		if (
			thisFieldRight &&
			(thisFieldRight.ac === "NONE" || thisFieldRight.ac === "READ")
		)
			return;
		if (appSetting.fields.hasOwnProperty(item.field)) {
			/**
			 * ここはKintoneのルックアップのフィールドに対する処理です。
			 */
			switch (appSetting.fields[item.field].type) {

				/*
				 * TODO: 現在(2024/05/23), 文字列(複数行)フィールドに関するcase節が漏れています.
				 * しかし, 下部のdefault節で全ての要素に対して処理を行っている(※1)ため, case節漏れによる不具合は発生しておりません.
				 * しかし, switch分を使ってHTML要素の種類に応じて処理を分けているということから, 複数行の文字列に関するcase節も追加すべきだと考えます.
				 * 
				 * ※1 このswitch分を包括するif文のelseには, こちらの処理のサブテーブルverの処理が記述されていされています.
				 *    さらに, そのdefault節ではinput要素に対してのみ処理を行っています.
				 *    このことから, defalut節に到達する全ての要素は, input要素であるという前提で処理を書いていると考えられます. 
				 */
				case "DROP_DOWN":
					let $dropdown_options = $("#iframe")
						.contents()
						.find(`#${item.field} option`);
					$dropdown_options.each(function () {
						if ($(this).val() == setRecord[item.relatedField].value) {
							$(this).prop("selected", true);
						}
					});
					break;
				case "MULTI_SELECT":
					let $mtil_options = $("#iframe")
						.contents()
						.find(`#${item.field} option`);
					$mtil_options.each(function () {
						if (setRecord[item.relatedField].value.includes($(this).val())) {
							$(this).prop("selected", true);
						}
					});
					break;
				case "RADIO_BUTTON":
				case "CHECK_BOX":
					$("#iframe")
						.contents()
						.find(`input[name='${item.field}']`)
						.each(function () {
							if (setRecord[item.relatedField].value.includes(this.value)) {
								this.checked = true;
							}
						});
					break;
				case "DATETIME":
					if (setRecord[item.relatedField].value) {
						$("#iframe")
							.contents()
							.find("#" + item.field)
							.val(
								moment(setRecord[item.relatedField].value).format(
									`YYYY-MM-DD ${LocaleService.getTimeFormat()}`,
								),
							);
					} else {
						$("#iframe")
							.contents()
							.find("#" + item.field)
							.val(setRecord[item.relatedField].value);
					}
					break;
				case "DATE":
					if (setRecord[item.relatedField].value) {
						$("#iframe")
							.contents()
							.find("#" + item.field)
							.val(
								moment(setRecord[item.relatedField].value).format("YYYY-MM-DD"),
							);
					} else {
						$("#iframe")
							.contents()
							.find("#" + item.field)
							.val(setRecord[item.relatedField].value);
					}
					break;
				case "TIME":
					/**
					 * `TIME`はUS版のみ実行されるため、条件分岐で各処理を記載しています。
					 * 今後、明快な実装（改修）を行います。
					 */
					if (process.env.CHOBIIT_LANG === "en") {
						if (setRecord[item.relatedField].value) {
							$("#iframe")
								.contents()
								.find("#" + item.field)
								.val(
									moment(setRecord[item.relatedField].value, "HH:mm").format(
										LocaleService.getTimeFormat(),
									),
								);
						} else {
							$("#iframe")
								.contents()
								.find("#" + item.field)
								.val(setRecord[item.relatedField].value);
						}
						break;
					} else {
						$("#iframe")
							.contents()
							.find("#" + item.field)
							.val(setRecord[item.relatedField].value);
						break;
					}
				default:
					$("#iframe")
						.contents()
						.find("#" + item.field)
						.val(setRecord[item.relatedField].value);
					break;
			}
		} else {
			/**
			 * ここはKintoneのルックアップ機能をテーブル内で使用するフィールドに対する処理です。
			 */
			let tableCode = $input.attr("data-reference");
			switch (appSetting.fields[tableCode].fields[item.field].type) {
				case "MULTI_LINE_TEXT":
					$input
						.parents("tr")
						.find(`textarea[data-code='${item.field}']`)
						.val(setRecord[item.relatedField].value);
					break;
				case "DROP_DOWN":
					let $dropdown_options = $input
						.parents("tr")
						.find(`select[data-code='${item.field}'] option`);
					$dropdown_options.each(function () {
						if ($(this).val() == setRecord[item.relatedField].value) {
							$(this).prop("selected", true);
						}
					});
					break;
				case "MULTI_SELECT":
					let $mtil_options = $input
						.parents("tr")
						.find(`select[data-code='${item.field}'] option`);
					$mtil_options.each(function () {
						if (setRecord[item.relatedField].value.includes($(this).val())) {
							$(this).prop("selected", true);
						}
					});
					break;
				case "RADIO_BUTTON":
				case "CHECK_BOX":
					$input
						.parents("tr")
						.find(`input[data-code='${item.field}']`)
						.each(function () {
							if (setRecord[item.relatedField].value.includes(this.value)) {
								this.checked = true;
							}
						});
					break;
				case "DATETIME":
					if (setRecord[item.relatedField].value) {
						$input
							.parents("tr")
							.find(`input[data-code='${item.field}']`)
							.val(
								moment(setRecord[item.relatedField].value).format(
									`YYYY-MM-DD ${LocaleService.getTimeFormat()}`,
								),
							);
					} else {
						$input
							.parents("tr")
							.find(`input[data-code='${item.field}']`)
							.val(setRecord[item.relatedField].value);
					}
					break;
				case "DATE":
					if (setRecord[item.relatedField].value) {
						$input
							.parents("tr")
							.find(`input[data-code='${item.field}']`)
							.val(
								moment(setRecord[item.relatedField].value).format("YYYY-MM-DD"),
							);
					} else {
						$input
							.parents("tr")
							.find(`input[data-code='${item.field}']`)
							.val(setRecord[item.relatedField].value);
					}
					break;
				case "TIME":
					/**
					 * `TIME`はUS版のみ実行されるため、条件分岐で各処理を記載しています。
					 * 今後、明快な実装（改修）を行います。
					 */
					if (process.env.CHOBIIT_LANG === "en") {
						if (setRecord[item.relatedField].value) {
							$input
								.parents("tr")
								.find(`input[data-code='${item.field}']`)
								.val(
									moment(setRecord[item.relatedField].value, "HH:mm").format(
										LocaleService.getTimeFormat(),
									),
								);
						} else {
							$input
								.parents("tr")
								.find(`input[data-code='${item.field}']`)
								.val(setRecord[item.relatedField].value);
						}
						break;
					} else {
						$input
							.parents("tr")
							.find(`input[data-code='${item.field}']`)
							.val(setRecord[item.relatedField].value);
						break;
					}
				default:
					$input
						.parents("tr")
						.find(`input[data-code='${item.field}']`)
						.val(setRecord[item.relatedField].value);
					break;
			}
		}
	});
}

function clearLookupField($input, appSetting, lookup) {
	$input.parent().parent().parent().find(".alert").remove();
	$input.val("");
	lookup.fieldMappings.forEach((item) => {
		if (appSetting.fields.hasOwnProperty(item.field)) {
			/**
			 * ここはKintoneのルックアップのフィールドに対する処理です。
			 */
			switch (appSetting.fields[item.field].type) {
				case "DROP_DOWN":
					let $dropdown_options = $("#iframe")
						.contents()
						.find(`#${item.field} option`);
					$dropdown_options.each(function (index) {
						if (index > 0) {
							$(this).prop("selected", false);
						}
					});
					break;
				case "MULTI_SELECT":
					let $mtil_options = $("#iframe")
						.contents()
						.find(`#${item.field} option`);
					$mtil_options.each(function () {
						$(this).prop("selected", false);
					});
					break;
				case "RADIO_BUTTON":
					$("#iframe")
						.contents()
						.find(`input[name='${item.field}']`)
						.each(function (index) {
							if (index > 0) {
								this.checked = false;
							}
						});
					break;
				case "CHECK_BOX":
					$("#iframe")
						.contents()
						.find(`input[name='${item.field}']`)
						.each(function () {
							this.checked = false;
						});
					break;
				default:
					$("#iframe")
						.contents()
						.find("#" + item.field)
						.val("");
					break;
			}
		} else {
			/**
			 * ここはKintoneのルックアップ機能をテーブル内で使用するフィールドに対する処理です。
			 */
			let tableCode = $input.attr("data-reference");
			switch (appSetting.fields[tableCode].fields[item.field].type) {
				case "MULTI_LINE_TEXT":
					$input.parents("tr").find(`textarea[data-code='${item.field}']`).val("");
					break;
				case "DROP_DOWN":
					let $dropdown_options = $input
						.parents("tr")
						.find(`select[data-code='${item.field}'] option`);
					$dropdown_options.each(function (index) {
						if (index > 0) {
							$(this).prop("selected", false);
						}
					});
					break;
				case "MULTI_SELECT":
					let $mtil_options = $input
						.parents("tr")
						.find(`select[data-code='${item.field}'] option`);
					$mtil_options.each(function () {
						$(this).prop("selected", false);
					});
					break;
				case "RADIO_BUTTON":
					$input
						.parents("tr")
						.find(`input[data-code='${item.field}']`)
						.each(function (index) {
							if (index > 0) {
								this.checked = false;
							}
						});
					break;
				case "CHECK_BOX":
					$input
						.parents("tr")
						.find(`input[data-code='${item.field}']`)
						.each(function () {
							this.checked = false;
						});
					break;
				default:
					$input.parents("tr").find(`input[data-code='${item.field}']`).val("");
					break;
			}
		}
	});
}

function getLookupRecords(lookupInfo) {
	return new Promise((resolve, reject) => {
		var url = window._config.api.getLookupRecords.replace(/{appId}/, appId);
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function () {
			if (this.readyState === 4 && this.status === 200) {
				var response = this.response;
				if (typeof response != "object") {
					response = JSON.parse(response);
				}

				if (response.code === 200) {
					resolve(response.records);
				} else {
					reject(response);
				}
			}
			if (this.readyState === 4 && this.status !== 200) {
				if (this.status == 504) {
					let errMsg = localeService.translate(
						"error",
						"exceed-search-result-limit",
					);
					reject(new Error(errMsg));
				} else {
					reject(
						new Error(localeService.translate("error", "common-error-message")),
					);
					console.error("Server error!");
					window.storeErr(this.status, "server error");
				}
			}
		};
		xhr.open("POST", url, true);
		xhr.responseType = "json";
		xhr.setRequestHeader("Authorization", idToken.jwtToken);
		xhr.send(JSON.stringify(lookupInfo));
	});
}

function tempSavingHandler(btnName) {
	/**
	 * 同一ブラウザで複数のChobiitアカウントで一時保存機能を使用した場合の不具合対応を実施した
	 * 具体的にはkeyNameの変更を行った（ログイン名を付与）
	 * これにより、旧keyNameですでに保存されているデータを新keyNameに移行する必要がある
	 * 備考: 「本機能リリース後初めてレコード追加画面を開いた」ユーザー用のデータとして移行される
	 */
	const oldKeyTemporaryRecord = localStorage.getItem(`temp-record-${appId}`);
	if (oldKeyTemporaryRecord) {
		localStorage.removeItem(`temp-record-${appId}`);
		localStorage.setItem(
			getTemporarySavingKeyName(appId, loginName),
			oldKeyTemporaryRecord,
		);
	}

	/**
	 * 一時保存ボタン押下時の処理
	 */
	let btn = $(
		`<button type="button" class="btn btn-orange" id="tempSavingBtn">${btnName}</button>`,
	).click(function () {
		let tempData = {};
		let iframeContent = iframe.contentWindow.document;
		let recordFields = Array.from(
			iframeContent.getElementsByClassName("kintone-data"),
		);

		recordFields.map(function (fieldDom) {
			if (!fieldDom.hasAttribute("read")) {
				saveRecordUtility.storeFieldValue(fieldDom, tempData, [], []);
			}
		});

		let tempRecord = window.formatSubmitData(tempData);
		localStorage.setItem(
			getTemporarySavingKeyName(appId, loginName),
			JSON.stringify(tempRecord),
		);
		swal(
			localeService.translate("common", "success"),
			localeService.translate("error", "draft-temporarily-save"),
			"success",
		);
	});

	if (!$("#editMenu").find("#tempSavingBtn").length) {
		$("#editMenu").append(btn);
	}

	/**
	 * 一時保存した値を反映する処理
	 */
	if (window.getQueryStringByName("type") != "duplicate") {
		const tRecord = localStorage.getItem(
			getTemporarySavingKeyName(appId, loginName),
		);
		if (tRecord) {
			displayRecordData(JSON.parse(tRecord));
		}
	}
}

async function loadAppListData() {
	var appsInStorage = JSON.parse(sessionStorage.getItem("apps"));
	if (!appsInStorage) {
		await loadAllApps(idToken);
	}

	window.insertAppName("need-app-name");
	window.updateAppsInSidebar(null, function () {
		document
			.getElementById("addRecordMenu" + appId)
			.classList.add("sub-active");
	});

	return 1;
}

function getTemporarySavingKeyName(appId, loginName) {
	return `private-temp-record-${appId}-${loginName}`;
}
