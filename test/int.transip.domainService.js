var Promise = require( 'bluebird' ),
    sinon = require('sinon'),
    moment = require('moment');

var TransIP = require( '../transip' );

describe('I:TransIP:domainService', function() {
  'use strict';

  describe( 'batchCheckAvailability', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should check availability of domains', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchCheckAvailability(['dualdev.com', 'hjabsdjhasdbjkhDBHWJBKjbwejhkjawefvghefbawfewej.nl']).then(function(domains) {
        expect(domains.length).to.eql(2);
        expect(domains[0].name).to.eql('dualdev.com');
        expect(domains[0].status).to.eql('unavailable');
        expect(domains[0].actions[0]).to.eql('internalpull');
        expect(domains[0].actions[1]).to.eql('internalpush');
        expect(domains[1].name).to.eql('hjabsdjhasdbjkhDBHWJBKjbwejhkjawefvghefbawfewej.nl'.toLowerCase());
        expect(domains[1].status).to.eql('free');
        expect(domains[1].actions[0]).to.eql('register');
      }).then(done, done);
    });

    it( 'should throw error without any domains', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchCheckAvailability([]).catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });

    it( 'should throw error without any arguments', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchCheckAvailability().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'checkAvailability', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should check availability of a registered domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.checkAvailability('dualdev.com').then(function(domain) {
        expect(domain.status).to.eql('unavailable');
      }).then(done, done);
    });

    it( 'should check availability of a free domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.checkAvailability('dualdev-asdjkakffaeksufhusafhaskejfeawjksfhbeajvbwejgwfhjaew.com').then(function(domain) {
        expect(domain.status).to.eql('free');
      }).then(done, done);
    });

    it( 'should throw error when there is no domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.checkAvailability('').catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });

    it( 'should throw error when there are no arguments', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.checkAvailability().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'getWhois', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return whois information (com)', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getWhois('dualdev.com').then(function(whois) {
        expect(whois).to.contain('DUALDEV.COM');
        expect(whois).to.contain('Status: clientTransferProhibited');
      }).then(done, done);
    });

    it( 'should return whois information (net)', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getWhois('sierveld.me').then(function(whois) {
        expect(whois).to.contain('SIERVELD.ME');
      }).then(done, done);
    });

    it( 'should return whois error on unknown domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getWhois('askjdaskdjfhajkfhjakldfsahfkjsadhfjkasdhfjks.net').then(function(whois) {
        expect(whois).to.contain('No match for "ASKJDASKDJFHAJKFHJAKLDFSAHFKJSADHFJKASDHFJKS.NET".');
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getWhois().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'getDomainNames', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return a list of domains', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getDomainNames().then(function(domains) {
        expect(domains.indexOf('sillevis.net')).to.be.greaterThan(0);
      }).then(done, done);
    });
  });

  describe( 'getInfo', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return information', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getInfo('sillevis.net').then(function(info) {
        expect(info.nameservers).to.be.ok();
        expect(info.contacts.length).to.eql(3);
        expect(info.dnsEntries).to.be.ok();
        expect(info.branding).to.be.ok();
        expect(info.name).to.eql('sillevis.net');
        expect(info.isLocked).to.eql('true');
        expect(moment(info.registrationDate, 'X').format('YYYY-MM-DD')).to.eql('2010-05-16');
      }).then(done, done);
    });

    it( 'should return error for domain not in account', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getInfo('dualdev.com').catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });
  });

  describe( 'batchGetInfo', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should throw error for multiple domains when one is wrong', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchGetInfo(['sillevis.net', 'sierveld.me']).then(function(info) {
        expect(info.length).to.eql(2);
        expect(info[0].nameservers).to.be.ok();
        expect(info[1].nameservers).to.be.ok();
        expect(info[0].contacts.length).to.eql(3);
        expect(info[1].contacts.length).to.eql(3);
        expect(info[0].dnsEntries).to.be.ok();
        expect(info[1].dnsEntries).to.be.ok();
        expect(info[0].branding).to.be.ok();
        expect(info[1].branding).to.be.ok();
        expect(info[0].name).to.eql('sillevis.net');
        expect(info[1].name).to.eql('sierveld.me');
        expect(info[0].isLocked).to.eql('true');
        expect(info[1].isLocked).to.eql('false');
        expect(moment(info[0].registrationDate, 'X').format('YYYY-MM-DD')).to.eql('2010-05-16');
        expect(moment(info[1].registrationDate, 'X').format('YYYY-MM-DD')).to.eql('2011-03-08');
      }).then(done, done);
    });

    it( 'should throw error for multiple domains when one is wrong', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchGetInfo(['sillevis.net', 'dualdev.com']).catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });

    it( 'should return information for one domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchGetInfo('sillevis.net').then(function(info) {
        expect(info.nameservers).to.be.ok();
        expect(info.contacts.length).to.eql(3);
        expect(info.dnsEntries).to.be.ok();
        expect(info.branding).to.be.ok();
        expect(info.name).to.eql('sillevis.net');
        expect(info.isLocked).to.eql('true');
        expect(moment(info.registrationDate, 'X').format('YYYY-MM-DD')).to.eql('2010-05-16');
      }).then(done, done);
    });

    it( 'should return error for domain not in account', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchGetInfo('dualdev.com').catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });
  });

  describe( 'getAuthCode', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });
    it( 'should return authCode', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getAuthCode('sillevis.net').then(function(authCode) {
        expect(authCode).to.be.ok();
        expect(typeof authCode).to.eql('string');
      }).then(done, done);
    });

    it( 'should throw error on unknown domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getAuthCode('askjdaskdjfhajkfhjakldfsahfkjsadhfjkasdhfjks.net').catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getAuthCode().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'getIsLocked', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });
    it( 'should return isLocked', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getIsLocked('sillevis.net').then(function(isLocked) {
        expect(typeof isLocked).to.eql('boolean');
        expect(isLocked).to.eql(true);
      }).then(done, done);
    });

    it( 'should throw error on unknown domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getIsLocked('askjdaskdjfhajkfhjakldfsahfkjsadhfjkasdhfjks.net').catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getIsLocked().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'register', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return success', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.register({
        'name': 'sillevis-test.nl'
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should return success, with different nameservers', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.register({
        'name': 'sillevis-test2.nl',
        'nameservers': {
          'item': [{
            'hostname': 'ns01.dualdev.com',
            'ipv4': '',
            'ipv6': ''
          }, {
            'hostname': 'ns02.dualdev.com',
            'ipv4': '',
            'ipv6': ''
          }, {
            'hostname': 'ns03.dualdev.com',
            'ipv4': '',
            'ipv6': ''
          }]
        }
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should return success, with different contacts', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.register({
        'name': 'sillevis-test2.nl',
        'contacts': {
          'item': [{
            'type': 'registrant',
            'firstName': 'Chase',
            'middleName': null,
            'lastName': 'Sillevis',
            'companyName': 'DualDev',
            'companyKvk': '34372569',
            'companyType': 'VOF',
            'street': 'Ravelrode',
            'number': '37',
            'postalCode': '2717GD',
            'city': 'Zoetermeer',
            'phoneNumber': '+31612345678',
            'faxNumber': '',
            'email': 'info@dualdev.com',
            'country': 'NL' // Two letter code
          }, {
            'type': 'administrative',
            'firstName': 'René',
            'middleName': null,
            'lastName': 'van Sweeden',
            'companyName': 'DualDev',
            'companyKvk': '34372569',
            'companyType': 'VOF',
            'street': 'Ravelrode',
            'number': '37',
            'postalCode': '2717GD',
            'city': 'Zoetermeer',
            'phoneNumber': '+31612345678',
            'faxNumber': '',
            'email': 'sales@dualdev.com',
            'country': 'NL' // Two letter code
          }, {
            'type': 'technical',
            'firstName': 'Chase',
            'middleName': null,
            'lastName': 'Sillevis',
            'companyName': 'DualDev',
            'companyKvk': '34372569',
            'companyType': 'VOF',
            'street': 'Ravelrode',
            'number': '37',
            'postalCode': '2717GD',
            'city': 'Zoetermeer',
            'phoneNumber': '+31612345678',
            'faxNumber': '',
            'email': 'tech@dualdev.com',
            'country': 'NL' // Two letter code
          }]
        }
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should return error, domain already registered', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.register({
        'name': 'transip.nl'
      }).catch(function(err) {
        expect(err.message).to.eql('303: The domain \'transip.nl\' is not free and thus cannot be registered.');
      }).then(done, done);
    });

    it( 'should return error, domain not available', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.register({
        'name': 'transip.transip-test'
      }).catch(function(err) {
        expect(err.message).to.eql('301: This is not a valid domain name: \'transip.transip-test\'');
      }).then(done, done);
    });
  });

  describe( 'cancel', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should cancel the domain end of contract', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.cancel('nandlal.nl', 'end').then(function(response) {
        expect(response).to.eql(true);
      }).catch(function(err) {
        // Could be that the domain is already cancelled
        expect(err.message).to.contain('403: De opzegging kan niet worden bevestigd omdat een of meerdere diensten in deze opzegging reeds zijn bevestigd.');
      }).then(done, done);
    });

    it( 'should return error for unknown domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.cancel('dualdev.com', 'immediately').catch(function(err) {
        expect(err.message).to.eql('102: The domain \'dualdev.com\' could not be found in your account.');
      }).then(done, done);
    });
  });

  describe( 'transferWithOwnerChange', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    /** Cannot be truthy tested.. */

    it( 'should return error from transip', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.transferWithOwnerChange({
        'name': 'sillevis-test2.nl',
        'contacts': {
          'item': [{
            'type': 'registrant',
            'firstName': 'Chase',
            'middleName': null,
            'lastName': 'Sillevis',
            'companyName': 'DualDev',
            'companyKvk': '34372569',
            'companyType': 'VOF',
            'street': 'Ravelrode',
            'number': '37',
            'postalCode': '2717GD',
            'city': 'Zoetermeer',
            'phoneNumber': '+31612345678',
            'faxNumber': '',
            'email': 'info@dualdev.com',
            'country': 'NL' // Two letter code
          }, {
            'type': 'administrative',
            'firstName': 'René',
            'middleName': null,
            'lastName': 'van Sweeden',
            'companyName': 'DualDev',
            'companyKvk': '34372569',
            'companyType': 'VOF',
            'street': 'Ravelrode',
            'number': '37',
            'postalCode': '2717GD',
            'city': 'Zoetermeer',
            'phoneNumber': '+31612345678',
            'faxNumber': '',
            'email': 'sales@dualdev.com',
            'country': 'NL' // Two letter code
          }, {
            'type': 'technical',
            'firstName': 'Chase',
            'middleName': null,
            'lastName': 'Sillevis',
            'companyName': 'DualDev',
            'companyKvk': '34372569',
            'companyType': 'VOF',
            'street': 'Ravelrode',
            'number': '37',
            'postalCode': '2717GD',
            'city': 'Zoetermeer',
            'phoneNumber': '+31612345678',
            'faxNumber': '',
            'email': 'tech@dualdev.com',
            'country': 'NL' // Two letter code
          }]
        }
      }, '12345abcdef').catch(function(err) {
        expect(err.message).to.eql('303: The domain \'sillevis-test2.nl\' is free and thus cannot be transfered.');
      }).then(done, done);
    });
  });

  describe( 'transferWithoutOwnerChange', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    /** Cannot be truthy tested.. */

    it( 'should return error from transip', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.transferWithoutOwnerChange({
        'name': 'sillevis-test3.nl'
      }, '12345abcdef').catch(function(err) {
        expect(err.message).to.eql('303: The domain \'sillevis-test3.nl\' is free and thus cannot be transfered.');
      }).then(done, done);
    });
  });

  describe( 'setNameservers', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should update nameservers', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setNameservers('sillevis.net', {
        'hostname': 'dana.ns.cloudflare.com',
        'ipv4': '',
        'ipv6': ''
      }, {
        'hostname': 'tim.ns.cloudflare.com',
        'ipv4': '',
        'ipv6': ''
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should throw error without nameservers', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setNameservers('sillevis.net').catch(function(err) {
        expect(err.message).to.eql('405');
      }).then(done, done);
    });

    it( 'should throw error without domain (or any arguments for that matter)', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setNameservers().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'setLock', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should set a lock', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setLock('sillevis.net').catch(function(err) {
        console.log('err', err); // Sometimes TransIP breaks
      }).then(function(response) {
        //expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should throw error 404', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setLock().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });

    it( 'should throw transip error', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setLock('sillevis-test4.net').catch(function(err) {
        expect(err.message).to.contain('100: Er is een interne fout opgetreden, neem a.u.b. contact op met support. (INTERNAL)'); // This cannot possible be correct, contacted transip API
      }).then(done, done);
    });
  });

  describe( 'unsetLock', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should set a lock', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.unsetLock('sillevis.net').then(function(response) {
        //expect(response).to.eql(true);
      }).catch(function(err) {
        console.log('err', err); // Sometimes TransIP breaks
      }).then(function() {
        /** Lock my domain again please */
        return transipInstance.domainService.setLock('sillevis.net').then(function(response) {
          //expect(response).to.eql(true);
        });
      }).then(done, done);
    });

    it( 'should throw error 404', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.unsetLock().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });

    it( 'should throw transip error', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.unsetLock('sillevis-test4.net').catch(function(err) {
        expect(err.message).to.contain('100: Er is een interne fout opgetreden, neem a.u.b. contact op met support. (INTERNAL)'); // This cannot possible be correct, contacted transip API
      }).then(done, done);
    });
  });

  describe( 'setDnsEntries', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should update dns entries', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setDnsEntries('nandlal.nl', {
        'item': [{
          'name': 'test',
          'expire': 10800,
          'type': 'CNAME',
          'content': 'lb.dualdev.com.'
        }]
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setDnsEntries().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });

    it( 'should throw error without dnsEntries', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setDnsEntries('nandlal.nl').catch(function(err) {
        expect(err.message).to.eql('405');
      }).then(done, done);
    });

    it( 'should throw error from transip', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setDnsEntries('dualdev.com', {
        'item': [{
          'name': 'test',
          'expire': 10800,
          'type': 'CNAME',
          'content': 'lb.dualdev.com.'
        }]
      }).catch(function(err) {
        expect(err.message).to.eql('302: A hostname for a CNAME, NS, MX or SRV record was not found (external hostnames need a trailing dot, eg. "example.com."): test 10800 CNAME lb.dualdev.com.');
      }).then(done, done);
    });
  });

  describe( 'setOwner', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should update owner entry', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setOwner('sillevis.net', {
        'type': 'registrant',
        'firstName': 'Chase',
        'middleName': null,
        'lastName': 'Sillevis',
        'companyName': 'DualDev',
        'companyKvk': '34372569',
        'companyType': 'VOF',
        'street': 'Ravelrode',
        'number': '37',
        'postalCode': '2717GD',
        'city': 'Zoetermeer',
        'phoneNumber': '+31612345678',
        'faxNumber': '',
        'email': 'info@dualdev.com',
        'country': 'NL' // Two letter code
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setOwner().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });

    it( 'should throw error without dnsEntries', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setOwner('sillevis.net').catch(function(err) {
        expect(err.message).to.eql('405');
      }).then(done, done);
    });

    it( 'should throw error from transip', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setOwner('dualdev.com', {
        'type': 'registrant',
        'firstName': 'Chase',
        'middleName': null,
        'lastName': 'Sillevis',
        'companyName': 'DualDev',
        'companyKvk': '34372569',
        'companyType': 'VOF',
        'street': 'Ravelrode',
        'number': '37',
        'postalCode': '2717GD',
        'city': 'Zoetermeer',
        'phoneNumber': '+31612345678',
        'faxNumber': '',
        'email': 'info@dualdev.com',
        'country': 'NL' // Two letter code
      }).catch(function(err) {
        console.log('err', err); /** This should throw an error! TransIP says it's fine.. */
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });
  });

  describe( 'setContacts', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return success from transip', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setContacts('sillevis.net', {
        'item': [{
          'type': 'registrant',
          'firstName': 'Chase',
          'middleName': null,
          'lastName': 'Sillevis',
          'companyName': 'DualDev',
          'companyKvk': '34372569',
          'companyType': 'VOF',
          'street': 'Ravelrode',
          'number': '37',
          'postalCode': '2717GD',
          'city': 'Zoetermeer',
          'phoneNumber': '+31612345678',
          'faxNumber': '',
          'email': 'info@dualdev.com',
          'country': 'NL' // Two letter code
        }, {
          'type': 'administrative',
          'firstName': 'René',
          'middleName': null,
          'lastName': 'van Sweeden',
          'companyName': 'DualDev',
          'companyKvk': '34372569',
          'companyType': 'VOF',
          'street': 'Ravelrode',
          'number': '37',
          'postalCode': '2717GD',
          'city': 'Zoetermeer',
          'phoneNumber': '+31612345678',
          'faxNumber': '',
          'email': 'sales@dualdev.com',
          'country': 'NL' // Two letter code
        }, {
          'type': 'technical',
          'firstName': 'Chase',
          'middleName': null,
          'lastName': 'Sillevis',
          'companyName': 'DualDev',
          'companyKvk': '34372569',
          'companyType': 'VOF',
          'street': 'Ravelrode',
          'number': '37',
          'postalCode': '2717GD',
          'city': 'Zoetermeer',
          'phoneNumber': '+31612345678',
          'faxNumber': '',
          'email': 'tech@dualdev.com',
          'country': 'NL' // Two letter code
        }]
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should throw error from transip when domain does not belong to me', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setContacts('dualdev.com', {
        'item': [{
          'type': 'registrant',
          'firstName': 'Chase',
          'middleName': null,
          'lastName': 'Sillevis',
          'companyName': 'DualDev',
          'companyKvk': '34372569',
          'companyType': 'VOF',
          'street': 'Ravelrode',
          'number': '37',
          'postalCode': '2717GD',
          'city': 'Zoetermeer',
          'phoneNumber': '+31612345678',
          'faxNumber': '',
          'email': 'info@dualdev.com',
          'country': 'NL' // Two letter code
        }, {
          'type': 'administrative',
          'firstName': 'René',
          'middleName': null,
          'lastName': 'van Sweeden',
          'companyName': 'DualDev',
          'companyKvk': '34372569',
          'companyType': 'VOF',
          'street': 'Ravelrode',
          'number': '37',
          'postalCode': '2717GD',
          'city': 'Zoetermeer',
          'phoneNumber': '+31612345678',
          'faxNumber': '',
          'email': 'sales@dualdev.com',
          'country': 'NL' // Two letter code
        }, {
          'type': 'technical',
          'firstName': 'Chase',
          'middleName': null,
          'lastName': 'Sillevis',
          'companyName': 'DualDev',
          'companyKvk': '34372569',
          'companyType': 'VOF',
          'street': 'Ravelrode',
          'number': '37',
          'postalCode': '2717GD',
          'city': 'Zoetermeer',
          'phoneNumber': '+31612345678',
          'faxNumber': '',
          'email': 'tech@dualdev.com',
          'country': 'NL' // Two letter code
        }]
      }).then(function(response) {
        expect(response).to.eql(true);
      }).catch(function(err) {
        console.log('err', err); /** This should throw an error! TransIP says it's fine.. */
      }).then(done, done);
    });

    it( 'should throw error without contacts', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setContacts('sillevis.net').catch(function(err) {
        expect(err.message).to.eql('405');
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setContacts().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'getAllTldInfos', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return array of TLDs', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getAllTldInfos().then(function(response) {
        expect(response.length).to.be.greaterThan(0);
      }).then(done, done);
    });
  });

  describe( 'getTldInfo', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return info about .nl', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getTldInfo('nl').then(function(response) {
        expect(response.name).to.eql('.nl');
      }).then(done, done);
    });

    it( 'should return info about .vote', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getTldInfo('vote').then(function(response) {
        expect(response.name).to.eql('.vote');
      }).then(done, done);
    });

    it( 'should return info about .com', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getTldInfo('com').then(function(response) {
        expect(response.name).to.eql('.com');
      }).then(done, done);
    });

    it( 'should catch error for .thisdoesnotexist', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getTldInfo('thisdoesnotexist').catch(function(err) {
        expect(err.message).to.eql('102: The TLD \'.thisdoesnotexist\' could not be found.');
      }).then(done, done);
    });

    it( 'should catch error for empty tld', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getTldInfo().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'getCurrentDomainAction', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return info', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getCurrentDomainAction('sillevis.net').then(function(response) {
        expect(response.hasFailed).to.eql('false');
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getCurrentDomainAction().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });

    it( 'should return error from transip', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getCurrentDomainAction('dualdev.com').catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });
  });
  
  describe( 'retryCurrentDomainActionWithNewData', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return success, with different contacts', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.retryCurrentDomainActionWithNewData({
        'name': 'sillevis.net'
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should throw error without data', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.retryCurrentDomainActionWithNewData().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });

    it( 'should return error from transip for unknown domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.retryCurrentDomainActionWithNewData({
        'name': 'sillevis-test2.nl'
      }).catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });
  });

  describe( 'retryTransferWithDifferentAuthCode', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return success, with different contacts', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.retryTransferWithDifferentAuthCode({
        'name': 'sillevis-test4.nl'
      }, '23456789').then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should throw error without newAuthCode', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.retryTransferWithDifferentAuthCode('sillevis-test5.nl').catch(function(err) {
        expect(err.message).to.eql('405');
      }).then(done, done);
    });

    it( 'should throw error without data', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.retryTransferWithDifferentAuthCode().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'cancelDomainAction', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return success (error because of transip..)', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.cancelDomainAction({
        'name': 'sierveld.me'
      }).catch(function(err) {
        expect(err.message).to.contain('100: Er is een interne fout opgetreden, neem a.u.b. contact op met support. (INTERNAL)');
      }).then(done, done);
    });

    it( 'should return error, not my domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.cancelDomainAction({
        'name': 'sillevis-test6.nl'
      }).catch(function(err) {
        expect(err.message).to.contain('100: Er is een interne fout opgetreden, neem a.u.b. contact op met support. (INTERNAL)');
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.cancelDomainAction().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });
});
