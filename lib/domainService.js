var Promise = require('bluebird'),
    parseString = require('xml2js').parseString;

/**
 * DomainService instance constructor
 * @prototype
 * @class domainService
 */
function domainService(instance) {
  var dsInstance = this;

  dsInstance.transip = instance || {};
  dsInstance.service = 'DomainService';

  return dsInstance;
}

/**
 * Starts a domain batch check for availability
 * @param  {Array} domainNames 
 * @return {Array}              with objects
 */
domainService.prototype.batchCheckAvailability = function batchCheckAvailability(domainNames) {
  var dsInstance = this;
    
  domainNames = domainNames || [];
  if(domainNames.length < 1) {
    return Promise.reject(new Error(404));
  }

  var data = {
    'domainNames': domainNames
  };

  var domains = [];
  return dsInstance.transip.communicate(dsInstance.service, 'batchCheckAvailability', [data.domainNames], data).then(function(body) {
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
 * Starts a nameserver change for this domain, will replace all existing nameservers with the new nameservers
 * @param  {String} domain 
 * @param  {String} ns1    full domain
 * @param  {String} ns2    full domain
 * @param  {String} ns3    full domain
 * @param  {String} ns4    full domain - optional.
 * @return {Promise}        
 */
domainService.prototype.setNameservers = function setNameservers(domain, ns1, ns2, ns3, ns4) {
  var dsInstance = this;
  
  if(domain === void 0 || domain === '') {
    return Promise.reject(new Error(404));
  }

  if(ns1 === void 0 || ns1 === '') {
    return Promise.reject(new Error(403));
  }
  ns2 = ns2 || '';
  ns3 = ns3 || '';
  ns4 = ns4 || '';

  /** Check if domain doesn't accidentally have a trailing dot */
  if(domain.substr(-1) === '.') {
    domain = domain.slice(0, -1);
  }

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

  if(ns4 !== '') {
    data[1].push({
      'hostname': ns4,
      'ipv4': '',
      'ipv6': ''
    });
  }
  
  return dsInstance.transip.communicate(dsInstance.service, 'setNameservers', [data.domainName, data.nameservers], data);
};

module.exports = domainService;