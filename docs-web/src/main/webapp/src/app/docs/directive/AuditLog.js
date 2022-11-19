/**
 * Audit log directive.
 */
angular.module('docs').directive('auditLog', () => ({
  restrict: 'E',
  templateUrl: 'partial/docs/directive.auditlog.html',
  replace: true,
  scope: {
    logs: '=',
  },
}));
