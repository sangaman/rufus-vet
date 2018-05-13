rufus.controller('dashboardCtrl', DashboardController);

function DashboardController($scope, $location, sharedData) {
  this.sharedData = sharedData;
  sharedData.title = 'Dashboard';
  sharedData.tabNames = undefined;
  sharedData.patient = undefined;
  sharedData.client = undefined;
  this.unpaidClients = {};

  this.loadReminders = () => {
    db.find({
      selector: {
        _id: {
          $gt: 'v-',
          $lt: 'v-\uffff',
        },
        balance: {
          $gt: 0,
        },
      },
    }).then((response) => {
      for (let i = 0; i < response.docs.length; i += 1) {
        const { clientId } = response.docs[i];
        if (this.unpaidClients[clientId]) {
          this.unpaidClients[clientId] += response.docs[i].balance;
        } else {
          this.unpaidClients[clientId] = response.docs[i].balance;
        }
      }
      $scope.$apply();
    }).catch((err) => {
      console.error(err);
    });
  };

  if (db) {
    this.loadReminders();
  }
  $scope.$on('dbReady', () => {
    this.loadReminders();
  });

  this.setClientId = (clientId) => {
    db.get(clientId).then((doc) => {
      sharedData.setClient(doc, 'Billing');
      sharedData.setPatient(undefined);
      $location.path('/client');
    }).catch(console.error.bind(console));
  };
}
