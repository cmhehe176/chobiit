export class HtmlString {
    constructor(body){
        this.body = body
    }

    escape(){
        // 過剰なエスケープ処理を防ぐために最初にアンエスケープ処理する
        this.body = this.body
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')

        //エスケープ処理
        this.body = this.body
        .replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27')
        .replace(/\//g, '&#x2F');
    }
}
