/**
 * User service.
 */
angular.module('docs').factory('User', (Restangular) => {
  let userInfo = null;

  return {
    /**
     * Returns user info.
     * @param force If true, force reloading data
     */
    userInfo(force) {
      if (userInfo === null || force) {
        userInfo = Restangular.one('user').get();
      }
      return userInfo;
    },

    /**
     * Login an user.
     */
    login(user) {
      return Restangular.one('user').post('login', user);
    },

    /**
     * Logout the current user.
     */
    logout() {
      return Restangular.one('user').post('logout', {});
    },
  };
});
