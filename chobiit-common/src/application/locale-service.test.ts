import LocaleService from './locale-service';

test("`LocaleService` instance exists only one.", () => {
    process.env.CHOBIIT_LANG = 'ja';

    const localeService1 = LocaleService.getInstance("backend");
    const localeService2 = LocaleService.getInstance("backend");
    
    expect(localeService1).toBe(localeService2);
});

test("`LocaleService` can translate texts into Japanese.", () => {
    process.env.CHOBIIT_LANG = 'ja';
    const localeService = LocaleService.getInstance("backend");
    localeService.changeLanguage('ja');
    
    expect(localeService.translate("validation", "free-trial-expired")).toBe("利用終了です。");
});

test("`LocaleService` can translate texts into English.", () => {
    process.env.CHOBIIT_LANG = 'en';
    const localeService = LocaleService.getInstance("backend");
    localeService.changeLanguage('en');
    
    expect(localeService.translate("validation", "free-trial-expired")).toBe("The free trial period has expired.");
});

test("If `translate` method receives a not registerd key, it should return the key as it is.", () => {
    process.env.CHOBIIT_LANG = 'ja';
    const localeService = LocaleService.getInstance("backend");
    const unRegisteredKey = `un-registered-key-${Math.random()}`;
    
    expect(localeService.translate("error", unRegisteredKey)).toBe(unRegisteredKey);
});