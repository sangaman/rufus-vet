rufus.controller('appointmentsCtrl', AppointmentsController);

function AppointmentsController($scope, $filter, sharedData) {
  const _this = this;
  this.sharedData = sharedData;

  this.appointment = {};
  this.appointments = [];

  db.find({
    selector: {
      clientId: {
        $eq: sharedData.client._id,
      },
      _id: {
        $gt: 'a-',
        $lt: 'a-\uffff',
      },
    },
  }).then((response) => {
    _this.appointments = response.docs;
    for (let i = 0; i < _this.appointments.length; i += 1) {
      if (_this.appointments[i].date) {
        _this.appointments[i].date = new Date(_this.appointments[i].date);
      }
    }
    $scope.$apply();
  }).catch((err) => {
    console.error(err);
  });

  this.onStartBlur = () => {
    if (_this.appointment.start && !_this.appointment.end) {
      _this.appointment.end = new Date(_this.appointment.start.getTime());
      _this.appointment.end.setHours(_this.appointment.end.getHours() + 1);
    }
  };

  this.deleteAppointment = (appointment) => {
    if (!confirm(`Delete appointment "${appointment.title}"? Appointment will be removed from Google Calendar. This cannot be undone`)) {
      return;
    }
    // appointment._deleted = true;
    appointment.canceled = true;
    db.put(appointment).then(() => {
      const index = _this.appointments.indexOf(appointment);
      if (index > -1) {
        _this.appointments.splice(index, 1);
        $scope.$apply();
      }
    }).catch(console.error.bind(console));
  };

  this.addAppointment = () => {
    _this.appointment._id = `a-${new Date(_this.appointment.start).getTime() / 1000}-${Math.random().toString(36).substring(2, 8)}`;
    _this.appointment.clientId = sharedData.client._id;
    _this.submitClass = 'is-loading';
    db.put(_this.appointment).then((response) => {
      _this.appointment._rev = response.rev;
      _this.appointments.unshift(_this.appointment);
      _this.appointment = {};
      _this.submitClass = {};
      $scope.$apply();
    }).catch((err) => {
      console.error(err);
    });
  };
}
