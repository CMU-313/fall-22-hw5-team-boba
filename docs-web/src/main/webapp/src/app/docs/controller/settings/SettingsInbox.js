/**
 * Settings inbox page controller.
 */
angular.module('docs').controller('SettingsInbox', ($scope, $rootScope, Restangular, $translate, $timeout) => {
  // Get the inbox configuration
  Restangular.one('app/config_inbox').get().then((data) => {
    $scope.inbox = data;
  });

  // Get the tags
  Restangular.one('tag/list').get().then((data) => {
    $scope.tags = data.tags;
  });

  // Save the inbox configuration
  $scope.saveResult = undefined;
  $scope.editInboxConfig = function () {
    return Restangular.one('app').post('config_inbox', $scope.inbox).then(() => {
      $scope.saveResult = $translate.instant('settings.inbox.saved');
      $timeout(() => {
        $scope.saveResult = undefined;
      }, 5000);
    });
  };

  $scope.testInboxConfig = function () {
    $scope.testLoading = true;
    $scope.testResult = undefined;
    $scope.editInboxConfig().then(() => {
      Restangular.one('app').post('test_inbox').then((data) => {
        $scope.testResult = data;
        $scope.testLoading = false;
        $timeout(() => {
          $scope.testResult = undefined;
        }, 5000);
      });
    });
  };
});
