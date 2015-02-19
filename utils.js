var Promise = require( 'bluebird' )
  , crypto = require( 'crypto' );

// Utils
exports.urlencode = function urlencode(string) {
  return encodeURIComponent(string);
};
exports.urlencodeParameters = function urlencodeParameters(parameters, keyPrefix) {
  keyPrefix = keyPrefix || false;

  if(typeof parameters !== 'object') {
    return exports.urlencode(parameters);
  }

  var encodedData = [];
  Object.keys(parameters).forEach(function(key) {
    var encodedKey = (keyPrefix === false ? exports.urlencode(key) : keyPrefix + '[' + exports.urlencode(key) + ']');
    if(parameters[key] !== void 0) {
      var value = parameters[key];
      if(typeof value === 'object') {
        encodedData.push(exports.urlencodeParameters(value, (encodedKey === '0' ? false : encodedKey)));
      }
      else {
        encodedData.push(encodedKey + '=' + exports.urlencode(value));
      }
    }
  });

  return encodedData.join('&');
};
exports.sha512asn1 = function sha512asn1(data) {
  var digest = crypto.createHash('sha512').update(data).digest('binary');
  var asn1  = String.fromCharCode(0x30) + String.fromCharCode(0x51);
      asn1 += String.fromCharCode(0x30) + String.fromCharCode(0x0d);
      asn1 += String.fromCharCode(0x06) + String.fromCharCode(0x09);
      asn1 += String.fromCharCode(0x60) + String.fromCharCode(0x86) + String.fromCharCode(0x48) + String.fromCharCode(0x01) + String.fromCharCode(0x65);
      asn1 += String.fromCharCode(0x03) + String.fromCharCode(0x04);
      asn1 += String.fromCharCode(0x02) + String.fromCharCode(0x03);
      asn1 += String.fromCharCode(0x05) + String.fromCharCode(0x00);
      asn1 += String.fromCharCode(0x04) + String.fromCharCode(0x40);

  asn1 = asn1 + '' + digest;
  return asn1;
};
exports.chr = function chr(codePt) {
  if (codePt > 0xFFFF) {
    codePt -= 0x10000;
    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
  }
  return String.fromCharCode(codePt);
};
exports.array_merge = function array_merge() {
  var args = Array.prototype.slice.call(arguments),
    argl = args.length,
    arg,
    retObj = {},
    k = '',
    argil = 0,
    j = 0,
    i = 0,
    ct = 0,
    toStr = Object.prototype.toString,
    retArr = true;

  for (i = 0; i < argl; i++) {
    if (toStr.call(args[i]) !== '[object Array]') {
      retArr = false;
      break;
    }
  }

  if (retArr) {
    retArr = [];
    for (i = 0; i < argl; i++) {
      retArr = retArr.concat(args[i]);
    }
    return retArr;
  }

  for (i = 0, ct = 0; i < argl; i++) {
    arg = args[i];
    if (toStr.call(arg) === '[object Array]') {
      for (j = 0, argil = arg.length; j < argil; j++) {
        retObj[ct++] = arg[j];
      }
    } else {
      for (k in arg) {
        if (arg.hasOwnProperty(k)) {
          if (parseInt(k, 10) + '' === k) {
            retObj[ct++] = arg[k];
          } else {
            retObj[k] = arg[k];
          }
        }
      }
    }
  }
  return retObj;
};
