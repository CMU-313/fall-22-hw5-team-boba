/**
 * Modal feedback controller.
 */
angular.module('docs').controller('ModalFeedback', ($scope, $uibModalInstance) => {
  $scope.content = '';
  $scope.close = function (content) {
    $uibModalInstance.close(content);
  };
});
