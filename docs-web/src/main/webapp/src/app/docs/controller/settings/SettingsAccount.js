/**
 * Settings account controller.
 */
angular.module('docs').controller('SettingsAccount', ($scope, Restangular, $translate) => {
  $scope.editUserAlert = false;

  // Alerts
  $scope.alerts = [];

  /**
   * Close an alert.
   */
  $scope.closeAlert = function (index) {
    $scope.alerts.splice(index, 1);
  };

  /**
   * Edit user.
   */
  $scope.editUser = function () {
    Restangular.one('user').post('', $scope.user).then(() => {
      $scope.user = {};
      $scope.alerts.push({ type: 'success', msg: $translate.instant('settings.account.updated') });
    });
  };
});
