let db;
let proceduresDb;
let optionsDb;

rufus.service('sharedData', function sharedData($rootScope, $http, $templateCache, $location, clientTabNames) {
  const _this = this;


  this.postFile = (blob, bucket, key, callback) => {
    const xhr = new XMLHttpRequest();
    const body = {
      key,
      bucket,
      contentType: blob.type,
      size: blob.size,
    };
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const xhr2 = new XMLHttpRequest();
          xhr2.onreadystatechange = () => {
            if (xhr2.readyState === XMLHttpRequest.DONE) {
              callback(xhr2);
            }
          };
          const fd = new FormData();
          fd.append('key', key);
          fd.append('acl', 'public-read');
          fd.append('Content-Type', blob.type);
          fd.append('Cache-Control', 'public, max-age=315360000');
          fd.append('GoogleAccessId', 'signurl@bitnami-d0a8ezzb-g.iam.gserviceaccount.com');
          fd.append('policy', response.policy);
          fd.append('signature', response.signature);
          fd.append('file', blob);
          xhr2.open('POST', `https://storage.googleapis.com/${bucket}/`);
          xhr2.send(fd);
        } else {
          callback(xhr);
        }
      }
    };
    xhr.open('POST', 'https://us-central1-bitnami-d0a8ezzb-g.cloudfunctions.net/signurl');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(body));
  };

  this.syncAndCreateDb = (dbPath) => {
    PouchDB.sync(dbPath, server + dbPath).on('complete', () => {
      _this.syncs.push(PouchDB.sync(dbPath, server + dbPath, {
        live: true,
        retry: true,
      }));
      if (_this.syncs.length === 2) { // while items is not being used
        // if(_this.syncs.length === 3) {
        // we have completed all three initial syncs
        db.compact();
        proceduresDb.compact();
        optionsDb.compact();
        // itemsDb.compact();

        const promises = [];
        promises.push(proceduresDb.allDocs({ include_docs: true }));
        promises.push(optionsDb.allDocs({
          startkey: 'v-',
          endkey: 'v-\uffff',
        }));
        promises.push(optionsDb.allDocs({
          include_docs: true,
          startkey: 's-',
          endkey: 's-\uffff',
        }));
        promises.push(optionsDb.allDocs({
          startkey: 'c-',
          endkey: 'c-\uffff',
        }));
        // promises.push(itemsDb.allDocs({include_docs: true}));
        Promise.all(promises).then((results) => {
          _this.procedures = [];
          _this.items = [];
          _this.species = {};
          _this.breeds = {};
          _this.categories = [];
          _this.vetIds = [];
          let i;
          for (i = 0; i < results[0].rows.length; i += 1) {
            _this.procedures.push(results[0].rows[i].doc);
          }
          for (i = 0; i < results[1].rows.length; i += 1) {
            _this.vetIds.push(results[1].rows[i].id);
          }
          for (i = 0; i < results[2].rows.length; i += 1) {
            const { doc } = results[2].rows[i];
            _this.species[doc._id.substring(2)] = doc;
            _this.breeds[doc._id.substring(2)] = [];
            for (let j = 0; j < doc.breeds.length; j += 1) {
              _this.breeds[doc._id.substring(2)].push({ name: doc.breeds[j] });
            }
          }
          for (i = 0; i < results[3].rows.length; i += 1) {
            _this.categories.push(results[3].rows[i].id.substring(2));
          }
          /* for(i=0; i<results[n].rows.length; i++) {
            _this.items.push(results[n].rows[i].doc);
          } */
          $rootScope.$apply();
        });
      }
    }).on('error', (err) => {
      console.error(err);
    });
    return new PouchDB(dbPath);
  };

  this.setUser = (user) => {
    if (user && user.name) {
      if (user.roles.indexOf('vet') > -1) {
        _this.isVet = true;
        _this.isClient = false;
      } else if (user.roles.indexOf('client') > -1) {
        _this.isClient = true;
        _this.isVet = false;
      }
      [_this.role] = user.roles;
      _this.username = user.name;
      $location.path('/');
    } else {
      // this means we are logging out
      _this.title = 'Login';
      _this.tabNames = undefined;
      _this.isVet = false;
      _this.isClient = false;
      _this.client = undefined;
      _this.username = '';
      _this.password = '';
      _this.role = '';
      if (_this.syncs) {
        for (let n = 0; n < _this.syncs.length; n += 1) {
          _this.syncs[n].cancel();
        }
        _this.syncs = undefined;
      }
    }
    if (!_this.isLoaded) {
      _this.isLoaded = true;
    }
    $rootScope.$apply();

    if (_this.role) {
      practicesDb.getUser(user.name).then((response) => {
        const practiceId = response.practice;
        if (_this.role === 'vet') {
          // _this.logoKey = response.logoKey;
          if (!_this.isInitialized) {
            $http.get('app/client/client.html').then((template) => {
              $templateCache.put('client.html', template.data);
            });
            $http.get('app/dashboard/dashboard.html').then((template) => {
              $templateCache.put('dashboard.html', template.data);
            });
            $http.get('app/findrecord/findrecord.html').then((template) => {
              $templateCache.put('findrecord.html', template.data);
            });
            $http.get('app/inventory/inventory.html').then((template) => {
              $templateCache.put('inventory.html', template.data);
            });
            $http.get('app/options/options.html').then((template) => {
              $templateCache.put('options.html', template.data);
            });
            _this.isInitialized = true;
          }
          _this.syncs = [];
          db = new PouchDB(practiceId, { revs_limit: 250 });
          _this.syncs.push(PouchDB.sync(practiceId, server + practiceId, {
            live: true,
            retry: true,
          }).on('error', (err) => {
            if (err.name === 'unauthorized') {
              _this.setUser(undefined);
            } else {
              console.log(err);
            }
          }).on('denied', console.error.bind(console)));
          $rootScope.$broadcast('dbReady');

          proceduresDb = _this.syncAndCreateDb(`${practiceId}_procedures`);
          optionsDb = _this.syncAndCreateDb(`${practiceId}_options`);
          // itemsDb = _this.syncAndCreateDb(practice + "_items");
        } else if (_this.role === 'client') {
          db = new PouchDB(server + response.clientId.toLowerCase(), { skip_setup: true });
          db.get(response.clientId).then((client) => {
            if (client) { _this.setClient(client, 'Profile'); }
            $location.path('/client');
            $rootScope.$apply();
          });
        }
        return practiceId;
      }).then(practiceId => practicesDb.get(practiceId)).then((practice) => {
        _this.practice = practice;
      })
        .catch(console.error.bind(console));
    }
  };

  this.setClientTitle = (client) => {
    _this.title = '';
    if (client.firstName) {
      _this.title = `${client.firstName} `;
    }
    _this.title += client.lastName;
    _this.tabNames = clientTabNames;
  };

  this.setClient = (client, activeTab) => {
    if (client._id) {
      _this.setClientTitle(client);
      if (!_this.client || client._id !== _this.client._id) {
        _this.patientVisits = undefined;
        _this.patient = undefined;
        _this.balance = 0;
        _this.unpaidVisits = undefined;
        if (activeTab) {
          _this.activeTab = activeTab;
        }

        db.find({
          selector: {
            clientId: { $eq: client._id },
            _id: {
              $gt: 'p-',
              $lt: 'p-\uffff',
            },
          },
        }).then((response) => {
          _this.patients = response.docs;
          for (let i = 0; i < _this.patients.length; i += 1) {
            if (_this.patients[i].dob) {
              _this.patients[i].dob = new Date(_this.patients[i].dob);
            }
          }
          $rootScope.$apply();
        }).catch((err) => {
          console.error(err);
        });
      }
    } else {
      // we're setting a new client
      _this.patientVisits = undefined;
      _this.patientReminders = undefined;
      _this.patient = undefined;
      _this.title = 'New Client';
      _this.tabNames = undefined;
      _this.patients = [];
      _this.activeTab = 'Profile';
    }
    _this.client = client;
  };
  this.setPatient = (patient) => {
    _this.patientVisits = [];
    _this.patientReminders = [];
    if (patient && patient._id && (!this.patient || patient._id !== _this.patient._id)) {
      _this.activeTab = 'Patients';
      const promises = [];
      promises.push(db.allDocs({
        include_docs: true,
        startkey: `v-${patient._id.substring(2)}`,
        endkey: `v-${patient._id.substring(2)}\uffff`,
      }));
      promises.push(db.allDocs({
        include_docs: true,
        startkey: `r-${patient._id.substring(2)}`,
        endkey: `r-${patient._id.substring(2)}\uffff`,
      }));
      Promise.all(promises).then((response) => {
        for (let i = 0; i < response[0].rows.length; i += 1) {
          _this.patientVisits.push(response[0].rows[i].doc);
        }

        for (let i = 0; i < response[1].rows.length; i += 1) {
          _this.patientReminders.push(response[1].rows[i].doc);
        }

        $rootScope.$apply();
      }).catch((err) => {
        console.error(err);
      });
    }
    _this.patient = patient;
  };
  this.getNameFromId = (id) => {
    if (id) { return id.split('-')[1]; }
    return '';
  };
  this.capitalizeWords = str => str.replace(/\w*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  this.getClientNameFromId = (clientId) => {
    const tokens = clientId.split('-');
    if (tokens.length === 3) {
      // this is a company
      return _this.capitalizeWords(tokens[1]);
    }
    // second to last token is always first name
    const firstName = _this.capitalizeWords(tokens[tokens.length - 2]);
    let lastName = clientId.substring(2, clientId.length - 7);
    lastName = _this.capitalizeWords(lastName.substring(0, lastName.lastIndexOf('-')));
    return `${lastName}, ${firstName}`;
  };
  this.formatItemQuantity = (item) => {
    if (item.quantity > 1) {
      let ret = `${String(item.quantity)}\xA0`;
      const itemIndex = _this.items.map(o => o._id).indexOf(item.itemId);
      const { unit } = _this.items[itemIndex];
      if (unit !== undefined) {
        ret += `${unit}\xA0${item.itemId}`;
      } else {
        ret += `${item.itemId}s`;
      }
      return ret;
    }
    return item.itemId;
  };
});
