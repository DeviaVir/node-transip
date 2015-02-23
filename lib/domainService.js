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
  if(typeof domainNames === 'string') {
    return this.checkAvailability(domainNames);
  }
  if(domainNames.length < 1) {
    return Promise.reject(new Error(404));
  }
  if(domainNames.length === 1) {
    return this.checkAvailability(domainNames[0]);
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
 * This helper function is used for parsing getInfo requests
 * @param  {Array} infos 
 * @return {Promise}       
 */
domainService.prototype.infoParser = function infoParser(infos) {
  var _this = this,
      total = [];
  return Promise.resolve(infos).each(function(info) {
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
    }).then(function(data) {
      total.push(data);
    });
  }).then(function() {
    if(total.length === 1) {
      return total[0];
    }
    return total;
  });
};

/**
 * Retrieves information for the given domain
 * @param  {String} domain 
 * @return {Promise}       argument[0] = object of domain info
 */
domainService.prototype.getInfo = function getInfo(domain) {
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
        return _this.infoParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getInfoResponse'][0]['return']);
      }
      else {
        return {};
      }
    });
  });
};

/**
 * Retrieves information for the given domain
 * @param  {Array} domainNames 
 * @return {Promise}       argument[0] = the array
 */
domainService.prototype.batchGetInfo = function batchGetInfo(domainNames) {
  var _this = this;
  
  domainNames = domainNames || [];
  if(typeof domainNames === 'string') {
    return this.getInfo(domainNames);
  }
  if(domainNames.length < 1) {
    return Promise.reject(new Error(404));
  }
  if(domainNames.length === 1) {
    return this.getInfo(domainNames[0]);
  }

  var data = {
    'domainNames': domainNames
  };

  return this.transip.communicate(this.service, 'batchGetInfo', [data.domainNames], data).then(function(body) {
    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:batchGetInfoResponse'][0]['return'][0]['item'] !== void 0) {
        return _this.infoParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:batchGetInfoResponse'][0]['return'][0]['item']);
      }
      else {
        return {};
      }
    });
  });
};

/**
 * Retrieve authCode for the given domain
 * @param  {String} domain 
 * @return {String}        
 */
domainService.prototype.getAuthCode = function getAuthCode(domain) {
  if(domain === void 0 || domain === '') {
    return Promise.reject(new Error(404));
  }

  if(domain.substr(-1) === '.') {
    domain = domain.slice(0, -1);
  }

  var data = {
    'domainName': domain
  };

  return this.transip.communicate(this.service, 'getAuthCode', [data.domainName], data).then(function(body) {
    return body[0]['return']['$value'];
  });
};

/**
 * Retrieve isLocked for the given domain
 * @param  {String} domain 
 * @return {String}        
 */
domainService.prototype.getIsLocked = function getIsLocked(domain) {
  if(domain === void 0 || domain === '') {
    return Promise.reject(new Error(404));
  }

  if(domain.substr(-1) === '.') {
    domain = domain.slice(0, -1);
  }

  var data = {
    'domainName': domain
  };

  return this.transip.communicate(this.service, 'getIsLocked', [data.domainName], data).then(function(body) {
    return body[0]['return']['$value'];
  });
};

/**
 * Helper to parse domain objects
 * @param  {Object} domain 
 * @return {Object}        
 */
domainService.prototype.domainParser = function domainParser(domain) {
  if(domain.name.substr(-1) === '.') {
    domain.name = domain.name.slice(0, -1);
  }

  return {
    'name': domain.name,
    'nameservers': (domain.nameservers ? domain.nameservers : []),
    'contacts': (domain.contacts ? domain.contacts : []),
    'dnsEntries': (domain.dnsEntries ? domain.dnsEntries : []),
    'branding': (domain.branding ? domain.branding : null),
    'authCode': '',
    'isLocked': false,
    'registrationDate': '',
    'renewalDate': ''
  };
};

/**
 * Register a domainName
 * @param  {Object} domain {'name': '', 'nameservers': '', 'contacts': '', 'dnsEntries': ''}
 * @return {Promise}        
 */
domainService.prototype.register = function register(domain) {
  if(domain === void 0 || domain === '' || Object.keys(domain) < 1) {
    return Promise.reject(new Error(404));
  }

  var data = {
    'domain': this.domainParser(domain)
  };

  return this.transip.communicate(this.service, 'register', [data.domain], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:registerResponse'] !== void 0) {
        return true;
      }
    });
  });
};

/**
 * Cancels a domain name, will automatically create and sign a cancellation document
 * Please note that domains with webhosting cannot be cancelled through the API
 * 
 * @param  {String} domain  
 * @param  {String} endTime 
 * @return {Promise}         
 */
