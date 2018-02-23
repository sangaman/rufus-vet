const rufus = angular.module('myApp', ['ngRoute', 'angucomplete-alt', 'ui.mask']);

rufus.constant('clientTabNames', ['Profile', 'Patients', 'Billing', 'Appointments', 'Reminders']);

rufus.config(($routeProvider) => {
  $routeProvider
    .when('/', {
      templateUrl: 'app/dashboard/dashboard.html',
      controller: 'dashboardCtrl',
      controllerAs: 'dashboard',
    })
    .when('/find', {
      templateUrl: 'app/findrecord/findrecord.html',
      controller: 'findRecordCtrl',
      controllerAs: 'findRecord',
    })
    .when('/client', {
      templateUrl: 'app/client/client.html',
      controller: 'clientCtrl',
      controllerAs: 'client',
    })
    .when('/options', {
      templateUrl: 'app/options/options.html',
      controller: 'optionsCtrl',
      controllerAs: 'options',
    })
    .when('/inventory', {
      templateUrl: 'app/inventory/inventory.html',
      controller: 'inventoryCtrl',
      controllerAs: 'inventory',
    });
});

rufus.filter('ageFilter', () => (dob) => {
  const ageDifMs = Date.now() - dob;
  const ageDate = new Date(ageDifMs); // milliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

rufus.filter('telFilter', () => (tel) => {
  if (!tel) { return ''; }

  const areaCode = tel.slice(0, 3);
  let number = tel.slice(3);
  number = `${number.slice(0, 3)}-${number.slice(3)}`;

  return (`(${areaCode}) ${number}`);
});

rufus.filter('sexFilter', () => (sex) => {
  switch (sex) {
    case 'M':
      return 'Intact Male';
    case 'F':
      return 'Intact Female';
    case 'N':
      return 'Neutered Male';
    case 'S':
      return 'Spayed Female';
    default:
      return '';
  }
});

rufus.directive('formOnChange', $parse => ({
  require: 'form',
  link(scope, element, attrs) {
    const cb = $parse(attrs.formOnChange);
    element.bind('keydown keypress', () => { cb(scope); });
    element.on('change', () => {
      cb(scope);
    });
  },
}));
// var itemsDb;

/* db.createIndex({
  index: {
    fields: ['clientId'],
  name: 'clientIndex'
  }
});
db.createIndex({
  index: {
    fields: ['balance'],
  name: 'balanceIndex'
  }
}); */
