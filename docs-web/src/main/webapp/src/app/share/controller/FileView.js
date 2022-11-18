/**
 * File view controller.
 */
angular.module('share').controller('FileView', ($uibModal, $state, $stateParams, $timeout) => {
  const modal = $uibModal.open({
    windowClass: 'modal modal-fileview',
    templateUrl: 'partial/share/file.view.html',
    controller: 'FileModalView',
    size: 'lg',
  });

  // Returns to share view on file close
  modal.closed = false;
  modal.result.then(() => {
    modal.closed = true;
  }, () => {
    modal.closed = true;
    $timeout(() => {
      // After all router transitions are passed,
      // if we are still on the file route, go back to the share
      if ($state.current.name === 'share.file') {
        $state.go('share', { documentId: $stateParams.documentId, shareId: $stateParams.shareId });
      }
    });
  });
});
