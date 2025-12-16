import i18next, {i18n, TOptions} from 'i18next';
import backendEn from './../locales/backend/en.json';
import backendJa from './../locales/backend/ja.json';
import clientEn from './../locales/client/en.json';
import clientJa from './../locales/client/ja.json';
import configEn from './../locales/config/en.json';
import configJa from './../locales/config/ja.json';

const CONTEXTS = ['client', 'config', 'backend'] as const;
type Context = typeof CONTEXTS[number];

const NAMESPACES = ['error', 'validation', 'common', 'info', 'kintone-error'] as const;
type Namespace = typeof NAMESPACES[number];

const LANGUAGES = ['en', 'ja'] as const;
type Language = typeof LANGUAGES[number];

/**
 * ソースコード中で出力する自然言語の多言語対応を実施するクラス.
 * 
 * 言語の設定は環境変数`CHOBIIT_LANG`で切り替えるため、適切に環境変数の設定を行う必要がある。
 * client, config ではビルド時に環境変数を入れ込む。backend では、OSレベルでの環境変数を設定する。
 *
 * メッセージは`common/src/locales/{client,config,backend}/{ja,en}.json`ファイルに記載.
 *
 * # Usage
 * 
 * ```javascript
 * const localeService = LocaleService.getInstance("backend");
 * localeService.translate("error", "key");
 * localeService.translate("validation", "key");
 * localeService.translate("common", "key");
 * ```
 */
export default class LocaleService {
    /**
     * LocaleService のインスタンス。
     * Singleton Pattern で実装する。
     */
    private static serviceInstance?: LocaleService;
    
    /**
     * i18next のインスタンス。
     * 実際に使う際は一度だけ初期化がされているものとする。
     */
    private instance: i18n;
    
    /**
     * LocaleService が使われるコンテキスト。
     */
    private context: Context;
    

    /**
     * ATTENTION: Singleton Pattern を採用しているため、決して`constructor`を public にしないこと。
     * @param context 
     */
    private constructor(context: Context) {
        if (LocaleService.serviceInstance) {
            throw new Error("LocaleService instance is already initialized.");
        }
        
        const resources = (() => {
            switch (context) {
                case "backend":
                    return { en: backendEn, ja: backendJa };
                case "client":
                    return { en: clientEn, ja: clientJa };
                case "config":
                    return { en: configEn, ja: configJa };
            }
        })();

        if (process.env.CHOBIIT_LANG !== 'en' && process.env.CHOBIIT_LANG !== 'ja') {
            throw new Error("Invalid CHOBIIT_LANG. CHOBIIT_LANG must be 'en' or 'ja'.");
        }

        i18next
            .init({
                /**
                 * # NOTE
                 * 
                 * 環境変数`CHOBIIT_LANG`で切り替えます。
                 */
                lng: process.env.CHOBIIT_LANG,
                supportedLngs: ['en', 'ja'],
                fallbackLng: 'en',
                ns: NAMESPACES,
                resources,
            });
            
        this.instance = i18next;
        this.context = context;
        LocaleService.serviceInstance = this;
    }
    
    /**
     * 初期設定が"1度だけ"実行された LocaleService インスタンスを返す。
     * @params 
     * @returns 
     */
    static getInstance(context: Context): LocaleService {
        if (this.serviceInstance) {
            if (this.serviceInstance.context !== context) {
                throw new Error(`LocaleService instance is already initialized with different context. current: ${this.serviceInstance.context}, new: ${context}`);
            }
            return this.serviceInstance;
        }
        
        const localeService = new LocaleService(context);
        LocaleService.serviceInstance = localeService;
        
        return localeService;
    }
    
    /**
     * 各言語設定に応じたメッセージを返す。
     * 
     * @param namespace 
     * @param key 
     * @returns 
     */
    translate(namespace: Namespace, key: string, options?: TOptions): string {
        return this.instance.t(key, {...options, ns: namespace});
    }
    
    /**
     * 言語設定を変更する
     * @param newLang - "en", "ja"
     */
    async changeLanguage(newLang: Language): Promise<void> {
        await this.instance.changeLanguage(newLang);
    }
    
    /**
     * 言語設定ごとの時刻フォーマットを返す
     * 
     * @returns Time Format String (eg. 'HH:mm')
     */
    static getTimeFormat(): "HH:mm" | "hh:mm A" {
        switch (process.env.CHOBIIT_LANG) {
            case "ja":
                return "HH:mm";
            case "en":
                return "hh:mm A";
            default:
                throw new Error("Invalid CHOBIIT_LANG. CHOBIIT_LANG must be 'en' or 'ja'.");
        }
    }
}