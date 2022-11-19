/**
 * User profile controller.
 */
angular.module('docs').controller('UserProfile', ($stateParams, Restangular, $scope) => {
  // Load user
  Restangular.one('user', $stateParams.username).get().then((data) => {
    $scope.user = data;
  });
});
