import { ErrorPopup } from './error-popup';
import $ from 'jquery';

declare global {
  interface JQueryStatic {
    alert(options: any): any;
  }
}

describe('ErrorPopup', () => {
  beforeAll(() => {
    $.alert = jest.fn().mockImplementation((options) => {
      return options;
    });
  });

  test('should return error message without line number when lineNumber is null', () => {
    const errorPopup = new ErrorPopup('failed-to-register-kintone-user-in-a-line', null);
    const errorMessage = errorPopup['getErrorMessage']();
    expect(errorMessage).toBe('{{lineNumber}}行目のユーザー登録に失敗しました');
  });

  test('should return error message with line number when lineNumber is provided', () => {
    const errorPopup = new ErrorPopup('failed-to-register-kintone-user-in-a-line', 22);
    const errorMessage = errorPopup['getErrorMessage']();
    expect(errorMessage).toBe('22行目のユーザー登録に失敗しました');
  });
});