domainService.prototype.cancel = function cancel(domain, endTime) {
  if(domain === void 0 || domain === '') {
    return Promise.reject(new Error(404));
  }

  if(domain.substr(-1) === '.') {
    domain = domain.slice(0, -1);
  }

  if(endTime === void 0 || (endTime !== 'end' && endTime !== 'immediately')) {
    endTime = 'end';
  }

  var data = {
    'domainName': domain,
    'endTime': endTime
  };

  return this.transip.communicate(this.service, 'cancel', [data.domainName, data.endTime], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:cancelResponse'] !== void 0) {
        return true;
      }
    });
  });
};

/**
 * Transfers a domain with changing the owner, not all TLDs support this (e.g. nl)
 * @param  {Object} domain   Same object as "register"
 * @param  {String} authCode 
 * @return {Promise}          
 */
domainService.prototype.transferWithOwnerChange = function transferWithOwnerChange(domain, authCode) {
  if(domain === void 0 || domain === '') {
    return Promise.reject(new Error(404));
  }

  if(authCode === void 0 || authCode === '') {
    return Promise.reject(new Error(403));
  }

  var data = {
    'domain': this.domainParser(domain),
    'authCode': authCode
  };

  return this.transip.communicate(this.service, 'transferWithOwnerChange', [data.domain, data.authCode], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:transferWithOwnerChangeResponse'] !== void 0) {
        return true;
      }
    });
  });
};

/**
 * Transfers a domain without changing the owner
 * @param  {Object} domain   Same object as "register"
 * @param  {String} authCode 
 * @return {Promise}          
 */
domainService.prototype.transferWithoutOwnerChange = function transferWithoutOwnerChange(domain, authCode) {
  if(domain === void 0 || domain === '') {
    return Promise.reject(new Error(404));
  }

  if(authCode === void 0 || authCode === '') {
    return Promise.reject(new Error(403));
  }

  var data = {
    'domain': this.domainParser(domain),
    'authCode': authCode
  };

  return this.transip.communicate(this.service, 'transferWithoutOwnerChange', [data.domain, data.authCode], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:transferWithOwnerChangeResponse'] !== void 0) {
        return true;
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

  if(ns1 === void 0 || Object.keys(ns1).length === 0 || !ns1.hostname) {
    return Promise.reject(new Error(405));
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
  
  return this.transip.communicate(this.service, 'setNameservers', [data.domainName, data.nameservers], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:setNameserversResponse'] !== void 0) {
        return true;
      }
    });
  });
};

/**
 * Lock this domain in real time
 * @param {String} domainName
 * @return {Promise}
 */
domainService.prototype.setLock = function setLock(domainName) {
  if(domainName === void 0 || domainName === '') {
    return Promise.reject(new Error(404));
  }

  if(domainName.substr(-1) === '.') {
    domainName = domainName.slice(0, -1);
  }

  var data = {
    'domainName': domainName
  };

  return this.transip.communicate(this.service, 'setLock', [data.domainName], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:setLockResponse'] !== void 0) {
        return true;
      }
    });
  });
};

/**
 * Unlocks this domain in real time
 * @param {String} domainName
 * @return {Promise}
 */
domainService.prototype.unsetLock = function unsetLock(domainName) {
  if(domainName === void 0 || domainName === '') {
    return Promise.reject(new Error(404));
  }

  if(domainName.substr(-1) === '.') {
    domainName = domainName.slice(0, -1);
  }

  var data = {
    'domainName': domainName
  };

  return this.transip.communicate(this.service, 'unsetLock', [data.domainName], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:unsetLockResponse'] !== void 0) {
        return true;
      }
    });
  });
};

/**
 * Sets the DnEntries for this Domain, will replace all existing dns entries with the new entries
 * @param {String} domainName 
 * @param {Object} dnsEntries 
 * @return {Promise} 
 */
domainService.prototype.setDnsEntries = function(domainName, dnsEntries) {
  if(domainName === void 0 || domainName === '') {
    return Promise.reject(new Error(404));
  }

  if(domainName.substr(-1) === '.') {
    domainName = domainName.slice(0, -1);
  }

  if(dnsEntries === void 0) {
    return Promise.reject(new Error(405));
  }

  var data = {
    'domainName': domainName,
    'dnsEntries': dnsEntries
  };

  return this.transip.communicate(this.service, 'setDnsEntries', [data.domainName, data.dnsEntries], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:setDnsEntriesResponse'] !== void 0) {
        return true;
      }
    });
  });
};

/**
 * Starts an owner change of a Domain, brings additional costs with the following TLDs:
 * .nl
 * .be
 * .eu
 * 
 * @param  {String} domainName   Same object as "register"
 * @param  {Object} registrantWhoisContact 
 * @return {Promise}          
 */
