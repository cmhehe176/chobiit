↓　Solutionとして、こちらのファイルに記入します。
https://docs.google.com/spreadsheets/d/1Ur6VVlJt3YQvwzDAB-KT3GEFOdI-tP2iUH_ktcN9Uu0/edit#gid=751870726
↓　説明画像：
![image][image (1).png]
↓　説明文：
今度の対応はユーザーのブラウザ側にパスワード暗号化なしでCognitoの暗号化を利用して保存する方針で変更点があります。
また、ユーザーが古いUserPoolから新しいUserPoolに移動する際にパスワードポリシーによって、二つのケースを発生しました。
前提：
元々のUserPool➞１
新しいUserPool➞２
前提以上
ケース①
１と２のパスワードポリシーが同じ➞問題なく移動できる
ケース②
１と２のパスワードポリシーが違う（２に大文字がありを設定）
➞移動できない（Cognitoがパスワードポリシーをチェックしますので）
解決として、添付画像で解決できます。
パスワード忘れケースのみ2にユーザー移動する
![image][Screenshot_1.png]