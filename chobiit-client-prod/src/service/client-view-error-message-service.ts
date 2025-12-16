import LocaleService from "chobiit-common/src/application/locale-service";

const localeService = LocaleService.getInstance("client");

export class ClientViewErrorMessageService {
	static getErrorMessage = (error: Error): string => {
		const errorMessage = error.message;
		const isUnknownError = errorMessage === undefined || errorMessage === "";
		const unknownSystemErrorMessage = localeService.translate("error", "system-error-of-unknown-cause");

		if (isUnknownError) {
			return `${unknownSystemErrorMessage}\n${error}`;
		}

		const translatedErrorMessage = localeService.translate(
			"error",
			errorMessage,
		);

		const isAbleToTranslated = translatedErrorMessage !== errorMessage
		if (isAbleToTranslated) {
			return translatedErrorMessage;
		} else {
			return errorMessage;
		}
	};
}
