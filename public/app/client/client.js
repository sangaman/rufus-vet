rufus.controller('clientCtrl', ClientController);

function ClientController($scope, sharedData) {
  const _this = this;
  this.sharedData = sharedData;
  if (this.sharedData.client === undefined) {
    sharedData.setClient({});
  }
  if (sharedData.client.mailingStreet) {
    this.showMailing = true;
  }
  this.submitDisabled = true;
  if (sharedData.patient) {
    this.showPatient = true;
    sharedData.activeTab = 'Patients';
  }

  this.patientBack = (showNewVisit) => {
    if (showNewVisit) {
      if (!confirm('You have a new visit in progress. Going back before finalizing will discard data related to this visit.')) {
        return;
      }
      $scope.$broadcast('clearNewVisit');
    }
    _this.showPatient = false;
    $scope.$broadcast('angucomplete-alt:clearInput', 'breedsAutocomplete');
  };
  this.addPatient = () => {
    sharedData.setPatient({});
    _this.showPatient = true;
  };
  this.patientClick = (patient) => {
    sharedData.patient = null;
    sharedData.setPatient(patient);
    $scope.$broadcast('patientChanged', patient._id.substring(2));
    _this.showPatient = true;
  };
  this.formChanged = () => {
    _this.submitDisabled = false;
  };
  this.submit = () => {
    _this.submitClass = 'is-loading';
    if (!_this.sharedData.client._id) {
      _this.sharedData.client._id = `c-${_this.sharedData.client.lastName.toLowerCase()}`;
      if (_this.sharedData.client.firstName) {
        _this.sharedData.client._id += `-${_this.sharedData.client.firstName.toLowerCase().replace('-', ' ')}`;
      }
      _this.sharedData.client._id += `-${Math.random().toString(36).substring(2, 8)}`;
    }
    db.put(_this.sharedData.client).then((response) => {
      if (response.ok) {
        sharedData.setClientTitle(_this.sharedData.client);
        _this.sharedData.client._rev = response.rev;
        _this.submitClass = '';
        _this.submitDisabled = true;
      } else {
        _this.submitClass = 'is-danger';
      }
      sharedData.client = _this.sharedData.client;
      $scope.$apply();
    }).catch(console.error.bind(console));
  };
}
