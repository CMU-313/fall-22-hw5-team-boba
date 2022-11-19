/**
 * Settings workflow page controller.
 */
angular.module('docs').controller('SettingsWorkflow', ($scope, $state, Restangular) => {
  /**
   * Load workflows from server.
   */
  $scope.loadWorkflows = function () {
    Restangular.one('routemodel').get({
      sort_column: 1,
      asc: true,
    }).then((data) => {
      $scope.workflows = data.routemodels;
    });
  };

  $scope.loadWorkflows();

  /**
   * Edit a user.
   */
  $scope.editWorkflow = function (user) {
    $state.go('settings.workflow.edit', { id: user.id });
  };
});
