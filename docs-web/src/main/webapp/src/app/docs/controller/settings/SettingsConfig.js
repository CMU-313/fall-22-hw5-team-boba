/**
 * Settings config page controller.
 */
angular.module('docs').controller('SettingsConfig', ($scope, $rootScope, Restangular) => {
  // Get the app configuration
  Restangular.one('app').get().then((data) => {
    $rootScope.app = data;
    $scope.general = {
      default_language: data.default_language,
    };
  });

  // Enable/disable guest login
  $scope.changeGuestLogin = function (enabled) {
    Restangular.one('app').post('guest_login', {
      enabled,
    }).then(() => {
      $scope.app.guest_login = enabled;
    });
  };

  // Fetch the current theme configuration
  Restangular.one('theme').get().then((data) => {
    $scope.theme = data;
    $rootScope.appName = $scope.theme.name;
  });

  // Update the theme
  $scope.update = function () {
    $scope.theme.name = $scope.theme.name.length === 0 ? 'Teedy' : $scope.theme.name;
    Restangular.one('theme').post('', $scope.theme).then(() => {
      const stylesheet = $('#theme-stylesheet')[0];
      stylesheet.href = stylesheet.href.replace(/\?.*|$/, `?${new Date().getTime()}`);
      $rootScope.appName = $scope.theme.name;
    });
  };

  // Send an image
  $scope.sendingImage = false;
  $scope.sendImage = function (type, image) {
    // Build the payload
    const formData = new FormData();
    formData.append('image', image);

    // Send the file
    const done = function () {
      $scope.$apply(() => {
        $scope.sendingImage = false;
        $scope[type] = null;
      });
    };
    $scope.sendingImage = true;
    $.ajax({
      type: 'PUT',
      url: `../api/theme/image/${type}`,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      success() {
        done();
      },
      error() {
        done();
      },
    });
  };

  // Load SMTP config
  Restangular.one('app/config_smtp').get().then((data) => {
    $scope.smtp = data;
  });

  // Edit SMTP config
  $scope.editSmtpConfig = function () {
    Restangular.one('app').post('config_smtp', $scope.smtp);
  };

  // Edit general config
  $scope.editGeneralConfig = function () {
    Restangular.one('app').post('config', $scope.general);
  };

  // Get the webhooks
  $scope.loadWebhooks = function () {
    Restangular.one('webhook').get().then((data) => {
      $scope.webhooks = data.webhooks;
    });
  };

  $scope.loadWebhooks();

  // Add a webhook
  $scope.webhook = {
    event: 'DOCUMENT_CREATED',
  };
  $scope.addWebhook = function () {
    Restangular.one('webhook').put($scope.webhook).then(() => {
      $scope.loadWebhooks();
    });
  };

  // Delete a webhook
  $scope.deleteWebhook = function (webhook) {
    Restangular.one('webhook', webhook.id).remove().then(() => {
      $scope.loadWebhooks();
    });
  };
});
