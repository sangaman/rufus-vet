rufus.controller('newVisitCtrl', NewVisitController);

function NewVisitController($scope) {
  const _this = this;
  const newVisitTemplate = {
    balance: 0,
    procedures: [],
    notes: [{ date: new Date(Date.now()) }],
    items: {}, // TODO use or remove unecessary empty item objects
  };
  this.visit = newVisitTemplate;

  $scope.$on('clearNewVisit', () => {
    _this.visit = newVisitTemplate;
  });

  this.procedureSelected = (selected) => {
    if (selected) {
      _this.newProcedure = {
        id: selected.originalObject._id,
      };
      _this.price = Number(selected.originalObject.price / 100);
      _this.followup = selected.originalObject.followup;
      _this.followupTime = selected.originalObject.followupTime;
      _this.procedureItems = selected.originalObject.items;
    } else {
      _this.newProcedure = undefined;
      _this.price = undefined;
    }
  };
  this.deleteProcedure = (procedure) => {
    const index = _this.visit.procedures.indexOf(procedure);
    if (index > -1) {
      const deletedProcedure = _this.visit.procedures.splice(index, 1)[0];
      if (deletedProcedure.quantity > 1) {
        _this.visit.balance -= deletedProcedure.price * deletedProcedure.quantity;
      } else {
        _this.visit.balance -= deletedProcedure.price;
      }
    }
  };
  this.addProcedure = () => {
    if (_this.discount && _this.discountType) {
      if (_this.discountType === '%') {
        if (_this.discount > 100) {
          _this.discount = 100;
        }
        _this.newProcedure.price = Math.round(_this.price * (100 - (_this.discount)));
      } else if (_this.discountType === '$') {
        if (_this.discount > _this.price) {
          _this.discount = _this.price;
        }
        _this.newProcedure.price = (_this.price * 100) - (_this.discount * 100);
      }
    } else {
      _this.newProcedure.price = _this.price * 100;
    }

    if (_this.quantity > 1) {
      _this.newProcedure.quantity = _this.quantity;
      _this.visit.balance += _this.newProcedure.price * _this.newProcedure.quantity;
    } else {
      _this.visit.balance += _this.newProcedure.price;
    }

    if (_this.procedureItems && _this.procedureItems instanceof Array) {
      for (let n = 0; n < _this.procedureItems.length; n += 1) {
        const procedureItem = _this.procedureItems[n];
        if (!procedureItem.quantity) {
          procedureItem.quantity = 1;
        }
        if (_this.visit.items[procedureItem.itemId]) {
          _this.visit.items[procedureItem.itemId].quantity += procedureItem.quantity;
        } else {
          _this.visit.items[procedureItem.itemId] = { quantity: procedureItem.quantity };
        }
      }
    }

    _this.newProcedure.followup = _this.followup;
    _this.newProcedure.followupTime = _this.followupTime;
    _this.visit.procedures.push(_this.newProcedure);

    _this.newProcedure = undefined;
    _this.price = undefined;
    _this.quantity = undefined;
    $scope.$broadcast('angucomplete-alt:clearInput', 'proceduresAutocomplete');
  };
}
