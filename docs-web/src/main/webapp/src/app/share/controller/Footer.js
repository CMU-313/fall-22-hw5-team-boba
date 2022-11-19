/**
 * Footer controller.
 */
angular.module('share').controller('Footer', ($scope, $rootScope, Restangular, $translate, tmhDynamicLocale, $locale) => {
  // Load app data
  Restangular.one('app').get().then((data) => {
    $scope.app = data;
  });

  // Save the current language to local storage
  $rootScope.$on('$translateChangeSuccess', () => {
    $scope.currentLang = $translate.use();
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
