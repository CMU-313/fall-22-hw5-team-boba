/**
 * Main controller.
 */
angular.module('docs').controller('Main', ($scope, $rootScope, $state, User) => {
  User.userInfo().then((data) => {
    if (data.anonymous) {
      $state.go('login', {}, {
        location: 'replace',
      });
    } else {
      $state.go('document.default', {}, {
        location: 'replace',
      });
    }
  });
});
