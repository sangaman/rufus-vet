rufus.controller('statementCtrl', StatementController);

function StatementController($scope, $filter, sharedData) {
  const _this = this;
  this.sharedData = sharedData;

  $scope.$on('showReceipt', (event, payment) => {
    _this.loaded = false;
    _this.visitsFetchedCount = 0;
    _this.patientsFetchedCount = 0;
    _this.remindersFetchedCount = 0;
    _this.patientsCount = 0;
    _this.visitsCount = payment.visitIds.length;
    _this.total = 0;
    _this.payment = payment;
    _this.patients = {};
    [, _this.paymentDate] = payment._id.split('-');
    payment.visitIds.sort();
    for (let i = 0; i < _this.visitsCount; i += 1) {
      const arr = payment.visitIds[i].split('-');
      const patientId = `p-${arr[1]}-${arr[2]}`;

      if (!_this.patients[patientId]) {
        _this.patientsCount += 1;
        _this.patients[patientId] = {
          visits: [],
        };
        db.get(patientId).then(_this.patientHandler.bind(_this.patients[patientId]))
          .catch(console.error.bind(console));
        db.allDocs({
          include_docs: true,
          startkey: `r-${patientId.substring(2)}`,
          endkey: `r-${patientId.substring(2)}\uffff`,
        }).then(_this.remindersHandler.bind(_this.patients[patientId]))
          .catch(console.error.bind(console));
      }

      db.get(payment.visitIds[i]).then(_this.visitHandler.bind(_this.patients[patientId]))
        .catch(console.error.bind(console));
    }
  });

  $scope.$on('showRecords', () => {
    _this.patients = {};
    _this.patients[sharedData.patient._id] = {
      patient: sharedData.patient,
      reminders: sharedData.patientReminders,
      visits: sharedData.patientVisits.slice(0),
    };
    _this.loaded = true;
  });

  this.remindersHandler = function remindersHandler(results) {
    this.reminders = results.rows;
    _this.remindersFetchedCount += 1;
    _this.applyIfLoadingDone();
  };

  this.patientHandler = function patientHandler(doc) {
    this.patient = doc;
    _this.patientsFetchedCount += 1;
    _this.applyIfLoadingDone();
  };

  this.visitHandler = function vistHandler(doc) {
    this.visits.push(doc);
    _this.total += doc.total;
    _this.visitsFetchedCount += 1;
    _this.applyIfLoadingDone();
  };

  this.applyIfLoadingDone = () => {
    if (_this.patientsFetchedCount === _this.patientsCount &&
      _this.remindersFetchedCount === _this.patientsCount &&
      _this.visitsFetchedCount === _this.visitsCount) {
      _this.loaded = true;
      $scope.$apply();
    }
  };

  /* this.fetchRemindersAndShow = function() {
    _this.remindersForPatients = [];
    index = 0;
    count = 0;
    for(let patientId in _this.patients) {
      count++;
      let remindersForPatient = {
        patient: sharedData.getNameFromId(patientId),
        reminders: []
      };
      _this.remindersForPatients.push(remindersForPatient);
      db.allDocs({
          include_docs: true,
        startkey: 'r-' + patientId.substring(2),
        endkey: 'r-' + patientId.substring(2) + '\uffff'
        }).then(_this.fetchRemindersHandler.bind(this)).catch(console.error.bind(console));
    }
  };

  this.fetchRemindersHandler = function (result) {
    for(let row of result.rows) {
     _this.remindersForPatients[index].reminders.push(row.doc);
    }
    index++;
      if(count===index) {
    $scope.$apply();
      }
  }; */

  this.print = () => {
    window.print();
  };

  this.dismiss = () => {
    sharedData.showPrint = false;
  };

  this.getCityStateZip = () => {
    if (!sharedData.client) {
      return '';
    }
    if (sharedData.client.mailingCity) {
      return `${sharedData.client.mailingCity}, ${sharedData.client.mailingState} ${sharedData.client.mailingZip}`;
    }
    return `${sharedData.client.physicalCity}, ${sharedData.client.physicalState} ${sharedData.client.physicalZip}`;
  };
}
