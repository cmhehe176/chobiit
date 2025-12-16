const LocaleService =
	require("chobiit-common/src/application/locale-service").default;
const localeService = LocaleService.getInstance("client");

function _typeof(obj) {
	if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
		_typeof = function _typeof(obj) {
			return typeof obj;
		};
	} else {
		_typeof = function _typeof(obj) {
			return obj &&
				typeof Symbol === "function" &&
				obj.constructor === Symbol &&
				obj !== Symbol.prototype
				? "symbol"
				: typeof obj;
		};
	}
	return _typeof(obj);
}

function _defineProperty(obj, key, value) {
	if (key in obj) {
		Object.defineProperty(obj, key, {
			value: value,
			enumerable: true,
			configurable: true,
			writable: true,
		});
	} else {
		obj[key] = value;
	}
	return obj;
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	try {
		var info = gen[key](arg);
		var value = info.value;
	} catch (error) {
		reject(error);
		return;
	}
	if (info.done) {
		resolve(value);
	} else {
		Promise.resolve(value).then(_next, _throw);
	}
}

function _asyncToGenerator(fn) {
	return function () {
		var self = this,
			args = arguments;
		return new Promise(function (resolve, reject) {
			var gen = fn.apply(self, args);
			function _next(value) {
				asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
			}
			function _throw(err) {
				asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
			}
			_next(undefined);
		});
	};
}

/* eslint-disable no-useless-escape */
module.exports = {
	validateField: validateField,
	storeFieldValue: storeFieldValue,
	uploadFileToKintone: uploadFileToKintone,
	downloadFile: downloadFile,
	setValueForField: setValueForField,
	checkUniqField: checkUniqField,
	checkFileOnS3: checkFileOnS3,
	dowloadFileToS3FromFileKey: dowloadFileToS3FromFileKey,
	encodeS3URI: encodeS3URI,
};
/**
 * Validate field
 *
 * @param {HTML Element} field
 */

function encodeS3URI(filename) {
	var encodings = {
		"+": "%2B",
		"!": "%21",
		'"': "%22",
		"#": "%23",
		"$": "%24",
		"&": "%26",
		"'": "%27",
		"(": "%28",
		")": "%29",
		"*": "%2A",
		",": "%2C",
		":": "%3A",
		";": "%3B",
		"=": "%3D",
		"?": "%3F",
		"@": "%40",
	};
	return encodeURI(filename)
		.replace(/(\+|!|"|#|\$|&|'|\(|\)|\*|\+|,|:|;|=|\?|@)/gim, function (match) {
			return encodings[match];
		});
}
function checkUniqField(_x) {
	return _checkUniqField.apply(this, arguments);
}

function _checkUniqField() {
	_checkUniqField = _asyncToGenerator(
		/*#__PURE__*/
		regeneratorRuntime.mark(function _callee(getRecordApi) {
			var uniqueFields, recordGet, _loop, i, _ret;

			return regeneratorRuntime.wrap(
				function _callee$(_context) {
					while (1) {
						switch ((_context.prev = _context.next)) {
							case 0:
								uniqueFields = $("#iframe")
									.contents()
									.find("[unique]")
									.toArray();

								if (!uniqueFields.length) {
									_context.next = 14;
									break;
								}

								_context.next = 4;
								return new Promise(function (resolve) {
									var url = getRecordApi;
									var xhr = new XMLHttpRequest();

									xhr.onreadystatechange = function () {
										if (this.readyState === 4 && this.status === 200) {
											var response = this.response;
											if (typeof response != "object") {
												response = JSON.parse(response);
											}
											var body = JSON.parse(response.body);

											if (body.code === 200) {
												var records = body.records;
												resolve(records);
											} else {
												swal(
													localeService.translate("common", "error-title"),
													localeService.translate("error", "no-permission"),
													"error",
												);
												reject("err");
												loader.style.display = "none";
											}

											loader.style.display = "none";
										}
									};
									xhr.open("GET", url, true);
									xhr.responseType = "json";
									xhr.setRequestHeader("Content-Type", "application/json");
									xhr.send();
								});

							case 4:
								recordGet = _context.sent;

								_loop = function _loop(i) {
									var field = uniqueFields[i];
									var fieldValue = field.value;
									var fieldCode = field.dataset.code;
									var fieldLabel = field.dataset.label;
									var fieldValueArr = recordGet.map(function (record) {
										return record[fieldCode].value;
									});

									if (fieldValue && fieldValueArr.includes(fieldValue)) {
										swal(
											localeService.translate("common", "error-title"),
											localeService.translate(
												"error",
												"duplicate-permissions",
												{ fieldLabel, fieldValue },
											),
											"error",
										);
										return {
											v: false,
										};
									}
								};

								i = 0;

							case 7:
								if (!(i < uniqueFields.length)) {
									_context.next = 14;
									break;
								}

								_ret = _loop(i);

								if (!(_typeof(_ret) === "object")) {
									_context.next = 11;
									break;
								}

								return _context.abrupt("return", _ret.v);

							case 11:
								i++;
								_context.next = 7;
								break;

							case 14:
								return _context.abrupt("return", true);

							case 15:
							case "end":
								return _context.stop();
						}
					}
				},
				_callee,
				this,
			);
		}),
	);
	return _checkUniqField.apply(this, arguments);
}

