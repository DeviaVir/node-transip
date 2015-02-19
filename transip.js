var Promise = require( 'bluebird' )
  , soap = require('soap')
  , cookie = require('soap-cookie')
  , moment = require('moment')
  , uuid = require('uuid')
  , crypto = require('crypto');

var Config = require( './config' )
  , utils = require( './utils' );

/**
 * Manage transip
 * @static
 * @class transip
 */
var transip = module.exports = {};

(function(transip) {
  "use strict";

  transip.version = '5.1';
  transip.mode = 'readwrite';
  transip.endpoint = 'api.transip.nl';
  transip.login = (Config.transip ? Config.transip.login : '');
  transip.privateKey = (Config.transip ? Config.transip.privateKey : '');

  transip.createClient = function createClient(endpoint, method, options) {
    options = options || {};

    return Promise.promisify(soap.createClient.bind(soap))('https://' + transip.endpoint + '/wsdl/?service=' + endpoint).then(function(client) {
      var timestamp = moment.utc().unix(),
          nonce = uuid.v4().substr(0, 30),
          signature = utils.urlencode(transip.sign(utils.array_merge(options, 
            { 
              '__method': method,
              '__service': endpoint,
              '__hostname': transip.endpoint,
              '__timestamp': timestamp,
              '__nonce': nonce
            }
          ))),
          Cookie = new cookie({
            'set-cookie': [
              'login=' + transip.login,
              'mode=' + transip.mode,
              'timestamp=' + timestamp,
              'nonce=' + nonce,
              'clientVersion=' + transip.version,
              'signature=' + signature
            ]
          });
      client.setSecurity(Cookie);

      return client;
    });
  };

  transip.updateDNS = function updateDNS(domain, ns1, ns2, ns3, ns4) {
    var data = {
          'domainName': domain, 
          'nameservers': [{
            'hostname': ns1,
            'ipv4': '',
            'ipv6': ''
          }, {
            'hostname': ns2,
            'ipv4': '',
            'ipv6': ''
          }, {
            'hostname': ns3,
            'ipv4': '',
            'ipv6': ''
          }]
        };
    if(ns4 !== void 0) {
      data[1].push({
        'hostname': ns4,
        'ipv4': '',
        'ipv6': ''
      });
    }
    return transip.createClient('DomainService', 'setNameservers', [data.domainName, data.nameservers]).then(function(client) {
      return Promise.promisify(client.setNameservers.bind(client))(data).then(function(response) {
        console.log('response', response);
      }).catch(function(err) {
        console.log('error', err);
        return Promise.reject();
      });
    });
  };

  /**
   * Helper function: Signs requests
   * @param  {Object} params 
   * @return {String}        
   */
  transip.sign = function sign(params) {
    params = utils.urlencodeParameters(params) || {};
    
    return crypto.createSign('RSA-SHA512').update(params).sign(transip.privateKey, 'base64');
  };

})(transip);

module.exports = transip;