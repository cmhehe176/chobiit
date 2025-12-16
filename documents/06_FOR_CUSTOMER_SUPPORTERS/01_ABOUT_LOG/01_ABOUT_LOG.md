（確認日: 2023/1/31）

# 本ページ作成の経緯
利用を検討しているユーザーより回答を依頼されたセキュリティチェックにログ内容に関する項目があり、
現状どのようなログが出力されているか簡易に確認した。

※ユーザーからの依頼は以下の通り
```
> クライアントIPアドレス・端末名・ユーザID・アクセスした情報・ダウンロードした情報・ログオフした時刻なとお教えください。
```

# 確認結果

## 対象Lambda
一番呼び出されてそうな[chobiitGetRecord](https://us-west-1.console.aws.amazon.com/lambda/home?region=us-west-1#/functions/chobiitGetRecord?tab=code)をチョイス

## 対象Lambdaで出力されていることが確認できたもの（ユーザー情報っぽいものを抜粋）
1. クライアントIP
2. User-Agent（ブラウザ情報）
3. ログイン名

## ユーザーが気にされているもので上にないものについて
> ・端末名

なし

> ・ダウンロードした情報

[chobiitDownloadFile](https://us-west-1.console.aws.amazon.com/lambda/home?region=us-west-1#/functions/chobiitDownloadFile?tab=monitoring)のログから追うことは可能

> ・ログオフした時刻

なし（ブラウザで持っている情報を消しているだけなので現仕様ではログ取得自体難しそう）

## 参考

[chobiitGetRecord](https://us-west-1.console.aws.amazon.com/lambda/home?region=us-west-1#/functions/chobiitGetRecord?tab=code)で出ているログ（Lambda eventの中身を出力しています）

```json
{
    "resource": "/chobitone/app/{id}/record/{recordId}",
    "path": "/chobitone/app/3028/record/6",
    "httpMethod": "GET",
    "headers": {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "ja,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
        "Authorization": "eyJraWQiOiJEXC84TFJySitBVElHTHg1ZFlCQWNWa2JVTFVPVnhFZytTTHhoNnJmeU9Tcz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI5YjM0MzFhYS02MTYwLTQwYWEtOGE5Mi05NTBmZTMyYjFmMTEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiY3VzdG9tOmRvbWFpbiI6InhmNjRlLmN5Ym96dS5jb20iLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0xLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMV9ZOHJPQ0d3a0kiLCJjb2duaXRvOnVzZXJuYW1lIjoiZnVyYnl0ZXN0IiwiYXVkIjoiNXVpdWZ0ajNiN2dicTlqb3AxNDNuYjVhMDEiLCJldmVudF9pZCI6IjdkNmExNmVkLTVhNmItNGVmNS1hMTI5LTE0NThlY2QxMjNjMiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjc1MTU2MDg0LCJuaWNrbmFtZSI6ImZ1cmJ5dGVzdCIsImV4cCI6MTY3NTI0MjQ4NCwiaWF0IjoxNjc1MTU2MDg0LCJlbWFpbCI6InRzdWppbW90b3RAbm92ZWx3b3Jrcy5qcCJ9.mjnH6Ewsuy2XjAqdjkmXEaE-GvPd5lOVwOjT04BAJCShQLxfY8mnXzZAQKdcHmVhwWe8yde_VdW5d7e6yHaqokrYBgsZwCYy7-kNZHqUHunWoethmNpl7n8jTS4Wok2Pb1x-fkUiegxaMEFY1CNzR4UpXs1jDBsyzpJ8SG3DwbLbHRay3g-JaT-_5skUEvhL9RuYg5SeB_ysS73GCHBVyzHcBp1Wj-vsMUJkDlIwAjYJvTDINmd8czF-E3WK-ZocvNyAo7yVGHDr1VERoRYKPck1p4CzPRPe4lwI1dGFZNnUAJVmpxZRpfluvqnt1rP8_ib_Y_LacZ8Ic5xza2r4Ww",
        "Host": "gsw02mq7zb.execute-api.us-west-1.amazonaws.com",
        "origin": "https://xf64e.chobiit.me",
        "referer": "https://xf64e.chobiit.me/",
        "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        "X-Amzn-Trace-Id": "Root=1-63d8da92-2ffff47a0934e67220fea221",
        "X-Forwarded-For": "58.70.92.147",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https"
    },
    "multiValueHeaders": {
        "accept": [
            "*/*"
        ],
        "accept-encoding": [
            "gzip, deflate, br"
        ],
        "accept-language": [
            "ja,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6"
        ],
        "Authorization": [
            "eyJraWQiOiJEXC84TFJySitBVElHTHg1ZFlCQWNWa2JVTFVPVnhFZytTTHhoNnJmeU9Tcz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI5YjM0MzFhYS02MTYwLTQwYWEtOGE5Mi05NTBmZTMyYjFmMTEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiY3VzdG9tOmRvbWFpbiI6InhmNjRlLmN5Ym96dS5jb20iLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0xLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMV9ZOHJPQ0d3a0kiLCJjb2duaXRvOnVzZXJuYW1lIjoiZnVyYnl0ZXN0IiwiYXVkIjoiNXVpdWZ0ajNiN2dicTlqb3AxNDNuYjVhMDEiLCJldmVudF9pZCI6IjdkNmExNmVkLTVhNmItNGVmNS1hMTI5LTE0NThlY2QxMjNjMiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjc1MTU2MDg0LCJuaWNrbmFtZSI6ImZ1cmJ5dGVzdCIsImV4cCI6MTY3NTI0MjQ4NCwiaWF0IjoxNjc1MTU2MDg0LCJlbWFpbCI6InRzdWppbW90b3RAbm92ZWx3b3Jrcy5qcCJ9.mjnH6Ewsuy2XjAqdjkmXEaE-GvPd5lOVwOjT04BAJCShQLxfY8mnXzZAQKdcHmVhwWe8yde_VdW5d7e6yHaqokrYBgsZwCYy7-kNZHqUHunWoethmNpl7n8jTS4Wok2Pb1x-fkUiegxaMEFY1CNzR4UpXs1jDBsyzpJ8SG3DwbLbHRay3g-JaT-_5skUEvhL9RuYg5SeB_ysS73GCHBVyzHcBp1Wj-vsMUJkDlIwAjYJvTDINmd8czF-E3WK-ZocvNyAo7yVGHDr1VERoRYKPck1p4CzPRPe4lwI1dGFZNnUAJVmpxZRpfluvqnt1rP8_ib_Y_LacZ8Ic5xza2r4Ww"
        ],
        "Host": [
            "gsw02mq7zb.execute-api.us-west-1.amazonaws.com"
        ],
        "origin": [
            "https://xf64e.chobiit.me"
        ],
        "referer": [
            "https://xf64e.chobiit.me/"
        ],
        "sec-ch-ua": [
            "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\""
        ],
        "sec-ch-ua-mobile": [
            "?0"
        ],
        "sec-ch-ua-platform": [
            "\"macOS\""
        ],
        "sec-fetch-dest": [
            "empty"
        ],
        "sec-fetch-mode": [
            "cors"
        ],
        "sec-fetch-site": [
            "cross-site"
        ],
        "User-Agent": [
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
        ],
        "X-Amzn-Trace-Id": [
            "Root=1-63d8da92-2ffff47a0934e67220fea221"
        ],
        "X-Forwarded-For": [
            "58.70.92.147"
        ],
        "X-Forwarded-Port": [
            "443"
        ],
        "X-Forwarded-Proto": [
            "https"
        ]
    },
    "queryStringParameters": null,
    "multiValueQueryStringParameters": null,
    "pathParameters": {
        "recordId": "6",
        "id": "3028"
    },
    "stageVariables": null,
    "requestContext": {
        "resourceId": "rz9o0v",
        "authorizer": {
            "claims": {
                "sub": "9b3431aa-6160-40aa-8a92-950fe32b1f11",
                "email_verified": "true",
                "custom:domain": "xf64e.cybozu.com",
                "iss": "https://cognito-idp.us-west-1.amazonaws.com/us-west-1_Y8rOCGwkI",
                "cognito:username": "furbytest",
                "aud": "5uiuftj3b7gbq9jop143nb5a01",
                "event_id": "7d6a16ed-5a6b-4ef5-a129-1458ecd123c2",
                "token_use": "id",
                "auth_time": "1675156084",
                "nickname": "furbytest",
                "exp": "Wed Feb 01 09:08:04 UTC 2023",
                "iat": "Tue Jan 31 09:08:04 UTC 2023",
                "email": "tsujimotot@novelworks.jp"
            }
        },
        "resourcePath": "/chobitone/app/{id}/record/{recordId}",
        "httpMethod": "GET",
        "extendedRequestId": "fmcW8H3NyK4Fffg=",
        "requestTime": "31/Jan/2023:09:08:34 +0000",
        "path": "/dev/chobitone/app/3028/record/6",
        "accountId": "831344450728",
        "protocol": "HTTP/1.1",
        "stage": "dev",
        "domainPrefix": "gsw02mq7zb",
        "requestTimeEpoch": 1675156114693,
        "requestId": "9d6c4e5c-b176-4309-8cca-eb4f6b4269cb",
        "identity": {
            "cognitoIdentityPoolId": null,
            "accountId": null,
            "cognitoIdentityId": null,
            "caller": null,
            "sourceIp": "58.70.92.147",
            "principalOrgId": null,
            "accessKey": null,
            "cognitoAuthenticationType": null,
            "cognitoAuthenticationProvider": null,
            "userArn": null,
            "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
            "user": null
        },
        "domainName": "gsw02mq7zb.execute-api.us-west-1.amazonaws.com",
        "apiId": "gsw02mq7zb"
    },
    "body": null,
    "isBase64Encoded": false
}
```