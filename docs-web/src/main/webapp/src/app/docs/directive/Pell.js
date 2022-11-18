/**
 * Pell directive.
 */
angular.module('docs').directive('pellEditor', ($timeout) => ({
  restrict: 'E',
  template: '<div class="pell"></div>',
  require: 'ngModel',
  replace: true,
  link(scope, element, attrs, ngModelCtrl) {
    const editor = pell.init({
      element: element[0],
      defaultParagraphSeparator: 'p',
      onChange(html) {
        $timeout(() => {
          ngModelCtrl.$setViewValue(html);
        });
      },
    });

    ngModelCtrl.$render = function () {
      editor.content.innerHTML = ngModelCtrl.$viewValue || '';
    };
  },
}));
