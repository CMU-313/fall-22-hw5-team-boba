/**
 * Settings metadata page controller.
 */
angular.module('docs').controller('SettingsMetadata', ($scope, Restangular) => {
  // Load metadata
  Restangular.one('metadata').get({
    sort_column: 1,
    asc: true,
  }).then((data) => {
    $scope.metadata = data.metadata;
  });

  // Add a metadata
  $scope.addMetadata = function () {
    Restangular.one('metadata').put($scope.newmetadata).then((data) => {
      $scope.metadata.push(data);
      $scope.newmetadata = {};
    });
  };

  // Delete a metadata
  $scope.deleteMetadata = function (meta) {
    Restangular.one('metadata', meta.id).remove().then(() => {
      $scope.metadata.splice($scope.metadata.indexOf(meta), 1);
    });
  };

  // Update a metadata
  $scope.updateMetadata = function (meta) {
    Restangular.one('metadata', meta.id).post('', meta);
  };
});
