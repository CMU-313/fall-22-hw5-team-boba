/**
 * ACL edit directive.
 */
angular.module('docs').directive('aclEdit', () => ({
  restrict: 'E',
  templateUrl: 'partial/docs/directive.acledit.html',
  replace: true,
  scope: {
    source: '=',
    acls: '=',
    writable: '=',
    creator: '=',
  },
  controller($scope, Restangular, $q) {
    // Watch for ACLs change and group them for easy displaying
    $scope.$watch('acls', (acls) => {
      $scope.groupedAcls = _.groupBy(acls, (acl) => acl.id);
    });

    // Initialize add ACL
    $scope.acl = { perm: 'READ' };

    /**
       * Delete an ACL.
       */
    $scope.deleteAcl = function (acl) {
      Restangular.one(`acl/${$scope.source}/${acl.perm}/${acl.id}`, null).remove().then(() => {
        $scope.acls = _.reject($scope.acls, (s) => angular.equals(acl, s));
      });
    };

    /**
       * Add an ACL.
       */
    $scope.addAcl = function () {
      // Compute ACLs to add
      $scope.acl.source = $scope.source;
      let acls = [];
      if ($scope.acl.perm === 'READWRITE') {
        acls = [{
          source: $scope.source,
          target: $scope.acl.target.name,
          perm: 'READ',
          type: $scope.acl.target.type,
        }, {
          source: $scope.source,
          target: $scope.acl.target.name,
          perm: 'WRITE',
          type: $scope.acl.target.type,
        }];
      } else {
        acls = [{
          source: $scope.source,
          target: $scope.acl.target.name,
          perm: $scope.acl.perm,
          type: $scope.acl.target.type,
        }];
      }

      // Add ACLs
      _.each(acls, (acl) => {
        Restangular.one('acl').put(acl).then((acl) => {
          if (_.isUndefined(acl.id)) {
            return;
          }
          $scope.acls.push(acl);
          $scope.acls = angular.copy($scope.acls);
        });
      });

      // Reset form
      $scope.acl = { perm: 'READ' };
    };

    /**
       * Auto-complete on ACL target.
       */
    $scope.getTargetAclTypeahead = function ($viewValue) {
      const deferred = $q.defer();
      Restangular.one('acl/target/search')
        .get({
          search: $viewValue,
        }).then((data) => {
          const output = [];

          // Add the type to use later
          output.push.apply(output, _.map(data.users, (user) => {
            user.type = 'USER';
            return user;
          }));
          output.push.apply(output, _.map(data.groups, (group) => {
            group.type = 'GROUP';
            return group;
          }));

          // Send the data to the typeahead directive
          deferred.resolve(output, true);
        });
      return deferred.promise;
    };
  },
  link(scope, element, attr, ctrl) {
  },
}));
