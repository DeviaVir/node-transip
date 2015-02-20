var Promise = require('bluebird'),
    parseString = require('xml2js').parseString,
    moment = require('moment');

/**
 * DomainService instance constructor
 * @prototype
 * @class domainService
 */
function domainService(instance) {
  this.transip = instance || {};
  this.service = 'DomainService';
}

/**
 * Starts a domain batch check for availability
 * @param  {Array} domainNames 
 * @return {Promise}            argument[0] = array with objects
 */
domainService.prototype.batchCheckAvailability = function batchCheckAvailability(domainNames) {    
  domainNames = domainNames || [];
  if(domainNames.length < 1) {
    return Promise.reject(new Error(404));
  }

  var data = {
    'domainNames': domainNames
  };

  var domains = [];
  return this.transip.communicate(this.service, 'batchCheckAvailability', [data.domainNames], data).then(function(body) {
    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:batchCheckAvailabilityResponse'][0]['return'][0]['item'] !== void 0) {
        return Promise.resolve(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:batchCheckAvailabilityResponse'][0]['return'][0]['item']).each(function(domain) {
          /** Domain looks like https://gist.github.com/DeviaVir/353cbae59ade244a309c */
          var actions = [];
          domain.actions[0]['item'].forEach(function(action) {
            actions.push(action._);
          });

          var fDomain = {
            'name': domain.domainName[0]._,
            'status': domain.status[0]._,
            'actions': actions
          };

          domains.push(fDomain);
        }).then(function() {
          return domains;
        });
      }
      else {
        return domains;
      }
    });
  });
};

/**
 * Starts a domain check for availability
 * @param  {Array} domainName 
 * @return {Promise}            argument[0] = object
 */
domainService.prototype.checkAvailability = function checkAvailability(domain) {
  if(domain === void 0 || domain === '') {
    return Promise.reject(new Error(404));
  }

  if(domain.substr(-1) === '.') {
    domain = domain.slice(0, -1);
  }

  var data = {
    'domainName': domain
  };

  return this.transip.communicate(this.service, 'checkAvailability', [data.domainName], data).then(function(body) {
    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:checkAvailabilityResponse'][0]['return'] !== void 0) {
        var domain = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:checkAvailabilityResponse'][0]['return'];
        return { 'status': domain[0]._ };
      }
      else {
        return {'status': 'no results for domain'};
      }
    });
  });
};

/**
 * Retrieves WHOIS information for the given domain
 * @param  {String} domain 
 * @return {Promise}       argument[0] = the whois
 */
domainService.prototype.getWhois = function getWhois(domain) {
  if(domain === void 0 || domain === '') {
    return Promise.reject(new Error(404));
  }

  if(domain.substr(-1) === '.') {
    domain = domain.slice(0, -1);
  }

  var data = {
    'domainName': domain
  };

  return this.transip.communicate(this.service, 'getWhois', [data.domainName], data).then(function(body) {
    return body[0]['return']['$value'];
  });
};

/**
 * Retrieve list of domains on your transip account
 * @return {Promise} argument[0] = array of domains
 */
domainService.prototype.getDomainNames = function getDomainNames() {
  return this.transip.communicate(this.service, 'getDomainNames').then(function(body) {
    if(body[0]['return']['item'].length > 0) {
      var domains = [];
      return Promise.resolve(body[0]['return']['item']).each(function(domain) {
        domains.push(domain['$value']);
      }).then(function() {
        return domains;
      });
    }
    else {
      return [];
    }
  });
};

/**
 * Retrieves information for the given domain
 * @param  {String} domain 
 * @return {Promise}       argument[0] = the info
 */
domainService.prototype.getInfo = function getWhois(domain) {
  var _this = this;

  if(domain === void 0 || domain === '') {
    return Promise.reject(new Error(404));
  }

  if(domain.substr(-1) === '.') {
    domain = domain.slice(0, -1);
  }

  var data = {
    'domainName': domain
  };

  return this.transip.communicate(this.service, 'getInfo', [data.domainName], data).then(function(body) {
    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getInfoResponse'][0]['return'][0] !== void 0) {
        var info = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getInfoResponse'][0]['return'][0];

        return _this.transip.xmlResolver(info.nameservers[0]['item']).then(function(nameservers) {
          var data = {
            'nameservers': nameservers
          };
          return data;
        }).then(function(data) {
          return _this.transip.xmlResolver(info.contacts[0]['item']).then(function(contacts) {
            data.contacts = contacts;
            return data;
          });
        }).then(function(data) {
          return _this.transip.xmlResolver(info.dnsEntries[0]['item']).then(function(dnsEntries) {
            data.dnsEntries = dnsEntries;
            return data;
          });
        }).then(function(data) {
          return _this.transip.xmlResolver(info.branding).then(function(branding) {
            data.branding = branding;
            return data;
          });
        }).then(function(data) {
          data.name = info.name[0]['_'];
          data.authCode = ('authCode' in info && info.authCode.length > 0 ? info.authCode[0]['_'] : null);
          data.isLocked = ('isLocked' in info && info.isLocked.length > 0 ? info.isLocked[0]['_'] : null);
          data.registrationDate = ('registrationDate' in info && info.registrationDate.length > 0 ? moment(info.registrationDate[0]['_'], 'YYYY-MM-DD').utc().unix() : null);
          data.renewalDate = ('renewalDate' in info && info.renewalDate.length > 0 ? moment(info.renewalDate[0]['_'], 'YYYY-MM-DD').utc().unix() : null);
          return data;
        });
      }
      else {
        return {};
      }
    });
  });
};

/**
 * Starts a nameserver change for this domain, will replace all existing nameservers with the new nameservers
 * @param  {String} domain 
 * @param  {Object} ns1    {'hostname': full domain, 'ipv4': '', 'ipv6': ''}
 * @param  {Object} ns2    {'hostname': full domain, 'ipv4': '', 'ipv6': ''}
 * @param  {Object} ns3    {'hostname': full domain, 'ipv4': '', 'ipv6': ''}
 * @param  {String} ns4    {'hostname': full domain, 'ipv4': '', 'ipv6': ''} - optional.
 * @return {Promise}        
 */
domainService.prototype.setNameservers = function setNameservers(domain, ns1, ns2, ns3, ns4) {  
  if(domain === void 0 || domain === '') {
    return Promise.reject(new Error(404));
  }

  if(ns1 === void 0 || Object.keys(ns1).length === 0 || ns1.hostname === void 0 || ns1.hostname === '') {
    return Promise.reject(new Error(403));
  }

  ns2 = ns2 || {};
  ns3 = ns3 || {};
  ns4 = ns4 || {};

  /** Check if domain doesn't accidentally have a trailing dot */
  if(domain.substr(-1) === '.') {
    domain = domain.slice(0, -1);
  }

  var data = {
    'domainName': domain, 
    'nameservers': [ns1]
  };

  if(Object.keys(ns2).length > 0) {
    data.nameservers.push(ns2);
  }
  if(Object.keys(ns3).length > 0) {
    data.nameservers.push(ns3);
  }
  if(Object.keys(ns4).length > 0) {
    data.nameservers.push(ns4);
  }
  
  return this.transip.communicate(this.service, 'setNameservers', [data.domainName, data.nameservers], data);
};

module.exports = domainService;