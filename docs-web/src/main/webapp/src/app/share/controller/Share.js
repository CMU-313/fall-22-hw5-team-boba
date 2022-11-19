/**
 * Share controller.
 */
angular.module('share').controller('Share', ($scope, $state, $stateParams, Restangular, $uibModal) => {
  // Load document
  Restangular.one('document', $stateParams.documentId).get({ share: $stateParams.shareId })
    .then((data) => {
      $scope.document = data;
    }, (response) => {
      if (response.status === 403) {
        $state.go('403');
      }
    });

  // Load files
  Restangular.one('file/list').get({ id: $stateParams.documentId, share: $stateParams.shareId })
    .then((data) => {
      $scope.files = data.files;
    });

  // Load comments from server
  Restangular.one('comment', $stateParams.documentId).get({ share: $stateParams.shareId }).then((data) => {
    $scope.comments = data.comments;
  }, (response) => {
    $scope.commentsError = response;
  });

  /**
   * Navigate to the selected file.
   */
  $scope.openFile = function (file) {
    $state.go('share.file', { documentId: $stateParams.documentId, shareId: $stateParams.shareId, fileId: file.id });
  };

  /**
   * Export the current document to PDF.
   */
  $scope.exportPdf = function () {
    $uibModal.open({
      templateUrl: 'partial/share/share.pdf.html',
      controller: 'ShareModalPdf',
    });

    return false;
  };
});
