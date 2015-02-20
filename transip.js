'use strict';

var Promise = require( 'bluebird' ),
    soap = require('soap'),
    cookie = require('soap-cookie'),
    moment = require('moment'),
    uuid = require('uuid'),
    crypto = require('crypto');

var utils = require('./utils'),
    config = require('./config');

/**
 * TransIP instance constructor
 * @prototype
 * @class  TransIP
 */
function TransIP(login, privateKey, data) {
  var transipInstance = this;
  transipInstance.data = data || {}; 
  transipInstance.version = 5.1;
  transipInstance.mode = 'readwrite';
  transipInstance.endpoint = 'api.transip.nl';
  transipInstance.login = (login ? login : config.transip.login);
  transipInstance.privateKey = (privateKey ? privateKey : config.transip.privateKey);
  return this; 
}

/**
 * Set up the SOAP client connection
 * @param  {String} endpoint 
 * @param  {String} method   
 * @param  {Hash} options  
 * @return {Promise}          
 */
TransIP.prototype.createClient = function createClient(service, method, options) {
  var transipInstance = this;

  options = options || {};

  return Promise.promisify(soap.createClient.bind(soap))('https://' + transipInstance.endpoint + '/wsdl/?service=' + service).then(function(client) {
    var timestamp = moment.utc().unix(),
        nonce = uuid.v4().substr(0, 30),
        signature = utils.urlencode(transipInstance.sign(utils.array_merge(options, 
          { 
            '__method': method,
            '__service': service,
            '__hostname': transipInstance.endpoint,
            '__timestamp': timestamp,
            '__nonce': nonce
          }
        ))),
        Cookie = new cookie({
          'set-cookie': [
            'login=' + transipInstance.login,
            'mode=' + transipInstance.mode,
            'timestamp=' + timestamp,
            'nonce=' + nonce,
            'clientVersion=' + transipInstance.version,
            'signature=' + signature
          ]
        });
    client.setSecurity(Cookie);

    return client;
  });
};

/**
 * Handle communicating with the TransIP SOAP API in one call
 * @param  {String} service       
 * @param  {String} method        
 * @param  {Array} data          
 * @param  {Mixed} formattedData Can be a hash or array
 * @return {Promise}               
 */
TransIP.prototype.communicate = function communicate(service, method, data, formattedData) {
  var transipInstance = this;

  return transipInstance.createClient(service, method, data).then(function(client) {
    console.log(client.describe().DomainServiceService.DomainServicePort[(method)]);
    return Promise.promisify(client[(method)].bind(client))(formattedData);
  });
};

/**
 * DomainService class containing all methods
 * @type {Class}
 */
TransIP.prototype.domainService = require(__dirname + '/lib/domainService');

/**
 * Helper function: Signs requests
 * @param  {Object} params 
 * @return {String}        
 */
TransIP.prototype.sign = function sign(params) {
  var transipInstance = this;
  params = utils.urlencodeParameters(params) || {};

  console.log(params);
  
  return crypto.createSign('RSA-SHA512').update(params).sign(transipInstance.privateKey, 'base64');
};

module.exports = TransIP;