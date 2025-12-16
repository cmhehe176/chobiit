export class LambdaCommonResponse {
    static handleSuccess = (data:any, callback:Function):void =>  {
        console.log('Handle success:', JSON.stringify(data, null, 2));
    
        const responseBody = {
            code: 200,
            body: JSON.stringify(data)
        };
    
        const response = {
            statusCode: 200,
            body: JSON.stringify(responseBody)
        };
    
        callback(null, response);
    }

    // TODO : 引数 error が any を使用しないようにする
    // それぞれのエラーに対応する ステータスコードや、エラーメッセージ、ログ出力などを汎用的に変化させるような
    // Errorオブジェクト を作成する必要がある
    static handleError = (error:any, callback:Function):void => {
        console.log('Handle error:', JSON.stringify(error, null, 2));

        const response = {
            statusCode: 200,
            body: JSON.stringify(error)
        };

        callback(null, response);
    }
}

/**
 * `chobiit-client-prod`配下のファイルからのリクエストに対するレスポンスを定義する
 */
export class ClientCommonResponse {
    private static buildResponseHeader = (): {[key:string]:string} => {
        return {
            "Access-Control-Allow-Credentials" : "true",
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Cache-Control" : 'no-cache, must-revalidate',
            "Strict-Transport-Security" : 'max-age=63072000; includeSubDomains; preload',
            "X-Content-Type-Options" : 'nosniff',
            "Referrer-Policy" : 'same-origin',
            'Expires' : '-1',
            'Pragma' : 'no-cache',
        };
    }

    static handleSuccess = (data:any, callback:Function):void =>  {
        console.log('Handle success:', JSON.stringify(data, null, 2));
    
        const responseBody = {
           code: 200,
           data: data,
        };
   
        const response = {
           headers: this.buildResponseHeader(),
           body:  JSON.stringify(responseBody)
        };
   
       callback(null, response);
    }

    // TODO : 引数 error が any を使用しないようにする
    // それぞれのエラーに対応する ステータスコードや、エラーメッセージ、ログ出力などを汎用的に変化させるような
    // Errorオブジェクト を作成する必要がある
    static handleError = (error:any, callback:Function):void => {
        console.log('Handle error:', error);
    
        const responseBody = {
            code: 400,
            message: error.message,
            messageDev: error
        };
        
        const response = {
            headers: this.buildResponseHeader(),
            body: JSON.stringify(responseBody)
        };
    
        callback(null, response);
    }
}
