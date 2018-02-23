rufus.controller('proceduresCtrl', ProceduresController);

function ProceduresController($scope, sharedData) {
  this.sharedData = sharedData;
  const _this = this;

  this.newProcedure = { items: {} };

  this.itemSelected = (selected) => {
    if (selected) {
      _this.itemId = selected.originalObject._id;
    }
  };
  this.setProcedure = (procedure) => {
    if (procedure.followup) {
      $scope.$broadcast('angucomplete-alt:changeInput', 'proceduresAutocomplete', procedure.followup);
    } else {
      $scope.$broadcast('angucomplete-alt:clearInput', 'proceduresAutocomplete');
    }
    _this.procedure = procedure;
    _this.dollarPrice = procedure.price / 100;
    _this.updateDisabled = true;

    _this.timeMultiplier = '86400000';
    if (procedure.followupTime) {
      if (procedure.followupTime % 31536000000 === 0) {
        _this.timeMultiplier = '31536000000';
      } else if (procedure.followupTime % 2592000000 === 0) {
        _this.timeMultiplier = '2592000000';
      } else if (procedure.followupTime % 604800000 === 0) {
        _this.timeMultiplier = '604800000';
      }
      _this.followupTime = procedure.followupTime / _this.timeMultiplier;
    } else {
      _this.followupTime = undefined;
    }
  };
  this.addItem = () => {
    if (_this.itemId) {
      const itemIndex = _this.procedure.items.map(o => o.itemId).indexOf(_this.itemId);
      if (itemIndex === -1) {
        const newItem = {
          itemId: _this.itemId,
        };
        if (_this.itemQuantity > 1) {
          newItem.quantity = _this.itemQuantity;
        }
        _this.procedure.items.push(newItem);
        $scope.$broadcast('angucomplete-alt:clearInput', 'itemsAutocomplete');
        _this.itemQuantity = undefined;
      } else {
        // TODO error popup
      }
    }
  };
  this.deleteItem = (item) => {
    const index = _this.procedure.items.indexOf(item);
    if (index > -1) {
      _this.procedure.items.splice(index, 1);
    }
  };
  this.formChanged = () => {
    _this.updateDisabled = false;
  };
  this.procedureSelected = (selected) => {
    if (selected) {
      _this.procedure.followup = selected.originalObject._id;
    }
  };
  this.updateProcedure = () => {
    _this.procedure.price = _this.dollarPrice * 100;
    if (!_this.procedure.followup) {
      _this.procedure.followupTime = undefined;
    } else if (_this.followupTime) {
      _this.procedure.followupTime = _this.followupTime * _this.timeMultiplier;
    }
    proceduresDb.put(_this.procedure).then((response) => {
      if (response.ok) {
        _this.procedure._rev = response.rev;
        _this.updateDisabled = true;
      } else {
        _this.updateClass = 'is-danger';
      }
      $scope.$apply();
    }).catch(console.error.bind(console));
  };
  this.deleteProcedure = () => {
    if (!confirm('Are you sure? This procedure will be permanently removed.')) {
      return;
    }
    _this.procedure._deleted = true;
    proceduresDb.put(_this.procedure)
      .then((response) => {
        if (response.ok) {
          const procedureIndex = sharedData.procedures.map(o => o._id).indexOf(_this.procedure._id);
          sharedData.procedures.splice(procedureIndex, 1);
          _this.procedure = undefined;
          $scope.$apply();
        }
      }).catch(console.error.bind(console));
  };

  this.addProcedure = () => {
    _this.addClass = 'is-loading';
    _this.newProcedure.price = _this.newPrice * 100;
    proceduresDb.put(_this.newProcedure).then((response) => {
      if (response.ok) {
        _this.newProcedure._rev = response.rev;
        sharedData.procedures.unshift(_this.newProcedure);
        _this.addClass = '';
        _this.setProcedure(_this.newProcedure);

        _this.newPrice = undefined;
        _this.newProcedure = { items: {} };
      } else {
        _this.addClass = 'is-danger';
      }
      $scope.$apply();
    }).catch(console.error.bind(console));
  };
}
