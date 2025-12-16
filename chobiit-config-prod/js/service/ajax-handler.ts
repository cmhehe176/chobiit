import { ErrorPopup } from "../ui/error-popup";

interface jqXHR {
    status: number;
}

export class AjaxResponseHandler {
    jqXHR: jqXHR;
    statusCode: number;
    responseType: string | null;

    constructor(jqXHR: jqXHR) {
        this.jqXHR = jqXHR;
        this.statusCode = jqXHR.status;
        this.responseType = null;
    }

    handleResponse(): string | null {
        if (this.isInformational()) {
            this.handleInformational();
            return this.responseType;
        } else if (this.isSuccess()) {
            this.handleSuccess();
            return this.responseType;
        } else if (this.isRedirection()) {
            this.handleRedirection();
            return this.responseType;
        } else {
            this.handleUnknown();
            return this.responseType;
        }
    }

    isInformational(): boolean {
        return 100 <= this.statusCode && this.statusCode <= 199;
    }

    isSuccess(): boolean {
        return 200 <= this.statusCode && this.statusCode <= 299;
    }

    isRedirection(): boolean {
        return 300 <= this.statusCode && this.statusCode <= 399;
    }

    handleInformational(): void {
        this.responseType = "informational";
    }

    handleSuccess(): void {
        this.responseType = "success";
    }

    handleRedirection(): void {
        this.responseType = "redirection";
    }

    handleUnknown(): void {
        this.responseType = "unknown";
    }
}

export class AjaxErrorHandler extends AjaxResponseHandler {
    translationKey: string;
    lineNumber: number;

    constructor(jqXHR: jqXHR, translationKey: string, lineNumber: number) {
        super(jqXHR);
        this.translationKey = translationKey;
        this.lineNumber = lineNumber;
    }

    handleResponse(): string | null {
        if (this.isClientError()) {
            this.handleClientError();
            return this.responseType;
        } else if (this.isServerError()) {
            this.handleServerError();
            return this.responseType;
        } else {
            this.handleUnknownError();
            return this.responseType;
        }
    }

    isClientError(): boolean {
        return 400 <= this.statusCode && this.statusCode <= 499;
    }

    isServerError(): boolean {
        return 500 <= this.statusCode && this.statusCode <= 599;
    }

    handleClientError(): void {
        this.responseType = "clientError";
        const errorPopup = new ErrorPopup(this.translationKey, this.lineNumber);
        errorPopup.showClientError();
    }

    handleServerError(): void {
        this.responseType = "serverError";
        const errorPopup = new ErrorPopup(this.translationKey, this.lineNumber);
        errorPopup.showServerError();
    }

    handleUnknownError(): void {
        this.responseType = "unknownError";
        const errorPopup = new ErrorPopup(this.translationKey, this.lineNumber);
        errorPopup.showUnknownError();
    }
}
