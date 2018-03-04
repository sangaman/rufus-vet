rufus.controller('billingCtrl', BillingController);

function BillingController($scope, $rootScope, $filter, sharedData) {
  const _this = this;
  this.sharedData = sharedData;

  sharedData.balance = 0;
  sharedData.unpaidVisits = [];
  this.payment = {};
  this.payments = [];

  db.find({
    selector: {
      clientId: {
        $eq: sharedData.client._id,
      },
      _id: {
        $gt: 'y-',
        $lt: 'y-\uffff',
      },
    },
  }).then((response) => {
    _this.payments = response.docs;
    $scope.$apply();
  }).catch(console.error.bind(console));

  db.find({
    selector: {
      clientId: {
        $eq: sharedData.client._id,
      },
      balance: {
        $gt: 0,
      },
    },
  }).then((response) => {
    sharedData.unpaidVisits = $filter('orderBy')(response.docs, 'date', true);
    for (let i = 0; i < sharedData.unpaidVisits.length; i += 1) {
      sharedData.balance += sharedData.unpaidVisits[i].balance;
    }
    $scope.$apply();
  }).catch(console.error.bind(console));

  this.showReceipt = () => {
    if (_this.selectedPayment) {
      $rootScope.$broadcast('showReceipt', _this.selectedPayment);
      sharedData.showPrint = true;
    } else {
      alert('Please select a payment.');
    }
  };

  this.visitClick = (visitScope) => {
    visitScope.expand = true;
  };

  this.paymentTypeChanged = () => {
    if (_this.payment.type === 'Check') {
      _this.paymentInfoLabel = 'Check\xA0Number';
    } else if (_this.payment.type === 'Credit Card') {
      _this.paymentInfoLabel = 'Last\xA04';
    } else {
      _this.paymentInfoLabel = null;
    }
  };

  this.addPayment = () => {
    if (!confirm(`Record a payment of $${_this.amount}? This cannot be undone.`)) {
      return;
    }
    _this.submitClass = 'is-loading';
    _this.payment._id = `y-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    _this.payment.clientId = sharedData.client._id;
    _this.payment.visitIds = [];
    _this.payment.amount = _this.amount * 100;
    _this.balance -= _this.payment.amount;

    let remainingAmount = _this.payment.amount;
    const unpaidVisitsToUpdate = [];
    const patientVisitIndexes = [];
    while (remainingAmount > 0) {
      const unpaidVisit = sharedData.unpaidVisits.pop();
      _this.payment.visitIds.push(unpaidVisit._id);
      let patientVisitIndex = -1;
      // check if this visit exists in our existing list of patient visits so we can update the rev
      if (sharedData.patientVisits) {
        patientVisitIndex = sharedData.patientVisits.map(o => o._id).indexOf(unpaidVisit._id);
      }

      if (remainingAmount >= unpaidVisit.balance) {
        remainingAmount -= unpaidVisit.balance;
        unpaidVisit.balance = 0;
        if (unpaidVisit.partialPayment) {
          delete unpaidVisit.partialPayment;
        }
      } else {
        unpaidVisit.balance -= remainingAmount;
        unpaidVisit.partialPayment = remainingAmount;
        remainingAmount = 0;
        sharedData.unpaidVisits.push(unpaidVisit);
      }
      unpaidVisitsToUpdate.push(unpaidVisit);
      patientVisitIndexes.push(patientVisitIndex);
    }

    db.put(_this.payment).then((response) => {
      if (response.ok) {
        _this.submitClass = '';
        _this.payments.unshift(_this.payment);

        _this.payment = {};
        _this.amount = undefined;
      } else {
        _this.submitClass = 'is-danger';
      }
      $scope.$apply();
    }).catch(console.error.bind(console));

    db.bulkDocs(unpaidVisitsToUpdate).then((response) => {
      for (let i = 0; i < response.length; i += 1) {
        unpaidVisitsToUpdate[i]._rev = response[i].rev;
        if (patientVisitIndexes[i] > -1) {
          sharedData.visits[patientVisitIndexes[i]] = unpaidVisitsToUpdate[i];
        }
        if (unpaidVisitsToUpdate[i].balance === 0) {
          sharedData.unpaidVisits.splice(0, 1);
        }
      }
    }).catch(console.error.bind(console));
  };
}
