/**
 * Tag selection directive.
 */
angular.module('docs').directive('selectTag', () => ({
  restrict: 'E',
  templateUrl: 'partial/docs/directive.selecttag.html',
  replace: true,
  scope: {
    tags: '=',
    ref: '@',
    ngDisabled: '=',
  },
  controller($scope, Restangular) {
    // Retrieve tags
    Restangular.one('tag/list').get().then((data) => {
      $scope.allTags = data.tags;
    });

    /**
       * Add a tag.
       */
    $scope.addTag = function ($event) {
      // Does the new tag exists
      const tag = _.find($scope.allTags, (tag) => {
        if (tag.name === $scope.input) {
          return tag;
        }
      });

      // Does the new tag is already in the model
      const duplicate = _.find($scope.tags, (tag2) => {
        if (tag && tag2.id === tag.id) {
          return tag2;
        }
      });

      // Add the new tag
      if (tag) {
        if (!duplicate) {
          if (!$scope.tags) $scope.tags = [];
          $scope.tags.push(tag);
        }
        $scope.input = '';
      }

      if ($event) {
        $event.preventDefault();
      }
    };

    /**
       * Remove a tag.
       */
    $scope.deleteTag = function (deleteTag) {
      $scope.tags = _.reject($scope.tags, (tag) => tag.id === deleteTag.id);
    };
  },
  link(scope, element, attr, ctrl) {
  },
}));
