/**
 * Tag controller.
 */
angular.module('docs').controller('Tag', ($scope, Restangular) => {
  $scope.tag = { name: '', color: '#3a87ad' };

  // Retrieve tags
  $scope.tags = [];
  $scope.loadTags = function () {
    Restangular.one('tag/list').get().then((data) => {
      $scope.tags = data.tags;
    });
  };
  $scope.loadTags();

  /**
   * Add a tag.
   */
  $scope.addTag = function () {
    Restangular.one('tag').put($scope.tag).then((data) => {
      $scope.tags.push({ id: data.id, name: $scope.tag.name, color: $scope.tag.color });
      $scope.tag = { name: '', color: '#3a87ad' };
    });
  };

  /**
   * Find children tags.
   */
  $scope.getChildrenTags = function (parent) {
    return _.filter($scope.tags, (tag) => tag.parent === parent || !tag.parent && !parent);
  };
});