domainService.prototype.setOwner = function setOwner(domainName, registrantWhoisContact) {
  if(domainName === void 0 || domainName === '') {
    return Promise.reject(new Error(404));
  }

  if(domainName.substr(-1) === '.') {
    domainName = domainName.slice(0, -1);
  }

  if(registrantWhoisContact === void 0) {
    return Promise.reject(new Error(405));
  }

  var data = {
    'domainName': domainName,
    'registrantWhoisContact': registrantWhoisContact
  };

  return this.transip.communicate(this.service, 'setOwner', [data.domainName, data.registrantWhoisContact], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:setOwnerResponse'] !== void 0) {
        return true;
      }
    });
  });
};

/**
 * Starts a contact change of a domain, this will replace all existing contacts
 * @param  {String} domainName
 * @param  {Object} contacts    
 * @return {Promise}        
 */
domainService.prototype.setContacts = function setContacts(domainName, contacts) {  
  if(domainName === void 0 || domainName === '') {
    return Promise.reject(new Error(404));
  }

  if(contacts === void 0 || Object.keys(contacts).length === 0) {
    return Promise.reject(new Error(405));
  }

  /** Check if domainName doesn't accidentally have a trailing dot */
  if(domainName.substr(-1) === '.') {
    domainName = domainName.slice(0, -1);
  }

  var data = {
    'domainName': domainName, 
    'contacts': contacts
  };
  
  return this.transip.communicate(this.service, 'setContacts', [data.domainName, data.contacts], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:setContactsResponse'] !== void 0) {
        return true;
      }
    });
  });
};

/**
 * Parses output for tld Info
 * @param  {Array} arr 
 * @return {Array}     
 */
domainService.prototype.tldInfoParser = function tldInfoParser(arr) {
  return arr.map(function(item) {
    return {
      'name': item.name[0]['_'],
      'price': item.price[0]['_'],
      'renewalPrice': item.renewalPrice[0]['_'],
      'capabilities': item.capabilities[0].item.map(function(cap) {
        if('_' in cap) {
          return cap['_'];
        }
        else {
          return cap;
        }
      }),
      'registrationPeriodLength': item.registrationPeriodLength[0]['_'],
      'cancelTimeFrame': item.cancelTimeFrame[0]['_']
    };
  });
};

/**
 * Get TransIP supported TLDs
 * @return {Array}
 */
domainService.prototype.getAllTldInfos = function getAllTldInfos() {
  var _this = this;

  return this.transip.communicate(this.service, 'getAllTldInfos').then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getAllTldInfosResponse'] !== void 0) {
        return _this.tldInfoParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getAllTldInfosResponse'][0]['return'][0].item);
      }
    });
  });
};

/**
 * Get info about a specific TLD
 * @param  {String} tldName 
 * @return {Object}         
 */
domainService.prototype.getTldInfo = function getTldInfo(tldName) {
  var _this = this;

  if(tldName === void 0 || tldName === '') {
    return Promise.reject(new Error(404));
  }

  /** Check if tldName doesn't accidentally have a trailing dot */
  if(tldName.substr(-1) === '.') {
    tldName = tldName.slice(0, -1);
  }
  if(tldName.substr(1) !== '.') {
    tldName = '.' + tldName;
  }

  var data = {
    'tldName': tldName
  };

  return this.transip.communicate(this.service, 'getTldInfo', [data.tldName], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getTldInfoResponse'] !== void 0) {
        return _this.tldInfoParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getTldInfoResponse'][0]['return'])[0];
      }
    });
  });
};

/**
 * Gets info about the action this domain is currently running
 * @param  {String} domainName
 * @return {Promise}        
 */
domainService.prototype.getCurrentDomainAction = function getCurrentDomainAction(domainName) {  
  if(domainName === void 0 || domainName === '') {
    return Promise.reject(new Error(404));
  }

  /** Check if domainName doesn't accidentally have a trailing dot */
  if(domainName.substr(-1) === '.') {
    domainName = domainName.slice(0, -1);
  }

  var data = {
    'domainName': domainName
  };
  
  return this.transip.communicate(this.service, 'getCurrentDomainAction', [data.domainName], data).then(function(body) {
    if(body.length === void 0) {
      return Promise.reject(body);
    }

    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getCurrentDomainActionResponse'] !== void 0) {
        var action = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getCurrentDomainActionResponse'][0]['return'][0];
        return {
          'name': ('_' in action.name[0] ? action.name[0]['_'] : null),
          'hasFailed': ('_' in action.hasFailed[0] ? action.hasFailed[0]['_'] : null),
          'message': ('_' in action.message[0] ? action.message[0]['_'] : null)
        };
      }
    });
  });
};

module.exports = domainService;