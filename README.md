# node-transip

*Work in progress! Not safe for work.*


This library creates a new instance of "TransIP" for you, exposing a few libraries and methods you can use to communicate.

To start a new TransIP instance:

```js
var TransIP = require('transip');

var transipInstance = new TransIP(login, privateKey);
```

`login` is your TransIP login username. An example of the `privateKey` can be found in `config/data.example.js`.

## Enable the TransIP API

The TransIP API is disabled by default, you will have to enable it manually in the control panel. You can create a private key and whitelist your servers after.

## Running the integration tests

Unfortunately, it's not possible or safe for me to publish my private keys so you can run my tests directly. You'll have to adapt the tests to your environment. I run these tests by hand, for now.

## DomainService

### transipInstance.domainService.batchCheckAvailability

```js
transipInstance.domainService.batchCheckAvailability(['dualdev.com', 'sillevis.net']).then(function(domains) {
  // Returns array of domain object 
  // { 'name': 'domain.ext', 'status' 'unavailable|free', 'actions': {} }
});
```

### transipInstance.domainService.checkAvailability

```js
transipInstance.domainService.checkAvailability('dualdev.com').then(function(domain) {
  // Returns domain object
  // { 'name': 'domain.ext', 'status': 'unavailable|free', 'actions': {} }
});
```

### transipInstance.domainService.getWhois

```js
transipInstance.domainService.getWhois('dualdev.com').then(function(whois) {
  // Returns whois text (includes line breaks)
});
```

### transipInstance.domainService.getDomainNames

```js
transipInstance.domainService.getDomainNames().then(function(domains) {
  // Returns array of domain names
});
```

### transipInstance.domainService.getInfo

```js
transipInstance.domainService.getInfo('sillevis.net').then(function(info) {
  // Returns domain object
  // { 'nameservers': {}, 'contacts': {}, 'dnsEntries': {}, 'branding': {}, 'name': 'domain.ext', 'isLocked': 'true|false', 'registrationDate': /*unix timestamp*/ }
})
```

### transipInstance.domainService.batchGetInfo

```js
transipInstance.domainService.batchGetInfo(['sillevis.net', 'sierveld.me']).then(function(info) {
  // Returns domain objects
  // [{ 'nameservers': {}, 'contacts': {}, 'dnsEntries': {}, 'branding': {}, 'name': 'domain.ext', 'isLocked': 'true|false', 'registrationDate': /*unix timestamp*/ }]
});

```

### transipInstance.domainService.getAuthCode

```js
transipInstance.domainService.getAuthCode('sillevis.net').then(function(authCode) {
  // Returns authCode
  // 'authCode'
})
```

### transipInstance.domainService.getIsLocked

```js
transipInstance.domainService.getIsLocked('sillevis.net').then(function(isLocked) {
  // Returns lock status for domain
  // boolean
})
```

### transipInstance.domainService.register

```js
transipInstance.domainService.register({
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
  },
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
  // Returns response
  // boolean
})
```

### transipInstance.domainService.cancel

Possible arguments for ending: `end` or `immediately`

```js
transipInstance.domainService.cancel('sillevis.nl', 'end').then(function(response) {
  // Returns response
  // boolean
})
```

### transipInstance.domainService.transferWithOwnerChange

```js
transipInstance.domainService.transferWithOwnerChange({
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
}, '12345abcdef').then(function(response) {
  // Returns response
  // boolean
})
```

### transipInstance.domainService.transferWithoutOwnerChange

```js
transipInstance.domainService.transferWithoutOwnerChange({
  'name': 'sillevis-test3.nl'
}, 'authCode').then(function(response) {
  // Returns reponse
  // boolean
})
```

### transipInstance.domainService.setNameservers

```js
transipInstance.domainService.setNameservers('sillevis.net', {
  'hostname': 'dana.ns.cloudflare.com',
  'ipv4': '',
  'ipv6': ''
}, {
  'hostname': 'tim.ns.cloudflare.com',
  'ipv4': '',
  'ipv6': ''
}).then(function(response) {
  // Returns response
  // boolean
})
```

### transipInstance.domainService.setLock

```js
transipInstance.domainService.setLock('sillevis.net').then(function(response) {
  // Returns response
  // boolean
})
```

### transipInstance.domainService.unsetLock

```js
transipInstance.domainService.unsetLock('sillevis.net').then(function(response) {
  // Returns response
  // boolean
})
```

### transipInstance.domainService.setDnsEntries

Please note that this function will replace **all** DNS entries

```js
transipInstance.domainService.setDnsEntries('sillevis.net', {
  'item': [{
    'name': 'test',
    'expire': 10800,
    'type': 'CNAME',
    'content': 'lb.dualdev.com.' // Don't forget the "." at the end here, when using CNAME for example
  }]
}).then(function(response) {
  // Returns response
  // boolean
})
```

### transipInstance.domainService.setOwner

```js
transipInstance.domainService.setOwner('sillevis.net', {
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
  // Returns response
  // boolean
})
```

### transipInstance.domainService.setContacts

```js
transipInstance.domainService.setContacts('sillevis.net', {
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
  // Returns response
  // boolean
})
```

### transipInstance.domainService.getAllTldInfos

```js
transipInstance.domainService.getAllTldInfos().then(function(response) {
  // Returns array with all TLD objects
  // [ { 'name': '.nl', 'price': '9.99', 'renewalPrice': '29', capabilities:
  //   [ 'canRegister',
  //     'canSetContacts',
  //     'canSetNameservers',
  //     'canSetOwner',
  //     'canTransferWithOwnerChange',
  //     'requiresAuthCode' ]} ],
  //   registrationPeriodLength: '12',
  //   cancelTimeFrame: '1' } ]
})
```

### transipInstance.domainService.getTldInfo

```js
transipInstance.domainService.getTldInfo('nl').then(function(response) {
  // Returns object with this TLDs info
  // { 'name': '.nl', 'price': '9.99', 'renewalPrice': '29', capabilities:
  //   [ 'canRegister',
  //     'canSetContacts',
  //     'canSetNameservers',
  //     'canSetOwner',
  //     'canTransferWithOwnerChange',
  //     'requiresAuthCode' ]} ],
  //   registrationPeriodLength: '12',
  //   cancelTimeFrame: '1' }
})
```

### transipInstance.domainService.getCurrentDomainAction

```js
transipInstance.domainService.getCurrentDomainAction('sillevis.net').then(function(response) {
  // Returns object with current domain action
  // { 'name': 'sillevis.net', 'message': null, 'hasFailed': 'false', 'status': null }
})
```

### transipInstance.domainService.retryCurrentDomainActionWithNewData

```js
transipInstance.domainService.retryCurrentDomainActionWithNewData({
  'name': 'sillevis.net'
}).then(function(response) {
  // Returns response
  // boolean
})
```

### transipInstance.domainService.retryTransferWithDifferentAuthCode

```js
transipInstance.domainService.retryTransferWithDifferentAuthCode({
  'name': 'sillevis-test4.nl'
}, '23456789').then(function(response) {
  // Returns response
  // boolean
})
```

### transipInstance.domainService.cancelDomainAction

```js
transipInstance.domainService.cancelDomainAction({
  'name': 'sierveld.me'
}).then(function(response) {
  // Returns response
  // boolean
})
```
