import JSDOMEnvironment from "jest-environment-jsdom";

/**
 * jsdom環境にて、structuredCloneを使用出来なかったので
 * それを使用出来るように拡張したクラス
 */
export default class JSDOMFixEnvironment extends JSDOMEnvironment {
	constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
		super(...args);

		this.global.structuredClone = structuredClone;
	}
}
