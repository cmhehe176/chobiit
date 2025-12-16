import { AjaxResponseHandler, AjaxErrorHandler } from './ajax-handler';
import { ErrorPopup } from '../ui/error-popup';

jest.mock('../ui/error-popup', () => {
    return {
        ErrorPopup: jest.fn().mockImplementation(() => ({
            showClientError: jest.fn(),
            showServerError: jest.fn(),
            showUnknownError: jest.fn(),
        })),
    };
});

describe('AjaxResponseHandler', () => {

    describe("Boundary Tests", () => {

        test('should handle informational responses correctly (boundary)', () => {
            [100, 199].forEach(statusCode => {
                const handler = new AjaxResponseHandler({ status: statusCode });
                const responseType = handler.handleResponse();
                expect(responseType).toBe('informational');
            });
        });

        test('should handle success responses correctly (boundary)', () => {
            [200, 299].forEach(statusCode => {
                const handler = new AjaxResponseHandler({ status: statusCode });
                const responseType = handler.handleResponse();
                expect(responseType).toBe('success');
            });
        });

        test('should handle redirection responses correctly (boundary)', () => {
            [300, 399].forEach(statusCode => {
                const handler = new AjaxResponseHandler({ status: statusCode });
                const responseType = handler.handleResponse();
                expect(responseType).toBe('redirection');
            });
        });

        test('should handle unknown responses correctly (boundary)', () => {
            [400, 500, 600].forEach(statusCode => {
                const handler = new AjaxResponseHandler({ status: statusCode });
                const responseType = handler.handleResponse();
                expect(responseType).toBe('unknown');
            });
        });
    })



    describe("Equivalence Tests", () => {
        test('should handle informational responses correctly (equivalence)', () => {
            [150].forEach(statusCode => {
                const handler = new AjaxResponseHandler({ status: statusCode });
                const responseType = handler.handleResponse();
                expect(responseType).toBe('informational');
            });
        });

        test('should handle success responses correctly (equivalence)', () => {
            [250].forEach(statusCode => {
                const handler = new AjaxResponseHandler({ status: statusCode });
                const responseType = handler.handleResponse();
                expect(responseType).toBe('success');
            });
        });

        test('should handle redirection responses correctly (equivalence)', () => {
            [350].forEach(statusCode => {
                const handler = new AjaxResponseHandler({ status: statusCode });
                const responseType = handler.handleResponse();
                expect(responseType).toBe('redirection');
            });
        });

        test('should handle unknown responses correctly (equivalence)', () => {
            [450, 550, 650].forEach(statusCode => {
                const handler = new AjaxResponseHandler({ status: statusCode });
                const responseType = handler.handleResponse();
                expect(responseType).toBe('unknown');
            });
        });
    })

});

describe('AjaxErrorHandler', () => {

    describe("Boundary Tests", () => {
        test('should handle client error responses correctly (boundary)', () => {
            [400, 499].forEach(statusCode => {
                const handler = new AjaxErrorHandler({ status: statusCode }, 'translationKey', 123);
                const responseType = handler.handleResponse();
                expect(responseType).toBe('clientError');
                expect(ErrorPopup).toHaveBeenCalledWith('translationKey', 123);
            });
        });

        test('should handle server error responses correctly (boundary)', () => {
            [500, 599].forEach(statusCode => {
                const handler = new AjaxErrorHandler({ status: statusCode }, 'translationKey', 123);
                const responseType = handler.handleResponse();
                expect(responseType).toBe('serverError');
                expect(ErrorPopup).toHaveBeenCalledWith('translationKey', 123);
            });
        });

        test('should handle unknown error responses correctly (boundary)', () => {
            [600, 700].forEach(statusCode => {
                const handler = new AjaxErrorHandler({ status: statusCode }, 'translationKey', 123);
                const responseType = handler.handleResponse();
                expect(responseType).toBe('unknownError');
                expect(ErrorPopup).toHaveBeenCalledWith('translationKey', 123);
            });
        });

    })

    describe("Equivalence Tests", () => {
        test('should handle client error responses correctly (equivalence)', () => {
            [450].forEach(statusCode => {
                const handler = new AjaxErrorHandler({ status: statusCode }, 'translationKey', 123);
                const responseType = handler.handleResponse();
                expect(responseType).toBe('clientError');
                expect(ErrorPopup).toHaveBeenCalledWith('translationKey', 123);
            });
        });

        test('should handle server error responses correctly (equivalence)', () => {
            [550].forEach(statusCode => {
                const handler = new AjaxErrorHandler({ status: statusCode }, 'translationKey', 123);
                const responseType = handler.handleResponse();
                expect(responseType).toBe('serverError');
                expect(ErrorPopup).toHaveBeenCalledWith('translationKey', 123);
            });
        });

        test('should handle unknown error responses correctly (equivalence)', () => {
            [650].forEach(statusCode => {
                const handler = new AjaxErrorHandler({ status: statusCode }, 'translationKey', 123);
                const responseType = handler.handleResponse();
                expect(responseType).toBe('unknownError');
                expect(ErrorPopup).toHaveBeenCalledWith('translationKey', 123);
            });
        });
    })

});
