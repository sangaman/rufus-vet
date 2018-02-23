rufus.controller('optionsCtrl', OptionsController);

function OptionsController(sharedData) {
  this.sharedData = sharedData;
  sharedData.title = 'Options';
  sharedData.tabNames = ['Clinic', 'Procedures', 'Breeds'];
  sharedData.activeTab = 'Clinic';
}