function showErrorLabelUnderField(field, message) {
	// 既に表示されている場合は処理しない
	if (
		$(field).closest(`.field-${field.dataset.code}`).next(".alert-danger")
			.length
	)
		return;

	$(field)
		.closest(`.field-${field.dataset.code}`)
		.after(
			`<div class="alert alert-danger" style="padding: .25rem .5rem; margin-top: .5rem; ">${message}</div>`,
		);
}

function isChecked(field) {
	const fieldElement = field.closest(`.field-${field.dataset.code}`);
	const inputs = fieldElement.querySelectorAll("input");

	return Array.from(inputs).some((element) => element.checked);
}

function isEmptyField(field) {
	if (field.dataset.type === "FILE") {
		return !$(field)
			.closest(".field-" + field.dataset.code)
			.find(".delete-file").length;
	} else if (field.dataset.type === "CHECK_BOX") {
		return !isChecked(field);
	} else {
		return !field.value;
	}
}

function validateField(field) {
	let isValid = true;

	const fieldValue = field.value;
	const isRequired = field.hasAttribute("required");

	if (isRequired && isEmptyField(field)) {
		isValid = false;
		showErrorLabelUnderField(field, localeService.translate("info", "require"));
	}

	const fieldType = field.dataset.type;

	switch (fieldType) {
		case "NUMBER": {
			if (fieldValue && isNaN(fieldValue)) {
				isValid = false;
				showErrorLabelUnderField(
					field,
					localeService.translate("error", "input-number"),
				);
			}
			break;
		}

		case "LINK": {
			const protocol = field.dataset.protocol;

			if (protocol === "MAIL") {
				const re =
					/^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;

				if (fieldValue && !re.test(fieldValue)) {
					isValid = false;
					showErrorLabelUnderField(
						field,
						localeService.translate("error", "enter-valid-email-address"),
					);
				}
			} else if (protocol === "WEB") {
				const _re =
					/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

				if (fieldValue && !_re.test(fieldValue)) {
					isValid = false;
					showErrorLabelUnderField(
						field,
						localeService.translate("error", "enter-valid-url"),
					);
				}
			}
			break;
		}

		default:
			break;
	}

	return isValid;
}

/**
 * kintoneのフィールドを表しているdom要素を、バックエンドに投げるJSONデータへと変換する
 */
