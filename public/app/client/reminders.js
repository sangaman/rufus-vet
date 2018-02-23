rufus.controller('remindersCtrl', RemindersController);
rufus.component('reminders', {
  controller: 'remindersCtrl as reminders',
  templateUrl: 'app/client/reminders.html',
  bindings: {
    fixedPatientId: '<',
  },
});

function RemindersController($scope, $filter, sharedData) {
  const _this = this;
  this.sharedData = sharedData;

  this.reminder = {};

  this.loadReminders = () => {
    if (sharedData.patient && _this.fixedPatientId === sharedData.patient._id) {
      _this.reminders = sharedData.patientReminders;
    } else {
      db.find({
        selector: {
          clientId: {
            $eq: sharedData.client._id,
          },
          _id: {
            $gt: 'r-',
            $lt: 'r-\uffff',
          },
        },
      }).then((response) => {
        if (_this.fixedPatientId) {
          _this.reminders = [];
          for (let n = 0; n < response.docs.length; n += 1) {
            if (response.docs[n]._id.substring(2).startsWith(_this.fixedPatientId)) {
              _this.reminders.push(response.docs[n]);
            }
          }
        } else {
          _this.reminders = response.docs;
        }
        $scope.$apply();
      }).catch((err) => {
        console.error(err);
      });
    }
  };

  this.loadReminders();

  $scope.$on('patientChanged', (event, fixedPatientId) => {
    _this.fixedPatientId = fixedPatientId;
    _this.loadReminders();
  });

  this.procedureSelected = (selected) => {
    if (selected) {
      _this.procedure = selected.originalObject._id;
    } else {
      _this.procedure = undefined;
    }
  };

  this.deleteReminder = (reminder) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }
    reminder._deleted = true;
    db.put(reminder).then(() => {
      const index = _this.reminders.indexOf(reminder);
      if (index > -1) {
        _this.reminders.splice(index, 1);
        $scope.$apply();
      }
    }).catch((err) => {
      console.error(err);
    });
  };

  this.addReminder = () => {
    if (_this.fixedPatientId) {
      _this.reminder._id = `r-${_this.fixedPatientId}`;
    } else {
      _this.reminder._id = `r-${_this.patientId.substring(2)}`;
    }
    _this.reminder._id += `-${_this.date.getTime()}-${Math.random().toString(36).substring(2, 6)}`;
    _this.reminder.procedureId = _this.procedure;
    _this.reminder.clientId = sharedData.client._id;
    _this.submitClass = 'is-loading';
    db.put(_this.reminder).then((response) => {
      _this.reminder._rev = response.rev;
      _this.reminders.unshift(_this.reminder);
      _this.reminder = {};
      _this.submitClass = '';
      $scope.$broadcast('angucomplete-alt:clearInput', 'proceduresReminderAutocomplete');
      $scope.$apply();
    }).catch((err) => {
      console.error(err);
    });
  };
}
