/**
 * Navigation controller.
 */
angular.module('docs').controller('Navigation', ($scope, $state, $stateParams, $rootScope, User) => {
  User.userInfo().then((data) => {
    $rootScope.userInfo = data;
    if (data.anonymous) {
      if ($state.current.name !== 'login') {
        $state.go('login', {
          redirectState: $state.current.name,
          redirectParams: JSON.stringify($stateParams),
        }, {
          location: 'replace',
        });
      }
    }
  });

  /**
   * User logout.
   */
  $scope.logout = function ($event) {
    User.logout().then(() => {
      User.userInfo(true).then((data) => {
        $rootScope.userInfo = data;
      });
      $state.go('main');
    });
    $event.preventDefault();
  };
});
