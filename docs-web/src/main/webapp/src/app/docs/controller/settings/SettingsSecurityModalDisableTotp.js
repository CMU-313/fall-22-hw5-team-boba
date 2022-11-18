/**
 * Settings modal disable TOTP controller.
 */
angular.module('docs').controller('SettingsSecurityModalDisableTotp', ($scope, $uibModalInstance) => {
  $scope.password = '';
  $scope.close = function (password) {
    $uibModalInstance.close(password);
  };
});
