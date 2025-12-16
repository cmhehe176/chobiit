import {
	CognitoIdentityProviderClient,
	AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";



export class AwsCognitoRepository {
	static async isExistUser(userName: string) {
		const client = new CognitoIdentityProviderClient();

		const inputParams = {
            /**
             * TODO:この環境変数は、Lambdaでのみ管理されており、このリポジトリ内で管理できていない
             * 他のバックエンドの各Lambda関数でも同様にリポジトリ内で管理できていない環境変数が存在するので
             * 管理出来るようにする必要がある
             * 
             * 詳しくはこちらの改修チケットを参照
             * https://noveldev.backlog.com/view/CHOBIIT-293
             */
			UserPoolId: process.env.UserPoolId,
			Username: userName,
		};

		try {
			await client.send(new AdminGetUserCommand(inputParams));
			return true;
		} catch (error) {
			if (error.name === "UserNotFoundException") {
				console.log(`User ${userName} does not exist.`);
				return false;
			} else {
				console.error("Error checking user existence:", error);
				throw error;
			}
		}
	}
}
