/**
 * Document modal share controller.
 */
angular.module('docs').controller('DocumentModalShare', ($scope, $uibModalInstance) => {
  $scope.name = '';
  $scope.close = function (name) {
    $uibModalInstance.close(name);
  };
});