function storeFieldValue(field, store, fileContainer, fileSpace, tableIds) {
    var fieldCode = field.dataset.code;
    var fieldType = field.dataset.type;
    var fieldLabel = field.id;
    var fieldName = field.name;
    var fieldReference = field.dataset.reference;
    var referenceInfo = undefined;
    let kintoneSubTableRowId = field.getAttribute('kintone-subtable-row-id')

    /**
     * フィールドコードと、サブテーブルIDの組み合わせを保存しています
     * サブテーブルの行を追加した時に、サブテーブルの行IDを表すプロパティである、
     * kintone-subtable-row-idが複製されてしまうため、新規で追加したサブテーブルの行の行IDをnullにする処理を追加しています。
     */
    if(tableIds !== undefined){
        if(tableIds.has(fieldCode + "_" + kintoneSubTableRowId)){
            kintoneSubTableRowId = null;
        }else{
            switch(fieldType){
                case 'RADIO_BUTTON':
                    if(field.checked){
                        tableIds.set(fieldCode + "_" + kintoneSubTableRowId,[])
                    }
                    break 
                default:
                    tableIds.set(fieldCode + "_" + kintoneSubTableRowId,[]);
                    break
            } 
        
        }
    }

    if (fieldReference !== undefined) {
        referenceInfo = {
            code: fieldReference,
            order: field.dataset.order ? field.dataset.order : 'default',
            kintoneSubTableRowId: kintoneSubTableRowId ? kintoneSubTableRowId : null,
        };
    }

	switch (fieldType) {
		case "MULTI_SELECT": {
			var fieldValue = Array.from(field.options)
				.filter(function (option) {
					return option.selected;
				})
				.map(function (option) {
					return option.value;
				});
			var value = [];
			store[fieldLabel] = {
				code: fieldCode,
				type: fieldType,
				value: fieldValue,
				reference: referenceInfo,
			};
			break;
		}

		case "CHECK_BOX":
			if (store[fieldName]) {
				if (field.checked) {
					store[fieldName].value.push(field.value);
				}
			} else {
				store[fieldName] = {
					code: fieldCode,
					type: fieldType,
					value: field.checked ? [field.value] : [],
					reference: referenceInfo,
				};
			}

			break;

		case "RADIO_BUTTON":
			if (field.checked) {
				store[fieldLabel] = {
					code: fieldCode,
					type: fieldType,
					value: field.value,
					reference: referenceInfo,
				};
			}

			break;

		case "DATETIME": {
			if (field.value) {
				var _value = moment(
					field.value,
					`YYYY-MM-DD ${LocaleService.getTimeFormat()}`,
				).toISOString();

				store[fieldLabel] = {
					code: fieldCode,
					type: fieldType,
					value: _value,
					reference: referenceInfo,
				};
			} else {
				store[fieldLabel] = {
					code: fieldCode,
					type: fieldType,
					value: "",
					reference: referenceInfo,
				};
			}

			break;
		}

		case "DATE": {
			var date = window.moment(field.value, "YYYY-MM-DD");

			var _value2 = date.isValid() ? date.format("YYYY-MM-DD") : null;

			store[fieldLabel] = {
				code: fieldCode,
				type: fieldType,
				value: _value2,
				reference: referenceInfo,
			};
		}
		break;

		case "TIME": {
			var time = window.moment(field.value, LocaleService.getTimeFormat());

			var _value3 = time.isValid() ? time.format("HH:mm:ss") : null;

			store[fieldLabel] = {
				code: fieldCode,
				type: fieldType,
				value: _value3,
				reference: referenceInfo,
			};
			break;
		}

		case "FILE": {
			let files = storeFileContainer(field, fileSpace);
			fileContainer.push({
				label: fieldLabel,
				code: fieldCode,
				files: files,
				reference: referenceInfo,
			});

			break;
		}

		default:
			store[fieldLabel] = {
				code: fieldCode,
				type: fieldType,
				value: field.value,
				reference: referenceInfo,
			};
			break;
	}
}

/**
 * Kintoneにアップロードするファイルを格納した配列を返す関数
 */
async function uploadFileToKintone(fileContainer, apiUrl, idToken = false) {
	let result = [];
	for (let i = 0; i < fileContainer.length; i++) {
		let container = fileContainer[i];
		var files = container.files;
		var fieldCode = container.code;
		var fieldLabel = container.label;
		var reference = container.reference;

		let fileKeys = [];
		for (let j = 0; j < files.length; j++) {
			let file = files[j];
			let key = await getFileKey(file, apiUrl, idToken);
			console.log("fileKey: ", key);
			fileKeys.push({
				fileKey: key,
			});
		}

		result.push({
			[fieldLabel]: {
				code: fieldCode,
				value: fileKeys,
				reference: reference,
				type: "FILE",
			},
		});
	}

	return result;
}

