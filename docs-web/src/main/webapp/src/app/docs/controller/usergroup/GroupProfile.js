/**
 * Group profile controller.
 */
angular.module('docs').controller('GroupProfile', ($stateParams, Restangular, $scope) => {
  // Load user
  Restangular.one('group', $stateParams.name).get().then((data) => {
    $scope.group = data;
  });
});
