/**
 * Modal import controller.
 */
angular.module('docs').controller('ModalImport', ($scope, $uibModalInstance, file, $q, $timeout) => {
  // Payload
  const formData = new FormData();
  formData.append('file', file, file.name);

  // Send the file
  const deferred = $q.defer();
  const getProgressListener = function (deferred) {
    return function (event) {
      deferred.notify(event);
    };
  };

  $.ajax({
    type: 'PUT',
    url: '../api/document/eml',
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    success(response) {
      deferred.resolve(response);
    },
    error(jqXHR) {
      deferred.reject(jqXHR);
    },
    xhr() {
      const myXhr = $.ajaxSettings.xhr();
      myXhr.upload.addEventListener('progress', getProgressListener(deferred), false);
      return myXhr;
    },
  });

  deferred.promise.then((data) => {
    $uibModalInstance.close(data);
  }, (data) => {
    $scope.errorQuota = data.responseJSON && data.responseJSON.type === 'QuotaReached';
    if (!$scope.errorQuota) {
      $scope.errorGeneral = true;
    }
    $timeout(() => {
      $uibModalInstance.close(null);
    }, 3000);
  }, (e) => {
    $scope.progress = e.loaded / e.total;
  });
});