async function setValueForField(field, dom, apiUrl, idToken) {
	switch (field.type) {
		case "CHECK_BOX":
			dom.checked = field.value.indexOf(dom.value) >= 0 ? true : false;
			break;
		case "MULTI_SELECT": {
			let options = Array.from(dom.options);
			options.forEach(function (option) {
				field.value.indexOf(option.value) >= 0
					? (option.selected = true)
					: (option.selected = false);
			});
			break;
		}
		case "DROP_DOWN": {
			let options = Array.from(dom.options);
			options.some(function (option) {
				if (option.value === field.value) {
					option.selected = true;
					return true;
				} else {
					option.selected = false;
				}
			});
			break;
		}
		case "RADIO_BUTTON":
			dom.checked = dom.value === field.value ? true : false;
			break;
		case "FILE":
			if (window.getQueryStringByName("type") != "duplicate") {
				await showFiles(field.value, dom, apiUrl, idToken);
			}
			break;
		case "DATETIME":
			dom.value = moment(field.value).isValid()
				? moment(field.value).format(
						`YYYY-MM-DD ${LocaleService.getTimeFormat()}`,
				  )
				: field.value;
			break;
		case "DATE":
			dom.value = moment(field.value).isValid()
				? moment(field.value).format("YYYY-MM-DD")
				: field.value;
			break;
		case "TIME":
			dom.value = moment(field.value, "HH:mm").isValid()
				? moment(field.value, "HH:mm").format(LocaleService.getTimeFormat())
				: field.value;
			break;
		case "MULTI_LINE_TEXT":
			if (field.value) {
				let rows = field.value.split(/\r|\r\n|\n/).length;
				dom.rows = 2 * rows;
				dom.value = field.value;
			}
			break;
		case "LINK":
			dom.value = field.value;
			dom.style.display = "none";

			// $(dom).next().remove();
			let protocol = dom.dataset.protocol;
			let a;
			if (protocol == "WEB") {
				a = `<a href="${field.value}" target="_blank">${field.value}</a>`;
			} else if (protocol == "CALL") {
				//check mobile
				if (
					/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
						navigator.userAgent,
					)
				) {
					a = `<a href="tel://${field.value}">${field.value}</a>`;
				} else {
					a = `<a href="callto://${field.value}">${field.value}</a>`;
				}
			} else if (protocol == "MAIL") {
				a = `<a href="mailto:${field.value}">${field.value}</a>`;
			}

			$(dom).closest(".kintone-field-style").css("word-break", "break-all");
			$(dom).after(a);

			break;
		default:
			dom.value = field.value;
	}
}

async function showFiles(fileValues, dom, apiUrl, idToken) {
	const $field = $(dom).parent().parent();
	$field.find("a").remove();
	$field.find(".img-frame").remove();
	$field.find(".label-info").empty();

	for (let i = 0; i < fileValues.length; i++) {
		let file = fileValues[i];
		if (file.contentType.indexOf("image") !== -1) {
			let fileUrl = await downloadFile(file, apiUrl, idToken).catch((err) => {
				console.log(err);
			});

			let img = `<img src="${fileUrl}" alt="${file.name}" key="${file.fileKey}" class="image-frame img-frame" size="${file.size}">`;
			$field.append(img);
		} else {
			let a = document.createElement("a");
			a.innerHTML = file.name;
			$(a).css("cursor", "pointer");
			$(a).attr("size", file.size);
			$(a).attr("key", file.fileKey);
			$(a).attr("name", file.name);
			$(a).attr("type", file.contentType);
			$(a).attr("class", "file-download");
			$(a).css("display", "block");
			$field.append(a);
		}
	}
}
async function getFileKey(file, apiUrl, idToken) {
    if (file.fileKey){ 
        return file.fileKey;
    }else {
        console.log('starting get new filekey from local file....');
        console.log('starting get s3 upload url...');
        let resp = await getS3UploadUrl(file, apiUrl, idToken);
        let s3Url = resp.url;
        let fileId = resp.fileId;
        console.log('starting upload file from local to s3...');
        await uploadFileLocalToS3(file, s3Url);

		console.log("starting get file Key from s3 file....");
		let fileKey = await uploadFileFromS3ToKintone(
			file.name,
			fileId,
			false,
			idToken,
		);
		return fileKey;
	}
}

function getS3UploadUrl(file, apiUrl, idToken) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState === 4 && this.status === 200) {
				var body = this.response;
				if (typeof body != "object") {
					body = JSON.parse(body);
				}
				if (body.code === 200 && body.url) {
					console.log("get s3 upload url success");

					resolve(body);
				} else {
					let err = {
						fileName: file.name,
						info: body,
					};
					reject(err);
				}
			} else if (this.readyState === 4 && this.status !== 200) {
				let err = {
					fileName: file.name,
					// fileSize: fileSize,
					info: "Server err: " + this.status,
				};
				reject(err);
			}
		};
		xhr.open("POST", apiUrl, true);
		if (idToken) {
			xhr.setRequestHeader("Authorization", idToken.jwtToken);
		} else {
			xhr.setRequestHeader("Content-Type", "application/json");
		}

		xhr.responseType = "json";

		xhr.send(
			JSON.stringify({
				type: file.type,
				name: file.name,
			}),
		);
	});
}

