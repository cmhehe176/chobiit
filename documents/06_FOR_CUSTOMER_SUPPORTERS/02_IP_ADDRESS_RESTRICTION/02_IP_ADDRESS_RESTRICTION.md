# はじめに

いくつかの顧客（ドメイン）において、オプションで Chobiit の利用に IP アドレス制限を設けている顧客があります。

許可する IP アドレスを指定してもらう方式です。

ただし、IP アドレスを顧客が自身で設定できるような UI は無く、Novelworks 側で設定をする。

# 利用中ドメイン

## chobiit-jp(日本版)
なし

## chobiit-us

- `atca.kintone.com`
    - [CloudFront Distribution](https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=ap-northeast-1#/distributions/EJGJBFI20WWLH)
    - [WAF Web ACL](https://us-east-1.console.aws.amazon.com/wafv2/homev2/web-acl/atca-kintone-com/80e6bcc4-426f-4c00-8130-cfbe5074f845/overview?region=global)
    - [IP sets](https://us-east-1.console.aws.amazon.com/wafv2/homev2/ip-set/atca-kintone-com/c3841c5c-09f2-4e99-ad67-54f629597294?region=global)

# Chobiit IPアドレス制限の仕組み

AWS WAF を CloudFront に適用することで実現しています。

# 許可 IP アドレスの設定手順

- AWS Management Console にログインする。
- 対象ドメインの IP sets を開く。
- `Add IP address`をクリックし、許可する IP アドレスを入力する。

![image][IPアドレス追加.png]

- 注意：CIDR 表記で入力すること。また、アドレス部分はネットワークの先頭アドレスを記載すること。
- 注意：もしネットワークの先頭アドレスを知る必要がある場合は、[こちら](https://note.cman.jp/network/subnetmask.cgi)のようなツールを使って算出すること。