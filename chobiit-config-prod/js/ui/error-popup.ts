import LocaleService from "../../../chobiit-common/src/application/locale-service"
const localeService = LocaleService.getInstance("config");

const $ = jQuery

const translateCommon = (key: string, option?: Record<string, any>): string =>
    localeService.translate("common", key, option);
const translateError = (key: string, option?: Record<string, any>): string =>
    localeService.translate("error", key, option);


export class ErrorPopup {
    private translationKey: string;
    private lineNumber: number | null;
    private errorMessage: string;

    constructor(translationKey: string, lineNumber: number | null) {
        this.translationKey = translationKey;
        this.lineNumber = lineNumber;
        this.errorMessage = this.getErrorMessage();
    }

    private getErrorMessage(): string {
        if (this.lineNumber === null) {
            return translateError(this.translationKey);
        } else {
            return translateError(this.translationKey, { lineNumber: this.lineNumber });
        }
    }

    public async showClientError(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: this.errorMessage,
                    type: 'red',
                    animateFromElement: false,
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    public async showServerError(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: this.errorMessage,
                    type: 'red',
                    animateFromElement: false,
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    public async showUnknownError(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                $.alert({
                    title: translateCommon("input-error-title"),
                    icon: 'fas fa-exclamation-triangle',
                    content: this.errorMessage,
                    type: 'red',
                    animateFromElement: false,
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}
