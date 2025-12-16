'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _0x10db = ['FileSizeOver', '###\x20ERROR_PLUGIN_LIMITS\x20\x20###', 'ERROR_PLUGIN_LIMITS', 'pluginAuthorizeError', '▼pluginAuthorizeError', 'errCode=', 'endDate=', 'stateCode=', 'limit\x20=', 'code', 'error', 'Not\x20Defined\x20ErrorCode\x20errCode=', 'StateCode:', '\x20>\x20', '\x0a\x20PluginID=', 'format', 'YYYY/MM/DD\x20HH:mm', '\x0a\x20ご利用期間は', '\x0a\x20The\x20period\x20of\x20use\x20is\x20until\x20', '\x0a\x20stateMessage=', 'message=[', 'Error', 'displayErrorMessageForLimits', '*pluginId=', 'pluginId', '#\x20parameter\x20End\x20#', 'errorMessgae', 'errorCode', 'log', '#\x20parameter\x20Start\x20#', 'lang=', 'lang', 'ERROR_CODE_TABLE', '0001', 'kintoneへのレコード登録に失敗しました。', 'Failed\x20to\x20register\x20records\x20to\x20kintone.', '無法將記錄註冊到kintone', 'alert', '0002', '試用期間が終了しました。', 'The\x20trial\x20period\x20has\x20ended.', '试用期已结束', '0003', '有償契約が終了しました。', 'A\x20paid\x20contract\x20has\x20ended.', '有偿合同已经结束', '利用ユーザ数が制限を超えました。', 'Number\x20of\x20users\x20exceeded\x20the\x20limit.', '用户数超过限制', '0005', 'ファイル容量が制限を超えました。', 'The\x20file\x20size\x20exceeded\x20the\x20limit.', '文件大小超出限制', '0006', '利用回数が制限を超えました。', 'The\x20number\x20of\x20times\x20of\x20use\x20exceeded\x20the\x20limit.', '入力されたアクティベートキーが不正です。', '输入的激活密钥无效', '0008', '認証処理に失敗しました。', 'Authentication\x20processing\x20failed.', '认证处理失败', '0009', 'Emailアドレスを入力してください。', '请输入您的电子邮件地址', '利用ユーザ数、利用回数、ファイル容量の制限対象のプラグインではありません。', 'It\x20is\x20not\x20a\x20plugin\x20subject\x20to\x20the\x20number\x20of\x20users\x20used,\x20the\x20number\x20of\x20times\x20of\x20use,\x20and\x20the\x20file\x20capacity\x20limit.', '它不是一个受使用用户数量，使用次数和文件容量限制影响的插件', '0011', 'プラグインの設定画面でプラグインの利用登録を行って下さい。', '请在插件设置画面上使用插件注册', '###\x20ERROR_CODE_TABLE\x20###', 'ERROR_CODE', '0004', '0007', '###\x20ERROR_CODE\x20###', 'plafjgejaajmikhijbcbapgmpljbfkkl', 'hnaddhcaicjbnplegegmimbakpcgdkkd', 'UserOver', 'ejnnelliggefejkgecmlebgkcjndleig', '名刺解析プラグイン', 'UsedCountOver', '添付ファイル拡張プラグイン'];(function (_0x3d7f72, _0x3b07ad) {
  var _0x9fc31b = function _0x9fc31b(_0x15ff20) {
    while (--_0x15ff20) {
      _0x3d7f72['push'](_0x3d7f72['shift']());
    }
  };_0x9fc31b(++_0x3b07ad);
})(_0x10db, 0xc2);var _0x5df2 = function _0x5df2(_0x2efd1b, _0x434c14) {
  _0x2efd1b = _0x2efd1b - 0x0;var _0x29b992 = _0x10db[_0x2efd1b];return _0x29b992;
};
var NovelErrorMessage = function () {
  function NovelErrorMessage(_0x432932) {
    _classCallCheck(this, NovelErrorMessage);

    console['log']('▼constructor\x20[NovelErrorMessage]');console[_0x5df2('0x0')](_0x5df2('0x1'));console[_0x5df2('0x0')](_0x5df2('0x2') + _0x432932);console['log']('#\x20parameter\x20End\x20#');this[_0x5df2('0x3')] = _0x432932;this[_0x5df2('0x4')] = [{ 'output': _0x5df2('0x0'), 'type': 0x5, 'code': _0x5df2('0x5'), 'ja': _0x5df2('0x6'), 'en': _0x5df2('0x7'), 'zh': _0x5df2('0x8') }, { 'output': _0x5df2('0x9'), 'type': 0x5, 'code': _0x5df2('0xa'), 'ja': _0x5df2('0xb'), 'en': _0x5df2('0xc'), 'zh': _0x5df2('0xd') }, { 'output': _0x5df2('0x9'), 'type': 0x5, 'code': _0x5df2('0xe'), 'ja': _0x5df2('0xf'), 'en': _0x5df2('0x10'), 'zh': _0x5df2('0x11') }, { 'output': 'alert', 'type': 0x5, 'code': '0004', 'ja': _0x5df2('0x12'), 'en': _0x5df2('0x13'), 'zh': _0x5df2('0x14') }, { 'output': _0x5df2('0x9'), 'type': 0x5, 'code': _0x5df2('0x15'), 'ja': _0x5df2('0x16'), 'en': _0x5df2('0x17'), 'zh': _0x5df2('0x18') }, { 'output': _0x5df2('0x9'), 'type': 0x5, 'code': _0x5df2('0x19'), 'ja': _0x5df2('0x1a'), 'en': _0x5df2('0x1b'), 'zh': '使用次数超过限制' }, { 'output': _0x5df2('0x9'), 'type': 0x5, 'code': '0007', 'ja': _0x5df2('0x1c'), 'en': 'The\x20entered\x20activation\x20key\x20is\x20invalid.', 'zh': _0x5df2('0x1d') }, { 'output': _0x5df2('0x9'), 'type': 0x5, 'code': _0x5df2('0x1e'), 'ja': _0x5df2('0x1f'), 'en': _0x5df2('0x20'), 'zh': _0x5df2('0x21') }, { 'output': _0x5df2('0x9'), 'type': 0x1, 'code': _0x5df2('0x22'), 'ja': _0x5df2('0x23'), 'en': 'Please\x20enter\x20your\x20email\x20address.', 'zh': _0x5df2('0x24') }, { 'output': 'alert', 'type': 0x1, 'code': '0010', 'ja': _0x5df2('0x25'), 'en': _0x5df2('0x26'), 'zh': _0x5df2('0x27') }, { 'output': _0x5df2('0x9'), 'type': 0x5, 'code': _0x5df2('0x28'), 'ja': _0x5df2('0x29'), 'en': 'Please\x20use\x20plugin\x20registration\x20on\x20plugin\x20setting\x20screen.', 'zh': _0x5df2('0x2a') }];console[_0x5df2('0x0')](_0x5df2('0x2b'));console[_0x5df2('0x0')](this['ERROR_CODE_TABLE']);this[_0x5df2('0x2c')] = { 'FaildInsertRecord': _0x5df2('0x5'), 'TrialEnd': '0002', 'NotActive': '0003', 'UserOver': _0x5df2('0x2d'), 'FileSizeOver': _0x5df2('0x15'), 'UsedCountOver': _0x5df2('0x19'), 'authkeyInjustice': _0x5df2('0x2e'), 'FailedAuth': _0x5df2('0x1e'), 'EmptyEmail': _0x5df2('0x22'), 'NotSupportedPlugin': '0010', 'unRegistrationUser': _0x5df2('0x28') };console[_0x5df2('0x0')](_0x5df2('0x2f'));console[_0x5df2('0x0')](this[_0x5df2('0x2c')]);this['ERROR_PLUGIN_LIMITS'] = [{ 'pluginId': _0x5df2('0x30'), 'pluginName': 'Googleコンタクト対応連携プラグイン', 'errorCode': this[_0x5df2('0x2c')]['UserOver'] }, { 'pluginId': _0x5df2('0x31'), 'pluginName': 'Googleカレンダー™対応連携プラグイン', 'errorCode': this[_0x5df2('0x2c')][_0x5df2('0x32')] }, { 'pluginId': _0x5df2('0x33'), 'pluginName': _0x5df2('0x34'), 'errorCode': this[_0x5df2('0x2c')][_0x5df2('0x35')] }, { 'pluginId': 'plibjcgjnplnpabkmjnhkchcfafhandc', 'pluginName': _0x5df2('0x36'), 'errorCode': this[_0x5df2('0x2c')][_0x5df2('0x37')] }];console[_0x5df2('0x0')](_0x5df2('0x38'));console[_0x5df2('0x0')](this[_0x5df2('0x39')]);
  }

  _createClass(NovelErrorMessage, [{
    key: _0x5df2('0x3a'),
    value: function value(_0xe0f25, _0x49d2c7, _0x38178e, _0x22c0e2) {
      var _0x1163b2 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0x0;

      var _0x324d91 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0x0;

      var _0x2dc2e0 = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0x0;

      var _0x29a79c = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '';

      console[_0x5df2('0x0')](_0x5df2('0x3b'));console[_0x5df2('0x0')](_0x5df2('0x1'));console[_0x5df2('0x0')](_0xe0f25);console['log'](_0x5df2('0x3c') + _0x49d2c7);console[_0x5df2('0x0')]('pluginId=' + _0x38178e);console[_0x5df2('0x0')](_0x5df2('0x3d') + _0x22c0e2);console[_0x5df2('0x0')](_0x5df2('0x3e') + _0x1163b2);console[_0x5df2('0x0')]('count=' + _0x324d91);console[_0x5df2('0x0')](_0x5df2('0x3f') + _0x2dc2e0);console[_0x5df2('0x0')]('stateMessage\x20=' + _0x29a79c);console[_0x5df2('0x0')]('#\x20parameter\x20End\x20#');var _0x38411e = {};for (var _0x57dcd0 in _0xe0f25['ERROR_CODE_TABLE']) {
        var _0x40521d = _0xe0f25[_0x5df2('0x4')][_0x57dcd0];if (_0x49d2c7 != _0x40521d[_0x5df2('0x40')]) {
          continue;
        }_0x38411e = _0x40521d;break;
      }if (!_0x38411e) {
        console[_0x5df2('0x41')](_0x5df2('0x42') + _0x49d2c7);return;
      }console[_0x5df2('0x0')](_0x38411e);var _0x1debfe = '';if (_0x1163b2 != 0x0) {
        _0x1debfe = _0x5df2('0x43') + _0x1163b2;
      }console[_0x5df2('0x0')](_0x38411e[_0xe0f25[_0x5df2('0x3')]]);_0x1debfe += '\x0a' + _0x38411e[_0xe0f25[_0x5df2('0x3')]];if (_0x324d91 != 0x0 && _0x2dc2e0 != 0x0) {
        _0x1debfe += '\x20(' + _0x324d91 + _0x5df2('0x44') + _0x2dc2e0 + ')';
      }_0x1debfe += _0x5df2('0x45') + _0x38178e;if (_0x22c0e2) {
        var _0x3b99a4 = moment(_0x22c0e2);var _0x57ee71 = _0x3b99a4[_0x5df2('0x46')](_0x5df2('0x47'));if (_0xe0f25[_0x5df2('0x3')] == 'ja') {
          _0x1debfe += _0x5df2('0x48') + _0x57ee71 + 'までです。';
        } else if (_0xe0f25[_0x5df2('0x3')] == 'en') {
          _0x1debfe += _0x5df2('0x49') + _0x57ee71;
        } else if (_0xe0f25[_0x5df2('0x3')] == 'zh') {
          _0x1debfe += '\x0a\x20使用期限为' + _0x57ee71;
        }
      }if (_0x29a79c != '') {
        _0x1debfe += _0x5df2('0x4a') + _0x29a79c;
      }console[_0x5df2('0x0')](_0x5df2('0x4b') + _0x1debfe + ']');swal(_0x5df2('0x4c'),  _0x1debfe,  'error');
    }
  }, {
    key: _0x5df2('0x4d'),
    value: function value(_0x16d944, _0x54428e, _0x1753b0) {
      console[_0x5df2('0x0')]('▼displayErrorMessageForLimits');console[_0x5df2('0x0')]('#\x20parameter\x20Start\x20#');console[_0x5df2('0x0')](_0x5df2('0x4e') + _0x16d944[_0x5df2('0x4f')]);console['log']('*count=' + _0x54428e);console[_0x5df2('0x0')]('*limit=' + _0x1753b0);console[_0x5df2('0x0')](_0x5df2('0x50'));for (var _0x5b38f8 in _0x16d944[_0x5df2('0x51')][_0x5df2('0x39')]) {
        var _0x324de0 = _0x16d944[_0x5df2('0x51')][_0x5df2('0x39')][_0x5b38f8];if (_0x16d944[_0x5df2('0x4f')] != _0x324de0[_0x5df2('0x4f')]) {
          continue;
        }console[_0x5df2('0x0')](_0x324de0['pluginId']);console[_0x5df2('0x0')](_0x324de0['pluginName']);console[_0x5df2('0x0')](_0x324de0['errorCode']);_0x16d944[_0x5df2('0x51')][_0x5df2('0x3a')](_0x16d944[_0x5df2('0x51')], _0x324de0[_0x5df2('0x52')], _0x16d944[_0x5df2('0x4f')], null, 0x0, _0x54428e, _0x1753b0);return;
      }console[_0x5df2('0x41')]('Not\x20Defined\x20pluginId=' + _0x16d944[_0x5df2('0x4f')]);_0x16d944[_0x5df2('0x51')][_0x5df2('0x3a')](_0x16d944[_0x5df2('0x51')], _0x16d944[_0x5df2('0x51')][_0x5df2('0x2c')]['NotSupportedPlugin'], _0x16d944['pluginId'], null, 0x0, _0x54428e, _0x1753b0);return;
    }
  }]);

  return NovelErrorMessage;
}();