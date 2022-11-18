/**
 * Settings monitoring controller.
 */
angular.module('docs').controller('SettingsMonitoring', ($scope, Restangular) => {
  Restangular.one('app').get().then((data) => {
    $scope.app = data;
  });

  Restangular.one('app/log').get({
    limit: 100,
  }).then((data) => {
    $scope.logs = data.logs;
  });

  $scope.reindexingStarted = false;
  $scope.startReindexing = function () {
    Restangular.one('app').post('batch/reindex').then(() => {
      $scope.reindexingStarted = true;
    });
  };
});
