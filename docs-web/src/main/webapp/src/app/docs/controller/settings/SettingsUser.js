/**
 * Settings user page controller.
 */
angular.module('docs').controller('SettingsUser', ($scope, $state, Restangular) => {
  /**
   * Load users from server.
   */
  $scope.loadUsers = function () {
    Restangular.one('user/list').get({
      sort_column: 1,
      asc: true,
    }).then((data) => {
      $scope.users = data.users;
    });
  };

  $scope.loadUsers();

  /**
   * Edit a user.
   */
  $scope.editUser = function (user) {
    $state.go('settings.user.edit', { username: user.username });
  };
});
