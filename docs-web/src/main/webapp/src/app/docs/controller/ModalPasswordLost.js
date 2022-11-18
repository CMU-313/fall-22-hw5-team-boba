/**
 * Modal password lost controller.
 */
angular.module('docs').controller('ModalPasswordLost', ($scope, $uibModalInstance) => {
  $scope.username = '';
  $scope.close = function (username) {
    $uibModalInstance.close(username);
  };
});
