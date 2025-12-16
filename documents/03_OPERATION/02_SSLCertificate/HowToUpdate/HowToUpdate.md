# 前提

- [chobiit.me の SSL 証明書](https://us-east-1.console.aws.amazon.com/acm/home?region=us-east-1#/certificates/13693434-c528-456b-be0a-59fa05f42954)だけ、AWS 外で発行したものを利用しているため、自動更新がされない。
- ※chobiit.us, chobiit.net は AWS 側で自動更新される。
- そのため、自分たちで更新作業を行う必要がある。

# 補足情報

- 期限切れの 30, 14, 7日前に、添付ファイル「SSL証明書有効期限間近のお知らせ.txt」のような文面のメールが届きます（webmaster アカウント宛）
- 大まかな手順はこちら：https://novelworks.cybozu.com/k/53/show#record=81&tab=comments&mode=show&s.keyword=chobiit%2520ssl
- SSL Storeのアカウント情報：https://novelworks.cybozu.com/k/35/show#record=46

# 手順

## Step1. SSL 証明書購入
- すでに購入しているブランドで購入する（*.chobiit.me は FujiSSL-Wildcard　更新１年のはず。[SSL Store](https://www.ssl-store.jp/system/service.php/certificate)で確認せよ！）
- 購入の際のデポジットのチャージは[こちら](https://novelworks.cybozu.com/k/35/show#record=266&tab=comments&mode=show)のカードを使う。ただ、一応確認はしましょう。

![image][スクリーンショット 2022-11-09 10.01.50.png]

## Step2. SSL 証明書のアクティベート

【注意：アクティベート完了後の承認確認・審査に１〜２週間程度かかる可能性があるとのこと。お早めに。】

common name: *.chobiit.me
認証方式：DNS 認証

CSRの作成

```
$ openssl genrsa 2048 > '*.chobiit.me.key'
$ openssl req -new -key '*.chobiit.me.key' -sha256 -out '*.chobiit.me.csr'
Country Name: JP
State or Province Name: Osaka
Locality Name: Osaka
Organization Name: Novelworks
Organizational Unit Name: (未入力ででenter)
Common Name: *.chobiit.me
(以降の項目は未入力でEnter)
```

！作成したcsrは[ここ](https://www.ssl-store.jp/system/tool.php/csrcheck/exec)で念のため確認しましょう！

「ドメイン所有者情報」「技術担当者情報」は、前回の申請内容を参考に入力する。（以下のキャプチャのように申請情報をダウンロードできる）
![image][スクリーンショット 2022-11-09 10.17.47.png]