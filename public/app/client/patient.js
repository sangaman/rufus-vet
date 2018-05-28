rufus.controller('patientCtrl', PatientController);

function PatientController($scope, $filter, sharedData, $rootScope) {
  const _this = this;
  this.sharedData = sharedData;
  this.submitDisabled = 'true';
  this.addNoteClass = '';
  this.pic = {};
  this.tabNames = ['History', 'Files', 'Reminders'];
  this.activeTab = 'History';

  // initializing croppie
  _this.patientPic = new Croppie(document.getElementById('patient-pic'), {
    viewport: {
      width: 192,
      height: 192,
      type: 'square',
    },
    boundary: { width: 202, height: 202 },
    enableExif: true,
  });
  const picInput = document.getElementById('pic-input');
  picInput.onchange = () => {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        _this.patientPic.bind({
          url: e.target.result,
        });
        _this.picLoaded = true;
        _this.submitClass = '';
        _this.submitDisabled = false;
        $scope.$apply();
      };
      reader.readAsDataURL(this.files[0]);
    }
  };

  $scope.$on('clearNewVisit', () => {
    _this.showNewVisit = false;
  });

  $scope.$on('patientChanged', () => {
    _this.clearCroppie();
    _this.submitDisabled = 'true';
  });
  this.tabClick = (tabName) => {
    _this.activeTab = tabName;
  };
  this.clearCroppie = () => {
    _this.patientPic.bind({ url: '' });
    _this.picLoaded = false;
    picInput.value = undefined;
  };
  this.changePic = () => {
    _this.clearCroppie();
    sharedData.patient.imageKey = undefined;
  };
  this.formChanged = () => {
    _this.submitClass = '';
    _this.submitDisabled = false;
  };
  this.breedSelected = (selected) => {
    if (selected === undefined) {
      sharedData.patient.breed = undefined;
    } else if (selected.originalObject.name === undefined) {
      sharedData.patient.breed = selected.originalObject;
    } else {
      sharedData.patient.breed = selected.originalObject.name;
    }
  };

  this.showRecords = () => {
    $rootScope.$broadcast('showRecords');
    sharedData.showPrint = true;
  };

  this.addVisit = (visit) => {
    if (!confirm('Are you sure? Only notes can be added after a visit is finalized.')) {
      return;
    }
    _this.visitSubmitClass = 'is-loading';
    visit._id = `v-${sharedData.patient._id.substring(2)}-${_this.newVisitDate.getTime()}`;
    visit.clientId = sharedData.client._id;
    visit.total = visit.balance;
    if (!visit.notes[0].note) {
      visit.notes = [];
    }
    const reminders = [];
    const remindersToDelete = [];
    for (let n = 0; n < visit.procedures.length; n += 1) {
      const procedure = visit.procedures[n];
      if (procedure.$$hashKey) {
        delete procedure.$$hashKey;
      }
      if (procedure.followup) {
        const reminderDate = Date.now() + procedure.followupTime;
        const reminder = {
          _id: `r-${sharedData.patient._id.substring(2)}-${reminderDate}-${Math.random().toString(36).substring(2, 6)}`,
          procedureId: procedure.followup,
          clientId: sharedData.client._id,
          note: `Followup for ${procedure.id} on ${$filter('date')(_this.newVisitDate, 'shortDate')}`,
        };
        reminders.push(reminder);
        delete procedure.followupTime;
        delete procedure.followup;
      }
      for (let i = 0; i < sharedData.patientReminders.length; i += 1) {
        const patientReminder = sharedData.patientReminders[i];
        if (patientReminder.procedureId === procedure.id) {
          remindersToDelete.push(patientReminder);
          sharedData.patientReminders.splice(i, 1);
          break;
        }
      }
    }
    db.put(visit).then((response) => {
      if (response.ok) {
        // after we've saved a visit, update outstanding balance for billing and remove reminders
        // matching any procedures performed
        _this.visitSubmitClass = '';
        visit._rev = response.rev;
        if (sharedData.patientVisits) {
          sharedData.patientVisits.push(visit);
        }
        _this.showNewVisit = false;

        if (sharedData.unpaidVisits) {
          sharedData.unpaidVisits.push(visit);
          sharedData.balance += visit.balance;
        }

        if (Object.keys(visit.items).length === 0) {
          delete visit.items;
        }
        db.bulkDocs(reminders).then(() => {
          sharedData.patientReminders.concat(reminders);
        }).catch(console.log.bind(console));
        for (let n = 0; n < remindersToDelete.length; n += 1) {
          db.remove(remindersToDelete[n]).catch(console.log.bind(console));
        }
      } else {
        _this.visitSubmitClass = 'is-danger';
      }
      $scope.$apply();
    }).catch(console.log.bind(console));
  };
  this.addNote = (visit) => {
    for (let n = 0; n < visit.notes.length; n += 1) {
      delete visit.notes[n].$$hashKey;
    }
    visit.notes.unshift({
      date: new Date(Date.now()),
      note: visit.newNote,
    });
    delete visit.newNote;
    _this.addNoteClass = 'is-loading';
    db.put(visit).then((response) => {
      if (response.ok) {
        _this.addNoteClass = '';
        visit._rev = response.rev;
      } else {
        _this.visitSubmitClass = 'is-danger';
      }
      $scope.$apply();
    }).catch(console.log.bind(console));
  };
  this.postFileHandler = (xhr) => {
    if (xhr.status === 204 || xhr.status === 200) {
      db.put(sharedData.patient).then(_this.patientPutHandler).catch(console.log.bind(console));
    } else {
      alert(`Upload failed: ${xhr.status} - ${xhr.responseText}`);
      _this.submitClass = 'is-danger';
      $scope.$apply();
    }
  };
  this.patientPutHandler = (response) => {
    if (response.ok) {
      if (!sharedData.patient._rev) {
        sharedData.patients.push(sharedData.patient);
      }
      sharedData.patient._rev = response.rev;
      _this.submitDisabled = true;
      _this.submitClass = '';
    } else {
      _this.submitClass = 'is-danger';
    }
    $scope.$apply();
  };
  this.submit = () => {
    _this.submitClass = 'is-loading';

    if (!sharedData.patient._id) {
      let id = sharedData.patient.name.replace('-', ' ');
      id = id[0].toUpperCase() + id.slice(1).toLowerCase();
      sharedData.patient._id = `p-${id}-${Math.random().toString(36).substring(2, 8)}`;
    }
    sharedData.patient.clientId = sharedData.client._id;
    if (_this.picLoaded) {
      _this.patientPic.result({
        type: 'blob',
        format: 'webp',
        quality: 0.9,
        size: { width: 300, height: 300 },
      }).then((blob) => {
        const imageKey = `${Date.now()}.webp`;
        sharedData.patient.imageKey = imageKey;
        sharedData.postFile(blob, 'rufus-images', `${_this.patient._id}-${imageKey}`, _this.postFileHandler);
      });
    } else {
      db.put(sharedData.patient).then(_this.patientPutHandler).catch(console.log.bind(console));
    }

    if (sharedData.patient.breed && sharedData.species[sharedData.patient.species].breeds
      .indexOf(sharedData.patient.breed) === -1) {
      // this is a new breed, add it to the db
      sharedData.species[sharedData.patient.species].breeds.push(sharedData.patient.breed);
      if (sharedData.species[sharedData.patient.species].$$hashKey) {
        delete sharedData.species[sharedData.patient.species].$$hashKey;
      }
      sharedData.breeds[sharedData.patient.species].push(sharedData.patient.breed);
      optionsDb.put(sharedData.species[sharedData.patient.species]).then((response) => {
        if (response.ok) {
          sharedData.species[sharedData.patient.species]._rev = response.rev;
        }
      }).catch(console.log.bind(console));
    }
  };
  this.startNewVisit = () => {
    _this.showNewVisit = true;
    _this.newVisitDate = new Date();
  };
  this.cancelNewVisit = () => {
    _this.showNewVisit = false;
  };
}

Object.defineProperty(
  PatientController.prototype,
  'patient', {
    get() {
      return this.sharedData.patient;
    },
  },
);
