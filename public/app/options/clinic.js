
rufus.controller('clinicCtrl', ClinicController);

function ClinicController($scope, sharedData) {
  const _this = this;
  this.sharedData = sharedData;

  if (optionsDb) {
    optionsDb.allDocs({
      include_docs: true,
      startkey: 'v-',
      endkey: 'v-\uffff',
    }).then((result) => {
      _this.vets = result.rows;
      $scope.$apply();
    }).catch((err) => {
      console.error(err);
    });
  }

  this.setVet = (vet) => {
    _this.vet = vet.doc;
    _this.vetName = sharedData.getNameFromId(vet.id);
    _this.vetUpdateDisabled = true;
    _this.vetNameDisabled = true;
  };
}
