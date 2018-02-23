rufus.controller('inventoryCtrl', InventoryController);

function InventoryController(sharedData, $scope) {
  const _this = this;
  this.sharedData = sharedData;
  sharedData.title = 'Inventory';
  sharedData.tabNames = ['Items', 'Reminders'];
  sharedData.activeTab = 'Items';

  this.itemSelected = (selected) => {
    if (selected) {
      if (selected.originalObject._id) {
        _this.newItem = selected.originalObject;
      } else {
        _this.newItem = { _id: selected.originalObject, batches: [] };
      }
    } else {
      _this.newItem = undefined;
    }
  };
  this.setItem = (item) => {
    _this.item = item;
    _this.updateClass = 'is-disabled';
  };
  this.addItem = () => {
    if (_this.newItem) {
      _this.addClass = 'is-loading';
      if (_this.newItem.quantity) {
        // existing item, we want to augment the quantity
        _this.newItem.quantity += _this.newQuantity;
      } else {
        _this.newItem.quantity = Number(_this.newQuantity);
      }
      if (_this.newExpirationDate) {
        let index = -1;
        const newBatch = {
          expirationDate: _this.newExpirationDate,
          quantity: _this.newQuantity,
        };
        for (let i = 0; i < _this.newItem.batches.length; i += 1) {
          if (_this.newExpirationDate <= new Date(_this.newItem.batches[i].expirationDate)) {
            index = i;
          }
        }
        if (index === -1) {
          index = _this.newItem.batches.length;
        }
        _this.newItem.batches.splice(index, 0, newBatch);
      }
      itemsDb.put(_this.newItem).then((response) => {
        if (response.ok) {
          const oldRev = _this.newItem._rev;
          _this.newItem._rev = response.rev;
          if (!oldRev) {
            // this is an item we just added, add it to the items array
            sharedData.items.unshift(_this.newItem);
          }
          // TODO update the item in the shared data array so that the panel updates automatially
          _this.addClass = '';
          _this.newItem = undefined;
          _this.newQuantity = undefined;
          _this.newExpirationDate = undefined;
          $scope.$broadcast('angucomplete-alt:clearInput', 'itemsAutocomplete');
          $scope.$apply();
        } else {
          _this.addClass = 'is-danger';
        }
      }).catch(console.error.bind(console));
      /* if(err.status === 409) {
        var itemIndex = sharedData.items.map(function(o) { return o._id;})
          .indexOf(_this.newItem._id);
        _this.newItem = sharedData.items[itemIndex];
        _this.addItem();
      } */
    }
  };

  this.formChanged = () => {
    _this.updateClass = '';
  };
  this.updateItem = () => {
    itemsDb.put(_this.item).then((response) => {
      if (response.ok) {
        _this.item._rev = response.rev;
        // TODO remove batches potentially
        _this.updateClass = 'is-disabled';
      } else {
        _this.updateClass = 'is-danger';
      }
      $scope.$apply();
    }).catch(console.error.bind(console));
  };
  this.deleteItem = () => {
    itemsDb.remove(_this.item)
      .then((response) => {
        if (response.ok) {
          const itemIndex = sharedData.items.map(o => o._id).indexOf(_this.item._id);
          sharedData.items.splice(itemIndex, 1);
          _this.item = undefined;
          $scope.$apply();
        }
      }).catch(console.error.bind(console));
  };
}
