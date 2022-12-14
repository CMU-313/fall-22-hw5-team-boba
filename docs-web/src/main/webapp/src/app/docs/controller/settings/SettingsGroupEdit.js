/**
 * Settings group edition page controller.
 */
angular.module('docs').controller('SettingsGroupEdit', ($scope, $dialog, $state, $stateParams, Restangular, $q, $translate) => {
  /**
   * Returns true if in edit mode (false in add mode).
   */
  $scope.isEdit = function () {
    return $stateParams.name;
  };

  /**
   * In edit mode, load the current group.
   */
  if ($scope.isEdit()) {
    Restangular.one('group', $stateParams.name).get().then((data) => {
      $scope.group = data;
    });
  }

  /**
   * Update the current group.
   */
  $scope.edit = function () {
    let promise = null;
    const group = angular.copy($scope.group);

    if ($scope.isEdit()) {
      promise = Restangular
        .one('group', $stateParams.name)
        .post('', group);
    } else {
      promise = Restangular
        .one('group')
        .put(group);
    }

    promise.then(() => {
      $scope.loadGroups();
      if ($scope.isEdit()) {
        $state.go('settings.group');
      } else {
        // Go to edit this group to add members
        $state.go('settings.group.edit', { name: group.name });
      }
    }, (e) => {
      if (e.data.type === 'GroupAlreadyExists') {
        var title = $translate.instant('settings.group.edit.edit_group_failed_title');
        var msg = $translate.instant('settings.group.edit.edit_group_failed_message');
        var btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
        $dialog.messageBox(title, msg, btns);
      } else if (e.data.type === 'GroupUsedInRouteModel') {
        var title = $translate.instant('settings.group.edit.group_used_title');
        var msg = $translate.instant('settings.group.edit.group_used_message', { name: e.data.message });
        var btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
        $dialog.messageBox(title, msg, btns);
      }
    });
  };

  /**
   * Delete the current group.
   */
  $scope.remove = function () {
    const title = $translate.instant('settings.group.edit.delete_group_title');
    const msg = $translate.instant('settings.group.edit.delete_group_message');
    const btns = [
      { result: 'cancel', label: $translate.instant('cancel') },
      { result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' },
    ];

    $dialog.messageBox(title, msg, btns, (result) => {
      if (result === 'ok') {
        Restangular.one('group', $stateParams.name).remove().then(() => {
          $scope.loadGroups();
          $state.go('settings.group');
        }, (e) => {
          if (e.data.type === 'GroupUsedInRouteModel') {
            const title = $translate.instant('settings.group.edit.group_used_title');
            const msg = $translate.instant('settings.group.edit.group_used_message', { name: e.data.message });
            const btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
            $dialog.messageBox(title, msg, btns);
          }
        });
      }
    });
  };

  /**
   * Returns a promise for typeahead group.
   */
  $scope.getGroupTypeahead = function ($viewValue) {
    const deferred = $q.defer();
    Restangular.one('group')
      .get({
        sort_column: 1,
        asc: true,
      }).then((data) => {
        deferred.resolve(_.pluck(_.filter(data.groups, (group) => group.name.indexOf($viewValue) !== -1), 'name'));
      });
    return deferred.promise;
  };

  /**
   * Returns a promise for typeahead user.
   */
  $scope.getUserTypeahead = function ($viewValue) {
    const deferred = $q.defer();
    Restangular.one('user/list')
      .get({
        search: $viewValue,
        sort_column: 1,
        asc: true,
      }).then((data) => {
        deferred.resolve(_.pluck(_.filter(data.users, (user) => user.username.indexOf($viewValue) !== -1), 'username'));
      });
    return deferred.promise;
  };

  /**
   * Add a new member.
   */
  $scope.addMember = function (member) {
    $scope.member = '';
    Restangular.one(`group/${$stateParams.name}`).put({
      username: member,
    }).then(() => {
      if ($scope.group.members.indexOf(member) === -1) {
        $scope.group.members.push(member);
      }
    });
  };

  /**
   * Remove a member.
   */
  $scope.removeMember = function (member) {
    Restangular.one(`group/${$stateParams.name}`, member).remove().then(() => {
      $scope.group.members.splice($scope.group.members.indexOf(member), 1);
    });
  };
});
