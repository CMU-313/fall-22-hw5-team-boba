/**
 * Add space between element directive.
 */
angular.module('docs').directive('addSpaceBetween', () => function (scope, element) {
  if (!scope.$last) {
    element.after('&#32;');
  }
});
