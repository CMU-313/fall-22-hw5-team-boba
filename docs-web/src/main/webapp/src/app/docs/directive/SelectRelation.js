/**
 * Relation selection directive.
 */
angular.module('docs').directive('selectRelation', () => ({
  restrict: 'E',
  templateUrl: 'partial/docs/directive.selectrelation.html',
  replace: true,
  scope: {
    id: '=',
    relations: '=',
    ref: '@',
    ngDisabled: '=',
  },
  controller($scope, $q, Restangular) {
    /**
       * Add a relation.
       */
    $scope.addRelation = function ($item) {
      // Add the new relation
      $scope.relations.push({
        id: $item.id,
        title: $item.title,
        source: true,
      });
      $scope.input = '';
    };

    /**
       * Remove a relation.
       */
    $scope.deleteRelation = function (deleteRelation) {
      $scope.relations = _.reject($scope.relations, (relation) => relation.id === deleteRelation.id);
    };

    /**
       * Returns a promise for typeahead document.
       */
    $scope.getDocumentTypeahead = function ($viewValue) {
      const deferred = $q.defer();
      Restangular.one('document/list')
        .get({
          limit: 5,
          sort_column: 1,
          asc: true,
          search: $viewValue,
        }).then((data) => {
          deferred.resolve(_.reject(data.documents, (document) => {
            const duplicate = _.find($scope.relations, (relation) => {
              if (document.id === relation.id) {
                return relation;
              }
            });

            return document.id === $scope.id || duplicate;
          }));
        });
      return deferred.promise;
    };
  },
  link(scope, element, attr, ctrl) {
  },
}));
