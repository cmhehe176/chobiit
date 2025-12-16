import LocaleService from "chobiit-common/src/application/locale-service";
const localeService = LocaleService.getInstance("backend");

export default class KintoneErrorMessageConverter {

  private static isKintoneError(error: any): boolean {
    return error.response?.data?.code && error.response?.data?.message;
  }

  static toArranged(error): any {

    if (!this.isKintoneError(error)) {
      return error.message;
    }

    const errorCode = error.response.data.code;
    const errorMessage = error.response.data.message;

    const translated = localeService.translate("kintone-error", errorCode);

    /**
     * `localeService.translate`では存在しないキーが渡された場合に、キーをそのまま返却する
     * その場合はkintoneからのエラーメッセージをそのまま返却する
     */
    if (translated === errorCode) {
      console.warn("未定義のkintone REST API エラーコード: ", errorCode)
      return `${errorMessage}(${errorCode})`;
    }

    return translated;
  }
}
