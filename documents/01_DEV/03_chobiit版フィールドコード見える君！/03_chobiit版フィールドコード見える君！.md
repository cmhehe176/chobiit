# chobiitフィールドコード見える君!
図:
![image][スクリーンショット 2023-07-05 11.30.35.png]

## はじめに

このレポジトリは chobiit 開発の際に、UI に Kintone で設定したフィールドコードを表示するものです。
追加画面/編集画面で表示できる。
Google の拡張機能`ScriptAutoRunner`を使用し、chobiit 使用時に起動させます。

## 使用方法

- Google の拡張機能`ScriptAutoRunner`を Chrome に追加する。（以下の URL より追加）
  `https://chrome.google.com/webstore/detail/scriptautorunner/gpgjofmpmjjopcogjgdldidobhmjmdbm`

- Google Chrome 上部のリンク横にある拡張機能（パズルマーク）より`ScriptAutoRunner`を開く
- `ScriptAutoRunner`のスクリプトにペーストする
- 以下コードです。

```
const iframe = document.getElementById("iframe");

iframe.addEventListener("load", function() {
  const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
  const inputElements = iframeContent.querySelectorAll('input, select');

  inputElements.forEach((input) => {
    const fieldCode = input.getAttribute('data-code');
    const fieldCodeElement = document.createElement('span');
    fieldCodeElement.textContent = fieldCode;
    fieldCodeElement.style.color = 'white';
    fieldCodeElement.style.backgroundColor = '#00d1b2';
    fieldCodeElement.style.padding = '2px 6px';
    fieldCodeElement.style.borderRadius = '4px'; 
    input.parentNode.appendChild(fieldCodeElement);
  });
});
```
- ここにペースト
![image][スクリーンショット 2023-07-05 11.13.35.png]
- url 欄には`.chobiit.me`と入力する
- タイトルを「chobiit 見える君」（タイトルはなんでも良い）と入力する
- ここまでで設定は完了
- chobiit を使用する際にはリンク横にある拡張機能より ScriptAutoRunner に表示される「chobiit 見える君」をオンにする
- フィールド見える
