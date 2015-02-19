var Promise = require( 'bluebird' )
  , sinon = require( 'sinon' ); 

var transip = require( '../transip' );

describe('I:transip', function() {
  'use strict';

  describe( 'updateDNS', function() {
    it( 'should update DNS servers', function(done) {
      this.timeout(30000);
      transip.updateDNS('nandlal.nl', 'ns01.dualdev.com', 'ns02.dualdev.com', 'ns03.dualdev.com').then(function() {
        console.log("Done");
      }).catch(function(err) {
        console.log("err", err);
      }).finally(done, done);
    });
  });
});
