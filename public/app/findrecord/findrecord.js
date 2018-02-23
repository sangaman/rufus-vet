rufus.controller('findRecordCtrl', FindRecordController);

function FindRecordController($scope, $location, sharedData) {
  const _this = this;
  this.lastName = '';
  this.patientName = '';
  sharedData.title = 'Find Record';
  sharedData.tabNames = undefined;

  this.findClient = (event) => {
    if (event) {
      if (event.keyCode !== 13) {
        return;
      }
    }
    _this.clientSubmitClass = 'is-loading';
    const searchString = _this.lastName ? _this.lastName.toLowerCase() : '';
    db.allDocs({
      include_docs: true,
      startkey: `c-${searchString}`,
      endkey: `c-${searchString}\uffff`,
    }).then((result) => {
      _this.clientSubmitClass = '';
      _this.clients = result.rows;
      _this.showClients = true;
      _this.showPatients = false;
      $scope.$apply();
    }).catch(console.error.bind(console));
  };

  this.capitalizeWords = str => str.replace(/\w*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  this.clientClick = (client) => {
    sharedData.setClient(client);
    $location.path('/client');
  };

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

  this.getPhoneNumber = (client) => {
    if (client.cellPhone) {
      return `${client.cellPhone} (Cell)`;
    } else if (client.homePhone) {
      return `${client.homePhone} (Home)`;
    } else if (client.workPhone) {
      return `${client.workPhone} (Work)`;
    }
    return '';
  };

  this.findPatient = (event) => {
    if (event) {
      if (event.keyCode !== 13) {
        return;
      }
    }
    _this.patientSubmitClass = 'is-loading';
    const searchString = _this.patientName ? _this.patientName[0].toUpperCase() + _this.patientName.slice(1).toLowerCase() : '';
    db.allDocs({
      include_docs: true,
      startkey: `p-${searchString}`,
      endkey: `p-${searchString}\uffff`,
    }).then((result) => {
      _this.patientSubmitClass = '';
      _this.patients = [];
      _this.showPatients = true;
      _this.showClients = false;
      for (let i = 0; i < result.rows.length; i += 1) {
        if (result.rows[i].doc.dob) {
          result.rows[i].doc.dob = new Date(result.rows[i].doc.dob);
          _this.patients.push(result.rows[i].doc);
        }
      }

      $scope.$apply();
    }).catch(console.error.bind(console));
  };

  this.patientClick = (patient, showPatient) => {
    db.get(patient.clientId).then((doc) => {
      sharedData.setClient(doc);
      if (showPatient) {
        sharedData.setPatient(patient);
      } else {
        sharedData.setPatient(undefined);
      }
      $location.path('/client');
      $scope.$apply();
    }).catch(console.error.bind(console));
  };
}

