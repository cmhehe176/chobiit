import { AllConfigData } from 'chobiit-common/src/types/chobiit';

describe('validateCsvFile:JP', () => {

    test('should return passed: true when all data is valid', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2']
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result).toEqual({ passed: true });
    });

    test('should return error exceed max users (test max users is 5)', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")

        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("chobiitのユーザー数が上限を超えています。<br>紐付けるkintoneアカウント: dev-1");
    });

    test('should return error not entered value', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', '', 'Name2', 'email@example.com', '45', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("2行目に未入力項目が存在します");
    });

    test('should return error invalid loginName', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['a b', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("2行目にログイン名にスペースを含むことはできません");
    });

    test('should return error invalid email address', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'com', '45', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("2行目のメールアドレスの形式が正しくありません");
    });

    describe("should return error loginName is too long", () => {
        test('JP: loginName exceed 128', async () => {
            const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")
            const formattedCsvArray = [
                ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
                ['this_loginName_is_129_characters_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
            ];
            const result = validateCsvFileWithDefaults(formattedCsvArray)
            expect(result.passed).toEqual(false)
            expect(result.errorInfo?.content).toEqual("2行目のchobiitユーザーのログイン名が128文字を超えています");
        });

        // US特有の処理のテストについては, US版テストのところで対応しています
    })


    describe("should return error invalid admin",  () => {
        test('isAdmin is string case', async() => {
            const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")
            const formattedCsvArray = [
                ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
                ['login2', 'dev-1', 'Name2', 'email@example.com', '45', 'hello', 'password2'],
            ];
            const result = validateCsvFileWithDefaults(formattedCsvArray)
            expect(result.passed).toEqual(false)
            expect(result.errorInfo?.content).toEqual("2行目の管理者が不正です");
        });

        test('isAdmin is number case', async () => {
            const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")
            const formattedCsvArray = [
                ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
                ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '534', 'password2'],
            ];
            const result = validateCsvFileWithDefaults(formattedCsvArray)
            expect(result.passed).toEqual(false)
            expect(result.errorInfo?.content).toEqual("2行目の管理者が不正です");
        });
    })

    test('should return error invalid appId', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', 'aaa', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("2行目の利用するアプリIDが不正です");
    });


    test('should return error duplicate loginName', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("2行目のChobiitログイン名が重複しています");
    });

    describe("should return error invalid password", () => {
        test('JP: exceed 50 password', async () => {
            const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")
            const formattedCsvArray = [
                ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
                ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'this_password_is_51_characters_aaaaaaaaaaaaaaaaaaaa'],
            ];
            const result = validateCsvFileWithDefaults(formattedCsvArray)
            expect(result.passed).toEqual(false)
            expect(result.errorInfo?.content).toEqual("2行目のパスワード半角英数字50文字までを入力してください");
        });

        // US特有の処理のテストについては, US版テストのところで対応しています
    })

    test('should return error this app id does not exist', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("ja")

        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '2', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("2行目のアプリIDがアプリ設定に存在しません");
    });


});

