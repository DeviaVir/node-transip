var Promise = require( 'bluebird' )
  , sinon = require( 'sinon' ); 

var TransIP = require( '../transip' );

describe('I:transip', function() {
  'use strict';

  describe( 'updateDNS', function() {
    var transipInstance
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should update DNS servers', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setNameservers(transipInstance, 'nandlal.nl', 'ns01.dualdev.com', 'ns02.dualdev.com', 'ns03.dualdev.com').then(function(body) {
        var parseString = require('xml2js').parseString;
        parseString(body[1], function (err, result) {
          expect(result['SOAP-ENV:Envelope']['SOAP-ENV:Body']).to.be.ok();
        });
      }).then(done, done);
    });
  });
});
