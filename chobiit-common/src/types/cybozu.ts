export namespace CybozuUserAPI {

  /**
   * https://cybozu.dev/ja/common/docs/user-api/overview/data-structure/#organization
   */
  export type Organization = {
    id: string;
    code: string;
    name: string;
    localName: string;
    localNameLocale: string;
    parentCode: string | null;
    description: string;
  };[]
}
