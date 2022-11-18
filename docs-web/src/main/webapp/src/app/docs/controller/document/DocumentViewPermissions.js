/**
 * Document view permissions controller.
 */
angular.module('docs').controller('DocumentViewPermissions', ($scope) => {
  // Watch for ACLs change and group them for easy displaying
  $scope.$watch('document.inherited_acls', (acls) => {
    $scope.inheritedAcls = _.groupBy(acls, (acl) => acl.source_id + acl.id);
  });
});
