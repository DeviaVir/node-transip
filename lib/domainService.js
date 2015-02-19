var Promise = require('bluebird');

/**
 * DomainService methods
 * @static
 * @class domainService
 */
var domainService = module.exports = {};

(function(domainService) {
	"use strict";

  domainService.service = 'DomainService';

  /**
   * Starts a nameserver change for this domain, will replace all existing nameservers with the new nameservers
   * @param  {String} domain 
   * @param  {String} ns1    full domain
   * @param  {String} ns2    full domain
   * @param  {String} ns3    full domain
   * @param  {String} ns4    full domain - optional.
   * @return {Promise}        
   */
  domainService.setNameservers = function setNameservers(transipInstance, domain, ns1, ns2, ns3, ns4) {
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
    
    return transipInstance.communicate(domainService.service, 'setNameservers', [data.domainName, data.nameservers], data);
  };

})(domainService);

module.exports = domainService;