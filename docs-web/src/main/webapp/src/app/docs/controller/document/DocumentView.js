/**
 * Document view controller.
 */
angular.module('docs').controller('DocumentView', ($scope, $rootScope, $state, $stateParams, $location, $dialog, $uibModal, Restangular, $translate) => {
  // Load document data from server
  Restangular.one('document', $stateParams.id).get().then((data) => {
    $scope.document = data;
  }, (response) => {
    $scope.error = response;
  });

  // Load comments from server
  Restangular.one('comment', $stateParams.id).get().then((data) => {
    $scope.comments = data.comments;
  }, (response) => {
    $scope.commentsError = response;
  });

  /**
   * Add a comment.
   */
  $scope.comment = '';
  $scope.addComment = function () {
    if ($scope.comment.length === 0) {
      return;
    }

    Restangular.one('comment').put({
      id: $stateParams.id,
      content: $scope.comment,
    }).then((data) => {
      $scope.comment = '';
      $scope.comments.push(data);
    });
  };

  /**
   * Delete a comment.
   */
  $scope.deleteComment = function (comment) {
    const title = $translate.instant('document.view.delete_comment_title');
    const msg = $translate.instant('document.view.delete_comment_message');
    const btns = [
      { result: 'cancel', label: $translate.instant('cancel') },
      { result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' },
    ];

    $dialog.messageBox(title, msg, btns, (result) => {
      if (result === 'ok') {
        Restangular.one('comment', comment.id).remove().then(() => {
          $scope.comments.splice($scope.comments.indexOf(comment), 1);
        });
      }
    });
  };

  /**
   * Delete a document.
   */
  $scope.deleteDocument = function (document) {
    const title = $translate.instant('document.view.delete_document_title');
    const msg = $translate.instant('document.view.delete_document_message');
    const btns = [
      { result: 'cancel', label: $translate.instant('cancel') },
      { result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' },
    ];

    $dialog.messageBox(title, msg, btns, (result) => {
      if (result === 'ok') {
        Restangular.one('document', document.id).remove().then(() => {
          $scope.loadDocuments();
          $state.go('document.default');
        });
      }
    });
  };

  /**
   * Open the share dialog.
   */
  $scope.share = function () {
    $uibModal.open({
      templateUrl: 'partial/docs/document.share.html',
      controller: 'DocumentModalShare',
    }).result.then((name) => {
      if (name === null) {
        return;
      }

      // Share the document
      Restangular.one('share').put({
        name,
        id: $stateParams.id,
      }).then((acl) => {
        // Display the new share ACL and add it to the local ACLs
        $scope.showShare(acl);
        $scope.document.acls.push(acl);
        $scope.document.acls = angular.copy($scope.document.acls);
      });
    });
  };

  /**
   * Display a share.
   */
  $scope.showShare = function (share) {
    // Show the link
    const link = `${$location.absUrl().replace($location.path(), '').replace('#', '')}share.html#/share/${$stateParams.id}/${share.id}`;
    const title = $translate.instant('document.view.shared_document_title');
    const msg = $translate.instant('document.view.shared_document_message', { link });
    const btns = [
      { result: 'close', label: $translate.instant('close') },
    ];

    if ($rootScope.userInfo.username !== 'guest') {
      btns.unshift({ result: 'unshare', label: $translate.instant('unshare'), cssClass: 'btn-danger' });
    }

    $dialog.messageBox(title, msg, btns, (result) => {
      if (result === 'unshare') {
        // Unshare this document and update the local shares
        Restangular.one('share', share.id).remove().then(() => {
          $scope.document.acls = _.reject($scope.document.acls, (s) => share.id === s.id);
        });
      }
    });
  };

  /**
   * Export the current document to PDF.
   */
  $scope.exportPdf = function () {
    $uibModal.open({
      templateUrl: 'partial/docs/document.pdf.html',
      controller: 'DocumentModalPdf',
    });

    return false;
  };

  /**
   * Validate the workflow.
   */
  $scope.validateWorkflow = function (transition) {
    Restangular.one('route').post('validate', {
      documentId: $stateParams.id,
      transition,
      comment: $scope.workflowComment,
    }).then((data) => {
      $scope.workflowComment = '';
      const title = $translate.instant('document.view.workflow_validated_title');
      const msg = $translate.instant('document.view.workflow_validated_message');
      const btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
      $dialog.messageBox(title, msg, btns);

      if (data.readable) {
        $scope.document.route_step = data.route_step;
      } else {
        $state.go('document.default');
      }
    });
  };
});
