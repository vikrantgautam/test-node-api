const CryptoJS = require("crypto-js");

const key = "aFpdCWpbkjhgfd@12345tgb4RhmX10Um"; // length == 32
const iv = "Hp@0bJeW95EzxKup"; // length == 16

function encrypt(textToEncrypt) {
  var key8 = CryptoJS.enc.Utf8.parse(key);
  var iv8 = CryptoJS.enc.Utf8.parse(iv);

  return CryptoJS.AES.encrypt(textToEncrypt, key8, {
    keySize: 32,
    iv: iv8,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

function decrypt(textToDecrypt) {
  var key8 = CryptoJS.enc.Utf8.parse(key);
  var iv8 = CryptoJS.enc.Utf8.parse(iv);

  return CryptoJS.AES.decrypt(textToDecrypt, key8, {
    keySize: 32,
    iv: iv8,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
}

module.exports = {
  encrypt,
  decrypt,
};