function uploadFileLocalToS3(file, url) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "PUT",
			url: url,
			contentType: file.type,
			processData: false,
			data: file,
			success: function success() {
				console.log("File uploaded to s3 success !!!!!!!");
				resolve();
			},
			error: function error(err) {
				console.error("upload to s3 failed");
				err.fileName = file.name;
				err.fileSize = file.size;
				reject(err);
			},
		});
	});
}

function storeFileContainer(field, fileSpace) {
	let files = [];
	$(field)
		.parent()
		.siblings()
		.each(function () {
			let $file = $(this);
			let key = $file.attr("key");
			let name = $file.attr("name");

			let fileFielType = $(field).attr("data-reference") ? "SUBTABLE" : "FILE";
			if (key) {
				files.push({
					name: name,
					fileKey: key,
					fileFielType: fileFielType,
				});
			} else {
				let fileId = $file.attr("file-id");
				let found = fileSpace.find((x) => x.fileId == fileId);
				if (found) {
					files.push(found.file);
				}
			}
		});

	return files;
}

async function uploadFileFromS3ToKintone(
	fileName,
	fileId,
	oldFileKey = false,
	idToken,
) {
	let url = idToken
		? window._config.api.stepExecution
		: window._config.api.publicStepExecution;

	let executionArn = await new Promise((resolve, reject) => {
		let xhhtp = new XMLHttpRequest();
		xhhtp.onreadystatechange = function () {
			if (this.readyState === 4 && this.status === 200) {
				let body = JSON.parse(this.response);
				console.log("file uploaded to kintone");

				if (body.executionArn) {
					resolve(body.executionArn);
				} else {
					reject(body);
				}
			} else if (this.readyState === 4 && this.status !== 200) {
				let err = {
					fileName: fileName,

					info: "server err: " + this.status,
				};
				reject(err);
			}
		};
		xhhtp.open("POST", url, true);

		let postBody = {
			name: fileName,
			fileId: fileId,
			oldFileKey: oldFileKey,
			state: "done",
		};

		let stateMachineArn =
			window._config.stateMachineArn + "step-chobiitUploadFile";

		if (idToken) {
			xhhtp.setRequestHeader("Authorization", idToken.jwtToken);
			postBody.token = idToken.jwtToken;
		} else {
			postBody.domain = window.getKintoneDomain();
			postBody.appId = window.getQueryStringByName("appId");
			stateMachineArn =
				window._config.stateMachineArn + "step-chobiitPublicUploadFile";
			xhhtp.setRequestHeader("Content-Type", "application/json");
		}
		xhhtp.send(
			JSON.stringify({
				input: JSON.stringify(postBody),
				name: "MyExecution" + window.getUniqueStr(),
				stateMachineArn: stateMachineArn,
			}),
		);
	});

	let fileKey = await new Promise((resolve, reject) => {
		var requestLoop = setInterval(function () {
			var xhhtp = new XMLHttpRequest();
			xhhtp.onreadystatechange = function () {
				if (this.readyState === 4 && this.status === 200) {
					let body = JSON.parse(this.response);
					if (body.status == "SUCCEEDED") {
						clearInterval(requestLoop);

						let output = JSON.parse(body.output);
						let { fileKey } = JSON.parse(output.body);
						resolve(fileKey);
					}

					if (body.status == "FAILED") {
						clearInterval(requestLoop);
						reject(body);
					}
				} else if (this.readyState === 4 && this.status !== 200) {
					let err = {
						fileName: file.name,
						info: "server err: " + this.status,
					};
					reject(err);
				}
			};
			xhhtp.open("POST", url + "/status", true);

			if (idToken) {
				xhhtp.setRequestHeader("Authorization", idToken.jwtToken);
			} else {
				xhhtp.setRequestHeader("Content-Type", "application/json");
			}
			xhhtp.send(
				JSON.stringify({
					executionArn: executionArn,
				}),
			);
		}, 1000);
	});
	return fileKey;
}

