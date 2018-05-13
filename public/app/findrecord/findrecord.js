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

  this.clientClick = (client) => {
    sharedData.setClient(client, 'Profile');
    $location.path('/client');
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

