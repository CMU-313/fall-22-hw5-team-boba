/**
 * Settings security controller.
 */
angular.module('docs').controller('SettingsSecurity', ($scope, User, $dialog, $uibModal, Restangular, $translate) => {
  User.userInfo().then((data) => {
    $scope.user = data;
  });

  /**
   * Enable TOTP.
   */
  $scope.enableTotp = function () {
    const title = $translate.instant('settings.security.enable_totp');
    const msg = $translate.instant('settings.security.enable_totp_message');
    const btns = [
      { result: 'cancel', label: $translate.instant('cancel') },
      { result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' },
    ];

    $dialog.messageBox(title, msg, btns, (result) => {
      if (result === 'ok') {
        Restangular.one('user/enable_totp').post().then((data) => {
          $scope.secret = data.secret;
          User.userInfo(true).then((data) => {
            $scope.user = data;
          });
        });
      }
    });
  };

  /**
   * Disable TOTP.
   */
  $scope.disableTotp = function () {
    $uibModal.open({
      templateUrl: 'partial/docs/settings.security.disabletotp.html',
      controller: 'SettingsSecurityModalDisableTotp',
    }).result.then((password) => {
      if (password === null) {
        return;
      }

      // Disable TOTP
      Restangular.one('user/disable_totp').post('', {
        password,
      }).then(() => {
        User.userInfo(true).then((data) => {
          $scope.user = data;
        });
      });
    });
  };

  /**
   * Test TOTP.
   */
  $scope.testValidationCodeSuccess = null;
  $scope.testTotp = function (code) {
    Restangular.one('user/test_totp').post('', {
      code,
    }).then(() => {
      $scope.testValidationCodeSuccess = true;
    }, () => {
      $scope.testValidationCodeSuccess = false;
    });
  };
});
