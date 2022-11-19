/**
 * Login controller.
 */
angular.module('docs').controller('Login', (Restangular, $scope, $rootScope, $state, $stateParams, $dialog, User, $translate, $uibModal) => {
  $scope.codeRequired = false;

  // Get the app configuration
  Restangular.one('app').get().then((data) => {
    $rootScope.app = data;
  });

  // Login as guest
  $scope.loginAsGuest = function () {
    $scope.user = {
      username: 'guest',
      password: '',
    };
    $scope.login();
  };

  // Login
  $scope.login = function () {
    User.login($scope.user).then(() => {
      User.userInfo(true).then((data) => {
        $rootScope.userInfo = data;
      });

      if ($stateParams.redirectState !== undefined && $stateParams.redirectParams !== undefined) {
        $state.go($stateParams.redirectState, JSON.parse($stateParams.redirectParams))
          .catch(() => {
            $state.go('document.default');
          });
      } else {
        $state.go('document.default');
      }
    }, (data) => {
      if (data.data.type === 'ValidationCodeRequired') {
        // A TOTP validation code is required to login
        $scope.codeRequired = true;
      } else {
        // Login truly failed
        const title = $translate.instant('login.login_failed_title');
        const msg = $translate.instant('login.login_failed_message');
        const btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
        $dialog.messageBox(title, msg, btns);
      }
    });
  };

  // Password lost
  $scope.openPasswordLost = function () {
    $uibModal.open({
      templateUrl: 'partial/docs/passwordlost.html',
      controller: 'ModalPasswordLost',
    }).result.then((username) => {
      if (username === null) {
        return;
      }

      // Send a password lost email
      Restangular.one('user').post('password_lost', {
        username,
      }).then(() => {
        const title = $translate.instant('login.password_lost_sent_title');
        const msg = $translate.instant('login.password_lost_sent_message', { username });
        const btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
        $dialog.messageBox(title, msg, btns);
      }, () => {
        const title = $translate.instant('login.password_lost_error_title');
        const msg = $translate.instant('login.password_lost_error_message');
        const btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
        $dialog.messageBox(title, msg, btns);
      });
    });
  };
});