async function dowloadFileToS3FromFileKey(file, apiUrl, idToken) {
	let url = idToken
		? window._config.api.stepExecution
		: window._config.api.publicStepExecution;
	let executionArn = await new Promise((resolve, reject) => {
		let xhhtp = new XMLHttpRequest();
		xhhtp.onreadystatechange = function () {
			if (this.readyState === 4 && this.status === 200) {
				let body = JSON.parse(this.response);
				console.log("file downloaded to s3");

				if (body.executionArn) {
					resolve(body.executionArn);
				} else {
					reject(body);
				}
			} else if (this.readyState === 4 && this.status !== 200) {
				reject(this);
			}
		};

		xhhtp.open("POST", url, true);

		let postBody = {
			fileKey: file.fileKey,
			fileName: file.name,
			type: file.type,
		};

		let stateMachineArn =
			window._config.stateMachineArn + "step-chobiitDownloadFile";

		if (idToken) {
			xhhtp.setRequestHeader("Authorization", idToken.jwtToken);
			postBody.token = idToken.jwtToken;
		} else {
			postBody.domain = window.getKintoneDomain();
			postBody.appId = window.getQueryStringByName("appId");

			stateMachineArn =
				window._config.stateMachineArn + "step-chobiitPublicDownloadFile";
			xhhtp.setRequestHeader("Content-Type", "application/json");
		}
		xhhtp.send(
			JSON.stringify({
				input: JSON.stringify(postBody),
				name: "MyExecution" + window.getUniqueStr(),
				stateMachineArn: stateMachineArn,
			}),
		);
	});

	let resp = await new Promise((resolve, reject) => {
		var requestLoop = setInterval(function () {
			var xhhtp = new XMLHttpRequest();
			xhhtp.onreadystatechange = function () {
				if (this.readyState === 4 && this.status === 200) {
					let body = JSON.parse(this.response);
					if (body.status == "SUCCEEDED") {
						clearInterval(requestLoop);

						let output = JSON.parse(body.output);
						resolve(JSON.parse(output.body));
					}

					if (body.status == "FAILED") {
						clearInterval(requestLoop);

						reject(body);
					}
				} else if (this.readyState === 4 && this.status !== 200) {
					//handler errr

					reject(this);
				}
			};
			xhhtp.open("POST", url + "/status", true);

			if (idToken) {
				xhhtp.setRequestHeader("Authorization", idToken.jwtToken);
			} else {
				xhhtp.setRequestHeader("Content-Type", "application/json");
			}
			xhhtp.send(
				JSON.stringify({
					executionArn: executionArn,
				}),
			);
		}, 1000);
	});
	return resp;
}

function downloadFileFromS3ToLocal(file, apiUrl, idToken) {
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState === 4 && this.status === 200) {
				if (JSON.parse(xhr.response).code == 200) {
					console.log("download file to local successs");
					// console.log(xhr.response);
					resolve(JSON.parse(xhr.response).body);
				} else {
					console.error(xhr.response);
					reject();
				}
			}
		};
		xhr.open("POST", apiUrl, true);
		if (idToken) {
			xhr.setRequestHeader("Authorization", idToken.jwtToken);
		} else {
			xhr.setRequestHeader("Content-Type", "application/json");
		}
		xhr.send(
			JSON.stringify({
				fileName: file.name,
				type: file.type,
				fileKey: file.fileKey,
				state: "done",
			}),
		);
	});
}

function checkFileOnS3(file, apiUrl, idToken) {
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState === 4 && this.status === 200) {
				if (JSON.parse(xhr.response).code == 200) {
					let check = JSON.parse(xhr.response).body;

					console.log("check result: ", check);
					// console.log(xhr.response);
					resolve(check);
				} else {
					console.error(xhr.response);
					reject();
				}
			}
		};
		xhr.open("POST", apiUrl, true);
		if (idToken) {
			xhr.setRequestHeader("Authorization", idToken.jwtToken);
		} else {
			xhr.setRequestHeader("Content-Type", "application/json");
		}
		xhr.send(
			JSON.stringify({
				fileName: file.name,
				fileKey: file.fileKey,
				state: "check",
			}),
		);
	});
}

async function downloadFile(file, apiUrl, idToken) {
	let check = await checkFileOnS3(file, apiUrl, idToken);

	if (!check) {
		await dowloadFileToS3FromFileKey(file, apiUrl, idToken);
	}

	let dowloadUrl = await downloadFileFromS3ToLocal(file, apiUrl, idToken);

	return await new Promise((resolve, reject) => {
		var request = new XMLHttpRequest();
		request.open("GET", dowloadUrl);
		request.responseType = "blob";
		request.onload = function () {
			console.log(this.response);
			const url = window.URL.createObjectURL(this.response);
			resolve(url);
		};
		request.send();
	});
}
