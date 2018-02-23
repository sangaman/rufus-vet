const server = 'https://rufus.soon.it:7465/';
const practicesDb = new PouchDB(`${server}practices`, { skip_setup: true });

rufus.controller('indexCtrl', IndexController);

function IndexController($scope, sharedData) {
  const _this = this;
  this.sharedData = sharedData;
  this.isMenuActive = false;

  this.toggleMenu = () => {
    _this.isMenuActive = !_this.isMenuActive;
  };
  this.hideMenu = () => {
    _this.isMenuActive = false;
  };
  this.newClient = () => {
    sharedData.setClient({});
  };
  this.tabClick = (tabName) => {
    sharedData.activeTab = tabName;
  };
  this.isLoggedIn = () => sharedData.isVet || sharedData.isClient;

  this.login = () => {
    practicesDb.login(sharedData.username.toLowerCase().trim(), sharedData.password)
      .then((response) => {
        if (response.ok) {
          _this.loginFailed = false;
          sharedData.setUser(response);
        }
      }).catch((err) => {
        if (err) {
          if (err.name === 'unauthorized') {
            _this.loginFailed = true;
            $scope.$apply();
          } else {
            console.error(err);
          }
        }
      });
  };

  this.logout = () => {
    practicesDb.logout().then((response) => {
      if (response.ok) {
        sharedData.setUser(undefined);
      }
    }).catch(console.error.bind(console));
  };

  practicesDb.getSession().then((response) => {
    sharedData.setUser(response.userCtx);
  }).catch(console.error.bind(console));
}
