/**
 * Settings controller.
 */
angular.module('docs').controller('Settings', ($scope, User) => {
  // Flag if the user is admin
  User.userInfo().then((data) => {
    $scope.isAdmin = data.base_functions.indexOf('ADMIN') !== -1;
  });
});