describe('validateCsvFile:US', () => {

    test('should return passed: true when all data is valid', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2']
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result).toEqual({ passed: true });
    });

    test('should return error exceed max users (test max users is 5)', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")

        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("The number of Chobiit users has exceeded the limit.<br>The kintone account you want to connect to: dev-1");
    });

    test('should return error not entered value', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', '', 'Name2', 'email@example.com', '45', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("Please confirm that all fields are filled in line 2.");
    });

    test('should return error invalid loginName', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['a b', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("The login name cannot contain spaces on line 2");
    });

    test('should return error invalid email address', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'com', '45', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("Please confirm that the email address in line 2 is valid.");
    });

    describe("should return error loginName is too long", () => {
        // JP特有の処理のテストについては, JP版テストのところで対応しています
        test('US: loginName exceed 20', async () => {
            const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
            const formattedCsvArray = [
                ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
                ['21_characters_0000000', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
            ];

            const result = validateCsvFileWithDefaults(formattedCsvArray)
            expect(result.passed).toEqual(false)
            expect(result.errorInfo?.content).toEqual("Login name on line 2: Use 3 - 64 characters with a mix of letters and/or numbers, <br>and symbol . - _ @ (other symbols are not supported) <br>starting from either a letter or number");
        });
    })


    describe("should return error invalid admin",  () => {
        test('isAdmin is string case', async() => {
            const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
            const formattedCsvArray = [
                ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
                ['login2', 'dev-1', 'Name2', 'email@example.com', '45', 'hello', 'password2'],
            ];
            const result = validateCsvFileWithDefaults(formattedCsvArray)
            expect(result.passed).toEqual(false)
            expect(result.errorInfo?.content).toEqual("Please confirm that the administrator in line 2 is valid.");
        });

        test('isAdmin is number case', async () => {
            const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
            const formattedCsvArray = [
                ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
                ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '534', 'password2'],
            ];
            const result = validateCsvFileWithDefaults(formattedCsvArray)
            expect(result.passed).toEqual(false)
            expect(result.errorInfo?.content).toEqual("Please confirm that the administrator in line 2 is valid.");
        });
    })

    test('should return error invalid appId', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', 'aaa', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("Please confirm that the app ID in line 2 is valid.");
    });


    test('should return error duplicate loginName', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("The Chobiit login name is duplicated in line 2. Please enter a different login name.");
    });

    describe("should return error invalid password", () => {
        // JP特有の処理のテストについては, JP版テストのところで対応しています

        test('US: exceed 50 password', async () => {
            const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
            const formattedCsvArray = [
                ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
                ['login2', 'dev-1', 'Name2', 'email@example.com', '45', '', 'this_password_is_51_characters_aaaaaaaaaaaaaaaaaaaa'],
            ];
            const result = validateCsvFileWithDefaults(formattedCsvArray)
            expect(result.passed).toEqual(false)
            expect(result.errorInfo?.content).toEqual("Please enter 50 or less single-byte alphanumeric characters in line 2");
        });
    })

    test('should return error this app id does not exist', async () => {
        const validateCsvFileWithDefaults: any = await generateValidateCsvFileFuncWithDefaults("en")
        const formattedCsvArray = [
            ['login1', 'dev-1', 'Name1', 'email@example.com', '45', '', 'password1'],
            ['login2', 'dev-1', 'Name2', 'email@example.com', '2', '', 'password2'],
        ];
        const result = validateCsvFileWithDefaults(formattedCsvArray)
        expect(result.passed).toEqual(false)
        expect(result.errorInfo?.content).toEqual("The app in line 2 does not exist in the App settings. Please confirm that the App has been set up.");
    });


});

async function generateValidateCsvFileFuncWithDefaults(chobiitLang: string) {
    // importのキャッシュをクリアする
    jest.resetModules();

    // 環境変数を変更し, 動的インポートを行う
    process.env.CHOBIIT_LANG = chobiitLang
    const module = await import('./validate-csv-file');

    const defaultAllConfigData: AllConfigData = {
        code: 200,
        data: {
            users: [{
                "kintoneUsername": "dev-1",
                "password": "1000",
                "kintoneLoginName": "dev-1",
                "apps": "[\"45\"]",
                "kintoneOrganizations": "[\"健康課_V2AfjQ\"]",
                "kintoneGroups": "[\"everyone\"]",
                "mailAddress": "sample@novelworks.jp",
                "cybozuToken": "aaaaaaaaaaaaaaaa",
                "isAdmin": true,
                "name": "dev-1",
                "domain": "4t7p2udy8wsm.cybozu.com",
                "loginName": "13909"
            }],
            kintoneUsers: [{
                "kintoneLoginName": "dev-1",
                "cybozuToken": "aaaaaaaaaaaaaaaa",
                "domain": "4t7p2udy8wsm.cybozu.com"
            }],
            apps: [{ app: '45', auth: true }, { app: '2', auth: false }]
        }
    };
    const defaultLoginNameRegex = /^\S{1,}$/;
    const defaultMaxNumberOfUsers: number = 5;

    return (formattedCsvArray: any) => {
        return module.validateCsvFile(
            formattedCsvArray,
            defaultAllConfigData,
            defaultLoginNameRegex,
            defaultMaxNumberOfUsers
        );
    };
};
