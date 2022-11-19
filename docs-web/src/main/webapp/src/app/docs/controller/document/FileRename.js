/**
 * File rename controller.
 */
angular.module('docs').controller('FileRename', ($scope, file, $uibModalInstance) => {
  $scope.file = file;
  $scope.close = function (file) {
    $uibModalInstance.close(file);
  };
});
