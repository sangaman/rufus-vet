rufus.controller('dashboardCtrl', DashboardController);

function DashboardController($scope, sharedData) {
  this.sharedData = sharedData;
  sharedData.title = 'Dashboard';
  sharedData.tabNames = undefined;
  sharedData.patient = undefined;
  sharedData.client = undefined;
}
