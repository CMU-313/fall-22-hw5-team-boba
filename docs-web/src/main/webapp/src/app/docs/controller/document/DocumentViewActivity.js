/**
 * Document view activity controller.
 */
angular.module('docs').controller('DocumentViewActivity', ($scope, $stateParams, Restangular) => {
  // Load audit log data from server
  Restangular.one('auditlog').get({
    document: $stateParams.id,
  }).then((data) => {
    $scope.logs = data.logs;
  });
});
