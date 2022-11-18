/**
 * Document view workflow controller.
 */
angular.module('docs').controller('DocumentViewWorkflow', ($scope, $stateParams, Restangular, $translate, $dialog) => {
  /**
   * Load routes.
   */
  $scope.loadRoutes = function () {
    Restangular.one('route').get({
      documentId: $stateParams.id,
    }).then((data) => {
      $scope.routes = data.routes;
    });
  };

  /**
   * Start the selected workflow
   */
  $scope.startWorkflow = function () {
    Restangular.one('route').post('start', {
      routeModelId: $scope.routemodel,
      documentId: $stateParams.id,
    }).then((data) => {
      $scope.document.route_step = data.route_step;
      $scope.loadRoutes();
    });
  };

  /**
   * Cancel the current workflow.
   */
  $scope.cancelWorkflow = function () {
    const title = $translate.instant('document.view.workflow.cancel_workflow_title');
    const msg = $translate.instant('document.view.workflow.cancel_workflow_message');
    const btns = [
      { result: 'cancel', label: $translate.instant('cancel') },
      { result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' },
    ];

    $dialog.messageBox(title, msg, btns, (result) => {
      if (result === 'ok') {
        Restangular.one('route').remove({
          documentId: $stateParams.id,
        }).then(() => {
          delete $scope.document.route_step;
          $scope.loadRoutes();
        });
      }
    });
  };

  // Load route models
  Restangular.one('routemodel').get().then((data) => {
    $scope.routemodels = data.routemodels;
  });

  // Load routes
  $scope.loadRoutes();
});
