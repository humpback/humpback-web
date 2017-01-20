const crypto = require('crypto');

exports.md5Crypto = (text, salt) => {
  salt = salt || 'hb@123';
  let str = `${text}-${salt}`;
  let encrypted = crypto.createHash('md5').update(str).digest("hex");
  return encrypted;
}

exports.cipher = (algorithm, key, value) => {
  var encrypted = "";
  var cip = crypto.createCipher(algorithm, key);
  encrypted += cip.update(value, 'utf8', 'hex');
  encrypted += cip.final('hex');
  return encrypted;
}

exports.decipher = (algorithm, key, encrypted) => {
  var decrypted = "";
  var decipher = crypto.createDecipher(algorithm, key);
  decrypted += decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}