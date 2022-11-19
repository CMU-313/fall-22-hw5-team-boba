/**
 * File view controller.
 */
angular.module('docs').controller('FileView', ($uibModal, $state, $stateParams, $timeout) => {
  const modal = $uibModal.open({
    windowClass: 'modal modal-fileview',
    templateUrl: 'partial/docs/file.view.html',
    controller: 'FileModalView',
    size: 'lg',
  });

  // Returns to document view on file close
  modal.closed = false;
  modal.result.then(() => {
    modal.closed = true;
  }, () => {
    modal.closed = true;
    $timeout(() => {
      // After all router transitions are passed,
      // if we are still on the file route, go back to the document
      if ($state.current.name === 'document.view.content.file' || $state.current.name === 'document.default.file') {
        $state.go('^', { id: $stateParams.id });
      }
    });
  });
});
