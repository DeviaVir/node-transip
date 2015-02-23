'use strict';

var Promise = require( 'bluebird' ),
    soap = require('soap'),
    cookie = require('soap-cookie'),
    moment = require('moment'),
    uuid = require('uuid'),
    crypto = require('crypto'),
    util = require('util');

var utils = require('./utils'),
    config = require('./config');

var domainService = require(__dirname + '/lib/domainService');

/**
 * TransIP instance constructor
 * @prototype
 * @class  TransIP
 */
function TransIP(login, privateKey) {
  this.version = 5.1;
  this.mode = 'readwrite';
  this.endpoint = 'api.transip.nl';
  this.login = (login ? login : config.transip.login);
  this.privateKey = (privateKey ? privateKey : config.transip.privateKey);

  this.domainService = new domainService(this);
}

/**
 * Set up the SOAP client connection
 * @param  {String} endpoint 
 * @param  {String} method   
 * @param  {Hash} options  
 * @return {Promise}          
 */
TransIP.prototype.createClient = function createClient(service, method, options) {
  var _this = this;

  options = options || {};

  return Promise.promisify(soap.createClient.bind(soap))('https://' + this.endpoint + '/wsdl/?service=' + service).then(function(client) {
    var timestamp = moment.utc().unix(),
        nonce = uuid.v4().substr(0, 30),
        signature = utils.urlencode(_this.sign(utils.array_merge(options, 
          { 
            '__method': method,
            '__service': service,
            '__hostname': _this.endpoint,
            '__timestamp': timestamp,
            '__nonce': nonce
          }
        ))),
        Cookie = new cookie({
          'set-cookie': [
            'login=' + _this.login,
            'mode=' + _this.mode,
            'timestamp=' + timestamp,
            'nonce=' + nonce,
            'clientVersion=' + _this.version,
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
  data = data || [];
  formattedData = formattedData || null;

  return this.createClient(service, method, data).then(function(client) {
    //console.log(util.inspect(client.describe().DomainServiceService.DomainServicePort[(method)], true, 100, true));
    return Promise.promisify(client[(method)].bind(client))(formattedData);
  });
};

/**
 * The SOAP api sometimes returns XML in a weird way, use this function to normalize it
 * @param  {Array} array e.g. result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getInfoResponse'][0]['return'][0].contacts[0]['item']
 * @return {Array}       Normalized array
 */
TransIP.prototype.xmlResolver = function xmlResolver(array) {
  var items = [];
  return Promise.resolve(array).each(function(item) {
    var obj = {};
    return Promise.resolve(Object.keys(item)).each(function(key) {
      if(key !== '$' && key.length > 0) {
        var value = item[(key)][0]['_'];
        if(value !== void 0) {
          obj[(key)] = value;
        }
      }
    }).then(function() {
      items.push(obj);
    });
  }).then(function() {
    return items;
  });
};

/**
 * Helper function: Signs requests
 * @param  {Object} params 
 * @return {String}        
 */
TransIP.prototype.sign = function sign(params) {
  params = utils.urlencodeParameters(params) || {};
  //console.log(params);
  return crypto.createSign('RSA-SHA512').update(params).sign(this.privateKey, 'base64');
};

module.exports = TransIP;
