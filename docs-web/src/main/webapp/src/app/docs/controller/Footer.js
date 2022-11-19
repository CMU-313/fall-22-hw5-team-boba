/**
 * Footer controller.
 */
angular.module('docs').controller('Footer', ($scope, $rootScope, Restangular, $translate, timeAgoSettings, tmhDynamicLocale, $locale) => {
  // Load app data
  Restangular.one('app').get().then((data) => {
    $rootScope.app = data;
  });

  // Save the current language to local storage
  $rootScope.$on('$translateChangeSuccess', () => {
    $scope.currentLang = $translate.use();
    timeAgoSettings.overrideLang = $scope.currentLang;
    localStorage.overrideLang = $scope.currentLang;
    tmhDynamicLocale.set($scope.currentLang).then(() => {
      $rootScope.dateFormat = $locale.DATETIME_FORMATS.shortDate;
      $rootScope.dateTimeFormat = $locale.DATETIME_FORMATS.short;
    });
  });

  // Change the current language
  $scope.changeLanguage = function (lang) {
    $translate.use(lang);
  };
});
