/**
 * Settings session controller.
 */
angular.module('docs').controller('SettingsSession', ($scope, Restangular) => {
  /**
   * Load sessions.
   */
  $scope.loadSession = function () {
    Restangular.one('user/session').get().then((data) => {
      $scope.sessions = data.sessions;
    });
  };

  /**
   * Clear all active sessions.
   */
  $scope.deleteSession = function () {
    Restangular.one('user/session').remove().then(() => {
      $scope.loadSession();
    });
  };

  $scope.loadSession();
});
